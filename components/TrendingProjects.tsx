import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Github, ExternalLink, RefreshCw, Flame, User, Globe, Code, Search, Rocket, Shield, Brain, Share2, BarChart3, Database, Linkedin, Bot, Heart } from 'lucide-react';
import { Project } from '../types';
import { fetchTrendingProjects } from '../services/apiService';

interface TrendingProjectsProps {
    favorites: Project[];
    onToggleFavorite: (project: Project) => void;
    onToggleComparison: (project: Project) => void;
    comparisonQueue: Project[];
    onSummarize: (projectName: string) => void;
}

const TrendingBadge = () => (
    <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-md">
            <Flame size={12} className="text-orange-500 animate-pulse" />
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider">Trending</span>
        </div>
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
        <div className="absolute top-4 left-4 z-10">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl backdrop-blur-md border ${
                isTop3 
                ? `bg-gradient-to-br ${colors[rank-1]} border-white/20 shadow-lg` 
                : 'bg-white/5 border-white/10'
            }`}>
                <span className={`text-xs font-black ${isTop3 ? 'text-white' : 'text-gray-400'}`}>
                    #{rank}
                </span>
            </div>
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
        if (platform.includes('hugging')) return { label: 'View Model', icon: Bot, color: 'text-yellow-400' };
        if (platform.includes('kaggle')) return { label: 'View Dataset', icon: Database, color: 'text-blue-400' };
        if (platform.includes('linkedin')) return { label: 'View Post', icon: Linkedin, color: 'text-blue-600' };
        return { label: 'View Project', icon: Github, color: 'text-white' };
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
            className={`group relative bg-[#020617]/40 backdrop-blur-3xl border ${isComparing ? 'border-orange-500/50' : 'border-white/5'} hover:border-orange-500/40 rounded-[2.5rem] p-8 transition-colors duration-500 flex flex-col h-full shadow-2xl overflow-hidden`}
        >
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 via-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            {isComparing && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-orange-500/[0.03] animate-pulse pointer-events-none"
                />
            )}

            <RankBadge rank={rank} />
            <TrendingBadge />
            
            {/* Action Icon Bar */}
            <div className="flex justify-end gap-2 mb-4 relative z-30">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all text-gray-400 hover:text-blue-400"
                title="Security Status"
              >
                <Shield size={14} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSummarize(); }}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-orange-500/10 hover:border-orange-500/20 transition-all text-gray-400 hover:text-orange-500"
                title="AI Summary"
              >
                <Brain size={14} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(project.url); }}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-green-500/10 hover:border-green-500/20 transition-all text-gray-400 hover:text-green-500"
                title="Share Link"
              >
                <Share2 size={14} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
                className={`p-2.5 rounded-xl border transition-all ${
                  isFavorite 
                  ? 'bg-red-500/20 border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500'
                }`}
                title="Save"
              >
                <Heart size={14} fill={isFavorite ? "currentColor" : "none"} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCompare(); }}
                className={`p-2.5 rounded-xl border transition-all ${
                  isComparing
                  ? 'bg-orange-500/20 border-orange-500/30 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-purple-500/10 hover:border-purple-500/20 hover:text-purple-500'
                }`}
                title="Compare"
              >
                <BarChart3 size={14} />
              </motion.button>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-4 mb-8 relative z-20">
                <a 
                    href={project.owner?.html_url || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="relative group/avatar"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img 
                        src={project.owner?.avatar_url || 'https://github.com/identicons/google.png'} 
                        alt={project.owner?.login} 
                        className="w-12 h-12 rounded-xl border border-white/10 group-hover/avatar:border-orange-500/50 transition-all duration-500 shadow-xl"
                    />
                </a>
                <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">By Author</p>
                    <a 
                        href={project.owner?.html_url || '#'} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-bold text-white hover:text-orange-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        @{project.owner?.login || 'unknown'}
                    </a>
                </div>
            </div>

            {/* Content Area - Fixed heights for stability */}
            <div className="flex-1 relative z-20">
                <h3 className="text-xl font-black text-white mb-4 group-hover:text-orange-400 transition-colors line-clamp-1 tracking-tight">
                    {project.name}
                </h3>
                <div className="min-h-[50px]">
                    <p className="text-gray-400 font-medium text-[13px] leading-relaxed mb-6 line-clamp-3 opacity-70 group-hover:opacity-100 transition-opacity">
                        {project.description || 'Discover this amazing open-source contribution across platform.'}
                    </p>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto space-y-5 relative z-20">
                <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags?.slice(0, 3).map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-gray-400 uppercase tracking-wider group-hover:bg-white/10 transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className={`grid ${project.liveUrl ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}>
                    <motion.a 
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(234,88,12,0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!project.url || project.url === '#') e.preventDefault();
                        }}
                        className={`group/btn py-7 rounded-[2rem] bg-gradient-to-r from-orange-600 to-orange-500 text-white text-base font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-4 shadow-xl shadow-orange-600/30 overflow-hidden relative ${project.liveUrl ? 'px-4' : 'px-8'}`}
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        <config.icon size={22} className="relative z-10" /> 
                        <span className="relative z-10">{project.liveUrl ? 'Repo' : config.label}</span>
                    </motion.a>

                    {project.liveUrl && (
                        <motion.a 
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(59,130,246,0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!project.liveUrl || project.liveUrl === '#') e.preventDefault();
                            }}
                            className="group/demo py-7 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-4 shadow-xl shadow-blue-600/30 overflow-hidden relative px-4"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/demo:translate-y-0 transition-transform duration-300" />
                            <ExternalLink size={22} className="relative z-10" /> 
                            <span className="relative z-10">Live Demo</span>
                        </motion.a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export const TrendingProjects: React.FC<TrendingProjectsProps> = ({ favorites, onToggleFavorite, onToggleComparison, comparisonQueue, onSummarize }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [activePlatform, setActivePlatform] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const PLATFORMS = ['All', 'GitHub', 'Hugging Face', 'Kaggle', 'LinkedIn'];

    const loadTrending = useCallback(async (platform = activePlatform) => {
        setLoading(true);
        const data = await fetchTrendingProjects(platform);
        setProjects(data);
        setLoading(false);
        setIsRefreshing(false);
    }, [activePlatform]);

    useEffect(() => {
        loadTrending(activePlatform);

        // Auto-refresh every 60 seconds
        const interval = setInterval(() => {
            console.log(`Auto-refreshing trending data for ${activePlatform}...`);
            loadTrending(activePlatform);
        }, 60000);

        return () => clearInterval(interval);
    }, [activePlatform, loadTrending]); // Added loadTrending to dependencies

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadTrending(activePlatform); // Ensure it uses activePlatform
    };

    const handlePlatformChange = (p: string) => {
        setActivePlatform(p);
        loadTrending(p);
    };

    const handleShare = (url: string) => {
        navigator.clipboard.writeText(url);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="pt-32 pb-20 md:pt-40 px-4 max-w-7xl mx-auto min-h-screen relative z-10">
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

            <div className="flex items-center gap-4 mb-12">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="flex items-center gap-2 px-8 py-3 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md shadow-2xl">
                    <Flame size={14} className="text-orange-500 animate-pulse" />
                    <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.3em]">Trending on {activePlatform}</span>
                    <div className="ml-2 px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/30">
                        <span className="text-[8px] font-black text-orange-500">REAL-TIME</span>
                    </div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project, index) => (
                            <TrendingCard 
                                key={project.id} 
                                project={project}
                                rank={index + 1}
                                isFavorite={favorites.some(f => f.id === project.id)}
                                isComparing={comparisonQueue.some(p => p.id === project.id)}
                                onToggle={() => onToggleFavorite(project)}
                                onCompare={() => onToggleComparison(project)}
                                onSummarize={() => onSummarize(project.name)}
                                onShare={handleShare}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {!loading && filteredProjects.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                    <Rocket size={48} className="text-gray-700 mx-auto mb-6 opacity-20" />
                    <p className="text-gray-500 font-bold text-xl uppercase tracking-tighter">No trending projects found matching your search</p>
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-6 text-orange-500 font-black uppercase tracking-widest text-xs hover:underline"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </div>
    );
};
