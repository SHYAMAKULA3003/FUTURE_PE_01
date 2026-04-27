'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Check } from 'lucide-react';

type BusinessTab = 'salon' | 'cafe' | 'agency';
type Tone = 'friendly' | 'professional' | 'confident';

const sampleData: Record<BusinessTab, { name: string; city: string; color: string }> = {
  salon: { name: 'Bloom & Co. Salon', city: 'Visakhapatnam', color: '#2b4cff' },
  cafe: { name: 'Morning Grind Cafe', city: 'Seattle', color: '#00ffd9' },
  agency: { name: 'Brightline Digital', city: 'Toronto', color: '#2b4cff' },
};

const toneData: Record<BusinessTab, Record<Tone, { headline: string; subheadline: string; bullets: string[] }>> = {
  salon: {
    friendly: { headline: 'Your Smile, Our Passion', subheadline: "Vizag's favorite salon for hair, skin & bridal makeovers. Walk in gorgeous, walk out confident.", bullets: ['Expert hair stylists trained in global trends', 'Bridal packages trusted by 500+ happy brides', 'Affordable luxury — starting at just ₹299'] },
    professional: { headline: 'Premium Salon Services in Visakhapatnam', subheadline: 'Certified professionals delivering industry-leading hair, skin, and bridal services since 2018.', bullets: ['International-certified hair and skin specialists', '500+ successful bridal transformations with documentation', 'Transparent pricing with no hidden charges'] },
    confident: { headline: 'Vizag\'s #1 Rated Salon', subheadline: '4.8★ rating across 234 reviews. Results that speak for themselves.', bullets: ['234 five-star reviews and counting', '97% customer satisfaction rate', 'Same-day appointments available'] },
  },
  cafe: {
    friendly: { headline: 'Freshly Roasted, Locally Sourced', subheadline: "Fuel your mornings at Seattle's coziest corner cafe. Great coffee, warmer people.", bullets: ['Single-origin beans roasted in-house daily', 'Cozy atmosphere perfect for work or catching up', 'Delicious pastries baked fresh every morning'] },
    professional: { headline: 'Artisan Coffee & Workspace, Seattle', subheadline: 'Premium specialty coffee served in a curated environment designed for focus and community.', bullets: ['Direct-trade coffee from 12 sustainable farms', 'High-speed WiFi and ergonomic workspaces', 'Catering services for corporate events'] },
    confident: { headline: 'Seattle\'s Best Specialty Coffee', subheadline: 'Voted #1 indie cafe 3 years running. Come taste the difference.', bullets: ['3× Seattle Best Cafe Award winner', '4,200+ cups served monthly', 'Average customer rating: 4.9★'] },
  },
  agency: {
    friendly: { headline: 'We Build Brands That Last', subheadline: "Full-service digital agency for growing businesses. Let's create something amazing together.", bullets: ['Web design, SEO, and social media — all under one roof', 'Worked with 50+ businesses across Toronto', 'Transparent process with weekly progress updates'] },
    professional: { headline: 'Strategic Digital Solutions for Growth', subheadline: 'Data-driven marketing and development services delivering measurable ROI for businesses.', bullets: ['Google Partner certified with $2M+ ad spend managed', '50+ client engagements with average 3.2× ROI', 'Comprehensive analytics and monthly reporting'] },
    confident: { headline: 'Toronto\'s Fastest-Growing Digital Agency', subheadline: '120+ projects shipped. $2M+ in client revenue generated. Numbers don\'t lie.', bullets: ['120+ successful project deliveries', '$2M+ revenue generated for clients in 2024', 'Average project completion: 14 days ahead of schedule'] },
  },
};

const businessTabs: { id: BusinessTab; label: string }[] = [
  { id: 'salon', label: 'Salon' },
  { id: 'cafe', label: 'Cafe' },
  { id: 'agency', label: 'Agency' },
];

const toneOptions: { id: Tone; label: string }[] = [
  { id: 'friendly', label: 'Friendly' },
  { id: 'professional', label: 'Professional' },
  { id: 'confident', label: 'Confident-Simple' },
];

export function SampleOutput() {
  const [businessTab, setBusinessTab] = useState<BusinessTab>('salon');
  const [tone, setTone] = useState<Tone>('friendly');
  const business = sampleData[businessTab];
  const data = toneData[businessTab][tone];

  return (
    <section className="relative py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">Sample Outputs</span></h2>
          <p className="text-[#94a3b8] text-base sm:text-lg max-w-2xl mx-auto">See how tone variants change the same business&apos;s copy.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="flex justify-center gap-2 mb-8">
            {businessTabs.map((tab) => (
              <button key={tab.id} onClick={() => { setBusinessTab(tab.id); setTone('friendly'); }} className={`px-4 sm:px-6 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer border-none ${businessTab === tab.id ? 'bg-gradient-to-r from-[#2b4cff] to-[#00ffd9] text-[#0b1020]' : 'bg-[rgba(43,76,255,0.08)] text-[#94a3b8] hover:text-[#e2e8f0] border border-[rgba(43,76,255,0.15)]'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(43,76,255,0.1)] bg-[rgba(10,14,30,0.3)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#e2e8f0]">{business.name}</h3>
                  <p className="text-sm text-[#94a3b8]">{business.city}</p>
                </div>
                <div className="flex gap-1.5">
                  {toneOptions.map((t) => (
                    <button key={t.id} onClick={() => setTone(t.id)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer bg-transparent border-none ${tone === t.id ? 'bg-[rgba(43,76,255,0.15)] text-[#e2e8f0] border border-[rgba(43,76,255,0.3)]' : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[rgba(43,76,255,0.05)]'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <motion.div key={`${businessTab}-${tone}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-2">Hero Headline</p>
                  <h4 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">&ldquo;{data.headline}&rdquo;</h4>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{data.subheadline}</p>
                </div>
                <div className="mb-6">
                  <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-3">Why Choose Us</p>
                  <ul className="space-y-2">
                    {data.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#e2e8f0]">
                        <Check size={16} className="text-[#00ffd9] mt-0.5 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="border-[rgba(43,76,255,0.25)] text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[rgba(43,76,255,0.4)] hover:bg-[rgba(43,76,255,0.05)] rounded-full px-6 inline-flex items-center gap-2 cursor-pointer bg-transparent text-sm">
                  <Download size={14} />
                  Download Full Sample
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}