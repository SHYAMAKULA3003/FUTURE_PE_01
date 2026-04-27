'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Sliders, Rocket } from 'lucide-react';

const steps = [
  { number: 1, icon: ClipboardList, title: 'Fill Business Details', description: "Enter your client's name, city, services, pricing, and USPs into a simple form or CSV.", color: '#2b4cff' },
  { number: 2, icon: Sliders, title: 'Choose Tone & Format', description: 'Select Friendly, Professional, or Confident-Simple. Output as Markdown, HTML, or CSV.', color: '#00ffd9' },
  { number: 3, icon: Rocket, title: 'Generate & Deploy', description: 'Get homepage, services, CTA, FAQ, JSON-LD, and meta tags — ready to paste into any CMS.', color: '#2b4cff' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Three Steps to <span className="gradient-text">Production-Ready Copy</span>
          </h2>
          <p className="text-[#94a3b8] text-base sm:text-lg max-w-2xl mx-auto">From business details to deployed website copy in minutes, not hours.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-6 relative">
          <div className="hidden md:block absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px">
            <div className="w-full h-full bg-gradient-to-r from-[#2b4cff] via-[#00ffd9] to-[#2b4cff] opacity-20" />
          </div>
          {steps.map((step, index) => (
            <motion.div key={step.number} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 }} className="flex flex-col items-center text-center relative">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${step.color}20, ${step.color}05)`, border: `1px solid ${step.color}40` }}>
                  <step.icon size={28} style={{ color: step.color }} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: step.color }}>
                  {step.number}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#e2e8f0] mb-2">{step.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}