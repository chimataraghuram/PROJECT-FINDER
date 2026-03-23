import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, Zap, Smartphone, Globe, Brain, Terminal, Layout, Bot, Code, Rocket } from 'lucide-react';
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
    <div className={`w-full max-w-6xl mx-auto px-4 ${className}`}>
      
      {/* Expanded Search Bar */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute -inset-[3px] rounded-[2.5rem] transition-all duration-700 ${
          isFocused
            ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-80 blur-[4px]'
            : 'bg-gradient-to-r from-orange-600/30 via-red-600/20 to-orange-600/30 opacity-0 group-hover:opacity-60 blur-[4px]'
        }`} />

        <div className={`relative flex items-center bg-[#0c1628]/90 backdrop-blur-[40px] rounded-[2.5rem] border transition-all duration-500 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden min-h-[80px] md:min-h-[110px] ${
          isFocused ? 'border-orange-500/80 scale-[1.02]' : 'border-white/10 hover:border-white/20'
        }`}>
          <div className="pl-8 md:pl-12 shrink-0">
            <Search className={`w-6 h-6 md:w-8 md:h-8 transition-all duration-500 ${isFocused ? 'text-orange-400 scale-110' : 'text-gray-500'}`} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search AI, Web, ML, and Data Science projects..."
            className="w-full bg-transparent text-white px-6 md:px-10 py-6 md:py-10 text-lg md:text-3xl focus:outline-none placeholder-gray-700 min-w-0 font-black tracking-tight"
            disabled={isLoading}
          />

          <div className="flex items-center gap-4 pr-4 md:pr-6 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSurprise}
              disabled={isLoading}
              className="hidden lg:flex items-center gap-3 px-6 py-4 rounded-2xl text-orange-400 font-black text-sm uppercase tracking-[0.2em] border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all duration-300 whitespace-nowrap group/luck shadow-lg"
            >
              <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
              <span>Surprise Me</span>
            </motion.button>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(234,88,12,0.4)" }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading || !query.trim()}
              className="relative px-8 py-5 md:px-14 md:py-7 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black rounded-2xl transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-4 shadow-2xl shadow-orange-600/40 text-xs md:text-lg uppercase tracking-[0.2em] overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              {isLoading
                ? <Loader2 className="w-6 h-6 animate-spin" />
                : <><Search className="w-5 h-5 md:w-6 md:h-6" /><span className="hidden sm:inline">Explore</span></>
              }
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};