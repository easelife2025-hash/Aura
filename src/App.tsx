import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Mic, Settings, User as UserIcon, LogOut, Loader2, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

import { db } from './firebase';
import { useAuth } from './hooks/useAuth';
import ParticleBackground from './components/ParticleBackground';
import { cn } from './utils';
import { Message } from './types';

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="glass-panel p-10 rounded-3xl max-w-md w-full flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 z-0 pointer-events-none rounded-3xl animate-gradient" />
        
        <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6 z-10 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
          <Sparkles className="w-10 h-10 text-purple-400" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2 tracking-tight z-10 font-sans">
          Welcome to <span className="text-gradient">Aura</span>
        </h1>
        <p className="text-slate-400 mb-8 z-10 font-light">
          Your next-generation AI companion. Deeply empathetic, hyper-competent.
        </p>

        <button 
          onClick={onLogin}
          className="relative z-10 group w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <UserIcon className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
          <span className="font-medium text-slate-200 group-hover:text-white transition-colors">Authenticate to Access</span>
        </button>
      </motion.div>
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div className="relative z-10 flex items-center justify-center min-h-screen">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        <span className="text-sm font-mono text-slate-400 tracking-widest uppercase">Initializing Systems</span>
      </motion.div>
    </div>
  );
}

function ChatInterface({ logout, user }: { logout: () => void, user: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to user's messages
    const q = query(
      collection(db, `users/${user.uid}/messages`), 
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessageContent = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      // 1. Save user message to Firestore
      await addDoc(collection(db, `users/${user.uid}/messages`), {
        role: 'user',
        content: userMessageContent,
        timestamp: Date.now(), // standard integer timestamp per rules
        ownerId: user.uid
      });

      // Compress history for context (last 6 messages max)
      const historyContext = messages.slice(-6).map(m => `${m.role === 'assistant' ? 'Aura' : 'User'}: ${m.content}`).join('\n');

      // 2. Call backend for Gemini response
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessageContent,
          historyContext
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // 3. Save assistant response to Firestore
      await addDoc(collection(db, `users/${user.uid}/messages`), {
        role: 'assistant',
        content: data.text,
        timestamp: Date.now(),
        ownerId: user.uid
      });
    } catch (error) {
      console.error("Chat Error:", error);
      // Fallback response on error
      await addDoc(collection(db, `users/${user.uid}/messages`), {
        role: 'assistant',
        content: "I apologize, my cognitive link was temporarily disrupted. Could you repeat that?",
        timestamp: Date.now(),
        ownerId: user.uid
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col h-[100dvh] max-w-5xl mx-auto p-4 sm:p-6">
      
      {/* Top Navbar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between py-4 px-6 rounded-2xl glass-panel mb-6 border border-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 tracking-wide text-lg">Aura</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-400">ONLINE</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-full hover:bg-rose-400/10"
            title="Disconnect"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-6 pr-2 rounded-2xl space-y-6 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && !isTyping && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center"
            >
              <Sparkles className="w-12 h-12 text-slate-700 mb-4" />
              <h3 className="text-xl font-medium text-slate-300">Cognitive Link Established</h3>
              <p className="text-slate-500 mt-2 max-w-sm">I'm Aura, your personal intelligence. How may I assist you today?</p>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              key={msg.id}
              className={cn(
                "flex w-full gap-4",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}
              
              <div 
                className={cn(
                  "max-w-[80%] rounded-2xl px-5 py-3.5 shadow-lg",
                  msg.role === 'user' 
                    ? "bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-white/10 text-white rounded-tr-sm"
                    : "glass-panel text-slate-200 rounded-tl-sm pointer-events-auto prose prose-invert prose-p:leading-relaxed max-w-none prose-a:text-cyan-400 prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10"
                )}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full gap-4 justify-start"
            >
               <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
               <div className="glass-panel rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <motion.form 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit}
        className="glass-panel p-2 rounded-2xl border border-white/10 flex items-end gap-2 relative group focus-within:border-purple-500/50 transition-colors"
      >
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
        
        <button 
          type="button"
          className="p-3 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
        >
          <Mic className="w-5 h-5" />
        </button>
        
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Message Aura..."
          className="w-full bg-transparent text-white outline-none resize-none max-h-32 min-h-[44px] py-3 px-2 placeholder:text-slate-500 font-sans tracking-wide"
          rows={1}
        />
        
        <button 
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 m-1"
        >
          <Send className="w-5 h-5" />
        </button>
      </motion.form>

    </div>
  );
}

export default function App() {
  const { user, loading, login, logout } = useAuth();

  return (
    <>
      <ParticleBackground />
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingScreen key="loading" />
        ) : !user ? (
          <LoginScreen key="login" onLogin={login} />
        ) : (
          <ChatInterface key="chat" logout={logout} user={user} />
        )}
      </AnimatePresence>
    </>
  );
}
