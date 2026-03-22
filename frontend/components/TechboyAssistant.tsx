import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface TechboyAssistantProps {
    projects?: Project[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const TechboyAssistant: React.FC<TechboyAssistantProps> = ({ 
    projects = [], 
    isOpen, 
    setIsOpen 
}) => {
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            content: "I'm Techboy AI, your advanced project research partner. Ask me anything about these projects or what you should build next!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 🔄 Load Chat History
    useEffect(() => {
        const user = auth?.currentUser;
        if (!user || !isFirebaseConfigured || !db) return;

        const loadHistory = async () => {
            const chatRef = doc(db, 'chats', user.uid);
            const docSnap = await getDoc(chatRef);
            if (docSnap.exists()) {
                setMessages(docSnap.data().messages);
            }
        };

        loadHistory();
    }, [isOpen, auth?.currentUser]); // Reload when opened or user changes

    // 💾 Save Chat History
    useEffect(() => {
        if (messages.length <= 1) return;
        const user = auth?.currentUser;
        if (!user || !isFirebaseConfigured || !db) return;

        const saveHistory = async () => {
            setIsSyncing(true);
            try {
                const chatRef = doc(db, 'chats', user.uid);
                await setDoc(chatRef, { messages, lastUpdated: new Date().toISOString() }, { merge: true });
            } catch (err) {
                console.error("Firestore save error:", err);
            } finally {
                setTimeout(() => setIsSyncing(false), 800);
            }
        };

        const timeout = setTimeout(saveHistory, 1500); // 1.5s Debounce
        return () => clearTimeout(timeout);
    }, [messages, auth?.currentUser]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const parseStars = (stars?: string | number): number => {
        if (!stars) return 0;
        if (typeof stars === 'number') return stars;
        const s = stars.toLowerCase();
        if (s.endsWith('k')) return parseFloat(s) * 1000;
        if (s.endsWith('m')) return parseFloat(s) * 1000000;
        return parseInt(s) || 0;
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp }]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const lowInput = userMsg.toLowerCase();
            let botResponse = "I'm processing your inquiry through my discovery neural net...";

            // 🧠 Contextual Intelligence
            const matchedProject = projects.find(p => 
                lowInput.includes(p.name.toLowerCase()) || 
                (p.tags?.some(t => lowInput.includes(t.toLowerCase())))
            );

            if (lowInput.includes('about') && matchedProject) {
                botResponse = `**${matchedProject.name}** is a standout project on ${matchedProject.platform}. \n\n**Insight:** ${matchedProject.description}\n\n**Tech:** ${matchedProject.tags?.join(', ') || 'Various'}. It has **${matchedProject.stars}** stars.`;
            } else if (lowInput.includes('compare')) {
                if (projects.length >= 2) {
                    botResponse = `Comparing **${projects[0].name}** vs **${projects[1].name}**. ${projects[0].name} is great for ${projects[0].tags?.[0] || 'core features'}, while ${projects[1].name} excels in ${projects[1].tags?.[0] || 'alternatives'}.`;
                } else {
                    botResponse = "I need more projects in view to compare! Try a broader search.";
                }
            } else if (lowInput.includes('who are you') || lowInput.includes('creator') || lowInput.includes('raghu')) {
                botResponse = "I am **TECHBOY AI**, engineered by **Raghu Chimata** to be your ultimate companion in project discovery. My mission is to simplify the complex world of open source.";
            } else {
                botResponse = "I've analyzed the current results. Ask me to compare projects, recommend a stack, or tell you more about any repository you see!";
            }

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: botResponse, 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
            setIsTyping(false);
        }, 1200);
    };

    const clearChat = () => {
        setMessages([{ 
            role: 'assistant', 
            content: "Chat history cleared. What's our next objective?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    return (
        <div className="fixed top-24 right-6 z-[100] pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="w-[calc(100vw-3rem)] max-w-[420px] h-[600px] bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-orange-600/10 to-transparent border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg border border-white/20 animate-pulse">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 font-display">
                                        Techboy AI
                                        {isSyncing && (
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                                <Sparkles className="w-3 h-3 text-orange-400" />
                                            </motion.div>
                                        )}
                                    </h3>
                                    <span className="text-[10px] font-bold text-orange-500/80 uppercase tracking-tighter">
                                        {isSyncing ? 'Cloud Syncing...' : 'TECHBOY AI'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={clearChat} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-white/20 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-3xl text-[13px] leading-relaxed font-medium shadow-sm ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-tr-none'
                                             : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-md'
                                    }`}>
                                        {msg.content}
                                        <div className={`text-[9px] mt-1 opacity-40 font-bold ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/10 flex gap-1.5">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 pt-2">
                            <div className="relative flex items-center group">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about projects, stars, or tech..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-600 font-display"
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 p-2.5 rounded-xl bg-orange-600/20 text-orange-500 hover:bg-orange-600 hover:text-white transition-all shadow-lg"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
