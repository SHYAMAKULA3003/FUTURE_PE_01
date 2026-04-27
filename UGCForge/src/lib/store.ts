import { create } from 'zustand';

export interface GeneratedItem {
  type: 'hook' | 'script' | 'cta' | 'caption';
  label: string;
  content: string;
  platform: string;
}

export interface ContentPackData {
  id?: string;
  productName: string;
  productCategory: string;
  businessType: string;
  targetAudience: string;
  platform: string;
  tone: string;
  brandVoice: string;
  keyBenefits: string;
  createdAt?: string;
  contents: GeneratedItem[];
}

interface UGCStore {
  // Form state
  form: {
    productName: string;
    productCategory: string;
    businessType: string;
    targetAudience: string;
    platform: string;
    tone: string;
    brandVoice: string;
    keyBenefits: string;
  };
  setForm: (field: string, value: string) => void;
  resetForm: () => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;

  // Current generated content
  currentPack: ContentPackData | null;
  setCurrentPack: (pack: ContentPackData | null) => void;

  // Saved content packs
  savedPacks: ContentPackData[];
  setSavedPacks: (packs: ContentPackData[]) => void;

  // Active view
  activeView: 'hero' | 'generator' | 'results' | 'library';
  setActiveView: (view: 'hero' | 'generator' | 'results' | 'library') => void;
}

const defaultForm = {
  productName: '',
  productCategory: '',
  businessType: '',
  targetAudience: '',
  platform: 'instagram_reels',
  tone: 'casual',
  brandVoice: '',
  keyBenefits: '',
};

export const useUGCStore = create<UGCStore>((set) => ({
  form: { ...defaultForm },
  setForm: (field, value) =>
    set((state) => ({ form: { ...state.form, [field]: value } })),
  resetForm: () => set({ form: { ...defaultForm } }),

  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),

  currentPack: null,
  setCurrentPack: (pack) => set({ currentPack: pack }),

  savedPacks: [],
  setSavedPacks: (packs) => set({ savedPacks: packs }),

  activeView: 'hero',
  setActiveView: (view) => set({ activeView: view }),
}));
