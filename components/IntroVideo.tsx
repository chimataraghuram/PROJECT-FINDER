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
            {/* Accent Cinematic Logo/Video Container */}
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative w-24 h-24 md:w-[140px] md:h-[140px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(249,115,22,0.25)] border border-white/10 bg-black group"
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

            {/* Ambient Loading Indicator - Kept for UX feedback */}
            <div className="mt-8 flex justify-center gap-1.5">
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
    );
};
