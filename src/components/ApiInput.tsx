"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ApiInputProps {
  onGenerate: (input: {
    url: string;
    credentialEnvVar?: string;
    credentialName?: string;
    credentialLocation?: 'header' | 'query';
  }) => void;
  isLoading: boolean;
}

export default function ApiInput({ onGenerate, isLoading }: ApiInputProps) {
  const [url, setUrl] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentialEnvVar, setCredentialEnvVar] = useState('');
  const [credentialName, setCredentialName] = useState('');
  const [credentialLocation, setCredentialLocation] = useState<'header' | 'query'>('header');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onGenerate({
        url: url.trim(),
        credentialEnvVar: credentialEnvVar.trim() || undefined,
        credentialName: credentialName.trim() || undefined,
        credentialLocation,
      });
    }
  };

  const presets = [
    { label: 'PetStore', url: 'https://petstore.swagger.io/v2/swagger.json' },
    { label: 'Dictionary', url: '/specs/dictionary.json' },
    { label: 'Countries', url: '/specs/countries.json' }
  ];

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="panel-strong rounded-[1.75rem] p-2 glow-focus">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="OpenAPI / Swagger JSON URL"
            className="w-full bg-transparent border-none text-white px-4 py-3 focus:outline-none focus:ring-0 placeholder-slate-500 font-jetbrains-mono text-sm"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-6 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(62,156,255,0.2)] hover:shadow-[0_0_25px_rgba(62,156,255,0.4)]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Agent'
            )}
          </button>
        </div>

        {showCredentials && (
          <div className="border-t border-slate-900/10 mt-2 pt-4 px-2 pb-2 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2">
                Env var
              </label>
              <input
                type="text"
                value={credentialEnvVar}
                onChange={(e) => setCredentialEnvVar(e.target.value)}
                placeholder="WEATHER_API_KEY"
                className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none placeholder-slate-600 font-jetbrains-mono text-sm"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2">
                Name
              </label>
              <input
                type="text"
                value={credentialName}
                onChange={(e) => setCredentialName(e.target.value)}
                placeholder="X-API-Key or api_key"
                className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none placeholder-slate-600 font-jetbrains-mono text-sm"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold mb-2">
                Location
              </label>
              <select
                value={credentialLocation}
                onChange={(e) => setCredentialLocation(e.target.value as 'header' | 'query')}
                className="w-full bg-[#0b1220] border border-white/10 rounded-xl p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                disabled={isLoading}
              >
                <option value="header">Header</option>
                <option value="query">Query</option>
              </select>
            </div>
          </div>
        )}
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {presets.map((preset, index) => (
          <motion.button
            key={index}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUrl(preset.url)}
            className="text-xs bg-[#0b1220] border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white px-3 py-1.5 rounded-full transition-colors shadow-sm"
          >
            {preset.label}
          </motion.button>
        ))}
        <button
          type="button"
          onClick={() => setShowCredentials(value => !value)}
          className="text-xs bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/50 text-amber-400 px-3 py-1.5 rounded-full transition-colors"
        >
          {showCredentials ? 'Hide credentials' : 'Credential env var'}
        </button>
      </div>
    </div>
  );
}
