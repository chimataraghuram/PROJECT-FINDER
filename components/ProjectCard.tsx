import React from 'react';
import { Project } from '../types';
import { Github, ExternalLink, Code } from 'lucide-react';

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
    <path d="M18.825 23.859c-.022.09-.092.126-.168.141h-3.32c-.172 0-.254-.078-.344-.19l-5.66-7.394-1.298 1.155v6.29c0 .16-.06.257-.23.238H5.53c-.158.02-.234-.082-.234-.238V.23C5.305.074 5.37 0 5.53 0h2.274c.17 0 .23.082.23.23v14.288l7.094-8.312c.094-.108.188-.18.36-.18h3.35c.18 0 .26.078.188.223l-6.19 7.18 6.44 9.94c.09.138.02.327-.45.49z"/>
  </svg>
);

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const isGithub = project.platform === 'GitHub';
  const isHF = project.platform === 'Hugging Face';
  const isKaggle = project.platform === 'Kaggle';

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
  } else {
    icon = <Code className="w-4 h-4" />;
    badgeClasses = 'bg-gray-700/50 text-gray-200 border-gray-600';
    platformName = project.platform || 'Project';
  }

  return (
    <div className="group relative bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl p-5 md:p-6 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-xl">
      
      {/* Header with Platform Badge */}
      <div className="mb-4">
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold border mb-3 ${badgeClasses}`}>
           {icon}
           <span>{platformName}</span>
        </div>

        <h3 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors leading-tight">
          {project.name}
        </h3>
      </div>

      <p className="text-gray-300 text-sm mb-6 flex-grow leading-relaxed">
        {project.description}
      </p>

      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.slice(0, 3).map((tag, idx) => (
            <span 
              key={idx} 
              className="px-2 py-1 text-[10px] uppercase tracking-wide font-medium rounded bg-gray-900 border border-gray-700 text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-gray-700/50 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all border border-gray-600 hover:border-blue-500"
        >
          {project.url.includes('dataset') ? 'View Dataset' : 'View Project'}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};