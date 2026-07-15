import Link from 'next/link';
import OmniLogo from './OmniLogo';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06070a] pt-16 pb-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <Link href="/" className="flex items-center gap-3 mb-6 group">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-400/30 transition-colors duration-500"></div>
              <OmniLogo className="h-10 w-10 relative z-10 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-white group-hover:text-cyan-50 transition-colors duration-300">
              Omni<span className="text-cyan-400">MCP</span>
            </span>
          </Link>
          <p className="text-slate-400 max-w-sm">
            The fastest way to turn any OpenAPI specification into a fully typed, auto-routing MCP agent. Built for the modern AI web.
          </p>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex items-center justify-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} OmniMCP. Built for the OKX.AI Genesis Hackathon.</p>
        </div>
      </div>
    </footer>
  );
}
