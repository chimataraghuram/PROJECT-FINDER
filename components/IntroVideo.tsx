import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import introVideo from '../src/assets/intro_new.mp4';

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
            {/* Compact Cinematic Logo/Video Container */}
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative w-40 h-40 md:w-[240px] md:h-[240px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.3)] border border-white/10 bg-black group"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-transparent to-purple-500/20 z-10 pointer-events-none" />
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover relative z-0 scale-110"
                    src={introVideo}
                    onEnded={handleVideoEnd}
                    onError={() => onComplete()}
                    autoPlay
                    muted
                    playsInline
                    style={{ pointerEvents: 'none' }}
                />
                
                {/* Subtle Overlay Vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10" />
            </motion.div>

            {/* Compact Stacked Title Text */}
            <div className="mt-8 md:mt-10 text-center flex flex-col items-center">
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-4xl md:text-5xl font-black tracking-[-0.05em] leading-none mb-1"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#f97316] to-[#ea580c] drop-shadow-[0_5px_15px_rgba(249,115,22,0.3)]">
                        TECHBOY
                    </span>
                </motion.h1>
                
                <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="w-12 h-0.5 bg-white/20 rounded-full mb-2"
                />

                <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="text-xs md:text-sm font-bold text-[#fef3c7] tracking-[0.4em] uppercase font-sans drop-shadow-[0_0_5px_rgba(254,243,199,0.2)] ml-[0.4em]"
                >
                    Project Finder
                </motion.h2>

                {/* Ambient Loading Indicator */}
                <div className="mt-6 flex justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div 
                            key={i}
                            animate={{ 
                                scale: [1, 1.4, 1],
                                opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className="w-1 h-1 rounded-full bg-orange-500/60 shadow-[0_0_5px_rgba(249,115,22,0.5)]"
                        />
                    ))}
                </div>
            </div>

            {/* Footer Tag */}
            <div className="absolute bottom-10 md:bottom-16">
                <div className="px-5 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase shadow-xl">
                    Cooked by Raghu with <span className="text-red-500">❤️</span>
                </div>
            </div>
        </div>
    );
};
