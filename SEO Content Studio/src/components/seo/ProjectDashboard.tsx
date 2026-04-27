'use client';

import { useAppStore, type Project } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Calendar,
  Trash2,
  Eye,
  FolderOpen,
  FileText,
  Plus,
} from 'lucide-react';
import { useState } from 'react';

interface ProjectDashboardProps {
  onNewProject: () => void;
  onViewProject: (project: Project) => void;
}

const businessTypeIcons: Record<string, string> = {
  salon: '💇',
  clinic: '🏥',
  'diagnostic center': '🔬',
  'coaching institute': '📚',
  'digital agency': '💻',
  saas: '☁️',
  restaurant: '🍽️',
  gym: '🏋️',
  'real estate': '🏠',
  'legal services': '⚖️',
  dental: '🦷',
  spa: '🧖',
  default: '🏢',
};

function getBusinessIcon(type: string): string {
  const lower = type.toLowerCase();
  for (const [key, icon] of Object.entries(businessTypeIcons)) {
    if (lower.includes(key)) return icon;
  }
  return businessTypeIcons.default;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  generating: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  exported: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
};

export function ProjectDashboard({ onNewProject, onViewProject }: ProjectDashboardProps) {
  const projects = useAppStore((s) => s.projects);
  const setProjects = useAppStore((s) => s.setProjects);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== projectId));
      }
    } catch {}
    setDeletingId(null);
  };

  const totalBlogs = projects.reduce((acc, p) => {
    return acc + (p.clusters?.reduce((c, cl) => c + (cl.blogs?.length || 0), 0) || 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Projects</h1>
        <p className="text-muted-foreground">
          Manage your SEO content projects. {projects.length} project{projects.length !== 1 ? 's' : ''} &middot; {totalBlogs} blog{totalBlogs !== 1 ? 's' : ''} generated
        </p>
      </div>

      {projects.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <FolderOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create your first SEO content project to generate pillar blogs, supporting articles, and complete content clusters.
          </p>
          <Button onClick={onNewProject} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Create First Project
          </Button>
        </motion.div>
      ) : (
        /* Project Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="h-full cursor-pointer hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 group"
                  onClick={() => onViewProject(project)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getBusinessIcon(project.businessType)}</span>
                        <div>
                          <CardTitle className="text-base font-semibold group-hover:text-emerald-600 transition-colors">
                            {project.name}
                          </CardTitle>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {project.businessType}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className={statusColors[project.status]}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{project.city}{project.state ? `, ${project.state}` : ''}</span>
                      </div>
                      {project.description && (
                        <p className="text-muted-foreground text-xs line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 pt-2 border-t">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <FileText className="w-3.5 h-3.5" />
                          {project.clusters?.reduce((acc, c) => acc + (c.blogs?.length || 0), 0) || 0} blogs
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProject(project);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View Pack
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(e, project.id)}
                        disabled={deletingId === project.id}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Project Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: projects.length * 0.05 + 0.1 }}
          >
            <Card
              className="h-full border-dashed hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer group"
              onClick={onNewProject}
            >
              <CardContent className="h-full flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  New Project
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
