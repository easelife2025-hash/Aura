import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Mic, Settings, User as UserIcon, LogOut, Loader2, Bot, LayoutDashboard, Calendar, MessageSquare, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

import { db } from './firebase';
import { useAuth } from './hooks/useAuth';
import ParticleBackground from './components/ParticleBackground';
import LandingPage from './components/landing/LandingPage';
import CommandCenter from './components/dashboard/CommandCenter';
import VoiceAssistant from './components/voice/VoiceAssistant';
import { cn } from './utils';
import { Message } from './types';

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

function Workspace({ logout, user }: { logout: () => void, user: any }) {
  const [currentView, setCurrentView] = useState<'chat' | 'dashboard' | 'voice'>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mood, setMood] = useState<'neutral' | 'thinking' | 'active'>('neutral');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!user) return;
    
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

  const handleSubmit = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = customInput || input;
    if (!textToSend.trim() || !user || isTyping) return;

    if (!customInput) setInput('');
    setIsTyping(true);
    setMood('thinking');

    try {
      await addDoc(collection(db, `users/${user.uid}/messages`), {
        role: 'user',
        content: textToSend.trim(),
        timestamp: Date.now(),
        ownerId: user.uid
      });

      const historyContext = messages.slice(-8).map(m => `${m.role === 'assistant' ? 'Aura' : 'User'}: ${m.content}`).join('\n');

      console.log("Sending chat payload to backend...");
      
      const controller = new AbortController();
      // Increase timeout for streaming
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend.trim(),
          historyContext
        }),
        signal: controller.signal
      });

      console.log(`Backend responded with status: ${res.status}`);
      
      if (!res.ok) {
         let errorText = await res.text();
         try {
           const parsed = JSON.parse(errorText);
           if (parsed.error) {
             if (typeof parsed.error === 'object' && parsed.error.message) {
               errorText = parsed.error.message;
             } else {
               errorText = String(parsed.error);
             }
           }
         } catch(e) {}
         
         if (res.status === 429 || errorText.includes("429") || errorText.includes("RESOURCE_EXHAUSTED") || errorText.includes("quota")) {
           throw new Error("API Quota Exceeded: You have reached the limits of the Gemini API Free Tier. Please wait for the quota to reset, or upgrade your billing plan in Google AI Studio.");
         }
         throw new Error(`Server error ${res.status}: ${errorText}`);
      }
      
      if (!res.body) throw new Error("No response body received for streaming.");

      setMood('active');
      setStreamingMessage('');
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      }

      try {
        await addDoc(collection(db, `users/${user.uid}/messages`), {
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
          ownerId: user.uid
        });
      } catch (dbErr) {
        console.error("Failed to save assistant message:", dbErr);
      }
      setStreamingMessage(null);
      setTimeout(() => setMood('neutral'), 3000);
    } catch (error: any) {
      console.error("Chat Error Context:", error);
      const errorMessage = `⚠️ Error: ${error.message || "Connection interrupted"}.`;
      setStreamingMessage(errorMessage);
      
      try {
        await addDoc(collection(db, `users/${user.uid}/messages`), {
          role: 'assistant',
          content: errorMessage,
          timestamp: Date.now(),
          ownerId: user.uid
        });
      } catch (dbErr: any) {
        console.error("Failed to log error to Firestore:", dbErr);
        // Alert if the database write failed
        alert("Action failed. Your Firestore Security Rules may be blocking read/write!");
      }
      setTimeout(() => setStreamingMessage(null), 8000); // clear after 8s
      setMood('neutral');
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 50);
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setMood('active');
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      setMood('neutral');
    };

    recognition.onend = () => {
      setIsListening(false);
      setMood('neutral');
    };

    recognition.start();
  };

  const quickActions = [
    { label: "Summarize Day", icon: LayoutDashboard },
    { label: "Draft Email", icon: MessageSquare },
    { label: "Analyze Schedule", icon: Calendar },
  ];

  return (
    <div className="relative z-10 flex h-[100dvh] w-full overflow-hidden bg-[#050505]/80">
      
      {/* Sidebar Desktop */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex flex-col w-80 border-r border-white/5 p-6 glass-panel rounded-none relative z-20"
      >
         <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/10">
            <Bot className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white tracking-wide text-lg">Aura Workspace</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400/80">ONLINE • SECURE</span>
            </div>
          </div>
        </div>
        
        <nav className="mb-8 space-y-2">
          <button 
            onClick={() => setCurrentView('chat')}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm border",
               currentView === 'chat' ? "bg-white/10 text-white border-white/10 shadow-lg" : "bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-300"
            )}
          >
            <Sparkles className={cn("w-4 h-4", currentView === 'chat' ? "text-purple-400" : "text-slate-500")} />
            Neural Link
          </button>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm border",
               currentView === 'dashboard' ? "bg-white/10 text-white border-white/10 shadow-lg" : "bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-300"
            )}
          >
            <Activity className={cn("w-4 h-4", currentView === 'dashboard' ? "text-cyan-400" : "text-slate-500")} />
            Command Center
          </button>
          <button 
            onClick={() => setCurrentView('voice')}
            className={cn(
               "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm border",
               currentView === 'voice' ? "bg-white/10 text-white border-white/10 shadow-lg" : "bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-300"
            )}
          >
            <Mic className={cn("w-4 h-4", currentView === 'voice' ? "text-emerald-400" : "text-slate-500")} />
            Vocal Interface
          </button>
        </nav>

        <div className="mb-8 flex-1">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-4">Quick Directives</h3>
          <div className="space-y-2">
            {quickActions.map((action, i) => (
               <button 
                 key={i} 
                 onClick={() => handleSubmit(undefined, action.label)}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-slate-300 hover:text-white"
               >
                 <action.icon className="w-4 h-4 text-purple-400" />
                 <span className="text-sm">{action.label}</span>
               </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon className="w-5 h-5 text-slate-400" />}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-medium text-white truncate max-w-[120px]">{user.displayName || "Operator"}</span>
                   <span className="text-xs text-slate-500">Connected</span>
                 </div>
              </div>
              <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-full transition-all">
                 <LogOut className="w-4 h-4" />
              </button>
           </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 w-full lg:max-w-[calc(100vw-20rem)] overflow-hidden">
         {currentView === 'chat' ? (
           <>
             {/* Dynamic Header Orb */}
             <header className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-20 flex justify-center pt-6">
                <motion.div 
                   animate={{ 
                     scale: mood === 'thinking' ? [1, 1.2, 1] : mood === 'active' ? [1, 1.1, 1] : 1,
                     opacity: mood === 'neutral' ? 0.5 : 1
                   }}
                   transition={{ duration: mood === 'thinking' ? 1.5 : 0.5, repeat: mood === 'thinking' ? Infinity : 0 }}
                   className={`w-16 h-16 rounded-full blur-[20px] transition-colors duration-1000 ${
                     mood === 'thinking' ? 'bg-cyan-500/50' : mood === 'active' ? 'bg-purple-500/50' : 'bg-purple-900/30'
                   }`}
                />
             </header>

             {/* Chat Messages */}
             <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 sm:px-8 pt-24 pb-32 space-y-8 scroll-smooth"
            >
          <AnimatePresence initial={false}>
            {messages.length === 0 && !isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto"
              >
                <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                   <motion.div 
                     animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                     transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-cyan-500/20 rounded-full blur-[30px]" 
                   />
                   <Bot className="w-12 h-12 text-slate-300 relative z-10 drop-shadow-2xl" />
                </div>
                <h3 className="text-2xl font-light text-white tracking-tight mb-3">Neural Link Active</h3>
                <p className="text-slate-400 font-light text-sm">Aura is ready. Ask a complicated question, request a summary, or simply converse.</p>
              </motion.div>
            )}

            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                key={msg.id}
                className={cn(
                  "flex w-full gap-4 sm:gap-6",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                )}
                
                <div 
                  className={cn(
                    "max-w-[85%] sm:max-w-[75%] rounded-3xl px-6 py-4 shadow-xl text-[15px] leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-gradient-to-br from-[#1e1e1e] to-[#2d2d2d] border border-white/5 text-slate-200 rounded-tr-sm"
                      : "bg-black/40 backdrop-blur-md border border-white/10 text-slate-200 rounded-tl-sm pointer-events-auto prose prose-invert prose-p:leading-relaxed max-w-none prose-a:text-cyan-400 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:text-white"
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                
                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                     {user.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon className="w-5 h-5 text-slate-400" />}
                  </div>
                )}
              </motion.div>
            ))}

            {streamingMessage !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full gap-4 sm:gap-6 justify-start"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                
                <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl px-6 py-4 shadow-xl text-[15px] leading-relaxed bg-black/40 backdrop-blur-md border border-white/10 text-slate-200 rounded-tl-sm pointer-events-auto prose prose-invert prose-p:leading-relaxed max-w-none prose-a:text-cyan-400 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:text-white">
                  <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                </div>
              </motion.div>
            )}
            
            {isTyping && streamingMessage === null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full gap-6 justify-start"
              >
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                 <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl rounded-tl-sm px-6 py-5 flex items-center gap-2">
                    <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-purple-400 rounded-full" />
                    <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-cyan-400 rounded-full" />
                    <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 bg-emerald-400 rounded-full" />
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Form Floating at Bottom */}
        <div className="absolute bottom-16 lg:bottom-0 inset-x-0 p-4 sm:p-8 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent">
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onSubmit={(e) => handleSubmit(e)}
            className="max-w-4xl mx-auto glass-panel p-2.5 rounded-3xl border border-white/10 flex items-end gap-3 shadow-[0_0_40px_rgba(0,0,0,0.5)] focus-within:border-purple-500/50 focus-within:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all bg-black/60"
          >
            <button 
              type="button"
              onClick={toggleListening}
              className={cn(
                "p-3.5 rounded-2xl transition-all shrink-0",
                isListening 
                  ? "text-red-400 bg-red-400/10 animate-pulse" 
                  : "text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10"
              )}
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
              placeholder="Communicate with Aura..."
              className="w-full bg-transparent text-white outline-none resize-none max-h-40 min-h-[52px] py-3.5 px-2 placeholder:text-slate-600 font-sans tracking-wide text-[15px]"
              rows={1}
            />
            
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3.5 bg-gradient-to-br from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white rounded-2xl transition-all disabled:opacity-50 disabled:grayscale shrink-0 m-0.5 shadow-lg shadow-purple-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </motion.form>
          
          <div className="text-center mt-3 text-xs text-slate-600 font-medium">
            AI Assistant responses may contain inaccuracies. Verify critical information.
          </div>
        </div>
        </>
        ) : currentView === 'dashboard' ? (
          <CommandCenter user={user} />
        ) : (
          <VoiceAssistant 
             user={user} 
             messages={messages} 
             onClose={() => setCurrentView('chat')} 
             isTyping={isTyping}
             sendMessage={async (text) => { await handleSubmit(undefined, text) }}
          />
        )}
        {/* Mobile Navigation */}
        <div className="lg:hidden absolute bottom-0 inset-x-0 h-16 bg-[#050505]/95 backdrop-blur-md border-t border-white/10 z-50 flex items-center justify-around px-4">
          <button 
            onClick={() => setCurrentView('chat')} 
            className={cn("p-2 rounded-full transition-all flex flex-col items-center gap-1", currentView === 'chat' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300')}
          >
            <Sparkles className="w-5 h-5"/>
          </button>
          <button 
            onClick={() => setCurrentView('dashboard')} 
            className={cn("p-2 rounded-full transition-all flex flex-col items-center gap-1", currentView === 'dashboard' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300')}
          >
            <Activity className="w-5 h-5"/>
          </button>
          <button 
            onClick={() => setCurrentView('voice')} 
            className={cn("p-2 rounded-full transition-all flex flex-col items-center gap-1", currentView === 'voice' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300')}
          >
            <Mic className="w-5 h-5"/>
          </button>
          <button 
            onClick={logout} 
            className="p-2 rounded-full transition-all flex flex-col items-center gap-1 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10"
          >
            <LogOut className="w-5 h-5"/>
          </button>
        </div>

      </main>
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
          <LandingPage key="landing" onLogin={login} />
        ) : (
          <Workspace key="chat" logout={logout} user={user} />
        )}
      </AnimatePresence>
    </>
  );
}
