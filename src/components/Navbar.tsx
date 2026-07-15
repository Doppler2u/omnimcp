import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#070a0f]/88 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg border border-cyan-400/30 bg-cyan-400/10 flex items-center justify-center text-cyan-300 font-jetbrains-mono text-sm">
                OM
              </span>
              <span className="text-xl font-semibold font-jetbrains-mono tracking-tight">
                Omni<span className="text-cyan-300">MCP</span>
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Generator
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <a
                href="https://okx.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black hover:bg-cyan-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
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
