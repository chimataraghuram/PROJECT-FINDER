import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import mascotLogo from '../src/assets/logo_final_v6.png';
import introVideo from '../src/assets/PROJECT_FINDER_INTRO.mp4';

interface IntroVideoProps {
    onComplete: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Fallback timeout in case video fails to load or play
        const fallbackTimeout = setTimeout(() => {
            if (!isFading) {
                setIsFading(true);
                setTimeout(onComplete, 1000);
            }
        }, 8000); // 8 seconds fallback

        return () => clearTimeout(fallbackTimeout);
    }, [onComplete, isFading]);

    const handleSkip = () => {
        if (!isFading) {
            setIsFading(true);
            setTimeout(onComplete, 1000);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleSkip}
        >
            {/* Clean Dark Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a1a2e] to-[#0f172a]" />

            {/* Main Content - Vertical Stack */}
            <div className="relative flex flex-col items-center z-10">
                {/* Logo - App Icon Style */}
                <motion.div
                    initial={{ scale: 0.7, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 15 }}
                    className="w-40 h-40 md:w-56 md:h-56 rounded-[24px] overflow-hidden mb-14 md:mb-20 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(249,115,22,0.2)]"
                >
                    <video 
                        src={introVideo} 
                        autoPlay 
                        muted 
                        playsInline 
                        onEnded={() => {
                            if (!isFading) {
                                setIsFading(true);
                                setTimeout(onComplete, 1000);
                            }
                        }}
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Title - Below Logo */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex items-center gap-3 mb-8"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 text-xl md:text-3xl font-black tracking-[0.12em] uppercase drop-shadow-[0_4px_12px_rgba(249,115,22,0.4)]">
                        PROJECT FINDER
                    </span>
                    <Search className="w-5 h-5 md:w-7 md:h-7 text-orange-500 animate-pulse" />
                </motion.div>

                {/* Loading Dots */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center gap-2 mb-10"
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div 
                            key={i}
                            animate={{ 
                                scale: [1, 1.4, 1],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.15
                            }}
                            className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                        />
                    ))}
                </motion.div>

                {/* Footer Tag - Bottom fixed */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.7 }}
                    className="fixed bottom-10 left-0 right-0 flex justify-center w-full"
                >
                    <span className="text-[9px] md:text-[10px] font-bold tracking-[0.25em] text-gray-500 uppercase">
                        COOKED BY RAGHU❤️
                    </span>
                </motion.div>
            </div>
        </div>
    );
};
