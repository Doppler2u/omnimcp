import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'OmniMCP - Turn Any API Into an AI Agent',
  description: 'Instantly generate an MCP-compliant AI Agent from any OpenAPI specification. Built for OKX.AI Genesis Hackathon.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <body className="antialiased font-sans relative">
        <div 
          className="absolute top-0 left-0 w-full h-[896px] -z-50 pointer-events-none" 
          style={{
            backgroundImage: `url('https://cdn.prod.website-files.com/693d6199445bec13b5fc4ea3/695e03577a39c27a261bdbd1_fantasy-style-galaxy-background%201%20(1).avif')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
          }}
        />
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
