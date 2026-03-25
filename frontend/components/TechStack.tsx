import React from 'react';
import { 
  Code2, 
  Cpu, 
  Globe, 
  Database, 
  Layers, 
  Zap, 
  Box, 
  Braces, 
  Terminal, 
  Workflow, 
  Cloud, 
  Shield, 
  Search, 
  Brain, 
  Smartphone,
  Gamepad2,
  Wrench
} from 'lucide-react';

const TECH_MAP: Record<string, { icon: React.ReactNode, color: string }> = {
  'react': { icon: <Code2 size={12} />, color: 'text-blue-400 group-hover:text-blue-300' },
  'next.js': { icon: <Globe size={12} />, color: 'text-white' },
  'typescript': { icon: <Braces size={12} />, color: 'text-blue-500' },
  'javascript': { icon: <Braces size={12} />, color: 'text-yellow-400' },
  'python': { icon: <Terminal size={12} />, color: 'text-yellow-500' },
  'node': { icon: <Zap size={12} />, color: 'text-green-500' },
  'mongodb': { icon: <Database size={12} />, color: 'text-green-600' },
  'firebase': { icon: <Zap size={12} />, color: 'text-orange-500' },
  'tailwind': { icon: <Layers size={12} />, color: 'text-teal-400' },
  'ai': { icon: <Brain size={12} />, color: 'text-purple-400' },
  'ml': { icon: <Brain size={12} />, color: 'text-pink-400' },
  'docker': { icon: <Box size={12} />, color: 'text-blue-600' },
  'aws': { icon: <Cloud size={12} />, color: 'text-orange-400' },
  'security': { icon: <Shield size={12} />, color: 'text-red-400' },
  'mobile': { icon: <Smartphone size={12} />, color: 'text-gray-400' },
  'game': { icon: <Gamepad2 size={12} />, color: 'text-indigo-400' },
  'cli': { icon: <Terminal size={12} />, color: 'text-gray-300' },
  'vite': { icon: <Zap size={12} />, color: 'text-purple-500' },
  'rust': { icon: <Cpu size={12} />, color: 'text-orange-700' },
  'golang': { icon: <Globe size={12} />, color: 'text-cyan-500' },
};

interface TechStackProps {
  tags: string[];
  max?: number;
}

export const TechStack: React.FC<TechStackProps> = ({ tags, max = 4 }) => {
  const displayTags = tags.slice(0, max);
  
  return (
    <div className="flex flex-wrap gap-2">
      {displayTags.map((tag, idx) => {
        const lowerTag = tag.toLowerCase();
        const tech = Object.entries(TECH_MAP).find(([key]) => lowerTag.includes(key));
        const { icon, color } = tech ? tech[1] : { icon: <Wrench size={12} />, color: 'text-gray-500' };

        return (
          <div
            key={idx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group/tech"
          >
            <span className={`${color} transition-transform group-hover/tech:scale-110`}>
              {icon}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/tech:text-gray-300 transition-colors">
              {tag}
            </span>
          </div>
        );
      })}
      {tags.length > max && (
        <div className="px-3 py-1.5 rounded-xl bg-white/[0.01] border border-dashed border-white/5 flex items-center justify-center">
          <span className="text-[9px] font-bold text-gray-600">+{tags.length - max}</span>
        </div>
      )}
    </div>
  );
};
