'use client';

import { useState, useRef, useCallback } from 'react';
import { useAppStore, type KeywordItem, type ClusterSuggestion } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Target,
  Search,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  FileText,
  Layers,
  RefreshCw,
  Timer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const businessTypes = [
  'Dental Clinic',
  'Salon & Spa',
  'Digital Marketing Agency',
  'SaaS Company',
  'Coaching Institute',
  'Diagnostic Center',
  'Real Estate Agency',
  'Legal Services',
  'Restaurant',
  'Gym & Fitness',
  'Photography Studio',
  'Plumbing Service',
  'Auto Repair Shop',
  'Accounting Firm',
  'Architecture Firm',
  'Other',
];

const intentColors: Record<string, string> = {
  informational: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  navigational: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  commercial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  transactional: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const difficultyColors: Record<string, string> = {
  low: 'text-emerald-600',
  medium: 'text-amber-600',
  high: 'text-rose-600',
};

export function NewProjectWizard() {
  const {
    wizardStep,
    setWizardStep,
    wizardData,
    setWizardData,
    keywordStrategy,
    setKeywordStrategy,
    selectedCluster,
    setSelectedCluster,
    isLoading,
    setIsLoading,
    generatingStatus,
    setGeneratingStatus,
    setView,
    setProjects,
    setCurrentProject,
    setCurrentCluster,
  } = useAppStore();

  const [error, setError] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  // Step 1 validation
  const isStep1Valid = wizardData.name && wizardData.businessType && wizardData.city;

  // Cleanup polling on unmount
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Generate keywords
  const handleGenerateKeywords = async () => {
    setIsLoading(true);
    setError('');
    setGeneratingStatus('Analyzing your business and generating keyword strategy...');
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 180000);

      const res = await fetch('/api/generate/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wizardData),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }
      const data = await res.json();
      setKeywordStrategy(data);
      setWizardStep(2);
    } catch (e) {
      const msg = e instanceof Error && e.name === 'AbortError'
        ? 'Request timed out. The AI is taking too long. Please try again.'
        : e instanceof Error
        ? `Failed to generate keywords: ${e.message}`
        : 'Failed to generate keyword strategy. Please try again.';
      setError(msg);
    }
    setIsLoading(false);
  };

  // Regenerate keywords
  const handleRegenerateKeywords = async () => {
    setIsLoading(true);
    setGeneratingStatus('Regenerating keyword strategy with fresh insights...');
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 180000);

      const res = await fetch('/api/generate/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wizardData),
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed');
      }
      const data = await res.json();
      setKeywordStrategy(data);
    } catch (e) {
      const msg = e instanceof Error
        ? `Failed to regenerate: ${e.message}`
        : 'Failed to regenerate. Please try again.';
      setError(msg);
    }
    setIsLoading(false);
  };

  // Poll for project completion
  const startPolling = useCallback((projectId: string, projectData: Record<string, unknown>) => {
    pollCountRef.current = 0;
    setPollCount(0);

    pollRef.current = setInterval(async () => {
      try {
        pollCountRef.current += 1;
        setPollCount(pollCountRef.current);

        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          stopPolling();
          setError('Failed to check generation status. Check your projects page.');
          setIsLoading(false);
          return;
        }

        const updatedProject = await res.json();

        if (updatedProject.status === 'ready') {
          stopPolling();

          // Load the completed project with all relations
          const fullRes = await fetch(`/api/projects/${projectId}`);
          if (fullRes.ok) {
            const fullProject = await fullRes.json();
            setCurrentProject(fullProject);

            if (fullProject.clusters && fullProject.clusters.length > 0) {
              setCurrentCluster(fullProject.clusters[0]);
            }
          }

          // Refresh projects list
          const allProjects = await fetch('/api/projects');
          if (allProjects.ok) {
            setProjects(await allProjects.json());
          }

          setGeneratingStatus('Content pack generated successfully!');
          setTimeout(() => {
            setView('pack');
            setIsLoading(false);
          }, 500);
          return;
        }

        if (updatedProject.status === 'draft') {
          // Generation failed and was reset
          stopPolling();
          const errMsg = updatedProject.generationMsg || 'Content generation failed. Please try again.';
          setError(errMsg);
          setIsLoading(false);
          return;
        }

        // Still generating - use server progress message
        if (updatedProject.generationMsg) {
          setGeneratingStatus(updatedProject.generationMsg);
        }

        // Safety timeout: 10 minutes
        if (pollCountRef.current > 200) {
          stopPolling();
          setError('Generation is taking too long. Please check your projects page later.');
          setIsLoading(false);
        }
      } catch {
        // Network error - keep polling
      }
    }, 3000); // Poll every 3 seconds
  }, [stopPolling, setCurrentProject, setCurrentCluster, setGeneratingStatus, setProjects, setView, setIsLoading]);

  // Select cluster and generate (async + polling)
  const handleGenerateContentPack = async () => {
    if (!selectedCluster) return;
    setIsLoading(true);
    setError('');
    setPollCount(0);

    try {
      // Step 1: Create project
      setGeneratingStatus('Creating your project...');
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...wizardData,
          keywords: [
            selectedCluster.pillarKeyword,
            ...selectedCluster.supportingTopics.map((t) => t.keyword),
          ],
        }),
      });

      if (!projectRes.ok) {
        const errData = await projectRes.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to create project (${projectRes.status})`);
      }
      const project = await projectRes.json();

      // Step 2: Start background generation (returns immediately)
      setGeneratingStatus('Starting AI content generation...');
      const packRes = await fetch('/api/generate/full-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          clusterName: selectedCluster.pillarTopic,
          pillarTopic: selectedCluster.pillarTopic,
          pillarKeyword: selectedCluster.pillarKeyword,
          supportingTopics: selectedCluster.supportingTopics,
        }),
      });

      if (!packRes.ok) {
        const errData = await packRes.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to start generation (${packRes.status})`);
      }

      // Step 3: Start polling for completion
      setGeneratingStatus('AI is generating your content cluster... This takes 2-4 minutes.');
      startPolling(project.id, project);
    } catch (e) {
      const msg = e instanceof Error
        ? e.message
        : 'Failed to generate content pack. Please try again.';
      setError(msg);
      setIsLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Business Profile' },
    { num: 2, label: 'Keyword Strategy' },
    { num: 3, label: 'Generate Pack' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {steps.map((step) => (
            <div key={step.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  wizardStep >= step.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {wizardStep > step.num ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  wizardStep >= step.num ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {step.num < steps.length && (
                <div className="w-8 sm:w-16 h-px mx-1 sm:mx-3 bg-border" />
              )}
            </div>
          ))}
        </div>
        <Progress value={((wizardStep - 1) / (steps.length - 1)) * 100} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Business Profile */}
        {wizardStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  Business Profile
                </CardTitle>
                <CardDescription>
                  Tell us about the business you want to create SEO content for. This information helps generate the most relevant keywords and content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Business Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Smile Bright Dental Clinic"
                      value={wizardData.name}
                      onChange={(e) => setWizardData({ name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <select
                      id="businessType"
                      value={wizardData.businessType}
                      onChange={(e) => setWizardData({ businessType: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select business type</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> City *
                    </Label>
                    <Input
                      id="city"
                      placeholder="e.g., Bangalore"
                      value={wizardData.city}
                      onChange={(e) => setWizardData({ city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Region</Label>
                    <Input
                      id="state"
                      placeholder="e.g., Karnataka"
                      value={wizardData.state}
                      onChange={(e) => setWizardData({ state: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Business Description
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Briefly describe the business, its services, and what makes it unique..."
                    value={wizardData.description}
                    onChange={(e) => setWizardData({ description: e.target.value })}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Website
                    </Label>
                    <Input
                      id="website"
                      placeholder="e.g., www.smilebright.com"
                      value={wizardData.website}
                      onChange={(e) => setWizardData({ website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience" className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Target Audience
                    </Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Families, young professionals"
                      value={wizardData.targetAudience}
                      onChange={(e) => setWizardData({ targetAudience: e.target.value })}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
                )}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleGenerateKeywords}
                    disabled={!isStep1Valid || isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 min-w-[200px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Keywords
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Keyword Strategy */}
        {wizardStep === 2 && keywordStrategy && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-600" />
                      Keyword Strategy
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      AI-generated keywords for {wizardData.name} in {wizardData.city}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateKeywords}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="primary">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="primary" className="text-xs">
                      <Target className="w-3.5 h-3.5 mr-1 hidden sm:block" />
                      Primary
                    </TabsTrigger>
                    <TabsTrigger value="secondary" className="text-xs">
                      <Search className="w-3.5 h-3.5 mr-1 hidden sm:block" />
                      Secondary
                    </TabsTrigger>
                    <TabsTrigger value="longtail" className="text-xs">
                      <TrendingUp className="w-3.5 h-3.5 mr-1 hidden sm:block" />
                      Long-Tail
                    </TabsTrigger>
                    <TabsTrigger value="local" className="text-xs">
                      <MapPin className="w-3.5 h-3.5 mr-1 hidden sm:block" />
                      Local
                    </TabsTrigger>
                  </TabsList>

                  {[
                    { key: 'primary', data: keywordStrategy.primaryKeywords },
                    { key: 'secondary', data: keywordStrategy.secondaryKeywords },
                    { key: 'longtail', data: keywordStrategy.longTailKeywords },
                    { key: 'local', data: keywordStrategy.localKeywords },
                  ].map(({ key, data }) => (
                    <TabsContent key={key} value={key}>
                      <div className="max-h-64 overflow-y-auto rounded-lg border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Keyword</th>
                              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Intent</th>
                              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Difficulty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(data || []).map((kw: KeywordItem, i: number) => (
                              <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-2.5 font-medium">{kw.keyword}</td>
                                <td className="px-4 py-2.5 hidden sm:table-cell">
                                  <Badge variant="secondary" className={intentColors[kw.searchIntent] || ''}>
                                    {kw.searchIntent}
                                  </Badge>
                                </td>
                                <td className={`px-4 py-2.5 hidden md:table-cell font-medium ${difficultyColors[kw.difficulty] || ''}`}>
                                  {kw.difficulty}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Cluster Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Choose Content Cluster
                </CardTitle>
                <CardDescription>
                  Select a content cluster to generate your pillar blog and supporting articles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(keywordStrategy.contentClusterSuggestions || []).map(
                  (cluster: ClusterSuggestion, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCluster(cluster)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedCluster?.pillarTopic === cluster.pillarTopic
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-border hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            {selectedCluster?.pillarTopic === cluster.pillarTopic && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                            <h4 className="font-semibold">{cluster.pillarTopic}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Pillar keyword: <span className="font-medium text-foreground">{cluster.pillarKeyword}</span>
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(cluster.supportingTopics || []).map((topic, tIdx) => (
                          <Badge key={tIdx} variant="outline" className="text-xs">
                            {topic.topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
                )}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => { stopPolling(); setWizardStep(1); setIsLoading(false); }}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleGenerateContentPack}
                    disabled={!selectedCluster || isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 min-w-[200px]"
                  >
                    {isLoading && pollCount > 0 ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Content Pack
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generation Progress Overlay */}
            {isLoading && pollCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-card border rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">AI is Writing Your Content</h3>
                    <p className="text-sm text-muted-foreground">{generatingStatus}</p>
                  </div>

                  {/* Animated progress dots */}
                  <div className="flex justify-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-emerald-600"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Timer className="w-3.5 h-3.5" />
                    <span>This typically takes 3-5 minutes</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      stopPolling();
                      setIsLoading(false);
                      setError('Generation was cancelled. You can check your projects page for partial results.');
                    }}
                  >
                    Cancel
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
