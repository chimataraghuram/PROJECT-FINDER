import React, { useState, FormEvent } from 'react';
import { Search, Loader2, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const QUICK_TAGS = [
  { label: 'OpenClaw', emoji: '🦾' },
  { label: 'NanoClaw', emoji: '🔬' },
  { label: 'PicoClaw', emoji: '⚡' },
  { label: 'MegaClaw', emoji: '🐘' },
  { label: 'OppoClaw', emoji: '🌀' },
  { label: 'HyperClaw', emoji: '🏎️' },
  { label: 'Llama 3', emoji: '🦙' },
  { label: 'Auto-GPT', emoji: '🤖' },
  { label: 'Stable Diffusion', emoji: '🎨' },
  { label: 'Computer Vision', emoji: '👁️' },
  { label: 'React 19', emoji: '⚛️' },
  { label: 'Blockchain', emoji: '⛓️' },
];

const SURPRISE_QUERIES = [
  'Auto-GPT', 'Stable Diffusion', 'Llama 3', 'Computer Vision',
  'Stock Prediction', 'LinkedIn Insights', 'React 19', 'Zustand',
  'Hugging Face Transformers', 'RAG AI', 'Cybersecurity', 'Blockchain',
  'OpenClaw', 'NanoClaw', 'PicoClaw', 'MegaClaw', 'OppoClaw', 'HyperClaw'
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  const handleSurprise = () => {
    const randomTag = SURPRISE_QUERIES[Math.floor(Math.random() * SURPRISE_QUERIES.length)];
    setQuery(randomTag);
    onSearch(randomTag);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative group">
        {/* Glow ring */}
        <div className={`absolute -inset-[2px] rounded-2xl transition-all duration-700 ${
          isFocused
            ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-80 blur-[2px]'
            : 'bg-gradient-to-r from-orange-600/30 via-red-600/20 to-orange-600/30 opacity-0 group-hover:opacity-60 blur-[2px]'
        }`} />

        <div className={`relative flex items-center bg-[#0c1628]/80 backdrop-blur-3xl rounded-2xl border transition-all duration-300 shadow-2xl overflow-hidden ${
          isFocused ? 'border-orange-500/60' : 'border-white/8 hover:border-white/15'
        }`}>
          {/* Search icon */}
          <div className="pl-5 md:pl-6 shrink-0">
            <Search className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-300 ${isFocused ? 'text-orange-400' : 'text-gray-500'}`} />
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search projects, models, datasets..."
            className="w-full bg-transparent text-white px-4 py-4 md:py-5 text-sm md:text-lg focus:outline-none placeholder-gray-600 min-w-0 font-medium"
            disabled={isLoading}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-2 pr-2 shrink-0">
            <button
              type="button"
              onClick={handleSurprise}
              disabled={isLoading}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-orange-400 font-bold text-[10px] md:text-xs uppercase tracking-widest border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/40 transition-all duration-200 whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Surprise Me</span>
              <span className="md:hidden">Luck</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="relative px-5 py-2.5 md:px-8 md:py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 text-sm md:text-base whitespace-nowrap overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              {isLoading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><Search className="w-4 h-4" /><span className="hidden sm:inline">Search</span></>
              }
            </button>
          </div>
        </div>
      </form>

      {/* Quick Discovery Tags */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-gray-600 font-bold uppercase tracking-[0.2em] text-[9px] md:text-[10px]">
          <Sparkles className="w-3 h-3 text-orange-500/60" />
          <span>Quick Discovery</span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-w-3xl">
          {QUICK_TAGS.map((tag, i) => (
            <motion.button
              key={tag.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              onClick={() => { setQuery(tag.label); onSearch(tag.label); }}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/8 bg-white/[0.04] hover:bg-white/[0.09] hover:border-orange-500/40 text-gray-400 hover:text-white transition-all duration-200 text-xs font-medium whitespace-nowrap backdrop-blur-sm"
            >
              <span className="text-[11px] group-hover:scale-110 transition-transform">{tag.emoji}</span>
              <span>{tag.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

    </div>
  );
};