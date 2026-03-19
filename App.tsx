import React, { useState, useRef, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { ProjectCard } from './components/ProjectCard';
import Particles from './components/Particles';
import { searchProjects } from './services/apiService';
import { Project, SearchResult, SearchState } from './types';
import { Search, Sparkles, Heart, Chrome, Bot, X, Send, FileCode, Github, ExternalLink, Linkedin, User, Globe, MessageCircle, Flame, Loader2, Rocket } from 'lucide-react';
import { Footer } from './components/Footer';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { SkeletonCard } from './components/SkeletonCard';
import { TechboyAssistant } from './components/TechboyAssistant';
import { AuthButton } from './components/AuthButton';
import { ReadmeDiscovery } from './components/ReadmeDiscovery';


import { auth, db } from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';




type ViewType = 'search' | 'favorites' | 'readme';
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


  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);



  // Auth & Cloud Sync
  useEffect(() => {
    if (!auth || !db) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeSnap = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const cloudFavs = docSnap.data().favorites || [];
            if (cloudFavs.length > 0) setFavorites(cloudFavs);
          }
        });
        return () => unsubscribeSnap();
      }
    });

    return () => unsubscribeAuth();
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
    return matchesPlatform;
  }) || [];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
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

          {/* Unified Header for Desktop & Mobile (All perfectly sized for one line) */}
          <header className="fixed top-0 inset-x-0 z-[70] p-2 md:p-6 flex flex-nowrap items-center justify-between gap-1.5 md:gap-6 pointer-events-none animate-fade-in">
            {/* Left: Logo */}
            <div className="flex-shrink-0 pointer-events-auto">
              <div
                onClick={() => {
                  setCurrentView('search');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-9 md:h-14 px-3 md:px-8 rounded-full border border-white/10 bg-[#0f172a]/60 backdrop-blur-2xl flex items-center justify-center cursor-pointer shadow-2xl transition-all hover:scale-105 gap-2 md:gap-3 group/logo"
              >
                <div className="bg-gradient-to-br from-red-500 to-orange-500 p-1 md:p-1.5 rounded-lg md:rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover/logo:rotate-[15deg] transition-all duration-500">
                  <Search className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 text-transparent bg-clip-text font-black tracking-[0.2em] text-sm md:text-xl uppercase hidden sm:block">
                  Project Finder
                </span>
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 text-transparent bg-clip-text font-black tracking-[0.2em] text-[10px] uppercase sm:hidden">
                  PF
                </span>
              </div>
            </div>

            {/* Middle: Navigation Pill */}
            <div className="flex-shrink-0 flex justify-center pointer-events-auto">
              <nav className="p-0.5 md:p-1.5 bg-[#0f172a]/80 backdrop-blur-3xl rounded-full shadow-2xl border border-white/10 flex items-center gap-0.5 md:gap-1.5 pointer-events-auto">
                <button
                  onClick={() => {
                    setCurrentView('search');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 sm:px-4 md:px-7 py-1.5 md:py-2 rounded-full border transition-all duration-300 flex items-center gap-1 md:gap-2 whitespace-nowrap font-black text-[8.5px] sm:text-[10px] md:text-xs flex-shrink-0 ${currentView === 'search'
                    ? 'bg-[#f97316] text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.6)]'
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                    }`}
                >
                  <Sparkles className={`w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 transition-transform ${currentView === 'search' ? 'scale-110' : ''}`} />
                  <span className="tracking-wide">Discover</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('readme');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 sm:px-4 md:px-7 py-1.5 md:py-2 rounded-full border transition-all duration-300 flex items-center gap-1 md:gap-2 whitespace-nowrap font-black text-[8.5px] sm:text-[10px] md:text-xs flex-shrink-0 ${currentView === 'readme'
                    ? 'bg-[#f97316] text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.6)]'
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                    }`}
                >
                  <FileCode className={`w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 transition-transform ${currentView === 'readme' ? 'scale-110' : ''}`} />
                  <span className="tracking-wide">READMEs</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('favorites');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2.5 sm:px-4 md:px-7 py-1.5 md:py-2 rounded-full border transition-all duration-300 flex items-center gap-1 md:gap-2 whitespace-nowrap font-black text-[8.5px] sm:text-[10px] md:text-xs flex-shrink-0 ${currentView === 'favorites'
                    ? 'bg-[#f97316] text-white border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.6)]'
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                    }`}
                >
                  <Heart className={`w-3 h-3 md:w-3.5 md:h-3.5 shrink-0 transition-transform ${currentView === 'favorites' ? 'scale-110' : ''}`} />
                  <span className="tracking-wide">Favs ({favorites.length})</span>
                </button>

              </nav>
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
              <AuthButton />
            </div>
          </header>



          <main className="relative z-10">
            {currentView === 'readme' && (
              <ReadmeDiscovery 
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
              />
            )}


            {currentView === 'search' && (

              /* SEARCH VIEW */
              <div className={`animate-fade-in home-content-wrapper ${!searchState.hasSearched ? 'min-h-screen flex flex-col justify-center' : 'pt-28 pb-20 md:pt-40'}`}>
                {/* Hero Section */}
                <section className={`transition-all duration-1000 ease-in-out px-4 relative overflow-hidden home-section ${searchState.hasSearched ? 'py-4 md:py-8' : 'pt-24 md:pt-32 pb-16 md:pb-20'}`}>
                  <div className="text-center mb-8 md:mb-16 space-y-4 md:space-y-8 relative z-10 max-w-6xl mx-auto">
                    <h1 className="flex flex-col items-center font-black tracking-tighter mb-4 md:mb-8 leading-tight animate-liquid-drop home-title gap-1 md:gap-2">
                      <span className="text-white text-[2.2rem] sm:text-5xl md:text-6xl lg:text-[5rem] drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] animate-liquid-text" data-text="Explore">Explore</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-white to-red-300 bg-300% animate-gradient drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] text-[1.1rem] sm:text-xl md:text-2xl lg:text-[2rem] font-bold tracking-widest uppercase home-subtitle-top">
                        The World of
                      </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-white to-red-300 bg-300% animate-gradient drop-shadow-[0_0_15px_rgba(249,115,22,0.3)] text-[2.2rem] sm:text-5xl md:text-6xl lg:text-[5rem] home-subtitle-bottom">
                        Projects
                      </span>
                    </h1>
                    <p className="text-gray-400 text-[10px] md:text-base max-w-xl mx-auto px-6 leading-relaxed font-medium opacity-60">
                      The ultimate research engine for <span className="text-white">GitHub</span>, <span className="text-hf-yellow">Hugging Face</span>, <span className="text-orange-400">Kaggle</span>, and <span className="text-blue-400">LinkedIn</span>.
                    </p>
                  </div>

                  <SearchBar onSearch={handleSearch} isLoading={searchState.isLoading} />
                </section>

                {/* Trending Section - Show only if not searched */}
                {!searchState.hasSearched && (
                  <motion.section 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <Flame className="w-5 h-5 text-orange-500" />
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">Trending Now</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {TRENDING_PROJECTS.map((project, index) => (
                        <ProjectCard
                          key={index}
                          index={index}
                          project={project}
                          isFavorite={favorites.some(f => f.url === project.url)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  </motion.section>
                )}

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

                {result && (
                  <div
                    ref={resultsRef}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12 animate-fade-in-up scroll-mt-32"
                  >

                    {/* Project Grid - FIRST */}
                    <div>
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-white pl-1 border-l-4 border-orange-500">
                          Found Resources ({filteredProjects.length})
                        </h2>

                        {/* Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          {/* Platform Filter */}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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




                    {/* Overview & Insights - LAST */}
                    {result.summary && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-50 transition-opacity group-hover:opacity-100" />
                        <div className="relative bg-gray-800/20 backdrop-blur-lg border border-orange-500/20 rounded-[2rem] p-8 md:p-12 shadow-[0_0_40px_rgba(249,115,22,0.1)] hover:shadow-[0_0_50px_rgba(249,115,22,0.15)] transition-all">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                              <Bot className="w-6 h-6 text-orange-400" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                              TECHBOY AI <span className="text-orange-500">Summary</span>
                            </h2>
                          </div>
                          <p className="text-gray-300 leading-relaxed text-base md:text-xl font-medium mb-10">
                            {result.summary}
                          </p>

                          {/* Integrated Sources */}
                          {result.groundingSources.length > 0 && (
                            <div className="pt-8 border-t border-orange-500/10">
                              <h3 className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.3em] mb-6">
                                Verified Reference Sources
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {result.groundingSources.map((source, idx) => (
                                  <a
                                    key={idx}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-md rounded-xl hover:bg-white/10 border border-white/5 hover:border-orange-500/30 transition-all group/source"
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
                      <p className="text-gray-500 max-w-xs">Start exploring projects and heart the ones you love to see them here.</p>
                    </div>
                    <button
                      onClick={() => setCurrentView('search')}
                      className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                    >
                      Discover Projects
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

        </>
      )}
    </div >
  );
};

export default App;