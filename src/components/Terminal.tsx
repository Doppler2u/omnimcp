"use client";

import { useEffect, useRef, useState } from 'react';

interface TerminalProps {
  lines: string[];
  isStreaming: boolean;
}

export default function Terminal({ lines, isStreaming }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

  // Animate lines appearing one by one when they are added to the lines prop
  useEffect(() => {
    if (lines.length === 0) {
      const timer = setTimeout(() => setDisplayedLines([]), 0);
      return () => clearTimeout(timer);
    }

    if (displayedLines.length > lines.length) {
      const timer = setTimeout(() => setDisplayedLines(lines), 0);
      return () => clearTimeout(timer);
    }

    if (lines.length > displayedLines.length) {
      const timer = setTimeout(() => {
        setDisplayedLines(prev => [...prev, lines[prev.length]]);
      }, Math.random() * 150 + 50); // Random delay between 50-200ms for typewriter effect
      
      return () => clearTimeout(timer);
    }
  }, [lines, displayedLines]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedLines]);

  // Syntax highlighting for JSON-like terminal output
  const formatLine = (line: string) => {
    if (line.includes('✓')) {
      return <span className="text-emerald-400">{line}</span>;
    }
    if (line.includes('⚡') || line.includes('🧠') || line.includes('🚀')) {
      return <span className="text-cyan-400 font-bold">{line}</span>;
    }
    if (line.includes('omnimcp generate')) {
      return <span className="text-gray-300">$ <span className="text-yellow-300">omnimcp</span> <span className="text-green-300">generate</span> {line.split('generate')[1]}</span>;
    }
    if (line.startsWith('   ┌─') || line.startsWith('   └─') || line.startsWith('   │')) {
      return <span className="text-violet-400">{line}</span>;
    }
    return <span className="text-gray-300">{line}</span>;
  };

  return (
    <div className="terminal-window w-full">
      <div className="terminal-header">
        <div className="terminal-dot terminal-dot-red"></div>
        <div className="terminal-dot terminal-dot-yellow"></div>
        <div className="terminal-dot terminal-dot-green"></div>
        <div className="ml-4 text-xs text-gray-500 font-jetbrains-mono">omnimcp build stream</div>
      </div>
      <div 
        ref={containerRef}
        className="terminal-content"
      >
        {displayedLines.length === 0 && !isStreaming ? (
          <div className="text-gray-500 italic">Waiting for input...</div>
        ) : (
          displayedLines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap mb-1 leading-relaxed">
              {formatLine(line)}
            </div>
          ))
        )}
        {isStreaming && (
          <div className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1 align-middle"></div>
        )}
      </div>
    </div>
  );
}
