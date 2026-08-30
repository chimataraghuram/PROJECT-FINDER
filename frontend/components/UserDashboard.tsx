import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import { linkWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { Project } from '../types';
import { auth, githubProvider } from '../services/firebase';
import { fetchRecommendations, fetchResearchSessions, fetchResearchSession, deleteResearchSession, renameResearchSession, fetchCollections, createCollection, addProjectToCollection, fetchProjectNotes, fetchSearchHistory, fetchFirebaseSearchHistory, fetchGithubStarred } from '../services/apiService';
import { LayoutDashboard, Star, Code2, TrendingUp, Clock, Settings, Search, Sparkles, Heart, ExternalLink, LogOut, Github, History, Trash2, Bell } from 'lucide-react';

interface UserDashboardProps {
  user: User;
  savedProjects: Project[];
  onNavigateToDiscover: () => void;
  onSearch?: (query: string) => void;
  onOpenResearchSession?: (session: any) => void;
  onImportProjects?: (projects: Project[]) => void;
  recentSearches?: any[];
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, savedProjects, onNavigateToDiscover, onSearch, onOpenResearchSession, onImportProjects, recentSearches = [] }) => {
  const [recommendations, setRecommendations] = React.useState<any[]>([]);
  const [githubUpdates, setGithubUpdates] = React.useState<any[]>([]);
  const [researchSessions, setResearchSessions] = React.useState<any[]>([]);
  const [collections, setCollections] = React.useState<any[]>([]);
  const [openCollection, setOpenCollection] = React.useState<any | null>(null);
  const [historyFilter, setHistoryFilter] = React.useState<'all' | 'searches' | 'research'>('all');
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

  React.useEffect(() => {
    const githubProjects = savedProjects.filter(project => project.platform === 'GitHub' && project.owner?.login && project.name);
    if (!githubProjects.length) return;
    let cancelled = false;
    const checkUpdates = async () => {
      const updates: any[] = [];
      for (const project of githubProjects.slice(0, 20)) {
        try {
          const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(project.owner!.login)}/${encodeURIComponent(project.name)}`, { cache: 'no-store' });
          if (!response.ok) continue;
          const current = await response.json();
          const key = `project-finder-github-snapshot:${project.url}`;
          const previous = JSON.parse(localStorage.getItem(key) || 'null');
          if (previous && (current.stargazers_count !== previous.stars || current.pushed_at !== previous.pushedAt)) updates.push({ ...project, currentStars: current.stargazers_count, pushedAt: current.pushed_at });
          localStorage.setItem(key, JSON.stringify({ stars: current.stargazers_count, pushedAt: current.pushed_at }));
        } catch { /* notifications are best effort */ }
      }
      if (!cancelled) setGithubUpdates(updates);
    };
    checkUpdates();
    return () => { cancelled = true; };
  }, [savedProjects]);

  const exportWorkspace = (format: 'markdown' | 'json' | 'pdf') => {
    if (format === 'pdf') { window.print(); return; }
    const content = format === 'json'
      ? JSON.stringify({ exportedAt: new Date().toISOString(), projects: savedProjects }, null, 2)
      : `# PROJECT-FINDER Saved Projects\n\nExported: ${new Date().toLocaleString()}\n\n${savedProjects.map(project => `## ${project.name}\n- Platform: ${project.platform}\n- Stars: ${project.stars || 0}\n- Language: ${project.language || 'Unknown'}\n- URL: ${project.url}\n\n${project.description || ''}\n`).join('\n')}`;
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
    link.download = `project-finder-saved-projects.${format === 'json' ? 'json' : 'md'}`;
    link.click(); URL.revokeObjectURL(link.href);
  };

  const removeResearchSession = async (sessionId: string) => {
    if (!user || !window.confirm('Delete this research session?')) return;
    try {
      const token = await user.getIdToken();
      await deleteResearchSession(token, sessionId);
      setResearchSessions(current => current.filter(session => session._id !== sessionId && session.id !== sessionId));
    } catch { /* keep the card intact when the request fails */ }
  };

  const editResearchSession = async (session: any) => {
    if (!user) return;
    const title = window.prompt('Rename research session', session.title || 'Technical research')?.trim();
    if (!title || title === session.title) return;
    try {
      const token = await user.getIdToken();
      const updated = await renameResearchSession(token, session._id || session.id, title);
      setResearchSessions(current => current.map(item => (item._id === session._id || item.id === session.id) ? { ...item, ...updated } : item));
    } catch { /* keep the current title when the request fails */ }
  };

  const addCollection = async () => {
    if (!user) return;
    const name = window.prompt('New collection name')?.trim();
    if (!name) return;
    try {
      const token = await user.getIdToken();
      const collection = await createCollection(token, name);
      setCollections(current => [collection, ...current]);
    } catch { /* keep the current collection list when creation fails */ }
  };

  const assignProject = async (project: Project, collectionId: string) => {
    if (!user || !collectionId || !project.id) return;
    try {
      const token = await user.getIdToken();
      const updated = await addProjectToCollection(token, collectionId, project.id);
      setCollections(current => current.map(collection => collection._id === collectionId ? { ...collection, ...updated } : collection));
    } catch { /* assignment remains unchanged when the request fails */ }
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
          {githubUpdates.length > 0 && <motion.div variants={itemVariants} className="glass-card rounded-[2rem] border border-orange-500/20 bg-orange-500/[0.06] p-5">
            <div className="flex items-center gap-3 mb-3"><Bell className="h-5 w-5 text-orange-400" /><h2 className="text-sm font-black uppercase tracking-widest text-orange-200">GitHub Updates</h2></div>
            <div className="space-y-2">{githubUpdates.map(project => <button key={project.url} onClick={() => window.open(project.url, '_blank', 'noopener,noreferrer')} className="w-full rounded-xl bg-black/20 px-3 py-2 text-left hover:bg-black/30"><span className="block text-xs font-bold text-white">{project.name}</span><span className="text-[10px] text-orange-200/70">Repository activity changed · {Number(project.currentStars || 0).toLocaleString()} stars</span></button>)}</div>
          </motion.div>}
          
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
              <button onClick={() => exportWorkspace('pdf')} disabled={!savedProjects.length} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:border-orange-500/40 hover:text-white disabled:opacity-30">Export PDF</button>
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
                    {collections.length > 0 && project.id && <select aria-label={`Add ${project.name} to collection`} defaultValue="" onChange={event => assignProject(project, event.target.value)} className="max-w-28 rounded-lg border border-white/10 bg-[#1e293b]/80 px-2 py-1 text-[9px] text-gray-400 outline-none"><option value="">Collection</option>{collections.map(collection => <option key={collection._id || collection.id} value={collection._id || collection.id}>{collection.name}</option>)}</select>}
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
            <div className="flex items-center justify-between gap-3 mb-6"><div className="flex items-center gap-3"><History className="w-5 h-5 text-orange-500" /><h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Research History</h2></div><div className="flex rounded-xl border border-white/10 bg-white/5 p-1">{(['all', 'searches', 'research'] as const).map(filter => <button key={filter} onClick={() => setHistoryFilter(filter)} className={`rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest ${historyFilter === filter ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-white'}`}>{filter === 'all' ? 'All' : filter}</button>)}</div></div>
            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {(historyFilter !== 'research' && searchHistory.length > 0) && <div className="border-b border-white/5 pb-2">{searchHistory.slice(0, 50).map((item, idx) => <button key={`search-${idx}`} onClick={() => item?.query && onSearch?.(item.query)} className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-left hover:border-orange-500/30"><span className="truncate text-xs text-gray-300">{item.query}</span><span className="ml-2 text-[9px] uppercase text-orange-400">Search</span></button>)}</div>}
              {(historyFilter !== 'searches' && researchSessions.length > 0) && researchSessions.slice(0, 50).map((session, index) => <div key={session._id || session.id || index} className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 hover:border-orange-500/30"><button onClick={async () => { const token = await user.getIdToken(); const full = await fetchResearchSession(token, session._id || session.id); onOpenResearchSession?.(full); }} className="min-w-0 flex-1 py-1 text-left"><span className="block truncate text-xs font-bold text-gray-200">{session.title || 'Untitled research session'}</span><span className="text-[9px] uppercase tracking-widest text-gray-500">{session.messageCount || 0} messages · Research</span></button><button aria-label="Rename research session" onClick={() => editResearchSession(session)} className="rounded-lg p-2 text-gray-600 hover:text-orange-400"><Settings className="h-3.5 w-3.5" /></button><button aria-label="Delete research session" onClick={() => removeResearchSession(session._id || session.id)} className="rounded-lg p-2 text-gray-600 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
              {((historyFilter === 'all' && !searchHistory.length && !researchSessions.length) || (historyFilter === 'searches' && !searchHistory.length) || (historyFilter === 'research' && !researchSessions.length)) && <p className="py-8 text-center text-[11px] italic text-gray-500">No history in this filter yet.</p>}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-8 rounded-[3rem]">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Collections</h2>
              </div>
              <button onClick={addCollection} className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-orange-300 hover:bg-orange-500/20">New Collection</button>
            </div>
            {collections.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{collections.slice(0, 12).map((collection, index) => <button key={collection._id || collection.id || index} onClick={() => setOpenCollection(collection)} className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-left hover:bg-orange-500/20 transition-all"><span className="block truncate text-xs font-black uppercase tracking-widest text-orange-200">{collection.name || 'Untitled collection'}</span><span className="mt-1 block text-[10px] text-orange-200/60">{collection.projects?.length || 0} saved projects · Open collection</span></button>)}</div> : <p className="text-[11px] italic text-gray-500">Create collections to organize your projects.</p>}
          </motion.div>

        </div>

      </div>
      {openCollection && <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpenCollection(null)}><div className="glass-card w-full max-w-lg rounded-[2rem] p-6" onClick={event => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-black uppercase tracking-widest text-white">{openCollection.name}</h2><button onClick={() => setOpenCollection(null)} className="rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-white/10">CLOSE</button></div><div className="max-h-80 space-y-2 overflow-y-auto custom-scrollbar">{openCollection.projects?.length ? openCollection.projects.map((project: any, index: number) => <a key={project._id || project.id || index} href={project.url || project.html_url || '#'} target="_blank" rel="noopener noreferrer" className="block rounded-xl border border-white/10 bg-white/[0.04] p-3 hover:border-orange-500/40"><span className="block text-sm font-bold text-white">{project.name || project.title || 'Saved project'}</span><span className="text-[10px] text-gray-500">{project.platform || 'GitHub'} · Open repository ↗</span></a>) : <p className="py-8 text-center text-xs italic text-gray-500">No projects in this collection yet.</p>}</div></div></div>}
    </motion.div>
  );
};
