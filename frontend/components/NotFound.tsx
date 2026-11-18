import React from 'react';
import { Home, Compass, Search, ArrowLeft, Terminal, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotFoundProps {
  onGoHome: () => void;
  onExploreTrending?: () => void;
  onAskAI?: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onGoHome, onExploreTrending, onAskAI }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 md:py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl w-full text-center relative z-10 p-8 md:p-12 rounded-[2.5rem] bg-[#0a0a0f]/80 backdrop-blur-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
      >
        {/* Error Code Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
          <Terminal size={14} className="text-red-400 animate-pulse" />
          <span>Error 404 · Destination Missing</span>
        </div>

        {/* 404 Large Display */}
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-rose-500 mb-4 select-none drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]">
          404
        </h1>

        {/* Headline */}
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase mb-3">
          Project Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-md mx-auto mb-8 font-medium">
          The coordinates or URL you entered do not exist on the radar. It may have been moved, renamed, or swallowed by the void.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Home size={15} />
            <span>Return to Search</span>
          </button>

          {onExploreTrending && (
            <button
              onClick={onExploreTrending}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-orange-500/30 font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Compass size={15} className="text-orange-400" />
              <span>Explore Trending</span>
            </button>
          )}

          {onAskAI && (
            <button
              onClick={onAskAI}
              className="w-full sm:w-auto p-3.5 rounded-full bg-white/5 hover:bg-white/10 text-orange-400 hover:text-orange-300 border border-white/10 hover:border-orange-500/30 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95"
              title="Ask Techboy AI"
            >
              <Bot size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
