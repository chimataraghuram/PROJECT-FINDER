import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Github, ExternalLink, Star, Code, Terminal, Zap, Gamepad2, Heart, Palette, Image as ImageIcon, Sparkles, UserPlus, Gift, Box, GitBranch, Loader2, Award, ShieldCheck, X, Flame } from 'lucide-react';
import { Project } from '../types';
import { searchGitHubReadmes, fetchGitHubUserProfile, searchGitHubUsers } from '../services/apiService';
import { README_PROFILES } from '../data/readmeData';

interface ReadmeDiscoveryProps {
    favorites: Project[];
    onToggleFavorite: (project: Project) => void;
    isCompact?: boolean;
    labels?: any;
}

const CATEGORIES = [
    { name: 'All', icon: <Sparkles size={14} /> },
    { name: 'Minimal', emoji: '✨' },
    { name: 'Animated', emoji: '🚀' },
    { name: 'Dynamic', emoji: '⚡' },
    { name: 'Code', emoji: '💻' },
    { name: 'Creative', emoji: '🎨' },
    { name: 'Developer', emoji: '👩‍💻' },
];

const Toast: React.FC<{ message: string; isVisible: boolean }> = ({ message, isVisible }) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 50, x: '-50%' }}
                className="fixed bottom-10 left-1/2 z-[2000] bg-gray-900 border border-orange-500/30 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3"
            >
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <Zap size={12} className="text-white" />
                </div>
                <span className="text-white font-black uppercase tracking-widest text-[10px]">{message}</span>
            </motion.div>
        )}
    </AnimatePresence>
);

