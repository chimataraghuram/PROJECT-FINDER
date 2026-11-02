import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Search, Loader2, Zap, TrendingUp, X, Mic, MicOff, History, Sparkles, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Official Platform Icons for inline platform selector
const GitHubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-3.5 h-3.5"}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const HuggingFaceIcon = ({ className }: { className?: string }) => (
  <img src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg" className={className || "w-3.5 h-3.5"} alt="Hugging Face" />
);

const KaggleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-3.5 h-3.5"}>
    <path d="M18.825 23.859c-.022.09-.092.126-.168.141h-3.32c-.172 0-.254-.078-.344-.19L11.516 19.34l-3.32 3.19v1.272c0 .125-.094.202-.204.202H5.064c-.11 0-.195-.08-.195-.202V.219C4.869.094 4.963 0 5.064 0h2.928c.11 0 .204.094.204.219v15.023L14.776.438A.268.268 0 0 1 14.98 0h3.407c.101 0 .195.055.226.133.031.086.008.188-.047.242L11.758 7.375l7.027 16.273c.047.11.024.235-.047.305Z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-3.5 h-3.5"}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

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

const SURPRISE_CANDIDATES = [
  { query: 'Autonomous AI Agents', category: 'AI & Robotics' },
  { query: 'Fullstack Next.js 15 Starter', category: 'Web Development' },
  { query: 'Local LLM Inference Engine', category: 'Deep Learning' },
  { query: 'Real-time Computer Vision', category: 'Machine Learning' },
  { query: 'Solana Web3 DApp Suite', category: 'Blockchain' },
  { query: 'Model Context Protocol Servers', category: 'Agent Infrastructure' },
  { query: 'Diffusion Image Generation', category: 'Generative AI' },
  { query: 'High-Performance Rust Backend', category: 'Systems Engineering' },
];

const PLATFORMS = [
  { id: 'All', label: 'All', icon: null },
  { id: 'GitHub', label: 'GitHub', icon: GitHubIcon },
  { id: 'Hugging Face', label: 'Hugging Face', icon: HuggingFaceIcon },
  { id: 'Kaggle', label: 'Kaggle', icon: KaggleIcon },
  { id: 'LinkedIn', label: 'LinkedIn', icon: LinkedInIcon },
];

