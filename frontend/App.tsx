import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SearchBar } from './components/SearchBar';
import { ProjectCard } from './components/ProjectCard';
import Particles from './components/Particles';
import { Project, SearchResult, SearchState } from './types';
import { Search, Sparkles, Heart, Chrome, Bot, X, Send, FileCode, Github, ExternalLink, Linkedin, User, Globe, MessageCircle, Flame, Loader2, Rocket, ArrowRight, Layout, Shield, Brain, Share2, BarChart3, Star, TrendingUp, Play, Info, ChevronRight , Folder , ListFilter, Code, Clock, Check, ChevronDown, Settings, Trash2, MoreHorizontal } from 'lucide-react';
import { Footer } from './components/Footer';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { SkeletonCard } from './components/SkeletonCard';
import { TechboyAssistant } from './components/TechboyAssistant';
import { AuthButton } from './components/AuthButton';
import { TrendingProjects } from './components/TrendingProjects';
import { UserDashboard } from './components/UserDashboard';
import { saveProject, fetchFavorites, fetchTrending, fetchSearch, fetchCollections, createCollection, updateCollection, deleteCollection, removeProjectFromCollection, recordSearchHistory, recordFirebaseSearchHistory } from './services/apiService';
import { ComparisonStudio } from './components/ComparisonStudio';
import { openSafe } from './src/utils/urlHelper';
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
    liveUrl: "https://chimataraghuram.github.io/PROJECT-FINDER/",
    tags: ["React", "Vite", "Tailwind", "Firebase"],
    stars: "1.2k",
    isPublisher: true,
    type: 'project'
  },
  {
    id: 'def-openclaw',
    name: "OpenClaw",
    description: "The leading open-source personal TECHBOY AI Assistant. Autonomous agents that connect to WhatsApp, Slack, and Discord.",
    platform: 'GitHub',
    url: "https://github.com/OpenClaw/OpenClaw",
    tags: ["AI AGENT", "AUTONOMOUS", "PYTHON"],
    stars: "12.5k",
    type: 'project'
  },
  {
    id: 'def-nanoclaw',
    name: "NanoClaw",
    description: "A security-first, lightweight alternative to OpenClaw. Runs AI actions in isolated containers for maximum safety.",
    platform: 'GitHub',
    url: "https://github.com/NanoClaw/NanoClaw",
    tags: ["SECURE AI", "SANDBOXED", "TYPESCRIPT"],
    stars: "8.2k",
    type: 'project'
  },
  {
    id: 'def-picoclaw',
    name: "PicoClaw",
    description: "Ultra-fast, edge-optimized AI assistant for mobile devices. Highly efficient and runs completely on-device.",
    platform: 'GitHub',
    url: "https://github.com/PicoClaw/PicoClaw",
    tags: ["MOBILE AI", "EDGE", "SWIFT"],
    stars: "4.1k",
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
  }
];

import { IntroVideo } from './components/IntroVideo';

