'use client';

import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { BusinessTypes } from '@/components/business-types';
import { HowItWorks } from '@/components/how-it-works';
import { LivePreview } from '@/components/live-preview';
import { SampleOutput } from '@/components/sample-output';
import { Pricing } from '@/components/pricing';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="gradient-bg min-h-screen">
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <BusinessTypes />
        <HowItWorks />
        <LivePreview />
        <SampleOutput />
        <Pricing />
        <Footer />
      </div>
    </div>
  );
}