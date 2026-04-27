'use client';

import { motion } from 'framer-motion';
import { Target, Search, Building2, ShieldCheck, Zap, Globe } from 'lucide-react';

const features = [
  { icon: Target, title: 'Tone-Adapted Copy', description: 'Friendly, Professional, and Confident-Simple tone variants to match your client\'s brand voice.', color: '#2b4cff' },
  { icon: Search, title: 'SEO Optimized', description: 'Meta tags, JSON-LD structured data, and local keywords built into every generated page.', color: '#00ffd9' },
  { icon: Building2, title: '5 Business Templates', description: 'Salon, Cafe, Clinic, Coaching, and Agency — ready-to-use templates with proven copy frameworks.', color: '#2b4cff' },
  { icon: ShieldCheck, title: 'Quality Enforced', description: 'Word counts, localization checks, and concrete claims only. No fluff, no hallucinations.', color: '#00ffd9' },
  { icon: Zap, title: 'Batch Generation', description: 'CSV input, CLI automation, and GitHub Actions CI/CD for scaling across hundreds of businesses.', color: '#2b4cff' },
  { icon: Globe, title: 'Localization Ready', description: 'Multi-language support with Telugu, Hindi, and Spanish guides included out of the box.', color: '#00ffd9' },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Ship Fast</span>
          </h2>
          <p className="text-[#94a3b8] text-base sm:text-lg max-w-2xl mx-auto">
            A complete copy generation toolkit designed for agencies and freelancers who build websites for local businesses.
          </p>
        </motion.div>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="glass-card p-6 group hover:border-[rgba(43,76,255,0.4)] transition-all duration-300 cursor-default">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300" style={{ backgroundColor: `${feature.color}15`, border: `1px solid ${feature.color}30` }}>
                <feature.icon size={22} style={{ color: feature.color }} className="group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-semibold text-[#e2e8f0] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}