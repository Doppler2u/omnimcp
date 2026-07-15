"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiInput from '@/components/ApiInput';
import Terminal from '@/components/Terminal';
import StatsBar from '@/components/StatsBar';
import type { GenerateResponse } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoStats = [
    { label: 'Generated', value: 142 },
    { label: 'Tools', value: 894 },
    { label: 'Calls', value: 12500, suffix: '+' }
  ];

  const handleGenerate = async (input: {
    url: string;
    credentialEnvVar?: string;
    credentialName?: string;
    credentialLocation?: 'header' | 'query';
  }) => {
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);
    setTerminalLines([`$ omnimcp generate --spec "${input.url}"`, '', '⚡ Fetching OpenAPI specification...']);

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

      // Wait a moment for terminal animation to finish before redirecting
      setTimeout(() => {
        router.push(`/agent/${data.agent?.id}`);
      }, 3000);

    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      setTerminalLines(prev => [...prev, '', `❌ Error: ${msg}`, 'Generation failed.']);
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16">
      <section className="max-w-7xl mx-auto pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 text-xs font-jetbrains-mono text-cyan-200 mb-6">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                ASP generator online
              </div>
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.04] max-w-4xl">
                Convert OpenAPI specs into <span className="text-gradient">MCP-ready agents</span>.
              </h1>
              <p className="text-base md:text-lg text-gray-400 mt-5 max-w-2xl leading-relaxed">
                Paste a Swagger or OpenAPI JSON spec and ship a callable agent endpoint with tool schemas, proxy routing, and an MCP JSON-RPC surface for OKX.AI demos.
              </p>
            </div>

            <div className="space-y-4">
              <ApiInput onGenerate={handleGenerate} isLoading={isLoading} />

              {error && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                  {error}
                </div>
              )}

              {!isLoading && terminalLines.length === 0 && (
                <StatsBar stats={demoStats} />
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="panel-strong rounded-2xl overflow-hidden h-full">
              <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Generated ASP Surface</div>
                  <div className="text-xs text-gray-500 font-jetbrains-mono mt-1">/api/agents/[id]/mcp</div>
                </div>
                <span className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300 border border-emerald-400/20">
                  Live
                </span>
              </div>
              <div className="p-5 space-y-4">
                {[
                  ['01', 'Parse', 'OpenAPI paths, params, schemas'],
                  ['02', 'Map', 'Gemini creates MCP tool contracts'],
                  ['03', 'Proxy', 'Runtime calls the source REST API'],
                  ['04', 'Expose', 'JSON-RPC methods for agent clients'],
                ].map(([step, title, copy]) => (
                  <div key={step} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 font-jetbrains-mono text-xs flex items-center justify-center shrink-0">
                        {step}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{title}</div>
                        <div className="text-sm text-gray-500 mt-1">{copy}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="rounded-xl border border-amber-300/20 bg-amber-300/8 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-amber-200 font-semibold">Submission focus</div>
                  <div className="text-sm text-gray-300 mt-2">
                    Software Utility ASP with a clear cold-start story for the OKX.AI agent marketplace.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(terminalLines.length > 0 || isLoading) && (
          <div className="mt-6">
            <Terminal lines={terminalLines} isStreaming={isStreaming} />
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto mt-8">
        <div className="surface-line mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['MCP endpoint', 'initialize, tools/list, tools/call'],
            ['Demo safe mode', 'Fallback agents for stable recording'],
            ['Zero-cost path', 'No database required for MVP demo'],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="text-sm text-gray-500 mt-2">{copy}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
