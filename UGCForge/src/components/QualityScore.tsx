'use client';

import { calculateContentScore } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Gauge } from 'lucide-react';

// ─── Helper: compute detailed sub-scores ───────────────────────
interface SubScore {
  label: string;
  score: number; // 0-10
  color: string;
  barColor: string;
}

function computeDetailedScores(content: string, type: string): SubScore[] {
  const text = content.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const powerWords = ['proven', 'guaranteed', 'exclusive', 'limited', 'free', 'instant', 'transform', 'discover', 'secret', 'amazing', 'ultimate', 'powerful', 'revolutionary', 'breakthrough', 'best-selling', 'results', 'effortless', 'naturally', 'authentic'];
  const emotionalWords = ['love', 'hate', 'feel', 'imagine', 'remember', 'struggle', 'frustrated', 'excited', 'dream', 'believe', 'worry', 'hope', 'happy', 'beautiful', 'perfect'];
  const ctaWords = ['click', 'shop', 'try', 'get', 'buy', 'grab', 'claim', 'start', 'join', 'subscribe', 'link', 'comment', 'share', 'save', 'follow'];
  const questionCount = (text.match(/\?/g) || []).length;
  const numberCount = (text.match(/\d+/g) || []).length;

  const powerCount = words.filter(w => powerWords.includes(w.toLowerCase())).length;
  const emotionalCount = words.filter(w => emotionalWords.includes(w.toLowerCase())).length;
  const ctaCount = words.filter(w => ctaWords.includes(w.toLowerCase())).length;

  // Word count score (0-10)
  let wordScore: number;
  if (type === 'hook') {
    wordScore = wordCount >= 5 && wordCount <= 20 ? 10 : wordCount >= 3 && wordCount <= 30 ? 6 : 3;
  } else if (type === 'script') {
    wordScore = wordCount >= 50 && wordCount <= 200 ? 10 : wordCount >= 30 && wordCount <= 300 ? 6 : 3;
  } else if (type === 'cta') {
    wordScore = wordCount >= 5 && wordCount <= 25 ? 10 : wordCount >= 3 && wordCount <= 40 ? 6 : 3;
  } else {
    wordScore = wordCount >= 20 && wordCount <= 150 ? 10 : wordCount >= 10 && wordCount <= 200 ? 6 : 3;
  }

  const subScores: SubScore[] = [
    { label: 'Word Count', score: wordScore, color: 'text-blue-600 dark:text-blue-400', barColor: 'bg-blue-500' },
    { label: 'Power Words', score: Math.min(powerCount * 3, 10), color: 'text-orange-600 dark:text-orange-400', barColor: 'bg-orange-500' },
    { label: 'Emotional Triggers', score: Math.min(emotionalCount * 3, 10), color: 'text-rose-600 dark:text-rose-400', barColor: 'bg-rose-500' },
    { label: 'CTA Language', score: Math.min(ctaCount * (type === 'cta' ? 4 : 2), 10), color: 'text-pink-600 dark:text-pink-400', barColor: 'bg-pink-500' },
    { label: 'Questions', score: Math.min(questionCount * 4, 10), color: 'text-amber-600 dark:text-amber-400', barColor: 'bg-amber-500' },
    { label: 'Specificity', score: Math.min(numberCount * 3, 10), color: 'text-emerald-600 dark:text-emerald-400', barColor: 'bg-emerald-500' },
  ];

  return subScores;
}

// ─── Quality Score Display Component ───────────────────────
export function QualityScoreBadge({ content, type }: { content: string; type: string }) {
  const { score, label, suggestions } = calculateContentScore(content, type);
  const scoreClass = score >= 80 ? 'score-excellent score-excellent-bg' : score >= 65 ? 'score-good score-good-bg' : score >= 45 ? 'score-fair score-fair-bg' : 'score-poor score-poor-bg';
  const subScores = computeDetailedScores(content, type);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${scoreClass} cursor-default`}>
            <Gauge className="w-3 h-3" />{score}
          </span>
        </TooltipTrigger>
        <TooltipContent side="left" className="w-64 p-3">
          <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="font-semibold text-xs">{label}</p>
              <span className={`text-xs font-bold ${scoreClass.split(' ')[0]}`}>{score}/100</span>
            </div>

            {/* Sub-score progress bars */}
            <div className="space-y-1.5">
              {subScores.map((sub) => (
                <div key={sub.label}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-muted-foreground">{sub.label}</span>
                    <span className={`text-[10px] font-semibold tabular-nums ${sub.color}`}>{sub.score}/10</span>
                  </div>
                  <div className="h-1 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${sub.barColor}`}
                      style={{ width: `${sub.score * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Improvement suggestions */}
            {suggestions.length > 0 ? (
              <div className="pt-1.5 border-t border-border/30">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1">💡 Suggestions</p>
                <ul className="text-[10px] text-muted-foreground space-y-0.5">
                  {suggestions.slice(0, 4).map((s, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-orange-400 mt-px shrink-0">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-[10px] text-green-600 font-medium">✓ Great content!</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
