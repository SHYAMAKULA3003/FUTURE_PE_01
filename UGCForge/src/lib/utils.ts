import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Utility: Word count & estimated read time ─────────────────────
export function getContentStats(text: string, type: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const readTime = Math.max(1, Math.ceil(words / 150)); // ~150 words per minute
  // For scripts: estimate ~2.5 words per second for spoken content
  const estimatedDuration = type === 'script' ? Math.max(1, Math.round(words / 2.5)) : null;
  return { words, chars, readTime, estimatedDuration };
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ─── Content Quality Score Algorithm ───────────────────────
export function calculateContentScore(content: string, type: string): { score: number; label: string; suggestions: string[] } {
  const text = content.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
  
  // Check for power words
  const powerWords = ['proven', 'guaranteed', 'exclusive', 'limited', 'free', 'instant', 'transform', 'discover', 'secret', 'amazing', 'ultimate', 'powerful', 'revolutionary', ' breakthrough', 'best-selling', 'results', 'effortless', 'naturally', 'authentic'];
  const powerWordCount = words.filter(w => powerWords.includes(w.toLowerCase())).length;
  
  // Check for emotional triggers
  const emotionalWords = ['love', 'hate', 'feel', 'imagine', 'remember', 'struggle', 'frustrated', 'excited', 'dream', 'believe', 'worry', 'hope', 'happy', 'beautiful', 'perfect'];
  const emotionalCount = words.filter(w => emotionalWords.includes(w.toLowerCase())).length;
  
  // Check for CTA language
  const ctaWords = ['click', 'shop', 'try', 'get', 'buy', 'grab', 'claim', 'start', 'join', 'subscribe', 'link', 'comment', 'share', 'save', 'follow'];
  const ctaWordCount = words.filter(w => ctaWords.includes(w.toLowerCase())).length;
  
  // Check for question marks (engagement)
  const questionCount = (text.match(/\?/g) || []).length;
  
  // Check for numbers (specificity)
  const numberCount = (text.match(/\d+/g) || []).length;
  
  let score = 50; // base score
  
  // Length scoring (different per type)
  if (type === 'hook') {
    if (wordCount >= 5 && wordCount <= 20) score += 15;
    else if (wordCount >= 3 && wordCount <= 30) score += 8;
    else score -= 5;
  } else if (type === 'script') {
    if (wordCount >= 50 && wordCount <= 200) score += 15;
    else if (wordCount >= 30 && wordCount <= 300) score += 8;
    else score -= 5;
  } else if (type === 'cta') {
    if (wordCount >= 5 && wordCount <= 25) score += 15;
    else if (wordCount >= 3 && wordCount <= 40) score += 8;
    else score -= 5;
  } else {
    if (wordCount >= 20 && wordCount <= 150) score += 15;
    else if (wordCount >= 10 && wordCount <= 200) score += 8;
    else score -= 5;
  }
  
  // Power words bonus
  score += Math.min(powerWordCount * 3, 10);
  
  // Emotional words bonus
  score += Math.min(emotionalCount * 2, 8);
  
  // CTA words bonus (for CTAs especially)
  if (type === 'cta') score += Math.min(ctaWordCount * 4, 10);
  else score += Math.min(ctaWordCount * 1, 3);
  
  // Question bonus (engagement)
  score += Math.min(questionCount * 3, 6);
  
  // Number bonus (specificity)
  score += Math.min(numberCount * 2, 6);
  
  // Sentence readability bonus
  if (avgSentenceLength >= 8 && avgSentenceLength <= 18) score += 5;
  else if (avgSentenceLength > 0 && avgSentenceLength < 8) score += 2;
  
  // Clamp score
  score = Math.max(10, Math.min(100, score));
  
  // Generate suggestions
  const suggestions: string[] = [];
  if (powerWordCount === 0) suggestions.push('Add power words (proven, exclusive, transform)');
  if (emotionalCount === 0) suggestions.push('Include emotional triggers');
  if (type === 'hook' && questionCount === 0) suggestions.push('Try starting with a question');
  if (numberCount === 0) suggestions.push('Add specific numbers for credibility');
  if (type === 'cta' && ctaWordCount === 0) suggestions.push('Include clear action words');
  if (wordCount < 5) suggestions.push('Content seems too short');
  if (sentenceCount > 0 && avgSentenceLength > 20) suggestions.push('Use shorter sentences for readability');
  
  let label: string;
  if (score >= 80) label = 'Excellent';
  else if (score >= 65) label = 'Good';
  else if (score >= 45) label = 'Fair';
  else label = 'Needs Work';
  
  return { score, label, suggestions };
}
