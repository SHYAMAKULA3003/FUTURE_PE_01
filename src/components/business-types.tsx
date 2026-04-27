'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Scissors, Coffee, HeartPulse, GraduationCap, Briefcase, ChevronRight } from 'lucide-react';


const businesses = [
  {
    icon: Scissors,
    name: 'Bloom & Co. Salon',
    city: 'Visakhapatnam',
    color: '#2b4cff',
    snippet:
      '"Your Smile, Our Passion — Vizag\'s favorite salon for hair, skin & bridal makeovers."',
  },
  {
    icon: Coffee,
    name: 'Morning Grind Cafe',
    city: 'Seattle',
    color: '#00ffd9',
    snippet:
      '"Freshly Roasted, Locally Sourced — Fuel your mornings at Seattle\'s coziest corner cafe."',
  },
  {
    icon: HeartPulse,
    name: 'ClearView Diagnostics',
    city: 'Austin',
    color: '#2b4cff',
    snippet:
      '"Accurate Diagnostics, Clear Results — Trusted lab in Austin with same-day reports."',
  },
  {
    icon: GraduationCap,
    name: 'NextStep Coaching',
    city: 'London',
    color: '#00ffd9',
    snippet:
      '"Your Next Chapter Starts Here — Career & life coaching to unlock your full potential."',
  },
  {
    icon: Briefcase,
    name: 'Brightline Digital',
    city: 'Toronto',
    color: '#2b4cff',
    snippet:
      '"We Build Brands That Last — Full-service digital agency for growing businesses."',
  },
];

export function BusinessTypes() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="templates" className="relative py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Templates for Every{' '}
            <span className="gradient-text">Local Business</span>
          </h2>
          <p className="text-[#94a3b8] text-base sm:text-lg max-w-2xl mx-auto">
            Five battle-tested templates designed for the most common local business types.
          </p>
        </motion.div>

        {/* Scrollable Cards */}
        <div className="relative">
          {/* Navigation Arrows - Desktop only */}
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            title="Scroll left"
            className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full glass-card hover:border-[rgba(43,76,255,0.4)] transition-all cursor-pointer"
          >
            <ChevronRight className="rotate-180 text-[#94a3b8]" size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            title="Scroll right"
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full glass-card hover:border-[rgba(43,76,255,0.4)] transition-all cursor-pointer"
          >
            <ChevronRight className="text-[#94a3b8]" size={18} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar"
            style={{ scrollbarWidth: 'thin' }}
          >
            {businesses.map((business, index) => (
              <motion.div
                key={business.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 min-w-75 sm:min-w-85 shrink-0 snap-start group hover:border-[rgba(43,76,255,0.4)] transition-all duration-300"
                style={{
                  borderTop: `2px solid ${business.color}60`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${business.color}15`,
                      border: `1px solid ${business.color}30`,
                    }}
                  >
                    <business.icon size={20} style={{ color: business.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#e2e8f0]">
                      {business.name}
                    </h3>
                    <p className="text-xs text-[#94a3b8]">{business.city}</p>
                  </div>
                </div>
                <p className="text-sm text-[#94a3b8] leading-relaxed mb-4 italic">
                  {business.snippet}
                </p>
                <button
                  className="text-xs p-0 h-auto bg-transparent border-none cursor-pointer text-[#2b4cff] group-hover:text-[#00ffd9] transition-colors inline-flex items-center"
                >
                  View Sample
                  <ChevronRight
                    size={14}
                    className="ml-1 group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}