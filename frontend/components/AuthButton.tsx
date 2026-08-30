import React, { useState } from 'react';
import { User as UserIcon, LogOut, ShieldCheck, Github, ChevronDown, LayoutDashboard, Mail, Lock, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginUser, signupUser, fetchCurrentUser, requestPasswordReset, resendVerification } from '../services/apiService';

interface AuthButtonProps {
    onViewDashboard?: () => void;
    minimal?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ onViewDashboard, minimal }) => {
    const [user, setUser] = useState<any>(() => {
        const saved = localStorage.getItem('project-finder-user');
        return saved ? JSON.parse(saved) : null;
    });
    const [showOptions, setShowOptions] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);
    const [isResetView, setIsResetView] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem('project-finder-token');
        if (!token) return;
        fetchCurrentUser(token).then(data => {
            const userData = { uid: data._id, displayName: data.username, email: data.email, emailVerified: data.emailVerified, photoURL: null };
            setUser(userData);
            localStorage.setItem('project-finder-user', JSON.stringify(userData));
        }).catch(() => {
            localStorage.removeItem('project-finder-token');
            localStorage.removeItem('project-finder-user');
            setUser(null);
        });
    }, []);

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
                emailVerified: data.emailVerified,
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

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault(); setIsLoading(true); setResetMessage('');
        try { const data = await requestPasswordReset(email); setResetMessage(data.message); }
        catch (error: any) { setResetMessage(error.message); }
        finally { setIsLoading(false); }
    };

    const handleLogout = () => {
        localStorage.removeItem('project-finder-token');
        localStorage.removeItem('project-finder-user');
        localStorage.removeItem('project-finder-favorites');
        setUser(null);
        window.dispatchEvent(new Event('storage'));
    };

    if (user) {
        if (minimal) {
            return (
                <>
                    <button onClick={onViewDashboard} className="p-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-lg cursor-pointer hover:scale-105 transition-transform"><UserIcon className="w-4 h-4" /></button>
                    {user.emailVerified === false && <button onClick={async () => { try { const data = await resendVerification(user.email); alert(data.message); } catch { alert('Unable to resend verification'); } }} className="text-[9px] text-yellow-400 hover:text-yellow-300 uppercase tracking-widest">Verify email</button>}
                </>
            );
        }
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
                        {user.emailVerified === false && <button onClick={async () => { try { const data = await resendVerification(user.email); alert(data.message); } catch { alert('Unable to resend verification'); } }} className="text-[8px] text-yellow-400 uppercase tracking-widest">Verify email</button>}
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
                className={minimal 
                    ? "p-2.5 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors" 
                    : "flex items-center gap-3 px-4 md:px-6 py-2.5 rounded-full bg-white text-gray-700 font-medium text-sm shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-[0.98] transition-all duration-300 border border-gray-300"
                }
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {!minimal && <span className="hidden sm:inline-block">Sign in with Google</span>}
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
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{isResetView ? 'Reset Password' : isLoginView ? 'Login' : 'Sign Up'}</span>
                            <button 
                                onClick={() => { setIsResetView(false); setIsLoginView(!isLoginView); }}
                                className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                            >
                                {isResetView ? 'Back to Login' : isLoginView ? 'Create Account' : 'Back to Login'}
                            </button>
                        </div>

                        <form onSubmit={isResetView ? handleReset : handleAuth} className="flex flex-col gap-3">
                            {!isLoginView && !isResetView && (
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
                            {!isResetView && <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                                <input 
                                    type="password" 
                                    placeholder="PASSWORD" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[10px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all uppercase tracking-widest"
                                />
                            </div>}
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? 'Processing...' : isResetView ? 'Send Reset Instructions' : isLoginView ? (
                                    <>Access Portal <LogIn className="w-3.5 h-3.5" /></>
                                ) : (
                                    <>Initialize Account <UserPlus className="w-3.5 h-3.5" /></>
                                )}
                            </button>
                        </form>
                        {isLoginView && !isResetView && <button onClick={() => { setIsResetView(true); setResetMessage(''); }} className="text-[9px] text-indigo-400 hover:text-indigo-300 uppercase tracking-widest text-center">Forgot password?</button>}
                        {resetMessage && <p className="text-[10px] text-green-400 text-center leading-relaxed">{resetMessage}</p>}

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
