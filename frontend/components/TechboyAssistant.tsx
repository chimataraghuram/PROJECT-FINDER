import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Trash2, Zap, Brain, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getLocalAIResponse } from '../services/aiLogic';
import { fetchAIResponse } from '../services/apiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface TechboyAssistantProps {
    projects?: Project[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    currentSearch?: string;
    lastProject?: Project | null;
}

export const TechboyAssistant: React.FC<TechboyAssistantProps> = ({ 
    projects = [], 
    isOpen, 
    setIsOpen,
    currentSearch = "",
    lastProject = null
}) => {
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            content: "I'm TECHBOY AI, your advanced project research partner. Ask me anything about these projects or what you should build next!",
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
    }, [isOpen]);

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

        const timeout = setTimeout(saveHistory, 1500);
        return () => clearTimeout(timeout);
    }, [messages]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (customPrompt?: string) => {
        const promptToUse = customPrompt || input;
        if (!promptToUse.trim() || isTyping) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setMessages(prev => [...prev, { role: 'user', content: promptToUse, timestamp }]);
        if (!customPrompt) setInput('');
        setIsTyping(true);

        try {
            // 🤖 ATTEMPT BACKEND LLM (OpenRouter/Gemini)
            const context = {
                search: currentSearch,
                project: lastProject ? {
                    name: lastProject.name,
                    description: lastProject.description,
                    language: lastProject.language
                } : null
            };

            const response = await fetchAIResponse(promptToUse, context);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response, 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
        } catch (error) {
            console.warn("Backend AI failed, falling back to local rule-based logic:", error);
            
            // 🧠 FALLBACK TO LOCAL RULE-BASED LOGIC
            // Add a small delay for natural feel if falling back
            await new Promise(resolve => setTimeout(resolve, 500));
            const localResponse = getLocalAIResponse(promptToUse, lastProject);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: localResponse, 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const clearChat = () => {
        setMessages([{ 
            role: 'assistant', 
            content: "Chat history cleared. What's our next objective?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const QUICK_ACTIONS = [
        { label: "Suggest Projects", prompt: "Suggest project ideas based on my interests", icon: Rocket },
        { label: "Brainstorm Tech", prompt: "Recommend a modern tech stack for a full-stack project", icon: Brain },
        { label: "Difficulty Check", prompt: "How difficult are these projects for a beginner?", icon: Zap }
    ];

    return (
        <div className="fixed top-24 right-6 z-[100] pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="w-[calc(100vw-3rem)] max-w-[420px] h-[650px] bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-orange-600/10 to-transparent border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg border border-white/20">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex-1">
                                        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 font-display">
                                            <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                            Techboy AI
                                            {isSyncing && (
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                                    <Sparkles className="w-3 h-3 text-orange-400" />
                                                </motion.div>
                                            )}
                                        </h2>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                                                {isTyping ? 'TECHBOY AI is thinking...' : 'ONLINE & READY'}
                                            </span>
                                            {lastProject && (
                                                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest ml-2 border border-orange-500/20 px-1.5 py-0.5 rounded-md bg-orange-500/5">
                                                    Focus: {lastProject.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
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
                                            ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-tr-none shadow-orange-500/20'
                                             : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-md'
                                    }`}>
                                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-black">$1</b>').replace(/\n/g, '<br/>') }} />
                                        <div className={`text-[9px] mt-1 opacity-40 font-bold ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/10 flex gap-1.5 items-center">
                                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mr-2">Thinking</span>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 pt-2 space-y-4">
                            {/* Quick Actions */}
                            {!isTyping && messages.length < 10 && (
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                    {QUICK_ACTIONS.map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(action.prompt)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-300 whitespace-nowrap hover:bg-white/10 hover:border-orange-500/30 transition-all active:scale-95"
                                        >
                                            <action.icon className="w-3 h-3 text-orange-500" />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="relative flex items-center group">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about projects, stars, or tech..."
                                    disabled={isTyping}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-600 font-display disabled:opacity-50"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isTyping || !input.trim()}
                                    className="absolute right-2 p-2.5 rounded-xl bg-orange-600/20 text-orange-500 hover:bg-orange-600 hover:text-white transition-all shadow-lg disabled:opacity-30"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="text-[8px] text-center text-gray-600 font-bold uppercase tracking-widest">
                                Enhanced by Techboy Discovery Engine
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
