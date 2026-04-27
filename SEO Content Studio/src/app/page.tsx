'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { HeroSection } from '@/components/seo/HeroSection';
import { ProjectDashboard } from '@/components/seo/ProjectDashboard';
import { NewProjectWizard } from '@/components/seo/NewProjectWizard';
import { ContentPackView } from '@/components/seo/ContentPackView';

export default function Home() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const setProjects = useAppStore((s) => s.setProjects);
  const setCurrentProject = useAppStore((s) => s.setCurrentProject);
  const setCurrentCluster = useAppStore((s) => s.setCurrentCluster);
  const currentProject = useAppStore((s) => s.currentProject);

  useEffect(() => {
    // Load projects on mount
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        console.error('Failed to load projects');
      }
    }
    loadProjects();
  }, [setProjects]);

  const handleNewProject = () => {
    useAppStore.getState().resetWizard();
    setView('wizard');
  };

  const handleViewProject = async (project: { id: string }) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentProject(data);
        if (data.clusters && data.clusters.length > 0) {
          setCurrentCluster(data.clusters[0]);
          setView('pack');
        } else {
          setView('projects');
        }
      }
    } catch (e) {
      console.error('Failed to load project');
    }
  };

  const handleBackToProjects = () => {
    setCurrentProject(null);
    setCurrentCluster(null);
    setView('projects');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => {
              if (view !== 'landing') {
                if (view === 'pack') {
                  handleBackToProjects();
                } else if (view === 'wizard') {
                  setView('projects');
                } else {
                  setView('landing');
                }
              }
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">SEO Content Studio</span>
          </button>

          <nav className="flex items-center gap-2">
            {view === 'landing' && (
              <button
                onClick={() => setView('projects')}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                My Projects
              </button>
            )}
            {(view === 'landing' || view === 'projects') && (
              <button
                onClick={handleNewProject}
                className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                + New Project
              </button>
            )}
            {view === 'wizard' && (
              <button
                onClick={() => setView('projects')}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            )}
            {view === 'pack' && currentProject && (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {currentProject.name}
                </span>
                <button
                  onClick={handleBackToProjects}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  All Projects
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {view === 'landing' && <HeroSection onGetStarted={handleNewProject} onViewProjects={() => setView('projects')} />}
        {view === 'projects' && (
          <ProjectDashboard
            onNewProject={handleNewProject}
            onViewProject={handleViewProject}
          />
        )}
        {view === 'wizard' && <NewProjectWizard />}
        {view === 'pack' && <ContentPackView />}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            AI-Powered SEO Content Generator &mdash; Build ranking-focused content systems
          </p>
          <p className="text-xs text-muted-foreground">
            Designed for business websites, agencies & SaaS companies
          </p>
        </div>
      </footer>
    </div>
  );
}
