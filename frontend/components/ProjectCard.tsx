import React, { useState } from 'react';
import { Project, SummaryData } from '../types';
import { Github, ExternalLink, Code, Sparkles, Linkedin, Heart, Share2, Check, Brain, Loader2, X, Terminal, Cpu, Lightbulb, ShieldCheck, BarChart3, Activity, Zap, FolderPlus, MessageCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProjectReadme, summarizeProject, askResearchQuestion, startIngestionJob, getJobStatus, submitAIFeedback, analyzeRepository } from '../services/apiService';
import { analyzeProject, ProjectAnalysis } from '../services/aiService';
import { openSafe } from '../src/utils/urlHelper';
import { TechStack } from './TechStack';

// Custom SVG for Hugging Face logo
// Official Hugging Face Icon (SimpleIcons)
const HuggingFaceIcon = ({ className }: { className?: string }) => (
    <img src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg" className={className || "w-5 h-5"} style={{ filter: 'brightness(0) invert(1)' }} alt="Hugging Face" />
  );

// Official Kaggle Icon (SimpleIcons)
const KaggleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M18.825 23.859c-.022.09-.092.126-.168.141h-3.32c-.172 0-.254-.078-.344-.19L11.516 19.34l-3.32 3.19v1.272c0 .125-.094.202-.204.202H5.064c-.11 0-.195-.08-.195-.202V.219C4.869.094 4.963 0 5.064 0h2.928c.11 0 .204.094.204.219v15.023L14.776.438A.268.268 0 0 1 14.98 0h3.407c.101 0 .195.055.226.133.031.086.008.188-.047.242L11.758 7.375l7.027 16.273c.047.11.024.235-.047.305Z" />
  </svg>
);

// Official LinkedIn Icon (SimpleIcons)
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);


