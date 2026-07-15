import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string;
  toolCount: number;
  status: 'active' | 'generating' | 'error';
  createdAt?: string;
}

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const statusStyles = {
    active: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
    generating: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    error: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  }[agent.status];

  return (
    <Link href={`/agent/${agent.id}`} className="block group">
      <div className="panel-strong rounded-xl p-5 h-full transition-all duration-200 group-hover:border-cyan-300/40 group-hover:-translate-y-0.5">
        <div className="flex justify-between items-start mb-5">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors truncate">{agent.name}</h3>
            <div className="text-xs text-gray-500 font-jetbrains-mono mt-1">/api/agents/{agent.id}/mcp</div>
          </div>
          <span className={`rounded-lg border px-2.5 py-1 text-xs capitalize ${statusStyles}`}>
            {agent.status}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-3 min-h-[60px]">
          {agent.description}
        </p>
        
        <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
          <div>
            <div className="text-xl font-semibold text-white font-jetbrains-mono">{agent.toolCount}</div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500 mt-1">Tools</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold text-white font-jetbrains-mono">MCP</div>
            <div className="text-xs uppercase tracking-[0.14em] text-gray-500 mt-1">Ready</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
