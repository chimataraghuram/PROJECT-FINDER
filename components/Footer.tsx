import React from 'react';
import { Github, Linkedin, Send, MessageCircle, ExternalLink, Sparkles, Search, BookOpen, Share2, Globe, Heart } from 'lucide-react';

interface FooterProps {
    onComingSoonClick: (e: React.MouseEvent) => void;
}

export const Footer: React.FC<FooterProps> = ({ onComingSoonClick }) => {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        {
            name: 'LinkedIn',
            icon: <Linkedin className="w-5 h-5" />,
            href: 'https://www.linkedin.com/in/chimataraghuram/',
            color: 'hover:text-[#0077b5]',
            borderColor: 'group-hover:border-[#0077b5]/50'
        },
        {
            name: 'GitHub',
            icon: <Github className="w-5 h-5" />,
            href: 'https://github.com/chimataraghuram',
            color: 'hover:text-white',
            borderColor: 'group-hover:border-white/50'
        },
        {
            name: 'Telegram',
            icon: <Send className="w-5 h-5" />,
            href: 'https://t.me/TechBoyStore',
            color: 'hover:text-[#0088cc]',
            borderColor: 'group-hover:border-[#0088cc]/50'
        },
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="w-5 h-5" />,
            href: 'https://whatsapp.com/channel/0029VbCayKf3GJOxi3ZvAq2A',
            color: 'hover:text-[#25D366]',
            borderColor: 'group-hover:border-[#25D366]/50'
        }
    ];

    return (
        <footer className="relative mt-20 pb-16 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.02)]" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">

                    {/* Brand & Description - 5 columns */}
                    <div className="lg:col-span-5 space-y-10">
                        <div
                            className="flex items-center gap-5 group cursor-pointer inline-flex"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-3.5 rounded-2xl shadow-2xl border border-white/20 transform group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-500">
                                    <Search className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col select-none">
                                <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-200 via-white to-orange-400 tracking-tighter filter drop-shadow-sm">
                                    Project Finder
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-[2px] w-8 bg-orange-500 rounded-full" />
                                    <span className="text-[11px] uppercase tracking-[0.4em] text-orange-400 font-black">Innovation Engine</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2.5 text-white/90 font-black text-sm uppercase tracking-[0.2em] opacity-60">
                                <div className="w-1 h-4 bg-orange-500 rounded-full" />
                                About the Platform
                            </h4>
                            <p className="text-gray-400 text-lg leading-relaxed max-w-lg font-medium">
                                Project Finder is an advanced discovery engine designed to bridge the gap between curiosity and creation. We aggregate high-quality projects, research papers, and developer resources from across the digital horizon.
                            </p>
                            <a
                                href="https://github.com/chimataraghuram/PROJECT-FINDER"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/40 text-gray-400 hover:text-white transition-all duration-300 group shadow-2xl hover:bg-white/10"
                            >
                                <Github className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
                                <span className="font-bold text-sm tracking-wide">Explore Source Code</span>
                                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </a>
                        </div>
                    </div>

                    {/* How to Use - 4 columns */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-lg">
                                <BookOpen className="w-5 h-5 text-orange-400" />
                            </div>
                            <h3 className="text-white font-black text-xl tracking-tight uppercase tracking-[0.05em]">Quick Guide</h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: 'Discover', desc: 'Find high-quality projects via global search.' },
                                { title: 'Refine', desc: 'Filter results from GitHub, Kaggle, or LinkedIn.' },
                                { title: 'Extract', desc: 'Access source code & live demos instantly.' },
                                { title: 'Insight', desc: 'Get AI summaries and technical overviews.' }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-5 group p-1">
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-orange-500 blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
                                        <div className="relative w-10 h-10 rounded-2xl bg-[#0f172a]/80 text-orange-400 text-sm flex items-center justify-center font-black border border-white/10 group-hover:border-orange-500/50 group-hover:text-white transition-all duration-500">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="space-y-1 py-1">
                                        <h4 className="text-gray-200 font-black text-xs tracking-[0.15em] uppercase transition-colors group-hover:text-orange-400">{step.title}</h4>
                                        <p className="text-gray-500 text-sm leading-snug group-hover:text-gray-400 transition-colors font-medium">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Developer Contact - 3 columns */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-lg">
                                <Sparkles className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                            </div>
                            <h3 className="text-white font-black text-xl tracking-tight uppercase tracking-[0.05em]">Architects</h3>
                        </div>

                        <div className="space-y-5">
                            {/* Architect Card */}
                            <a
                                href="https://www.linkedin.com/in/chimataraghuram/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-5 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 hover:border-orange-500/40 transition-all duration-500 group relative overflow-hidden shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1.5"
                            >
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.25em] shadow-lg">Lead</span>
                                </div>
                                <h4 className="text-2xl text-white font-black tracking-tighter relative z-10 group-hover:text-orange-100 transition-colors">
                                    Chimata Raghuram
                                </h4>
                                <p className="text-[11px] text-orange-200/50 font-bold mt-2 uppercase tracking-[0.1em] relative z-10 group-hover:text-orange-400 transition-colors">Full Stack AI Developer</p>

                                <div className="mt-6 flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-orange-500 text-white font-black text-xs uppercase tracking-[0.2em] relative z-10 shadow-xl shadow-orange-600/30 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
                                    <span>Profile</span>
                                    <Linkedin className="w-4 h-4" />
                                </div>
                            </a>

                            {/* Portfolio Card */}
                            <a
                                href="https://chimataraghuram.github.io/PORTFOLIO/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-5 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 hover:border-blue-500/40 transition-all duration-500 group relative overflow-hidden shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5"
                            >
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <span className="px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] shadow-lg">Website</span>
                                </div>
                                <h4 className="text-xl text-white font-black tracking-tight relative z-10 flex items-center gap-3 group-hover:text-blue-100 transition-colors">
                                    <Globe className="w-6 h-6 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,1)]" />
                                    Portfolio
                                </h4>

                                <div className="mt-6 flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] relative z-10 shadow-xl shadow-blue-600/30 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
                                    <span>Visit</span>
                                    <ExternalLink className="w-4 h-4" />
                                </div>
                            </a>

                            {/* Social Grid */}
                            <div className="grid grid-cols-4 gap-3 pt-2">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
                                        title={link.name}
                                    >
                                        <span className={`transition-colors text-white/50 group-hover:text-white drop-shadow-lg`}>{link.icon}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col items-center md:items-start gap-5">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <p className="text-gray-400 text-sm font-bold flex items-center gap-2">
                                © {currentYear} <span className="bg-gradient-to-r from-orange-400 to-red-400 text-transparent bg-clip-text">Project Finder</span>
                            </p>
                            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-gray-800" />
                            <a 
                                href="https://github.com/chimataraghuram"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-orange-400 hover:border-orange-500/40 transition-all group/raghu"
                            >
                                COOKED BY <span className="bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text group-hover/raghu:from-orange-400 group-hover/raghu:to-red-400 transition-all">RAGHU</span> <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                            </a>
                        </div>
                        <p className="text-[10px] text-gray-700 uppercase tracking-[0.4em] font-black opacity-60">Innovation Engine Alpha v2.0</p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                        {/* Tech Stack Pills */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {['React', 'Vite', 'Tailwind', 'Framer Motion'].map(tech => (
                                <span 
                                    key={tech} 
                                    className="px-3 py-1.5 rounded-lg bg-gray-900/40 border border-white/5 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] shadow-inner hover:text-orange-500/60 transition-colors"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                           <a
                                href="https://github.com/chimataraghuram/PROJECT-FINDER"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 hover:text-white hover:bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.1)] hover:shadow-orange-600/40 transition-all duration-500 group"
                            >
                                <Share2 className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                                <span className="font-black text-xs uppercase tracking-[0.2em]">Open Source</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
