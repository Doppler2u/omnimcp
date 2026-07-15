"use client";

import { useState } from 'react';

import type { MCPToolDefinition, MCPPropertySchema } from '@/lib/types';

interface ToolTesterProps {
  agentId: string;
  tools: MCPToolDefinition[];
}

export default function ToolTester({ agentId, tools }: ToolTesterProps) {
  const [selectedTool, setSelectedTool] = useState(tools[0]?.name || '');
  const [args, setArgs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ result?: unknown; latencyMs?: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTool = tools.find(t => t.name === selectedTool);

  const handleArgChange = (key: string, value: string) => {
    setArgs(prev => ({ ...prev, [key]: value }));
  };

  const handleExecute = async () => {
    if (!activeTool) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: selectedTool,
          arguments: args
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Execution failed');
      }

      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tools || tools.length === 0) {
    return <div className="text-gray-400">No tools available to test.</div>;
  }

  const properties = activeTool?.inputSchema?.properties || {};
  const required = activeTool?.inputSchema?.required || [];

  return (
    <div className="panel-strong rounded-xl overflow-hidden flex flex-col min-h-[640px]">
      <div className="bg-white/[0.03] p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            Tool Console
          </h3>
          <div className="text-xs text-gray-500 font-jetbrains-mono mt-1">POST /api/agents/{agentId}</div>
        </div>
        <select 
          className="bg-[#0b1118] border border-white/10 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2 outline-none max-w-full"
          value={selectedTool}
          onChange={(e) => {
            setSelectedTool(e.target.value);
            setArgs({});
            setResult(null);
            setError(null);
          }}
        >
          {tools.map(t => (
            <option key={t.name} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500 font-semibold mb-2">Selected tool</div>
            <div className="text-sm text-gray-300 leading-relaxed">{activeTool?.description}</div>
          </div>
          
          {Object.entries(properties).map(([key, prop]: [string, MCPPropertySchema]) => (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-300">
                {key} {required.includes(key) && <span className="text-red-400">*</span>}
              </label>
              {prop.enum ? (
                <select
                  className="w-full bg-[#0b1118] border border-white/10 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                  value={args[key] || ''}
                  onChange={(e) => handleArgChange(key, e.target.value)}
                >
                  <option value="">Select a value...</option>
                  {prop.enum.map((v: string) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={prop.type === 'integer' || prop.type === 'number' ? 'number' : 'text'}
                  className="w-full bg-[#0b1118] border border-white/10 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none placeholder-gray-600"
                  placeholder={prop.description || ''}
                  value={args[key] || ''}
                  onChange={(e) => handleArgChange(key, e.target.value)}
                />
              )}
              {prop.description && (
                <p className="text-xs text-gray-500">{prop.description}</p>
              )}
            </div>
          ))}

          {Object.keys(properties).length === 0 && (
            <div className="text-sm text-gray-500 py-4">
              This tool requires no arguments.
            </div>
          )}

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full mt-6 bg-cyan-300 hover:bg-cyan-200 text-black font-semibold rounded-lg text-sm px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
            Execute Tool
          </button>
        </div>

        <div className="bg-[#05070b] rounded-xl border border-white/10 flex flex-col overflow-hidden min-h-[420px]">
          <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span className="text-xs text-gray-400 font-jetbrains-mono">Response payload</span>
            {result?.latencyMs && (
              <span className="text-xs text-emerald-400">{result.latencyMs}ms</span>
            )}
          </div>
          <div className="flex-1 p-4 overflow-auto font-jetbrains-mono text-sm">
            {isLoading ? (
              <div className="text-gray-500 animate-pulse">Executing request...</div>
            ) : error ? (
              <div className="text-rose-300">{error}</div>
            ) : result ? (
              <pre className="text-gray-300">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-600">Awaiting execution.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
