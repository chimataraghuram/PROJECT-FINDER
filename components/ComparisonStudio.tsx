import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, ShieldCheck, Zap, Activity, ExternalLink, Bot, ArrowRight, Star, GitBranch, Terminal } from 'lucide-react';
import { Project } from '../types';

interface ComparisonStudioProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onRemoveProject: (id: string) => void;
}

export const ComparisonStudio: React.FC<ComparisonStudioProps> = ({
  isOpen,
  onClose,
  projects,
  onRemoveProject
}) => {
  if (projects.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[2000] bg-[#020617]/98 backdrop-blur-3xl p-4 md:p-8 overflow-y-auto no-scrollbar"
        >
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-black text-white tracking-widest uppercase">
                    Advanced <span className="text-blue-500">Comparison</span> Studio
                  </h2>
                  <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                    Multi-Vector Strategic Analysis
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all shadow-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comparison Matrix */}
            <div className="flex-1 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 h-full">
                {/* Labels Column (Desktop Only) */}
                <div className="hidden md:flex flex-col pt-40 space-y-12 pr-4 text-right">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Primary Focus</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Platform Identity</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Repository Pulse</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">AI Intelligence</span>
                </div>

                {/* Projects Grid */}
                {projects.map((project, idx) => (
                  <motion.div 
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative group bg-white/[0.02] border border-white/5 rounded-[3rem] p-6 md:p-8 flex flex-col hover:border-blue-500/30 transition-all duration-500 shadow-2xl"
                  >
                    <button 
                      onClick={() => onRemoveProject(project.id)}
                      className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Project Intro */}
                    <div className="text-center mb-10 h-32 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                        <Terminal className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white line-clamp-1">{project.name}</h3>
                      <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-1">{project.platform}</p>
                    </div>

                    {/* Vector Matrix Rows */}
                    <div className="space-y-10">
                      {/* Focus Vector */}
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="block md:hidden text-[8px] text-gray-600 uppercase mb-2 font-bold tracking-widest">Focus</span>
                        <div className="flex flex-wrap justify-center gap-1.5 ">
                          {project.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-tighter border border-blue-500/20 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Info Vector */}
                      <div className="text-center">
                        <span className="block md:hidden text-[8px] text-gray-600 uppercase mb-4 font-bold tracking-widest">Platform Identity</span>
                        <div className="flex items-center justify-center gap-2 mb-4">
                           <ShieldCheck className="w-4 h-4 text-green-500" />
                           <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Verified {project.platform}</span>
                        </div>
                      </div>

                      {/* Activity Vector */}
                      <div className="space-y-3">
                         <span className="block md:hidden text-[8px] text-center text-gray-600 uppercase mb-2 font-bold tracking-widest">Repository Pulse</span>
                        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5">
                           <Star className="w-3.5 h-3.5 text-yellow-500" />
                           <span className="text-xs font-black text-white">4.8k+ Stars</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5">
                           <Activity className="w-3.5 h-3.5 text-orange-500" />
                           <span className="text-xs font-black text-white">Active Dev</span>
                        </div>
                      </div>

                      {/* AI Sentiment Vector */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/20 relative overflow-hidden group/overlay">
                         <div className="absolute top-0 right-0 p-2 opacity-20"><Bot className="w-4 h-4 text-blue-400" /></div>
                         <span className="block md:hidden text-[8px] text-gray-600 uppercase mb-4 font-bold tracking-widest">AI Intelligence</span>
                         <p className="text-[10px] text-gray-300 leading-relaxed italic text-center">
                           "{project.description.slice(0, 80)}..."
                         </p>
                         <div className="mt-4 flex items-center justify-center gap-2">
                            <Zap className="w-3 h-3 text-blue-400 fill-current" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">8.9 Strategy Rank</span>
                         </div>
                      </div>
                    </div>

                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-12 w-full py-4 bg-white text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 active:scale-[0.98] transition-all shadow-xl shadow-white/5 uppercase tracking-[0.2em] text-[10px]"
                    >
                      Visit Repo <ArrowRight className="w-4 h-4" />
                    </a>
                  </motion.div>
                ))}

                {/* Placeholder for Add More */}
                {projects.length < 3 && (
                  <div className="hidden md:flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] p-8 opacity-50 hover:opacity-100 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-center">
                      Add another project <br /> to compare
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Summary */}
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {projects.map((p, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-blue-600 border-2 border-[#020617] flex items-center justify-center font-bold text-xs ring-4 ring-blue-500/10">
                         {p.name[0]}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                     <span className="block text-xs font-bold text-white uppercase tracking-widest">{projects.length} Systems Selected</span>
                     <span className="block text-[8px] text-blue-500 font-black uppercase tracking-widest mt-1 leading-none">Ready for technical deep-dive</span>
                  </div>
               </div>

               <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500/50" /> Secure Protocol
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500/50" /> Pulse Tracking
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
