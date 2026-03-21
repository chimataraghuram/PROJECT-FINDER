import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, Zap, Smartphone, Globe, Brain, Terminal, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
  onSurpriseMe?: () => void;
}

const QUICK_TAGS = [
  { label: 'Chatbot', emoji: '💬' },
  { label: 'Portfolio', emoji: '📁' },
  { label: 'Netflix Clone', emoji: '🎥' },
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

const CATEGORIES = [
  { id: 'All', label: 'All Projects', icon: Layout },
  { id: 'AI', label: 'AI', icon: Brain },
  { id: 'Web Dev', label: 'Web Dev', icon: Globe },
  { id: 'App Dev', label: 'App Dev', icon: Smartphone },
  { id: 'Machine Learning', label: 'Machine Learning', icon: Terminal },
  { id: 'Fun Projects', label: 'Fun Projects', icon: Sparkles },
];

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading, 
  onCategoryChange, 
  selectedCategory = 'All',
  onSurpriseMe 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const isFirstRender = useRef(true);

  // Debounce search effect for real-time typing
  useEffect(() => {
    // Skip the very first automatic render trigger
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      // Don't auto-search if the typing is just 1 letter. Empty ('') is fine to reset home.
      const trimmedQuery = query.trim();
      if (!trimmedQuery || trimmedQuery.length >= 2) {
        onSearch(trimmedQuery);
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
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
    <div className="w-full max-w-4xl mx-auto px-4">
      
      {/* Category Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 animate-fade-in">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange?.(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
              selectedCategory === cat.id
                ? cat.id === 'All'
                  ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_25px_rgba(234,88,12,0.6)] scale-110 z-10'
                  : 'bg-orange-600/80 border-orange-500/50 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)] scale-105'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

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

      {/* Quick Discovery Tags - Moved back below search */}
      <div className="mt-8 flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-2 text-gray-600 font-black uppercase tracking-[0.3em] text-[8px] md:text-[9px]">
          <Sparkles className="w-3 h-3 text-orange-500/60" />
          <span>Trending Heuristics</span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-w-4xl">
          {QUICK_TAGS.map((tag, i) => (
            <motion.button
              key={tag.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              onClick={() => { setQuery(tag.label); onSearch(tag.label); }}
              className="group flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-orange-500/30 text-gray-500 hover:text-white transition-all duration-200 text-[10px] font-bold whitespace-nowrap backdrop-blur-sm"
            >
              <span className="text-xs group-hover:rotate-12 transition-transform">{tag.emoji}</span>
              <span>{tag.label}</span>
            </motion.button>
          ))}
        </div>
      </div>


    </div>
  );
};