import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

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
      <body className="antialiased font-sans">
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
