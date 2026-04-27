'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useUGCStore } from '@/lib/store';
import { getFavorites, setFavorites, getRatings, setRatings, getCustomTemplates, setCustomTemplates } from '@/lib/storage';
import { getContentStats, formatDuration, calculateContentScore } from '@/lib/utils';
import { ActivityItem, getActivityFeed, addActivityItem, formatTimeAgo } from '@/lib/activity';
import { useDraftAutoSave, loadDraft, clearDraft } from '@/lib/draft';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useSpringCounter } from '@/hooks/useSpringCounter';
import { useOnboarding, ONBOARDING_STEPS } from '@/hooks/useOnboarding';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { BackgroundOrbs, FloatingParticles } from '@/components/Background';
import { HeroView } from '@/components/HeroView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnimatedStat } from '@/components/AnimatedStat';
import { QualityScoreBadge } from '@/components/QualityScore';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcuts';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { TiltCard, Confetti, MagneticButton, RippleButton } from '@/components/Effects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sparkles,
  Megaphone,
  Video,
  Instagram,
  Target,
  Users,
  Copy,
  Check,
  Trash2,
  ArrowLeft,
  Zap,
  TrendingUp,
  BookOpen,
  Plus,
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  Download,
  Layers,
  Palette,
  FileText,
  Clock,
  BarChart3,
  Lightbulb,
  Quote,
  Eye,
  Star,
  Rocket,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  BookmarkPlus,
  X,
  CopyPlus,
  Timer,
  Hash,
  FileDown,
  ChevronRight,
  ArrowRight,
  Heart,
  ShieldCheck,
  Pencil,
  ArrowUp,
  ArrowUpDown,
  Save,
  CheckSquare,
  Square,
  Inbox,
  FileQuestion,
  Keyboard,
  BookMarked,
  Columns2,
  GripVertical,
  ChevronLeft,
  MapPin,
  History,
  Share2,
  PenLine,
  Activity,
  Command,
  RotateCcw,
  Gauge,
  CalendarDays,
  FlaskConical,
  CheckCircle,
  MousePointer2,
} from 'lucide-react';

// ─── Page Views ───────────────────────────────────────────────────
// (All utility functions, hooks, and components have been extracted to their respective modules)

const PAGE_VIEWS = ['hero', 'generator', 'results', 'library'] as const;
type PageView = (typeof PAGE_VIEWS)[number];

