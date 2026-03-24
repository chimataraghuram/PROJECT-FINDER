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
    <div className={`w-full max-w-5xl mx-auto px-4 ${className}`}>
      
      {/* Search Bar Container */}
      <form onSubmit={handleSubmit} className="relative group">
        {/* Subtle Multi-layered Glow Effect */}
        <div className={`absolute -inset-[2px] rounded-full transition-all duration-1000 ${
          isFocused
            ? 'bg-gradient-to-r from-orange-500/30 via-red-500/20 to-orange-500/30 opacity-40 blur-sm scale-[1.01]'
            : 'opacity-0'
        }`} />
        
        <div className={`absolute -inset-[1px] rounded-full transition-all duration-700 ${
          isFocused
            ? 'bg-gradient-to-r from-orange-500/40 via-red-500/30 to-orange-500/40 opacity-80'
            : 'bg-white/5 opacity-30'
        }`} />

        {/* Main Search Input Area */}
        <div className={`relative flex items-center bg-[#050b18]/60 backdrop-blur-2xl rounded-full border transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden ${
          isFocused ? 'border-orange-500/50 ring-1 ring-orange-500/20' : 'border-white/10 hover:border-white/20'
        }`}>
          <div className="pl-7 md:pl-10 shrink-0">
            <Search className={`w-5 h-5 md:w-7 md:h-7 transition-all duration-500 ${isFocused ? 'text-orange-400 scale-110' : 'text-gray-500'}`} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search AI agents, Web stacks, ML models..."
            className="w-full bg-transparent text-white px-5 py-5 md:py-8 text-base md:text-2xl focus:outline-none placeholder-gray-600/80 min-w-0 font-medium tracking-tight"
            disabled={isLoading}
          />

          <div className="flex items-center gap-3 pr-3 md:pr-5 shrink-0">
            <button
              type="button"
              onClick={handleSurprise}
              disabled={isLoading}
              className="hidden sm:flex items-center gap-2.5 px-6 py-3 rounded-full text-orange-400 font-bold text-xs uppercase tracking-wider border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 hover:text-orange-300 transition-all duration-300 whitespace-nowrap group/luck active:scale-95"
            >
              <Zap className="w-4 h-4 group-hover:fill-orange-400 transition-all" />
              <span>Surprise Me</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="relative group/btn h-12 md:h-16 px-6 md:px-12 bg-gradient-to-br from-orange-600 via-red-600 to-orange-500 text-white font-bold rounded-full transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(249,115,22,0.3)] overflow-hidden active:scale-95"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              
              {isLoading
                ? <Loader2 className="w-6 h-6 animate-spin" />
                : <>
                    <Search className="w-5 h-5 md:w-6 md:h-6 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-sm md:text-lg uppercase tracking-widest">Explore</span>
                  </>
              }
            </button>
          </div>
        </div>
      </form>

      {/* Modern Quick Discovery Tags */}
      <div className="mt-12 flex flex-col items-center gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
            Trending Explorations
          </span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center max-w-4xl">
          {QUICK_TAGS.map((tag, i) => (
            <motion.button
              key={tag.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                delay: i * 0.03, 
                duration: 0.4,
                type: "spring",
                stiffness: 400,
                damping: 25
              }}
              onClick={() => { setQuery(tag.label); onSearch(tag.label); }}
              className="group flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/5 bg-[#0a1220]/40 hover:bg-white/10 hover:border-orange-500/40 text-gray-400 hover:text-white transition-all duration-300 text-xs md:text-sm font-semibold backdrop-blur-xl shadow-lg ring-1 ring-white/5 hover:ring-orange-500/20"
            >
              <span className="text-base md:text-lg group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">{tag.icon}</span>
              <span className="tracking-wide">{tag.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};