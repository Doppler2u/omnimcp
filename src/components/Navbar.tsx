"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import OmniLogo from './OmniLogo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-[#0a0b10]/80 backdrop-blur-xl' : 'bg-transparent pt-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-400/30 transition-colors duration-500"></div>
                <OmniLogo className="h-9 w-9 relative z-10 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-white group-hover:text-cyan-50 transition-colors duration-300">
                Omni<span className="text-cyan-400">MCP</span>
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Generator
              </Link>
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <a
                href="https://okx.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-[0_0_15px_rgba(62,156,255,0.3)]"
              >
                OKX.AI
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
