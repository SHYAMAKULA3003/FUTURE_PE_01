'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useUGCStore } from '@/lib/store';
import { ActivityItem, getActivityFeed, formatTimeAgo } from '@/lib/activity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plus, BookOpen, Trash2, RefreshCw, Search, Filter, Download,
  FileText, Layers, Palette, ArrowUpDown, CheckSquare, Square,
  X, CopyPlus, Copy, Share2, PenLine, History, CalendarDays,
  Columns2, ChevronLeft, ChevronRight, Sparkles, Inbox,
  BarChart3, Check, FileDown, Video, Gauge, TrendingUp,
} from 'lucide-react';
import { CompareDialog } from '@/components/ResultsView';
import { calculateContentScore } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════
   LIBRARY VIEW (Enhanced with search, filter, duplicate)
   ═══════════════════════════════════════════════════════════════════════ */
export interface LibraryViewProps {
  packs: any[];
  onDelete: (id: string) => void;
  onExport: (pack: any, format?: 'txt' | 'md') => void;
  onCopy: (text: string) => void;
  onSelect: (pack: any) => void;
  onGenerateNew: () => void;
}

export function LibraryView({ packs, onDelete, onExport, onCopy, onSelect, onGenerateNew }: LibraryViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packToDelete, setPackToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkExportMenu, setShowBulkExportMenu] = useState(false);
  const [comparePackIds, setComparePackIds] = useState<string[]>([]);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  // Calendar events & renames - loaded from localStorage (safe: LibraryView is guarded by mounted state in parent)
  const [clientData, setClientData] = useState(() => {
    try {
      const saved = localStorage.getItem('ugc-studio-calendar');
      const savedRenames = localStorage.getItem('ugc-studio-renames');
      return {
        calendarEvents: saved ? JSON.parse(saved) : [],
        renames: savedRenames ? JSON.parse(savedRenames) : {},
      };
    } catch {
      return { calendarEvents: [] as Array<{ id: string; date: string; content: string; type: string; packName: string }>, renames: {} as Record<string, string> };
    }
  });
  const calendarEvents = clientData.calendarEvents;
  const renames = clientData.renames;
  const [calendarWeekOffset, setCalendarWeekOffset] = useState(0);

  // Keyboard shortcut: Escape → clear search query
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectMode) {
          setSelectMode(false);
          setSelectedIds(new Set());
        } else if (searchQuery) {
          e.preventDefault();
          setSearchQuery('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, selectMode]);

  // Set loading to false after initial mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, []);

  // Load activity feed (computed from localStorage)
  useEffect(() => {
    const loadFeed = () => setActivityFeed(getActivityFeed());
    loadFeed();
  }, [packs]);

  // Save helpers for calendar events and renames
  const saveCalendarEvents = (events: typeof calendarEvents) => {
    setClientData(prev => ({ ...prev, calendarEvents: events }));
    try { localStorage.setItem('ugc-studio-calendar', JSON.stringify(events)); } catch { /* ignore */ }
  };

  const saveRename = (id: string, name: string) => {
    const updated = { ...renames, [id]: name };
    setClientData(prev => ({ ...prev, renames: updated }));
    try { localStorage.setItem('ugc-studio-renames', JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportSelectedPacks = (format: 'txt' | 'md') => {
    const selectedPacks = packs.filter((p: any) => selectedIds.has(p.id));
    if (selectedPacks.length === 0) return;

    let combinedOutput = '';
    let filename: string;
    let mimeType: string;

    selectedPacks.forEach((pack: any, packIndex: number) => {
      const hooks = pack.contents.filter((c: any) => c.type === 'hook');
      const scripts = pack.contents.filter((c: any) => c.type === 'script');
      const ctas = pack.contents.filter((c: any) => c.type === 'cta');
      const captions = pack.contents.filter((c: any) => c.type === 'caption');

      if (format === 'md') {
        if (packIndex > 0) combinedOutput += '\n\n';
        combinedOutput += `# UGC Ad Content Pack ${packIndex + 1}: ${pack.productName}\n\n`;
        combinedOutput += `| Detail | Value |\n|--------|-------|\n`;
        combinedOutput += `| **Product** | ${pack.productName} |\n`;
        combinedOutput += `| **Category** | ${pack.productCategory.replace(/_/g, ' ')} |\n`;
        combinedOutput += `| **Platform** | ${pack.platform} |\n`;
        combinedOutput += `| **Tone** | ${pack.tone} |\n`;
        combinedOutput += `\n---\n\n`;
        combinedOutput += `## 🪝 Hooks (${hooks.length})\n\n`;
        hooks.forEach((h: any, i: number) => { combinedOutput += `### ${i + 1}. ${h.label}\n\n${h.content}\n\n---\n\n`; });
        combinedOutput += `## 🎬 Scripts (${scripts.length})\n\n`;
        scripts.forEach((s: any, i: number) => { combinedOutput += `### ${i + 1}. ${s.label}\n\n\`\`\`\n${s.content}\n\`\`\`\n\n---\n\n`; });
        combinedOutput += `## 📣 CTAs (${ctas.length})\n\n`;
        ctas.forEach((c: any, i: number) => { combinedOutput += `### ${i + 1}. ${c.label}\n\n${c.content}\n\n---\n\n`; });
        combinedOutput += `## 💬 Captions (${captions.length})\n\n`;
        captions.forEach((c: any, i: number) => { combinedOutput += `### ${i + 1}. ${c.label}\n\n${c.content}\n\n`; });
      } else {
        if (packIndex > 0) combinedOutput += '\n\n';
        combinedOutput += `${'═'.repeat(55)}\n`;
        combinedOutput += `  PACK ${packIndex + 1} OF ${selectedPacks.length}\n`;
        combinedOutput += `  Product: ${pack.productName} | Platform: ${pack.platform}\n`;
        combinedOutput += `${'═'.repeat(55)}\n\n`;
        combinedOutput += `  Category: ${pack.productCategory.replace(/_/g, ' ')}\n`;
        combinedOutput += `  Tone: ${pack.tone}\n`;
        combinedOutput += `  Audience: ${pack.targetAudience}\n\n`;
        combinedOutput += `${'─'.repeat(40)}\n  HOOKS (${hooks.length})\n${'─'.repeat(40)}\n\n`;
        hooks.forEach((h: any, i: number) => { combinedOutput += `${i + 1}. [${h.label}]\n${h.content}\n\n`; });
        combinedOutput += `${'─'.repeat(40)}\n  SCRIPTS (${scripts.length})\n${'─'.repeat(40)}\n\n`;
        scripts.forEach((s: any, i: number) => { combinedOutput += `${i + 1}. [${s.label}]\n${s.content}\n\n`; });
        combinedOutput += `${'─'.repeat(40)}\n  CTAs (${ctas.length})\n${'─'.repeat(40)}\n\n`;
        ctas.forEach((c: any, i: number) => { combinedOutput += `${i + 1}. [${c.label}]\n${c.content}\n\n`; });
        combinedOutput += `${'─'.repeat(40)}\n  CAPTIONS (${captions.length})\n${'─'.repeat(40)}\n\n`;
        captions.forEach((c: any, i: number) => { combinedOutput += `${i + 1}. [${c.label}]\n${c.content}\n\n`; });
      }
    });

    combinedOutput += format === 'md' ? '\n---\n*Generated by UGC Ad Studio*\n' : `\n${'═'.repeat(55)}\n  Generated by UGC Ad Studio\n${'═'.repeat(55)}\n`;

    filename = `ugc-bulk-export-${selectedPacks.length}-packs.${format}`;
    mimeType = format === 'md' ? 'text/markdown' : 'text/plain';

    const blob = new Blob([combinedOutput], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowBulkExportMenu(false);
    setSelectMode(false);
    setSelectedIds(new Set());
    toast.success(`Exported ${selectedPacks.length} packs as ${format.toUpperCase()}!`);
  };

  const confirmDelete = (id: string) => { setPackToDelete(id); setDeleteDialogOpen(true); };
  const executeDelete = () => {
    if (packToDelete) { onDelete(packToDelete); setDeleteDialogOpen(false); setPackToDelete(null); }
  };

  const handleDuplicate = async (pack: any) => {
    try {
      const res = await fetch('/api/ugc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: pack.productName,
          productCategory: pack.productCategory,
          businessType: pack.businessType,
          targetAudience: pack.targetAudience,
          platform: pack.platform,
          tone: pack.tone,
          brandVoice: pack.brandVoice,
          keyBenefits: pack.keyBenefits,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Content pack duplicated with fresh content!');
        window.location.reload();
      } else {
        toast.error('Failed to duplicate');
      }
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  // Filter packs
  const filteredPacks = useMemo(() => {
    return packs.filter((pack: any) => {
      const matchesSearch = !searchQuery || 
        pack.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.productCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.platform.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = filterPlatform === 'all' || pack.platform === filterPlatform;
      const matchesCategory = filterCategory === 'all' || pack.productCategory === filterCategory;
      return matchesSearch && matchesPlatform && matchesCategory;
    });
  }, [packs, searchQuery, filterPlatform, filterCategory]);

  // Sort packs
  const sortedPacks = useMemo(() => {
    const sorted = [...filteredPacks];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'oldest':
        sorted.sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case 'name-asc':
        sorted.sort((a: any, b: any) => a.productName.localeCompare(b.productName));
        break;
      case 'name-desc':
        sorted.sort((a: any, b: any) => b.productName.localeCompare(a.productName));
        break;
      case 'platform':
        sorted.sort((a: any, b: any) => a.platform.localeCompare(b.platform));
        break;
      default:
        break;
    }
    return sorted;
  }, [filteredPacks, sortBy]);

  // Get unique platforms and categories
  const platforms = useMemo(() => [...new Set(packs.map((p: any) => p.platform))], [packs]);
  const categories = useMemo(() => [...new Set(packs.map((p: any) => p.productCategory))], [packs]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === sortedPacks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedPacks.map((p: any) => p.id)));
    }
  }, [selectedIds.size, sortedPacks]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Content Library</h2>
          <p className="text-muted-foreground mt-1">
            {packs.length} content {packs.length === 1 ? 'pack' : 'packs'} saved
            {sortedPacks.length !== packs.length && ` · ${sortedPacks.length} shown`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={onGenerateNew} className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/20">
              <Plus className="w-4 h-4 mr-2" />New Content Pack
            </Button>
          </motion.div>
          {!isLoading && packs.length > 0 && (
            <>
            <Button
              variant={selectMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (selectMode) {
                  setSelectMode(false);
                  setSelectedIds(new Set());
                } else {
                  setSelectMode(true);
                }
              }}
              className={selectMode ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white' : ''}
            >
              {selectMode ? <CheckSquare className="w-4 h-4 mr-1.5" /> : <Square className="w-4 h-4 mr-1.5" />}
              {selectMode ? 'Select Mode On' : 'Select'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalendar(true)}
              className="gap-1.5"
            >
              <CalendarDays className="w-4 h-4" />Calendar
            </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Performance Stats */}
      {packs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 stagger-children">
          {[
            { label: 'Total Packs', value: packs.length, icon: Layers, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20' },
            { label: 'Total Content', value: packs.reduce((s: number, p: any) => s + (p.contents?.length || 0), 0), icon: FileText, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
            { label: 'Avg Quality', value: `${Math.round(packs.reduce((s: number, p: any) => s + (p.contents || []).reduce((ss: number, c: any) => ss + calculateContentScore(c.content, c.type).score, 0) / Math.max((p.contents || []).length, 1), 0) / Math.max(packs.length, 1))}`, icon: Gauge, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20' },
            { label: 'Most Used', value: ((): string => { const freq: Record<string, number> = {}; packs.forEach((p: any) => { const pl = p.platform || 'unknown'; freq[pl] = (freq[pl] || 0) + 1; }); return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(/_/g, ' ') || '—'; })(), icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} border border-border/30 rounded-xl p-3 card-hover-lift`}>
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[10px] text-muted-foreground font-medium">{stat.label}</span>
              </div>
              <div className="text-sm font-bold tabular-nums truncate">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      {packs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-3"
        >
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, category, or platform..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-muted/30 border-border/40 focus:ring-2 focus:ring-orange-500/20 input-glow-focus"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto h-10 bg-muted/30 border-border/40 focus:ring-2 focus:ring-orange-500/20 min-w-[140px]">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="platform">Platform</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter row */}
          {selectMode && (
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={toggleSelectAll} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5" />
                {selectedIds.size === sortedPacks.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
            </div>
          )}
          {!selectMode && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Filter:</span>
            <Badge
              variant={filterPlatform === 'all' ? 'default' : 'outline'}
              className={`text-[10px] cursor-pointer ${filterPlatform === 'all' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0' : 'hover:bg-muted'}`}
              onClick={() => setFilterPlatform('all')}
            >
              All Platforms
            </Badge>
            {platforms.map(p => (
              <Badge
                key={p}
                variant={filterPlatform === p ? 'default' : 'outline'}
                className={`text-[10px] cursor-pointer ${filterPlatform === p ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0' : 'hover:bg-muted'}`}
                onClick={() => setFilterPlatform(filterPlatform === p ? 'all' : p)}
              >
                {p}
              </Badge>
            ))}
            <div className="w-px h-4 bg-border/50 mx-1" />
            <Badge
              variant={filterCategory === 'all' ? 'default' : 'outline'}
              className={`text-[10px] cursor-pointer ${filterCategory === 'all' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-0' : 'hover:bg-muted'}`}
              onClick={() => setFilterCategory('all')}
            >
              All Categories
            </Badge>
            {categories.map(c => (
              <Badge
                key={c}
                variant={filterCategory === c ? 'default' : 'outline'}
                className={`text-[10px] cursor-pointer capitalize ${filterCategory === c ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-0' : 'hover:bg-muted'}`}
                onClick={() => setFilterCategory(filterCategory === c ? 'all' : c)}
              >
                {c.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
          )}
        </motion.div>
      )}

      {/* Recent Activity Feed */}
      {activityFeed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">{activityFeed.length} events</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {activityFeed.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/20 shrink-0">
                <div className={`w-2 h-2 rounded-full activity-pulse-dot ${
                  item.type === 'generated' ? 'bg-green-500' :
                  item.type === 'exported' ? 'bg-blue-500' :
                  item.type === 'deleted' ? 'bg-red-500' :
                  item.type === 'cloned' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`} />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium truncate max-w-[120px]">{item.productName}</p>
                  <p className="text-[9px] text-muted-foreground capitalize">{item.type} · {formatTimeAgo(item.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Usage Distribution */}
      {packs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <Card className="border border-border/30 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Content Distribution</h4>
                  <p className="text-[10px] text-muted-foreground">Breakdown by content type</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {(() => {
                  const allContents = packs.flatMap((p: any) => p.contents || []);
                  const total = allContents.length || 1;
                  const types = [
                    { type: 'hook', label: 'Hooks', color: '#f97316', bg: 'from-orange-400 to-orange-500' },
                    { type: 'script', label: 'Scripts', color: '#f43f5e', bg: 'from-rose-400 to-rose-500' },
                    { type: 'cta', label: 'CTAs', color: '#ec4899', bg: 'from-pink-400 to-pink-500' },
                    { type: 'caption', label: 'Captions', color: '#f59e0b', bg: 'from-amber-400 to-amber-500' },
                  ];
                  return types.map(t => {
                    const count = allContents.filter((c: any) => c.type === t.type).length;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={t.type} className="text-center">
                        <div className="relative w-14 h-14 mx-auto mb-1.5">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke={t.color} strokeWidth="3" strokeLinecap="round"
                              strokeDasharray={`${pct * 0.88} 88`}
                              className="stats-ring-mini" style={{ '--ring-offset': String(88 - pct * 0.88) } as React.CSSProperties}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[11px] font-bold tabular-nums">{count}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{t.label}</span>
                        <div className="text-[9px] font-semibold" style={{ color: t.color }}>{pct}%</div>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty state after filtering */}

      {/* Library Stats Summary */}
      {!isLoading && packs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Packs', value: packs.length, icon: Layers, color: 'from-orange-400 to-orange-500' },
              { label: 'Platforms', value: new Set(packs.map((p: any) => p.platform)).size, icon: Video, color: 'from-rose-400 to-rose-500' },
              { label: 'Total Content', value: packs.reduce((sum: number, p: any) => sum + (p.contents?.length || 0), 0), icon: FileText, color: 'from-pink-400 to-pink-500' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/20">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                  <s.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold tabular-nums">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state check */}
      {packs.length > 0 && sortedPacks.length === 0 && (
        <Card className="border border-border/30 shadow-sm">
          <CardContent className="py-12 text-center">
            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterPlatform('all'); setFilterCategory('all'); }}>
              <RefreshCw className="w-4 h-4 mr-2" />Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Skeleton Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border border-border/20 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="skeleton w-16 h-4 rounded" />
                </div>
                <div className="skeleton w-3/4 h-4 rounded mb-3" />
                <div className="flex gap-2 mb-3">
                  <div className="skeleton w-16 h-5 rounded-full" />
                  <div className="skeleton w-20 h-5 rounded-full" />
                </div>
                <div className="skeleton w-full h-3 rounded mb-1.5" />
                <div className="skeleton w-2/3 h-3 rounded mb-4" />
                <div className="border-t border-border/20 pt-3 flex items-center gap-2">
                  <div className="skeleton w-12 h-3 rounded" />
                  <div className="skeleton w-10 h-3 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && packs.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-950/40 dark:to-rose-950/40 flex items-center justify-center mx-auto mb-6 breathing-icon">
            <Inbox className="w-10 h-10 text-orange-400 dark:text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Your Library is Empty</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Generate your first UGC content pack to see it here.<br/>
            <span className="text-xs">Your content will be saved automatically.</span>
          </p>
          <Button onClick={onGenerateNew} className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/20">
            <Sparkles className="w-4 h-4 mr-2" />Create Your First Pack
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedPacks.map((pack: any, i: number) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`border shadow-sm hover:shadow-lg transition-all duration-300 group h-full flex flex-col card-shine dark-card-glow content-card-hover ${selectMode && selectedIds.has(pack.id) ? 'border-orange-400 bg-orange-50/30 dark:bg-orange-950/10' : 'border-border/30 hover:border-orange-200/50 dark:hover:border-orange-800/30'}`}>
                {selectMode && (
                  <div
                    className="absolute top-3 left-3 z-20"
                    onClick={(e) => { e.stopPropagation(); toggleSelect(pack.id); }}
                  >
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      selectedIds.has(pack.id)
                        ? 'bg-gradient-to-br from-orange-500 to-rose-500 border-orange-500 text-white shadow-sm'
                        : 'border-border bg-background hover:border-orange-300 dark:hover:border-orange-700'
                    }`}>
                      {selectedIds.has(pack.id) && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                )}
                <CardContent
                  className="p-4 sm:p-5 flex-1 relative z-[2]"
                  onClick={() => selectMode ? toggleSelect(pack.id) : onSelect(pack)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {pack.createdAt ? new Date(pack.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                    </span>
                  </div>
                  {renamingId === pack.id ? (
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => setRenamingId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (renameValue.trim()) {
                            saveRename(pack.id, renameValue.trim());
                            toast.success('Pack renamed!');
                          }
                          setRenamingId(null);
                        }
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      className="text-sm font-semibold bg-muted/50 border border-orange-300 dark:border-orange-700 rounded-md px-2 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3
                      className="font-semibold text-sm mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate cursor-pointer"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(pack.id);
                        setRenameValue(renames[pack.id] || pack.productName);
                      }}
                      title="Double-click to rename"
                    >
                      {renames[pack.id] || pack.productName}
                    </h3>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="secondary" className="text-[10px] bg-muted/80 capitalize">{pack.productCategory.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className="text-[10px]">{pack.platform}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{pack.targetAudience}</p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" />{pack.contents?.length || 0} items
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Palette className="w-3 h-3" />{pack.tone}
                    </span>
                  </div>
                </CardContent>
                {/* Actions */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 flex items-center gap-1 border-t border-border/20 mt-0 pt-3">
                  <motion.div whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onExport(pack, 'txt'); }}>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                      <Download className="w-3 h-3 mr-1" />Export
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleDuplicate(pack); }}>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                      <CopyPlus className="w-3 h-3 mr-1" />Clone
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setRenamingId(pack.id); setRenameValue(renames[pack.id] || pack.productName); }}>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                      <PenLine className="w-3 h-3 mr-1" />Rename
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }} onClick={(e) => {
                    e.stopPropagation();
                    const displayName = renames[pack.id] || pack.productName;
                    const text = `🎯 ${displayName}\n📦 ${pack.productCategory.replace(/_/g, ' ')} | ${pack.platform}\n✨ ${pack.contents?.length || 0} pieces of content\n\n— Generated by UGC Ad Studio`;
                    navigator.clipboard.writeText(text).then(() => toast.success('Pack summary copied!')).catch(() => {});
                  }}>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                      <Share2 className="w-3 h-3 mr-1" />Share
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }} onClick={(e) => {
                    e.stopPropagation();
                    if (pack.contents?.[0]) {
                      const today = new Date().toISOString().split('T')[0];
                      const newEvent = {
                        id: `${pack.id}-${Date.now()}`,
                        date: today,
                        content: pack.contents[0].content.slice(0, 60),
                        type: pack.contents[0].type,
                        packName: pack.productName,
                      };
                      const updated = [...calendarEvents, newEvent];
                      saveCalendarEvents(updated);
                      toast.success(`"${pack.productName}" added to calendar!`);
                    }
                  }}>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                      <CalendarDays className="w-3 h-3 mr-1" />Schedule
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }} onClick={(e) => {
                    e.stopPropagation();
                    const firstHook = pack.contents?.find((c: any) => c.type === 'hook');
                    const firstCta = pack.contents?.find((c: any) => c.type === 'cta');
                    if (firstHook || firstCta) {
                      const text = `🪝 ${firstHook ? firstHook.content : '(no hook)'}\n\n👆 ${firstCta ? firstCta.content : '(no CTA)'}\n\n— via UGC Ad Studio`;
                      navigator.clipboard.writeText(text).then(() => toast.success(`Quick copy from ${renames[pack.id] || pack.productName}!`)).catch(() => {});
                    } else {
                      toast.error('No hooks or CTAs to copy');
                    }
                  }}>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground">
                      <Copy className="w-3 h-3 mr-1" />Quick Copy
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); confirmDelete(pack.id); }} className="ml-auto">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Content Calendar Dialog */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-orange-500" />
              Content Calendar
            </DialogTitle>
            <DialogDescription>Plan your content posting schedule for the week</DialogDescription>
          </DialogHeader>
          
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => setCalendarWeekOffset(prev => prev - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" />Previous
            </Button>
            <div className="text-sm font-semibold">
              {(() => {
                const baseDate = new Date();
                baseDate.setDate(baseDate.getDate() + calendarWeekOffset * 7);
                const monday = new Date(baseDate);
                monday.setDate(monday.getDate() - monday.getDay() + 1);
                const sunday = new Date(monday);
                sunday.setDate(sunday.getDate() + 6);
                return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
              })()}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCalendarWeekOffset(prev => prev + 1)}>
              Next<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {/* Calendar Grid */}
          <div className="overflow-y-auto max-h-[55vh] custom-scrollbar">
            <div className="calendar-grid">
              {(() => {
                const today = new Date();
                const baseDate = new Date();
                baseDate.setDate(baseDate.getDate() + calendarWeekOffset * 7);
                const monday = new Date(baseDate);
                monday.setDate(monday.getDate() - monday.getDay() + 1);
                
                const days = [];
                for (let i = 0; i < 7; i++) {
                  const day = new Date(monday);
                  day.setDate(monday.getDate() + i);
                  const dateStr = day.toISOString().split('T')[0];
                  const dayEvents = calendarEvents.filter(e => e.date === dateStr);
                  const isToday = day.toDateString() === today.toDateString();
                  
                  days.push(
                    <div key={dateStr} className={`calendar-cell ${isToday ? 'today' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className={`text-[10px] font-bold tabular-nums ${isToday ? 'text-orange-500' : 'text-muted-foreground'}`}>
                          {day.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.length === 0 ? (
                          <p className="text-[9px] text-muted-foreground/50 italic">No content</p>
                        ) : (
                          dayEvents.map(event => (
                            <div
                              key={event.id}
                              className={`calendar-chip calendar-chip-${event.type}`}
                              title={`${event.packName}: ${event.content}`}
                            >
                              <span className="truncate">{event.packName}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveCalendarEvents(calendarEvents.filter(ev => ev.id !== event.id));
                                  toast.success('Removed from calendar');
                                }}
                                className="ml-auto shrink-0 opacity-50 hover:opacity-100"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                }
                return days;
              })()}
            </div>
            
            {/* Calendar Stats */}
            <div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border/20">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="font-semibold">This week:</span>
                <span>{calendarEvents.length} total items scheduled</span>
                <span>·</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" />{calendarEvents.filter(e => e.type === 'hook').length} hooks</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" />{calendarEvents.filter(e => e.type === 'script').length} scripts</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" />{calendarEvents.filter(e => e.type === 'cta').length} CTAs</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />{calendarEvents.filter(e => e.type === 'caption').length} captions</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Content Pack?</DialogTitle>
            <DialogDescription>This action cannot be undone. The content pack and all its generated content will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={executeDelete}>
              <Trash2 className="w-4 h-4 mr-2" />Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Comparison Dialog */}
      {showCompareDialog && comparePackIds.length === 2 && (
        <CompareDialog
          packs={packs.filter((p: any) => comparePackIds.includes(p.id))}
          open={showCompareDialog}
          onOpenChange={setShowCompareDialog}
        />
      )}

      {/* Floating Bulk Select Action Bar */}
      <AnimatePresence>
        {selectMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 shadow-2xl shadow-orange-500/20">
              <div className="bg-background/90 backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                    {selectedIds.size}
                  </div>
                  <span className="text-sm font-medium">selected</span>
                </div>
                <div className="w-px h-6 bg-border/40" />
                <div className="relative">
                  <Button
                    size="sm"
                    onClick={() => setShowBulkExportMenu(!showBulkExportMenu)}
                    disabled={selectedIds.size === 0}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />Export Selected
                  </Button>
                  <AnimatePresence>
                    {showBulkExportMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute bottom-full left-0 mb-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[140px]"
                      >
                        <button
                          onClick={() => exportSelectedPacks('txt')}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          Export as .TXT
                        </button>
                        <button
                          onClick={() => exportSelectedPacks('md')}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <FileDown className="w-4 h-4 text-muted-foreground" />
                          Export as .MD
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {selectedIds.size === 2 && (
                  <>
                    <div className="w-px h-6 bg-border/40" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setComparePackIds(Array.from(selectedIds));
                        setShowCompareDialog(true);
                      }}
                      className="gap-1.5"
                    >
                      <Columns2 className="w-3.5 h-3.5" />Compare
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
