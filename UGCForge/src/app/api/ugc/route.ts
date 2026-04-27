import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

const SYSTEM_PROMPT = `You are an expert UGC (User Generated Content) ad copywriter who works at a top content marketing agency. You create authentic, raw, and human-sounding ad content that looks and feels like real social media content — NOT like traditional salesy ads.

Your content follows proven UGC ad frameworks:
1. Hook → Problem → Solution → CTA
2. It sounds like a real person talking to camera, sharing an honest experience
3. Uses conversational language, natural pauses, and relatable phrases
4. Avoids corporate jargon and overly polished language

When generating content, ALWAYS:
- Use first-person perspective ("I", "my experience")
- Include natural speech patterns and casual language
- Make it feel authentic and relatable
- Include specific, believable details
- End with clear but not pushy CTAs

IMPORTANT: You MUST respond with valid JSON only. No markdown, no code blocks, just pure JSON.`;

async function generateContent(prompt: string): Promise<string> {
  const zai = await ZAI.create();
  
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    thinking: { type: 'disabled' }
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) throw new Error('Empty response from AI');
  return response;
}

function extractJSON(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) return jsonMatch[1].trim();
  const braceMatch = text.match(/(\{[\s\S]*\})/);
  if (braceMatch) return braceMatch[1].trim();
  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productName,
      productCategory,
      businessType,
      targetAudience,
      platform,
      tone,
      brandVoice,
      keyBenefits,
    } = body;

    if (!productName || !productCategory || !targetAudience) {
      return NextResponse.json(
        { error: 'Product name, category, and target audience are required' },
        { status: 400 }
      );
    }

    const platformMap: Record<string, { name: string; duration: string; style: string }> = {
      instagram_reels: { name: 'Instagram Reels', duration: '15-30 seconds', style: 'visual-first, trendy, uses trending audio cues' },
      instagram_ads: { name: 'Instagram Ads', duration: '15-60 seconds', style: 'conversion-focused, clear CTA, strong hook' },
      tiktok: { name: 'TikTok', duration: '15-60 seconds', style: 'raw, unfiltered, trend-driven, uses jump cuts' },
      youtube_shorts: { name: 'YouTube Shorts', duration: '30-60 seconds', style: 'informational yet casual, value-packed' },
      facebook_ads: { name: 'Facebook Ads', duration: '15-30 seconds', style: 'story-driven, relatable, slightly longer form' },
    };

    const platformInfo = platformMap[platform] || platformMap.instagram_reels;

    const prompt = `Generate a complete UGC Ad Content Pack for the following product/business:

**Product/Business**: ${productName}
**Category**: ${productCategory}
**Business Type**: ${businessType || 'D2C Brand'}
**Target Audience**: ${targetAudience}
**Platform**: ${platformInfo.name} (${platformInfo.duration})
**Platform Style**: ${platformInfo.style}
**Tone**: ${tone || 'casual and authentic'}
${brandVoice ? `**Brand Voice**: ${brandVoice}` : ''}
${keyBenefits ? `**Key Benefits**: ${keyBenefits}` : ''}

Generate the following as a JSON object with these exact keys:

{
  "hooks": [
    {
      "label": "Short description of hook style",
      "content": "The actual hook text/script"
    }
  ],
  "scripts": [
    {
      "label": "Script variation name",
      "content": "Full UGC script with [SCENE] and [TEXT ON SCREEN] markers"
    }
  ],
  "ctas": [
    {
      "label": "CTA variation name",
      "content": "The call-to-action text"
    }
  ],
  "captions": [
    {
      "label": "Caption style",
      "content": "Full social media caption with emojis and hashtags"
    }
  ]
}

Requirements:
- Generate exactly 5 hooks (different styles: question hook, story hook, problem hook, curiosity hook, bold claim hook)
- Generate exactly 3 full ad scripts (problem-solution, testimonial style, before-after)
- Generate exactly 5 CTAs (soft CTA, urgent CTA, social proof CTA, question CTA, offer CTA)
- Generate exactly 3 captions (short punchy, storytelling, hashtag-rich)
- All content must sound like a REAL person, not an ad
- Include natural speech patterns, casual phrasing
- Make hooks attention-grabbing within the first 3 seconds
- Scripts should be ${platformInfo.duration} long
- Use platform-appropriate language and trends
- Include relevant hashtags in captions`;

    const aiResponse = await generateContent(prompt);
    const jsonStr = extractJSON(aiResponse);
    
    let content;
    try {
      content = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse generated content. Please try again.' },
        { status: 500 }
      );
    }

    const pack = await db.contentPack.create({
      data: {
        productName,
        productCategory,
        businessType: businessType || 'D2C Brand',
        targetAudience,
        platform: platformInfo.name,
        tone: tone || 'casual',
        brandVoice: brandVoice || '',
        keyBenefits: keyBenefits || '',
        contents: {
          create: [
            ...(content.hooks || []).map((h: { label: string; content: string }) => ({
              type: 'hook',
              label: h.label,
              content: h.content,
              platform: platformInfo.name,
            })),
            ...(content.scripts || []).map((s: { label: string; content: string }) => ({
              type: 'script',
              label: s.label,
              content: s.content,
              platform: platformInfo.name,
            })),
            ...(content.ctas || []).map((c: { label: string; content: string }) => ({
              type: 'cta',
              label: c.label,
              content: c.content,
              platform: platformInfo.name,
            })),
            ...(content.captions || []).map((c: { label: string; content: string }) => ({
              type: 'caption',
              label: c.label,
              content: c.content,
              platform: platformInfo.name,
            })),
          ],
        },
      },
      include: { contents: true },
    });

    return NextResponse.json({ success: true, data: pack });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const packs = await db.contentPack.findMany({
      orderBy: { createdAt: 'desc' },
      include: { contents: true },
    });

    return NextResponse.json({ success: true, data: packs });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content packs' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Pack ID is required' }, { status: 400 });
    }

    await db.generatedContent.deleteMany({ where: { contentPackId: id } });
    await db.contentPack.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete content pack' },
      { status: 500 }
    );
  }
}
