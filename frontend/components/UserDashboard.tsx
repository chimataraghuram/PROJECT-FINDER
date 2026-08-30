import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { Project } from '../types';
import { fetchRecommendations, fetchResearchSessions, fetchCollections, fetchProjectNotes, fetchSearchHistory } from '../services/apiService';
import { LayoutDashboard, Star, Code2, TrendingUp, Clock, Settings, Search, Sparkles, Heart, ExternalLink, LogOut } from 'lucide-react';

interface UserDashboardProps {
  user: User;
  savedProjects: Project[];
  onNavigateToDiscover: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, savedProjects, onNavigateToDiscover }) => {
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
  // Calculate stats
  const totalSaved = savedProjects.length;
  
  // Calculate top tags
  const tagCounts: { [key: string]: number } = {};
  savedProjects.forEach(p => {
    p.tags.forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

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
      className="max-w-7xl mx-auto px-4 pt-32 md:pt-40 pb-32 md:pb-12"
    >
      {/* Profile Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-8 mb-12 glass-card p-8 rounded-[3rem]">
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-orange-500/30">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=f97316&color=fff`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 bg-orange-600 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 font-display">
            Welcome back, <span className="text-orange-500 uppercase">{user.displayName?.split(' ')[0] || 'Techboy'}</span>
          </h1>
          <p className="text-gray-400 font-medium mb-4">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] font-black uppercase tracking-wider text-orange-400">
              {totalSaved} Saved Projects
            </span>
          </div>
        </div>

        <div className="md:ml-auto flex gap-3">
          <button 
            onClick={async () => {
              const { auth } = await import('../services/firebase');
              const { signOut } = await import('firebase/auth');
              if (auth) {
                await signOut(auth);
                localStorage.removeItem('project-finder-token');
                localStorage.removeItem('project-finder-user');
                window.dispatchEvent(new Event('storage'));
                window.location.reload();
              }
            }}
            className="px-5 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl flex items-center gap-2 text-red-400 hover:text-red-300 transition-all font-bold text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline-block">SIGN OUT</span>
          </button>
        </div>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Stats & Activity */}
        <div className="lg:col-span-2 space-y-8">
          
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
                    <div>
                      <h4 className="font-bold text-white mb-0.5">{project.name}</h4>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Saved recently</p>
                        {project.liveUrl && project.liveUrl !== '#' && (
                          <a 
                            href={project.liveUrl}
                            onClick={(e) => { e.stopPropagation(); }}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[9px] font-black text-orange-500 hover:text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-md"
                          >
                            Live <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                    <Search className="w-4 h-4 text-gray-600 ml-auto group-hover:text-white transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 italic mb-4">No activity yet. Start discovering projects!</p>
                  <button 
                    onClick={onNavigateToDiscover}
                    className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-500 transition-all"
                  >
                    Go Discover
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Col: Smart Analytics */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="glass-card p-8 rounded-[3rem] h-full">
            <div className="flex items-center gap-3 mb-8">
              <Code2 className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Stack Power</h2>
            </div>
            
            <div className="space-y-8">
              {topTags.map(([tag, count], idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-black text-white uppercase tracking-widest">{tag}</span>
                    <span className="text-[10px] font-bold text-gray-500">{Math.round((count / totalSaved) * 100) || 0}% Affinity</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / totalSaved) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                      className="h-full bg-orange-500"
                    />
                  </div>
                </div>
              ))}
              
              {topTags.length === 0 && (
                <p className="text-gray-600 text-sm italic">Save projects to see your tech stack distribution.</p>
              )}
            </div>

            <div className="mt-12 p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10">
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-3">AI Recommendation</p>
              {recommendations.length > 0 ? <div className="space-y-3">{recommendations.slice(0, 3).map((item, index) => <div key={index}><p className="text-xs text-white font-bold">{item.repository?.owner}/{item.repository?.name}</p><p className="text-[10px] text-gray-400">{item.reasons?.[0] || 'Matches your saved projects'}</p></div>)}</div> : <p className="text-xs text-gray-400 leading-relaxed italic">Save indexed projects to receive evidence-based recommendations.</p>}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
