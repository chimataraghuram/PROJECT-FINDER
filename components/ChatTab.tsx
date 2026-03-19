import React, { useState, useRef, useEffect } from 'react';
import { createChatStream } from '../services/apiService';
import { Send, Bot, User, Zap, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your AI assistant. Ask me anything about coding, projects, or data science.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      // Create a placeholder for the model response
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      const stream = createChatStream(history, userMessage, isFastMode);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
      {/* Header / Mode Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Bot className={`w-5 h-5 ${isFastMode ? 'text-yellow-400' : 'text-blue-400'}`} />
          <span className="font-semibold text-white">AI Chat</span>
          <span className="text-xs text-gray-500 ml-2">
            {isFastMode ? 'Fast Mode' : 'Pro Mode'}
          </span>
        </div>
        
        <button
          onClick={() => setIsFastMode(!isFastMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            isFastMode 
              ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30' 
              : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
          }`}
        >
          {isFastMode ? <Zap className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          {isFastMode ? 'Fast Mode' : 'Pro Mode'}
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-700 flex items-center gap-2">
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isFastMode ? "Ask for a quick fact..." : "Ask a complex question..."}
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};