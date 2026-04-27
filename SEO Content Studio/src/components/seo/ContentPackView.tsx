'use client';

import { useAppStore, type BlogPost } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  MapPin,
  FileText,
  Crown,
  BookOpen,
  Download,
} from 'lucide-react';
import { BlogViewer } from './BlogViewer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function ContentPackView() {
  const {
    currentProject,
    currentCluster,
    selectedBlogId,
    setSelectedBlogId,
    setCurrentCluster,
    setView,
  } = useAppStore();

  const [exporting, setExporting] = useState(false);

  if (!currentProject || !currentCluster) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">No content pack selected.</p>
        <Button variant="outline" className="mt-4" onClick={() => setView('projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const blogs = currentCluster.blogs || [];
  const pillarBlog = blogs.find((b) => b.type === 'pillar');
  const supportingBlogs = blogs.filter((b) => b.type === 'supporting');
  const selectedBlog = blogs.find((b) => b.id === selectedBlogId);

  const totalWords = blogs.reduce((acc, b) => acc + (b.wordCount || 0), 0);
  const avgSeoScore = blogs.length > 0
    ? Math.round(blogs.reduce((acc, b) => acc + (b.seoScore || 0), 0) / blogs.length)
    : 0;

  const handleExport = async () => {
    setExporting(true);
    try {
      let markdown = `# SEO Content Pack: ${currentProject.name}\n\n`;
      markdown += `**Business:** ${currentProject.name} (${currentProject.businessType})\n`;
      markdown += `**Location:** ${currentProject.city}${currentProject.state ? ', ' + currentProject.state : ''}\n`;
      markdown += `**Cluster:** ${currentCluster.name}\n`;
      markdown += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
      markdown += `---\n\n`;

      for (const blog of blogs) {
        markdown += `## ${blog.type === 'pillar' ? '👑 PILLAR BLOG' : '📝 SUPPORTING BLOG'}: ${blog.title}\n\n`;
        markdown += `- **Target Keyword:** ${blog.targetKeyword}\n`;
        markdown += `- **Search Intent:** ${blog.searchIntent}\n`;
        markdown += `- **Word Count:** ${blog.wordCount}\n`;
        markdown += `- **SEO Score:** ${blog.seoScore}/100\n`;
        markdown += `- **Meta Title:** ${blog.metaTitle}\n`;
        markdown += `- **Meta Description:** ${blog.metaDescription}\n`;
        try {
          const secKw = JSON.parse(blog.secondaryKeywords || '[]');
          if (secKw.length) markdown += `- **Secondary Keywords:** ${secKw.join(', ')}\n`;
        } catch {}
        try {
          const links = JSON.parse(blog.internalLinks || '[]');
          if (links.length) markdown += `- **Internal Links:** ${links.join(', ')}\n`;
        } catch {}
        markdown += `\n---\n\n`;
        if (blog.content) {
          markdown += blog.content + '\n\n';
        }
        markdown += `\n---\n\n`;
      }

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name.replace(/\s+/g, '-').toLowerCase()}-seo-content-pack.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
    setExporting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Project Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Building2 className="w-3.5 h-3.5" />
              {currentProject.businessType}
              <MapPin className="w-3.5 h-3.5 ml-2" />
              {currentProject.city}
            </div>
            <h1 className="text-2xl font-bold">{currentProject.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Content Cluster: {currentCluster.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              <Download className="w-4 h-4 mr-1.5" />
              {exporting ? 'Exporting...' : 'Export Pack'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{blogs.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Blogs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalWords.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Words</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{avgSeoScore}</div>
            <div className="text-xs text-muted-foreground mt-1">Avg SEO Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{supportingBlogs.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Supporting Blogs</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Blog List Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-20">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Content Pack
            </h2>
            <ScrollArea className="max-h-[calc(100vh-12rem)]">
              <div className="space-y-2 pr-3">
                {/* Pillar Blog */}
                {pillarBlog && (
                  <BlogListItem
                    blog={pillarBlog}
                    isSelected={selectedBlogId === pillarBlog.id}
                    onClick={() => setSelectedBlogId(pillarBlog.id)}
                  />
                )}

                {/* Supporting Blogs */}
                {supportingBlogs.length > 0 && (
                  <>
                    <div className="pt-2">
                      <p className="text-xs font-medium text-muted-foreground px-2 uppercase tracking-wider">
                        Supporting Blogs
                      </p>
                    </div>
                    {supportingBlogs.map((blog) => (
                      <BlogListItem
                        key={blog.id}
                        blog={blog}
                        isSelected={selectedBlogId === blog.id}
                        onClick={() => setSelectedBlogId(blog.id)}
                      />
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Blog Content Area */}
        <div className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            {selectedBlog ? (
              <motion.div
                key={selectedBlog.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <BlogViewer blog={selectedBlog} />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Select a Blog</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a blog from the list to view its content and SEO details.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Blog List Item Component
function BlogListItem({
  blog,
  isSelected,
  onClick,
}: {
  blog: BlogPost;
  isSelected: boolean;
  onClick: () => void;
}) {
  const scoreColor = blog.seoScore >= 70 ? 'text-emerald-600' : blog.seoScore >= 40 ? 'text-amber-600' : 'text-rose-600';

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500 shadow-sm'
          : 'hover:bg-muted/50 border-2 border-transparent hover:border-border'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {blog.type === 'pillar' ? (
          <Crown className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        ) : (
          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium line-clamp-2 leading-snug">{blog.title}</h4>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`text-xs font-semibold ${scoreColor}`}>
              {blog.seoScore}/100
            </span>
            <span className="text-xs text-muted-foreground">
              {blog.wordCount.toLocaleString()} words
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {blog.targetKeyword}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
