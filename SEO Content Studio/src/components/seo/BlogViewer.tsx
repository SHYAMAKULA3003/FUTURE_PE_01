'use client';

import type { BlogPost } from '@/lib/store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Crown,
  FileText,
  Target,
  Search,
  Eye,
  Clock,
  Link2,
  BarChart3,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { SeoScoreRing } from './SeoScoreRing';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const intentColors: Record<string, string> = {
  informational: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  navigational: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  commercial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  transactional: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

export function BlogViewer({ blog }: { blog: BlogPost }) {
  const [copiedMeta, setCopiedMeta] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  let secondaryKeywords: string[] = [];
  let internalLinks: string[] = [];
  let headingStructure: any = null;
  try { secondaryKeywords = JSON.parse(blog.secondaryKeywords || '[]'); } catch {}
  try { internalLinks = JSON.parse(blog.internalLinks || '[]'); } catch {}
  try { headingStructure = JSON.parse(blog.headingStructure || 'null'); } catch {}

  const handleCopyMeta = () => {
    navigator.clipboard.writeText(
      `Title: ${blog.metaTitle}\nDescription: ${blog.metaDescription}\nSlug: ${blog.slug}`
    );
    setCopiedMeta(true);
    setTimeout(() => setCopiedMeta(false), 2000);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(blog.content || '');
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Blog Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {blog.type === 'pillar' ? (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Pillar Blog
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <FileText className="w-3 h-3 mr-1" />
                    Supporting Blog
                  </Badge>
                )}
                <Badge variant="secondary" className={intentColors[blog.searchIntent] || ''}>
                  {blog.searchIntent}
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">{blog.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  {blog.targetKeyword}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {blog.wordCount.toLocaleString()} words
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <SeoScoreRing score={blog.seoScore} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Content / SEO Details / Outline */}
      <Tabs defaultValue="content">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="content" className="text-xs sm:text-sm">
            <BookOpen className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
            Content
          </TabsTrigger>
          <TabsTrigger value="seo" className="text-xs sm:text-sm">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
            SEO Details
          </TabsTrigger>
          <TabsTrigger value="outline" className="text-xs sm:text-sm">
            <FileText className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
            Outline
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="mt-4">
          <Card>
            <CardContent className="p-6 sm:p-8">
              {blog.content ? (
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={handleCopyContent}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                    >
                      {copiedContent ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedContent ? 'Copied!' : 'Copy Markdown'}
                    </button>
                  </div>
                  <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h1:sm:text-3xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-p:leading-relaxed prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-li:marker:text-emerald-600 dark:prose-li:marker:text-emerald-400">
                    <ReactMarkdown>{blog.content}</ReactMarkdown>
                  </article>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Content is being generated...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Details Tab */}
        <TabsContent value="seo" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meta Tags */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Meta Tags
                  </h3>
                  <button
                    onClick={handleCopyMeta}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
                  >
                    {copiedMeta ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedMeta ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Meta Title</p>
                  <div className="p-2.5 bg-muted/50 rounded-lg text-sm font-medium">
                    {blog.metaTitle || 'Not set'}
                    <span className="block text-[10px] text-muted-foreground mt-1">
                      {(blog.metaTitle || '').length}/60 characters
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Meta Description</p>
                  <div className="p-2.5 bg-muted/50 rounded-lg text-sm">
                    {blog.metaDescription || 'Not set'}
                    <span className="block text-[10px] text-muted-foreground mt-1">
                      {(blog.metaDescription || '').length}/160 characters
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">URL Slug</p>
                  <div className="p-2.5 bg-muted/50 rounded-lg text-sm font-mono text-emerald-600 dark:text-emerald-400">
                    /blog/{blog.slug || 'not-set'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keywords & Links */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Keywords & Links
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Target Keyword</p>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {blog.targetKeyword}
                  </Badge>
                </div>
                {secondaryKeywords.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Secondary Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {secondaryKeywords.map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {internalLinks.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> Internal Links
                    </p>
                    <div className="space-y-1">
                      {internalLinks.map((link, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                          <Link2 className="w-3 h-3 shrink-0" />
                          <span>/blog/{link}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search Preview */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Google Search Preview
                </h3>
              </CardHeader>
              <CardContent>
                <div className="max-w-xl p-4 bg-white dark:bg-zinc-900 rounded-lg border">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 mb-1 truncate">
                    yourbusiness.com › blog › {blog.slug || 'article'}
                  </div>
                  <h4 className="text-lg text-blue-700 dark:text-blue-400 hover:underline cursor-pointer leading-snug mb-1">
                    {blog.metaTitle || blog.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {blog.metaDescription || 'No meta description set.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outline Tab */}
        <TabsContent value="outline" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold text-sm">Content Outline</h3>
            </CardHeader>
            <CardContent>
              {headingStructure ? (
                <div className="space-y-4">
                  {headingStructure.introduction && (
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-600 mb-1">Introduction</h4>
                      <p className="text-sm text-muted-foreground">{headingStructure.introduction}</p>
                    </div>
                  )}
                  {(headingStructure.sections || []).map((section: any, i: number) => (
                    <div key={i} className="ml-2 border-l-2 border-emerald-200 dark:border-emerald-800 pl-4">
                      <h4 className="text-sm font-semibold">{section.heading}</h4>
                      {(section.subsections || []).map((sub: any, j: number) => (
                        <div key={j} className="mt-2 ml-3">
                          <h5 className="text-sm font-medium text-muted-foreground">{sub.heading}</h5>
                          {(sub.points || []).map((point: string, k: number) => (
                            <p key={k} className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-1.5 shrink-0">•</span>
                              {point}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                  {headingStructure.conclusion && (
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-semibold text-emerald-600 mb-1">Conclusion</h4>
                      <p className="text-sm text-muted-foreground">{headingStructure.conclusion}</p>
                    </div>
                  )}
                  {headingStructure.cta && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                      <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">CTA</h4>
                      <p className="text-sm text-muted-foreground">{headingStructure.cta}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No outline available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
