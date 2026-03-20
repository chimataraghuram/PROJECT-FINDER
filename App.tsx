import React, { useState, useRef, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { ProjectCard } from './components/ProjectCard';
import Particles from './components/Particles';
import { searchProjects } from './services/apiService';
import { Project, SearchResult, SearchState } from './types';
import { Search, Sparkles, Heart, Chrome, Bot, X, Send, FileCode, Github, ExternalLink, Linkedin, User, Globe, MessageCircle, Flame, Loader2, Rocket, ArrowRight } from 'lucide-react';
import { Footer } from './components/Footer';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { SkeletonCard } from './components/SkeletonCard';
import { TechboyAssistant } from './components/TechboyAssistant';
import { AuthButton } from './components/AuthButton';
import { ReadmeDiscovery } from './components/ReadmeDiscovery';
import { UserDashboard } from './components/UserDashboard';
import { CollectionManager } from './components/CollectionManager';
import { ComparisonStudio } from './components/ComparisonStudio';



import { auth, db, isFirebaseConfigured } from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';




type ViewType = 'search' | 'favorites' | 'readme' | 'dashboard';
type PlatformFilter = 'All' | 'GitHub' | 'Hugging Face' | 'Kaggle' | 'LinkedIn';

const TRENDING_PROJECTS: Project[] = [
  {
    id: 'trending-1',
    name: "OpenClaw",
    description: "The leading open-source personal AI assistant. Autonomous agents that connect to WhatsApp, Slack, and Discord to solve complex tasks directly via chat.",
    platform: 'GitHub',
    url: "https://github.com/openclaw/openclaw",
    tags: ["AI Agent", "Autonomous", "Python"],
    stars: "210k"
  },
  {
    id: 'trending-2',
    name: "NanoClaw",
    description: "A security-first, lightweight alternative to OpenClaw. Runs AI actions in isolated containers (Docker) for maximum safety and data privacy.",
    platform: 'GitHub',
    url: "https://github.com/nanoclaw/nanoclaw",
    tags: ["Secure AI", "Sandboxed", "TypeScript"],
    stars: "85k"
  },
  {
    id: 'trending-3',
    name: "PicoClaw",
    description: "Ultra-portable AI agent built in Go. Designed to run on resource-constrained edge hardware like Raspberry Pi Zero with sub-10MB RAM usage.",
    platform: 'GitHub',
    url: "https://github.com/picoclaw/picoclaw",
    tags: ["Edge AI", "Low-Resource", "Go"],
    stars: "42k"
  }
];

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
    ...TRENDING_PROJECTS[0],
    id: 'def-2',
    type: 'project'
  },
  {
    ...TRENDING_PROJECTS[1],
    id: 'def-3',
    type: 'project'
  },
  {
    ...TRENDING_PROJECTS[2],
    id: 'def-4',
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
    // Initial check for Mock User
    const savedMock = localStorage.getItem('project-finder-mock-user');
    return savedMock ? JSON.parse(savedMock) : (auth?.currentUser || null);
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
    // 1. Real Firebase Listener
    let unsubscribeAuth: any;
    if (auth && isFirebaseConfigured) {
      unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (user && db) {
          // Sync from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const unsubscribeSnap = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const cloudFavs = data.favorites || [];
              if (cloudFavs.length > 0) setFavorites(cloudFavs);
            }
          });
          return () => unsubscribeSnap();
        }
      });
    }

    // 2. Mock Auth Listener (Polyfill for local storage changes)
    const handleStorageChange = () => {
      const savedMock = localStorage.getItem('project-finder-mock-user');
      if (savedMock) setCurrentUser(JSON.parse(savedMock));
      else if (!isFirebaseConfigured) setCurrentUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    // Poll for changes if in same tab (simple for mock)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Sync to Cloud (and Local fallback)
  useEffect(() => {
    localStorage.setItem('project-finder-favorites', JSON.stringify(favorites));
    
    if (currentUser && db) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      setDoc(userDocRef, { favorites }, { merge: true }).catch(err => {
        console.error("Cloud sync failed:", err);
      });
    }
  }, [favorites, currentUser]);




  const toggleFavorite = (project: Project) => {
    setFavorites(prev => {
      const isFav = prev.some(p => p.url === project.url);
      if (isFav) {
        return prev.filter(p => p.url !== project.url);
      }
      return [...prev, { ...project, type: project.type || 'project' }];
    });
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
    setSearchState({ isLoading: true, error: null, hasSearched: true });
    setResult(null);
    // Reset filters on new search
    setFilterPlatform('All');

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

  // Derive Filtered Data
  const filteredProjects = result?.projects.filter(project => {
    const matchesPlatform = filterPlatform === 'All' || project.platform === filterPlatform;
    const matchesCategory = selectedCategory === 'All' || 
      project.tags.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      project.description.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesPlatform && matchesCategory;
  }) || [];

  // Dynamic Label Logic
  const [isCompact, setIsCompact] = useState(false);
  
  const LABELS = {
    discover: isCompact ? "Discover" : "Discover Projects",
    profiles: isCompact ? "Profiles" : "GitHub README Profiles",
    saved: "Saved" // Stays "Saved" as per request
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden transition-colors duration-500 ${isCompact ? 'pt-4' : ''}`}>
      {showIntro ? (
        <IntroVideo onComplete={() => setShowIntro(false)} />
      ) : (
        <>
          <Particles />
          
          {/* Animated AI Blueprint Background */}
          <div className="parallax-bg-container">
            <motion.div 
              style={{ y: smoothY }}
              className="parallax-bg-image animate-drift"
              animate={{
                opacity: [0.12, 0.16, 0.12],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileTap={{ scale: 0.98, opacity: 0.25, transition: { duration: 0.2 } }}
            />
            <div className="parallax-bg-overlay" />
          </div>

          {/* Unified Header for Desktop & Mobile */}
          <header className={`z-[70] transition-all duration-500 flex flex-nowrap items-center justify-between pointer-events-none animate-fade-in ${
            isCompact ? 'p-2 md:p-3 scale-95 origin-top' : 'p-2 md:p-4'
          } ${/* Navbar should be fixed on mobile, desktop is handled by the overall header fixed class if any */ ''} 
            fixed top-0 inset-x-0 md:bg-transparent
          `}>
            {/* Left: Logo (Desktop Only inside Header) */}
            <div className="flex-shrink-0 pointer-events-auto hidden md:block">
              <div
                onClick={() => {
                  setCurrentView('search');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`transition-all duration-500 rounded-full border border-white/10 bg-[#0f172a]/60 backdrop-blur-2xl flex items-center justify-center cursor-pointer shadow-2xl hover:scale-105 gap-2 md:gap-3 group/logo ${
                  isCompact ? 'h-8 md:h-10 px-3 md:px-5' : 'h-8 md:h-12 px-3 md:px-6'
                }`}
              >
                <div className={`bg-gradient-to-br from-red-500 to-orange-500 rounded-lg md:rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover/logo:rotate-[15deg] transition-all duration-500 ${
                  isCompact ? 'p-0.5 md:p-1' : 'p-1 md:p-1'
                }`}>
                  <Search className={`${isCompact ? 'w-3 h-3 md:w-4 md:h-4' : 'w-3.5 h-3.5 md:w-5 md:h-5'} text-white`} />
                </div>
                <h1 className={`font-black text-white uppercase tracking-[0.2em] font-display transition-all duration-500 ${
                  isCompact ? 'text-[9px] md:text-sm' : 'text-xs md:text-xl'
                }`}>
                  {isCompact ? 'PF' : 'Project Finder'}
                </h1>
              </div>
            </div>

            {/* Middle: Navigation Pill (The Navbar - Fixed on Mobile) */}
            <div className="flex-shrink-0 flex justify-center pointer-events-auto md:relative fixed top-0 inset-x-0 z-[2000] py-4 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 md:bg-transparent md:backdrop-blur-0 md:border-none md:py-0">
              <motion.nav 
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`p-0.5 md:p-1 bg-[#0f172a]/80 backdrop-blur-3xl rounded-full shadow-2xl border border-white/10 flex items-center gap-0.5 md:gap-1.5 transition-all duration-500 ${
                isCompact ? 'scale-90 px-1' : ''
              }`}>
                <motion.button
                  layout
                  onClick={() => {
                    setCurrentView('search');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 sm:px-4 md:px-5 py-1.5 rounded-full border transition-all duration-500 flex items-center gap-1.5 md:gap-2 whitespace-nowrap font-black text-[8px] md:text-[10px] tracking-widest uppercase relative overflow-hidden ${currentView === 'search'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                    }`}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={LABELS.discover}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="inline-block"
                    >
                      {LABELS.discover}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  layout
                  onClick={() => {
                    setCurrentView('readme');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 sm:px-4 md:px-5 py-1.5 rounded-full border transition-all duration-500 flex items-center gap-1.5 md:gap-2 whitespace-nowrap font-black text-[8px] md:text-[10px] tracking-widest uppercase relative overflow-hidden ${currentView === 'readme'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                    }`}
                >
                  <FileCode className="w-3 h-3" />
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={LABELS.profiles}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="inline-block"
                    >
                      {LABELS.profiles}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  layout
                  onClick={() => {
                    setCurrentView('favorites');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 sm:px-4 md:px-5 py-1.5 rounded-full border transition-all duration-500 flex items-center gap-1.5 md:gap-2 whitespace-nowrap font-black text-[8px] md:text-[10px] tracking-widest uppercase relative overflow-hidden ${currentView === 'favorites'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                    }`}
                >
                  <Heart className="w-3 h-3" />
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={LABELS.saved}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="inline-block"
                    >
                      {LABELS.saved} ({favorites.length})
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </motion.nav>
            </div>

            {/* In-Between: TECHBOY AI Pill */}
            <div className="flex-shrink-0 hidden lg:block pointer-events-auto">
              <motion.button
                onClick={() => setIsAIAssistantOpen(true)}
                className="h-10 md:h-12 px-4 md:px-6 rounded-full border border-orange-500/30 bg-orange-500/5 backdrop-blur-3xl flex items-center gap-2 md:gap-3 group/aipill shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] hover:border-orange-500/60 transition-all duration-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-[9px] md:text-[11px] font-black tracking-[0.2em] uppercase text-[#f97316]">Techboy AI</span>
                <div className="w-5 h-5 md:w-7 md:h-7 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover/aipill:border-orange-500/50 transition-colors">
                  <Bot className="w-3 h-3 md:w-4 md:h-4 text-[#f97316]" />
                </div>
              </motion.button>
            </div>

            {/* Right: Auth */}
            <div className="flex-shrink-0 pointer-events-auto">
              <AuthButton onViewDashboard={() => setCurrentView('dashboard')} />
            </div>
          </header>



          <main className="relative z-10 pt-[80px] md:pt-0">
            {/* Global Mobile Sticky Logo Pill */}
            <div className="md:hidden sticky top-[60px] z-[1500] px-4 py-4 backdrop-blur-md">
              <div className="flex justify-center">
                <div
                  onClick={() => {
                    setCurrentView('search');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="h-10 px-5 rounded-full border border-white/10 bg-[#0f172a]/80 backdrop-blur-2xl flex items-center justify-center cursor-pointer shadow-2xl gap-3 hover:scale-105 transition-transform"
                >
                  <div className="bg-gradient-to-br from-red-500 to-orange-500 p-1 rounded-lg">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="font-black text-white uppercase tracking-[0.2em] font-display text-sm">
                    Project Finder
                  </h1>
                </div>
              </div>
            </div>
            {currentView === 'readme' && (
              <ReadmeDiscovery 
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
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
              <div className={`animate-fade-in home-content-wrapper ${!searchState.hasSearched ? 'min-h-screen flex flex-col justify-center' : 'pt-28 pb-20 md:pt-40'}`}>
                {/* Hero Section */}
                {/* Hero Section */}
                <section className={`transition-all duration-1000 ease-in-out px-4 relative overflow-hidden home-section ${searchState.hasSearched ? 'py-4 md:py-8' : 'pt-24 md:pt-32 pb-16 md:pb-20'}`}>
                  <div className="text-center mb-8 md:mb-16 space-y-4 md:space-y-8 relative z-10 max-w-6xl mx-auto">
                    <h1 className="flex flex-col items-center font-black tracking-tighter mb-4 md:mb-8 leading-tight animate-liquid-drop home-title gap-1 md:gap-2">
                      <span className="text-white text-[2.2rem] sm:text-5xl md:text-6xl lg:text-[5rem] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] animate-liquid-text" data-text="Explore">
                        Explore
                      </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-white to-red-300 bg-300% animate-gradient drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] text-[1.1rem] sm:text-xl md:text-2xl lg:text-[2rem] font-bold tracking-widest uppercase home-subtitle-top">
                        The World of
                      </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-white to-red-300 bg-300% animate-gradient drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] text-[2.2rem] sm:text-5xl md:text-6xl lg:text-[5rem] home-subtitle-bottom">
                        {LABELS.discover}
                      </span>
                    </h1>
                    <p className="text-gray-400 text-[10px] md:text-base max-w-xl mx-auto px-6 leading-relaxed font-medium opacity-60">
                      The ultimate research engine for <span className="text-white">GitHub</span>, <span className="text-hf-yellow">Hugging Face</span>, <span className="text-orange-400">Kaggle</span>, and <span className="text-blue-400">LinkedIn</span>.
                    </p>
                  </div>

                  <SearchBar 
                    onSearch={handleSearch} 
                    isLoading={searchState.isLoading}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    onSurpriseMe={handleSurpriseMe}
                  />
                </section>

                {/* Main Discovery Container */}
                <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 min-w-0">
                    {/* Trending Section - Show only if not searched */}
                    {!searchState.hasSearched && (
                      <motion.section 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="py-12"
                      >
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Flame className="w-5 h-5 text-orange-500" />
                          </div>
                          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">Trending Now</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {TRENDING_PROJECTS.map((project, index) => (
                            <ProjectCard
                              key={index}
                              index={index}
                              project={project}
                              isFavorite={favorites.some((f) => f.id === project.id)}
                              onToggleFavorite={toggleFavorite}
                              onToggleCompare={toggleComparison}
                              isComparing={comparisonQueue.some(p => p.id === project.id)}
                            />
                          ))}
                        </div>
                      </motion.section>
                    )}

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

                {/* Loading State */}
                {searchState.isLoading && (
                  <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Searching the cosmos...</p>
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
              <div className="max-w-7xl mx-auto px-4 py-12 md:py-32 animate-fade-in relative z-10">
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

            <Footer onComingSoonClick={triggerComingSoon} />

            {/* Controlled autonomous TECHBOY AI Assistant */}
            <TechboyAssistant 
              projects={filteredProjects} 
              isOpen={isAIAssistantOpen} 
              setIsOpen={setIsAIAssistantOpen} 
            />

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
                className="fixed bottom-8 right-8 z-[2100]"
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