interface ProjectCardProps {
  project: Project;
  isFavorite?: boolean;
  onToggleFavorite?: (project: Project) => void;
  onToggleCompare?: (project: Project) => void;
  isComparing?: boolean;
  index?: number;
  onView?: (project: Project) => void;
  isSearchResult?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isFavorite, onToggleFavorite, onToggleCompare, isComparing, index = 0, onView, isSearchResult }) => {
  const [isGlowing, setIsGlowing] = React.useState(false);
  const glowTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (isSearchResult) {
      setIsGlowing(true);
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
      glowTimeoutRef.current = setTimeout(() => setIsGlowing(false), 2500);
    }
  };

  const healthSignals = [Boolean(project.description), Boolean(project.language && project.language !== 'Unknown'), Boolean(project.tags?.length), Boolean(project.liveUrl), (project.stars || 0) > 100].filter(Boolean).length;
  const healthLabel = healthSignals >= 4 ? 'Strong signals' : healthSignals >= 2 ? 'Good signals' : 'Limited signals';
  const [copied, setCopied] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(project.aiSummary || null);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<ProjectAnalysis | null>(null);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [researchQuestion, setResearchQuestion] = useState('What does this project do?');
  const [researchAnswer, setResearchAnswer] = useState<any>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexStatus, setIndexStatus] = useState<string | null>(null);
  const [indexedRepositoryId, setIndexedRepositoryId] = useState<string | null>(null);

  const handleSummarize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onView?.(project);
    if (summaryData) {
      setShowSummary(true);
      return;
    }

    setIsSummarizing(true);
    try {
      const readme = await fetchProjectReadme(project.url);
      const summary = summarizeProject(project.name, project.description, readme);
      setSummaryData(summary);
      setShowSummary(true);
    } catch (err) {
      console.error('Summarization failed:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onView?.(project);
    if (analysisData) {
      setShowAnalysis(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      if (indexedRepositoryId) {
        const result = await analyzeRepository(indexedRepositoryId);
        const scores = result.analysis?.scores || {};
        setAnalysisData({ overallScore: Math.round(Object.values(scores).reduce((sum: number, value: any) => sum + Number(value || 0), 0) / Math.max(Object.values(scores).length, 1) / 10), documentation: Math.round((scores.documentation || 0) / 10), maintenance: Math.round((scores.maintenance || 0) / 10), popularity: Math.round((scores.portfolioValue || 0) / 10), verdict: 'Evidence-backed heuristic analysis generated from the indexed repository.', tags: Object.keys(scores) });
      } else setAnalysisData(await analyzeProject(project));
      setShowAnalysis(true);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResearch = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation(); setShowResearch(true); setIsResearching(true);
    const owner = project.owner?.login;
    const repo = project.url.match(/github\.com\/[^/]+\/([^/?#]+)/)?.[1];
    try { setResearchAnswer(await askResearchQuestion(researchQuestion, undefined, owner && repo ? { owner, repo } : undefined)); }
    catch { setResearchAnswer({ answer: 'Research is unavailable until this repository has been indexed.' }); }
    finally { setIsResearching(false); }
  };

  const handleIndex = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!isGithub || !project.owner?.login) return;
    setIsIndexing(true); setIndexStatus('Indexing repository…');
    try {
      const job = await startIngestionJob(project.owner.login, project.name.split('/').pop() || project.name);
      setIndexStatus('Indexing queued…');
      let status = job;
      for (let attempt = 0; attempt < 60 && (status.status === 'queued' || status.status === 'processing'); attempt++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        status = await getJobStatus(job.id);
        setIndexStatus(status.status === 'processing' ? 'Indexing repository…' : 'Indexing queued…');
      }
      if (status.status === 'completed') { setIndexedRepositoryId(status.result?.repositoryId || null); setIndexStatus(`Indexed ${status.result?.chunkCount || 0} evidence chunks`); }
      else if (status.status === 'failed') setIndexStatus('Indexing failed');
    } catch { setIndexStatus('Indexing failed'); }
    finally { setIsIndexing(false); }
  };

  const isGithub = project.platform === 'GitHub';
  const isHF = project.platform === 'Hugging Face';
  const isKaggle = project.platform === 'Kaggle';
  const isLinkedIn = project.platform === 'LinkedIn';

  let icon, badgeClasses, platformName;

  if (isGithub) {
    icon = <Github className="w-4 h-4" />;
    badgeClasses = 'bg-gray-700/50 text-gray-200 border-gray-600';
    platformName = 'GitHub';
  } else if (isHF) {
    icon = <HuggingFaceIcon className="w-4 h-4" />;
    badgeClasses = 'bg-yellow-500/10 text-yellow-200 border-yellow-500/30';
    platformName = 'Hugging Face';
  } else if (isKaggle) {
    icon = <KaggleIcon className="w-4 h-4" />;
    badgeClasses = 'bg-blue-500/10 text-blue-200 border-blue-500/30';
    platformName = 'Kaggle';
  } else if (isLinkedIn) {
    icon = <LinkedInIcon className="w-4 h-4" />;
    badgeClasses = 'bg-blue-600/10 text-blue-400 border-blue-600/30';
    platformName = 'LinkedIn';
  } else {
    icon = <Code className="w-4 h-4" />;
    badgeClasses = 'bg-gray-700/50 text-gray-200 border-gray-600';
    platformName = project.platform || 'Project';
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareText = `Check out this project on Project Finder: ${project.name}\n\n${project.description}\n\nLink: ${project.url}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: [0.23, 1, 0.32, 1], // beautiful spring ease out
        delay: index * 0.1, // Stagger based on index
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  
    
    return (
    <motion.div
      layout
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onMouseEnter={handleMouseEnter}
      className={`group relative bg-[#0a0a0f] border p-5 md:p-6 flex flex-col h-full rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-700 ${isGlowing ? 'border-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.4)]' : 'border-white/5 hover:border-orange-500/20'}`}
    >
      {/* Top Row: Platform Pill & Actions */}
      <div className="flex items-start justify-between mb-6 relative z-20">
        {/* Platform Pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-black shadow-lg ${badgeClasses}`}>
          {icon}
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white">{platformName}</span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mr-1" title="Stars">
            <Star size={12} className="text-orange-500 fill-orange-500" />
            <span className="text-[10px] font-black text-orange-500">
              {typeof project.stars === 'number' ? project.stars.toLocaleString() : project.stars || 0}
            </span>
          </div>
          <button onClick={handleShare} className="p-2 rounded-full bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Share Project">
            {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); onToggleFavorite?.(project); }} 
            className={`p-2 rounded-full border transition-colors flex items-center justify-center ${isFavorite ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`} 
            title="Save to Collection"
          >
            <Heart size={14} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "text-red-500" : ""} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); onToggleCompare?.(project); }} 
            className={`p-2 rounded-full border transition-colors flex items-center justify-center ${isComparing ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`} 
            title="Compare"
          >
            <BarChart3 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative z-20 flex flex-col">
        <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight line-clamp-2">
          {project.name}
        </h3>
        
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-4 line-clamp-3">
          {project.description || "A powerful open-source tool for the modern web."}
        </p>

        <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
          <span className={`h-1.5 w-1.5 rounded-full ${healthSignals >= 4 ? 'bg-green-400' : healthSignals >= 2 ? 'bg-yellow-400' : 'bg-gray-500'}`} />
          Metadata health: <span className="text-gray-300">{healthLabel}</span>
        </div>
        
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4 opacity-50" />

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {project.tags?.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-3 py-1 rounded-full border border-white/10 bg-transparent text-[9px] font-black text-gray-400 tracking-[0.15em] uppercase hover:text-white hover:border-white/20 transition-colors">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-3">
          {project.liveUrl && project.liveUrl !== '#' ? (
            <>
              <button 
                onClick={(e) => { e.preventDefault(); openSafe(project.url); }}
                className="flex-1 py-3 px-4 rounded-xl bg-transparent border border-white/20 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              >
                {icon} VIEW REPO <ExternalLink size={12} />
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); openSafe(project.liveUrl); }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:shadow-orange-500/50 hover:brightness-110 transition-all"
              >
                LIVE DEMO <ExternalLink size={12} />
              </button>
            </>
          ) : (
            <button 
              onClick={(e) => { e.preventDefault(); openSafe(project.url); }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:shadow-orange-500/50 hover:brightness-110 transition-all"
            >
              {icon} VIEW REPO <span className="ml-2 font-light text-base leading-none">&rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Decorative Gradient Borders (similar to mockup) */}
      <div className="absolute -inset-[1px] bg-gradient-to-br from-orange-500/20 via-transparent to-purple-500/20 rounded-[2rem] pointer-events-none opacity-50" />
      
      {/* Existing Modals and popups */}
      {/* (Copying the existing modals from the old return block) */}
      <AnimatePresence>
        {showSummary && summaryData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#0f172a]/90 backdrop-blur-md py-2 border-b border-white/5 z-10">
              <h4 className="text-white font-bold flex items-center gap-2"><Brain size={16} className="text-orange-500" /> AI Review</h4>
              <button onClick={() => setShowSummary(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10"><X size={16} /></button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="mb-6">
                <h5 className="text-orange-400 font-bold mb-2 uppercase tracking-wider text-xs">The TL;DR</h5>
                <p className="text-gray-300 leading-relaxed bg-orange-500/5 p-4 rounded-xl border border-orange-500/10">{summaryData.tldr}</p>
              </div>
              <div className="mb-6">
                <h5 className="text-blue-400 font-bold mb-2 uppercase tracking-wider text-xs">Core Features</h5>
                <ul className="space-y-2">
                  {summaryData.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <Zap size={14} className="text-blue-500 mt-1 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAnalysis && analysisData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl p-6 overflow-y-auto rounded-[2rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#0f172a]/90 backdrop-blur-md py-2 border-b border-white/5 z-10">
              <h4 className="text-white font-bold flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-500" /> Security & Architecture
              </h4>
              <button onClick={() => setShowAnalysis(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10"><X size={16} /></button>
            </div>
            <div className="space-y-6">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Overall Score</h5>
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-black ${analysisData.score >= 80 ? 'text-green-400' : analysisData.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {analysisData.score}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${analysisData.score >= 80 ? 'bg-green-400' : analysisData.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${analysisData.score}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResearch && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[60] bg-[#020617]/95 backdrop-blur-2xl p-6 flex flex-col rounded-[2rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h4 className="text-white font-bold flex items-center gap-2"><MessageCircle size={16} className="text-purple-400" /> Research Assistant</h4>
              <button onClick={() => setShowResearch(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10"><X size={16} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {researchAnswer ? (
                <div className="prose prose-invert prose-sm">
                  <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl text-purple-200 leading-relaxed">
                    {researchAnswer.answer}
                  </div>
                  {researchAnswer.confidence && (
                    <div className="mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Activity size={10} /> Confidence: {researchAnswer.confidence}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <Lightbulb size={32} className="mb-4 text-purple-400" />
                  <p className="text-sm font-medium">Ask any question about {project.name}.</p>
                </div>
              )}
            </div>

            <div className="shrink-0 relative">
              <input
                type="text"
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitResearch(); }}
                placeholder="Ask a question..."
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 pr-12"
              />
              <button 
                onClick={submitResearch}
                disabled={isResearching || !researchQuestion.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
              >
                {isResearching ? <Loader2 size={14} className="animate-spin" /> : <Terminal size={14} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );

};
