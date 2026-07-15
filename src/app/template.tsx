"use client";

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ 
        type: "spring",
        stiffness: 100, 
        damping: 20, 
        mass: 1 
      }}
    >
      {children}
    </motion.div>
  );
}
