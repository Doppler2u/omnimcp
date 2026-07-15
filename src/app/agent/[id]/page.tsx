"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import ToolTester from '@/components/ToolTester';
import type { GeneratedAgent, MCPToolDefinition } from '@/lib/types';

export default function AgentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [agent, setAgent] = useState<GeneratedAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgent() {
      try {
        const res = await fetch(`/api/agents/${resolvedParams.id}`);
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load agent');
        }
        
        setAgent(data.agent);
        if (data.agent.tools.length > 0) {
          setExpandedTool(data.agent.tools[0].name);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAgent();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-xl animate-spin mb-4"></div>
          <div className="text-cyan-400 font-jetbrains-mono">Loading Agent Data...</div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <div className="p-6 rounded-xl border border-rose-400/30 bg-rose-500/10 text-center max-w-2xl mx-auto">
          <div className="text-rose-300 text-xl mb-4">Error Loading Agent</div>
          <p className="text-gray-300 mb-6">{error || 'Agent not found'}</p>
          <Link href="/dashboard" className="text-cyan-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10 pb-24">
      <div className="mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-cyan-300 text-sm mb-6 inline-flex items-center transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Dashboard
        </Link>
        
        <div className="panel-strong rounded-2xl p-6 md:p-7">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-cyan-200 font-semibold mb-3">Agent Surface</div>
            <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight truncate">{agent.name}</h1>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium uppercase tracking-wider">
                Active
              </span>
            </div>
              <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed">{agent.description}</p>
            
              <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/[0.03] px-4 py-2 rounded-lg border border-white/10 min-w-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                <a href={agent.sourceSpecUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition-colors truncate max-w-[220px] sm:max-w-md">
                  {agent.sourceSpecUrl}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/[0.03] px-4 py-2 rounded-lg border border-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                Auth: <span className="text-gray-300 font-mono">{agent.authType}</span>
              </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/[0.03] px-4 py-2 rounded-lg border border-white/10">
                  Tools: <span className="text-gray-300 font-mono">{agent.tools.length}</span>
                </div>
                {agent.authConfig && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-amber-300/8 px-4 py-2 rounded-lg border border-amber-300/20">
                    Credential: <span className="text-amber-100 font-mono">{agent.authConfig.envVarName}</span>
                  </div>
                )}
            </div>
          </div>
          
            <div className="flex flex-col gap-3 min-w-full sm:min-w-[260px]">
            <a 
              href="https://okx.ai"
              target="_blank"
              rel="noreferrer"
                className="w-full bg-cyan-300 hover:bg-cyan-200 text-black font-semibold rounded-lg px-5 py-3 text-center transition-colors flex items-center justify-center gap-2"
            >
              Deploy to OKX.AI
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
              <div className="rounded-lg border border-white/10 bg-[#05070b] p-3 text-xs text-gray-400 font-jetbrains-mono break-all">
                /api/agents/{agent.id}
            </div>
              <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/8 p-3 text-xs text-cyan-100 font-jetbrains-mono break-all">
                /api/agents/{agent.id}/mcp
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Tools List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>
            MCP Tools ({agent.tools.length})
          </h2>
          
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
            {agent.tools.map((tool: MCPToolDefinition) => (
              <div 
                key={tool.name}
                onClick={() => setExpandedTool(expandedTool === tool.name ? null : tool.name)}
                className={`panel-strong rounded-xl transition-all cursor-pointer ${expandedTool === tool.name ? 'border-cyan-300/50' : 'hover:border-white/20'}`}
              >
                <div className="p-4 flex items-start justify-between">
                  <div>
                    <h3 className={`font-jetbrains-mono font-medium ${expandedTool === tool.name ? 'text-cyan-200' : 'text-gray-300'}`}>
                      {tool.name}
                    </h3>
                    <p className={`text-sm mt-1 line-clamp-2 ${expandedTool === tool.name ? 'text-gray-300' : 'text-gray-500'}`}>
                      {tool.description}
                    </p>
                  </div>
                  <div className="ml-4 shrink-0">
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedTool === tool.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                
                {/* Expanded content */}
                {expandedTool === tool.name && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-black/20">
                    <div className="text-xs text-gray-400 font-jetbrains-mono mb-2">INPUT SCHEMA</div>
                    <pre className="text-xs text-emerald-300 bg-[#05070b] p-3 rounded-lg overflow-x-auto border border-white/10">
                      {JSON.stringify(tool.inputSchema, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tester */}
        <div className="lg:col-span-7">
          <ToolTester agentId={agent.id as string} tools={agent.tools} />
        </div>
        
      </div>
    </div>
  );
}
