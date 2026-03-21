import React, { useState } from 'react';
import { User as UserIcon, LogOut, ShieldCheck, Github, ChevronDown, LayoutDashboard, Mail, Lock, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, signupUser } from '../services/apiService';

interface AuthButtonProps {
    onViewDashboard?: () => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ onViewDashboard }) => {
    const [user, setUser] = useState<any>(() => {
        const saved = localStorage.getItem('project-finder-user');
        return saved ? JSON.parse(saved) : null;
    });
    const [showOptions, setShowOptions] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let data;
            if (isLoginView) {
                data = await loginUser(email, password);
            } else {
                data = await signupUser(username, email, password);
            }
            
            const userData = {
                uid: data.user.id,
                displayName: data.user.username,
                email: data.user.email,
                photoURL: null
            };
            
            localStorage.setItem('project-finder-token', data.token);
            localStorage.setItem('project-finder-user', JSON.stringify(userData));
            setUser(userData);
            setShowOptions(false);
            window.dispatchEvent(new Event('storage'));
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('project-finder-token');
        localStorage.removeItem('project-finder-user');
        localStorage.removeItem('project-finder-favorites');
        setUser(null);
        window.dispatchEvent(new Event('storage'));
    };

    if (user) {
        return (
            <div className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full bg-[#0f172a]/80 border border-white/10 backdrop-blur-3xl group shadow-2xl hover:border-orange-500/30 transition-all duration-500">
                <button 
                    onClick={onViewDashboard}
                    className="flex flex-col items-end pr-2 hidden sm:flex cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <div className="flex flex-col items-start leading-none gap-0.5 hidden sm:flex">
                        <span className="text-[10px] font-black text-white tracking-tighter uppercase">Verified User</span>
                        <span className="text-[9px] font-bold text-blue-400 tracking-widest uppercase truncate max-w-[80px]">
                            {user.displayName || user.username}
                        </span>
                    </div>
                </button>
                
                <button onClick={onViewDashboard} className="relative cursor-pointer hover:scale-105 transition-transform">
                    <img 
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=f97316&color=fff`} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border-2 border-orange-500/20 group-hover:border-orange-500 transition-colors shadow-lg"
                    />
                    <div className="absolute -right-1 -top-1 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-[#0f172a]" />
                </button>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <button 
                    onClick={onViewDashboard}
                    className="p-2 rounded-full hover:bg-orange-500/10 text-gray-500 hover:text-orange-400 transition-all"
                    title="Dashboard"
                >
                    <LayoutDashboard className="w-4 h-4" />
                </button>

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
                className="flex items-center gap-2.5 px-3 md:px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-indigo-600/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group border border-white/20"
            >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline-block">Signup / Login</span>
            </button>

            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-72 p-4 bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] flex flex-col gap-4"
                    >
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{isLoginView ? 'Login' : 'Sign Up'}</span>
                            <button 
                                onClick={() => setIsLoginView(!isLoginView)}
                                className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                            >
                                {isLoginView ? 'Create Account' : 'Back to Login'}
                            </button>
                        </div>

                        <form onSubmit={handleAuth} className="flex flex-col gap-3">
                            {!isLoginView && (
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                    <input 
                                        type="text" 
                                        placeholder="USERNAME" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[10px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all uppercase tracking-widest"
                                    />
                                </div>
                            )}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                <input 
                                    type="email" 
                                    placeholder="EMAIL ADDRESS" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[10px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all uppercase tracking-widest"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                <input 
                                    type="password" 
                                    placeholder="PASSWORD" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[10px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all uppercase tracking-widest"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? 'Processing...' : isLoginView ? (
                                    <>Access Portal <LogIn className="w-3.5 h-3.5" /></>
                                ) : (
                                    <>Initialize Account <UserPlus className="w-3.5 h-3.5" /></>
                                )}
                            </button>
                        </form>

                        <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                            <p className="text-[10px] text-indigo-400 font-black leading-tight flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                                SECURE ACCESS
                            </p>
                            <p className="text-[9px] text-white/40 mt-1 font-medium">Your credentials are encrypted and stored in our local database.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
