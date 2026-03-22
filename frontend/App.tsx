import React, { useState, useRef, useEffect } from 'react';
import { SearchBar, CATEGORIES } from './components/SearchBar';
import { ProjectCard } from './components/ProjectCard';
import Particles from './components/Particles';
import { Project, SearchResult, SearchState } from './types';
import { Search, Sparkles, Heart, Chrome, Bot, X, Send, FileCode, Github, ExternalLink, Linkedin, User, Globe, MessageCircle, Flame, Loader2, Rocket, ArrowRight, Layout, Shield, Brain, Share2, BarChart3, Star, TrendingUp, Play, Info } from 'lucide-react';
import { Footer } from './components/Footer';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { SkeletonCard } from './components/SkeletonCard';
import { TechboyAssistant } from './components/TechboyAssistant';
import { AuthButton } from './components/AuthButton';
import { TrendingProjects } from './components/TrendingProjects';
import { UserDashboard } from './components/UserDashboard';
import { searchProjects, fetchTrendingProjects, saveProject, fetchFavorites } from './services/apiService';
import { ComparisonStudio } from './components/ComparisonStudio';
import mascotLogo from './src/assets/logos/logo_final_v6.png';

type ViewType = 'search' | 'favorites' | 'readme' | 'dashboard' | 'trending';
type PlatformFilter = 'All' | 'GitHub' | 'Hugging Face' | 'Kaggle' | 'LinkedIn';

const LABELS = {
  discover: "Search Projects",
  trending: "Trending Projects",
  favorites: "Starred"
};

const DEFAULT_FAVORITES: Project[] = [
  {
    id: 'def-1',
    name: "Project Finder",
    description: "The ultimate project discovery engine for students and data scientists. Modern UI, AI-powered summaries, and multi-platform search.",
    platform: 'GitHub',
    url: "https://github.com/chimataraghuram/PROJECT-FINDER",
    tags: ["React", "Vite", "Tailwind", "Firebase"],
    stars: "1.2k",
    isPublisher: true,
    type: 'project'
  },
  {
    id: 'def-portfolio',
    name: "Developer Portfolio",
    description: "The official portfolio of Chimata Raghuram. Featuring high-end UI/UX designs and full-stack AI implementations.",
    platform: 'GitHub',
    url: "https://github.com/chimataraghuram/Portfolio",
    tags: ["Portfolio", "Next.js", "Three.js"],
    stars: "850",
    isPublisher: true,
    type: 'project'
  },
  {
    id: 'def-5',
    name: "Auto-GPT",
    description: "An experimental open-source attempt to make GPT-4 fully autonomous. Auto-GPT pushes the boundaries of what is possible with AI.",
    platform: 'GitHub',
    url: "https://github.com/Significant-Gravitas/Auto-GPT",
    tags: ["Autonomous", "GPT-4", "Python"],
    stars: "160k",
    type: 'project'
  },
  {
    id: 'def-6',
    name: "chimataraghuram",
    description: "Featured developer profile for Raghuram Chimata. Full-stack architect and creator of Project Finder.",
    platform: 'GitHub',
    url: "https://github.com/chimataraghuram",
    tags: ["Developer", "Founder", "UI/UX"],
    stars: "500",
    type: 'readme'
  }
];

