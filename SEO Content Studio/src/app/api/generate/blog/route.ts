import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const {
      businessType,
      businessName,
      city,
      state,
      targetAudience,
      description,
      title,
      targetKeyword,
      secondaryKeywords,
      searchIntent,
      metaTitle,
      metaDescription,
      outline,
      wordCountTarget,
      isPillar,
    } = await request.json();

    if (!title || !outline) {
      return NextResponse.json({ error: 'Title and outline are required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const prompt = `You are an expert SEO content writer who writes for real business websites. Write a complete, publish-ready blog article.

BUSINESS CONTEXT:
- Business Type: ${businessType}
- Business Name: ${businessName}
- Location: ${city}${state ? ', ' + state : ''}
${description ? `- Description: ${description}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}

SEO REQUIREMENTS:
- Title: "${title}"
- Target Keyword: "${targetKeyword}"
${secondaryKeywords?.length ? `- Secondary Keywords: ${secondaryKeywords.join(', ')}` : ''}
- Search Intent: ${searchIntent}
- Meta Title: "${metaTitle}"
- Meta Description: "${metaDescription}"
- Word Count Target: ~${wordCountTarget || 2000} words
${isPillar ? '- This is a PILLAR blog - make it comprehensive and authoritative' : '- This is a SUPPORTING blog - focused and specific'}

CONTENT OUTLINE:
${JSON.stringify(outline, null, 2)}

WRITING RULES:
1. Write in Markdown format with proper heading hierarchy (H1, H2, H3)
2. The H1 should be: # ${title}
3. Write naturally - do NOT keyword stuff
4. Include "${city}" naturally 2-3 times (local SEO)
5. Include "${targetKeyword}" in first 100 words and a few times naturally throughout
6. Use short paragraphs (2-3 sentences max)
7. Include bullet points and numbered lists where appropriate
8. Add a compelling introduction that hooks the reader
9. Each section should be substantive and helpful
10. End with a clear conclusion and business CTA
11. Write in a professional but approachable tone
12. Make it genuinely helpful - this will be published on a real website
13. ${isPillar ? 'This is a comprehensive pillar article - cover the topic deeply' : 'Keep this focused and specific to the supporting topic'}

Return ONLY the Markdown content for the blog post. No explanations, no code blocks, just the article itself starting with the H1 heading.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are an expert SEO content writer who writes compelling, helpful, and SEO-optimized blog articles. You return clean Markdown content without any code block wrappers.'
        },
        { role: 'user', content: prompt }
      ],
      thinking: { type: 'disabled' }
    });

    let content = completion.choices[0]?.message?.content || '';

    // Clean up any accidental code blocks
    content = content.replace(/^```markdown?\n?/i, '').replace(/\n?```$/i, '').trim();

    // Calculate word count
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    // Calculate SEO score
    const seoScore = calculateSeoScore(content, {
      targetKeyword,
      secondaryKeywords: secondaryKeywords || [],
      city,
      wordCountTarget: wordCountTarget || 2000,
      isPillar,
    });

    return NextResponse.json({
      content,
      wordCount,
      seoScore,
    });
  } catch (error) {
    console.error('Blog generation error:', error);
    return NextResponse.json({ error: 'Failed to generate blog' }, { status: 500 });
  }
}

function calculateSeoScore(
  content: string,
  opts: {
    targetKeyword: string;
    secondaryKeywords: string[];
    city: string;
    wordCountTarget: number;
    isPillar: boolean;
  }
) {
  let score = 0;
  const lower = content.toLowerCase();
  const words = content.split(/\s+/).filter(Boolean).length;

  const wordRatio = Math.min(words / opts.wordCountTarget, 1.2);
  score += Math.round(wordRatio * 20);

  const first100 = lower.slice(0, 500);
  if (first100.includes(opts.targetKeyword.toLowerCase())) score += 10;

  const kwCount = (lower.match(new RegExp(opts.targetKeyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
  const density = kwCount / words;
  if (density >= 0.005 && density <= 0.025) score += 15;
  else if (density > 0 && density < 0.005) score += 8;
  else if (density > 0.025 && density <= 0.035) score += 8;

  if (lower.includes(opts.city.toLowerCase())) score += 10;
  if (content.includes('## ')) score += 10;
  if (content.includes('### ')) score += 5;
  if (content.includes('- ') || content.includes('* ') || content.includes('1. ')) score += 10;

  const secKwCount = opts.secondaryKeywords.filter(kw =>
    lower.includes(kw.toLowerCase())
  ).length;
  score += Math.round((secKwCount / Math.max(opts.secondaryKeywords.length, 1)) * 10);

  if (lower.includes('conclusion') || lower.includes('cta') || lower.includes('contact') || lower.includes('get in touch')) score += 10;

  return Math.min(score, 100);
}
