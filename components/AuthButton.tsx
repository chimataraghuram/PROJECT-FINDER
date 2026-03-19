import React from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { User as UserIcon, LogOut, ShieldCheck, Sparkles } from 'lucide-react';


export const AuthButton: React.FC = () => {
    const [user, setUser] = React.useState(auth?.currentUser || null);

    React.useEffect(() => {
        if (!auth) return;
        const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        if (!auth) {
            alert("Firebase not initialized. Check your config!");
            return;
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error("Login failed:", error);
            if (error.code === 'auth/invalid-api-key') {
                alert("Invalid Firebase API Key. Please update services/firebase.ts with your actual project keys!");
            }
        }
    };

    const handleLogout = () => auth && signOut(auth);



    if (user) {
        return (
            <div className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl group shadow-2xl hover:border-orange-500/30 transition-all duration-500">
                <div className="flex flex-col items-end pr-2 hidden sm:flex">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] group-hover:text-orange-400/60 transition-colors">Verified</span>
                    <span className="text-[10px] font-bold text-white truncate max-w-[80px]">{user.displayName}</span>
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
        <button
            onClick={handleLogin}
            className="flex items-center gap-2.5 px-6 py-2 rounded-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
        >
            Sign Up
        </button>
    );
};
