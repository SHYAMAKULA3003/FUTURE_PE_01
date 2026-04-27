'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-[rgba(43,76,255,0.15)] rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 bg-[rgba(0,255,217,0.1)] rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[rgba(43,76,255,0.08)] rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 sm:mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[rgba(43,76,255,0.12)] border border-[rgba(43,76,255,0.25)] text-[#00ffd9]">
            <Sparkles size={14} />
            AI-Powered Copy Generation
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
          <span className="gradient-text">Generate Website Copy</span>
          <br />
          <span className="text-[#e2e8f0]">That Converts</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="text-base sm:text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          AI-powered copy framework for local businesses. Salon, cafe, clinic, coaching, agency — production-ready in minutes.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16">
          <button className="bg-gradient-to-r from-[#2b4cff] to-[#00ffd9] text-[#0b1020] font-semibold hover:opacity-90 transition-all rounded-full px-8 py-6 text-base inline-flex items-center gap-2 shadow-lg shadow-[rgba(43,76,255,0.25)] cursor-pointer border-none">
            Start Generating
            <ArrowRight size={18} />
          </button>
          <button className="rounded-full px-8 py-6 text-base border-[rgba(43,76,255,0.3)] text-[#e2e8f0] hover:bg-[rgba(43,76,255,0.08)] hover:border-[rgba(0,255,217,0.3)] inline-flex items-center gap-2 cursor-pointer bg-transparent">
            View Templates
            <ChevronRight size={18} />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-12 sm:mb-16">
          {[
            { value: '5', label: 'Business Types' },
            { value: '3', label: 'Tone Variants' },
            { value: '100+', label: 'Businesses Served' },
          ].map((stat, index) => (
            <div key={stat.label} className="flex items-center gap-2 sm:gap-3">
              {index > 0 && <span className="hidden sm:block w-px h-8 bg-[rgba(43,76,255,0.2)]" />}
              <span className="text-xl sm:text-2xl font-bold gradient-text">{stat.value}</span>
              <span className="text-sm sm:text-base text-[#94a3b8]">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="max-w-3xl mx-auto">
          <div className="glass-card p-1">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(43,76,255,0.1)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[rgba(255,100,100,0.7)]" />
                <div className="w-3 h-3 rounded-full bg-[rgba(255,200,50,0.7)]" />
                <div className="w-3 h-3 rounded-full bg-[rgba(100,255,100,0.7)]" />
              </div>
              <span className="text-xs text-[#94a3b8] font-mono ml-2">copyforge.ai/preview</span>
            </div>
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm text-left overflow-x-auto">
              <div className="space-y-1">
                <p className="text-[#94a3b8]">
                  <span className="text-[#2b4cff]">&lt;h1&gt;</span>
                  <span className="text-[#e2e8f0] font-semibold">&quot;Your Smile, Our Passion — Bloom &amp; Co. Salon&quot;</span>
                  <span className="text-[#2b4cff]">&lt;/h1&gt;</span>
                </p>
                <p className="text-[#94a3b8]">
                  <span className="text-[#2b4cff]">&lt;p&gt;</span>
                  <span className="text-[#e2e8f0]">Vizag&apos;s favorite salon for hair, skin &amp; bridal makeovers</span>
                  <span className="text-[#2b4cff]">&lt;/p&gt;</span>
                </p>
                <p className="text-[#94a3b8]"><span className="text-[#00ffd9]">{'// JSON-LD included ✓'}</span></p>
                <p className="text-[#94a3b8]"><span className="text-[#00ffd9]">{'// SEO meta tags ✓'}</span></p>
                <p className="text-[#94a3b8]"><span className="text-[#00ffd9]">{'// 3 tone variants ✓'}</span></p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}