import React, { useState } from 'react';
import { Project } from '../types';
import { Github, ExternalLink, Code, Sparkles, Linkedin, Heart, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom SVG for Hugging Face logo
const HuggingFaceIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className || "w-5 h-5"}
  >
    <path d="M2 12h20M2 12l4-5M2 12l4 5M22 12l-4-5M22 12l-4 5" />
    <path d="M12 7v10" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// Custom SVG for Kaggle logo
const KaggleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "w-5 h-5"}
  >
    <path d="M18.825 23.859c-.022.09-.092.126-.168.141h-3.32c-.172 0-.254-.078-.344-.19l-5.66-7.394-1.298 1.155v6.29c0 .16-.06.257-.23.238H5.53c-.158.02-.234-.082-.234-.238V.23C5.305.074 5.37 0 5.53 0h2.274c.17 0 .23.082.23.23v14.288l7.094-8.312c.094-.108.188-.18.36-.18h3.35c.18 0 .26.078.188.223l-6.19 7.18 6.44 9.94c.09.138.02.327-.45.49z" />
  </svg>
);

interface ProjectCardProps {
  project: Project;
  isFavorite?: boolean;
  onToggleFavorite?: (project: Project) => void;
  index?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isFavorite, onToggleFavorite, index = 0 }) => {
  const [copied, setCopied] = useState(false);

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
    icon = <Linkedin className="w-4 h-4" />;
    badgeClasses = 'bg-blue-600/10 text-blue-400 border-blue-600/30';
    platformName = 'LinkedIn';
  } else {
    icon = <Code className="w-4 h-4" />;
    badgeClasses = 'bg-gray-700/50 text-gray-200 border-gray-600';
    platformName = project.platform || 'Project';
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const shareText = `Check out this project on Project Finder: ${project.name}\n\n${project.description}\n\nLink: ${project.url}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 10) * 0.1, ease: "easeOut" }}
      className="group relative glass-card p-5 md:p-6 transition-all duration-700 flex flex-col h-full hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 rounded-[2.5rem] hover:animate-liquid-glass overflow-hidden"
    >

      {/* Glow Effect */}
      <div className="absolute -inset-px bg-gradient-to-br from-orange-500/10 to-red-600/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Platform Badge and Favorite toggle */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border uppercase tracking-wider ${badgeClasses}`}>
                {icon}
                <span>{platformName}</span>
              </div>

              {project.isPublisher && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] md:text-xs font-black border border-orange-500/50 bg-orange-500/10 text-orange-400 uppercase tracking-[0.15em] animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>From Publisher</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className={`p-2 rounded-full transition-all duration-500 ${copied
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-white/5 text-gray-500 hover:text-blue-400 hover:bg-white/10'}`}
                title="Share Project"
              >
                {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite?.(project);
                }}
                className={`p-2 rounded-full transition-all duration-500 ${isFavorite
                  ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-white/5 text-gray-500 hover:text-red-400 hover:bg-white/10'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-orange-400 transition-colors leading-tight line-clamp-2">
            {project.name}
          </h3>
        </div>

        <p className="text-gray-400 text-sm mb-6 flex-grow leading-relaxed line-clamp-3 md:line-clamp-4">
          {project.description}
        </p>

        <div className="mt-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-black rounded-lg bg-gray-900/50 border border-white/5 text-gray-500 group-hover:text-gray-300 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-600/40 active:scale-[0.98] liquid-button ${project.liveUrl || project.demoUrl ? 'sm:w-1/2' : 'w-full'}`}
            >
              <span className="truncate">
                {project.url.includes('dataset') ? 'Explore Dataset' :
                  isLinkedIn ? 'View on LinkedIn' : 'Explore Project'}
              </span>
              <Github className="w-4 h-4 shrink-0" />
            </a>

            {(project.liveUrl || project.demoUrl) && (
              <a
                href={project.liveUrl || project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center sm:w-1/2 gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98] liquid-button"
              >
                <span className="truncate">Live Demo</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};