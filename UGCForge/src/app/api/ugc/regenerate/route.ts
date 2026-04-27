import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const SYSTEM_PROMPT = `You are an expert UGC (User Generated Content) ad copywriter. You create authentic, raw, and human-sounding ad content that looks and feels like real social media content.

IMPORTANT: You MUST respond with valid JSON only. No markdown, no code blocks, just pure JSON.`;

async function generateWithAI(prompt: string): Promise<string> {
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
  const arrMatch = text.match(/(\[[\s\S]*\])/);
  if (arrMatch) return arrMatch[1].trim();
  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, productName, productCategory, targetAudience, platform, tone, brandVoice, keyBenefits, existingLabel } = body;

    if (!type || !productName) {
      return NextResponse.json({ error: 'Type and product name are required' }, { status: 400 });
    }

    const typePrompts: Record<string, string> = {
      hook: `Generate 3 new UGC ad hooks for **${productName}** (${productCategory}).
Target audience: ${targetAudience}
Platform: ${platform}
Tone: ${tone}
${brandVoice ? `Brand voice: ${brandVoice}` : ''}
${keyBenefits ? `Key benefits: ${keyBenefits}` : ''}
The previous hook style was: "${existingLabel || 'N/A'}"

Generate different styles from the previous ones. Each hook should grab attention in the first 3 seconds.
Respond as JSON: {"items": [{"label": "style description", "content": "hook text"}]}`,

      script: `Generate 1 new complete UGC ad script for **${productName}** (${productCategory}).
Target audience: ${targetAudience}
Platform: ${platform}
Tone: ${tone}
${brandVoice ? `Brand voice: ${brandVoice}` : ''}
${keyBenefits ? `Key benefits: ${keyBenefits}` : ''}
The previous script style was: "${existingLabel || 'N/A'}"

Generate a different script style. Include [SCENE] and [TEXT ON SCREEN] markers.
The script should follow: Hook → Problem → Solution → CTA
Respond as JSON: {"items": [{"label": "script style", "content": "full script with markers"}]}`,

      cta: `Generate 3 new UGC ad calls-to-action for **${productName}** (${productCategory}).
Target audience: ${targetAudience}
Platform: ${platform}
Tone: ${tone}
${keyBenefits ? `Key benefits: ${keyBenefits}` : ''}

Generate varied CTA styles: soft, urgent, social proof, question-based, offer-driven.
Respond as JSON: {"items": [{"label": "CTA style", "content": "CTA text"}]}`,

      caption: `Generate 2 new social media captions for **${productName}** (${productCategory}).
Target audience: ${targetAudience}
Platform: ${platform}
Tone: ${tone}
${keyBenefits ? `Key benefits: ${keyBenefits}` : ''}

Include emojis and relevant hashtags. Make them different from typical captions.
Respond as JSON: {"items": [{"label": "caption style", "content": "full caption with hashtags"}]}`,
    };

    const prompt = typePrompts[type] || typePrompts.hook;
    const aiResponse = await generateWithAI(prompt);
    const jsonStr = extractJSON(aiResponse);

    let content;
    try {
      content = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: 'Failed to parse generated content' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: (content.items || []).map((item: { label: string; content: string }) => ({
        type,
        label: item.label,
        content: item.content,
        platform,
      })),
    });
  } catch (error) {
    console.error('Regenerate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to regenerate' },
      { status: 500 }
    );
  }
}