import { IntroVideo } from './components/IntroVideo';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('search');
  
  // Parallax Background Logic
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 5000], [0, -500]);
  const smoothY = useSpring(yParallax, { damping: 15, stiffness: 100 });
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    error: null,
    hasSearched: false,
  });
  const [result, setResult] = useState<SearchResult | null>(null);

  // Filtering State
  const [filterPlatform, setFilterPlatform] = useState<PlatformFilter>('All');

  const [favorites, setFavorites] = useState<Project[]>(() => {
    const saved = localStorage.getItem('project-finder-favorites');
    if (saved) return JSON.parse(saved);
    return DEFAULT_FAVORITES;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleSurpriseMe = () => {
    const pools = ['AI', 'React', 'Python', 'Agent', 'Automation', 'CLI', 'Web3', 'Tailwind', 'Next.js'];
    const randomQuery = pools[Math.floor(Math.random() * pools.length)];
    handleSearch(randomQuery);
  };

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('project-finder-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [comparisonQueue, setComparisonQueue] = useState<Project[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const toggleComparison = (project: Project) => {
    setComparisonQueue(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) return prev.filter(p => p.id !== project.id);
      if (prev.length >= 3) return prev; // Max 3 projects
      return [...prev, project];
    });
  };

  // Auth & Cloud Sync
  useEffect(() => {
    const token = localStorage.getItem('project-finder-token');
    if (token && currentUser) {
      fetchFavorites(token).then(favs => {
        if (favs.length > 0) setFavorites(favs);
      });
    }

    const handleStorageChange = () => {
      const savedUser = localStorage.getItem('project-finder-user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      else setCurrentUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('project-finder-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = async (project: Project) => {
    const isFav = favorites.some(p => p.url === project.url);
    if (isFav) {
      setFavorites(prev => prev.filter(p => p.url !== project.url));
      return;
    }

    const token = localStorage.getItem('project-finder-token');
    if (token) {
      const saved = await saveProject(project, token);
      if (saved) {
        setFavorites(prev => [...prev, saved]);
      }
    } else {
      setFavorites(prev => [...prev, { ...project, type: project.type || 'project' }]);
    }
  };

  const triggerComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000);
  };

  useEffect(() => {
    if (result && !searchState.isLoading) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [result, searchState.isLoading]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      // Return to home state if search is cleared
      setSearchState({ isLoading: false, error: null, hasSearched: false });
      setResult(null);
      return;
    }

    setSearchState({ isLoading: true, error: null, hasSearched: true });
    setResult(null);
    // Preserving filterPlatform so users can search within a specific tab
    try {
      const data = await searchProjects(query);
      setResult(data);
      setSearchState({ isLoading: false, error: null, hasSearched: true });
    } catch (err: any) {
      setSearchState({
        isLoading: false,
        error: err.message || "An error occurred",
        hasSearched: true
      });
    }
  };

  const filteredProjects = result?.projects.filter(project => {
    const matchesPlatform = filterPlatform === 'All' || project.platform === filterPlatform;
    const matchesCategory = selectedCategory === 'All' || 
      project.tags.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      project.description.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesPlatform && matchesCategory;
  }) || [];

  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsCompact(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NAV_ITEMS = [
    { id: 'search', label: 'Search Projects', icon: Search, color: 'from-orange-600 to-orange-500' },
    { id: 'readme', label: 'Trending Projects', icon: TrendingUp, color: 'from-orange-600 to-orange-500' },
    { id: 'favorites', label: 'Starred', icon: Star, color: 'from-orange-600 to-orange-500' }
  ];

  return (
    <div className={`min-h-screen text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-500`}>
      {showIntro ? (
        <IntroVideo onComplete={() => setShowIntro(false)} />
      ) : (
        <>
          <Particles />
          <div className="parallax-bg-container">
            <motion.div 
              style={{ y: smoothY }}
              className="parallax-bg-image animate-drift"
              animate={{ opacity: [0.12, 0.16, 0.12], scale: [1, 1.02, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="parallax-bg-overlay" />
          </div>

          {/* --- DESKTOP NAVIGATION (Fixed Islands) --- */}
          <div className="hidden md:block">
            {/* 1. Left Island: Logo & Brand */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                boxShadow: isCompact ? "0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(249,115,22,0.3)" : "0 10px 30px rgba(0,0,0,0.3)"
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`fixed top-4 left-8 z-[2000] px-5 py-2.5 flex items-center gap-4 bg-[#0f172a]/${isCompact ? '60' : '40'} ${isCompact ? 'backdrop-blur-[40px]' : 'backdrop-blur-2xl'} border border-white/10 rounded-full pointer-events-auto cursor-pointer group/logo transition-all duration-300`}
              onClick={() => { setCurrentView('search'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <motion.div 
                className="relative"
                animate={{ scale: isCompact ? 1.2 : 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover/logo:opacity-40" />
                <img src={mascotLogo} className="w-11 h-11 md:w-14 md:h-14 rounded-full object-cover border-2 border-white/20 shadow-2xl relative z-10 transition-all duration-300" alt="Mascot Logo" />
              </motion.div>
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover/logo:opacity-40" />
                <div className="w-8 h-8 md:w-9 md:h-9 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center relative z-10 transition-all duration-300 shadow-xl group-hover/logo:border-orange-500/60 group-hover/logo:bg-orange-500/20">
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-orange-500 transition-transform duration-300 group-hover/logo:scale-110" strokeWidth={2.5} />
                </div>
              </div>
              <motion.span 
                animate={{ 
                  scale: isCompact ? 0.9 : 1,
                  opacity: isCompact ? 0.9 : 1
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden md:inline-block text-base md:text-lg font-black text-white tracking-tighter uppercase leading-none origin-left"
              >
                Project Finder
              </motion.span>
            </motion.div>

            {/* 2. Middle Island: Adaptive Navigation Pill (Fixed) */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] pointer-events-auto">
              <motion.nav 
                layout
                animate={{ 
                  scale: isCompact ? 0.95 : 1,
                  opacity: 1,
                  boxShadow: isCompact ? "0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(249,115,22,0.3)" : "0 10px 30px rgba(0,0,0,0.3)"
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`p-1.5 md:p-2 bg-[#0f172a]/${isCompact ? '60' : '40'} ${isCompact ? 'backdrop-blur-[40px]' : 'backdrop-blur-2xl'} border border-white/10 rounded-full flex items-center gap-2 md:gap-3 transition-all duration-300`}
              >
                {NAV_ITEMS.map((item) => {
                  const isActive = currentView === item.id;
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      layout
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setCurrentView(item.id as ViewType); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`h-10 md:h-12 px-5 md:px-6 rounded-full border flex items-center justify-center gap-3 transition-all duration-300 font-bold text-[11px] md:text-xs tracking-widest uppercase relative overflow-hidden group/nav ${
                        isActive 
                          ? `bg-gradient-to-r ${item.color} text-white border-white/20 shadow-[0_0_25px_rgba(249,115,22,0.4)]` 
                          : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                      } ${isCompact ? 'px-4 min-w-[52px]' : ''}`}
                    >
                      <Icon className={`${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-70'} w-5 h-5 transition-all`} />
                      <AnimatePresence mode="sync">
                        {!isCompact && (
                          <motion.span
                            initial={{ width: 0, opacity: 0, x: -10 }}
                            animate={{ width: 'auto', opacity: 1, x: 0 }}
                            exit={{ width: 0, opacity: 0, x: -10 }}
                            className="hidden sm:inline-block"
                          >
                            {item.label} {item.id === 'favorites' && `(${favorites.length})`}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && <motion.div layoutId="activeTab" className="absolute bottom-1 inset-x-5 h-0.5 bg-white/60 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
                    </motion.button>
                  );
                })}
              </motion.nav>
            </div>

            {/* 3. Right Island: Action Hub */}
            <div className="fixed top-4 right-8 z-[2000] pointer-events-auto">
              <motion.div 
                layout
                animate={{ 
                  scale: isCompact ? 0.9 : 1,
                  opacity: 1,
                  boxShadow: isCompact ? "0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(249,115,22,0.3)" : "0 10px 30px rgba(0,0,0,0.3)"
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`flex items-center gap-3 md:gap-4 bg-[#0f172a]/${isCompact ? '60' : '40'} ${isCompact ? 'backdrop-blur-[40px]' : 'backdrop-blur-2xl'} border border-white/10 rounded-full p-2.5 md:p-3 transition-all duration-300`}
              >
                <motion.button
                  onClick={() => setIsAIAssistantOpen(true)}
                  className="h-9 md:h-10 px-3 md:px-5 rounded-full border border-orange-500/30 bg-orange-500/10 flex items-center gap-2.5 group/aipill shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="p-1.5 bg-orange-500 rounded-lg shadow-lg shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/90 group-hover/aipill:text-orange-500 transition-colors">
                    TECHBOY AI
                  </span>
                </motion.button>
                
                <AuthButton onViewDashboard={() => setCurrentView('dashboard')} />
              </motion.div>
            </div>
          </div>

          {/* --- MOBILE HEADER (Logo Left | AI + User Right) --- */}
          <div className="block md:hidden fixed top-0 left-0 right-0 z-[2000] px-4 py-3 bg-[#0f172a]/60 backdrop-blur-[40px] border-b border-white/5">
            <div className="flex items-center justify-between">
              {/* Logo (Left) */}
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => { setCurrentView('search'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20" />
                  <img src={mascotLogo} className="w-8 h-8 rounded-full border border-white/20 shadow-lg relative z-10" alt="Logo" />
                </div>
                <span className="text-sm font-black text-white tracking-tighter uppercase">Project Finder</span>
              </div>

              {/* Actions (Right) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAIAssistantOpen(true)}
                  className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Bot className="w-4.5 h-4.5" />
                </button>
                <AuthButton minimal onViewDashboard={() => setCurrentView('dashboard')} />
              </div>
            </div>
          </div>



          <main className="relative z-10 pt-[60px] md:pt-0">
            {/* Global Mobile Sticky Logo Pill */}

            {/* Trending View */}
            {currentView === 'readme' && (
              <TrendingProjects 
                favorites={favorites} 
                onToggleFavorite={toggleFavorite} 
                onToggleComparison={toggleComparison}
                comparisonQueue={comparisonQueue}
                onSummarize={(projectName) => {
                  setCurrentView('search');
                  handleSearch(`Summarize ${projectName}`);
                }}
              />
            )}

            {currentView === 'dashboard' && currentUser && (
              <UserDashboard 
                user={currentUser}
                savedProjects={favorites}
                onNavigateToDiscover={() => setCurrentView('search')}
              />
            )}


            {currentView === 'search' && (

              /* SEARCH VIEW */
              <div className={`animate-fade-in home-content-wrapper pb-32 md:pb-0 ${!searchState.hasSearched ? 'flex flex-col' : 'pt-4 md:pt-40'}`}>
                {/* Hero Section (Phase 3 Simplified) */}
                <section className={`transition-all duration-1000 ease-in-out px-4 relative overflow-hidden home-section ${searchState.hasSearched ? 'py-4 md:py-8' : 'pt-12 md:pt-32 pb-8 md:pb-20'}`}>
                  <div className="text-center mb-6 md:mb-16 space-y-8 md:space-y-8 relative z-10 max-w-6xl mx-auto">
                    <h1 className="flex flex-col items-center font-black tracking-tighter mb-4 md:mb-8 leading-tight animate-liquid-drop home-title gap-2 md:gap-2">
                      <span className="text-white text-[1.8rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] animate-liquid-text" data-text="Find Real-World Projects 🚀">
                        Find Real-World Projects <span className="hidden md:inline">🚀</span>
                      </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-white to-red-300 bg-300% animate-gradient drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] text-[0.9rem] sm:text-xl md:text-2xl lg:text-[1.8rem] font-bold tracking-widest uppercase home-subtitle-top">
                        Discover & Build Faster
                      </span>
                    </h1>
                    
                    <div className="flex flex-col items-center gap-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setSelectedCategory('All'); handleSearch(''); }} 
                        className="px-10 py-4 bg-orange-600 border border-orange-500 text-white rounded-full font-black uppercase tracking-widest shadow-[0_0_30px_rgba(234,88,12,0.5)] flex items-center gap-3 transition-all duration-300 active:scale-95 md:hidden"
                      >
                         <Layout className="w-5 h-5" />
                         <span>All Projects</span>
                      </motion.button>

                      <p className="text-gray-400 text-[10px] md:text-base max-w-xl mx-auto px-6 leading-relaxed font-medium opacity-60 hidden md:block">
                        The ultimate research engine for <br className="hidden md:block" /> <span className="text-white">GitHub</span>, <span className="text-hf-yellow">Hugging Face</span>, <span className="text-orange-400">Kaggle</span>, and <span className="text-blue-400">LinkedIn</span>.
                      </p>
                    </div>
                  </div>


                  <SearchBar 
                    onSearch={handleSearch} 
                    isLoading={searchState.isLoading}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    onSurpriseMe={handleSurpriseMe}
                    hideCategoriesOnMobile={true}
                  />

                  {/* Mobile Mobile-Only Category Section (Below Search) */}
                  <div className="md:hidden mt-8 px-4">
                    <div className="flex flex-wrap justify-center gap-3">
                      {CATEGORIES.filter(cat => cat.id !== 'All').map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                            selectedCategory === cat.id
                              ? 'bg-[#1e293b]/80 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                              : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                          }`}
                        >
                          <cat.icon className="w-3.5 h-3.5" />
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hero Suggestions - Trending Now */}
                  {!searchState.hasSearched && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-12 md:mt-24 max-w-6xl mx-auto px-4 relative"
                    >
                      {/* TECH BACKGROUND DECOR (Subtle) */}
                      <div className="absolute inset-0 -top-20 pointer-events-none opacity-10">
                         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px]" />
                         <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
                      </div>

                      <div className="flex items-center gap-4 mb-12 relative z-10">
                        <div className="p-3 bg-[#1c1917] rounded-xl border border-orange-500/20 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                           <Flame size={24} className="text-[#f97316] fill-[#f97316]/20" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase italic">Trending Now</h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {[
                          {
                            id: 'trend-1',
                            name: "OpenClaw",
                            description: "The leading open-source personal TECHBOY AI Assistant. Autonomous agents that connect to WhatsApp, Slack, and Discord to solve complex tasks directly via chat.",
                            platform: 'GitHub' as const,
                            url: "https://github.com/OpenClaw/OpenClaw",
                            tags: ["AI AGENT", "AUTONOMOUS", "PYTHON"],
                            stars: "12.5k",
                            type: 'project' as const
                          },
                          {
                            id: 'trend-2',
                            name: "NanoClaw",
                            description: "A security-first, lightweight alternative to OpenClaw. Runs AI actions in isolated containers (Docker) for maximum safety and data privacy.",
                            platform: 'GitHub' as const,
                            url: "https://github.com/NanoClaw/NanoClaw",
                            tags: ["SECURE AI", "SANDBOXED", "TYPESCRIPT"],
                            stars: "8.2k",
                            type: 'project' as const
                          }
                        ].map((project, idx) => {
                          const isFav = favorites.some(f => f.url === project.url);
                          
                          return (
                            <motion.div
                              key={project.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 * idx }}
                              className="relative group rounded-[2.5rem] bg-[#020617]/40 backdrop-blur-3xl border border-white/10 p-8 shadow-2xl hover:border-orange-500/40 transition-all duration-500 overflow-hidden"
                            >
                              {/* Card Content Top Row */}
                              <div className="flex justify-between items-start mb-8">
                                <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 flex items-center gap-2">
                                  <Github size={14} className="text-white" />
                                  <span className="text-[10px] font-black text-white tracking-widest uppercase">{project.platform}</span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setShowComingSoon(true); setTimeout(() => setShowComingSoon(false), 2000); }}
                                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all cursor-pointer text-gray-400 hover:text-blue-400"
                                    title="Security Status"
                                  >
                                    <Shield size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleSearch(`Summarize ${project.name}`); }}
                                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-orange-500/10 hover:border-orange-500/20 transition-all cursor-pointer text-gray-400 hover:text-orange-500"
                                    title="AI Summary"
                                  >
                                    <Brain size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      navigator.clipboard.writeText(project.url);
                                      // Trigger toast using coming soon for now but message is copy
                                    }}
                                    className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-green-500/10 hover:border-green-500/20 transition-all cursor-pointer text-gray-400 hover:text-green-500"
                                    title="Share Project"
                                  >
                                    <Share2 size={14} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(project); }}
                                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                      isFav 
                                      ? 'bg-red-500/20 border-red-500/30 text-red-500' 
                                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500'
                                    }`}
                                    title="Save to Collection"
                                  >
                                    <Heart size={14} fill={isFav ? "currentColor" : "none"} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleComparison(project); }}
                                    className={`p-2 rounded-lg border transition-all cursor-pointer ${
                                      comparisonQueue.some(p => p.id === project.id)
                                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-500'
                                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-purple-500/10 hover:border-purple-500/20 hover:text-purple-500'
                                    }`}
                                    title="Add to Comparison"
                                  >
                                    <BarChart3 size={14} />
                                  </button>
                                </div>
                              </div>

                              <h3 className="text-3xl md:text-4xl font-black text-white mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-orange-400 transition-all duration-500">
                                {project.name}
                              </h3>
                              
                              <p className="text-gray-400 text-sm md:text-md leading-relaxed mb-8 opacity-80 min-h-[60px]">
                                {project.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 mb-10">
                                {project.tags.map((tag, i) => (
                                  <span key={i} className="px-4 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-black text-gray-500 tracking-wider uppercase">
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <button 
                                onClick={() => handleSearch(project.name)}
                                className="w-full py-5 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all"
                              >
                                Explore Project <Github size={18} />
                              </button>
                              
                              {/* Decorative Glow */}
                              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-orange-500/20 transition-all" />
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                </section>


                {/* Main Discovery Container */}
                <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 min-w-0">

                    {/* Results Container */}
                    {result && (
                      <div
                        ref={resultsRef}
                        className="space-y-8 md:space-y-12 animate-fade-in-up scroll-mt-32 pb-20"
                      >
                        {/* Project Grid */}
                        <div>
                          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-white pl-1 border-l-4 border-orange-500">
                              Found Resources ({filteredProjects.length})
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="bg-gray-800/50 p-1 rounded-lg border border-gray-700 flex flex-wrap gap-1">
                                {(['All', 'GitHub', 'Hugging Face', 'Kaggle', 'LinkedIn'] as PlatformFilter[]).map((p) => (
                                  <button
                                    key={p}
                                    onClick={() => setFilterPlatform(p)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterPlatform === p
                                      ? 'bg-orange-600 text-white shadow-sm'
                                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                      }`}
                                  >
                                    {p}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {filteredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                              {filteredProjects.map((project, index) => (
                                <ProjectCard
                                  key={`${project.name}-${index}`}
                                  index={index}
                                  project={project}
                                  isFavorite={favorites.some(f => f.url === project.url)}
                                  onToggleFavorite={toggleFavorite}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                              <p>No projects match your current filters.</p>
                              <button
                                onClick={() => { setFilterPlatform('All'); }}
                                className="mt-2 text-blue-400 hover:underline text-sm"
                              >
                                Clear filters
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Overview & Insights - Deep Dive */}
                        {result.summary && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="mt-12 group overflow-hidden"
                          >
                            <div className="relative bg-[#0c1628]/40 backdrop-blur-3xl border border-orange-500/10 rounded-[2rem] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.3)] hover:border-orange-500/30 transition-all duration-700">
                              <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 group-hover:scale-110 transition-transform duration-500">
                                  <Bot className="w-6 h-6 text-orange-400" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
                                  TECHBOY AI <span className="text-orange-500">Summary</span>
                                </h2>
                              </div>
                              <p className="text-gray-300 leading-relaxed text-base md:text-xl font-medium mb-10">
                                {result.summary}
                              </p>

                              {/* Integrated Sources */}
                              {result.groundingSources.length > 0 && (
                                <div className="pt-8 border-t border-white/5">
                                  <h3 className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.3em] mb-6">
                                    Verified Reference Sources
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {result.groundingSources.map((source, idx) => (
                                      <a
                                        key={idx}
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-3 bg-white/[0.03] backdrop-blur-md rounded-xl hover:bg-white/[0.07] border border-white/5 hover:border-orange-500/30 transition-all duration-300 group/source"
                                      >
                                        <div className="p-1.5 bg-gray-900 rounded-lg text-orange-500 group-hover/source:text-orange-400 group-hover/source:scale-110 transition-all shrink-0">
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs text-gray-400 group-hover/source:text-gray-200 truncate font-bold tracking-wide">
                                          {source.title || new URL(source.uri).hostname}
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* Loading State - Skeleton Grid */}
                {searchState.isLoading && (
                  <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex flex-col items-center mb-12">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4 animate-pulse">
                        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                        <span className="text-orange-500 font-black uppercase tracking-[0.2em] text-xs">Accessing GitHub & AI Repositories</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  </div>
                )}

                {searchState.error && (
                  <div className="max-w-3xl mx-auto px-4 mb-12">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-center text-sm md:text-base">
                      {searchState.error}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentView === 'favorites' && (
              <div className="max-w-7xl mx-auto px-4 py-12 md:py-32 animate-fade-in relative z-10 pb-32 md:pb-0">
                <div className="text-center mb-16 space-y-4">
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                    Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Library</span>
                  </h1>
                  <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
                    Discover and manage all the projects you've saved for later.
                  </p>
                </div>

                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((project, index) => (
                      <ProjectCard
                        key={index}
                        project={project}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 animate-pulse">
                      <Heart className="w-10 h-10 text-gray-700" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Your collection is empty</h3>
                      <p className="text-gray-500 max-w-xs">Start exploring projects and heart the ones you love to see them here in your saved collection.</p>
                    </div>
                    <button
                      onClick={() => setCurrentView('search')}
                      className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5 uppercase tracking-widest text-[10px]"
                    >
                      {LABELS.discover}
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentView === 'trending' && (
              <div className="animate-fade-in pb-24 md:pb-0">
                <TrendingProjects 
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onToggleComparison={toggleComparison}
                  comparisonQueue={comparisonQueue}
                  onSummarize={(name) => handleSearch(`Summarize ${name}`)}
                />
              </div>
            )}


            {/* Coming Soon Notification */}
            {showComingSoon && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-liquid-drop">
                <div className="bg-[#0f172a] border border-orange-500/30 px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(249,115,22,0.3)] backdrop-blur-xl flex items-center gap-4">
                  <div className="bg-orange-500 p-2 rounded-full">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-black tracking-widest uppercase text-sm md:text-base">
                    Coming Soon
                  </span>
                </div>
              </div>
            )}

            <Footer onComingSoonClick={triggerComingSoon} labels={LABELS} />

            {/* Controlled autonomous TECHBOY AI Assistant */}
            <TechboyAssistant 
              projects={filteredProjects} 
              isOpen={isAIAssistantOpen} 
              setIsOpen={setIsAIAssistantOpen} 
            />

            {/* --- MOBILE BOTTOM NAVIGATION (Phase 4) --- */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-full px-6 flex justify-center pointer-events-none">
              <nav className="inline-flex p-1.5 bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 rounded-full items-center gap-8 px-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] pointer-events-auto">
                {[
                  { id: 'search', icon: Search },
                  { id: 'trending', icon: TrendingUp },
                  { id: 'favorites', icon: Heart }
                ].map((item) => {
                  const isActive = currentView === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentView(item.id as ViewType); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`relative p-3 rounded-full transition-all duration-300 ${
                        isActive 
                          ? `bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-110` 
                          : 'text-gray-400 hover:bg-white/5 opacity-70'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      {isActive && (
                        <motion.div 
                          layoutId="activeNav"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

          </main>

          {/* Comparison Studio Modal */}
          <ComparisonStudio 
            isOpen={isComparisonOpen}
            onClose={() => setIsComparisonOpen(false)}
            projects={comparisonQueue}
            onRemoveProject={(id) => setComparisonQueue(prev => prev.filter(p => p.id !== id))}
          />

          {/* Floating Comparison Bubble */}
          <AnimatePresence>
            {comparisonQueue.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-32 md:bottom-8 right-8 z-[2100]"
              >
                <button 
                  onClick={() => setIsComparisonOpen(true)}
                  className="px-8 py-5 rounded-full bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_rgba(37,99,235,0.4)] hover:shadow-blue-600/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 relative overflow-hidden group border border-white/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {comparisonQueue.map((p, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white text-blue-600 border-2 border-blue-600 flex items-center justify-center font-bold text-[10px] ring-2 ring-white/20 shadow-lg">
                           {p.name[0]}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm">Compare Systems ({comparisonQueue.length})</span>
                    <ArrowRight className="w-4 h-4 animate-bounce-x" />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div >
  );
};

export default App;