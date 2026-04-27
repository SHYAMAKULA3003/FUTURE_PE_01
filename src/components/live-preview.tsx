'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Tab = 'homepage' | 'services' | 'jsonld';

const tabs: { id: Tab; label: string }[] = [
  { id: 'homepage', label: 'Homepage' },
  { id: 'services', label: 'Services' },
  { id: 'jsonld', label: 'JSON-LD' },
];

const content: Record<Tab, string> = {
  homepage: `---
title: "Bloom & Co. Salon — Hair, Skin & Bridal Studio in Visakhapatnam"
hero_headline: "Your Smile, Our Passion"
hero_sub: "Vizag's favorite salon for hair, skin & bridal makeovers. Walk in gorgeous, walk out confident."

cta_primary: "Book Your Appointment"
cta_secondary: "View Our Services"

testimonial:
  name: "Priya M."
  text: "The best bridal package I've ever had. Every detail was perfect!"`,

  services: `## Our Services

### Hair
- **Haircuts & Styling** — Trendy cuts, layers, and blowouts for every occasion. Starting at ₹299.
- **Hair Coloring** — Global color, highlights, balayage with ammonia-free products. Starting at ₹999.

### Skin
- **Facials** — Hydrating, anti-aging, and bridal glow facials. Starting at ₹499.
- **Cleanup & Peels** — Deep cleansing and chemical peels for radiant skin. Starting at ₹599.

### Bridal
- **Bridal Makeup** — HD, airbrush, and traditional bridal packages. Starting at ₹4,999.
- **Mehendi & Pre-Bridal** — Complete pre-bridal care with mehendi artists. Starting at ₹2,999.`,

  jsonld: `{
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "name": "Bloom & Co. Salon",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "45 Beach Road, MVP Colony",
    "addressLocality": "Visakhapatnam",
    "addressRegion": "Andhra Pradesh",
    "postalCode": "530017",
    "addressCountry": "IN"
  },
  "telephone": "+91-9876543210",
  "priceRange": "₹₹",
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "09:30", "closes": "20:30" }
  ],
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "234" }
}`,
};

export function LivePreview() {
  const [activeTab, setActiveTab] = useState<Tab>('homepage');

  return (
    <section className="relative py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">See the Output <span className="gradient-text">in Action</span></h2>
          <p className="text-[#94a3b8] text-base sm:text-lg max-w-2xl mx-auto">Real output from CopyForge — Bloom &amp; Co. Salon, Friendly tone</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[rgba(43,76,255,0.1)] bg-[rgba(10,14,30,0.5)]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[rgba(255,100,100,0.7)]" />
              <div className="w-3 h-3 rounded-full bg-[rgba(255,200,50,0.7)]" />
              <div className="w-3 h-3 rounded-full bg-[rgba(100,255,100,0.7)]" />
            </div>
            <div className="hidden sm:flex items-center gap-1 px-4 py-1 rounded-md bg-[rgba(43,76,255,0.08)] border border-[rgba(43,76,255,0.1)]">
              <span className="text-xs text-[#94a3b8] font-mono">bloomandco.example.com</span>
            </div>
            <div className="w-12" />
          </div>
          <div className="flex border-b border-[rgba(43,76,255,0.1)]">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 sm:px-6 py-3 text-sm font-medium transition-all relative cursor-pointer bg-transparent border-none ${activeTab === tab.id ? 'text-[#e2e8f0]' : 'text-[#94a3b8] hover:text-[#e2e8f0]'}`}>
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="preview-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#2b4cff] to-[#00ffd9]" transition={{ duration: 0.3 }} />
                )}
              </button>
            ))}
          </div>
          <div className="p-4 sm:p-6 max-h-96 overflow-y-auto custom-scrollbar">
            <pre className="text-xs sm:text-sm font-mono text-[#94a3b8] whitespace-pre-wrap leading-relaxed"><code>{content[activeTab]}</code></pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}