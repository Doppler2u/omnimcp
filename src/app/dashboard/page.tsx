"use client";

import { useEffect, useState } from 'react';
import AgentCard from '@/components/AgentCard';
import type { GeneratedAgent } from '@/lib/types';
import Link from 'next/link';

type AgentSummary = GeneratedAgent & { id: string };

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load agents');
        }
        
        setAgents(data.agents);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAgents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-cyan-200 font-semibold mb-3">Agent Registry</div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Generated ASP inventory</h1>
          <p className="text-gray-400 mt-3 max-w-2xl">Inspect live proxy agents, MCP surfaces, and tool schemas before OKX.AI submission.</p>
        </div>
        <Link 
          href="/"
          className="bg-cyan-300 hover:bg-cyan-200 text-black px-5 py-3 rounded-lg font-semibold transition-colors text-center"
        >
          New Agent
        </Link>
      </div>

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="panel-strong rounded-xl p-4">
            <div className="text-2xl font-semibold font-jetbrains-mono">{agents.length}</div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500 mt-1">Agents</div>
          </div>
          <div className="panel-strong rounded-xl p-4">
            <div className="text-2xl font-semibold font-jetbrains-mono">{agents.reduce((sum, a) => sum + a.toolCount, 0)}</div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500 mt-1">Tools</div>
          </div>
          <div className="panel-strong rounded-xl p-4">
            <div className="text-2xl font-semibold font-jetbrains-mono">HTTP</div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500 mt-1">Transport</div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-200 mb-8">
          Error loading agents: {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="panel-strong rounded-xl p-6 h-52 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-3/4 mb-6"></div>
              <div className="h-6 bg-white/10 rounded w-1/4 mt-auto"></div>
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="panel-strong rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-cyan-300/10 border border-cyan-300/20 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Agents Found</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            You haven&apos;t generated any agents yet. Head back to the home page to turn your first API into an agent.
          </p>
          <Link 
            href="/"
            className="bg-white text-black hover:bg-cyan-100 px-8 py-3 rounded-lg font-bold transition-colors"
          >
            Create Your First Agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
