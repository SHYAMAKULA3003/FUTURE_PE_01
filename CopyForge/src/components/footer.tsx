'use client';

import { Github, Heart } from 'lucide-react';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Templates', href: '#templates' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

const resourceLinks = [
  { label: 'Documentation', href: '#' },
  { label: 'GitHub', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Support', href: '#' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[rgba(43,76,255,0.1)] bg-[rgba(10,14,30,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-xl font-bold gradient-text">CopyForge</span>
            <p className="text-sm text-[#94a3b8] mt-3 leading-relaxed max-w-xs">AI-powered copy generation for local businesses. Production-ready website copy in minutes.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#e2e8f0] mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.label}><a href={link.href} className="text-sm text-[#94a3b8] hover:text-[#e2e8f0] transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#e2e8f0] mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}><a href={link.href} className="text-sm text-[#94a3b8] hover:text-[#e2e8f0] transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#e2e8f0] mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-[#94a3b8] hover:text-[#e2e8f0] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-[#94a3b8] hover:text-[#e2e8f0] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[rgba(43,76,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#94a3b8] flex items-center gap-1">Built with <Heart size={14} className="text-[#2b4cff]" /> and AI &copy; {new Date().getFullYear()} CopyForge</p>
          <a href="#" className="text-sm text-[#94a3b8] hover:text-[#e2e8f0] transition-colors flex items-center gap-2"><Github size={16} /> GitHub</a>
        </div>
      </div>
    </footer>
  );
}