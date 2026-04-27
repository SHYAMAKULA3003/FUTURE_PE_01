'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUGCStore } from '@/lib/store';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useSpringCounter } from '@/hooks/useSpringCounter';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { TiltCard, MagneticButton } from '@/components/Effects';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Megaphone,
  Video,
  Target,
  Users,
  Zap,
  BookOpen,
  Send,
  MessageSquare,
  Layers,
  FileText,
  Clock,
  Lightbulb,
  Quote,
  Star,
  ArrowRight,
  Rocket,
  ShieldCheck,
  Wand2,
  Download,
  ChevronRight,
  MapPin,
  Palette,
} from 'lucide-react';

export interface HeroViewProps {
  totalGenerated: number;
  totalPacks: number;
  onStartTour: () => void;
}

export function HeroView({ totalGenerated, totalPacks, onStartTour }: HeroViewProps) {
  const store = useUGCStore();
  const animatedPacks = useSpringCounter(totalPacks);
  const animatedPieces = useSpringCounter(totalGenerated, 1500);

  // Scroll reveal refs
  const featureRef = useRef<HTMLDivElement>(null);
  const frameworkRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x, y });
    };
    const el = heroRef.current;
    el?.addEventListener('mousemove', handleMouseMove);
    return () => el?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const featureVisible = useScrollReveal(featureRef);
  const frameworkVisible = useScrollReveal(frameworkRef);
  const howItWorksVisible = useScrollReveal(howItWorksRef);
  const testimonialsVisible = useScrollReveal(testimonialsRef);
  const promptVisible = useScrollReveal(promptRef);

  const { displayText: typewriterText, isTypingDone } = useTypewriter(
    'Generate authentic UGC-style ad scripts, hooks, CTAs & captions using AI. Content ready for Instagram Reels, TikTok, YouTube Shorts & more.',
    18,
    800
  );

  return (
    <motion.div
      ref={heroRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 parallax-container"
    >
      <div className="text-center max-w-4xl mx-auto">
        {/* Badge - Enhanced with shimmer */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Badge className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-orange-100 to-rose-100 dark:from-orange-900/40 dark:to-rose-900/40 text-orange-700 dark:text-orange-300 hover:from-orange-100 hover:to-rose-100 border-0 mb-6 shadow-sm relative overflow-hidden">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            AI-Powered UGC Content Generation
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_linear_infinite]" />
          </Badge>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-foreground"
        >
          Create Ad Content That{'\n'}
          <span className="gradient-text relative">
            Feels Real, Converts More
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 8C50 2 150 2 200 6C250 10 350 4 398 6" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round"/>
              <defs><linearGradient id="underline-grad" x1="0" y1="0" x2="400" y2="0"><stop stopColor="#f97316" stopOpacity="0.4"/><stop offset="0.5" stopColor="#f43f5e" stopOpacity="0.6"/><stop offset="1" stopColor="#ec4899" stopOpacity="0.3"/></linearGradient></defs>
            </svg>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed min-h-[3.5rem]"
        >
          {typewriterText}
          {!isTypingDone && <span className="typewriter-cursor" />}
        </motion.p>

        {/* CTA Buttons - Enhanced with glow effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <MagneticButton>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={() => store.setActiveView('generator')}
                className="w-full sm:w-auto px-8 py-6 text-base font-semibold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-xl shadow-orange-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/35 hover:-translate-y-0.5 active:translate-y-0 group relative overflow-hidden cta-glow"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Generate UGC Content
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </motion.div>
          </MagneticButton>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              variant="outline"
              onClick={() => store.setActiveView('library')}
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold border-2 hover:bg-muted/50 transition-all duration-300"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              View Library
            </Button>
          </motion.div>
        </motion.div>
        {/* Take Tour Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartTour}
            className="text-xs text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />Take Tour
          </Button>
        </motion.div>

        {/* Stats Bar - Enhanced with animated counters and individual cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-16"
          style={{ transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 5}px)` }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto parallax-layer">
            {[
              { value: animatedPieces || totalGenerated, label: 'Content Pieces', icon: FileText, realValue: totalGenerated, gradient: 'stat-card-gradient-orange' },
              { value: animatedPacks || totalPacks, label: 'Content Packs', icon: Layers, realValue: totalPacks, gradient: 'stat-card-gradient-rose' },
              { value: 5, label: 'Platforms', icon: Video, realValue: 5, gradient: 'stat-card-gradient-pink' },
              { value: '< 30s', label: 'Generation Time', icon: Clock, realValue: 0, gradient: 'stat-card-gradient-amber' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className={`relative rounded-xl p-3 text-center backdrop-blur-sm hover:bg-muted/50 transition-colors ${stat.gradient || ''}`}
              >
                <stat.icon className="w-4 h-4 text-orange-500 mx-auto mb-1.5" />
                <div className="text-lg font-bold tabular-nums">{stat.realValue < 100 ? stat.value : stat.value}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Cards - Enhanced with glass hover + Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ opacity: featureVisible ? 1 : 0, transform: featureVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
          ref={featureRef}
          className="parallax-layer"
        >
          <div className="grid-pattern-bg rounded-2xl p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5 text-shadow-glow">What You Get</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" style={{ transform: `translate(${mousePos.x * -3}px, ${mousePos.y * -3}px)` }}>
            {[
              { icon: Megaphone, title: '5 Ad Hooks', desc: 'Attention-grabbing hooks for every scenario', color: 'from-orange-400 to-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
              { icon: Video, title: '3 Full Scripts', desc: 'Complete UGC scripts with scene directions', color: 'from-rose-400 to-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
              { icon: Send, title: '5 CTAs', desc: 'Conversion-optimized calls to action', color: 'from-pink-400 to-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30' },
              { icon: MessageSquare, title: '3 Captions', desc: 'Ready-to-post captions with hashtags', color: 'from-amber-400 to-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
            ].map((feature, i) => (
              <TiltCard key={feature.title} delay={0.65 + i * 0.08}>
                <Card className={`border border-border/30 shadow-sm hover:shadow-lg hover:border-orange-200/50 dark:hover:border-orange-800/30 transition-all duration-300 ${feature.bg} neon-glow`}>
                  <CardContent className="p-4 sm:p-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </TiltCard>
            ))}
          </div>
          </div>
        </motion.div>

        <hr className="section-divider max-w-2xl mx-auto" />

        {/* Framework + Audience Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12" ref={frameworkRef} style={{ opacity: frameworkVisible ? 1 : 0, transform: frameworkVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s' }}>
          {/* UGC Framework - Feature 5: Glassmorphism 2.0 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.85 }}
          >
            <Card className="glass-card-elevated border border-border/30 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 neon-glow-rose">
              <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_70%)]" />
                <h3 className="text-lg font-bold text-white flex items-center gap-2 relative">
                  <Lightbulb className="w-5 h-5" />
                  Proven UGC Framework
                </h3>
                <p className="text-orange-100 text-sm mt-1 relative">Every piece follows this conversion formula</p>
              </div>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {[
                    { step: '1', label: 'Hook', desc: 'Grab attention in the first 3 seconds', emoji: '🪝' },
                    { step: '2', label: 'Problem', desc: 'Relatable pain point the audience feels', emoji: '😰' },
                    { step: '3', label: 'Solution', desc: 'Introduce product as the natural fix', emoji: '✨' },
                    { step: '4', label: 'CTA', desc: 'Clear, non-pushy call to action', emoji: '👆' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted group-hover:bg-orange-50 dark:group-hover:bg-orange-950/30 flex items-center justify-center text-sm shrink-0 font-bold transition-colors">
                        {item.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                      {i < 3 && (
                        <div className="w-px h-full bg-border/50 ml-4 mt-4" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Built For - Feature 5: Glassmorphism 2.0 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="glass-card-v2 border border-border/30 shadow-sm h-full hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-5">
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Built For
                </h3>
                <p className="text-sm text-muted-foreground mb-5">Used by teams and individuals who create ad content</p>
                <div className="space-y-2">
                  {[
                    { label: 'D2C Brands', desc: 'Direct-to-consumer product companies', icon: '🛍️' },
                    { label: 'Local Businesses', desc: 'Salons, cafes, gyms, clinics', icon: '🏪' },
                    { label: 'Content Creators', desc: 'Influencers and personal brands', icon: '🎬' },
                    { label: 'Marketing Agencies', desc: 'Content teams managing multiple clients', icon: '📊' },
                    { label: 'Freelancers', desc: 'Independent UGC content creators', icon: '💡' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-transparent dark:hover:from-orange-950/20 transition-all duration-200 group cursor-default">
                      <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* How It Works - Enhanced + Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 max-w-3xl mx-auto"
          ref={howItWorksRef}
          style={{ opacity: howItWorksVisible ? 1 : 0, transform: howItWorksVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s' }}
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center text-shadow-glow">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Describe', desc: 'Enter product details, audience & platform', icon: Layers },
              { step: '2', title: 'Generate', desc: 'AI creates authentic UGC content in seconds', icon: Wand2 },
              { step: '3', title: 'Export', desc: 'Copy, download, or save for campaigns', icon: Download },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05 + i * 0.1 }}
                className="text-center relative"
              >
                {i < 2 && (
                  <div className="hidden sm:flex absolute top-8 left-[60%] w-[80%] items-center">
                    <div className="w-full border-t-2 border-dashed border-border/40 relative">
                      <ChevronRight className="absolute -right-2 -top-[7px] w-4 h-4 text-border" />
                    </div>
                  </div>
                )}
                {/* Feature 6: Subtle Float on How It Works step icons */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white flex items-center justify-center mb-3 mx-auto shadow-lg shadow-orange-500/20 cursor-default ${i === 1 ? 'subtle-float-delayed' : 'subtle-float'}`}
                >
                  <item.icon className="w-7 h-7" />
                </motion.div>
                <div className="text-xs text-orange-500 font-bold mb-1">STEP {item.step}</div>
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Section - NEW + Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-16"
          ref={testimonialsRef}
          style={{ opacity: testimonialsVisible ? 1 : 0, transform: testimonialsVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s' }}
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5 text-center text-shadow-glow">Trusted by Creators</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'Sarah M.', role: 'D2C Brand Owner', text: 'Generated a full month of UGC content in under an hour. The hooks are insanely good!', avatar: '👩‍💼' },
              { name: 'Alex K.', role: 'Freelance Creator', text: 'My clients love the scripts. They actually sound like real people talking, not ads.', avatar: '👨‍🎨' },
              { name: 'Priya S.', role: 'Agency Director', text: 'We use this for every new client onboarding. Saves our team 10+ hours per week.', avatar: '👩‍💻' },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.25 + i * 0.08 }}
              >
                <Card className="border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg">{t.avatar}</div>
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className="text-[11px] text-muted-foreground">{t.role}</div>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} className="w-3 h-3 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Prompt Structure Preview - Enhanced + Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-12"
          ref={promptRef}
          style={{ opacity: promptVisible ? 1 : 0, transform: promptVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s' }}
        >
          <hr className="section-divider max-w-2xl mx-auto" />
          <Card className="border border-border/30 shadow-sm overflow-hidden max-w-2xl mx-auto hover:shadow-md transition-shadow duration-300 glass-card-elevated">
            <div className="bg-muted/50 px-5 py-3 border-b border-border/40 flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              </div>
              <Quote className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sample Prompt Structure</span>
            </div>
            <CardContent className="p-5">
              <pre className="text-xs text-foreground/80 font-mono leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-xl p-4 border border-border/30">
{`Create UGC-style ad content for:
  Product: [Your Product Name]
  Audience: [Target Demographic]
  Platform: [Instagram Reels | TikTok | ...]

Framework: Hook → Problem → Solution → CTA
Tone: Authentic, conversational, first-person

Output:
  ✓ 5 attention hooks
  ✓ 3 full ad scripts
  ✓ 5 conversion CTAs
  ✓ 3 social media captions`}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
