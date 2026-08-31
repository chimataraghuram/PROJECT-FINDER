import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Github, ExternalLink, RefreshCw, Flame, User, Globe, Code, Search, Rocket, Shield, Brain, Share2, BarChart3, Database, Linkedin, Bot, Heart, X, Sparkles, Loader2, Folder, Activity, TrendingUp } from 'lucide-react';
import { Project } from '../types';
import { fetchTrending } from '../services/apiService';
import { openSafe } from '../src/utils/urlHelper';

// Custom SVG for Hugging Face logo
const HuggingFaceEmoji = ({ className = "w-5 h-5" }) => (
    <span className={className} role="img" aria-label="Hugging Face">🤗</span>
);

// Custom SVG for Kaggle logo
const KaggleIcon = ({ className = "w-5 h-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M18.825 23.859c-.022.09-.092.126-.168.141h-3.32c-.172 0-.254-.078-.344-.19l-5.66-7.394-1.298 1.155v6.29c0 .16-.06.257-.23.238H5.53c-.158.02-.234-.082-.234-.238V.23C5.305.074 5.37 0 5.53 0h2.274c.17 0 .23.082.23.23v14.288l7.094-8.312c.094-.108.188-.18.36-.18h3.35c.18 0 .26.078.188.223l-6.19 7.18 6.44 9.94c.09.138.02.327-.45.49z" />
    </svg>
);

interface TrendingProjectsProps {
    favorites: Project[];
    onToggleFavorite: (project: Project) => void;
    onToggleComparison: (project: Project) => void;
    comparisonQueue: Project[];
    onSummarize: (projectName: string) => void;
}

const TrendingBadge = () => (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-md">
        <Flame size={12} className="text-orange-500 animate-pulse" />
        <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider">Trending</span>
    </div>
);

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
    const isTop3 = rank <= 3;
    const colors = [
        'from-yellow-400 to-orange-500', // Gold
        'from-slate-300 to-slate-500',   // Silver
        'from-orange-700 to-orange-900', // Bronze
    ];
    
    return (
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl backdrop-blur-md border shrink-0 ${
            isTop3 
            ? `bg-gradient-to-br ${colors[rank-1]} border-white/20 shadow-lg` 
            : 'bg-white/5 border-white/10'
        }`}>
            <span className={`text-xs font-black ${isTop3 ? 'text-white' : 'text-gray-400'}`}>
                #{rank}
            </span>
        </div>
    );
};

const SkeletonCard = () => (
    <div className="bg-[#0f172a]/40 border border-white/5 rounded-[2.5rem] p-8 h-[450px] animate-pulse">
        <div className="flex justify-between items-start mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-2xl" />
            <div className="w-10 h-10 bg-white/5 rounded-full" />
        </div>
        <div className="w-2/3 h-8 bg-white/5 rounded-lg mb-4" />
        <div className="w-full h-24 bg-white/5 rounded-lg mb-8" />
        <div className="flex gap-4 mt-auto">
            <div className="w-1/2 h-12 bg-white/5 rounded-xl" />
            <div className="w-1/2 h-12 bg-white/5 rounded-xl" />
        </div>
    </div>
);

const TrendingCard: React.FC<{ 
    project: any; 
    rank: number;
    isFavorite: boolean; 
    isComparing: boolean;
    onToggle: () => void;
    onCompare: () => void;
    onSummarize: () => void;
    onShare: (url: string) => void;
}> = ({ project, rank, isFavorite, isComparing, onToggle, onCompare, onSummarize, onShare }) => {
    const getPlatformConfig = () => {
        const platform = project.platform?.toLowerCase() || '';
        if (platform.includes('hugging')) return { label: 'View Model', icon: Bot, color: 'text-yellow-400', brandColor: 'orange' };
        if (platform.includes('kaggle')) return { label: 'View Dataset', icon: Database, color: 'text-blue-400', brandColor: 'blue' };
        if (platform.includes('linkedin')) return { label: 'View Post', icon: Linkedin, color: 'text-blue-600', brandColor: 'blue' };
        return { label: 'View Repo', icon: Github, color: 'text-white', brandColor: 'orange' };
    };

    const getPlatformAvatar = () => {
        const platform = project.platform?.toLowerCase() || '';
        if (platform.includes('hugging')) return <HuggingFaceEmoji className="w-7 h-7 md:w-9 md:h-9" />;
        if (platform.includes('kaggle')) return <KaggleIcon className="w-6 h-6 md:w-8 md:h-8 text-[#20beff]" />;
        if (platform.includes('linkedin')) return <Linkedin className="w-6 h-6 md:w-8 md:h-8 text-[#0077b5]" fill="currentColor" />;
        return <Github className="w-6 h-6 md:w-8 md:h-8 text-white" />;
    };

    const config = getPlatformConfig();

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -12, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className={`group relative glass-card p-5 md:p-6 flex flex-col h-full overflow-hidden border border-white/5 rounded-[2rem]`}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Top Row: Rank, Trending, Menu/Compare */}
            <div className="flex items-center justify-between mb-5 relative z-30">
                <div className="flex items-center gap-2.5">
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-300">
                        #{rank}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">
                        <Flame size={12} className="text-orange-500" />
                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Trending</span>
                    </div>
                </div>
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCompare(); }}
                    className={`p-2 rounded-full transition-all ${
                      isComparing
                      ? 'bg-orange-500/20 text-orange-500'
                      : 'text-gray-400 hover:bg-purple-500/20 hover:text-purple-500'
                    }`}
                    title="Compare Project"
                >
                    <BarChart3 size={16} />
                </motion.button>
            </div>

            {/* Metrics Box */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#020617]/50 border border-white/5 mb-5 relative z-30 shadow-inner w-full">
                <div className="grid grid-cols-2 gap-2 flex-1 place-items-center">
                    <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-400 hover:text-white transition-colors group/metric" title="Share" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(project.url); }}>
                        <Share2 size={16} className="group-hover/metric:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold tracking-wider">Share</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-400 hover:text-red-500 transition-colors group/metric" title="Save" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}>
                        <Heart size={16} fill={isFavorite ? "currentColor" : "none"} className={`group-hover/metric:scale-110 transition-transform ${isFavorite ? 'text-red-500' : ''}`} />
                        <span className="text-[9px] font-bold tracking-wider">Loved</span>
                    </div>
                </div>
                
                <div className="w-px h-8 bg-white/10 mx-3 md:mx-4" />
                
                <div className="flex items-center gap-2 shrink-0 pl-1">
                    <Star size={18} className="text-orange-500 fill-orange-500" />
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-orange-500 leading-none mb-0.5">
                            {typeof project.stars === 'number' ? project.stars.toLocaleString() : project.stars}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 tracking-wider">Stars</span>
                    </div>
                </div>
            </div>

            {/* Author Area */}
            <div className="flex items-center gap-3 mb-6 relative z-30">
                <div className="relative">
                    <div className="w-12 h-12 rounded-[1rem] bg-[#0f172a] border border-white/10 flex items-center justify-center p-2 shadow-lg">
                        {getPlatformAvatar()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#020617] border border-white/10 flex items-center justify-center shadow-lg">
                        <img 
                            src={project.owner?.avatar_url || `https://ui-avatars.com/api/?name=${project.owner?.login || project.platform}`} 
                            alt={project.owner?.login} 
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                </div>
                <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-0.5">By Author</p>
                    <div className="flex items-center gap-1.5">
                        <a 
                            href={project.owner?.html_url || '#'} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-sm md:text-base font-bold text-white hover:text-blue-400 transition-colors tracking-tight"
                            onClick={(e) => { e.stopPropagation(); openSafe(project.owner?.html_url); }}
                        >
                            @{project.owner?.login || 'unknown'}
                        </a>
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                            <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative z-20 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 text-transparent bg-clip-text truncate pb-1">
                            {project.name}
                        </h3>
                        <p className="text-gray-400 text-[12px] md:text-[13px] font-medium leading-relaxed mt-2 opacity-90 line-clamp-3">
                            {project.description || 'Discover this amazing open-source contribution across platform.'}
                        </p>
                    </div>
                    {/* Placeholder for Red Glowing Lightning */}
                    <div className="shrink-0 w-14 h-14 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,1)) drop-shadow(0 0 25px rgba(239,68,68,0.8))' }} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                </div>

                <div className="mt-auto">
                    {project.language && (
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{project.language}</span>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-6">
                        {project.tags?.slice(0, 3).map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold text-gray-300 uppercase tracking-wider shadow-inner">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-3 mt-auto relative z-20">
                <motion.a 
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => { e.stopPropagation(); openSafe(project.url); }}
                    className="py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:shadow-orange-500/50 hover:brightness-110"
                >
                    <config.icon size={14} /> 
                    VIEW REPO
                </motion.a>

                <motion.a 
                    href={project.liveUrl || '#'}
                    target={project.liveUrl ? "_blank" : "_self"}
                    rel="noreferrer"
                    whileHover={{ scale: project.liveUrl ? 1.02 : 1 }}
                    whileTap={{ scale: project.liveUrl ? 0.98 : 1 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (project.liveUrl && project.liveUrl !== '#') openSafe(project.liveUrl);
                        else e.preventDefault();
                    }}
                    className={`py-3 rounded-xl border-2 ${project.liveUrl && project.liveUrl !== '#' ? 'border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10' : 'border-white/10 text-gray-500 cursor-not-allowed'} text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2`}
                >
                    <ExternalLink size={14} /> 
                    LIVE DEMO
                </motion.a>
            </div>
        </motion.div>
    );
};

export const TrendingProjects: React.FC<TrendingProjectsProps> = ({ favorites, onToggleFavorite, onToggleComparison, comparisonQueue, onSummarize }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [activePlatform, setActivePlatform] = useState('GitHub');
    const [activeCategory, setActiveCategory] = useState('All');
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [rotation, setRotation] = useState(0);

    const PLATFORMS = ['GitHub', 'Hugging Face', 'Kaggle', 'LinkedIn'];
    const CATEGORIES = [
      { id: 'All', label: 'All Projects', icon: Globe },
      { id: 'AI', label: 'AI', icon: Bot },
      { id: 'Web', label: 'Web Dev', icon: Code },
      { id: 'App', label: 'App Dev', icon: Rocket },
      { id: 'ML', label: 'Machine Learning', icon: Brain },
      { id: 'Fun', label: 'Fun Projects', icon: Sparkles },
    ];

    const loadTrending = useCallback(async (platform = activePlatform, category = activeCategory, background = false) => {
        // Keep the current cards visible while the next live set is loading.
        if (!background) setLoading(true);
        else setIsRefreshing(true);
        setError(null);
        try {
            const data = await fetchTrending(platform, category);
            if (!data || data.length === 0) {
                setProjects([]);
            } else {
                setProjects(data);
                setRotation(0);
            }
            setLastUpdated(new Date());
        } catch (e: any) {
            setError(e.message || "Failed to load projects");
        } finally {
            if (!background) setLoading(false);
            setIsRefreshing(false);
        }
    }, [activePlatform, activeCategory]);

    useEffect(() => {
        loadTrending(activePlatform, activeCategory);

        // Refresh live projects automatically without replacing the current UI with skeletons.
        const interval = setInterval(() => {
            console.log(`Auto-refreshing trending data for ${activePlatform}/${activeCategory}...`);
            loadTrending(activePlatform, activeCategory, true);
        }, 60000);

        return () => clearInterval(interval);
    }, [activePlatform, activeCategory, loadTrending]);

    // Keep the Trending page feeling live: rotate the visible feed every second.
    // This uses the already-loaded results and does not make an API request per second.
    useEffect(() => {
        const rotationInterval = setInterval(() => {
            setRotation(current => projects.length > 1 ? (current + 1) % projects.length : 0);
        }, 60000);
        return () => clearInterval(rotationInterval);
    }, [projects.length]);

    const visibleProjects = projects.length > 1
        ? projects.slice(rotation).concat(projects.slice(0, rotation))
        : projects;

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadTrending(activePlatform, activeCategory);
    };

    const handlePlatformChange = (p: string) => {
        setActivePlatform(p);
        loadTrending(p, activeCategory);
    };

    const handleCategoryChange = (c: string) => {
        setActiveCategory(c);
        loadTrending(activePlatform, c);
    };

    const handleShare = (url: string) => {
        navigator.clipboard.writeText(url);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };


    return (
        <div className="pt-32 pb-32 md:pt-40 px-4 max-w-7xl mx-auto min-h-screen relative z-10">
            <AnimatePresence>
                {showToast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-[#0f172a] border border-orange-500/30 px-8 py-4 rounded-2xl shadow-[0_0_50px_rgba(249,115,22,0.4)] backdrop-blur-3xl flex items-center gap-4"
                    >
                        <div className="bg-orange-600 p-2 rounded-xl shadow-lg">
                            <ExternalLink size={16} className="text-white" />
                        </div>
                        <span className="text-white font-black tracking-widest uppercase text-xs">Repository URL Copied!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="text-center mb-16 relative">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2"
                >
                    <div className="p-4 bg-orange-500/20 rounded-full blur-2xl">
                        <Flame size={40} className="text-orange-500" />
                    </div>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-400 via-white to-red-500 text-transparent bg-clip-text tracking-tighter"
                >
                    Trending Projects
                </motion.h1>
                <p className="text-gray-400 font-bold text-lg md:text-xl max-w-2xl mx-auto opacity-60">
                    Discover what's hot across the tech ecosystem in real-time
                </p>
                <p className="mt-3 text-[10px] font-black uppercase tracking-[0.25em] text-orange-400/70">
                    {isRefreshing ? 'Finding newer projects…' : lastUpdated ? `Live feed updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live feed loading…'}
                </p>

                {/* Platforms & Manual Refresh */}
                <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
                    {/* Platform Tabs */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {PLATFORMS.map((p) => (
                            <motion.button
                                key={p}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePlatformChange(p)}
                                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                    activePlatform === p
                                    ? 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                }`}
                            >
                                {p}
                            </motion.button>
                        ))}
                    </div>

                    {/* Manual Refresh Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-widest hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-300 transition-all active:scale-95 ${isRefreshing ? 'opacity-50' : ''}`}
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
                    </motion.button>
                </div>

            </div>

            <div className="w-full max-w-4xl mx-auto mb-16 group">
                <div className="relative p-[1px] rounded-[2rem] md:rounded-full bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 shadow-2xl transition-all duration-500 hover:from-purple-500/50 hover:via-pink-500/50 hover:to-orange-500/50">
                    <div className="absolute -inset-[1px] rounded-[2rem] md:rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                    
                    <div className="relative flex flex-col md:flex-row items-start md:items-center bg-[#0a0a0f] rounded-[2rem] md:rounded-full p-4 md:px-6 md:py-3 w-full gap-4 md:gap-0">
                        
                        {/* 1. Platform Info */}
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-3 rounded-2xl bg-[#1e1b19] border border-orange-500/20 shrink-0">
                                <Flame size={20} className="text-orange-500 animate-pulse" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium leading-none mb-1">Trending on</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg md:text-xl font-black text-white uppercase tracking-widest leading-none">{activePlatform}</span>
                                    <TrendingUp size={16} className="text-orange-500" />
                                </div>
                            </div>
                        </div>

                        {!loading && projects.length > 0 && (
                            <>
                                <div className="hidden md:block w-px h-10 bg-white/10 mx-6 shrink-0" />
                                
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 w-full md:w-auto flex-1">
                                    {/* 2. Repositories Count */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                                            <Folder className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-medium leading-none mb-1">Discovery</span>
                                            <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider leading-none">{projects.length} Repositories</span>
                                        </div>
                                    </div>

                                    <div className="hidden md:block w-px h-10 bg-white/10 mx-6 shrink-0" />

                                    {/* 3. Status */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 shrink-0">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-medium leading-none mb-1">Status</span>
                                            <span className="text-xs md:text-sm font-bold text-green-400 uppercase tracking-wider leading-none">Updated Just Now</span>
                                        </div>
                                    </div>
                                    
                                    {/* 4. Real-Time Button */}
                                    <div className="md:ml-auto w-full md:w-auto mt-2 md:mt-0">
                                        <button className="w-full md:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:brightness-110 transition-all cursor-default">
                                            <Activity size={14} />
                                            <span>Real-Time</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    <div className="col-span-full">
                        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/5 mb-12 animate-pulse">
                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-6" />
                            <h3 className="text-xl font-black text-white uppercase tracking-widest">Fetching projects from GitHub...</h3>
                            <p className="text-gray-500 text-xs mt-2 uppercase tracking-[0.2em]">Accessing live repository data</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    </div>
                ) : error ? (
                    <div className="col-span-full text-center py-20 bg-red-500/5 rounded-[2.5rem] border border-dashed border-red-500/20">
                        <Shield size={48} className="text-red-500/30 mx-auto mb-6" />
                        <p className="text-red-500 font-bold text-xl uppercase tracking-tighter">{error}</p>
                        <button 
                            onClick={handleRefresh}
                            className="mt-6 text-orange-500 font-black uppercase tracking-widest text-xs hover:underline"
                        >
                            Retry Loading
                        </button>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {visibleProjects.map((project, index) => (
                            <TrendingCard 
                                key={project.id || `${project.name}-${index}`} 
                                project={project}
                                rank={index + 1}
                                isFavorite={favorites.some(f => f.url === project.url)}
                                isComparing={comparisonQueue.some(p => p.url === project.url)}
                                onToggle={() => onToggleFavorite(project)}
                                onCompare={() => onToggleComparison(project)}
                                onSummarize={() => onSummarize(project.name)}
                                onShare={handleShare}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {error && (
                <div className="text-center py-20 bg-red-500/5 rounded-[2.5rem] border border-dashed border-red-500/10 mb-12">
                    <Shield size={48} className="text-red-900/20 mx-auto mb-6" />
                    <p className="text-red-500 font-bold text-xl uppercase tracking-tighter">Failed to load projects</p>
                    <button 
                        onClick={handleRefresh}
                        className="mt-6 text-orange-500 font-black uppercase tracking-widest text-xs hover:underline"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!loading && projects.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                    <Rocket size={48} className="text-gray-700 mx-auto mb-6 opacity-20" />
                    <p className="text-gray-500 font-bold text-xl uppercase tracking-tighter">No results found</p>
                    <button 
                        onClick={handleRefresh}
                        className="mt-6 text-orange-500 font-black uppercase tracking-widest text-xs hover:underline"
                    >
                        Try Refreshing Feed
                    </button>
                </div>
            )}
        </div>
    );
};
