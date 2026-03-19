import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, Flame, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';

interface Message {
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
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
            role: 'bot', 
            text: "Namaste! I'm Techboy AI, your personalized project brain. I've analyzed our current discovery results. What would you like to know?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);


    const findProjectsByTopic = (topic: string) => {
        const query = topic.toLowerCase();
        return projects.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query) ||
            p.tags?.some(t => t.toLowerCase().includes(query))
        ).slice(0, 3);
    };

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
        setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: new Date() }]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const lowInput = userMsg.toLowerCase();
            let botResponse = "I'm analyzing our discovery database... ";

            // 🧠 Massive Knowledge Logic
            if (lowInput.includes('best') || lowInput.includes('recommend') || lowInput.includes('top')) {
                const top = [...projects].sort((a, b) => parseStars(b.stars) - parseStars(a.stars))[0];
                if (top) {
                    botResponse = `Based on my current analysis of the trending results, the definitive top project is **${top.name}** with **${top.stars}** stars on ${top.platform}. \n\nDirect Insight: "${top.description.substring(0, 120)}..."`;
                } else {
                    botResponse = "To give you a definitive recommendation, try searching for a topic like 'React', 'AI', or 'Python' in the main search bar first!";
                }
            } else if (lowInput.includes('python') || lowInput.includes('react') || lowInput.includes('machine learning') || lowInput.includes('ai') || lowInput.includes('ml')) {
                const topic = lowInput.match(/(python|react|machine learning|ai|ml|go|rust|dataset)/)?.[0] || 'projects';
                const related = findProjectsByTopic(topic);
                if (related.length > 0) {
                    botResponse = `I found **${related.length}** high-fidelity projects specifically for "${topic}". \n\nThe most prominent is **${related[0].name}** (${related[0].stars} stars). It's an elite choice for your research.`;
                } else {
                    botResponse = `I don't see any "${topic}" specific projects in the current live set. Try a broader search above, and I'll analyze the new results!`;
                }
            } else if (lowInput.includes('who are you') || lowInput.includes('creator') || lowInput.includes('name')) {
                botResponse = "I am **TECHBOY AI**, the autonomous intelligence of the Project Finder ecosystem. I was crafted by **Raghu** to simplify complex project discovery for students and developers.";
            } else if (lowInput.includes('hugging face') || lowInput.includes('kaggle') || lowInput.includes('github')) {
                const plat = lowInput.includes('hugging') ? 'Hugging Face' : lowInput.includes('kaggle') ? 'Kaggle' : 'GitHub';
                const platProjects = projects.filter(p => p.platform === plat);
                botResponse = `In our current view, there are **${platProjects.length}** projects from **${plat}**. \n\n${platProjects.length > 0 ? `The top ${plat} project is **${platProjects[0].name}**.` : `Try searching for something else to see ${plat} results!`}`;
            } else if (lowInput.includes('stars') || lowInput.includes('popular') || lowInput.includes('trending')) {
                const sorted = [...projects].sort((a,b) => parseStars(b.stars) - parseStars(a.stars)).slice(0, 3);
                if (sorted.length > 0) {
                    botResponse = "Here are the top trending projects currently in my view:\n\n" + 
                        sorted.map((p, i) => `${i+1}. **${p.name}** (${p.stars} stars)`).join('\n');
                } else {
                    botResponse = "Start a discovery search above, and I'll rank the best projects for you!";
                }
            } else if (lowInput.includes('how many') || lowInput.includes('total')) {
                botResponse = `We are currently tracking **${projects.length}** elite projects across our integrated platforms.`;
            } else if (lowInput.includes('help') || lowInput.includes('what can you do')) {
                botResponse = "I can help you navigate the world of open-source! Try asking me:\n\n- 'Which project is the most popular?'\n- 'Recommend a Python project.'\n- 'Show me Kaggle datasets.'\n- 'Who created this tool?'";
            } else {
                botResponse = "That's a great question! I'm constantly learning from our search results. Ask me to recommend a project or find a specific tech stack!";
            }

            setMessages(prev => [...prev, { role: 'bot', text: botResponse, timestamp: new Date() }]);
            setIsTyping(false);
        }, 1200);
    };



    const clearChat = () => {
        setMessages([{ 
            role: 'bot', 
            text: "Chat cleared. What's next on our research agenda?",
            timestamp: new Date()
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
                        className="w-[calc(100vw-3rem)] max-w-[420px] h-[600px] bg-[#0f172a]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_rgba(249,115,22,0.1)] flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-orange-600/10 to-transparent border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg border border-white/20 animate-pulse">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">TECHBOY AI</h3>
                                    <span className="text-[10px] font-bold text-orange-500/80 uppercase tracking-tighter mt-1 block">Autonomous Assistant</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={clearChat} className="p-2 text-white/20 hover:text-red-400 transition-colors" title="Clear Chat">
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
                                        {msg.text}
                                        <div className={`text-[9px] mt-1 opacity-40 font-bold ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-600"
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
