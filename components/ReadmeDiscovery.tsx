import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Github, ExternalLink, Star, Code, Terminal, Zap, Gamepad2, Heart, Palette, Image as ImageIcon, Sparkles, UserPlus, Gift, Box, GitBranch, Loader2, Award, ShieldCheck } from 'lucide-react';
import { Project } from '../types';
import { searchGitHubReadmes, fetchGitHubUserProfile } from '../services/apiService';

interface ReadmeDiscoveryProps {
    favorites: Project[];
    onToggleFavorite: (project: Project) => void;
    isCompact?: boolean;
    labels?: any;
}

const CATEGORIES = [
    { name: 'All', icon: <Sparkles size={14} /> },
    { name: 'Github Actions', emoji: '🤖' },
    { name: 'Game Mode', emoji: '🚀' },
    { name: 'Code Mode', emoji: '👩‍💻' },
    { name: 'Dynamic Realtime', emoji: '💫' },
    { name: 'Minimalistic', emoji: '✨' },
    { name: 'GIFS', emoji: '🦄' },
    { name: 'Anime', emoji: '👾' },
    { name: 'Retro', emoji: '😎' },
];

const ReadmeCard: React.FC<{ profile: any; index: number; isFeatured?: boolean; isFavorite: boolean; onToggleFavorite: (p: Project) => void }> = ({ profile, index, isFeatured, isFavorite, onToggleFavorite }) => {
    const starsLabel = typeof profile.stars === 'number' ? (profile.stars > 1000 ? (profile.stars / 1000).toFixed(1) + 'k' : profile.stars.toString()) : profile.stars;

    const projectData: Project = {
        name: profile.username || profile.name,
        description: profile.bio || profile.description || 'GitHub Profile README',
        platform: 'GitHub',
        url: profile.url || `https://github.com/${profile.username || profile.name}`,
        tags: profile.tags || ['Profile'],
        stars: profile.stars,
        type: 'readme'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative w-full ${isFeatured ? 'md:col-span-2' : ''}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${isFeatured ? 'from-orange-500/20 to-red-600/20' : 'from-orange-500/10 to-red-600/10'} rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
            <div className={`relative bg-white/5 backdrop-blur-3xl border ${isFeatured ? 'border-orange-500/30' : 'border-white/10'} rounded-[3rem] p-8 md:p-10 hover:border-orange-500/50 transition-all duration-700 flex flex-col gap-8 overflow-hidden`}>
                
                {isFeatured && (
                   <div className="absolute top-6 right-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-600/20 border border-orange-500/40 shadow-lg animate-pulse">
                        <ShieldCheck size={14} className="text-orange-500" />
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Featured Developer</span>
                   </div>
                )}

                {/* Favorite Button */}
                <button 
                    onClick={() => onToggleFavorite(projectData)}
                    className={`absolute top-6 left-10 p-3 rounded-2xl border transition-all duration-500 ${isFavorite ? 'bg-orange-600 border-orange-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10'}`}
                >
                    <Heart size={18} className={isFavorite ? 'fill-white' : ''} />
                </button>

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left pt-6">
                    <div className="relative flex-shrink-0">
                        <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 ${isFeatured ? 'border-orange-500/40' : 'border-white/10'} overflow-hidden shadow-2xl group-hover:border-orange-500/60 transition-colors duration-500`}>
                            <img src={profile.avatarUrl || `https://github.com/${profile.username || profile.name || 'github'}.png`} alt={profile.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 border-4 border-[#0f172a] flex items-center justify-center shadow-lg">
                            <Github size={14} className="text-white" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-white leading-none mb-2 uppercase tracking-tight">{profile.name || profile.username}</h3>
                                <span className={`${isFeatured ? 'text-orange-500' : 'text-gray-500'} font-bold text-sm md:text-base`}>@{profile.username || profile.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={projectData.url} target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2">
                                    <ExternalLink size={14} /> Visit Profile
                                </a>
                                <button className="px-4 py-2.5 rounded-xl bg-orange-600/10 border border-orange-500/30 text-orange-500 text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm flex items-center gap-2">
                                    <UserPlus size={14} /> Follow
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-gray-400">
                            <div className="flex items-center gap-1.5"><Heart size={12} className="text-red-500" /> <span className="text-white">{profile.followers || '1k+'}</span> followers</div>
                            <div className="flex items-center gap-1.5"><Star size={12} className="text-yellow-500 fill-yellow-500" /> <span className="text-white">{starsLabel || '500+'}</span> stars</div>
                            <div className="flex items-center gap-1.5"><Award size={12} className="text-blue-500" /> <span className="text-white">Pro</span></div>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 bg-white/5 rounded-3xl border border-white/5 relative">
                    <h4 className="text-xl md:text-2xl font-black text-white mb-4 bg-gradient-to-r from-white to-gray-500 text-transparent bg-clip-text">
                        {profile.heroTitle || `Hi there! I'm ${profile.name || profile.username} 👋`}
                    </h4>
                    <p className="text-gray-400 text-sm md:text-md leading-relaxed mb-6 font-medium">
                        {profile.bio || profile.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {(profile.tags || []).slice(0, 5).map((tag: string) => (
                            <span key={tag} className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-black uppercase tracking-widest">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {profile.pinnedRepos && profile.pinnedRepos.length > 0 && (
                   <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Box size={16} className="text-white/40" />
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40">Pinned Repositories</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profile.pinnedRepos.map((repo: any, i: number) => (
                                <div key={i} className="p-5 bg-[#0f172a]/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <GitBranch size={14} className="text-blue-400" />
                                            <h5 className="text-sm font-black text-white hover:text-orange-500 cursor-pointer">{repo.name}</h5>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-bold text-gray-500">{repo.stars}</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-1 mb-3">{repo.description}</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full bg-orange-500`}></div>
                                        <span className="text-[10px] font-bold text-gray-600">{repo.language}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export const ReadmeDiscovery: React.FC<ReadmeDiscoveryProps> = ({ favorites, onToggleFavorite, isCompact, labels }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [profiles, setProfiles] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [spotlightProfile, setSpotlightProfile] = useState<any>(null);

    useEffect(() => {
        const loadSpotlight = async () => {
            const data = await fetchGitHubUserProfile('chimataraghuram');
            if (data) {
                setSpotlightProfile({
                    username: data.login,
                    name: data.name || data.login,
                    bio: data.bio || 'Full-stack developer and creator of Project Finder.',
                    followers: data.followers > 1000 ? (data.followers/1000).toFixed(1) + 'k' : data.followers.toString(),
                    following: data.following.toString(),
                    stars: data.public_repos * 10, // heuristic
                    avatarUrl: data.avatar_url,
                    url: data.html_url,
                    heroTitle: "Building the Future of Discovery 🚀",
                    tags: ['Founder', 'Full-Stack', 'UI/UX', 'Project Finder'],
                    pinnedRepos: [
                        { name: 'PROJECT-FINDER', description: 'The ultimate project discovery engine.', language: 'TypeScript', stars: '2.1k' },
                        { name: 'OpenClaw', description: 'Personal AI assistant ecosystem.', language: 'Python', stars: '210k' }
                    ]
                });
            }
        };
        loadSpotlight();
    }, []);

    useEffect(() => {
        const fetchReadmes = async () => {
            setIsLoading(true);
            try {
                const results = await searchGitHubReadmes(selectedCategory);
                setProfiles(results);
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReadmes();
    }, [selectedCategory]);

    const filtered = profiles.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pt-32 pb-20 md:pt-40 px-4 max-w-7xl mx-auto min-h-screen relative z-10">
            <div className="text-center mb-16">
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={labels?.profiles}
                    className="text-4xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-400 via-white to-red-500 text-transparent bg-clip-text tracking-tighter transition-all duration-500"
                >
                    {labels?.profiles || 'GitHub README Profiles'}
                </motion.h1>
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Live Data Sync Active</span>
                </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar max-w-5xl mx-auto">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
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
                        placeholder="Search Nickname or Username..."
                        className="w-full bg-transparent px-6 py-6 text-lg text-white font-bold focus:outline-none placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Results Grid - Featured first, then rest */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                <AnimatePresence mode='popLayout'>
                    {selectedCategory === 'All' && !searchQuery && spotlightProfile && (
                        <ReadmeCard 
                            profile={spotlightProfile} 
                            index={0} 
                            isFeatured 
                            isFavorite={favorites.some(f => f.url === spotlightProfile.url)}
                            onToggleFavorite={onToggleFavorite}
                        />
                    )}

                    {isLoading ? (
                        <div className="md:col-span-2 py-32 flex flex-col items-center gap-6">
                            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                            <p className="text-gray-500 font-black text-xl uppercase tracking-tighter">Syncing real-time GitHub profiles...</p>
                        </div>
                    ) : (
                        filtered.map((profile, i) => (
                            <ReadmeCard 
                                key={profile.url} 
                                profile={profile} 
                                index={i + 1} 
                                isFavorite={favorites.some(f => f.url === profile.url)}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {!isLoading && filtered.length === 0 && (
                <div className="text-center py-32">
                    <Sparkles className="mx-auto text-gray-700 w-16 h-16 mb-6 opacity-20" />
                    <p className="text-gray-600 font-black text-2xl md:text-3xl uppercase tracking-tighter">No live results found for your query.</p>
                </div>
            )}
        </div>
    );
};
