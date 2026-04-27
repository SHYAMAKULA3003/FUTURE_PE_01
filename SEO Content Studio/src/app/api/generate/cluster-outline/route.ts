import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { businessType, businessName, city, state, pillarTopic, pillarKeyword, supportingTopics, targetAudience, description } = await request.json();

    if (!pillarTopic || !pillarKeyword) {
      return NextResponse.json({ error: 'Pillar topic and keyword are required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const prompt = `SEO content outline for ${businessType} "${businessName}" in ${city}${state ? ', ' + state : ''}.

Pillar: "${pillarTopic}" (keyword: "${pillarKeyword}")
Supporting: ${supportingTopics.map((t: { topic: string; keyword: string }, i: number) => `${i + 1}. "${t.topic}" (${t.keyword})`).join(', ')}

Return ONLY valid JSON:
{"pillarBlog":{"title":"H1","slug":"url-slug","metaTitle":"under 60 chars","metaDescription":"150-160 chars","targetKeyword":"${pillarKeyword}","secondaryKeywords":["kw1","kw2"],"searchIntent":"intent","outline":{"introduction":"what intro covers","sections":[{"heading":"H2","subsections":[{"heading":"H3","points":["pt1"]}]}],"conclusion":"what conclusion covers","cta":"CTA for ${businessType}"},"wordCountTarget":2000,"internalLinks":["slug1","slug2"]},"supportingBlogs":[{"title":"H1","slug":"slug","metaTitle":"title","metaDescription":"desc","targetKeyword":"kw","secondaryKeywords":["kw"],"searchIntent":"intent","outline":{"introduction":"desc","sections":[{"heading":"H2","subsections":[{"heading":"H3","points":["pt1"]}]}],"conclusion":"desc","cta":"CTA"},"wordCountTarget":1200,"internalLinks":["pillar-slug"]}]}

Rules: 2-3 sections per blog. Include "${city}" in pillar. Slugs lowercase with hyphens. No markdown.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are an expert SEO content strategist. You return only valid JSON responses.' },
        { role: 'user', content: prompt }
      ],
      thinking: { type: 'disabled' }
    });

    let responseText = completion.choices[0]?.message?.content || '';
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let outlineData;
    try {
      outlineData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        outlineData = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
      }
    }

    return NextResponse.json(outlineData);
  } catch (error) {
    console.error('Cluster outline error:', error);
    return NextResponse.json({ error: 'Failed to generate cluster outline' }, { status: 500 });
  }
}
