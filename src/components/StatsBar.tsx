"use client";

import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

interface StatsBarProps {
  stats: Stat[];
}

function Counter({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) {
  const [count, setCount] = useState(from);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (inView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);

        if (progress < 1) {
          setCount(Math.floor(from + (to - from) * progress));
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(to);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [from, to, duration, inView]);

  return <span ref={nodeRef}>{count.toLocaleString()}</span>;
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2 }}
          className="panel-strong rounded-xl p-4"
        >
          <div className="text-2xl font-semibold text-white mb-1 font-jetbrains-mono">
            <Counter from={0} to={stat.value} />
            <span className="text-cyan-400">{stat.suffix}</span>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-[0.14em] font-semibold">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
