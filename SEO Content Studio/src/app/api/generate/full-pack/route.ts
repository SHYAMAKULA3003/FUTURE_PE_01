import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export const dynamic = 'force-dynamic';

interface OutlineBlog {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  outline: {
    introduction: string;
    sections: { heading: string; subsections: { heading: string; points: string[] }[] }[];
    conclusion: string;
    cta: string;
  };
  wordCountTarget: number;
  internalLinks: string[];
}

interface OutlineData {
  pillarBlog: OutlineBlog;
  supportingBlogs: OutlineBlog[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, clusterName, pillarTopic, pillarKeyword, supportingTopics } = body;

    if (!projectId || !pillarTopic) {
      return NextResponse.json({ error: 'Project ID and pillar topic are required' }, { status: 400 });
    }

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Set project to generating
    await db.project.update({ where: { id: projectId }, data: { status: 'generating', generationMsg: 'Starting content generation...' } });

    // Create cluster immediately so the frontend has something to show
    const cluster = await db.contentCluster.create({
      data: {
        projectId,
        name: clusterName || pillarTopic,
        pillarTopic,
        keywords: JSON.stringify([pillarKeyword, ...(supportingTopics?.map((t: { keyword: string }) => t.keyword) || [])]),
        status: 'generating',
      },
    });

    // Schedule background generation — returns immediately, no Caddy timeout
    (async () => {
      try {
        const zai = await ZAI.create();
        const ctx = {
          businessType: project.businessType,
          businessName: project.name,
          city: project.city,
          state: project.state,
          targetAudience: project.targetAudience,
          description: project.description,
        };

        // Step 1: Generate cluster outline
        await db.project.update({ where: { id: projectId }, data: { generationMsg: 'Generating content cluster outline...' } });
        const outlineData = await generateClusterOutline(zai, {
          ...ctx,
          pillarTopic,
          pillarKeyword,
          supportingTopics,
        });

        // Step 2: Create pillar blog entry
        await db.project.update({ where: { id: projectId }, data: { generationMsg: 'Creating blog entries...' } });
        const pillarOutline = outlineData.pillarBlog;
        const pillarBlog = await db.blogPost.create({
          data: {
            clusterId: cluster.id,
            title: pillarOutline.title,
            slug: pillarOutline.slug,
            type: 'pillar',
            targetKeyword: pillarOutline.targetKeyword,
            secondaryKeywords: JSON.stringify(pillarOutline.secondaryKeywords || []),
            searchIntent: pillarOutline.searchIntent,
            metaTitle: pillarOutline.metaTitle,
            metaDescription: pillarOutline.metaDescription,
            headingStructure: JSON.stringify(pillarOutline.outline),
            internalLinks: JSON.stringify(pillarOutline.internalLinks || []),
            status: 'generating',
          },
        });

        // Step 3: Create supporting blog entries
        const supportingBlogs = await Promise.all(
          (outlineData.supportingBlogs || []).map((blog: OutlineBlog) =>
            db.blogPost.create({
              data: {
                clusterId: cluster.id,
                title: blog.title,
                slug: blog.slug,
                type: 'supporting',
                targetKeyword: blog.targetKeyword,
                secondaryKeywords: JSON.stringify(blog.secondaryKeywords || []),
                searchIntent: blog.searchIntent,
                metaTitle: blog.metaTitle,
                metaDescription: blog.metaDescription,
                headingStructure: JSON.stringify(blog.outline),
                internalLinks: JSON.stringify(blog.internalLinks || []),
                status: 'outline',
              },
            })
          )
        );

        // Step 4: Generate pillar blog content
        await db.project.update({ where: { id: projectId }, data: { generationMsg: 'Writing pillar blog article...' } });
        const pillarContent = await generateBlogContent(zai, {
          ...ctx,
          title: pillarOutline.title,
          targetKeyword: pillarOutline.targetKeyword,
          secondaryKeywords: pillarOutline.secondaryKeywords,
          searchIntent: pillarOutline.searchIntent,
          outline: pillarOutline.outline,
          wordCountTarget: 1500,
          isPillar: true,
        });

        await db.blogPost.update({
          where: { id: pillarBlog.id },
          data: {
            content: pillarContent.content,
            wordCount: pillarContent.wordCount,
            seoScore: pillarContent.seoScore,
            status: 'ready',
          },
        });

        // Step 5: Generate supporting blog contents one by one
        for (let i = 0; i < (outlineData.supportingBlogs || []).length; i++) {
          const blog = outlineData.supportingBlogs[i];
          const dbBlog = supportingBlogs[i];

          await db.project.update({ where: { id: projectId }, data: { generationMsg: `Writing supporting blog ${i + 1} of ${(outlineData.supportingBlogs || []).length}: ${blog.title}` } });
          await db.blogPost.update({
            where: { id: dbBlog.id },
            data: { status: 'generating' },
          });

          const supportingContent = await generateBlogContent(zai, {
            ...ctx,
            title: blog.title,
            targetKeyword: blog.targetKeyword,
            secondaryKeywords: blog.secondaryKeywords,
            searchIntent: blog.searchIntent,
            outline: blog.outline,
            wordCountTarget: 1000,
            isPillar: false,
          });

          await db.blogPost.update({
            where: { id: dbBlog.id },
            data: {
              content: supportingContent.content,
              wordCount: supportingContent.wordCount,
              seoScore: supportingContent.seoScore,
              status: 'ready',
            },
          });
        }

        // Step 6: Mark everything as ready
        await db.project.update({ where: { id: projectId }, data: { generationMsg: 'Finalizing content pack...' } });
        await db.contentCluster.update({
          where: { id: cluster.id },
          data: { status: 'ready' },
        });
        await db.project.update({
          where: { id: projectId },
          data: { status: 'ready' },
        });
      } catch (error) {
        console.error('Background generation error:', error);
        try {
          await db.project.update({
            where: { id: projectId },
            data: { status: 'draft', generationMsg: `Generation error: ${error instanceof Error ? error.message : 'Unknown error'}` },
          });
          await db.contentCluster.update({
            where: { id: cluster.id },
            data: { status: 'outline' },
          });
        } catch {}
      }
    })();

