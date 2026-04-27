'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useUGCStore } from '@/lib/store';
import { getCustomTemplates, setCustomTemplates } from '@/lib/storage';
import { useDraftAutoSave, loadDraft } from '@/lib/draft';
import { MagneticButton } from '@/components/Effects';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcuts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ArrowLeft, Zap, Video, Instagram, Target, Users, Layers, Palette,
  Check, X, BookmarkPlus, Sparkles, MessageSquare, Send, Loader2,
  RefreshCw, BookMarked, Keyboard, RotateCcw, Lightbulb, Copy, History,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   GENERATOR VIEW (Enhanced with custom templates, better interactions)
   ═══════════════════════════════════════════════════════════════════════ */
export interface GeneratorViewProps {
  store: ReturnType<typeof useUGCStore>;
  onGenerate: () => void;
}

export function GeneratorView({ store, onGenerate }: GeneratorViewProps) {
  const { form, setForm, isGenerating } = store;
  const [customTemplates, setCustomTemplates] = useState<Array<{ name: string; emoji: string; values: Record<string, string> }>>([]);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const { showSaveIndicator } = useDraftAutoSave(store.form);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Keyboard shortcut: Ctrl+Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isGenerating) onGenerate();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating, onGenerate]);

  // Check for saved draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.productName && !form.productName) {
      setShowDraftBanner(true);
    }
  }, []);

  // Load custom templates from localStorage on mount
  useEffect(() => {
    const saved = getCustomTemplates();
    if (saved.length > 0) {
      setCustomTemplates(saved);
    }
  }, []);

  // Save custom templates to localStorage on change
  useEffect(() => {
    setCustomTemplates(customTemplates);
  }, [customTemplates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  const quickTemplates = [
    { label: 'Skincare Brand', emoji: '🧴', values: { productName: 'GlowSkin Vitamin C Serum', productCategory: 'skincare', businessType: 'd2c', targetAudience: 'Women aged 25-35 who are skincare enthusiasts and follow beauty influencers on Instagram', tone: 'casual', keyBenefits: 'Brightens skin, reduces dark spots in 2 weeks, 100% natural ingredients, dermatologist tested' } },
    { label: 'Fitness D2C', emoji: '💪', values: { productName: 'FlexFit Resistance Bands Pro', productCategory: 'fitness', businessType: 'd2c', targetAudience: 'Men and women aged 20-40 who work out at home and follow fitness creators on TikTok', tone: 'excited', keyBenefits: '5 resistance levels, portable, durable latex, includes workout guide app' } },
    { label: 'Local Cafe', emoji: '☕', values: { productName: 'Brew & Co. Artisan Coffee', productCategory: 'food_beverage', businessType: 'local_business', targetAudience: 'Young professionals and students in Bangalore who love specialty coffee and aesthetic cafes', tone: 'storytelling', keyBenefits: 'Single-origin beans, cozy ambiance, latte art, affordable pricing, free WiFi' } },
    { label: 'Tech Gadget', emoji: '🎧', values: { productName: 'SoundPods ANC Earbuds', productCategory: 'tech_gadgets', businessType: 'd2c', targetAudience: 'Tech-savvy millennials who commute daily and watch YouTube reviews before buying', tone: 'casual', keyBenefits: 'Active noise cancellation, 30-hour battery, IPX5 waterproof, under $50' } },
  ];

  const saveAsTemplate = () => {
    if (!form.productName) {
      toast.error('Enter a product name first');
      return;
    }
    const newTemplate = {
      name: form.productName,
      emoji: '📌',
      values: { ...form },
    };
    setCustomTemplates(prev => [...prev, newTemplate]);
    toast.success('Saved as custom template!');
  };

  const removeCustomTemplate = (index: number) => {
    setCustomTemplates(prev => prev.filter((_, i) => i !== index));
    toast.success('Template removed');
  };

  const progress = useMemo(() => {
    let filled = 0;
    if (form.productName) filled++;
    if (form.productCategory) filled++;
    if (form.targetAudience) filled++;
    if (form.platform) filled++;
    return Math.round((filled / 4) * 100);
  }, [form]);

  const progressLabel = useMemo(() => {
    if (progress === 0) return 'Getting started...';
    if (progress < 50) return 'Keep going...';
    if (progress < 100) return 'Almost there!';
    return 'Ready to generate!';
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    >
      <div className="mb-8">
        <button onClick={() => store.setActiveView('hero')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Create UGC Ad Content</h2>
              {store.savedPacks.length > 0 && (
                <Badge variant="secondary" className="text-[10px] bg-muted">
                  <History className="w-3 h-3 mr-1" />{store.savedPacks.length} pack{store.savedPacks.length !== 1 ? 's' : ''} created
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Fill in your product details and we&apos;ll generate a complete content pack</p>
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPromptLibrary(true)}
                  className="shrink-0 gap-1.5 text-xs"
                >
                  <BookMarked className="w-4 h-4 text-orange-500" />
                  <span className="hidden sm:inline">Prompt Library</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Browse proven prompt frameworks</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Enhanced Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs font-bold tabular-nums w-8 text-right">{progress}%</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{progressLabel}</p>
          {/* Draft auto-save indicator */}
          {showSaveIndicator && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[10px] text-green-600 dark:text-green-400 font-medium draft-save-indicator flex items-center gap-1"
            >
              <Check className="w-3 h-3" />Draft saved
            </motion.span>
          )}
        </div>
      </div>

      {/* Quick Templates - Enhanced — Feature 5: Glassmorphism 2.0 */}
      <Card className="glass-card-elevated border border-border/30 shadow-sm mb-6 bg-gradient-to-r from-orange-50/50 to-rose-50/50 dark:from-orange-950/20 dark:to-rose-950/20 hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-sm">Quick Start Templates</h3>
            <span className="text-xs text-muted-foreground">— Click to auto-fill</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickTemplates.map((t) => (
              <motion.div key={t.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-3 flex-col gap-1 bg-background/80 hover:bg-background w-full content-card-hover"
                  onClick={() => {
                    Object.entries(t.values).forEach(([key, value]) => setForm(key, value));
                    toast.success(`Template "${t.label}" loaded!`);
                  }}
                >
                  <span className="text-base">{t.emoji}</span>
                  <span className="font-medium">{t.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Custom Templates */}
          {customTemplates.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <BookmarkPlus className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Your Templates</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {customTemplates.map((t, i) => (
                  <div key={i} className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-3 flex-col gap-1 bg-background/80 hover:bg-background w-full"
                      onClick={() => {
                        Object.entries(t.values).forEach(([key, value]) => setForm(key, value));
                        toast.success(`Template "${t.name}" loaded!`);
                      }}
                    >
                      <span className="text-base">{t.emoji}</span>
                      <span className="font-medium truncate w-full text-center">{t.name}</span>
                    </Button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeCustomTemplate(i); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Draft Auto-Save Banner */}
      <AnimatePresence>
        {showDraftBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-800 dark:text-amber-200">You have an unsaved draft</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowDraftBanner(false)}>
                  Dismiss
                </Button>
                <Button size="sm" className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white" onClick={() => {
                  const draft = loadDraft();
                  if (draft) {
                    Object.entries(draft).forEach(([key, value]) => setForm(key, value as string));
                    toast.success('Draft restored!');
                  }
                  setShowDraftBanner(false);
                }}>
                  Restore Draft
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Details */}
        <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow duration-300 gradient-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
                <Layers className="w-4 h-4 text-white" />
              </div>
              Product Details
            </CardTitle>
            <CardDescription className="text-xs">Tell us about the product or business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName" className="text-xs font-medium">
                  Product/Business Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="productName"
                  placeholder="e.g., GlowSkin Vitamin C Serum"
                  value={form.productName}
                  onChange={(e) => setForm('productName', e.target.value)}
                  required
                  className="h-10 input-glow-focus focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productCategory" className="text-xs font-medium">
                  Category <span className="text-rose-500">*</span>
                </Label>
                <Select value={form.productCategory} onValueChange={(v) => setForm('productCategory', v)}>
                  <SelectTrigger className="h-10 input-glow-focus focus:ring-2 focus:ring-orange-500/20"><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    {[
                      { v: 'skincare', l: 'Skincare / Beauty' },
                      { v: 'fitness', l: 'Fitness / Health' },
                      { v: 'tech_gadgets', l: 'Tech / Gadgets' },
                      { v: 'fashion', l: 'Fashion / Apparel' },
                      { v: 'food_beverage', l: 'Food & Beverage' },
                      { v: 'home_living', l: 'Home & Living' },
                      { v: 'education', l: 'Education / Courses' },
                      { v: 'saas', l: 'SaaS / Software' },
                      { v: 'local_service', l: 'Local Service' },
                      { v: 'personal_brand', l: 'Personal Brand' },
                      { v: 'other', l: 'Other' },
                    ].map(c => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Business Type</Label>
              <Select value={form.businessType} onValueChange={(v) => setForm('businessType', v)}>
                <SelectTrigger className="h-10 input-glow-focus focus:ring-2 focus:ring-orange-500/20"><SelectValue placeholder="Select business type" /></SelectTrigger>
                <SelectContent>
                  {[
                    { v: 'd2c', l: 'D2C Brand' },
                    { v: 'local_business', l: 'Local Business' },
                    { v: 'creator', l: 'Creator / Influencer' },
                    { v: 'saas', l: 'SaaS Tool' },
                    { v: 'agency', l: 'Marketing Agency' },
                    { v: 'ecommerce', l: 'E-commerce Store' },
                  ].map(c => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyBenefits" className="text-xs font-medium">Key Benefits / USPs</Label>
              <Textarea
                id="keyBenefits"
                placeholder="e.g., Reduces dark spots in 2 weeks, 100% natural ingredients, Dermatologist tested"
                value={form.keyBenefits}
                onChange={(e) => setForm('keyBenefits', e.target.value)}
                rows={2}
                className="text-sm resize-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </CardContent>
        </Card>

        {/* Target & Platform */}
        <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow duration-300 gradient-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center shadow-sm">
                <Target className="w-4 h-4 text-white" />
              </div>
              Target & Platform
            </CardTitle>
            <CardDescription className="text-xs">Who are you reaching and where?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-xs font-medium">
                Target Audience <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="targetAudience"
                placeholder="e.g., Women aged 25-35 who are skincare enthusiasts and follow beauty influencers"
                value={form.targetAudience}
                onChange={(e) => setForm('targetAudience', e.target.value)}
                rows={2}
                required
                className="text-sm resize-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm('platform', v)}>
                  <SelectTrigger className="h-10 focus:ring-2 focus:ring-orange-500/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[
                      { v: 'instagram_reels', l: 'Instagram Reels', icon: Instagram, color: 'text-pink-500' },
                      { v: 'instagram_ads', l: 'Instagram Ads', icon: Instagram, color: 'text-pink-500' },
                      { v: 'tiktok', l: 'TikTok', icon: Video, color: 'text-foreground' },
                      { v: 'youtube_shorts', l: 'YouTube Shorts', icon: Video, color: 'text-red-500' },
                      { v: 'facebook_ads', l: 'Facebook Ads', icon: Users, color: 'text-blue-500' },
                    ].map(p => (
                      <SelectItem key={p.v} value={p.v}>
                        <span className="flex items-center gap-2"><p.icon className={`w-4 h-4 ${p.color}`} />{p.l}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Feature 1: Platform Tips */}
              {form.platform && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-xl bg-muted/20 border border-border/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Platform Tips</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                    {(() => {
                      const tips: Record<string, Array<{ label: string; value: string }>> = {
                        instagram_reels: [
                          { label: 'Hook Length', value: '< 3 sec video' },
                          { label: 'Caption Limit', value: '2,200 chars' },
                          { label: 'Hashtags', value: '3-5 recommended' },
                          { label: 'Best Time', value: '9AM-11AM' },
                        ],
                        instagram_ads: [
                          { label: 'Hook Length', value: '< 3 sec video' },
                          { label: 'Caption Limit', value: '125 chars ideal' },
                          { label: 'CTA', value: 'Shop Now / Learn More' },
                          { label: 'Format', value: 'Square or Vertical' },
                        ],
                        tiktok: [
                          { label: 'Hook Length', value: '< 2 sec critical' },
                          { label: 'Caption Limit', value: '150 chars optimal' },
                          { label: 'Hashtags', value: '3-5 trending' },
                          { label: 'Best Time', value: '7PM-11PM' },
                        ],
                        youtube_shorts: [
                          { label: 'Hook Length', value: '< 5 sec' },
                          { label: 'Duration', value: '15-60 sec ideal' },
                          { label: 'CTA', value: 'Subscribe / Comment' },
                          { label: 'Format', value: '9:16 vertical' },
                        ],
                        facebook_ads: [
                          { label: 'Hook Length', value: '< 3 sec video' },
                          { label: 'Primary Text', value: '125 chars' },
                          { label: 'Headline', value: '25-40 chars' },
                          { label: 'CTA', value: 'Shop Now / Sign Up' },
                        ],
                      };
                      return (tips[form.platform] || []).map(tip => (
                        <div key={tip.label} className="flex justify-between">
                          <span className="font-medium">{tip.label}</span>
                          <span className="text-foreground/70">{tip.value}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </motion.div>
              )}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Tone</Label>
                <Select value={form.tone} onValueChange={(v) => setForm('tone', v)}>
                  <SelectTrigger className="h-10 focus:ring-2 focus:ring-orange-500/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[
                      { v: 'casual', l: 'Casual & Friendly' },
                      { v: 'excited', l: 'Excited & Energetic' },
                      { v: 'storytelling', l: 'Storytelling & Relatable' },
                      { v: 'professional', l: 'Professional & Trustworthy' },
                      { v: 'funny', l: 'Funny & Witty' },
                      { v: 'minimalist', l: 'Minimalist & Clean' },
                      { v: 'luxury', l: 'Luxury & Aspirational' },
                    ].map(t => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Tone Preview */}
              {form.tone && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 flex-wrap"
                >
                  <span className="text-[10px] text-muted-foreground font-medium mr-1">Preview:</span>
                  {[
                    { tone: 'casual', emoji: '👋', sample: '"Hey besties! So I tried this and omg..."', color: 'text-orange-600 dark:text-orange-400' },
                    { tone: 'excited', emoji: '🔥', sample: '"YOU NEED THIS! I\'m literally obsessed!"', color: 'text-rose-600 dark:text-rose-400' },
                    { tone: 'storytelling', emoji: '📖', sample: '"Last month, I was struggling with... then I found..."', color: 'text-pink-600 dark:text-pink-400' },
                    { tone: 'professional', emoji: '💼', sample: '"After extensive testing, here\'s my professional assessment..."', color: 'text-green-600 dark:text-green-400' },
                    { tone: 'funny', emoji: '😂', sample: '"POV: You finally found the one... product that actually works."', color: 'text-amber-600 dark:text-amber-400' },
                    { tone: 'minimalist', emoji: '✨', sample: '"Simple. Effective. This changed everything."', color: 'text-zinc-600 dark:text-zinc-400' },
                    { tone: 'luxury', emoji: '💎', sample: '"Discover the art of [benefit]. This isn\'t just a product—it\'s a statement."', color: 'text-purple-600 dark:text-purple-400' },
                  ]
                    .filter(t => t.tone === form.tone)
                    .map(t => (
                      <div key={t.tone} className={`tone-preview-chip bg-muted/40 ${t.color} active`}>
                        <span>{t.emoji}</span>
                        <span className="italic">"{t.sample}"</span>
                      </div>
                    ))}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brand Voice */}
        <Card className="border border-border/30 shadow-sm hover:shadow-md transition-shadow duration-300 gradient-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
                <Palette className="w-4 h-4 text-white" />
              </div>
              Brand Voice
              <Badge variant="outline" className="ml-auto text-[10px]">Optional</Badge>
            </CardTitle>
            <CardDescription className="text-xs">Customize the personality of your content</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="brandVoice"
              placeholder="e.g., Speak like a cool big sister giving skincare advice. Use Gen-Z friendly language."
              value={form.brandVoice}
              onChange={(e) => setForm('brandVoice', e.target.value)}
              rows={2}
              className="text-sm resize-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </CardContent>
        </Card>

        {/* Submit + Save as Template */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 pb-4">
          <MagneticButton className="w-full sm:w-auto">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Button
              type="submit"
              size="lg"
              disabled={isGenerating}
              className="w-full sm:w-auto px-10 py-6 text-base font-semibold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-xl shadow-orange-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 group"
            >
              {isGenerating ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating Content Pack...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />Generate Content Pack</>
              )}
            </Button>
          </motion.div>
          </MagneticButton>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={saveAsTemplate}
              className="flex-1 sm:flex-none"
            >
              <BookmarkPlus className="w-4 h-4 mr-1.5" />Save as Template
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { store.resetForm(); toast.success('Form cleared'); }}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground sm:ml-2">16 pieces of content in one click</p>
          <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1 sm:ml-2">
            <Keyboard className="w-3 h-3" />Press Ctrl+Enter to generate
          </p>
        </div>

        {/* Generating Animation - Enhanced */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border border-orange-200/50 dark:border-orange-800/30 shadow-lg bg-gradient-to-r from-orange-50/80 to-rose-50/80 dark:from-orange-950/20 dark:to-rose-950/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center animate-pulse shadow-lg shadow-orange-500/30">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Creating your UGC content pack...</h4>
                      <p className="text-[11px] text-muted-foreground">AI is crafting authentic ad content</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Analyzing product & audience', icon: Layers },
                      { label: 'Crafting attention hooks', icon: Zap },
                      { label: 'Writing ad scripts', icon: Video },
                      { label: 'Generating CTAs & captions', icon: MessageSquare },
                    ].map((step, i) => (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.5 }}
                        className="flex items-center gap-2.5"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center shadow-sm">
                          <step.icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs text-muted-foreground flex-1">{step.label}</span>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 className="w-3 h-3 text-orange-500" />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="mt-4 text-center"
                  >
                    <p className="text-[11px] text-orange-500 font-medium animate-pulse">This usually takes 15-30 seconds...</p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Prompt Library Dialog */}
      <PromptLibraryDialog open={showPromptLibrary} onOpenChange={setShowPromptLibrary} />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PROMPT LIBRARY DATA
   ═══════════════════════════════════════════════════════════════════════ */
const PROMPT_TEMPLATES = [
  { emoji: '❓', title: 'The Question Hook', desc: 'Start with a relatable question that stops the scroll', type: 'Hook', difficulty: 'Beginner', borderColor: 'border-l-orange-400' },
  { emoji: '💥', title: 'The Bold Claim', desc: 'Make a surprising statement that demands attention', type: 'Hook', difficulty: 'Intermediate', borderColor: 'border-l-orange-500' },
  { emoji: '📖', title: 'The Story Opener', desc: 'Open with a personal anecdote or experience', type: 'Hook', difficulty: 'Beginner', borderColor: 'border-l-orange-400' },
  { emoji: '🎯', title: 'Problem-Agitate-Solution', desc: 'Present the problem, amplify the pain, then reveal your product as the answer', type: 'Script', difficulty: 'Intermediate', borderColor: 'border-l-rose-400' },
  { emoji: '🔄', title: 'Before-After Transformation', desc: 'Show the before state, introduce the product, reveal the after', type: 'Script', difficulty: 'Beginner', borderColor: 'border-l-rose-400' },
  { emoji: '⭐', title: 'Social Proof Testimonial', desc: 'Frame the script as a genuine testimonial with specific results', type: 'Script', difficulty: 'Advanced', borderColor: 'border-l-rose-500' },
  { emoji: '🤝', title: 'The Soft CTA', desc: 'Gentle nudge to check out the product without being pushy', type: 'CTA', difficulty: 'Beginner', borderColor: 'border-l-pink-400' },
  { emoji: '⏰', title: 'Urgency CTA', desc: 'Create FOMO with limited time offer or scarcity', type: 'CTA', difficulty: 'Intermediate', borderColor: 'border-l-pink-500' },
  { emoji: '💬', title: 'Question CTA', desc: 'End with an engaging question to drive comments and saves', type: 'CTA', difficulty: 'Beginner', borderColor: 'border-l-pink-400' },
  { emoji: '📝', title: 'Storytelling Caption', desc: 'Tell a mini-story that connects emotionally with the audience', type: 'Caption', difficulty: 'Intermediate', borderColor: 'border-l-amber-400' },
  { emoji: '#️⃣', title: 'Hashtag-Rich Caption', desc: 'Maximum visibility caption optimized for discovery', type: 'Caption', difficulty: 'Beginner', borderColor: 'border-l-amber-400' },
  { emoji: '✨', title: 'Minimalist Caption', desc: 'Short, punchy, let the visuals do the talking', type: 'Caption', difficulty: 'Beginner', borderColor: 'border-l-amber-400' },
];

const TYPE_COLORS: Record<string, string> = {
  Hook: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Script: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  CTA: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Caption: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};
const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

function PromptLibraryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const handleCopy = async (template: typeof PROMPT_TEMPLATES[0]) => {
    try {
      await navigator.clipboard.writeText(`${template.title}: ${template.desc}`);
      toast.success(`"${template.title}" copied to clipboard!`);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-orange-500" />
            Prompt Library
          </DialogTitle>
          <DialogDescription>Browse proven prompt frameworks. Click any card to copy it to your clipboard.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh] pr-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROMPT_TEMPLATES.map((template) => (
              <motion.button
                key={template.title}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleCopy(template)}
                className={`text-left rounded-xl border border-border/40 p-4 hover:bg-muted/50 hover:border-orange-200 dark:hover:border-orange-800/30 transition-all duration-200 border-l-4 ${template.borderColor} bg-card group`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{template.emoji}</span>
                    <h4 className="font-semibold text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{template.title}</h4>
                  </div>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{template.desc}</p>
                <div className="flex items-center gap-1.5">
                  <Badge className={`text-[10px] px-2 py-0 border-0 ${TYPE_COLORS[template.type]}`}>{template.type}</Badge>
                  <Badge className={`text-[10px] px-2 py-0 border-0 ${DIFFICULTY_COLORS[template.difficulty]}`}>{template.difficulty}</Badge>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
