'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useUGCStore } from '@/lib/store';
import { getFavorites, setFavorites, getRatings, setRatings } from '@/lib/storage';
import { getContentStats, formatDuration, calculateContentScore } from '@/lib/utils';
import { QualityScoreBadge } from '@/components/QualityScore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  ArrowLeft, Zap, Video, Send, MessageSquare, Copy, Check, Star,
  ThumbsUp, ThumbsDown, Eye, FileText, Timer, Hash, Download,
  RefreshCw, FileDown, GripVertical, Share2, Pencil, Save,
  Loader2, FlaskConical, Gauge, BarChart3, CheckCircle, Columns2,
  RotateCcw, Sparkles, FileQuestion, History, Type, SmilePlus, AlignLeft,
  Search, X, StickyNote, Pin, Clock,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   RESULTS VIEW (Enhanced with ratings, word counts, export options)
   ═══════════════════════════════════════════════════════════════════════ */
interface ResultsViewProps {
  pack: any;
  onCopy: (text: string) => void;
  onExport: (pack: any, format?: 'txt' | 'md') => void;
  onBack: () => void;
}

export function ResultsView({ pack, onCopy, onExport, onBack }: ResultsViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingType, setRegeneratingType] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<Record<string, 'up' | 'down'>>({});
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(new Set(['hook', 'script', 'cta', 'caption']));
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showABTest, setShowABTest] = useState(false);
  const [abTestType, setABTestType] = useState<string | null>(null);
  const [abVariants, setABVariants] = useState<{ a: any[]; b: any[] } | null>(null);
  const [abSelected, setABSelected] = useState<'a' | 'b' | null>(null);
  const [abGenerating, setABGenerating] = useState(false);

  // Feature 4: Undo history for content editing
  const [editHistory, setEditHistory] = useState<Record<string, string>>({});

  // Round 12: Content version history
  const [contentVersions, setContentVersions] = useState<Record<string, Array<{ content: string; timestamp: number }>>>({});
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null);

  // Round 12: Copy format options
  const [copyFormatItem, setCopyFormatItem] = useState<any>(null);
  const [showCopyFormat, setShowCopyFormat] = useState(false);

  // Content search within results
  const [contentSearch, setContentSearch] = useState('');

  // Pack notes (sticky notes)
  const [packNotes, setPackNotes] = useState('');
  const notesDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Content pinning state
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set());

  // Emoji reactions state
  const [reactions, setReactions] = useState<Record<string, string>>({});

  const store = useUGCStore();

  // Keyboard shortcuts: Escape → go back, Ctrl+E → toggle export menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setShowExportMenu(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  // Load favorites and ratings from localStorage on mount
  useEffect(() => {
    const savedFavs = getFavorites();
    if (savedFavs.size > 0) setFavorites(savedFavs);

    const savedRatings = getRatings();
    if (Object.keys(savedRatings).length > 0) setRatings(savedRatings);

    // Load pinned items from localStorage
    try { const savedPins = localStorage.getItem('ugc-studio-pins'); if (savedPins) setPinnedItems(new Set(JSON.parse(savedPins))); } catch {}

    // Load reactions from localStorage
    try { const savedReactions = localStorage.getItem('ugc-studio-reactions'); if (savedReactions) setReactions(JSON.parse(savedReactions)); } catch {}
  }, []);

  // Save favorites to localStorage on change
  useEffect(() => {
    setFavorites(favorites);
  }, [favorites]);

  // Save ratings to localStorage on change
  useEffect(() => {
    setRatings(ratings);
  }, [ratings]);

  // Save pinned items to localStorage on change
  useEffect(() => { try { localStorage.setItem('ugc-studio-pins', JSON.stringify([...pinnedItems])); } catch {} }, [pinnedItems]);

  // Save reactions to localStorage on change
  useEffect(() => { try { localStorage.setItem('ugc-studio-reactions', JSON.stringify(reactions)); } catch {} }, [reactions]);

  // Load pack notes from localStorage on mount
  useEffect(() => {
    if (!pack?.id) return;
    try {
      const saved = localStorage.getItem(`ugc-pack-notes-${pack.id}`);
      if (saved) setPackNotes(saved);
    } catch { /* ignore */ }
  }, [pack?.id]);

  // Save pack notes with debounce on change
  const handleNotesChange = useCallback((value: string) => {
    if (value.length > 500) return;
    setPackNotes(value);
    if (!pack?.id) return;
    if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
    notesDebounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`ugc-pack-notes-${pack.id}`, value);
      } catch { /* ignore */ }
    }, 500);
  }, [pack?.id]);

  const updatePack = (newItems: any[], type: string) => {
    if (!store.currentPack) return;
    store.setCurrentPack({
      ...store.currentPack,
      contents: [...store.currentPack.contents.filter((c: any) => c.type !== type), ...newItems],
    });
  };

  const handleRegenerate = async (type: string) => {
    if (!store.currentPack) return;
    setRegeneratingType(type);
    try {
      const res = await fetch('/api/ugc/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, productName: store.currentPack.productName,
          productCategory: store.currentPack.productCategory,
          targetAudience: store.currentPack.targetAudience,
          platform: store.currentPack.platform, tone: store.currentPack.tone,
          brandVoice: store.currentPack.brandVoice, keyBenefits: store.currentPack.keyBenefits,
          existingLabel: store.currentPack.contents.find((c: any) => c.type === type)?.label,
        }),
      });
      const data = await res.json();
      if (data.success) {
        updatePack(data.data, type);
        toast.success(`${type === 'hook' ? 'Hooks' : type === 'script' ? 'Scripts' : type === 'cta' ? 'CTAs' : 'Captions'} regenerated!`);
      } else { toast.error('Failed to regenerate'); }
    } catch { toast.error('Something went wrong'); }
    finally { setRegeneratingType(null); }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.success('Removed from favorites'); }
      else { next.add(id); toast.success('Added to favorites!'); }
      return next;
    });
  };

  const rateContent = (id: string, rating: 'up' | 'down') => {
    setRatings(prev => {
      const current = prev[id];
      if (current === rating) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: rating };
    });
  };

  // Toggle pin on content items
  const togglePin = (id: string) => {
    setPinnedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.success('Unpinned'); }
      else { next.add(id); toast.success('Pinned to top!'); }
      return next;
    });
  };

  // Toggle emoji reaction on content items
  const toggleReaction = (id: string, emoji: string) => {
    setReactions(prev => {
      const current = prev[id];
      if (current === emoji) { const next = { ...prev }; delete next[id]; return next; }
      return { ...prev, [id]: emoji };
    });
  };

  // Sort items to show pinned items first
  const sortWithPins = (items: any[]) => {
    const pinned = items.filter(i => pinnedItems.has(i.id || i.label));
    const unpinned = items.filter(i => !pinnedItems.has(i.id || i.label));
    return [...pinned, ...unpinned];
  };

  // Feature 4: startEditing saves original content for undo
  const startEditing = (item: any) => {
    const itemId = item.id || item.label;
    setEditHistory(prev => ({ ...prev, [itemId]: item.content }));
    setEditingItemId(itemId);
    setEditContent(item.content);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditContent('');
  };

  const saveEditing = (itemId: string) => {
    if (!store.currentPack) return;
    const updatedContents = store.currentPack.contents.map((c: any) =>
      (c.id || c.label) === itemId ? { ...c, content: editContent } : c
    );
    store.setCurrentPack({ ...store.currentPack, contents: updatedContents });
    // Round 12: Save version snapshot
    setContentVersions(prev => {
      const currentVersions = prev[itemId] || [];
      const newVersions = [...currentVersions, { content: editContent, timestamp: Date.now() }];
      return { ...prev, [itemId]: newVersions.slice(-10) }; // Keep last 10
    });
    setEditingItemId(null);
    setEditContent('');
    toast.success('Content updated!');
  };

  // Round 12: Restore a version
  const restoreVersion = (itemId: string, version: { content: string; timestamp: number }) => {
    setEditContent(version.content);
    toast.info('Version restored');
  };

  // Round 12: Get improvement suggestions based on content
  const getImprovementTips = (item: any): string[] => {
    const tips: string[] = [];
    const content = item.content;
    const stats = getContentStats(content, item.type);
    const score = calculateContentScore(content, item.type);

    if (stats.words < 10) tips.push('💬 Consider expanding — short content may not resonate');
    if (stats.words > 50) tips.push('✂️ Try trimming — shorter hooks perform better');
    if (!content.includes('?') && item.type === 'hook') tips.push('❓ Add a question — hooks with questions get 2x engagement');
    if (!content.includes('!') && (item.type === 'cta' || item.type === 'hook')) tips.push('⚡ Add excitement — power words boost click-through rates');
    if (!/\d/.test(content)) tips.push('🔢 Add numbers — specific data increases credibility');
    const powerWords = ['amazing', 'proven', 'exclusive', 'limited', 'free', 'guaranteed', 'transform', 'secret', 'ultimate', 'effortless'];
    if (!powerWords.some(w => content.toLowerCase().includes(w))) tips.push('💪 Add power words — "proven", "exclusive", "transform" drive action');
    if (item.type === 'cta' && !content.toLowerCase().includes('link')) tips.push('🔗 Include a call-to-action link for better conversion');
    if (item.type === 'caption' && !content.includes('#')) tips.push('#️⃣ Add hashtags to increase discoverability');
    if (score.score < 40) tips.push('📊 Low quality score — focus on specificity and emotional triggers');

    return tips.length > 0 ? tips : ['✅ Great content! High quality score.'];
  };

  // Round 12: Copy with format
  const copyWithFormat = (item: any, format: 'plain' | 'emoji' | 'formatted') => {
    let text = item.content;
    if (format === 'emoji') {
      const emojiMap: Record<string, string> = {
        hook: '🪝', script: '🎬', cta: '👆', caption: '💬',
      };
      const prefix = emojiMap[item.type] || '✨';
      text = `${prefix} ${text}`;
    } else if (format === 'formatted') {
      const typeLabel = item.label || item.type;
      text = `**${typeLabel}**\n\n${text}`;
    }
    onCopy(text);
    setCopiedId(item.id || item.label);
    setTimeout(() => setCopiedId(null), 2000);
    setShowCopyFormat(false);
    setCopyFormatItem(null);
    toast.success(`Copied as ${format}!`);
  };

  if (!pack) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="border-2 border-dashed border-border/40 rounded-2xl p-12 max-w-md mx-auto">
          <FileQuestion className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4 breathing-icon" />
          <h3 className="text-lg font-semibold mb-2">No Content Pack Loaded</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Generate a content pack first to see your results here.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button onClick={onBack} className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/20">
              <Sparkles className="w-4 h-4 mr-2" />Go to Generator
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const activePack = store.currentPack || pack;
  const allHooks = activePack.contents.filter((c: any) => c.type === 'hook');
  const allScripts = activePack.contents.filter((c: any) => c.type === 'script');
  const allCtas = activePack.contents.filter((c: any) => c.type === 'cta');
  const allCaptions = activePack.contents.filter((c: any) => c.type === 'caption');

  // Content search filtering
  const searchLower = contentSearch.toLowerCase().trim();
  const hooks = searchLower
    ? allHooks.filter((c: any) => c.content.toLowerCase().includes(searchLower) || c.label.toLowerCase().includes(searchLower))
    : allHooks;
  const scripts = searchLower
    ? allScripts.filter((c: any) => c.content.toLowerCase().includes(searchLower) || c.label.toLowerCase().includes(searchLower))
    : allScripts;
  const ctas = searchLower
    ? allCtas.filter((c: any) => c.content.toLowerCase().includes(searchLower) || c.label.toLowerCase().includes(searchLower))
    : allCtas;
  const captions = searchLower
    ? allCaptions.filter((c: any) => c.content.toLowerCase().includes(searchLower) || c.label.toLowerCase().includes(searchLower))
    : allCaptions;

  const totalSearchMatches = hooks.length + scripts.length + ctas.length + captions.length;
  const totalOriginal = allHooks.length + allScripts.length + allCtas.length + allCaptions.length;

  const handleCopy = (id: string, text: string) => {
    onCopy(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const typeConfig: Record<string, { label: string; icon: any; gradient: string; badge: string; bg: string; border: string }> = {
    hook: { label: 'Hooks', icon: Zap, gradient: 'from-orange-400 to-orange-500', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', bg: 'bg-orange-50/50 dark:bg-orange-950/10', border: 'hover:border-orange-200 dark:hover:border-orange-800/30' },
    script: { label: 'Scripts', icon: Video, gradient: 'from-rose-400 to-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', bg: 'bg-rose-50/50 dark:bg-rose-950/10', border: 'hover:border-rose-200 dark:hover:border-rose-800/30' },
    cta: { label: 'CTAs', icon: Send, gradient: 'from-pink-400 to-pink-500', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300', bg: 'bg-pink-50/50 dark:bg-pink-950/10', border: 'hover:border-pink-200 dark:hover:border-pink-800/30' },
    caption: { label: 'Captions', icon: MessageSquare, gradient: 'from-amber-400 to-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', bg: 'bg-amber-50/50 dark:bg-amber-950/10', border: 'hover:border-amber-200 dark:hover:border-amber-800/30' },
  };

  const renderContentCard = (item: any, index: number, items: any[]) => {
    const config = typeConfig[item.type];
    const itemId = item.id || item.label;

    const handleDragStart = (e: React.DragEvent) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    };
    const handleDragEnd = () => {
      setDraggedIndex(null);
      setDragOverIndex(null);
    };
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverIndex(index);
    };
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === index) return;
      if (!store.currentPack) return;
      const newContents = [...store.currentPack.contents];
      const draggedItem = newContents.find((c: any) => (c.id || c.label) === (items[draggedIndex]?.id || items[draggedIndex]?.label));
      if (!draggedItem) return;
      const fromIdx = newContents.indexOf(draggedItem);
      const toItem = newContents.find((c: any) => (c.id || c.label) === (items[index]?.id || items[index]?.label));
      if (!toItem) return;
      const toIdx = newContents.indexOf(toItem);
      newContents.splice(fromIdx, 1);
      newContents.splice(toIdx, 0, draggedItem);
      store.setCurrentPack({ ...store.currentPack, contents: newContents });
      setDraggedIndex(null);
      setDragOverIndex(null);
      toast.success('Item reordered');
    };
    const isFav = favorites.has(itemId);
    const rating = ratings[itemId];
    const stats = getContentStats(item.content, item.type);

    return (
      <motion.div
        key={itemId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        {/* Drop indicator */}
        {dragOverIndex === index && draggedIndex !== index && (
          <div className="h-0.5 bg-gradient-to-r from-orange-400 to-rose-400 rounded-full mb-2 mx-4" />
        )}
        <Card
          className={`border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden card-shine dark-card-glow content-card-hover ${config.bg} neon-glow ${item.type === 'script' ? 'neon-glow-rose' : item.type === 'caption' ? 'neon-glow-amber' : ''} ${editingItemId === itemId ? 'ring-2 ring-orange-400/40' : ''} ${draggedIndex === index ? 'opacity-50 scale-[0.98]' : ''}`}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Gradient accent bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.gradient}`} />
          {isFav && (
            <div className="absolute top-2 right-2 z-10">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 drop-shadow-sm" />
            </div>
          )}
          {pinnedItems.has(itemId) && (
            <div className="absolute top-2 left-2 z-10">
              <Pin className="w-3 h-3 text-orange-500 fill-orange-500 rotate-45 drop-shadow-sm" />
            </div>
          )}
          <CardContent className="p-4 sm:p-5 pl-5 relative z-[2]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-6 h-6 rounded-md bg-gradient-to-br ${config.gradient} text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm`}>
                  {index + 1}
                </span>
                <Badge variant="secondary" className={`text-[11px] font-medium border-0 ${config.badge}`}>
                  {item.label}
                </Badge>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Drag handle */}
                <div className="shrink-0 h-7 w-7 flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors" title="Drag to reorder">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
                {/* Edit button */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => startEditing(item)}
                  className="shrink-0 h-7 w-7 p-0 rounded-md flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                  title="Edit content"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.button>
                {/* Rating buttons */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => rateContent(itemId, 'up')}
                  className="shrink-0 h-7 w-7 p-0 rounded-md flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                  title="Helpful"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${rating === 'up' ? 'text-green-500 fill-green-500' : 'text-muted-foreground'}`} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => rateContent(itemId, 'down')}
                  className="shrink-0 h-7 w-7 p-0 rounded-md flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Not helpful"
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${rating === 'down' ? 'text-red-400 fill-red-400' : 'text-muted-foreground'}`} />
                </motion.button>
                <div className="w-px h-4 bg-border/50 mx-0.5" />
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleFavorite(itemId)}
                  className="shrink-0 h-7 w-7 p-0 rounded-md flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                  title={isFav ? 'Unfavorite' : 'Favorite'}
                >
                  <Star className={`w-3.5 h-3.5 ${isFav ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => togglePin(itemId)}
                  className="shrink-0 h-7 w-7 p-0 rounded-md flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                  title={pinnedItems.has(itemId) ? 'Unpin' : 'Pin to top'}
                >
                  <Pin className={`w-3.5 h-3.5 ${pinnedItems.has(itemId) ? 'text-orange-500 fill-orange-500' : 'text-muted-foreground'}`} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setPreviewItem(item)}
                  className="shrink-0 h-7 w-7 p-0 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </motion.button>
                {/* Round 12: Copy with format options */}
                <Popover open={showCopyFormat && copyFormatItem?.id === itemId} onOpenChange={(open) => { if (!open) { setShowCopyFormat(false); setCopyFormatItem(null); } else { setCopyFormatItem(item); setShowCopyFormat(true); } }}>
                  <PopoverTrigger asChild>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => { setCopyFormatItem(item); setShowCopyFormat(true); }}
                      className="shrink-0 h-7 w-7 p-0 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
                      title="Copy"
                    >
                      {copiedId === itemId ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </motion.button>
                  </PopoverTrigger>
                  <PopoverContent className="w-44 p-1" side="top" align="start">
                    <p className="text-[10px] font-medium text-muted-foreground px-2 py-1">Copy as:</p>
                    <button
                      onClick={() => copyWithFormat(item, 'plain')}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-xs text-left"
                    >
                      <Type className="w-3.5 h-3.5 text-muted-foreground" />
                      Plain Text
                    </button>
                    <button
                      onClick={() => copyWithFormat(item, 'emoji')}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-xs text-left"
                    >
                      <SmilePlus className="w-3.5 h-3.5 text-muted-foreground" />
                      With Emojis
                    </button>
                    <button
                      onClick={() => copyWithFormat(item, 'formatted')}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors text-xs text-left"
                    >
                      <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
                      Formatted
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {editingItemId === itemId ? (
              <div className="space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="text-sm resize-none border-orange-300 dark:border-orange-700 focus:ring-2 focus:ring-orange-400/30 bg-orange-50/30 dark:bg-orange-950/10 input-glow-focus"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => saveEditing(itemId)} className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 h-8 px-3 text-xs">
                    <Save className="w-3.5 h-3.5 mr-1.5" />Save
                  </Button>
                  {/* Feature 4: Undo Button */}
                  <Button size="sm" variant="ghost" onClick={() => {
                    if (!editingItemId) return;
                    const original = editHistory[editingItemId];
                    if (original) {
                      setEditContent(original);
                      toast.info('Content reverted');
                    }
                  }} className="h-8 px-3 text-xs">
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />Undo
                  </Button>
                  {/* Round 12: History button */}
                  <Popover open={showVersionHistory === itemId && (contentVersions[itemId]?.length || 0) > 0} onOpenChange={(open) => { if (!open) setShowVersionHistory(null); else setShowVersionHistory(itemId); }}>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 px-3 text-xs">
                        <History className="w-3.5 h-3.5 mr-1" />History
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" side="top" align="start">
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        <p className="text-[10px] font-medium text-muted-foreground px-1">Version History</p>
                        {(contentVersions[itemId] || []).map((v, vi) => (
                          <button
                            key={vi}
                            onClick={() => restoreVersion(itemId, v)}
                            className="flex items-start gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted/60 text-left transition-colors text-xs"
                          >
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-px">
                              {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-muted-foreground line-clamp-2">{v.content.slice(0, 80)}...</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-8 px-3 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/85">
                {item.content}
              </div>
            )}
            {/* Quality Score + Stats bar */}
            <div className="mt-3 pt-2 border-t border-border/20 flex items-center justify-between gap-2">
              <QualityScoreBadge content={item.content} type={item.type} />
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground" title="Words">
                  <Hash className="w-3 h-3" />{stats.words}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground" title="Characters">
                  {stats.chars}
                </span>
                {stats.estimatedDuration && (
                  <span className="flex items-center gap-1 text-[10px] text-orange-500 font-medium" title="Estimated video duration">
                    <Timer className="w-3 h-3" />~{formatDuration(stats.estimatedDuration)}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground" title="Reading time">
                  <Clock className="w-3 h-3" />~{Math.max(1, Math.ceil(stats.words / 200))}min
                </span>
              </div>
            </div>
            {/* Feature 2: Character Limit Indicator */}
            <div className="mt-2 flex items-center gap-2">
              <div className="char-limit-bar flex-1">
                <div
                  className={`char-limit-fill ${stats.chars < 100 ? 'safe' : stats.chars < 200 ? 'warning' : 'danger'}`}
                  style={{ width: `${Math.min((stats.chars / 300) * 100, 100)}%` }}
                />
              </div>
              <span className={`text-[9px] font-medium ${stats.chars < 100 ? 'text-green-600 dark:text-green-400' : stats.chars < 200 ? 'text-orange-600 dark:text-orange-400' : 'text-red-500'}`}>
                {stats.chars < 100 ? 'Short' : stats.chars < 200 ? 'Medium' : 'Long'}
              </span>
            </div>
            {/* Improvement Suggestions */}
            {(() => {
              const tips = getImprovementTips(item);
              return tips.length > 0 && tips[0] !== '✅ Great content! High quality score.' ? (
                <div className="mt-2 p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/30 dark:border-amber-800/20">
                  <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 mb-1">💡 Suggestions</p>
                  <div className="space-y-0.5">
                    {tips.slice(0, 2).map((tip, ti) => (
                      <p key={ti} className="text-[10px] text-amber-600/80 dark:text-amber-400/70 leading-relaxed">{tip}</p>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
            {/* Emoji Reactions */}
            <div className="flex items-center gap-1 mt-1 pt-1.5 border-t border-border/10">
              {['🔥', '💡', '❤️', '⭐', '🎯'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(itemId, emoji)}
                  className={`text-xs px-1 py-0.5 rounded-md transition-all duration-150 ${reactions[itemId] === emoji ? 'bg-orange-100 dark:bg-orange-900/30 scale-110' : 'hover:bg-muted/50 opacity-50 hover:opacity-100'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const handleCopyAll = (type: string) => {
    const items = activePack.contents.filter((c: any) => c.type === type);
    const allText = items.map((item: any, i: number) => `${i + 1}. ${item.label}:\n${item.content}`).join('\n\n');
    onCopy(allText);
    toast.success(`All ${typeConfig[type].label} copied to clipboard!`);
  };

  const handleABTest = async (type: string) => {
    if (!store.currentPack) return;
    setABTestType(type);
    setABGenerating(true);
    setShowABTest(true);
    try {
      const packData = {
        productName: store.currentPack.productName,
        productCategory: store.currentPack.productCategory,
        targetAudience: store.currentPack.targetAudience,
        platform: store.currentPack.platform,
        tone: store.currentPack.tone,
        brandVoice: store.currentPack.brandVoice,
        keyBenefits: store.currentPack.keyBenefits,
      };
      
      const [resA, resB] = await Promise.all([
        fetch('/api/ugc/regenerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...packData, type, variantLabel: 'A' }),
        }),
        fetch('/api/ugc/regenerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...packData, type, variantLabel: 'B' }),
        }),
      ]);
      
      const [dataA, dataB] = await Promise.all([resA.json(), resB.json()]);
      
      if (dataA.success && dataB.success) {
        setABVariants({
          a: dataA.data.slice(0, 3),
          b: dataB.data.slice(0, 3),
        });
      } else {
        toast.error('Failed to generate A/B variants');
        setShowABTest(false);
      }
    } catch {
      toast.error('Something went wrong');
      setShowABTest(false);
    } finally {
      setABGenerating(false);
    }
  };

  const handleABSelect = (variant: 'a' | 'b') => {
    if (!store.currentPack || !abVariants || !abTestType) return;
    setABSelected(variant);
    const selected = variant === 'a' ? abVariants.a : abVariants.b;
    updatePack(selected, abTestType);
    toast.success(`Variant ${variant.toUpperCase()} applied!`);
    setTimeout(() => {
      setShowABTest(false);
      setABVariants(null);
      setABSelected(null);
    }, 1000);
  };

  const renderRegenerateButton = (type: string) => (
    <div className="flex items-center gap-1 ml-auto">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyAll(type)}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-3.5 h-3.5 mr-1" />Copy All
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy all {typeConfig[type].label} to clipboard</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRegenerate(type)}
              disabled={regeneratingType === type}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {regeneratingType === type ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
              )}
              Regen
            </Button>
          </TooltipTrigger>
          <TooltipContent>Regenerate {typeConfig[type].label} with new variations</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleABTest(type)}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <FlaskConical className="w-3.5 h-3.5 mr-1" />A/B Test
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate A/B test variants</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Feature 3: Hashtag Suggestions for Captions */}
      {type === 'captions' && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const category = activePack.productCategory;
                  const hashtagMap: Record<string, string[]> = {
                    skincare: ['#skincare', '#beautytips', '#glowskin', '#skincareroutine', '#clearskin', '#dermatologist', '#selfcare'],
                    fitness: ['#fitness', '#workout', '#gymlife', '#fitfam', '#healthylifestyle', '#training', '#motivation'],
                    tech_gadgets: ['#tech', '#gadgets', '#techtok', '#review', '#unboxing', '#newtech', '#innovation'],
                    fashion: ['#fashion', '#ootd', '#style', '#trendy', '#fashionista', '#outfitinspo', '#clothing'],
                    food_beverage: ['#foodie', '#foodtok', '#yummy', '#recipe', '#cooking', '#cafe', '#instafood'],
                    home_living: ['#homedecor', '#interiordesign', '#home', '#cozy', '#minimal', '#organization', '#cleanhome'],
                    education: ['#learning', '#study', '#education', '#knowledge', '#tips', '#growth', '#skills'],
                    saas: ['#saas', '#productivity', '#business', '#startup', '#tech', '#tools', '#workflow'],
                    local_service: ['#localbusiness', '#supportlocal', '#service', '#community', '#trust', '#quality', '#reviews'],
                    personal_brand: ['#personalbrand', '#creator', '#influencer', '#contentcreator', '#authentic', '#storytelling', '#growth'],
                  };
                  const hashtags = hashtagMap[category] || ['#ugc', '#ad', '#content', '#creator', '#viral', '#fyp', '#trending'];
                  navigator.clipboard.writeText(hashtags.join(' ')).then(() => toast.success('Hashtags copied to clipboard!')).catch(() => {});
                }}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Hash className="w-3.5 h-3.5 mr-1" />Hashtags
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy suggested hashtags for this category</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  const renderSection = (type: string, items: any[], desc: string) => {
    const config = typeConfig[type];
    const Icon = config.icon;
    return (
      <TabsContent value={type} className="space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-sm`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{config.label}</h3>
              <p className="text-[11px] text-muted-foreground">{desc}</p>
            </div>
          </div>
          {renderRegenerateButton(type)}
        </div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
          {sortWithPins(items).map((item, i) => renderContentCard(item, i, sortWithPins(items)))}
        </div>
      </TabsContent>
    );
  };

  const totalItems = activePack.contents.length;
  const favCount = activePack.contents.filter((c: any) => favorites.has(c.id || c.label)).length;
  const upCount = Object.values(ratings).filter(r => r === 'up').length;

  // Analytics calculations
  const avgWordCount = activePack.contents.length > 0
    ? Math.round(activePack.contents.reduce((sum: number, c: any) => sum + getContentStats(c.content, c.type).words, 0) / activePack.contents.length)
    : 0;
  const totalScriptDuration = activePack.contents
    .filter((c: any) => c.type === 'script')
    .reduce((sum: number, c: any) => sum + (getContentStats(c.content, c.type).estimatedDuration || 0), 0);
  const totalRated = Object.keys(ratings).length;
  const helpfulPercent = totalRated > 0 ? Math.round((upCount / totalRated) * 100) : 0;
  const avgQuality = activePack.contents.length > 0
    ? Math.round(activePack.contents.reduce((sum: number, c: any) => sum + calculateContentScore(c.content, c.type).score, 0) / activePack.contents.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    >
      {/* Header */}
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Create New
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-shadow-glow">{pack.productName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">{pack.productCategory.replace(/_/g, ' ')}</Badge>
              <Badge variant="outline" className="text-xs">{pack.platform}</Badge>
              <Badge variant="outline" className="text-xs">{pack.tone}</Badge>
              <Badge variant="secondary" className="text-xs bg-muted">{totalItems} items</Badge>
              {favCount > 0 && (
                <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0">
                  <Star className="w-3 h-3 mr-1 fill-current" />{favCount} favs
                </Badge>
              )}
              {upCount > 0 && (
                <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0">
                  <ThumbsUp className="w-3 h-3 mr-1" />{upCount} helpful
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 relative">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `🎯 ${pack.productName}\n📦 ${pack.productCategory.replace(/_/g, ' ')} | ${pack.platform} | ${pack.tone}\n\n${activePack.contents.slice(0, 3).map((c: any) => `✨ ${c.label}:\n${c.content.slice(0, 100)}...`).join('\n\n')}\n\n— Generated by UGC Ad Studio`;
                  navigator.clipboard.writeText(text).then(() => toast.success('Pack summary copied to clipboard!')).catch(() => toast.error('Failed to copy'));
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />Share
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="relative"
              >
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </motion.div>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[160px]"
                >
                  <button
                    onClick={() => { onExport(activePack, 'txt'); setShowExportMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Export as .TXT
                  </button>
                  <button
                    onClick={() => { onExport(activePack, 'md'); setShowExportMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <FileDown className="w-4 h-4 text-muted-foreground" />
                    Export as .MD
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content Analytics Dashboard */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { icon: FileText, label: 'Total Pieces', value: totalItems, color: 'text-orange-600 dark:text-orange-400', gradient: 'stat-card-gradient-orange' },
            { icon: Hash, label: 'Avg Words', value: avgWordCount, color: 'text-rose-600 dark:text-rose-400', gradient: 'stat-card-gradient-rose' },
            { icon: Timer, label: 'Script Duration', value: totalScriptDuration > 0 ? formatDuration(totalScriptDuration) : '—', color: 'text-pink-600 dark:text-pink-400', gradient: 'stat-card-gradient-pink' },
            { icon: ThumbsUp, label: 'Helpful %', value: totalRated > 0 ? `${helpfulPercent}%` : '—', color: 'text-green-600 dark:text-green-400', gradient: 'stat-card-gradient-green' },
            { icon: Gauge, label: 'Avg Quality', value: avgQuality > 0 ? `${avgQuality}` : '—', color: avgQuality >= 80 ? 'text-green-600 dark:text-green-400' : avgQuality >= 65 ? 'text-orange-600 dark:text-orange-400' : 'text-amber-600 dark:text-amber-400', gradient: avgQuality >= 80 ? 'stat-card-gradient-green' : avgQuality >= 65 ? 'stat-card-gradient-orange' : 'stat-card-gradient-amber' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.gradient} border border-border/30 rounded-xl p-3 flex items-center gap-3 content-card-hover`}>
              <div className="w-9 h-9 rounded-lg bg-background border border-border/40 flex items-center justify-center shrink-0">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold tabular-nums truncate">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Word Frequency Analysis */}
      {(() => {
        const allText = activePack.contents.map((c: any) => c.content).join(' ');
        const words = allText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const stopWords = new Set(['that', 'this', 'with', 'from', 'your', 'have', 'more', 'will', 'just', 'like', 'been', 'they', 'them', 'what', 'when', 'make', 'than', 'into', 'could', 'other', 'which', 'their', 'there', 'about', 'would', 'these', 'some', 'very', 'also', 'back', 'then', 'only', 'even', 'most', 'over', 'such', 'after', 'does', 'doesnt', 'dont', 'cant', 'wont', 'youre', 'your', 'youve', 'youll', 'were', 'been', 'being', 'have', 'having', 'had', 'does', 'doing', 'done', 'going', 'gone', 'got', 'get', 'gets', 'getting']);
        const freq: Record<string, number> = {};
        words.forEach(w => { if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1; });
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
        const maxFreq = sorted.length > 0 ? sorted[0][1] : 1;

        if (sorted.length === 0) return null;

        return (
          <Card className="border border-border/30 shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Word Frequency</h4>
                    <p className="text-[10px] text-muted-foreground">Top keywords in your content</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {sorted.map(([word, count], i) => (
                  <div key={word} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-24 truncate">{word}</span>
                    <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="word-bar rounded-full"
                        style={{ width: `${(count / maxFreq) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Word Cloud Visualization */}
      {(() => {
        const allText = activePack.contents.map((c: any) => c.content).join(' ');
        const words = allText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const stopWords = new Set(['that', 'this', 'with', 'from', 'your', 'have', 'more', 'will', 'just', 'like', 'been', 'they', 'them', 'what', 'when', 'make', 'than', 'into', 'could', 'other', 'which', 'their', 'there', 'about', 'would', 'these', 'some', 'very', 'also', 'back', 'then', 'only', 'even', 'most', 'over', 'such', 'after', 'does', 'doesnt', 'dont', 'cant', 'wont', 'youre', 'your', 'youve', 'youll', 'were', 'been', 'being', 'have', 'having', 'had', 'does', 'doing', 'done', 'going', 'gone', 'got', 'get', 'gets', 'getting']);
        const freq: Record<string, number> = {};
        words.forEach(w => { if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1; });
        const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);
        const maxFreq = topWords.length > 0 ? topWords[0][1] : 1;

        if (topWords.length === 0) return null;

        const cloudColors = [
          'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
          'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
          'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
          'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
          'bg-orange-200 text-orange-800 dark:bg-orange-800/50 dark:text-orange-200',
          'bg-rose-200 text-rose-800 dark:bg-rose-800/50 dark:text-rose-200',
          'bg-pink-200 text-pink-800 dark:bg-pink-800/50 dark:text-pink-200',
          'bg-amber-200 text-amber-800 dark:bg-amber-800/50 dark:text-amber-200',
        ];

        return (
          <Card className="border border-border/30 shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Word Cloud</h4>
                    <p className="text-[10px] text-muted-foreground">Visual keyword overview</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 py-2">
                {topWords.map(([word, count], i) => {
                  const ratio = count / maxFreq;
                  const size = ratio > 0.7 ? 'text-base font-bold px-3.5 py-1.5' : ratio > 0.4 ? 'text-sm font-semibold px-3 py-1' : ratio > 0.2 ? 'text-xs font-medium px-2.5 py-0.5' : 'text-[10px] font-medium px-2 py-0.5';
                  return (
                    <motion.span
                      key={word}
                      initial={{ opacity: 0, scale: 0.6, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 20 }}
                      className={`inline-flex rounded-full border border-border/20 cursor-default transition-transform hover:scale-110 ${size} ${cloudColors[i % cloudColors.length]}`}
                      title={`${word}: ${count} occurrence${count > 1 ? 's' : ''}`}
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Content Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search content within this pack..."
            value={contentSearch}
            onChange={(e) => setContentSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-9 text-sm bg-muted/30 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 dark:focus:border-orange-700 transition-all placeholder:text-muted-foreground/60"
          />
          {contentSearch && (
            <button
              onClick={() => setContentSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {contentSearch && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] text-muted-foreground mt-1.5 ml-1"
          >
            <span className="font-medium text-orange-600 dark:text-orange-400">{totalSearchMatches}</span>
            {' '}of{' '}
            <span className="font-medium">{totalOriginal}</span>
            {' '}items match "{contentSearch}"
          </motion.p>
        )}
      </div>

      {/* Content Type Visibility Toggles */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-xs font-medium text-muted-foreground mr-1">Show:</span>
        {[
          { type: 'hook', label: 'Hooks', count: hooks.length, activeBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40', activeText: 'text-orange-700 dark:text-orange-300' },
          { type: 'script', label: 'Scripts', count: scripts.length, activeBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40', activeText: 'text-rose-700 dark:text-rose-300' },
          { type: 'cta', label: 'CTAs', count: ctas.length, activeBg: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/40', activeText: 'text-pink-700 dark:text-pink-300' },
          { type: 'caption', label: 'Captions', count: captions.length, activeBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40', activeText: 'text-amber-700 dark:text-amber-300' },
        ].map(chip => {
          const isActive = visibleTypes.has(chip.type);
          return (
            <button
              key={chip.type}
              onClick={() => {
                if (!isActive && visibleTypes.size <= 1) return; // Keep at least 1 visible
                setVisibleTypes(prev => {
                  const next = new Set(prev);
                  if (next.has(chip.type)) next.delete(chip.type);
                  else next.add(chip.type);
                  return next;
                });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                isActive
                  ? `${chip.activeBg} shadow-sm`
                  : 'bg-transparent border-border/40 text-muted-foreground hover:bg-muted/50'
              } ${!isActive && visibleTypes.size <= 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {chip.label} ({chip.count})
            </button>
          );
        })}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="hook" className="space-y-2">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1 bg-muted/50">
          {[
            { v: 'hook', label: 'Hooks', count: hooks.length, icon: Zap, color: 'text-orange-600 dark:text-orange-400' },
            { v: 'script', label: 'Scripts', count: scripts.length, icon: Video, color: 'text-rose-600 dark:text-rose-400' },
            { v: 'cta', label: 'CTAs', count: ctas.length, icon: Send, color: 'text-pink-600 dark:text-pink-400' },
            { v: 'caption', label: 'Captions', count: captions.length, icon: MessageSquare, color: 'text-amber-600 dark:text-amber-400' },
          ].map(t => (
            <TabsTrigger key={t.v} value={t.v} className={`text-xs sm:text-sm py-2.5 data-[state=active]:shadow-sm data-[state=active]:bg-background ${!visibleTypes.has(t.v) ? 'hidden' : ''}`}>
              <t.icon className={`w-3.5 h-3.5 mr-1.5 ${t.color}`} />
              {t.label} ({t.count})
            </TabsTrigger>
          ))}
        </TabsList>

        {visibleTypes.has('hook') && renderSection('hook', hooks, 'Attention-grabbing openers for the first 3 seconds')}
        {visibleTypes.has('script') && renderSection('script', scripts, 'Complete UGC ad scripts with scene directions')}
        {visibleTypes.has('cta') && renderSection('cta', ctas, 'Conversion-optimized calls to action')}
        {visibleTypes.has('caption') && renderSection('caption', captions, 'Ready-to-post captions with hashtags')}
      </Tabs>

      {/* Pack Notes (Sticky Notes) */}
      <Card className="border border-border/30 shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow duration-300 glass-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
              <StickyNote className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Pack Notes</h4>
              <p className="text-[10px] text-muted-foreground">Jot down ideas and reminders for this content pack</p>
            </div>
          </div>
          <Textarea
            value={packNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add notes about this content pack..."
            rows={3}
            className="text-sm resize-none bg-muted/30 border-border/40 focus:ring-2 focus:ring-amber-400/20 placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-muted-foreground/60">
              Auto-saved to browser
            </p>
            <p className={`text-[10px] font-medium tabular-nums ${packNotes.length >= 500 ? 'text-red-500' : packNotes.length >= 400 ? 'text-amber-500' : 'text-muted-foreground'}`}>
              {packNotes.length}/500
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <RefreshCw className="w-4 h-4 mr-2" />Generate New Pack
        </Button>
      </div>

      {/* Preview Dialog - Enhanced */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewItem && typeConfig[previewItem.type] && (() => {
                const Icon = typeConfig[previewItem.type].icon;
                return (
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${typeConfig[previewItem.type].gradient} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                );
              })()}
              {previewItem?.label}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {previewItem?.type === 'hook' && 'Attention hook for the first 3 seconds'}
              {previewItem?.type === 'script' && 'Full UGC ad script with scene directions'}
              {previewItem?.type === 'cta' && 'Call-to-action for conversions'}
              {previewItem?.type === 'caption' && 'Social media caption with hashtags'}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
            <div className="bg-muted/40 rounded-xl p-5 border border-border/30">
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">
                {previewItem?.content}
              </pre>
            </div>
            {/* Stats in preview */}
            {previewItem && (
              <div className="flex items-center gap-3 mt-3 px-1">
                <span className="text-xs text-muted-foreground"><Hash className="w-3 h-3 inline mr-1" />{getContentStats(previewItem.content, previewItem.type).words} words</span>
                <span className="text-xs text-muted-foreground">{getContentStats(previewItem.content, previewItem.type).chars} chars</span>
                {getContentStats(previewItem.content, previewItem.type).estimatedDuration && (
                  <span className="text-xs text-orange-500 font-medium"><Timer className="w-3 h-3 inline mr-1" />~{formatDuration(getContentStats(previewItem.content, previewItem.type).estimatedDuration!)}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="flex items-center gap-1">
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => previewItem && rateContent(previewItem.id || previewItem.label, 'up')}>
                <Button variant="ghost" size="sm" className={`h-8 px-2 ${ratings[previewItem?.id || previewItem?.label] === 'up' ? 'text-green-500' : ''}`}>
                  <ThumbsUp className={`w-4 h-4 mr-1 ${ratings[previewItem?.id || previewItem?.label] === 'up' ? 'fill-current' : ''}`} />Helpful
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => previewItem && rateContent(previewItem.id || previewItem.label, 'down')}>
                <Button variant="ghost" size="sm" className={`h-8 px-2 ${ratings[previewItem?.id || previewItem?.label] === 'down' ? 'text-red-400' : ''}`}>
                  <ThumbsDown className={`w-4 h-4 mr-1 ${ratings[previewItem?.id || previewItem?.label] === 'down' ? 'fill-current' : ''}`} />No
                </Button>
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => previewItem && toggleFavorite(previewItem.id || previewItem.label)}>
                <Star className={`w-4 h-4 mr-1.5 ${previewItem && favorites.has(previewItem.id || previewItem.label) ? 'text-amber-500 fill-amber-500' : ''}`} />
                {previewItem && favorites.has(previewItem.id || previewItem.label) ? 'Unfavorite' : 'Favorite'}
              </Button>
              <Button size="sm" onClick={() => { if (previewItem) { handleCopy(previewItem.id || previewItem.label, previewItem.content); } }}>
                <Copy className="w-4 h-4 mr-1.5" />Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* A/B Test Dialog */}
      <Dialog open={showABTest} onOpenChange={(open) => { if (!open) { setShowABTest(false); setABVariants(null); setABSelected(null); }}}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-orange-500" />
              A/B Test — {abTestType === 'hook' ? 'Hooks' : abTestType === 'script' ? 'Scripts' : abTestType === 'cta' ? 'CTAs' : 'Captions'}
            </DialogTitle>
            <DialogDescription>Compare two AI-generated variants side by side. Click to select your preferred version.</DialogDescription>
          </DialogHeader>
          {abGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center animate-pulse">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Generating two variants...</p>
                <p className="text-xs text-muted-foreground mt-1">Creating Variant A and Variant B</p>
              </div>
            </div>
          ) : abVariants ? (
            <div className="overflow-y-auto max-h-[55vh] custom-scrollbar">
              <div className="ab-split-container">
                {/* Variant A */}
                <div className="space-y-3 pr-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0 text-xs">Variant A</Badge>
                    <button onClick={() => handleABSelect('a')} className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                      {abSelected === 'a' ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                      {abSelected === 'a' ? 'Selected!' : 'Use this'}
                    </button>
                  </div>
                  {abVariants.a.map((item: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      <div className={`ab-variant-card border border-border/30 ${abSelected === 'a' ? 'selected' : ''}`} onClick={() => handleABSelect('a')}>
                        <Badge variant="secondary" className="text-[10px] mb-2">{item.label}</Badge>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{item.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">{item.content.trim().split(/\s+/).length} words</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Divider */}
                <div className="ab-split-divider" />
                
                {/* Variant B */}
                <div className="space-y-3 pl-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-0 text-xs">Variant B</Badge>
                    <button onClick={() => handleABSelect('b')} className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1">
                      {abSelected === 'b' ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                      {abSelected === 'b' ? 'Selected!' : 'Use this'}
                    </button>
                  </div>
                  {abVariants.b.map((item: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      <div className={`ab-variant-card border border-border/30 ${abSelected === 'b' ? 'selected' : ''}`} onClick={() => handleABSelect('b')}>
                        <Badge variant="secondary" className="text-[10px] mb-2">{item.label}</Badge>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{item.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-2">{item.content.trim().split(/\s+/).length} words</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CONTENT COMPARISON DIALOG
   ═══════════════════════════════════════════════════════════════════════ */
export function CompareDialog({ packs, open, onOpenChange }: { packs: any[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [activeTab, setActiveTab] = useState('hooks');
  if (packs.length !== 2) return null;

  const [packA, packB] = packs;
  const tabs = [
    { key: 'hooks', label: 'Hooks', icon: Zap, color: 'text-orange-600 dark:text-orange-400' },
    { key: 'scripts', label: 'Scripts', icon: Video, color: 'text-rose-600 dark:text-rose-400' },
    { key: 'ctas', label: 'CTAs', icon: Send, color: 'text-pink-600 dark:text-pink-400' },
    { key: 'captions', label: 'Captions', icon: MessageSquare, color: 'text-amber-600 dark:text-amber-400' },
  ];

  const itemsA = packA.contents.filter((c: any) => c.type === activeTab.replace(/s$/, ''));
  const itemsB = packB.contents.filter((c: any) => c.type === activeTab.replace(/s$/, ''));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Columns2 className="w-5 h-5 text-orange-500" />
            Compare Content Packs
          </DialogTitle>
          <DialogDescription>Side-by-side comparison of your content packs</DialogDescription>
        </DialogHeader>

        {/* Pack headers */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[packA, packB].map((pack, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {i === 0 ? 'A' : 'B'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{pack.productName}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{pack.platform}</Badge>
                  <Badge variant="outline" className="text-[10px]">{pack.tone}</Badge>
                  <span className="text-[10px] text-muted-foreground">{pack.createdAt ? new Date(pack.createdAt).toLocaleDateString() : 'Today'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg mb-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === t.key ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className={`w-3.5 h-3.5 ${t.color}`} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content rows */}
        <div className="overflow-y-auto max-h-[50vh] pr-1 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {itemsA.map((item: any, idx: number) => (
                <div key={item.id || idx} className="p-3 rounded-lg bg-muted/20 border border-border/20 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="secondary" className="text-[10px]">{item.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">{item.content.trim().split(/\s+/).length} words</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed line-clamp-4">{item.content}</p>
                </div>
              ))}
              {itemsA.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No items</p>}
            </div>
            <div className="space-y-2">
              {itemsB.map((item: any, idx: number) => (
                <div key={item.id || idx} className="p-3 rounded-lg bg-muted/20 border border-border/20 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="secondary" className="text-[10px]">{item.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">{item.content.trim().split(/\s+/).length} words</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed line-clamp-4">{item.content}</p>
                </div>
              ))}
              {itemsB.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No items</p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

