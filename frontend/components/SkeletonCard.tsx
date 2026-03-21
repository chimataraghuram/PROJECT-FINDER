import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard: React.FC = () => {
    return (
        <div className="relative glass-card p-5 md:p-6 flex flex-col h-80 rounded-[2.5rem] overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
                {/* Shimmer overlay */}
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none z-20"
                />

                {/* Header Skeleton */}
                <div className="mb-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-2">
                            <div className="w-24 h-6 bg-gray-800/50 rounded-full border border-white/5" />
                            <div className="w-16 h-6 bg-gray-800/50 rounded-full border border-white/5" />
                        </div>
                        <div className="flex gap-2">
                            <div className="w-9 h-9 bg-gray-800/50 rounded-full border border-white/5" />
                            <div className="w-9 h-9 bg-gray-800/50 rounded-full border border-white/5" />
                        </div>
                    </div>
                    <div className="w-3/4 h-6 bg-gray-800/50 rounded-lg mb-2" />
                    <div className="w-1/2 h-6 bg-gray-800/50 rounded-lg" />
                </div>

                {/* Body Skeleton */}
                <div className="space-y-2 mb-6 flex-grow mt-4">
                    <div className="w-full h-4 bg-gray-800/50 rounded-lg" />
                    <div className="w-full h-4 bg-gray-800/50 rounded-lg" />
                    <div className="w-2/3 h-4 bg-gray-800/50 rounded-lg" />
                </div>

                {/* Footer Skeleton */}
                <div className="mt-auto space-y-4">
                    <div className="flex gap-2">
                        <div className="w-12 h-5 bg-gray-800/50 rounded-lg" />
                        <div className="w-16 h-5 bg-gray-800/50 rounded-lg" />
                        <div className="w-14 h-5 bg-gray-800/50 rounded-lg" />
                    </div>
                    <div className="w-full h-12 bg-gray-800/50 rounded-xl" />
                </div>
            </div>
        </div>
    );
};
