'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Plus, Zap, BookOpen, Rocket } from 'lucide-react';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const onboarded = localStorage.getItem('ugc-studio-onboarded');
    if (!onboarded) {
      const timer = setTimeout(() => setShowOnboarding(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissOnboarding = useCallback(() => {
    localStorage.setItem('ugc-studio-onboarded', 'true');
    setShowOnboarding(false);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setShowOnboarding(true);
  }, []);

  return { showOnboarding, dismissOnboarding, currentStep, nextStep, prevStep, startTour };
}

export const ONBOARDING_STEPS = [
  { title: 'Welcome to UGC Ad Studio!', desc: 'Let\'s take a quick tour to show you around. You\'ll be creating amazing ad content in no time.', icon: Sparkles, emoji: '✨' },
  { title: 'Create Content', desc: 'Start by describing your product and we\'ll generate authentic UGC-style hooks, scripts, CTAs and captions.', icon: Plus, emoji: '🎯' },
  { title: 'Quick Templates', desc: 'Use our pre-built templates to get started in seconds. Just click one and hit generate!', icon: Zap, emoji: '⚡' },
  { title: 'Your Library', desc: 'All your generated content packs are saved here. Search, filter, sort, and export anytime you need.', icon: BookOpen, emoji: '📚' },
  { title: 'You\'re All Set!', desc: 'Generate your first content pack and start creating amazing ads. The AI does the heavy lifting!', icon: Rocket, emoji: '🚀' },
];
