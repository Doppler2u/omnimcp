"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ApiInput from '@/components/ApiInput';
import Terminal from '@/components/Terminal';
import StatsBar from '@/components/StatsBar';
import type { GenerateResponse } from '@/lib/types';

const demoStats = [
  { label: 'Agents Generated', value: 142 },
  { label: 'Tools Mapped', value: 894 },
  { label: 'Calls Routed', value: 12500, suffix: '+' },
];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (input: {
    url: string;
    credentialEnvVar?: string;
    credentialName?: string;
    credentialLocation?: 'header' | 'query';
  }) => {
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);
    setTerminalLines([`$ omnimcp generate --spec "${input.url}"`, '', 'Fetching OpenAPI specification...']);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specUrl: input.url,
          credentialEnvVar: input.credentialEnvVar,
          credentialName: input.credentialName,
          credentialLocation: input.credentialLocation,
        }),
      });

      const data = (await res.json()) as GenerateResponse & { terminalLines?: string[] };

      if (!data.success || !data.agent) {
        throw new Error(data.error || 'Failed to generate agent');
      }

      if (data.terminalLines) {
        setTerminalLines(data.terminalLines);
      }

      setTimeout(() => {
        router.push(`/agent/${data.agent?.id}`);
      }, 3000);
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      setTerminalLines(prev => [...prev, '', `Error: ${msg}`, 'Generation failed.']);
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 80, scale: 0.95 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: false, amount: 0.1 },
    transition: { type: "spring" as const, stiffness: 50, damping: 15, mass: 1 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: false, amount: 0.1 },
    transition: { staggerChildren: 0.2 }
  };

  return (
    <div className="relative z-10 w-full overflow-x-hidden">


      <section className="max-w-6xl mx-auto pt-32 px-4 sm:px-6 lg:px-8 pb-16 flex flex-col items-center text-center">
        <motion.div {...fadeInUp} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-[#121621]/60 px-4 py-2 text-xs font-semibold text-cyan-400 shadow-[0_0_15px_rgba(62,156,255,0.15)] mb-8 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Built for OKX.AI Genesis Hackathon
        </motion.div>
        
        <motion.h1 
          {...fadeInUp} transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-4xl text-5xl md:text-[5rem] font-bold tracking-tight leading-[1.05] text-white"
        >
          Your personal AI that builds <br className="hidden md:block"/>
          <span className="text-gradient">MCP agents — effortlessly.</span>
        </motion.h1>
        
        <motion.p 
          {...fadeInUp} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-slate-400 mt-8 max-w-2xl leading-relaxed"
        >
          OmniMCP transforms your OpenAPI specs, generates typed tools, and deploys intelligent surfaces with calm, autonomous guidance.
        </motion.p>

        <motion.div 
          {...fadeInUp} transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 w-full max-w-3xl relative"
        >
          
          <ApiInput onGenerate={handleGenerate} isLoading={isLoading} />
          
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400 mt-6 text-left">
              {error}
            </div>
          )}
          
          {(terminalLines.length > 0 || isLoading) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="mt-6 text-left"
            >
              <Terminal lines={terminalLines} isStreaming={isStreaming} />
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          {...fadeInUp} transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-4xl"
        >
          <StatsBar stats={demoStats} />
        </motion.div>
      </section>

      {/* Infinite Logo Ticker */}
      <section className="w-full border-y border-white/5 bg-[#0b1220]/50 backdrop-blur-sm py-8 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0b10] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a0b10] to-transparent z-10 pointer-events-none"></div>
        <div className="flex w-[200%] animate-marquee">
          <div className="flex w-1/2 justify-around items-center text-slate-400 font-semibold tracking-wider text-sm uppercase">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> OpenAPI 3.1</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-400"></span> Model Context Protocol</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Schema Intelligence</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400"></span> OKX.AI Onchain OS</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400"></span> AI Agent Generator</span>
          </div>
          <div className="flex w-1/2 justify-around items-center text-slate-400 font-semibold tracking-wider text-sm uppercase">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> OpenAPI 3.1</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-400"></span> Model Context Protocol</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Schema Intelligence</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400"></span> OKX.AI Onchain OS</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400"></span> AI Agent Generator</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white tracking-tight">Goodbye to API Chaos</h2>
          <p className="text-slate-400 mt-4 text-lg">Generate your tools. Keep every endpoint organized.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 50, damping: 15, mass: 1, delay: 0.1 }}
            className="md:col-span-8 glass-card rounded-[2rem] p-8 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Smart Schema Intelligence</h3>
                <p className="text-slate-400 max-w-sm">OrbitAI analyzes your parameters, payloads, and auth hints to create a typed toolset that just… works.</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
            </div>
            
            <div className="w-full bg-[#0b1220] rounded-xl border border-white/5 p-4 font-jetbrains-mono text-sm text-cyan-300">
              <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-3">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-500 ml-2">openapi.json</span>
              </div>
              <div className="space-y-2">
                <div className="text-emerald-400">"paths": &#123;</div>
                <div className="pl-4">"/v3.1/all": &#123;</div>
                <div className="pl-8 text-amber-300">"get": &#123; "operationId": "getAllCountries" &#125;</div>
                <div className="pl-4">&#125;</div>
                <div className="text-emerald-400">&#125;</div>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 50, damping: 15, mass: 1, delay: 0.3 }}
            className="md:col-span-4 glass-card rounded-[2rem] p-8 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Instant x402 Runtime</h3>
            <p className="text-slate-400">Write a URL. OmniMCP transforms it into an executable, x402 pay-per-call JSON-RPC proxy in under a minute.</p>
            
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-emerald-400">✓</div>
                Auto-routing
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-emerald-400">✓</div>
                Type validation
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-emerald-400">✓</div>
                Zero-setup deploy
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-emerald-400">✓</div>
                Auto x402 Wrapping
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ type: "spring", stiffness: 50, damping: 15, mass: 1, delay: 0.2 }}
            className="md:col-span-12 glass-card rounded-[2rem] p-8 md:p-12 relative overflow-hidden group flex flex-col md:flex-row items-center justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="md:w-1/2 z-10 mb-8 md:mb-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">0 USDT Pay-per-call</h3>
              <p className="text-slate-400 text-lg max-w-md leading-relaxed">Natively integrated with the OKX.AI Agent Marketplace. Publish your MCP agent as an ASP (API Service Provider) and monetize instantly on-chain.</p>
            </div>
            <div className="md:w-5/12 z-10 w-full">
              <div className="bg-[#0b1220] rounded-2xl border border-white/5 p-6 shadow-2xl relative">

                <div className="flex justify-between items-center mb-6">
                  <span className="text-white font-semibold flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                    Wallet Account 01
                  </span>
                  <span className="text-amber-400/80 text-sm font-mono bg-amber-400/10 px-2 py-1 rounded-md">0x1f1...337a</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-sm">Status</span>
                    <span className="text-emerald-400 text-sm font-semibold bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">Published</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-sm">Role</span>
                    <span className="text-cyan-400 text-sm font-semibold">ASP</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 text-sm">Fee</span>
                    <span className="text-amber-400 text-sm font-semibold font-jetbrains-mono">0.00 USDT</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The OmniMCP Pipeline Architecture */}
      <section className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 mt-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div {...fadeInUp} className="text-center mb-20 relative z-10">
          <h2 className="text-4xl font-bold text-white tracking-tight">The OmniMCP Pipeline</h2>
          <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">How we securely transform static Web2 REST APIs into autonomous, monetized Web3 Agentic Service Providers in seconds.</p>
        </motion.div>

        <div className="relative z-10">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 -z-10"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="bg-[#0a0f18] border border-white/5 rounded-3xl p-6 h-full shadow-lg hover:border-cyan-500/30 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-300 font-mono text-xl font-bold mb-6 group-hover:scale-110 transition-transform">01</div>
                <h4 className="text-xl font-bold text-white mb-2">Ingest OpenAPI</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Provide any standard Swagger or OpenAPI v3.1 JSON/YAML URL. The pipeline instantly fetches and validates the schema.</p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="bg-[#0a0f18] border border-white/5 rounded-3xl p-6 h-full shadow-lg hover:border-violet-500/30 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 font-mono text-xl font-bold mb-6 group-hover:scale-110 transition-transform">02</div>
                <h4 className="text-xl font-bold text-white mb-2">Semantic LLM Map</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Gemini Flash analyzes endpoints, parameters, and payloads to generate intelligent, context-aware MCP Tool definitions.</p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="relative group"
            >
              <div className="bg-[#0a0f18] border border-white/5 rounded-3xl p-6 h-full shadow-lg hover:border-amber-500/30 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-mono text-xl font-bold mb-6 group-hover:scale-110 transition-transform">03</div>
                <h4 className="text-xl font-bold text-white mb-2">x402 Wrapping</h4>
                <p className="text-slate-400 text-sm leading-relaxed">The endpoints are dynamically wrapped in the OKX x402 payment protocol, establishing instant stablecoin settlement gates.</p>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="relative group"
            >
              <div className="bg-[#0a0f18] border border-white/5 rounded-3xl p-6 h-full shadow-lg hover:border-emerald-500/30 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono text-xl font-bold mb-6 group-hover:scale-110 transition-transform">04</div>
                <h4 className="text-xl font-bold text-white mb-2">Onchain Deploy</h4>
                <p className="text-slate-400 text-sm leading-relaxed">A verifiable SHA-256 schema hash is generated, and the service goes live as an autonomous ASP on the OKX.AI Marketplace.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Massive CTA */}
      <section className="max-w-5xl mx-auto py-32 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/10 rounded-[100%] blur-[120px] pointer-events-none"></div>
        <motion.h2 
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.5 }} transition={{ type: "spring" }}
          className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8"
        >
          Ready to build your <br/><span className="text-gradient">MCP Agent?</span>
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.5 }} transition={{ type: "spring", delay: 0.1 }}
        >
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-10 py-5 rounded-full text-lg font-bold transition-all shadow-[0_0_40px_rgba(62,156,255,0.4)] hover:shadow-[0_0_60px_rgba(62,156,255,0.6)] hover:scale-105 cursor-pointer"
          >
            Start Generating for Free
          </button>
        </motion.div>
      </section>
    </div>
  );
}
