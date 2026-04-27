'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { ONBOARDING_STEPS } from '@/hooks/useOnboarding';

export function OnboardingOverlay({ currentStep, onNext, onPrev, onDismiss }: { currentStep: number; onNext: () => void; onPrev: () => void; onDismiss: () => void }) {
  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />

        {/* Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          {/* Gradient border glow */}
          <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 shadow-2xl shadow-orange-500/20">
            <div className="bg-background rounded-2xl overflow-hidden">
              {/* Top accent */}
              <div className="h-1.5 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500" />
              <div className="p-6 sm:p-8">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/40 dark:to-rose-900/40 flex items-center justify-center mb-5 mx-auto shadow-lg">
                  <span className="text-3xl">{step.emoji}</span>
                </div>

                {/* Step counter */}
                <div className="text-center mb-4">
                  <span className="text-xs font-semibold text-orange-500 uppercase tracking-wider">Step {currentStep + 1} of 5</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-center mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">{step.desc}</p>

                {/* Dots */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  {ONBOARDING_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? 'w-6 bg-gradient-to-r from-orange-500 to-rose-500'
                          : i < currentStep
                          ? 'w-2 bg-orange-300 dark:bg-orange-700'
                          : 'w-2 bg-muted-foreground/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-6">
                  <div>
                    {currentStep > 0 ? (
                      <Button variant="ghost" size="sm" onClick={onPrev} className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4 mr-1" />Back
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
                        Skip
                      </Button>
                    )}
                  </div>
                  {currentStep < 4 ? (
                    <Button size="sm" onClick={onNext} className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 shadow-md shadow-orange-500/20">
                      Next<ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button size="sm" onClick={onDismiss} className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 shadow-md shadow-orange-500/20">
                      <Sparkles className="w-4 h-4 mr-1.5" />Start Creating
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
