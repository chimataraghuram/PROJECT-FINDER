import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'bot';
    text: string;
}

interface TechboyAIProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TechboyAI: React.FC<TechboyAIProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: "Namaste! I'm Techboy AI, your project discovery assistant. How can I help you find your next big project or dataset today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            let botResponse = "That's an interesting question! You can use the main search bar to look up specific technologies, or ask me about how to use Project Finder, its features, or how it was built!";
            const lowInput = userMsg.toLowerCase();

            if (lowInput.includes('how to use') || lowInput.includes('guide') || lowInput.includes('help') || lowInput.includes('tutorial')) {
                botResponse = "Here is how you use Project Finder:\n\n1. 🔍 **Search Engine:** Type any tech stack (like 'React', 'Python', or 'Machine Learning') in the main search bar.\n2. ✨ **Surprise Me:** Click the 'Surprise Me' button or the quick discovery tags to instantly explore trending topics.\n3. 🎛️ **Filters:** Use the platform buttons (GitHub, Kaggle, Hugging Face, LinkedIn) above the results to narrow down your search.\n4. ❤️ **Favorites:** Click the heart icon on any project card to save it. You can access all your saved projects by clicking the 'Favorites' tab at the top!";
            } else if (lowInput.includes('what is this') || lowInput.includes('about') || lowInput.includes('project finder')) {
                botResponse = "Project Finder is a specialized discovery engine designed explicitly for students, developers, and researchers. It aggregates the best open-source projects, machine learning models, and datasets from top platforms like GitHub, Hugging Face, and Kaggle. It acts as a single, beautiful dashboard to find inspiration or resources for your next big project without having to scour multiple websites.";
            } else if (lowInput.includes('build') || lowInput.includes('tech stack') || lowInput.includes('technologies') || lowInput.includes('how it works') || lowInput.includes('developed')) {
                botResponse = "Project Finder is a modern web application built with a powerful tech stack:\n\n🔹 **Frontend:** React 18, Vite, and TypeScript for robust and fast UI rendering.\n🔹 **Styling:** Tailwind CSS combined with Framer Motion for those smooth, 'liquid glass' animations and premium aesthetics.\n🔹 **Icons:** Lucide React for crisp, consistent iconography.\n🔹 **Data APIs:** It seamlessly integrates search features to fetch real-world project data, simulating connections to GitHub and Kaggle ecosystems.";
            } else if (lowInput.includes('github') || lowInput.includes('code') || lowInput.includes('repo')) {
                botResponse = "Looking for code? Project Finder highlights top-starred GitHub repositories. Just select the 'GitHub' filter or type a language like 'React', 'Go', or 'Python' in the search bar to find high-quality open-source codebases.";
            } else if (lowInput.includes('dataset') || lowInput.includes('kaggle') || lowInput.includes('hugging') || lowInput.includes('ai ') || lowInput.includes('models')) {
                botResponse = "For AI enthusiasts, we integrate with Hugging Face and Kaggle! You can easily find the latest AI models, raw datasets, and Machine Learning notebooks. Try searching for 'LLM', 'Stable Diffusion', or 'Computer Vision'.";
            } else if (lowInput.includes('who') || lowInput.includes('creator') || lowInput.includes('raghu') || lowInput.includes('author') || lowInput.includes('made this')) {
                botResponse = "This platform was crafted by **Chimata Raghuram**. He's an AI Engineer and Full-Stack Developer who is passionate about creating beautiful, functional tools for the developer community. You can check out his full portfolio by clicking the 'Developer Portfolio' button in the top right corner!";
            } else if (lowInput.includes('favorite') || lowInput.includes('save') || lowInput.includes('heart') || lowInput.includes('bookmark')) {
                botResponse = "Found something cool? Just click the ❤️ icon on any project card. It will be saved instantly to your local storage, meaning you can close the site, come back later, and view all your saved items anytime in the 'Favorites' tab.";
            } else if (lowInput.includes('techboy') || lowInput.includes('who are you') || lowInput.includes('your name') || lowInput.includes('what are you')) {
                botResponse = "I am **Techboy AI**, your intelligent assistant integrated directly into Project Finder! I am here to help guide you through the platform, explain features, answer questions about the tech stack, and make your project discovery experience as smooth as possible.";
            } else if (lowInput.includes('platform') || lowInput.includes('filter') || lowInput.includes('sort')) {
                botResponse = "Currently, you can filter your project results by 'All', 'GitHub', 'Hugging Face', 'Kaggle', and 'LinkedIn'. Simply use the pill-shaped filter buttons just below the main search bar to narrow down the results to your preferred platform.";
            } else if (lowInput.includes('liquid') || lowInput.includes('design') || lowInput.includes('glass') || lowInput.includes('ui')) {
                botResponse = "You noticed! Project Finder uses a custom 'Liquid Glass' UI design system. It combines deep backgrounds with vibrant glowing borders, backdrop blurs, and jelly-like hover physics to create a premium, immersive user experience.";
            }

            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop click to close */}
                    <div
                        className="fixed inset-0 z-[150]"
                        onClick={onClose}
                    />

                    {/* Dropdown panel anchored top-right under navbar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -16 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className="fixed top-[4.5rem] md:top-[5.5rem] right-2 md:right-6 z-[160] w-[calc(100vw-1rem)] max-w-[400px] h-[520px] bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_0_60px_rgba(249,115,22,0.15),0_25px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Liquid Background Pulse */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-[2rem]" />

                        {/* Connector arrow pointing up to navbar */}
                        <div className="absolute -top-2.5 right-8 md:right-14 w-5 h-5 rotate-45 bg-[#0f172a] border-l border-t border-white/10 z-10" />

                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-orange-600/20 via-red-600/10 to-transparent border-b border-white/10 flex items-center justify-between relative z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg border border-white/20 animate-liquid shrink-0">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none">Techboy AI</h4>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5 block">Project Assistant</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 no-scrollbar relative z-10">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-[12.5px] leading-relaxed font-medium shadow-sm whitespace-pre-line ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white rounded-tr-none'
                                        : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/10 backdrop-blur-md'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-3.5 rounded-2xl rounded-tl-none border border-white/10 flex gap-1.5 backdrop-blur-md">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="px-5 py-4 border-t border-white/10 bg-[#0f172a]/80 backdrop-blur-md relative z-10 shrink-0">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask Techboy about projects..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 pr-12 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-600"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 w-9 h-9 rounded-xl flex items-center justify-center text-orange-400 hover:text-orange-300 hover:bg-white/5 transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
