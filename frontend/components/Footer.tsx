import React from 'react';
import { Github, Linkedin, Send, MessageCircle, ExternalLink, Sparkles, Search, BookOpen, Globe, Heart, Layout, FileCode, User, Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { openSafe } from '../src/utils/urlHelper';
import mascotLogo from '../src/assets/logos/logo_final_v6.png';

interface FooterProps {
    onComingSoonClick: (e: React.MouseEvent) => void;
    isCompact?: boolean;
    labels?: any;
}

export const Footer: React.FC<FooterProps> = ({ onComingSoonClick, isCompact, labels }) => {
    const currentYear = new Date().getFullYear();
    const activeLabels = labels || { discover: "Search Projects", trending: "Trending Projects", saved: "Starred" };

    return (
        <footer className="relative mt-16 pb-16 overflow-hidden border-t border-white/5 bg-[#0f172a]/40 backdrop-blur-md">
            {/* Background elements - Subtle glows to enhance but not hide particles */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-orange-600/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -right-20 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 pt-16 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-20 mb-4">

                    {/* Pillar 1: Innovation Architecture (5 columns) */}
                    <div className="lg:col-span-5 flex flex-col items-start gap-10">
                        <div
                            className="flex items-center gap-5 group cursor-pointer inline-flex"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative bg-white/5 p-1 rounded-2xl shadow-2xl border border-white/10 transform group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500 overflow-hidden">
                                    <img src={mascotLogo} className="w-14 h-14 object-cover rounded-xl" alt="Mascot Logo" />
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative flex items-center justify-center w-14 h-14 bg-white/5 p-1 rounded-2xl shadow-2xl border border-white/10 transform group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500 overflow-hidden">
                                    <Search className="w-6 h-6 text-orange-500" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="flex flex-col select-none">
                                <span className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-200 via-white to-orange-400 tracking-tighter">
                                    {isCompact ? 'Project Finder' : 'Project Finder'}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-[2px] w-8 bg-orange-500 rounded-full" />
                                    <span className="text-[11px] uppercase tracking-[0.4em] text-orange-400 font-black">Innovation Engine</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2.5 text-white/90 font-black text-xs uppercase tracking-[0.2em] opacity-60">
                                <div className="w-1 h-4 bg-orange-500 rounded-full" />
                                About the Platform
                            </h4>
                            <div className="space-y-4">
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg font-medium transition-all duration-500">
                                    Techboy Project Finder is an AI-powered discovery workspace for real open-source projects. It combines GitHub-first search, live trending data, personalized history, saved collections, and TECHBOY AI research in one place.
                                </p>
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-lg font-medium transition-all duration-500">
                                    Use <span className="text-white font-bold underline decoration-orange-500/40 underline-offset-4">{activeLabels.discover}</span> to find real repositories across platforms, then refine results by stars, language, date, and source. Visit <span className="text-white font-bold underline decoration-blue-500/40 underline-offset-4 font-black">{activeLabels.trending}</span> for live GitHub trends updated every minute.
                                </p>
                            </div>

                            {/* Core Steps - Small Containers */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
                                {[
                                    { icon: <Search className="w-4 h-4" />, title: activeLabels.discover, desc: "Cross-platform search." },
                                    { icon: <Flame className="w-4 h-4" />, title: activeLabels.trending, desc: "Real-time tech trends." },
                                    { icon: <Star className="w-4 h-4" />, title: activeLabels.saved, desc: "Organize collections." }
                                ].map((step, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-orange-500/20 transition-all group overflow-hidden relative">
                                        <div className="absolute -right-2 -top-2 w-8 h-8 bg-orange-500/5 blur-xl group-hover:bg-orange-500/10 transition-colors" />
                                        <div className="text-orange-500 mb-2 group-hover:scale-110 transition-transform relative z-10">{step.icon}</div>
                                        <h5 className="text-white font-black uppercase text-[10px] tracking-wider mb-1 relative z-10">{step.title}</h5>
                                        <p className="text-gray-500 text-[9px] leading-tight font-medium relative z-10">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <a
                                href="https://github.com/chimataraghuram/PROJECT-FINDER"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openSafe("https://github.com/chimataraghuram/PROJECT-FINDER");
                                }}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/40 text-gray-400 hover:text-white transition-all duration-300 group shadow-2xl hover:bg-white/10"
                            >
                                <Github className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
                                <span className="font-black text-sm uppercase tracking-widest">Explore Source Code</span>
                                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </a>
                        </div>
                    </div>

                    {/* Pillar 2: Evolution Protocols (3 columns) */}
                    <div className="lg:col-span-3 space-y-10">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-lg">
                                <BookOpen className="w-5 h-5 text-orange-400" />
                            </div>
                            <h3 className="text-white font-black text-xl tracking-tight uppercase tracking-widest">How to use this project</h3>
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: "1. Search Globally", desc: "Search a technology or idea. GitHub projects appear first, with filters for stars, language, platform, and recent activity." },
                                { title: "2. Explore Trends", desc: "Open Trending Projects to browse real GitHub repositories and live activity refreshed every minute." },
                                { title: "3. Save & Research", desc: "Star projects, organize them into named collections, revisit your research history, and ask TECHBOY AI for grounded technical help." }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-5 group p-1">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-2xl bg-[#0f172a]/40 text-orange-400 text-sm flex items-center justify-center font-black border border-white/10 group-hover:border-orange-500/50 group-hover:text-white transition-all duration-500 shadow-xl">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="space-y-1 py-1">
                                        <h4 className="text-gray-200 font-black text-[10px] tracking-[0.15em] uppercase transition-colors group-hover:text-orange-400">{step.title}</h4>
                                        <p className="text-gray-500 text-xs leading-snug group-hover:text-gray-400 transition-colors font-medium">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pillar 3: Architect Nexus (4 columns) */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-lg">
                                <User className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-white font-black text-xl tracking-tight uppercase tracking-widest">Developer</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Architect Card */}
                            <div className="p-6 md:p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-500 group relative overflow-hidden shadow-2xl">
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.25em]">Lead</span>
                                </div>
                                <h4 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tighter transition-colors group-hover:text-orange-100">Chimata Raghuram</h4>
                                <p className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.2em] mb-8 group-hover:text-orange-400 transition-colors">Full Stack AI Developer</p>
                                
                                <div className="grid grid-cols-1 gap-3 relative z-10">
                                    <motion.a 
                                        href="https://github.com/chimataraghuram"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          openSafe("https://github.com/chimataraghuram");
                                        }}
                                        target="_blank"
                                        rel="noreferrer"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className="flex items-center justify-center gap-3 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-gray-100 transition-colors"
                                    >
                                        Visit GitHub <Github size={16} />
                                    </motion.a>
                                    <motion.a 
                                        href="https://linkedin.com/in/chimataraghuram"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          openSafe("https://linkedin.com/in/chimataraghuram");
                                        }}
                                        target="_blank"
                                        rel="noreferrer"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className="flex items-center justify-center gap-3 py-4 bg-orange-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 hover:bg-orange-500 transition-colors"
                                    >
                                        Visit LinkedIn <Linkedin size={16} />
                                    </motion.a>
                                </div>
                            </div>

                            {/* Portfolio Mini Card */}
                            <motion.a 
                                href="https://chimataraghuram.vercel.app/"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openSafe("https://chimataraghuram.vercel.app/");
                                }}
                                target="_blank"
                                rel="noreferrer"
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="flex items-center justify-between p-6 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-500 group shadow-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1 group-hover:text-blue-200">Portfolio</h5>
                                        <p className="text-[9px] text-blue-500/60 font-black uppercase tracking-widest">Personal Site</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ExternalLink size={16} />
                                </div>
                            </motion.a>

                            {/* Social Media Pill Buttons - Minimal and Centered */}
                            <div className="flex flex-col items-center gap-6 pt-10 border-t border-white/5 w-full mt-10">
                                <div className="flex items-center gap-4">
                                    {[
                                        { icon: <Linkedin size={18} />, url: 'https://linkedin.com/in/chimataraghuram', label: 'LinkedIn' },
                                        { icon: <Github size={18} />, url: 'https://github.com/chimataraghuram', label: 'GitHub' },
                                        { icon: <Globe size={18} />, url: 'https://chimataraghuram.vercel.app/', label: 'Portfolio' },
                                        { icon: <Send size={18} />, url: 'https://t.me/raghu', label: 'Telegram' }
                                    ].map((social, idx) => (
                                        <motion.a
                                            key={idx}
                                            href={social.url}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              openSafe(social.url);
                                            }}
                                            target="_blank"
                                            rel="noreferrer"
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            className="group flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:border-orange-500/40 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-orange-500/10"
                                        >
                                            {social.icon}
                                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{social.label}</span>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom Bar - Unified */}
                <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-4">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest opacity-40">
                                © {currentYear} Techboy Project Finder
                            </p>
                            <div className="w-1 h-1 rounded-full bg-gray-800" />
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                COOKED BY <span className="text-white">TECHBOY RAGHU</span> <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {['React', 'Vite', 'Tailwind', 'Firebase'].map(tech => (
                            <span key={tech} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-800 hover:text-orange-500/30 transition-colors pointer-events-none">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};
