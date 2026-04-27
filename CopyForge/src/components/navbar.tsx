'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Templates', href: '#templates' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[rgba(11,16,32,0.85)] backdrop-blur-xl border-b border-[rgba(43,76,255,0.15)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a href="#" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold gradient-text tracking-tight">
              CopyForge
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm text-[#94a3b8] hover:text-[#e2e8f0] transition-colors rounded-lg hover:bg-[rgba(43,76,255,0.08)]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <button className="bg-gradient-to-r from-[#2b4cff] to-[#00ffd9] text-[#0b1020] font-semibold hover:opacity-90 transition-opacity rounded-full px-6 py-2 cursor-pointer border-none text-sm">
              Get Started
            </button>
          </div>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 text-[#94a3b8] hover:text-[#e2e8f0] transition-colors bg-transparent border-none cursor-pointer"
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[rgba(11,16,32,0.95)] backdrop-blur-xl border-b border-[rgba(43,76,255,0.15)]"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block px-4 py-3 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[rgba(43,76,255,0.08)] rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <button className="w-full bg-gradient-to-r from-[#2b4cff] to-[#00ffd9] text-[#0b1020] font-semibold rounded-full py-2.5 cursor-pointer border-none text-sm">
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}