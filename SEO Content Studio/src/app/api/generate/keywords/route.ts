import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Allow up to 120 seconds for AI generation
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { businessType, businessName, city, state, targetAudience, description } = await request.json();

    if (!businessType || !city) {
      return NextResponse.json({ error: 'Business type and city are required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const prompt = `You are an SEO strategist. For a ${businessType} "${businessName || ''}" in ${city}${state ? ', ' + state : ''}${description ? '. ' + description : ''}${targetAudience ? '. Audience: ' + targetAudience : ''}, generate:

Return ONLY valid JSON (no markdown, no explanation):
{"primaryKeywords":[{"keyword":"phrase","searchIntent":"informational|navigational|commercial|transactional","difficulty":"low|medium|high"}],"secondaryKeywords":[...8 items...],"longTailKeywords":[...5 items...],"localKeywords":[...5 items with "${city}"...],"contentClusterSuggestions":[{"pillarTopic":"topic","pillarKeyword":"kw","supportingTopics":[{"topic":"t","keyword":"kw","searchIntent":"intent"}]}]}

Rules: 5 primary, 8 secondary, 5 long-tail, 5 local keywords. 2 cluster suggestions each with 4 supporting topics. Be concise and realistic.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You return valid JSON only. No markdown.' },
        { role: 'user', content: prompt }
      ],
      thinking: { type: 'disabled' }
    });

    let responseText = completion.choices[0]?.message?.content || '';
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let keywordData;
    try {
      keywordData = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        keywordData = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: 'Failed to parse AI response. Try again.' }, { status: 500 });
      }
    }

    return NextResponse.json(keywordData);
  } catch (error) {
    console.error('Keyword generation error:', error);
    return NextResponse.json({ error: 'Failed to generate keywords. Please try again.' }, { status: 500 });
  }
}
