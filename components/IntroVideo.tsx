import React, { useRef, useState, useEffect } from 'react';
import introVideo from '../assets/intro.mp4';

interface IntroVideoProps {
    onComplete: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            // Play immediately (muted is required for autoplay in most browsers)
            videoRef.current.play().catch(error => {
                console.error("Autoplay failed:", error);
                // If autoplay fails completely, we skip the intro to avid a black screen
                onComplete();
            });
        }
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
            {/* Logo/Video Container */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(249,115,22,0.3)] border border-white/10 bg-black group">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-purple-500/20 opacity-50 z-10" />
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover relative z-0"
                    src={introVideo}
                    onEnded={handleVideoEnd}
                    onError={() => onComplete()}
                    autoPlay
                    muted
                    playsInline
                    style={{ pointerEvents: 'none' }}
                />
            </div>

            {/* Text Title */}
            <div className="mt-8 md:mt-12 text-center space-y-4">
                <h1 className="text-xl md:text-2xl font-black text-orange-500 tracking-[0.4em] uppercase font-sans drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                    Project Finder 🔍
                </h1>

                {/* Loading Dots */}
                <div className="flex justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
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
