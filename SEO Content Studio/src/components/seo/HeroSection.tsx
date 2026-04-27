'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  Target,
  FileText,
  MapPin,
  Link2,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface HeroSectionProps {
  onGetStarted: () => void;
  onViewProjects: () => void;
}

const features = [
  {
    icon: Target,
    title: 'Keyword Strategy',
    description: 'AI-generated keyword research with search intent analysis, difficulty scores, and content cluster suggestions.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    icon: FileText,
    title: 'Pillar Blog Generation',
    description: 'Comprehensive, authority-building pillar articles with proper H1-H3 structure, meta tags, and SEO optimization.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: Link2,
    title: 'Content Clusters',
    description: '3-5 supporting blogs per cluster with strategic internal linking to boost topical authority.',
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
  },
  {
    icon: MapPin,
    title: 'Local SEO Focus',
    description: 'City and service-area optimized content that attracts local search traffic for your business.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  {
    icon: BarChart3,
    title: 'SEO Score Analysis',
    description: 'Real-time SEO scoring for every generated article with keyword density, readability, and structure checks.',
    color: 'text-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
  },
  {
    icon: Sparkles,
    title: 'Reusable System',
    description: 'Build content packs for any business type — salons, clinics, agencies, SaaS, coaching, and more.',
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export function HeroSection({ onGetStarted, onViewProjects }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-amber-50/30 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          className="pt-20 pb-16 sm:pt-28 sm:pb-20 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered SEO Content System
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Generate{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              Ranking-Focused
            </span>{' '}
            Content Clusters
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Build pillar blogs, supporting articles, and complete SEO content packs for any business.
            Exactly how professional agencies and SaaS companies work.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40"
            >
              Create SEO Content Pack
            </button>
            <button
              onClick={onViewProjects}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors"
            >
              View My Projects
            </button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div {...fadeUp} className="pb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Business Profile', desc: 'Enter your business type, name, and location' },
              { step: '2', title: 'Keyword Strategy', desc: 'AI generates targeted keywords and search intent' },
              { step: '3', title: 'Content Cluster', desc: 'Choose a cluster topic with pillar + supporting blogs' },
              { step: '4', title: 'Generate & Export', desc: 'AI writes complete, SEO-optimized blog content' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