const App: React.FC = () => {
  const [toast, setToast] = useState<{message: string, icon?: React.ReactNode, visible: boolean}>({ message: '', visible: false });
  const showToast = (message: string, icon?: React.ReactNode) => { setToast({ message, icon, visible: true }); setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000); };
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
  const [recentSearches, setRecentSearches] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('project-finder-recent-searches') || '[]'); } catch { return []; }
  });

  // Filtering State
  const [filterPlatform, setFilterPlatform] = useState<PlatformFilter>('All');
  const [resultSort, setResultSort] = useState<'relevance' | 'stars' | 'name'>('relevance');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [minStars, setMinStars] = useState('0');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');

  const [favorites, setFavorites] = useState<Project[]>(() => {
    const saved = localStorage.getItem('project-finder-favorites');
    let current = saved ? JSON.parse(saved) : DEFAULT_FAVORITES;
    
    // Merge defaults to ensure requested projects are always available initially
    const merged = [...current];
    DEFAULT_FAVORITES.forEach(def => {
      const existingIdx = merged.findIndex(f => f.url === def.url);
      if (existingIdx === -1) {
        merged.push(def);
      } else if (def.liveUrl && !merged[existingIdx].liveUrl) {
        // REPAIR: Enrich existing saved project with liveUrl from defaults
        merged[existingIdx] = { ...merged[existingIdx], liveUrl: def.liveUrl };
      }
    });
    return merged;
  });
  const [collections, setCollections] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('project-finder-local-collections') || '[]'); } catch { return []; } });
  const [openCollection, setOpenCollection] = useState<any | null>(null);
  const [collectionError, setCollectionError] = useState('');
  const [collectionMenu, setCollectionMenu] = useState<string | null>(null);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleSearch = useCallback(async (query: string, category: string = selectedCategory, platform: string = filterPlatform) => {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      setResult(null);
      setSearchState({ isLoading: false, error: null, hasSearched: false });
      localStorage.removeItem('last-search-query');
      return;
    }

    setSearchState({ isLoading: true, error: null, hasSearched: true });
    setResult(null);
    localStorage.setItem('last-search-query', trimmedQuery);

    try {
      const data = await fetchSearch(trimmedQuery, category, platform);
      const historyItem = { query: trimmedQuery, platform, resultCount: data.projects?.length || 0, createdAt: new Date().toISOString() };
      setRecentSearches(previous => {
        const next = [historyItem, ...previous.filter(item => item.query !== trimmedQuery)].slice(0, 50);
        localStorage.setItem('project-finder-recent-searches', JSON.stringify(next));
        return next;
      });
      const token = localStorage.getItem('project-finder-token');
      if (token) recordSearchHistory(token, trimmedQuery, platform, data.projects?.length || 0).catch(() => {});
      const storedUser = localStorage.getItem('project-finder-user');
      const firebaseUid = storedUser ? JSON.parse(storedUser).uid : null;
      if (firebaseUid) recordFirebaseSearchHistory(firebaseUid, trimmedQuery, platform, data.projects?.length || 0).catch(() => {});
      setResult(data);
      setSearchState({ isLoading: false, error: null, hasSearched: true });
    } catch (err: any) {
      setSearchState({ 
        isLoading: false, 
        error: err.message || 'The gateway to this platform is temporarily congested. Please try again.',
        hasSearched: true 
      });
    }
  }, [selectedCategory, filterPlatform]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    // Trigger search with new category if we have an active search query
    const lastQuery = localStorage.getItem('last-search-query');
    if (lastQuery) {
      handleSearch(lastQuery, category);
    }
  }, [handleSearch]);

  const handleSurpriseMe = useCallback(() => {
    const pools = ['AI', 'React', 'Python', 'Agent', 'Automation', 'CLI', 'Web3', 'Tailwind', 'Next.js'];
    const randomQuery = pools[Math.floor(Math.random() * pools.length)];
    handleSearch(randomQuery);
  }, [handleSearch]);

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('project-finder-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [restoredResearchSession, setRestoredResearchSession] = useState<any>(null);
  const [lastViewedProject, setLastViewedProject] = useState<Project | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const [comparisonQueue, setComparisonQueue] = useState<Project[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const [homeTrending, setHomeTrending] = useState<Project[]>([]);
  useEffect(() => {
    const loadHomeTrending = () => fetchTrending('GitHub', 'All').then(data => {
      if (data && data.length > 0) setHomeTrending(data.slice(0, 3));
    }).catch(() => {});
    loadHomeTrending();
    const interval = window.setInterval(loadHomeTrending, 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('project-finder-token');
    if (token && currentUser) fetchCollections(token).then(setCollections).catch(() => {});
  }, [currentUser]);

  const handleCreateCollection = async () => {
    const token = localStorage.getItem('project-finder-token');
    const name = newCollectionName.trim();
    if (!name) return;
    try {
      if (!token) throw new Error('Please sign in with Google before creating a collection.');
      const collection = await createCollection(token, name); setCollections(current => [collection, ...current]);
    } catch (error: any) {
      const localCollection = { id: `local-${Date.now()}`, name, projects: [], localOnly: true };
      setCollections(current => { const next = [localCollection, ...current]; localStorage.setItem('project-finder-local-collections', JSON.stringify(next)); return next; });
      setCollectionError(`${error?.message || 'Cloud sync unavailable'} Saved locally on this device.`);
    }
    setNewCollectionName(''); setShowCreateCollection(false);
  };
  const handleRenameCollection = async (collection: any) => { const token = localStorage.getItem('project-finder-token'); const name = window.prompt('Rename collection', collection.name)?.trim(); if (!token || !name || name === collection.name) return; try { const updated = await updateCollection(token, collection._id || collection.id, name); setCollections(current => current.map(item => item._id === collection._id ? updated : item)); setOpenCollection(updated); } catch {} };
  const handleDeleteCollection = async (collection: any) => { const token = localStorage.getItem('project-finder-token'); if (!window.confirm(`Delete ${collection.name}?`)) return; try { if (!collection.localOnly) { if (!token) throw new Error('Sign in required'); await deleteCollection(token, collection._id || collection.id); } setCollections(current => { const next = current.filter(item => (item._id || item.id) !== (collection._id || collection.id)); localStorage.setItem('project-finder-local-collections', JSON.stringify(next.filter(item => item.localOnly))); return next; }); setOpenCollection(null); } catch {} };
  const handleRemoveCollectionProject = async (collection: any, project: any) => { const token = localStorage.getItem('project-finder-token'); if (!token) return; try { const updated = await removeProjectFromCollection(token, collection._id || collection.id, project._id || project.id); setCollections(current => current.map(item => item._id === collection._id ? updated : item)); setOpenCollection(updated); } catch {} };

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
        if (favs && favs.length > 0) {
          setFavorites(prev => {
            const merged = [...favs];
            DEFAULT_FAVORITES.forEach(def => {
              if (!merged.some(f => f.url === def.url)) {
                merged.push(def);
              }
            });
            return merged;
          });
        }
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



  const filteredProjects = useMemo(() => {
    if (!result?.projects) return [];
    const cutoff = dateFilter === 'all' ? 0 : Date.now() - ({ week: 7, month: 30, year: 365 }[dateFilter] * 86400000);
    const filtered = (filterPlatform === 'All' ? [...result.projects] : result.projects.filter(p => p.platform === filterPlatform))
      .filter(project => languageFilter === 'All' || project.language === languageFilter)
      .filter(project => (project.stars || 0) >= Number(minStars))
      .filter(project => !cutoff || ![project.updatedAt, project.pushed_at, project.createdAt].find(Boolean) || new Date(project.updatedAt || project.pushed_at || project.createdAt || 0).getTime() >= cutoff);
    if (resultSort === 'stars') return filtered.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    if (resultSort === 'name') return filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [result, filterPlatform, resultSort, languageFilter, minStars, dateFilter]);

  const availableLanguages = useMemo(() => ['All', ...Array.from(new Set((result?.projects || []).map(project => project.language).filter(Boolean))).sort()], [result]);

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
          {/* DESKTOP HEADER */}
          <div className="hidden md:flex fixed top-4 inset-x-0 px-4 xl:px-6 z-[2000] justify-between items-start pointer-events-none w-full max-w-[1920px] mx-auto gap-4">
            {/* 1. Left Island: Logo & Brand */}
            <div className="pointer-events-auto shrink-0 flex items-center">
              <motion.div
                layout
                initial={{ opacity: 0, y: -20 }}
                style={{ borderRadius: "99px" }}
                animate={{
                  opacity: 1,
                  y: 0,
                  boxShadow: isCompact ? "0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(249,115,22,0.3)" : "0 10px 30px rgba(0,0,0,0.3)"
                }}
                transition={{ duration: 0.85, type: "spring", bounce: 0.15 }}
                className={`flex items-center gap-2 md:gap-4 bg-[#0f172a]/${isCompact ? '90' : '40'} ${isCompact ? 'backdrop-blur-[40px]' : 'backdrop-blur-2xl'} border border-white/10 rounded-full cursor-pointer group/logo transition-colors duration-300 pr-5 md:pr-6 pl-2 py-1.5`}
                onClick={() => { setCurrentView('search'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <motion.div className="relative shrink-0"
                  animate={{ scale: isCompact ? 1.2 : 1 }}
                  transition={{ duration: 0.7, type: "spring", bounce: 0.25 }}
                >
                  <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover/logo:opacity-40 transition-opacity" />
                  <img src={mascotLogo} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white/20 shadow-2xl relative z-10 transition-all duration-300" alt="Mascot Logo" />
                </motion.div>

                <motion.div className="flex items-center gap-3 md:gap-4 origin-left">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 group-hover/logo:opacity-40 transition-opacity" />
                    <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center relative z-10 shadow-xl group-hover/logo:border-orange-500/60 group-hover/logo:bg-orange-500/20 transition-all">
                      <Search className="w-4 h-4 text-orange-500 transition-transform group-hover/logo:scale-110" strokeWidth={2.5} />
                    </div>
                  </div>
                  <span className="hidden lg:inline-block text-base md:text-lg font-black text-white tracking-tighter uppercase leading-none whitespace-nowrap origin-left">
                      Project Finder
                    </span>
                </motion.div>
              </motion.div>
            </div>

            {/* 2. Middle Island: Adaptive Navigation Pill */}
            <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 shrink-1 min-w-0 flex justify-center overflow-x-auto no-scrollbar">
              <motion.nav
                animate={{
                  scale: isCompact ? 0.95 : 1,
                  opacity: 1,
                  boxShadow: isCompact ? "0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(249,115,22,0.3)" : "0 10px 30px rgba(0,0,0,0.3)"
                }}
                transition={{ duration: 0.85, type: "spring", bounce: 0.15 }}
                className={`p-1.5 md:p-2 bg-[#0f172a]/${isCompact ? '90' : '40'} ${isCompact ? 'backdrop-blur-[40px]' : 'backdrop-blur-2xl'} border border-white/10 rounded-full flex items-center gap-2 md:gap-3 transition-all duration-500 ease-out shrink-0`}
              >
                {NAV_ITEMS.map((item) => {
                  const isActive = currentView === item.id;
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setCurrentView(item.id as ViewType); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`h-10 md:h-12 rounded-full flex items-center justify-center gap-2 lg:gap-3 transition-all duration-500 ease-out font-bold text-[11px] md:text-xs tracking-widest uppercase relative overflow-hidden group/nav ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-[0_0_25px_rgba(249,115,22,0.4)]`
                          : 'text-gray-400 bg-transparent hover:text-white hover:bg-white/5'
                      } ${isCompact ? 'px-3 md:px-4' : 'px-4 md:px-6'}`}
                    >
                      <motion.div className="relative z-10 flex items-center justify-center shrink-0">
                        <Icon className={`${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-70'} w-4 h-4 md:w-5 md:h-5 transition-transform duration-300`} />
                      </motion.div>
                      
                      <AnimatePresence initial={false}>
                        {!isCompact && (
                          <motion.span
                            key="text"
                            initial={{ width: 0, opacity: 0, filter: "blur(4px)", scale: 0.9 }}
                            animate={{ width: "auto", opacity: 1, filter: "blur(0px)", scale: 1 }}
                            exit={{ width: 0, opacity: 0, filter: "blur(4px)", scale: 0.9 }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className="hidden sm:inline-block whitespace-nowrap relative z-10 origin-left overflow-hidden"
                          >
                            {item.label} {item.id === 'favorites' && `(${favorites.length})`}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabUnderline" 
                          className="absolute bottom-1 inset-x-4 h-0.5 bg-white/60 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20" 
                        />
                      )}
                    </motion.button>
                  );
                })}
              </motion.nav>
            </div>

            {/* 3. Right Island: Action Hub */}
            <div className="pointer-events-auto shrink-0 flex justify-end">
              <motion.div
                animate={{
                  scale: isCompact ? 0.9 : 1,
                  opacity: 1,
                  boxShadow: isCompact ? "0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(249,115,22,0.3)" : "0 10px 30px rgba(0,0,0,0.3)"
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`flex items-center transition-all duration-500 ease-out border border-white/10 shadow-2xl ${isCompact ? 'gap-2 bg-[#0a0a0f]/90 backdrop-blur-3xl rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'gap-2 bg-[#0a0a0f]/40 backdrop-blur-xl rounded-[2rem] p-2'}`}
              >
                <motion.button
                  onClick={() => setIsAIAssistantOpen(true)}
                  className={`flex items-center p-1 rounded-full border border-orange-500/30 hover:bg-white/[0.04] group transition-all duration-500 ease-out ${isCompact ? 'gap-0 pr-1 bg-transparent' : 'gap-2 pr-3 bg-transparent'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`bg-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-all duration-500 ease-out ${isCompact ? 'w-12 h-12 rounded-full' : 'w-8 h-8 rounded-[0.9rem]'}`}>
                    <Bot className={`text-white transition-all duration-500 ease-out ${isCompact ? 'w-6 h-6' : 'w-4 h-4'}`} />
                  </div>
                  <div className={`hidden sm:flex items-center gap-1.5 font-black uppercase tracking-[0.2em] transition-all duration-500 ease-out overflow-hidden whitespace-nowrap origin-left ${isCompact ? 'max-w-0 opacity-0' : 'max-w-[80px] opacity-70 text-[9px]'}`}>
                    <span className="text-white">Techboy</span>
                    <span className="text-orange-500">AI</span>
                  </div>
                </motion.button>

                <div className={`hidden sm:block w-px bg-white/10 shrink-0 transition-all duration-500 ease-out overflow-hidden origin-center ${isCompact ? 'w-0 h-8 mx-0 opacity-0' : 'w-px h-6 mx-1 opacity-100'}`} />

                <AuthButton
                  onViewDashboard={() => setCurrentView(currentView === 'dashboard' ? 'search' : 'dashboard')}
                  isCompact={isCompact}
                />
              </motion.div>
            </div>
          </div>

          <div className="block md:hidden fixed top-3 left-4 right-4 z-[2000] pointer-events-none">
            <div className="flex items-center justify-between">
              {/* Logo Pill (Left) */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                whileTap={{ scale: 0.95 }}
                className={`pointer-events-auto flex items-center cursor-pointer bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 rounded-full py-1.5 shadow-xl group/moblogo transition-all duration-500 ease-out ${isCompact ? 'gap-2 pr-4 pl-1.5' : 'gap-2 pr-4 pl-1.5'}`}
                onClick={() => { setCurrentView('search'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-orange-500 blur-xl opacity-30 group-hover/moblogo:opacity-50 transition-opacity" />
                  <img src={mascotLogo} className={`rounded-full border border-white/20 shadow-lg relative z-10 transition-all duration-500 ease-out ${isCompact ? 'w-14 h-14' : 'w-8 h-8'}`} alt="Logo" />
                </div>
                <span className={`font-black text-white tracking-tighter uppercase mt-0.5 transition-all duration-500 ease-out whitespace-nowrap origin-left ${isCompact ? 'text-[9px] opacity-70' : 'text-xs opacity-100'}`}>Project Finder</span>
              </motion.div>

              {/* Actions Pill (Right) */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.2, delay: 0.1 }}
                className={`pointer-events-auto flex items-center bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 rounded-full shadow-xl transition-all duration-500 ease-out ${(!currentUser || isCompact) ? 'gap-1 p-1' : 'gap-2 p-1.5'}`}
              >
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setIsAIAssistantOpen(true)}
                  className={`rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] flex items-center justify-center transition-all duration-500 ease-out ${isCompact ? 'w-14 h-14' : 'w-8 h-8'}`}
                >
                  <Bot className={`text-white transition-all duration-500 ease-out ${isCompact ? 'w-7 h-7' : 'w-4 h-4'}`} />
                </motion.button>
                {!currentUser && (
                  <div className="transition-all duration-500 ease-out">
                    <AuthButton minimal isCompact={isCompact} onViewDashboard={() => setCurrentView('dashboard')} />
                  </div>
                )}
              </motion.div>
            </div>
          </div>



          
          {/* Toast Notification */}
          <AnimatePresence>
            {toast.visible && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
              >
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  {toast.icon}
                  <span className="text-white text-xs font-medium tracking-wide">{toast.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                onSearch={(query) => {
                  setCurrentView('search');
                  handleSearch(query);
                }}
                onOpenResearchSession={(session) => {
                  setRestoredResearchSession(session);
                  setIsAIAssistantOpen(true);
                }}
                onImportProjects={(imported) => {
                  setFavorites(current => {
                    const existing = new Set(current.map(project => project.url));
                    return [...current, ...imported.filter(project => !existing.has(project.url))];
                  });
                }}
                recentSearches={recentSearches}
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
                      <p className="text-gray-400 text-[11px] md:text-base max-w-xl mx-auto px-6 leading-relaxed font-medium opacity-60 text-center order-1">
                        The ultimate research engine for <br className="hidden md:block" /> <span className="text-white">GitHub</span>, <span className="text-hf-yellow">Hugging Face</span>, <span className="text-orange-400">Kaggle</span>, and <span className="text-blue-400">LinkedIn</span>.
                      </p>

                      <p className="hidden md:block text-gray-400 text-sm md:text-base max-w-xl mx-auto px-6 leading-relaxed font-medium opacity-60 order-3">
                        The ultimate discovery hub for developers.
                      </p>
                    </div>
                  </div>

                  <SearchBar 
                    onSearch={handleSearch} 
                    isLoading={searchState.isLoading}
                    onSurpriseMe={handleSurpriseMe}
                    className="max-w-4xl mx-auto"
                  />

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

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">
                        {homeTrending.length > 0 ? homeTrending.map((project, idx) => {
                          const isFav = favorites.some(f => f.url === project.url);
                          
                          return (
                            <ProjectCard 
                              key={project.id} 
                              project={project} 
                              isFavorite={isFav} 
                              onToggleFavorite={toggleFavorite} 
                              onToggleCompare={toggleComparison} 
                              isComparing={comparisonQueue.some(p => p.url === project.url)} 
                              index={idx}
                            />
                          );
                        }) : null}
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
                          <div className="w-full p-3 md:p-4 rounded-[1.5rem] border border-white/5 bg-[#0a0a0f]/80 backdrop-blur-2xl flex flex-col lg:flex-row items-stretch gap-4 mb-8 group shadow-2xl">
                              
                              {/* Left side: Search Query & Status Pill */}
                              <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-orange-500/40 via-transparent to-transparent shadow-xl w-full lg:w-auto shrink-0 flex">
                                  <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-orange-500/20 to-transparent blur-md pointer-events-none rounded-l-2xl" />
                                  <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-6 bg-[#0a0a0f]/90 rounded-2xl p-3 sm:px-4 sm:py-2 h-full w-full">
                                      
                                      {/* Search Query */}
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                                              <Search size={16} className="text-orange-500" />
                                          </div>
                                          <div className="flex flex-col">
                                              <span className="text-[8px] text-gray-500 uppercase tracking-[0.2em] font-medium leading-none mb-1">Results for</span>
                                              <div className="flex items-center gap-1.5">
                                                  <span className="text-base md:text-lg font-black text-white truncate max-w-[150px] md:max-w-[200px]">"{localStorage.getItem('last-search-query') || 'All Projects'}"</span>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="hidden sm:block w-px h-8 bg-white/5 shrink-0" />
                                      
                                      <div className="flex items-center gap-4 lg:gap-6 mt-2 sm:mt-0">
                                          {/* Repositories Count */}
                                          <div className="flex items-center gap-2">
                                              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                                                  <Folder className="w-4 h-4 text-indigo-400" />
                                              </div>
                                              <div className="flex flex-col">
                                                  <span className="text-[7px] text-gray-500 uppercase tracking-widest font-medium leading-none mb-1">Discovery</span>
                                                  <div className="flex items-baseline gap-1 leading-none">
                                                      <motion.span key={filteredProjects.length} initial={{ scale: 1.5, color: "#f97316", textShadow: "0 0 20px rgba(249,115,22,1)" }} animate={{ scale: 1, color: "#ffffff", textShadow: "0 0 0px rgba(249,115,22,0)" }} transition={{ duration: 0.5, type: "spring", bounce: 0.5 }} className="text-base font-black text-white inline-block">{filteredProjects.length}</motion.span>
                                                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Repos</span>
                                                  </div>
                                              </div>
                                          </div>

                                          <div className="hidden sm:block w-px h-8 bg-white/5 shrink-0" />

                                          {/* Status */}
                                          <div className="flex items-center gap-2">
                                              <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 shrink-0 relative flex items-center justify-center">
                                                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                                  <div className="absolute inset-0 rounded-full border border-green-500/50 animate-ping" />
                                              </div>
                                              <div className="flex flex-col">
                                                  <span className="text-[7px] text-gray-500 uppercase tracking-widest font-medium leading-none mb-1">Status</span>
                                                  <div className="flex flex-col leading-none gap-0.5">
                                                      <span className="text-[9px] font-black text-green-400 uppercase tracking-wider">Updated</span>
                                                      <span className="text-[9px] font-black text-green-400 uppercase tracking-wider">Just Now</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {/* Middle side: Filters Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full lg:flex-1 shrink">
                                  {/* Sort */}
                                  <div className="relative group/select flex items-center justify-between px-4 h-11 rounded-full border border-white/10 bg-transparent hover:bg-white/[0.02] transition-colors cursor-pointer overflow-hidden">
                                      <div className="flex items-center gap-3 pointer-events-none z-10">
                                          <ListFilter className="text-orange-500 w-4 h-4 group-hover/select:scale-110 transition-transform" strokeWidth={2.5} />
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-200">
                                              {resultSort === 'relevance' ? 'Sort: Relevance' : resultSort === 'stars' ? 'Sort: GitHub Stars' : 'Sort: Name'}
                                          </span>
                                      </div>
                                      <ChevronDown className="text-gray-400 w-3.5 h-3.5 pointer-events-none z-10" />
                                      <select value={resultSort} onChange={event => setResultSort(event.target.value as typeof resultSort)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20">
                                        <option value="relevance">Sort: Relevance</option>
                                        <option value="stars">Sort: GitHub Stars</option>
                                        <option value="name">Sort: Name</option>
                                      </select>
                                  </div>

                                  {/* Language */}
                                  <div className="relative group/select flex items-center justify-between px-4 h-11 rounded-full border border-white/10 bg-transparent hover:bg-white/[0.02] transition-colors cursor-pointer overflow-hidden">
                                      <div className="flex items-center gap-3 pointer-events-none z-10">
                                          <Code className="text-orange-500 w-4 h-4 group-hover/select:scale-110 transition-transform" strokeWidth={2.5} />
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-200">
                                              {languageFilter === 'All' ? 'Language: All' : `Language: ${languageFilter}`}
                                          </span>
                                      </div>
                                      <ChevronDown className="text-gray-400 w-3.5 h-3.5 pointer-events-none z-10" />
                                      <select value={languageFilter} onChange={event => setLanguageFilter(event.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20">
                                        {availableLanguages.map(language => <option key={language} value={language}>{language === 'All' ? 'Language: All' : language}</option>)}
                                      </select>
                                  </div>

                                  {/* Stars */}
                                  <div className="relative group/select flex items-center justify-between px-4 h-11 rounded-full border border-white/10 bg-transparent hover:bg-white/[0.02] transition-colors cursor-pointer overflow-hidden">
                                      <div className="flex items-center gap-3 pointer-events-none z-10">
                                          <Star className="text-orange-500 w-4 h-4 group-hover/select:scale-110 transition-transform" strokeWidth={2.5} />
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-200">
                                              {minStars === '0' ? 'Stars: Any' : minStars === '100' ? 'Stars: 100+' : minStars === '1000' ? 'Stars: 1K+' : 'Stars: 10K+'}
                                          </span>
                                      </div>
                                      <ChevronDown className="text-gray-400 w-3.5 h-3.5 pointer-events-none z-10" />
                                      <select value={minStars} onChange={event => setMinStars(event.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20">
                                        <option value="0">Stars: Any</option><option value="100">Stars: 100+</option><option value="1000">Stars: 1K+</option><option value="10000">Stars: 10K+</option>
                                      </select>
                                  </div>

                                  {/* Updated */}
                                  <div className="relative group/select flex items-center justify-between px-4 h-11 rounded-full border border-white/10 bg-transparent hover:bg-white/[0.02] transition-colors cursor-pointer overflow-hidden">
                                      <div className="flex items-center gap-3 pointer-events-none z-10">
                                          <Clock className="text-orange-500 w-4 h-4 group-hover/select:scale-110 transition-transform" strokeWidth={2.5} />
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-200">
                                              {dateFilter === 'all' ? 'Updated: Any time' : dateFilter === 'week' ? 'Updated: This week' : dateFilter === 'month' ? 'Updated: This month' : 'Updated: This year'}
                                          </span>
                                      </div>
                                      <ChevronDown className="text-gray-400 w-3.5 h-3.5 pointer-events-none z-10" />
                                      <select value={dateFilter} onChange={event => setDateFilter(event.target.value as typeof dateFilter)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20">
                                        <option value="all">Updated: Any time</option><option value="week">Updated: This week</option><option value="month">Updated: This month</option><option value="year">Updated: This year</option>
                                      </select>
                                  </div>
                              </div>

                              {/* Right side: Vertical Platforms List */}
                              <div className="bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 flex flex-col gap-1 w-full lg:w-48 shrink-0 h-fit">
                                {(['All', 'GitHub', 'Hugging Face', 'Kaggle', 'LinkedIn'] as PlatformFilter[]).map((p) => {
                                  const isActive = filterPlatform === p;
                                  const Icon = p === 'All' ? Globe : p === 'GitHub' ? Github : p === 'Hugging Face' ? Brain : p === 'Kaggle' ? BarChart3 : Linkedin;
                                  
                                  return (
                                    <button
                                      key={p}
                                      onClick={() => {
                                        setFilterPlatform(p);
                                        const lastQuery = localStorage.getItem('last-search-query');
                                        if (lastQuery) handleSearch(lastQuery, selectedCategory, p);
                                      }}
                                      className={`relative px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-between group/plat ${
                                        isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                      }`}
                                    >
                                      {isActive && (
                                        <motion.div
                                          layoutId="activePlatformList"
                                          className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                      )}
                                      <div className="flex items-center gap-2.5 relative z-10">
                                        <Icon size={12} className={`transition-transform duration-300 group-hover/plat:scale-110 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-70'}`} />
                                        <span>{p}</span>
                                      </div>
                                      
                                      {isActive && (
                                        <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-lg">
                                            <Check size={8} className="text-orange-600" strokeWidth={4} />
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                          </div>
                    {filteredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                              {filteredProjects.map((project, index) => (
                                <ProjectCard
                                  key={`${project.id}-${index}`}
                                  index={index}
                                  project={project}
                                  isFavorite={favorites.some(f => f.url === project.url)}
                                  onToggleFavorite={toggleFavorite}
                                  onView={setLastViewedProject}
                                  onToggleCompare={toggleComparison}
                                  isComparing={comparisonQueue.some(p => p.id === project.id)}
                                  isSearchResult={true}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-900/40 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center px-8">
                                <div className="p-4 bg-orange-500/10 rounded-full mb-6">
                                   <Search className="w-8 h-8 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">No results found</h3>
                                <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
                                  We couldn't find any resources matching your search. Try adjusting your query or filters.
                                </p>
                                <button
                                  onClick={() => { 
                                     setFilterPlatform('All');
                                     handleCategoryChange('All');
                                  }}
                                  className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px]"
                                >
                                  Clear Search Parameters
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
                                        onClick={(e) => {
                                          e.preventDefault();
                                          openSafe(source.uri);
                                        }}
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
                      Failed to load projects
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

                <div className="mb-8"><div className="flex justify-end"><button onClick={() => { setCollectionError(''); setShowCreateCollection(true); }} className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-orange-300 hover:bg-orange-500/20">+ Create Collection</button></div>{collectionError && <p className="mt-3 text-right text-[10px] text-orange-300">{collectionError}</p>}{collections.length > 0 && <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{collections.map(collection => { const id = collection._id || collection.id; return <div key={id} className="glass-card relative aspect-square rounded-2xl border border-white/10 p-4"><button onClick={() => setOpenCollection(collection)} className="flex h-full w-full flex-col justify-end text-left"><span className="block truncate text-sm font-bold text-white">{collection.name}</span><span className="mt-1 block text-[10px] text-gray-500">{collection.projects?.length || 0} projects</span></button><button aria-label="Collection options" onClick={() => setCollectionMenu(collectionMenu === id ? null : id)} className="absolute right-3 top-3 rounded-lg p-1 text-gray-500 hover:bg-white/10 hover:text-white"><MoreHorizontal size={18}/></button>{collectionMenu === id && <div className="absolute right-3 top-11 z-20 w-28 rounded-xl border border-white/10 bg-[#171923] p-1 shadow-2xl"><button onClick={() => { setCollectionMenu(null); handleRenameCollection(collection); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-bold text-gray-300 hover:bg-white/10"><Settings size={12}/> Rename</button><button onClick={() => { setCollectionMenu(null); handleDeleteCollection(collection); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-bold text-red-300 hover:bg-red-500/10"><Trash2 size={12}/> Delete</button></div>}</div>; })}</div>}</div>

                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((project, index) => (
                      <ProjectCard
                        key={index}
                        project={project}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                        onView={setLastViewedProject}
                        onToggleCompare={toggleComparison}
                        isComparing={comparisonQueue.some(p => p.id === project.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 animate-pulse">
                      <Heart className="w-14 h-14 text-gray-700" />
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


                {openCollection && <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpenCollection(null)}><div className="glass-card w-full max-w-lg rounded-[2rem] p-6" onClick={event => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-black uppercase tracking-widest text-white">{openCollection.name}</h2><button onClick={() => setOpenCollection(null)} className="rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-white/10">CLOSE</button></div><div className="max-h-80 space-y-2 overflow-y-auto custom-scrollbar">{openCollection.projects?.length ? openCollection.projects.map((project: any, index: number) => <div key={project._id || project.id || index} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3"><a href={project.url || project.html_url || '#'} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-white">{project.name || project.title || 'Saved project'}</span><span className="text-[10px] text-gray-500">{project.platform || 'GitHub'} · Open repository ↗</span></a><button aria-label="Remove project from collection" onClick={() => handleRemoveCollectionProject(openCollection, project)} className="text-gray-500 hover:text-red-400"><Trash2 size={14}/></button></div>) : <p className="py-8 text-center text-xs italic text-gray-500">No projects in this collection yet.</p>}</div></div></div>}

            {/* Coming Soon Notification */}
            {showCreateCollection && <div className="fixed inset-0 z-[310] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowCreateCollection(false)}><form onSubmit={event => { event.preventDefault(); handleCreateCollection(); }} onClick={event => event.stopPropagation()} className="glass-card w-full max-w-md rounded-[2rem] p-6"><h2 className="text-lg font-black uppercase tracking-widest text-white">Create Collection</h2><p className="mt-2 text-xs text-gray-500">Give your saved projects a name.</p><input autoFocus value={newCollectionName} onChange={event => setNewCollectionName(event.target.value)} placeholder="Collection name" className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50" /><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setShowCreateCollection(false)} className="rounded-xl px-4 py-2 text-xs text-gray-400 hover:bg-white/10">Cancel</button><button type="submit" disabled={!newCollectionName.trim()} className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-black uppercase tracking-widest text-white disabled:opacity-40">Create</button></div></form></div>}
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
              currentSearch={localStorage.getItem('last-search-query') || ""}
              lastProject={lastViewedProject}
              restoredSession={restoredResearchSession}
            />

            {/* --- MOBILE BOTTOM NAVIGATION --- */}
            <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] w-full px-4 flex justify-center pointer-events-none">
              <motion.nav 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.25, delay: 0.2 }}
                className="inline-flex p-1 bg-[#0f172a]/90 backdrop-blur-3xl border border-white/10 rounded-full items-center gap-6 px-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto"
              >
                {[
                  { id: 'search', icon: Search },
                  { id: 'trending', icon: TrendingUp },
                  { id: 'favorites', icon: Heart },
                  ...(currentUser ? [{ id: 'dashboard', isProfile: true }] : [])
                ].map((item) => {
                  const isActive = currentView === item.id;
                  const Icon = item.icon as any;
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => { setCurrentView(item.id as ViewType); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`relative p-2.5 rounded-full transition-colors duration-300 ${
                        isActive 
                          ? `bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]` 
                          : 'text-gray-400 hover:text-white hover:bg-white/5 opacity-70'
                      }`}
                    >
                      <motion.div animate={{ scale: isActive ? 1.15 : 1 }} transition={{ type: "spring", bounce: 0.4 }}>
                        {item.isProfile ? (
                          <img 
                            src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || currentUser.email}`} 
                            className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-full object-cover border border-white/30 shrink-0"
                            alt="Profile"
                          />
                        ) : (
                          <Icon className="w-7 h-7" />
                        )}
                      </motion.div>
                      {isActive && (
                        <motion.div 
                          layoutId="activeNavMobile"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </motion.nav>
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