const ReadmePreviewModal: React.FC<{ isOpen: boolean; onClose: () => void; profile: any; onCopy: () => void }> = ({ isOpen, onClose, profile, onCopy }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="relative w-full max-w-4xl bg-[#0f172a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                    <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <img 
                                src={profile.image || profile.avatarUrl || `https://github.com/${profile.username}.png`} 
                                className="w-12 h-12 rounded-full border-2 border-orange-500/50" 
                                alt="" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://github.com/${profile.username}.png`;
                                }}
                            />
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{profile.title || profile.name}</h3>
                                <p className="text-xs font-bold text-gray-500 italic">By @{profile.username}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/10 transition-colors text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                        <div className="bg-black/40 rounded-3xl overflow-hidden border border-white/5 aspect-video flex items-center justify-center relative group">
                            <img 
                                src={profile.image} 
                                className="w-full h-full object-cover" 
                                alt="Preview" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://github.com/${profile.username}.png`;
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <section>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">README Content Preview</h4>
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-gray-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                        {profile.readme || 'No content available'}
                                    </div>
                                </section>
                            </div>
                            <div className="space-y-6 text-xs">
                                <div>
                                    <h4 className="font-black uppercase tracking-widest text-white/40 mb-3">Attributes</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-gray-500 font-bold uppercase">Difficulty</span>
                                            <span className="text-orange-500 font-black">{profile.difficulty || 'Medium'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-gray-500 font-bold uppercase">Best For</span>
                                            <span className="text-blue-400 font-black">{profile.bestFor || 'Portfolio'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-orange-600/10 border border-orange-500/20 rounded-2xl">
                                    <h4 className="font-black text-orange-500 uppercase tracking-widest mb-3">Target</h4>
                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                        Perfect for {profile.bestFor?.toLowerCase()} looking for a {profile.difficulty?.toLowerCase()} to implement design.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white/5 border-t border-white/10 flex items-center gap-4">
                        <button 
                            onClick={onCopy}
                            className="flex-1 py-4 bg-orange-600 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-lg flex items-center justify-center gap-3"
                        >
                            <Code size={16} /> Copy Markdown
                        </button>
                        <a 
                            href={profile.github}
                            target="_blank"
                            rel="noreferrer"
                            className="px-8 py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                        >
                            <Github size={16} /> Open Repo
                        </a>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const ReadmeCard: React.FC<{ profile: any; index: number; isFeatured?: boolean; isFavorite: boolean; onToggleFavorite: (p: Project) => void; onPreview: (p: any) => void; onCopy: (text: string) => void }> = ({ profile, index, isFeatured, isFavorite, onToggleFavorite, onPreview, onCopy }) => {
    const projectData: Project = {
        name: profile.username || profile.title,
        description: profile.readme?.slice(0, 100) || 'GitHub Profile README',
        platform: 'GitHub',
        url: profile.github || `https://github.com/${profile.username}`,
        tags: profile.category || ['Profile'],
        type: 'readme'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            className={`group relative w-full ${isFeatured ? 'md:col-span-2' : ''}`}
        >
            <div className={`absolute -inset-1 bg-gradient-to-br ${isFeatured ? 'from-orange-500 to-red-600' : 'from-gray-800 to-gray-900'} rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500`}></div>
            <div className={`relative h-full bg-[#0a0f1d] border ${isFeatured ? 'border-orange-500/30' : 'border-white/10'} rounded-[2.5rem] overflow-hidden hover:border-orange-500/50 transition-all duration-500 flex flex-col shadow-2xl`}>
                
                {/* Visual Preview */}
                <div className="relative aspect-video overflow-hidden group/img">
                    <img 
                        src={profile.image} 
                        alt={profile.title} 
                        className="w-full h-full object-cover transform group-hover/img:scale-110 transition-transform duration-1000" 
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://github.com/${profile.username}.png`;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/20 to-transparent" />
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                            profile.difficulty === 'Easy' ? 'bg-green-500' : profile.difficulty === 'Medium' ? 'bg-orange-500' : 'bg-red-500'
                        } text-white shadow-lg`}>
                            {profile.difficulty}
                        </span>
                    </div>

                    <button 
                        onClick={() => onToggleFavorite(projectData)}
                        className={`absolute top-4 right-4 p-2.5 rounded-xl border transition-all duration-500 ${isFavorite ? 'bg-orange-600 border-orange-400 text-white shadow-lg' : 'bg-[#0f172a]/80 backdrop-blur-md border-white/10 text-white hover:bg-orange-600 hover:border-orange-500'}`}
                    >
                        <Heart size={14} className={isFavorite ? 'fill-white' : ''} />
                    </button>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-1 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {profile.category.map((cat: string) => (
                                <span key={cat} className="text-[8px] font-black text-orange-500 uppercase tracking-[0.2em]">{cat}</span>
                            ))}
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white leading-tight uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                            {profile.title}
                        </h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">By @{profile.username}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                            <Zap size={10} className="text-orange-500" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{profile.bestFor}</span>
                        </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => onPreview(profile)}
                                className="py-3.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                            >
                                <ImageIcon size={14} /> Preview
                            </button>
                            <button 
                                onClick={() => onCopy(profile.readme)}
                                className="py-3.5 rounded-2xl bg-[#1e293b] border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:border-orange-500/50 hover:bg-[#1e293b]/80 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                            >
                                <Code size={14} /> Copy
                            </button>
                        </div>
                        <a 
                            href={profile.github}
                            target="_blank"
                            rel="noreferrer"
                            className="py-3.5 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Github size={14} /> View GitHub Repo
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const ReadmeDiscovery: React.FC<ReadmeDiscoveryProps> = ({ favorites, onToggleFavorite, isCompact, labels }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [profiles, setProfiles] = useState<any[]>(README_PROFILES);
    const [isLoading, setIsLoading] = useState(false);
    const [previewProfile, setPreviewProfile] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleCopyMarkdown = (text: string) => {
        navigator.clipboard.writeText(text);
        setToastMessage('Copied to clipboard ✅');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.trim() || selectedCategory !== 'All') {
                setIsLoading(true);
                try {
                    let results: any[] = [];
                    if (searchQuery.trim()) {
                        results = await searchGitHubUsers(searchQuery);
                    } else {
                        // Filter curated data first
                        const filteredCurated = README_PROFILES.filter(p => p.category.includes(selectedCategory));
                        if (filteredCurated.length > 0) {
                            results = filteredCurated;
                        } else {
                            results = await searchGitHubReadmes(selectedCategory);
                        }
                    }
                    setProfiles(results);
                } catch (error) {
                    console.error('Fetch error:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setProfiles(README_PROFILES);
            }
        };

        const timer = setTimeout(() => {
            fetchResults();
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery]);

    const featuredProfiles = profiles.filter(p => p.isFeatured);
    const regularProfiles = profiles.filter(p => !p.isFeatured);

    return (
        <div className="pt-32 pb-20 md:pt-40 px-4 max-w-7xl mx-auto min-h-screen relative z-10">
            <Toast message={toastMessage} isVisible={showToast} />
            <ReadmePreviewModal 
                isOpen={!!previewProfile} 
                onClose={() => setPreviewProfile(null)} 
                profile={previewProfile} 
                onCopy={() => handleCopyMarkdown(previewProfile?.readme)}
            />

            <div className="text-center mb-16">
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-400 via-white to-red-500 text-transparent bg-clip-text tracking-tighter"
                >
                    README Profiles
                </motion.h1>
                <p className="text-gray-400 font-bold text-lg md:text-xl max-w-2xl mx-auto opacity-60">
                    Explore beautiful GitHub profile designs
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar max-w-5xl mx-auto">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory(cat.name);
                        }}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 border ${
                            selectedCategory === cat.name
                            ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_30px_rgba(249,115,22,0.5)] scale-105'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-orange-500/30 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        {cat.emoji && <span className="text-xl leading-none">{cat.emoji}</span>}
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-20 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] flex items-center p-3 focus-within:border-orange-500/50 transition-all shadow-2xl">
                    <Search className="ml-6 text-orange-500 w-6 h-6" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for more profiles..."
                        className="w-full bg-transparent px-6 py-6 text-lg text-white font-bold focus:outline-none placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Featured Section */}
            {!searchQuery && featuredProfiles.length > 0 && (
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-10">
                        <Flame className="text-orange-500" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            {selectedCategory === 'All' ? '🔥 Featured Profiles' : `🔥 Featured ${selectedCategory}s`}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                        {featuredProfiles.map((profile, i) => (
                            <ReadmeCard 
                                key={profile.id || profile.url} 
                                profile={profile} 
                                index={i} 
                                isFeatured
                                isFavorite={favorites.some(f => f.url === (profile.github || profile.url))}
                                onToggleFavorite={onToggleFavorite}
                                onPreview={setPreviewProfile}
                                onCopy={handleCopyMarkdown}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                <AnimatePresence mode='popLayout'>
                    {isLoading ? (
                        <div className="col-span-full py-32 flex flex-col items-center gap-6">
                            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                            <p className="text-gray-500 font-black text-xl uppercase tracking-tighter">
                                Exploring the GitHub galaxy...
                            </p>
                        </div>
                    ) : (
                        regularProfiles.map((profile, i) => (
                            <ReadmeCard 
                                key={profile.id || profile.url} 
                                profile={profile} 
                                index={i} 
                                isFavorite={favorites.some(f => f.url === (profile.github || profile.url))}
                                onToggleFavorite={onToggleFavorite}
                                onPreview={setPreviewProfile}
                                onCopy={handleCopyMarkdown}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {!isLoading && profiles.length === 0 && (
                <div className="text-center py-32">
                    <Sparkles className="mx-auto text-gray-700 w-16 h-16 mb-6 opacity-20" />
                    <p className="text-gray-600 font-black text-2xl md:text-3xl uppercase tracking-tighter">No live results found.</p>
                </div>
            )}

            <div className="mt-32 text-center opacity-40">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Profiles sourced from GitHub and open platforms</p>
            </div>
        </div>
    );
};