const SMART_SUGGESTIONS = [
  'DeepSeek R1 Architecture',
  'Next.js 15 Fullstack Starter',
  'Autonomous AI Agent Framework',
  'LangChain & RAG Pipeline',
  'Model Context Protocol MCP',
  'Tailwind CSS v4 Dashboard',
  'PyTorch Computer Vision',
  'FastAPI Microservices Template',
];

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading, 
  onSurpriseMe,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string>('All');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isRollingSurprise, setIsRollingSurprise] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('Search AI agents, Web stacks, ML models...');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('project-finder-recent-queries') || '[]');
      if (Array.isArray(stored)) setRecentSearches(stored.slice(0, 5));
    } catch { /* ignore */ }
  }, []);

  const saveRecentSearch = (q: string) => {
    const clean = q.trim();
    if (!clean) return;
    try {
      const stored = JSON.parse(localStorage.getItem('project-finder-recent-queries') || '[]');
      const updated = [clean, ...stored.filter((item: string) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      localStorage.setItem('project-finder-recent-queries', JSON.stringify(updated));
      setRecentSearches(updated.slice(0, 5));
    } catch { /* ignore */ }
  };

  const removeRecentSearch = (e: React.MouseEvent, target: string) => {
    e.stopPropagation();
    try {
      const stored = JSON.parse(localStorage.getItem('project-finder-recent-queries') || '[]');
      const updated = stored.filter((item: string) => item !== target);
      localStorage.setItem('project-finder-recent-queries', JSON.stringify(updated));
      setRecentSearches(updated.slice(0, 5));
    } catch { /* ignore */ }
  };

  // 1. Voice Search (Web Speech API)
  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please try Google Chrome or Edge.");
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
          saveRecentSearch(transcript);
          onSearch(transcript, activePlatform === 'All' ? undefined : activePlatform);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Global Ctrl + K / Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 5. Smart "Surprise Me" Cycler with animated typewriter slot effect
  const handleSurprise = () => {
    if (isRollingSurprise) return;
    setIsRollingSurprise(true);

    const pick = SURPRISE_CANDIDATES[Math.floor(Math.random() * SURPRISE_CANDIDATES.length)];
    let iteration = 0;
    const interval = setInterval(() => {
      iteration++;
      const tempPick = SURPRISE_CANDIDATES[Math.floor(Math.random() * SURPRISE_CANDIDATES.length)];
      setPlaceholderText(`🎲 Rolling: ${tempPick.query}…`);
      
      if (iteration > 6) {
        clearInterval(interval);
        setPlaceholderText('Search AI agents, Web stacks, ML models...');
        setQuery(pick.query);
        setIsRollingSurprise(false);
        saveRecentSearch(pick.query);
        onSearch(pick.query, activePlatform === 'All' ? undefined : activePlatform);
      }
    }, 120);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsFocused(false);
    saveRecentSearch(query);
    onSearch(query, activePlatform === 'All' ? undefined : activePlatform);
  };

  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    setIsFocused(false);
    saveRecentSearch(text);
    onSearch(text, activePlatform === 'All' ? undefined : activePlatform);
  };

  // Filter auto-complete suggestions matching user input
  const filteredSuggestions = SMART_SUGGESTIONS.filter(item => 
    !query || item.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 ${className} relative`}>
      
      {/* 3. Platform Selector Capsule - Above / Integrated */}
      <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto py-1 px-2 custom-scrollbar">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isActive = activePlatform === platform.id;
          return (
            <motion.button
              key={platform.id}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActivePlatform(platform.id);
                if (query.trim()) {
                  onSearch(query, platform.id === 'All' ? undefined : platform.id);
                }
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-orange-400/50'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{platform.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Main Search Bar Container */}
      <form onSubmit={handleSubmit} className="relative group w-full z-30">
        {/* Subtle glow behind the entire bar */}
        <div className={`absolute -inset-[1px] rounded-full transition-all duration-700 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-md ${
          isFocused ? 'opacity-100 blur-lg scale-[1.01]' : 'opacity-40 group-hover:opacity-70'
        }`} />
        
        {/* Gradient Border Wrapper */}
        <div className="relative p-[1px] rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 overflow-visible transition-transform duration-300">
          
          {/* Inner Container */}
          <div className="relative flex items-center w-full bg-[#0a0a0f] rounded-full p-1.5 md:p-2 pl-4 md:pl-7">
            
            {/* Search Icon */}
            <Search className={`w-5 h-5 md:w-6 md:h-6 shrink-0 transition-all duration-300 ${isFocused ? 'text-orange-400' : 'text-gray-400'}`} />

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={placeholderText}
              className="flex-1 bg-transparent text-white px-3 md:px-4 py-3 md:py-4 text-base md:text-xl focus:outline-none placeholder-gray-500 font-medium tracking-tight min-w-0"
              disabled={isLoading || isRollingSurprise}
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

            {/* 1. Voice Search (Microphone) Button */}
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 mr-1.5 ${
                isListening 
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse' 
                  : 'text-gray-400 hover:text-orange-400 hover:bg-white/5'
              }`}
              title={isListening ? "Listening... Speak now" : "Speak to Search"}
            >
              {isListening ? <Mic className="w-4 h-4 md:w-5 md:h-5 text-white animate-bounce" /> : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              
              {/* 5. Surprise Me Button with Rolling Animation */}
              <button
                type="button"
                onClick={handleSurprise}
                disabled={isLoading || isRollingSurprise}
                className={`flex items-center justify-center shrink-0 w-10 h-10 md:w-auto md:h-auto gap-0 md:gap-2 px-0 md:px-5 py-0 md:py-4 rounded-full border border-orange-500/40 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/60 transition-all duration-300 font-bold text-[10px] md:text-xs uppercase tracking-widest active:scale-95 ${
                  isRollingSurprise ? 'animate-pulse border-orange-500 bg-orange-500/20' : ''
                }`}
                title="Surprise Me with Breakthrough Tech"
              >
                <Zap className={`w-4 h-4 md:w-4 md:h-4 shrink-0 ${isRollingSurprise ? 'animate-spin' : ''}`} fill="currentColor" />
                <span className="hidden md:inline whitespace-nowrap">
                  {isRollingSurprise ? 'Picking…' : 'Surprise Me'}
                </span>
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

      {/* 2. Real-Time Auto-Complete & Smart Dropdown Suggestions */}
      <AnimatePresence>
        {isFocused && (recentSearches.length > 0 || filteredSuggestions.length > 0) && (
          <>
            {/* Backdrop click dismiss */}
            <div 
              className="fixed inset-0 z-20" 
              onClick={() => setIsFocused(false)} 
            />

            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute left-4 right-4 top-full mt-3 p-4 rounded-3xl bg-[#0a0a0f]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-30 space-y-4"
            >
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 px-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <History size={12} className="text-orange-400" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {recentSearches.map((item) => (
                      <div
                        key={item}
                        onClick={() => handleSelectSuggestion(item)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <History size={13} className="text-gray-500 group-hover:text-orange-400 shrink-0" />
                          <span className="text-xs font-semibold text-gray-300 group-hover:text-white truncate">{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, item)}
                          className="text-gray-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from history"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart & Trending Suggestions */}
              {filteredSuggestions.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-2 px-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <Sparkles size={12} className="text-purple-400" />
                    <span>Trending & AI Suggestions</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {filteredSuggestions.map((item) => (
                      <div
                        key={item}
                        onClick={() => handleSelectSuggestion(item)}
                        className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 transition-all cursor-pointer group text-left"
                      >
                        <Search size={13} className="text-gray-500 group-hover:text-orange-400 shrink-0" />
                        <span className="text-xs font-semibold text-gray-300 group-hover:text-orange-300 truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modern Quick Discovery Tags */}
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
              onClick={() => { setQuery(tag.label); onSearch(tag.label, activePlatform === 'All' ? undefined : activePlatform); }}
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
