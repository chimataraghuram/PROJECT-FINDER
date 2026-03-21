import React, { useRef, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import introVideo from '../src/assets/intro_new.mp4';
import mascotLogo from '../src/assets/logo_final_v6.png';

interface IntroVideoProps {
    onComplete: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Autoplay failed:", error);
                onComplete();
            });
        }

        // FAIL-SAFE: If the video hangs or fails to trigger events, 
        // force completion after 6 seconds so the user isn't stuck.
        const failSafeTimeout = setTimeout(() => {
            console.log("Intro safety timeout triggered");
            onComplete();
        }, 6000);

        return () => clearTimeout(failSafeTimeout);
    }, [onComplete]);

    const handleVideoEnd = () => {
        setIsFading(true);
        // Wait for fade out animation to finish before unmounting
        setTimeout(onComplete, 800);
    };

    const handleSkip = () => {
        if (!isFading) {
            handleVideoEnd();
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[100] bg-[#0f172a] flex flex-col items-center justify-center transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleSkip}
        >
            {/* Full-Screen Background Video */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover relative z-0 opacity-40"
                    src={introVideo}
                    onEnded={handleVideoEnd}
                    onError={() => onComplete()}
                    autoPlay
                    muted
                    playsInline
                />
                
                {/* Vignette Overlay for focus */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/20 via-transparent to-[#0f172a] z-10" />
            </div>

            {/* Central Content Hub */}
            <div className="relative z-20 flex flex-col items-center justify-center p-8">
                {/* Large Mascot Logo */}
                <motion.div
                    initial={{ scale: 0.6, opacity: 0, rotate: -5 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ 
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                        duration: 1.2 
                    }}
                    className="mb-10"
                >
                    <img 
                        src={mascotLogo} 
                        alt="Mascot Logo" 
                        className="w-48 h-48 md:w-80 md:h-80 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    />
                </motion.div>

                {/* Balanced Title Text (Orange + Search Icon) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="text-center flex flex-col items-center"
                >
                    <div className="flex items-center gap-3 text-2xl md:text-5xl font-black tracking-[0.2em] uppercase font-sans drop-shadow-[0_10px_30px_rgba(249,115,22,0.4)]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                            Project Finder
                        </span>
                        <Search className="w-6 h-6 md:w-10 md:h-10 text-orange-500 animate-pulse" />
                    </div>

                    <div className="mt-8 flex justify-center gap-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div 
                                key={i}
                                animate={{ 
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{ 
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                                className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Subtle Footer Tag */}
            <div className="absolute bottom-10 md:bottom-16">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1.5 }}
                    className="px-6 py-2.5 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-md text-[10px] md:text-xs font-bold tracking-[0.3em] text-gray-400 uppercase shadow-2xl"
                >
                    Cooked with <span className="text-red-500 animate-pulse">❤️</span> by Raghu
                </motion.div>
            </div>
        </div>
    );
};
