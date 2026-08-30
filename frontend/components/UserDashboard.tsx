import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { linkWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { Project } from '../types';
import { auth, githubProvider } from '../services/firebase';
import { fetchRecommendations, fetchResearchSessions, fetchCollections, fetchProjectNotes, fetchSearchHistory, fetchFirebaseSearchHistory, fetchGithubStarred } from '../services/apiService';
import { LayoutDashboard, Star, Code2, TrendingUp, Clock, Settings, Search, Sparkles, Heart, ExternalLink, LogOut, Github, History } from 'lucide-react';

interface UserDashboardProps {
  user: User;
  savedProjects: Project[];
  onNavigateToDiscover: () => void;
  onSearch?: (query: string) => void;
  onImportProjects?: (projects: Project[]) => void;
  recentSearches?: any[];
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, savedProjects, onNavigateToDiscover, onSearch, onImportProjects, recentSearches = [] }) => {
  const [recommendations, setRecommendations] = React.useState<any[]>([]);
  const [researchSessions, setResearchSessions] = React.useState<any[]>([]);
  const [collections, setCollections] = React.useState<any[]>([]);
  const [notes, setNotes] = React.useState<any[]>([]);
  const [searchHistory, setSearchHistory] = React.useState<any[]>(recentSearches);
  const [githubSyncing, setGithubSyncing] = React.useState(false);
  const [githubSyncMessage, setGithubSyncMessage] = React.useState('');
  const [githubNeedsUsername, setGithubNeedsUsername] = React.useState(false);
  const [githubUsernameInput, setGithubUsernameInput] = React.useState('');
  const [githubAccount, setGithubAccount] = React.useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('project-finder-github-account') || 'null'); } catch { return null; }
  });
  React.useEffect(() => { if (recentSearches.length) setSearchHistory(recentSearches); }, [recentSearches]);
  React.useEffect(() => {
    try {
      const localHistory = JSON.parse(localStorage.getItem('project-finder-recent-searches') || '[]');
      if (Array.isArray(localHistory) && localHistory.length) setSearchHistory(current => {
        const merged = [...current, ...localHistory];
        return merged.filter((item, index, items) => item?.query && items.findIndex(other => other.query === item.query) === index).slice(0, 50);
      });
    } catch { /* Ignore malformed local history and continue with account history. */ }
    if ((user as any)?.uid) fetchFirebaseSearchHistory((user as any).uid).then(data => { if (data.length) setSearchHistory(data); }).catch(() => {});
    const token = localStorage.getItem('project-finder-token');
    if (!token) return;
    fetchRecommendations(token).then(data => setRecommendations(data.recommendations || [])).catch(() => {});
    fetchResearchSessions(token).then(data => setResearchSessions(data || [])).catch(() => {});
    fetchCollections(token).then(data => setCollections(data || [])).catch(() => {});
    fetchProjectNotes(token).then(data => setNotes(data || [])).catch(() => {});
    fetchSearchHistory(token).then(data => { if (data?.length) setSearchHistory(data); }).catch(() => {});
  }, []);

  const exportWorkspace = (format: 'markdown' | 'json') => {
    const content = format === 'json'
      ? JSON.stringify({ exportedAt: new Date().toISOString(), projects: savedProjects }, null, 2)
      : `# PROJECT-FINDER Saved Projects\n\nExported: ${new Date().toLocaleString()}\n\n${savedProjects.map(project => `## ${project.name}\n- Platform: ${project.platform}\n- Stars: ${project.stars || 0}\n- Language: ${project.language || 'Unknown'}\n- URL: ${project.url}\n\n${project.description || ''}\n`).join('\n')}`;
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `project-finder-saved-projects.${format === 'json' ? 'json' : 'md'}`;
    link.click(); URL.revokeObjectURL(link.href);
  };
  
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
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <p className="text-gray-400 font-medium">{user.email}</p>
                <span className="hidden md:block text-gray-600">•</span>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/10">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span className="text-[10px] font-bold text-gray-300">Connected</span>
                </div>
              </div>
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
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => exportWorkspace('markdown')} disabled={!savedProjects.length} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:border-orange-500/40 hover:text-white disabled:opacity-30">Export Markdown</button>
              <button onClick={() => exportWorkspace('json')} disabled={!savedProjects.length} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:border-orange-500/40 hover:text-white disabled:opacity-30">Export JSON</button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
            <button onClick={async () => {
              setGithubSyncing(true); setGithubSyncMessage(githubAccount ? 'Syncing your GitHub repositories…' : 'Connecting your GitHub account…');
              try {
                let account = githubAccount;
                if (!account) {
                  if (!auth?.currentUser) throw new Error('Sign in with Google before connecting GitHub');
                  try {
                    const linked = await linkWithPopup(auth.currentUser, githubProvider);
                    const githubData = linked.user.providerData.find(provider => provider.providerId === 'github.com');
                    const githubProfile: any = getAdditionalUserInfo(linked)?.profile || {};
                    account = { username: githubProfile.login || githubData?.displayName || '', displayName: githubData?.displayName, photoURL: githubData?.photoURL };
                  } catch (linkError: any) {
                    // Keep sync usable if Firebase GitHub linking is not enabled yet.
                    if (linkError?.code !== 'auth/operation-not-allowed') throw linkError;
                    const username = githubUsernameInput.trim();
                    if (!username) { setGithubNeedsUsername(true); throw new Error('Enter your GitHub username below to continue'); }
                    const profileResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { cache: 'no-store' });
                    if (!profileResponse.ok) throw new Error('GitHub username not found');
                    const profile = await profileResponse.json();
                    account = { username: profile.login, displayName: profile.name, photoURL: profile.avatar_url, fallback: true };
                  }
                  if (!account.username) throw new Error('GitHub account could not be identified');
                  setGithubAccount(account); localStorage.setItem('project-finder-github-account', JSON.stringify(account));
                }
                const starred = await fetchGithubStarred(account.username);
                const imported: Project[] = starred.map((repo: any) => ({
                  id: String(repo.id), name: repo.full_name || repo.name, description: repo.description || 'GitHub repository',
                  platform: 'GitHub', url: repo.html_url, liveUrl: repo.homepage || null, stars: repo.stargazers_count || 0,
                  language: repo.language || 'Unknown', tags: repo.topics || [], isPublisher: false,
                  owner: { login: repo.owner?.login || account.username, avatar_url: repo.owner?.avatar_url || '', html_url: repo.owner?.html_url || `https://github.com/${account.username}` },
                  slug: null, image: repo.owner?.avatar_url || null, readme: repo.description || ''
                }));
                onImportProjects?.(imported);
                setGithubSyncMessage(`Connected as @${account.username} · imported ${imported.length} starred repositories`);
              } catch (error: any) { setGithubSyncMessage(error.message || 'GitHub sync failed'); }
              finally { setGithubSyncing(false); }
            }} disabled={githubSyncing} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all shadow-[0_5px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_5px_25px_rgba(255,255,255,0.25)] disabled:opacity-60">
              {githubAccount?.photoURL ? <img src={githubAccount.photoURL} alt="GitHub account" className="w-5 h-5 rounded-full" /> : <Github className="w-4 h-4" />}
              {githubSyncing ? 'Connecting…' : githubAccount ? `Connected @${githubAccount.username}` : 'Connect GitHub Account'}
            </button>
            {githubNeedsUsername && !githubAccount && <div className="mt-3 flex gap-2">
              <input value={githubUsernameInput} onChange={event => setGithubUsernameInput(event.target.value)} placeholder="GitHub username" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-orange-500/50" />
              <button onClick={() => { setGithubNeedsUsername(false); }} className="rounded-xl bg-orange-500 px-3 py-2 text-[10px] font-black uppercase text-white">Use</button>
            </div>}
            {githubSyncMessage && <p className={`text-[10px] text-center mt-3 ${githubSyncMessage.toLowerCase().includes('failed') || githubSyncMessage.toLowerCase().includes('not found') ? 'text-red-400' : 'text-green-400'}`}>{githubSyncMessage}</p>}
            <p className="text-[10px] text-center text-gray-500 mt-4 leading-relaxed px-4">Connect your GitHub to automatically import your starred repos and tech stack.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[3rem]">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Recent Searches</h2>
            </div>
            
            {searchHistory.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 8).map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => item?.query && onSearch && onSearch(item.query)}
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

          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[3rem]">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Recent Research</h2>
            </div>
            {researchSessions.length ? <div className="space-y-2">{researchSessions.slice(0, 5).map((session, index) => <button key={session._id || session.id || index} onClick={() => session.title && onSearch?.(session.title)} className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3 text-left hover:border-orange-500/30 hover:bg-white/[0.06] transition-all"><span className="block truncate text-xs font-bold text-gray-200">{session.title || 'Untitled research session'}</span><span className="text-[9px] uppercase tracking-widest text-gray-500">{session.messageCount || 0} messages{session.updatedAt ? ` · Updated ${new Date(session.updatedAt).toLocaleDateString()}` : ''}</span></button>)}</div> : <p className="text-[11px] italic text-gray-500">Your research sessions will appear here.</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[3rem]">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Collections</h2>
            </div>
            {collections.length ? <div className="flex flex-wrap gap-2">{collections.slice(0, 8).map((collection, index) => <span key={collection._id || collection.id || index} className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-orange-300">{collection.name || 'Untitled collection'}</span>)}</div> : <p className="text-[11px] italic text-gray-500">Create collections to organize your projects.</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[3rem]">
            <div className="flex items-center gap-3 mb-6"><Sparkles className="w-5 h-5 text-orange-500" /><h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Recommended For You</h2></div>
            {recommendations.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{recommendations.slice(0, 6).map((recommendation, index) => { const project = recommendation.project || recommendation; return <button key={recommendation._id || recommendation.id || index} onClick={() => project.name && onSearch?.(project.name)} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-left hover:border-orange-500/30 hover:bg-white/[0.06] transition-all"><span className="block truncate text-sm font-bold text-white">{project.name || 'Recommended project'}</span><span className="mt-1 block line-clamp-2 text-[10px] text-gray-500">{project.description || recommendation.reason || 'Personalized project recommendation'}</span></button>; })}</div> : <p className="text-[11px] italic text-gray-500">Recommendations will appear as you explore projects.</p>}
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};
