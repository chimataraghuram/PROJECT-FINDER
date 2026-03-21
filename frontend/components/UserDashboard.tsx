import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { Project } from '../types';
import { LayoutDashboard, Star, Code2, TrendingUp, Clock, Settings, Search, Sparkles, Heart } from 'lucide-react';

interface UserDashboardProps {
  user: User;
  savedProjects: Project[];
  onNavigateToDiscover: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, savedProjects, onNavigateToDiscover }) => {
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
      className="max-w-7xl mx-auto px-4 py-12"
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
            Welcome back, <span className="text-orange-500">{user.displayName?.split(' ')[0] || 'Techboy'}</span>
          </h1>
          <p className="text-gray-400 font-medium mb-4">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-400">
              Pro Member
            </span>
            <span className="px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px] font-black uppercase tracking-wider text-orange-400">
              {totalSaved} Saved Projects
            </span>
          </div>
        </div>

        <div className="md:ml-auto flex gap-3">
          <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Stats & Activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="glass-card p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-600/20 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white/60 uppercase tracking-widest">Discovery Power</h3>
                  <p className="text-2xl font-black text-white">Top 5%</p>
                </div>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-indigo-500"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 rounded-[2.5rem] bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-600/20 rounded-2xl">
                  <Star className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white/60 uppercase tracking-widest">Saves Today</h3>
                  <p className="text-2xl font-black text-white">+{totalSaved > 5 ? '12' : '3'}</p>
                </div>
              </div>
              <p className="text-[10px] text-orange-500/70 font-bold uppercase tracking-widest">+20% vs yesterday</p>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[3rem]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Recent Activity</h2>
              </div>
              <button onClick={onNavigateToDiscover} className="text-xs font-black text-orange-500 hover:text-orange-400 uppercase tracking-widest">
                Explore More
              </button>
            </div>

            <div className="space-y-6">
              {savedProjects.length > 0 ? (
                savedProjects.slice(0, 3).map((project, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                    <div className="p-3 bg-orange-600/10 rounded-xl group-hover:bg-orange-600/20">
                      <Heart className="w-5 h-5 text-orange-500 fill-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-0.5">{project.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Saved 2 hours ago</p>
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
              <p className="text-xs text-gray-400 leading-relaxed italic">
                "Based on your interest in <span className="text-white">{topTags[0]?.[0] || 'Modern Web'}</span>, you should explore the new <span className="text-blue-400 underline cursor-pointer">Llama-3 Edge</span> project."
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
