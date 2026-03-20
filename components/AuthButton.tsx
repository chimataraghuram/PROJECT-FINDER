import React, { useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider, isFirebaseConfigured } from '../services/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { User as UserIcon, LogOut, ShieldCheck, Sparkles, Github, Chrome, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthButton: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [showOptions, setShowOptions] = useState(false);

        if (isFirebaseConfigured && auth) {
            const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
            return () => unsubscribe();
        }

    const handleLogin = async (providerType: 'google' | 'github') => {
        setShowOptions(false);

        if (isFirebaseConfigured && auth) {
            try {
                const provider = providerType === 'google' ? googleProvider : githubProvider;
                await signInWithPopup(auth, provider);
            } catch (error: any) {
                console.error("Login failed:", error);
                alert(`Authentication Error: ${error.message}. Please check your Firebase project configuration.`);
            }
        } else {
            alert("⚠️ Firebase is not configured. Please add your API keys to the .env file in the root directory to enable real-time login.");
        }
    };

    const handleLogout = () => {
        if (isFirebaseConfigured && auth) {
            signOut(auth);
        } else {
            setUser(null);
            localStorage.removeItem('project-finder-mock-user');
        }
    };

    if (user) {
        return (
            <div className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full bg-[#0f172a]/80 border border-white/10 backdrop-blur-3xl group shadow-2xl hover:border-orange-500/30 transition-all duration-500">
                <div className="flex flex-col items-end pr-2 hidden sm:flex">
                    <span className="text-[9px] font-black text-green-400 uppercase tracking-[0.2em] transition-colors">
                        Verified User
                    </span>
                    <span className="text-[10px] font-bold text-white truncate max-w-[100px]">{user.displayName}</span>
                </div>
                
                <div className="relative">
                    <img 
                        src={user.photoURL || ''} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border-2 border-orange-500/20 group-hover:border-orange-500 transition-colors shadow-lg"
                    />
                    <div className="absolute -right-1 -top-1 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-[#0f172a]" />
                </div>

                <button 
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all duration-300"
                    title="Sign Out"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-indigo-600/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group border border-white/20"
            >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Connect
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-500 ${showOptions ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-64 p-3 bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] flex flex-col gap-2"
                    >
                        <div className="px-4 py-3 border-b border-white/10 mb-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Select Portal</span>
                            <div className="h-0.5 w-8 bg-indigo-500 mt-1 rounded-full" />
                        </div>
                        
                        <button
                            onClick={() => handleLogin('google')}
                            className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-xs text-white/80 hover:text-white transition-all group/opt border border-white/5 hover:border-white/20"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2 shadow-inner group-hover/opt:rotate-6 transition-transform">
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <span className="block font-black text-[10px] uppercase tracking-wider text-white/40">Continuue with</span>
                                <span className="text-sm font-bold">Google Auth</span>
                            </div>
                        </button>

                        <button
                            onClick={() => handleLogin('github')}
                            className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-xs text-white/80 hover:text-white transition-all group/opt border border-white/5 hover:border-white/20"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center p-2 shadow-inner group-hover/opt:-rotate-6 transition-transform border border-white/20">
                                <Github className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <span className="block font-black text-[10px] uppercase tracking-wider text-white/40">Continuue with</span>
                                <span className="text-sm font-bold">GitHub Portal</span>
                            </div>
                        </button>

                        {!isFirebaseConfigured && (
                            <div className="mt-3 p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl relative overflow-hidden group/warn">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/warn:translate-x-full transition-transform duration-1000" />
                                <p className="text-[10px] text-indigo-400 font-black leading-tight flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                                    SANDBOX ACTIVE
                                </p>
                                <p className="text-[9px] text-white/40 mt-1 font-medium">Click a provider to enter session experience mode.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