// ─── MAIN APP ─────────────────────────────────────────────────────────
export default function Home() {
  const store = useUGCStore();
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const onboarding = useOnboarding();

  useEffect(() => {
    setMounted(true);
    loadSavedPacks();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  const loadSavedPacks = async () => {
    try {
      const res = await fetch('/api/ugc');
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((pack: any) => ({
          ...pack,
          contents: pack.contents.map((c: any) => ({
            id: c.id,
            type: c.type,
            label: c.label,
            content: c.content,
            platform: c.platform,
          })),
        }));
        store.setSavedPacks(mapped);
      }
    } catch (err) {
      console.error('Failed to load packs:', err);
    }
  };

  const handleGenerate = async () => {
    const { form } = store;
    if (!form.productName || !form.productCategory || !form.targetAudience) {
      toast.error('Please fill in all required fields');
      return;
    }
    store.setIsGenerating(true);
    try {
      const res = await fetch('/api/ugc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        const pack = data.data;
        store.setCurrentPack({
          id: pack.id,
          productName: pack.productName,
          productCategory: pack.productCategory,
          businessType: pack.businessType,
          targetAudience: pack.targetAudience,
          platform: pack.platform,
          tone: pack.tone,
          brandVoice: pack.brandVoice,
          keyBenefits: pack.keyBenefits,
          createdAt: pack.createdAt,
          contents: pack.contents.map((c: any) => ({
            id: c.id,
            type: c.type,
            label: c.label,
            content: c.content,
            platform: c.platform,
          })),
        });
        store.setActiveView('results');
        await loadSavedPacks();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
        toast.success('Content pack generated successfully!');
        addActivityItem({ type: 'generated', productName: pack.productName });
        clearDraft();
      } else {
        toast.error(data.error || 'Failed to generate content');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      store.setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/ugc?id=${id}`, { method: 'DELETE' });
      await loadSavedPacks();
      if (store.currentPack?.id === id) {
        store.setCurrentPack(null);
        store.setActiveView('library');
      }
      toast.success('Content pack deleted');
      addActivityItem({ type: 'deleted', productName: '' });
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const exportPack = useCallback((pack: any, format: 'txt' | 'md' = 'txt') => {
    const hooks = pack.contents.filter((c: any) => c.type === 'hook');
    const scripts = pack.contents.filter((c: any) => c.type === 'script');
    const ctas = pack.contents.filter((c: any) => c.type === 'cta');
    const captions = pack.contents.filter((c: any) => c.type === 'caption');

    let output: string;
    let filename: string;
    let mimeType: string;

    if (format === 'md') {
      output = `# UGC Ad Content Pack\n\n`;
      output += `> Generated by **UGC Ad Studio** | ${pack.createdAt ? new Date(pack.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}\n\n`;
      output += `---\n\n`;
      output += `| Detail | Value |\n|--------|-------|\n`;
      output += `| **Product** | ${pack.productName} |\n`;
      output += `| **Category** | ${pack.productCategory.replace(/_/g, ' ')} |\n`;
      output += `| **Platform** | ${pack.platform} |\n`;
      output += `| **Tone** | ${pack.tone} |\n`;
      output += `| **Audience** | ${pack.targetAudience} |\n`;
      if (pack.keyBenefits) output += `| **Benefits** | ${pack.keyBenefits} |\n`;
      output += `\n---\n\n`;
      output += `## 🪝 Hooks (${hooks.length})\n\n`;
      hooks.forEach((h: any, i: number) => { output += `### ${i + 1}. ${h.label}\n\n${h.content}\n\n---\n\n`; });
      output += `## 🎬 Ad Scripts (${scripts.length})\n\n`;
      scripts.forEach((s: any, i: number) => { output += `### ${i + 1}. ${s.label}\n\n\`\`\`\n${s.content}\n\`\`\`\n\n---\n\n`; });
      output += `## 📣 Calls to Action (${ctas.length})\n\n`;
      ctas.forEach((c: any, i: number) => { output += `### ${i + 1}. ${c.label}\n\n${c.content}\n\n---\n\n`; });
      output += `## 💬 Captions (${captions.length})\n\n`;
      captions.forEach((c: any, i: number) => { output += `### ${i + 1}. ${c.label}\n\n${c.content}\n\n`; });
      output += `\n---\n*Generated by UGC Ad Studio*\n`;
      filename = `ugc-${pack.productName.replace(/\s+/g, '-').toLowerCase()}.md`;
      mimeType = 'text/markdown';
    } else {
      output = `# ═══════════════════════════════════════════\n`;
      output += `#  UGC AD CONTENT PACK\n`;
      output += `# ═══════════════════════════════════════════\n\n`;
      output += `  Product:    ${pack.productName}\n`;
      output += `  Category:   ${pack.productCategory.replace(/_/g, ' ')}\n`;
      output += `  Platform:   ${pack.platform}\n`;
      output += `  Tone:       ${pack.tone}\n`;
      output += `  Audience:   ${pack.targetAudience}\n`;
      output += `  Generated:  ${pack.createdAt ? new Date(pack.createdAt).toLocaleDateString() : 'Today'}\n`;
      if (pack.keyBenefits) output += `  Benefits:   ${pack.keyBenefits}\n`;
      output += `\n${'═'.repeat(50)}\n\n`;
      output += `## HOOKS (${hooks.length})\n${'─'.repeat(30)}\n\n`;
      hooks.forEach((h: any, i: number) => { output += `${i + 1}. [${h.label}]\n${h.content}\n\n`; });
      output += `\n${'═'.repeat(50)}\n\n`;
      output += `## AD SCRIPTS (${scripts.length})\n${'─'.repeat(30)}\n\n`;
      scripts.forEach((s: any, i: number) => { output += `${i + 1}. [${s.label}]\n${s.content}\n\n`; });
      output += `\n${'═'.repeat(50)}\n\n`;
      output += `## CALLS TO ACTION (${ctas.length})\n${'─'.repeat(30)}\n\n`;
      ctas.forEach((c: any, i: number) => { output += `${i + 1}. [${c.label}]\n${c.content}\n\n`; });
      output += `\n${'═'.repeat(50)}\n\n`;
      output += `## CAPTIONS (${captions.length})\n${'─'.repeat(30)}\n\n`;
      captions.forEach((c: any, i: number) => { output += `${i + 1}. [${c.label}]\n${c.content}\n\n`; });
      output += `\n${'═'.repeat(50)}\n  Generated by UGC Ad Studio\n`;
      filename = `ugc-${pack.productName.replace(/\s+/g, '-').toLowerCase()}.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${format.toUpperCase()}!`);
    addActivityItem({ type: 'exported', productName: pack.productName });
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-2xl shadow-orange-500/30 loading-logo-bounce">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <span className="text-base font-semibold loading-shimmer-text">Loading UGC Ad Studio</span>
          <div className="flex items-center gap-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </motion.div>
      </div>
    );
  }

  const totalGenerated = store.savedPacks.reduce((acc: number, p: any) => acc + (p.contents?.length || 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="gradient-mesh" />
      {/* Scroll Progress Bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      <BackgroundOrbs />
      <FloatingParticles />

      {/* Confetti Celebration */}
      {showConfetti && <Confetti />}

      {/* Header - Enhanced with subtle bottom gradient */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40 header-gradient-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => store.setActiveView('hero')}
              className="flex items-center gap-2.5 hover:opacity-80 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight">UGC Ad Studio</h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5 font-medium">AI-Powered Content Generator</p>
              </div>
            </button>
            <nav className="items-center gap-1.5 hidden sm:flex">
              {[
                { view: 'generator' as PageView, label: 'Create', icon: Plus },
                { view: 'library' as PageView, label: 'Library', icon: BookOpen },
              ].map(({ view, label, icon: Icon }) => (
                <button
                  key={view}
                  onClick={() => store.setActiveView(view)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    store.activeView === view
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm shadow-orange-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
              <div className="w-px h-6 bg-border/60 mx-1 hidden sm:block" />
              <ThemeToggle />
            </nav>
            {/* Mobile-only theme toggle */}
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {store.activeView === 'hero' && <HeroView key="hero" totalGenerated={totalGenerated} totalPacks={store.savedPacks.length} onStartTour={onboarding.startTour} />}
          {store.activeView === 'generator' && (
            <GeneratorView key="generator" store={store} onGenerate={handleGenerate} />
          )}
          {store.activeView === 'results' && (
            <ResultsView
              key="results"
              pack={store.currentPack}
              onCopy={handleCopy}
              onExport={exportPack}
              onBack={() => store.setActiveView('generator')}
            />
          )}
          {store.activeView === 'library' && (
            <LibraryView
              key="library"
              packs={store.savedPacks}
              onDelete={handleDelete}
              onExport={exportPack}
              onCopy={handleCopy}
              onSelect={(pack) => { store.setCurrentPack(pack); store.setActiveView('results'); }}
              onGenerateNew={() => store.setActiveView('generator')}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Wave SVG Footer Separator */}
      <div className="mt-auto relative">
        <svg
          className="w-full h-16 sm:h-20 block"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path
            className="fill-foreground/[0.03] dark:fill-foreground/[0.02]"
            d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1440,0 1440,40 L1440,80 L0,80 Z"
          />
          <path
            fill="url(#wave-grad)"
            d="M0,50 C200,20 400,70 600,45 C800,20 1000,65 1200,45 C1350,30 1440,50 1440,50 L1440,80 L0,80 Z"
            opacity="0.6"
          />
          <path
            className="fill-foreground/[0.04] dark:fill-foreground/[0.03]"
            d="M0,55 C240,35 480,70 720,50 C960,30 1200,65 1440,55 L1440,80 L0,80 Z"
          />
        </svg>
      </div>

      {/* Footer - Enhanced */}
      <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-foreground block text-sm">UGC Ad Studio</span>
                <span className="text-xs">AI-Powered Content Creation</span>
              </div>
            </div>
            {/* Features */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5 text-orange-500" /> Ready-to-use ad content</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Proven frameworks</span>
            </div>
            {/* Stats */}
            <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> Built for creators</span>
              <span className="text-border">|</span>
              <span>{totalGenerated} pieces generated</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      {store.activeView !== 'results' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-mobile-nav">
          <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/40 px-2 pb-[env(safe-area-inset-bottom,0px)] pt-2">
            <div className="flex items-center justify-around">
              {[
                { view: 'hero' as PageView, icon: Sparkles, label: 'Home' },
                { view: 'generator' as PageView, icon: Plus, label: 'Create' },
                { view: 'library' as PageView, icon: BookOpen, label: 'Library' },
              ].map(({ view, icon: Icon, label }) => {
                const isActive = store.activeView === view;
                return (
                  <motion.button
                    key={view}
                    onClick={() => store.setActiveView(view)}
                    whileTap={{ scale: 0.92 }}
                    className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-200 ${
                      isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-nav-indicator"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 shadow-lg shadow-orange-500/25"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" />
                    <span className="text-[10px] font-medium relative z-10">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Scroll-to-Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="scroll-top-btn fixed bottom-6 right-6 z-50 w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25 flex items-center justify-center hover:shadow-xl hover:shadow-orange-500/35 hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Onboarding Overlay */}
      {onboarding.showOnboarding && (
        <OnboardingOverlay
          currentStep={onboarding.currentStep}
          onNext={onboarding.nextStep}
          onPrev={onboarding.prevStep}
          onDismiss={onboarding.dismissOnboarding}
        />
      )}
    </div>
  );
}

/* HERO VIEW extracted to /src/components/HeroView.tsx */

/* GENERATOR VIEW extracted to /src/components/GeneratorView.tsx */
import { GeneratorView } from '@/components/GeneratorView';
import { ResultsView } from '@/components/ResultsView';
import { LibraryView } from '@/components/LibraryView';


/* RESULTS VIEW extracted to /src/components/ResultsView.tsx */
/* LIBRARY VIEW extracted to /src/components/LibraryView.tsx */
