import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Trash2, Zap, Brain, Rocket, Copy, Check, RotateCcw, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getLocalAIResponse } from '../services/aiLogic';
import { fetchAIResponse, askResearchQuestion, askQuickResearchQuestion, streamResearchQuestion } from '../services/apiService';

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
    const safeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char))
        .replace(/```([\s\S]*?)```/g, '<pre class="my-3 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] text-orange-100"><code>$1</code></pre>')
        .replace(/^### (.*)$/gm, '<h4 class="mt-4 mb-1 text-xs font-black uppercase tracking-widest text-orange-300">$1</h4>')
        .replace(/^## (.*)$/gm, '<h3 class="mt-4 mb-2 text-base font-black text-white">$1</h3>')
        .replace(/^[-•] (.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-black">$1</b>')
        .replace(/`([^`]+)`/g, '<code class="rounded bg-black/30 px-1.5 py-0.5 text-orange-200">$1</code>')
        .replace(/\n/g, '<br/>');
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
    const [researchMode, setResearchMode] = useState<'quick' | 'deep'>('quick');
    const [researchStage, setResearchStage] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

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

    const handleSend = async (customPrompt?: string, modeOverride?: 'quick' | 'deep') => {
        const promptToUse = customPrompt || input;
        const mode = modeOverride || researchMode;
        if (!promptToUse.trim() || isTyping) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setMessages(prev => [...prev, { role: 'user', content: promptToUse, timestamp }]);
        if (!customPrompt) setInput('');
        setIsTyping(true);
        abortRef.current = new AbortController();
        setResearchStage(mode === 'deep' ? 'Understanding question…' : '');

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

            let response: string;
            const owner = lastProject?.owner?.login;
            const repo = lastProject?.url.match(/github\.com\/[^/]+\/([^/?#]+)/)?.[1];
            if (lastProject?.platform === 'GitHub' && owner && repo && localStorage.getItem('project-finder-token')) {
                if (mode === 'quick') {
                    const research = await askQuickResearchQuestion(promptToUse, undefined, { owner, repo });
                    response = research.answer;
                } else {
                    setResearchStage('Searching and ranking repository evidence…');
                    setResearchStage('Generating grounded answer…');
                    let streamed = '';
                    setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                    for await (const event of streamResearchQuestion(promptToUse, { owner, repo }, abortRef.current.signal)) {
                        if (event.token) { streamed += event.token; setMessages(prev => prev.map((message, index) => index === prev.length - 1 ? { ...message, content: streamed } : message)); }
                    }
                    response = '';
                }
            } else response = await fetchAIResponse(promptToUse, context);
            if (response) setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
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
            abortRef.current = null;
            setIsTyping(false);
            setResearchStage('');
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
        { label: "Explain Architecture", prompt: "Explain this repository's architecture and main data flow.", icon: Brain, mode: 'deep' as const },
        { label: "Analyze Tech Stack", prompt: "Analyze the technologies, frameworks, databases, and dependencies used in this repository.", icon: Zap, mode: 'deep' as const },
        { label: "How To Run", prompt: "How do I install and run this repository?", icon: Rocket, mode: 'quick' as const },
        { label: "Explain Code", prompt: "Explain the most important code paths and files in this repository.", icon: Code2, mode: 'deep' as const },
        { label: "Find Authentication", prompt: "Where is authentication implemented and how does it work?", icon: Brain, mode: 'deep' as const },
        { label: "Find Database", prompt: "Which database does this repository use and where is it configured?", icon: Zap, mode: 'quick' as const },
        { label: "Find AI Components", prompt: "Find and explain the AI, embedding, or RAG components in this repository.", icon: Brain, mode: 'deep' as const },
        { label: "Find Similar Projects", prompt: "Find similar projects and explain how they compare with this repository.", icon: Sparkles, mode: 'deep' as const }
    ];

    return (
        <div className="fixed top-24 right-6 z-[100] pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="w-[calc(100vw-2rem)] max-w-[480px] h-[min(720px,calc(100vh-7rem))] glass-card rounded-3xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-6 bg-transparent border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg border border-orange-500/30">
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
                                <button onClick={clearChat} className="flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors" title="Start a new chat">
                                    <Trash2 size={14} /> <span className="hidden sm:inline">New Chat</span>
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-white/20 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="px-6 pt-4 flex items-center gap-2"><button onClick={() => setResearchMode('quick')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${researchMode === 'quick' ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-500'}`}>⚡ Quick</button><button onClick={() => setResearchMode('deep')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${researchMode === 'deep' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-500'}`}>🔬 Deep Research</button>{researchStage && <span className="ml-auto truncate text-[9px] text-purple-300">{researchStage}</span>}</div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
                            {messages.length === 1 && !isTyping && <div className="rounded-2xl border border-orange-500/15 bg-orange-500/[0.04] p-4 text-center"><p className="text-xs font-bold text-gray-300">Explore this project with TECHBOY AI</p><p className="mt-1 text-[10px] text-gray-500">Ask about its architecture, code, stack, or how to run it.</p></div>}
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[92%] p-4 text-[13px] leading-relaxed font-medium ${msg.role === 'assistant' ? 'w-full rounded-2xl border border-white/10 bg-white/[0.045] text-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.18)]' : 'rounded-2xl border border-white/5 bg-[#181a20] text-gray-200 shadow-sm'} ${
                                        msg.role === 'user'
                                            ? 'rounded-tr-md'
                                            : ''
                                    }`}>
                                        {msg.role === 'assistant' && <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-orange-400"><Bot size={13} /> TECHBOY AI <span className="text-white/30">· Research Assistant</span></div>}
                                        <div dangerouslySetInnerHTML={{ __html: safeHtml(msg.content) }} />
                                        {msg.role === 'assistant' && msg.content && <div className="mt-2 flex gap-3"><button onClick={() => { navigator.clipboard.writeText(msg.content); setCopiedIndex(i); setTimeout(() => setCopiedIndex(null), 1500); }} className="text-gray-500 hover:text-white" title="Copy answer">{copiedIndex === i ? <Check size={13} /> : <Copy size={13} />}</button><button onClick={() => { const previous = messages[i - 1]; if (previous?.role === 'user') handleSend(previous.content); }} className="text-gray-500 hover:text-white" title="Regenerate answer"><RotateCcw size={13} /></button></div>}
                                        <div className={`text-[9px] mt-1 opacity-40 font-bold ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.045] p-4 flex gap-1.5 items-center">
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
                                            onClick={() => { setResearchMode(action.mode); handleSend(action.prompt, action.mode); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-[11px] font-bold text-gray-300 whitespace-nowrap hover:bg-white/10 hover:border-orange-500/30 transition-all active:scale-95"
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
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
                                    placeholder="Ask about this project, code, stack, or architecture..."
                                    disabled={isTyping}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-full py-3.5 px-6 pr-14 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-gray-600 font-display disabled:opacity-50"
                                />
                                <button
                                    onClick={() => isTyping ? abortRef.current?.abort() : handleSend()}
                                    disabled={!isTyping && !input.trim()}
                                    className="absolute right-2 p-2.5 rounded-full bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-all disabled:opacity-30"
                                >
                                    {isTyping ? <X size={18} /> : <Send size={16} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
