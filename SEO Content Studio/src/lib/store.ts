import { create } from 'zustand';

// Types
export interface Project {
  id: string;
  name: string;
  businessType: string;
  city: string;
  state: string;
  description: string;
  website: string;
  targetAudience: string;
  keywords: string;
  status: 'draft' | 'generating' | 'ready' | 'exported';
  generationMsg: string;
  createdAt: string;
  updatedAt: string;
  clusters?: ContentCluster[];
}

export interface ContentCluster {
  id: string;
  projectId: string;
  name: string;
  pillarTopic: string;
  keywords: string;
  status: 'outline' | 'generating' | 'ready';
  createdAt: string;
  updatedAt: string;
  blogs?: BlogPost[];
  project?: Project;
}

export interface BlogPost {
  id: string;
  clusterId: string;
  title: string;
  slug: string;
  type: 'pillar' | 'supporting';
  targetKeyword: string;
  secondaryKeywords: string;
  searchIntent: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  wordCount: number;
  headingStructure: string;
  internalLinks: string;
  seoScore: number;
  status: 'outline' | 'generating' | 'ready' | 'published';
  createdAt: string;
  updatedAt: string;
  cluster?: ContentCluster;
}

export interface KeywordItem {
  keyword: string;
  searchIntent: string;
  monthlyVolume: string;
  difficulty: string;
}

export interface ClusterSuggestion {
  pillarTopic: string;
  pillarKeyword: string;
  supportingTopics: {
    topic: string;
    keyword: string;
    searchIntent: string;
  }[];
}

export interface KeywordStrategy {
  primaryKeywords: KeywordItem[];
  secondaryKeywords: KeywordItem[];
  longTailKeywords: KeywordItem[];
  localKeywords: KeywordItem[];
  contentClusterSuggestions: ClusterSuggestion[];
}

// View states
export type ViewState = 'landing' | 'projects' | 'wizard' | 'pack';

interface AppState {
  // Navigation
  view: ViewState;
  setView: (view: ViewState) => void;

  // Projects
  projects: Project[];
  currentProject: Project | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;

  // Wizard state
  wizardStep: number;
  setWizardStep: (step: number) => void;
  wizardData: {
    name: string;
    businessType: string;
    city: string;
    state: string;
    description: string;
    website: string;
    targetAudience: string;
  };
  setWizardData: (data: Partial<AppState['wizardData']>) => void;
  keywordStrategy: KeywordStrategy | null;
  setKeywordStrategy: (strategy: KeywordStrategy | null) => void;
  selectedCluster: ClusterSuggestion | null;
  setSelectedCluster: (cluster: ClusterSuggestion | null) => void;

  // Content Pack
  currentCluster: ContentCluster | null;
  setCurrentCluster: (cluster: ContentCluster | null) => void;
  selectedBlogId: string | null;
  setSelectedBlogId: (id: string | null) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  generatingStatus: string;
  setGeneratingStatus: (status: string) => void;

  // Reset
  resetWizard: () => void;
}

const defaultWizardData = {
  name: '',
  businessType: '',
  city: '',
  state: '',
  description: '',
  website: '',
  targetAudience: '',
};

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  view: 'landing',
  setView: (view) => set({ view }),

  // Projects
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),

  // Wizard
  wizardStep: 1,
  setWizardStep: (step) => set({ wizardStep: step }),
  wizardData: { ...defaultWizardData },
  setWizardData: (data) =>
    set((state) => ({ wizardData: { ...state.wizardData, ...data } })),
  keywordStrategy: null,
  setKeywordStrategy: (strategy) => set({ keywordStrategy: strategy }),
  selectedCluster: null,
  setSelectedCluster: (cluster) => set({ selectedCluster: cluster }),

  // Content Pack
  currentCluster: null,
  setCurrentCluster: (cluster) => set({ currentCluster: cluster }),
  selectedBlogId: null,
  setSelectedBlogId: (id) => set({ selectedBlogId: id }),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  generatingStatus: '',
  setGeneratingStatus: (status) => set({ generatingStatus: status }),

  // Reset
  resetWizard: () =>
    set({
      wizardStep: 1,
      wizardData: { ...defaultWizardData },
      keywordStrategy: null,
      selectedCluster: null,
    }),
}));