    // Return immediately — no waiting for AI generation
    return NextResponse.json({
      projectId,
      clusterId: cluster.id,
      status: 'generating',
    });
  } catch (error) {
    console.error('Full pack start error:', error);
    return NextResponse.json(
      { error: `Failed to start content generation: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// ── Cluster outline generation ──────────────────────────────────────

async function generateClusterOutline(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  opts: {
    businessType: string;
    businessName: string;
    city: string;
    state: string;
    pillarTopic: string;
    pillarKeyword: string;
    supportingTopics: { topic: string; keyword: string }[];
    targetAudience: string;
    description: string;
  }
): Promise<OutlineData> {
  const supportingStr = (opts.supportingTopics || [])
    .map((t, i) => `${i + 1}. "${t.topic}" (${t.keyword})`)
    .join(', ');

  const prompt = `SEO content outline for ${opts.businessType} "${opts.businessName}" in ${opts.city}${opts.state ? ', ' + opts.state : ''}.

Pillar: "${opts.pillarTopic}" (keyword: "${opts.pillarKeyword}")
Supporting: ${supportingStr}

Return ONLY valid JSON:
{"pillarBlog":{"title":"H1","slug":"url-slug","metaTitle":"under 60 chars","metaDescription":"150-160 chars","targetKeyword":"kw","secondaryKeywords":["kw1","kw2"],"searchIntent":"intent","outline":{"introduction":"what intro covers","sections":[{"heading":"H2","subsections":[{"heading":"H3","points":["pt1"]}]}],"conclusion":"what conclusion covers","cta":"CTA"},"wordCountTarget":2000,"internalLinks":["slug1"]},"supportingBlogs":[{"title":"H1","slug":"slug","metaTitle":"title","metaDescription":"desc","targetKeyword":"kw","secondaryKeywords":["kw"],"searchIntent":"intent","outline":{"introduction":"desc","sections":[{"heading":"H2","subsections":[{"heading":"H3","points":["pt1"]}]}],"conclusion":"desc","cta":"CTA"},"wordCountTarget":1200,"internalLinks":["pillar-slug"]}]}

Rules: 2-3 sections per blog. Include "${opts.city}" in pillar. Slugs lowercase with hyphens. No markdown.`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: 'You are an expert SEO content strategist. You return only valid JSON responses.' },
      { role: 'user', content: prompt },
    ],
    thinking: { type: 'disabled' },
  });

  let responseText = completion.choices[0]?.message?.content || '';
  responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(responseText) as OutlineData;
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as OutlineData;
    }
    throw new Error('Failed to parse cluster outline from AI response');
  }
}

// ── Blog content generation ────────────────────────────────────────

async function generateBlogContent(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  opts: {
    businessType: string;
    businessName: string;
    city: string;
    state: string;
    targetAudience: string;
    description: string;
    title: string;
    targetKeyword: string;
    secondaryKeywords: string[];
    searchIntent: string;
    outline: object;
    wordCountTarget: number;
    isPillar: boolean;
  }
) {
  const prompt = `You are an expert SEO content writer. Write a complete, publish-ready blog article.

BUSINESS: ${opts.businessName} - ${opts.businessType} in ${opts.city}${opts.state ? ', ' + opts.state : ''}
${opts.description ? `Description: ${opts.description}` : ''}
${opts.targetAudience ? `Target Audience: ${opts.targetAudience}` : ''}

SEO:
- Title: "${opts.title}"
- Target Keyword: "${opts.targetKeyword}"
${opts.secondaryKeywords?.length ? `- Secondary Keywords: ${opts.secondaryKeywords.join(', ')}` : ''}
- Intent: ${opts.searchIntent}
- Word Count: ~${opts.wordCountTarget}
${opts.isPillar ? '- PILLAR blog: comprehensive and authoritative' : '- SUPPORTING blog: focused and specific'}

OUTLINE:
${JSON.stringify(opts.outline, null, 2)}

RULES:
1. Write in Markdown (H1, H2, H3, bullets, lists)
2. H1: # ${opts.title}
3. Natural writing - NO keyword stuffing
4. Include "${opts.city}" 2-3 times naturally
5. Include "${opts.targetKeyword}" in first 100 words
6. Short paragraphs (2-3 sentences)
7. Use bullets/numbered lists
8. Compelling intro + helpful sections + clear CTA
9. Professional, approachable tone
10. Return ONLY Markdown, no code blocks or explanations`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: 'You are an expert SEO content writer. Return clean Markdown only.' },
      { role: 'user', content: prompt },
    ],
    thinking: { type: 'disabled' },
  });

  let content = completion.choices[0]?.message?.content || '';
  content = content.replace(/^```markdown?\n?/i, '').replace(/\n?```$/i, '').trim();
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  let seoScore = 0;
  const lower = content.toLowerCase();
  const first100 = lower.slice(0, 500);
  if (first100.includes(opts.targetKeyword.toLowerCase())) seoScore += 10;
  const kwRegex = new RegExp(opts.targetKeyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const kwCount = (lower.match(kwRegex) || []).length;
  const density = kwCount / wordCount;
  if (density >= 0.005 && density <= 0.025) seoScore += 15;
  else if (density > 0) seoScore += 8;
  if (lower.includes(opts.city.toLowerCase())) seoScore += 10;
  if (content.includes('## ')) seoScore += 10;
  if (content.includes('### ')) seoScore += 5;
  if (content.includes('- ') || content.includes('* ')) seoScore += 10;
  const secKwHits = (opts.secondaryKeywords || []).filter(kw => lower.includes(kw.toLowerCase())).length;
  seoScore += Math.round((secKwHits / Math.max((opts.secondaryKeywords || []).length, 1)) * 10);
  const wordRatio = Math.min(wordCount / opts.wordCountTarget, 1.2);
  seoScore += Math.round(wordRatio * 20);
  if (lower.includes('conclusion') || lower.includes('contact')) seoScore += 10;
  seoScore = Math.min(seoScore, 100);

  return { content, wordCount, seoScore };
}
