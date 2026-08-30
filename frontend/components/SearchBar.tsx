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
            <form onSubmit={handleSubmit} className="relative group w-full">
        {/* Subtle glow behind the entire bar */}
        <div className={`absolute -inset-[1px] rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-md ${
          isFocused ? 'opacity-100 blur-lg scale-[1.01]' : 'opacity-40 group-hover:opacity-70'
        }`} />
        
        {/* Gradient Border Wrapper */}
        <div className="relative p-[1px] rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 overflow-visible transition-transform duration-300">
          
          {/* Inner Container */}
          <div className="relative flex items-center w-full bg-[#0a0a0f] rounded-full p-1.5 md:p-2 pl-6 md:pl-8">
            
            {/* Search Icon */}
            <Search className={`w-5 h-5 md:w-6 md:h-6 shrink-0 transition-all duration-300 ${isFocused ? 'text-white' : 'text-gray-400'}`} />

            {/* Input Field */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search AI agents, Web stacks, ML models..."
              className="flex-1 bg-transparent text-white px-4 py-3 md:py-4 text-base md:text-xl focus:outline-none placeholder-gray-500 font-medium tracking-tight min-w-0"
              disabled={isLoading}
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              
              {/* Surprise Me Button */}
              <button
                type="button"
                onClick={handleSurprise}
                disabled={isLoading}
                className="hidden sm:flex items-center gap-2 px-5 py-3 md:py-4 rounded-full border border-orange-500/40 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/60 transition-all duration-300 font-bold text-[10px] md:text-xs uppercase tracking-widest active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" fill="currentColor" />
                <span>Surprise Me</span>
              </button>

              {/* Explore Button */}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-orange-500/50 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Explore</span>
                  </>
                )}
              </button>

            </div>
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
              className="group frosted-card flex items-center gap-2.5 px-6 py-3 rounded-full text-gray-400 hover:text-white transition-all duration-300 text-xs md:text-sm font-semibold ring-1 ring-white/5 hover:ring-orange-500/20"
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
