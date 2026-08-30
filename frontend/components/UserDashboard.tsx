import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { Project } from '../types';
import { fetchRecommendations, fetchResearchSessions, fetchCollections, fetchProjectNotes, fetchSearchHistory } from '../services/apiService';
import { LayoutDashboard, Star, Code2, TrendingUp, Clock, Settings, Search, Sparkles, Heart, ExternalLink, LogOut, Github, History } from 'lucide-react';

interface UserDashboardProps {
  user: User;
  savedProjects: Project[];
  onNavigateToDiscover: () => void;
  onSearch?: (query: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, savedProjects, onNavigateToDiscover, onSearch }) => {
  const [recommendations, setRecommendations] = React.useState<any[]>([]);
  const [researchSessions, setResearchSessions] = React.useState<any[]>([]);
  const [collections, setCollections] = React.useState<any[]>([]);
  const [notes, setNotes] = React.useState<any[]>([]);
  const [searchHistory, setSearchHistory] = React.useState<any[]>([]);
  React.useEffect(() => {
    const token = localStorage.getItem('project-finder-token');
    if (!token) return;
    fetchRecommendations(token).then(data => setRecommendations(data.recommendations || [])).catch(() => {});
    fetchResearchSessions(token).then(data => setResearchSessions(data || [])).catch(() => {});
    fetchCollections(token).then(data => setCollections(data || [])).catch(() => {});
    fetchProjectNotes(token).then(data => setNotes(data || [])).catch(() => {});
    fetchSearchHistory(token).then(data => setSearchHistory(data || [])).catch(() => {});
  }, []);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 md:px-6 pt-32 md:pt-40 pb-20"
    >
      {/* Header Profile Section */}
      <motion.div variants={itemVariants} className="glass-card p-8 md:p-12 rounded-[3rem] mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20" />
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}`}
                alt="Profile"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/20 shadow-2xl relative z-10 object-cover"
              />
            </div>
            <div className="text-center md:text-left space-y-3">
              <div className="inline-flex px-3 py-1 bg-white/5 rounded-full border border-white/10 items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Active</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase uppercase">{user.displayName || 'Google User'}</h1>
              <p className="text-gray-400 font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={async () => {
                const { auth } = await import('../services/firebase');
                const { signOut } = await import('firebase/auth');
                if (auth) {
                  await signOut(auth);
                  localStorage.removeItem('project-finder-token');
                  localStorage.removeItem('project-finder-user');
                  localStorage.removeItem('project-finder-favorites');
                  window.location.reload();
                }
              }}
              className="px-6 py-3 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              SIGN OUT
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Col: Saved Projects */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Saved Projects Hub */}
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[3rem]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-orange-500 fill-orange-500/20" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Saved Projects</h2>
              </div>
              <button onClick={onNavigateToDiscover} className="text-xs font-black text-orange-500 hover:text-orange-400 uppercase tracking-widest">
                Discover More
              </button>
            </div>

            <div className="space-y-4">
              {savedProjects.length > 0 ? (
                savedProjects.map((project, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                    <div className="p-3 bg-orange-600/10 rounded-xl group-hover:bg-orange-600/20">
                      <Heart className="w-5 h-5 text-orange-500 fill-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate text-sm">{project.name}</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                        {project.platform} • {project.tags[0] || 'Code'}
                      </p>
                    </div>
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-6 border border-dashed border-white/10 rounded-3xl">
                  <Heart className="w-8 h-8 text-white/20 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">You haven't saved any projects yet.</p>
                  <button onClick={onNavigateToDiscover} className="mt-4 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest transition-all">
                    Start Exploring
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Col: Smart Analytics */}
        <div className="lg:col-span-2 space-y-8">
          
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[3rem]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Github className="w-5 h-5 text-gray-300" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Integrations</h2>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all shadow-[0_5px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_5px_25px_rgba(255,255,255,0.25)]">
              <Github className="w-4 h-4" />
              Sync with GitHub
            </button>
            <p className="text-[10px] text-center text-gray-500 mt-4 leading-relaxed px-4">Connect your GitHub to automatically import your starred repos and tech stack.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[3rem] h-full">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">AI Insights</h2>
            </div>
            
            <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 mb-8">
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-3">AI Recommendation</p>
              {recommendations.length > 0 ? <div className="space-y-3">{recommendations.slice(0, 3).map((item, index) => <div key={index}><p className="text-xs text-white font-bold">{item.repository?.owner}/{item.repository?.name}</p><p className="text-[10px] text-gray-400">{item.reasons?.[0] || 'Matches your saved projects'}</p></div>)}</div> : <p className="text-[11px] text-gray-400 leading-relaxed italic">Save projects to receive evidence-based recommendations.</p>}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <History className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-tighter">Recent Searches</h3>
            </div>
            {searchHistory.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 8).map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => onSearch && onSearch(item.query)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-lg text-xs text-gray-300 transition-all text-left"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500 italic">Your recent searches will appear here.</p>
            )}
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};
