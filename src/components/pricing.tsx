'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const plans = [
  { name: 'Starter', price: '$0', period: 'forever', description: 'Perfect for trying out CopyForge', highlighted: false, features: ['Prompt templates for all 5 business types', '5 complete sample outputs', 'README guide with best practices', 'Community support'], cta: 'Get Started Free' },
  { name: 'Pro', price: '$29', period: '/mo', description: 'For agencies and power users', highlighted: true, features: ['Everything in Starter', 'Batch generation CLI tool', 'GitHub Actions CI/CD integration', 'Priority email support', 'Custom business type templates', 'API access (coming soon)'], cta: 'Start Pro Trial' },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Start Generating <span className="gradient-text">Today</span></h2>
          <p className="text-[#94a3b8] text-base sm:text-lg max-w-2xl mx-auto">From solo freelancers to busy agencies — there&apos;s a plan for every workflow.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 }} className={plan.highlighted ? 'gradient-border' : ''}>
              <div className={`glass-card p-6 sm:p-8 h-full flex flex-col ${plan.highlighted ? 'bg-[rgba(20,27,53,0.8)]' : ''}`}>
                {plan.highlighted && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <Sparkles size={14} className="text-[#00ffd9]" />
                    <span className="text-xs font-medium text-[#00ffd9]">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#e2e8f0] mb-1">{plan.name}</h3>
                  <p className="text-sm text-[#94a3b8]">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#e2e8f0]">{plan.price}</span>
                  {plan.period !== 'forever' && <span className="text-[#94a3b8]">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                      <Check size={16} className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-[#00ffd9]' : 'text-[#2b4cff]'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.highlighted ? (
                  <button className="w-full bg-gradient-to-r from-[#2b4cff] to-[#00ffd9] text-[#0b1020] font-semibold hover:opacity-90 transition-opacity rounded-full py-5 inline-flex items-center justify-center gap-2 cursor-pointer border-none text-sm">
                    {plan.cta} <ArrowRight size={16} />
                  </button>
                ) : (
                  <button className="w-full border-[rgba(43,76,255,0.25)] text-[#e2e8f0] hover:bg-[rgba(43,76,255,0.08)] hover:border-[rgba(43,76,255,0.4)] rounded-full py-5 cursor-pointer bg-transparent text-sm">
                    {plan.cta}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}