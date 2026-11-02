import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Search, Loader2, Zap, TrendingUp, X, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string, platform?: string) => void;
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

const SURPRISE_QUERIES = [
  'Autonomous AI Agents',
  'Next.js 15 Fullstack',
  'Local LLM Inference',
  'Computer Vision YOLO',
  'Solana Web3 DApp',
  'MCP Agent Servers',
  'Diffusion Image Gen',
  'Auto-GPT',
  'Llama 3',
  'OpenClaw'
];

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading, 
  onSurpriseMe,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('Search AI agents, Web stacks, ML models...');

  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Voice Search (Web Speech API) - seamless mic button inside bar
  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is supported on Chrome, Edge, and Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          onSearch(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Global Ctrl + K / Cmd + K to focus search cleanly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Clean, instant Surprise Me
  const handleSurprise = () => {
    if (onSurpriseMe) {
      onSurpriseMe();
    } else {
      const pick = SURPRISE_QUERIES[Math.floor(Math.random() * SURPRISE_QUERIES.length)];
      setQuery(pick);
      onSearch(pick);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query);
  };

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 ${className}`}>
      
      {/* Clean Single Pill Search Bar Container */}
      <form onSubmit={handleSubmit} className="relative group w-full">
        {/* Subtle ambient glow behind bar */}
        <div className={`absolute -inset-[1px] rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-md ${
          isFocused ? 'opacity-100 blur-lg scale-[1.01]' : 'opacity-40 group-hover:opacity-70'
        }`} />
        
        {/* Gradient Border */}
        <div className="relative p-[1px] rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 transition-transform duration-300">
          
          {/* Inner Search Pill */}
          <div className="relative flex items-center w-full bg-[#0a0a0f] rounded-full p-1.5 md:p-2 pl-5 md:pl-7">
            
            {/* Search Icon */}
            <Search className={`w-5 h-5 md:w-6 md:h-6 shrink-0 transition-all duration-300 ${isFocused ? 'text-orange-400' : 'text-gray-400'}`} />

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholderText}
              className="flex-1 bg-transparent text-white px-3 md:px-4 py-3 md:py-4 text-base md:text-xl focus:outline-none placeholder-gray-500 font-medium tracking-tight min-w-0"
              disabled={isLoading}
            />

            {/* Clear Button */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1.5 mr-1 text-gray-500 hover:text-white transition-colors flex shrink-0"
                title="Clear Search"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}

            {/* Voice Search (Mic) Button */}
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 mr-1.5 ${
                isListening 
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse' 
                  : 'text-gray-400 hover:text-orange-400 hover:bg-white/5'
              }`}
              title={isListening ? "Listening... Speak your project idea" : "Voice Search"}
            >
              <Mic className={`w-4 h-4 md:w-5 md:h-5 ${isListening ? 'animate-bounce text-white' : ''}`} />
            </button>

            {/* Action Buttons: Surprise Me & Explore */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              
              {/* Surprise Me Button */}
              <button
                type="button"
                onClick={handleSurprise}
                disabled={isLoading}
                className="flex items-center justify-center shrink-0 w-10 h-10 md:w-auto md:h-auto gap-0 md:gap-2 px-0 md:px-5 py-0 md:py-4 rounded-full border border-orange-500/40 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/60 transition-all duration-300 font-bold text-[10px] md:text-xs uppercase tracking-widest active:scale-95"
                title="Surprise Me"
              >
                <Zap className="w-4 h-4 md:w-4 md:h-4 shrink-0" fill="currentColor" />
                <span className="hidden md:inline whitespace-nowrap">Surprise Me</span>
              </button>

              {/* Explore Button */}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="flex items-center justify-center shrink-0 w-10 h-10 md:w-auto md:h-auto gap-0 md:gap-2 px-0 md:px-8 py-0 md:py-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-orange-500/50 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin shrink-0" />
                ) : (
                  <>
                    <Search className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                    <span className="hidden md:inline whitespace-nowrap">Explore</span>
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </form>

      {/* Modern Clean Quick Discovery Tags */}
      <div className="mt-12 flex flex-col items-center gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
            Trending Explorations
          </span>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 justify-center max-w-4xl w-full px-2 md:px-0">
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
              className="group frosted-card flex items-center shrink-0 gap-1.5 md:gap-2.5 px-3 md:px-6 py-1.5 md:py-3 rounded-full text-gray-400 hover:text-white transition-all duration-300 text-[10px] md:text-sm font-semibold ring-1 ring-white/5 hover:ring-orange-500/20"
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
