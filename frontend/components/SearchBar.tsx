import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Search, Loader2, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
  onSurpriseMe?: () => void;
  hideCategoriesOnMobile?: boolean;
  className?: string;
}

const QUICK_TAGS = [
  { label: 'Chatbot', icon: '💬' },
  { label: 'Portfolio', icon: '📁' },
  { label: 'Netflix Clone', icon: '🎬' },
  { label: 'OpenClaw', icon: '🤖' },
  { label: 'NanoClaw', icon: '🛡️' },
  { label: 'PicoClaw', icon: '📱' },
  { label: 'MegaClaw', icon: '💾' },
  { label: 'OppoClaw', icon: '🔄' },
  { label: 'HyperClaw', icon: '⚡' },
  { label: 'Llama 3', icon: '🧠' },
  { label: 'Auto-GPT', icon: '🤖' },
  { label: 'Stable Diffusion', icon: '✨' },
  { label: 'Computer Vision', icon: '👁️' },
  { label: 'React 19', icon: '⚛️' },
  { label: 'Blockchain', icon: '🔗' },
];

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading, 
  onSurpriseMe,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleSurprise = () => {
    if (onSurpriseMe) {
      onSurpriseMe();
    } else {
      const SURPRISE_QUERIES = ['Auto-GPT', 'Llama 3', 'OpenClaw', 'NanoClaw'];
      const randomTag = SURPRISE_QUERIES[Math.floor(Math.random() * SURPRISE_QUERIES.length)];
      setQuery(randomTag);
      onSearch(randomTag);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 ${className}`}>
      
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute -inset-[2px] rounded-2xl transition-all duration-700 ${
          isFocused
            ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-80 blur-[2px]'
            : 'bg-gradient-to-r from-orange-600/30 via-red-600/20 to-orange-600/30 opacity-0 group-hover:opacity-60 blur-[2px]'
        }`} />

        <div className={`relative flex items-center bg-[#0c1628]/80 backdrop-blur-3xl rounded-2xl border transition-all duration-300 shadow-2xl overflow-hidden ${
          isFocused ? 'border-orange-500/60' : 'border-white/8 hover:border-white/15'
        }`}>
          <div className="pl-5 md:pl-6 shrink-0">
            <Search className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-300 ${isFocused ? 'text-orange-400' : 'text-gray-500'}`} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search AI, Web, ML projects..."
            className="w-full bg-transparent text-white px-4 py-4 md:py-6 text-sm md:text-xl focus:outline-none placeholder-gray-600 min-w-0 font-medium"
            disabled={isLoading}
          />

          <div className="flex items-center gap-2 pr-2 shrink-0">
            <button
              type="button"
              onClick={handleSurprise}
              disabled={isLoading}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-orange-400 font-black text-[10px] md:text-xs uppercase tracking-widest border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/40 transition-all duration-200 whitespace-nowrap group/luck"
            >
              <Zap className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
              <span>Surprise Me</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="relative px-5 py-2.5 md:px-10 md:py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black rounded-xl transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 text-[10px] md:text-sm uppercase tracking-widest overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              {isLoading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><Search className="w-4 h-4" /><span>Explore</span></>
              }
            </button>
          </div>
        </div>
      </form>

      {/* Enlarged Quick Discovery Tags */}
      <div className="mt-8 flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-2 text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">
          <TrendingUp className="w-4 h-4 text-orange-500/80" />
          <span>Trending projects</span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center max-w-5xl">
          {QUICK_TAGS.map((tag, i) => (
            <motion.button
              key={tag.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              onClick={() => { setQuery(tag.label); onSearch(tag.label); }}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] hover:border-orange-500/40 text-gray-400 hover:text-white transition-all duration-300 text-xs md:text-sm font-black whitespace-nowrap backdrop-blur-md shadow-lg"
            >
              <span className="text-sm md:text-base group-hover:scale-125 transition-transform duration-300">{tag.icon}</span>
              <span className="uppercase tracking-wider">{tag.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};