import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Bot, Mic, Brain, Calendar, Zap, 
  ChevronRight, Star, Cpu, Lock, CheckCircle2,
  Globe, LayoutDashboard, MessageSquare, ChevronDown, Activity, Play
} from 'lucide-react';

export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative z-10 bg-[#000000] min-h-screen text-slate-200 overflow-x-hidden font-sans selection:bg-purple-500/30">
      
      {/* Interactive Background Grid & Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[150px]" 
        />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/50 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 p-[1px]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Aura</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
             <a href="#features" className="hover:text-white transition-colors">Features</a>
             <a href="#voice" className="hover:text-white transition-colors">Voice</a>
             <a href="#memory" className="hover:text-white transition-colors">Memory</a>
             <a href="#productivity" className="hover:text-white transition-colors">Productivity</a>
             <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={onLogin} className="text-sm font-medium hover:text-white transition-colors text-slate-300">Sign In</button>
             <button 
               onClick={onLogin}
               className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
             >
               Get Started
             </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center w-full">
        
        {/* Dynamic Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center text-center w-full min-h-[90vh]">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto flex flex-col items-center relative z-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8 backdrop-blur-md shadow-lg">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Introducing Aura Intelligence</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter text-white mb-6 leading-[1.05]">
              The next evolution of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 animate-gradient">
                human-AI interaction.
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mb-10 font-light leading-relaxed">
              Experience a hyper-intelligent, voice-first companion that seamlessly manages your life, retains infinite memory, and visualizes your world.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button 
                onClick={onLogin}
                className="px-8 py-4 w-full sm:w-auto rounded-full bg-white text-black font-semibold text-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 group shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
              >
                Access Aura
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 w-full sm:w-auto rounded-full bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-colors backdrop-blur-md flex items-center justify-center gap-2 group">
                <Play className="w-4 h-4 fill-current opacity-80 group-hover:opacity-100" />
                View Keynote
              </button>
            </div>
          </motion.div>

          {/* Hero AI Orb Simulation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="relative mt-20 w-full max-w-3xl mx-auto h-[400px] flex items-center justify-center"
          >
            {/* Ambient Base */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />
            
            {/* The Orb container */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 z-10 flex items-center justify-center perspective-[1000px]">
               {/* Animated Hologram Rings */}
               <motion.div 
                  animate={{ rotateX: 60, rotateZ: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-purple-500/30 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.3)]"
               />
               <motion.div 
                  animate={{ rotateX: 60, rotateY: 60, rotateZ: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border border-cyan-400/30 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)]"
               />
               
               {/* Deep Core */}
               <div className="w-32 h-32 md:w-40 md:h-40 bg-black/90 backdrop-blur-3xl border border-white/10 shadow-[inset_0_0_50px_rgba(255,255,255,0.05),0_0_80px_rgba(255,255,255,0.1)] rounded-full flex items-center justify-center z-20 overflow-hidden relative group">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 opacity-30 mix-blend-screen blur-md"
                  />
                  <Bot className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] relative z-10" />
               </div>
            </div>

            {/* Micro Interaction Floating Tags */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[10%] md:left-0 top-[20%] glass-panel pl-2 pr-4 py-2 rounded-full flex items-center gap-3 z-30 shadow-2xl border border-white/10 backdrop-blur-xl bg-black/60"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Activity className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-slate-200">System Online</span>
            </motion.div>

            <motion.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-[10%] md:right-[5%] bottom-[20%] glass-panel pl-2 pr-4 py-2 rounded-full flex items-center gap-3 z-30 shadow-2xl border border-white/10 backdrop-blur-xl bg-black/60"
            >
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-3 h-3 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-slate-200">Context Synced</span>
            </motion.div>

          </motion.div>
        </section>

        {/* Live Interface Preview Showcase */}
        <section id="features" className="py-24 px-6 w-full max-w-7xl relative">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">A hyper-intelligent UI</h2>
             <p className="text-lg text-slate-400">Cinematic, deeply contextual, and terrifyingly fast.</p>
          </div>
          
          <div className="relative mx-auto w-full max-w-5xl aspect-[16/10] md:aspect-[21/9] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-[0_30px_100px_-20px_rgba(0,0,0,1)] flex flex-col justify-end p-6 bg-black/40">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            
            <div className="relative z-10 w-full max-w-3xl mx-auto space-y-6 pb-4">
               <motion.div 
                 initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                 className="self-end ms-auto bg-white/10 backdrop-blur-xl px-6 py-4 rounded-3xl rounded-tr-sm border border-white/10 text-white shadow-2xl text-sm md:text-base w-max max-w-[85%]"
               >
                  "Aura, plan my trip to Kyoto. I need a tight 3-day itinerary focusing on hidden culinary gems."
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                 className="flex gap-4 items-end"
               >
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                   <Sparkles className="w-5 h-5 text-white" />
                 </div>
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-5 rounded-3xl rounded-tl-sm text-slate-200 shadow-2xl text-sm md:text-base leading-relaxed">
                    I've cross-referenced flight schedules and top-rated local izakayas. I secured a window table at a highly-exclusive yakitori bar in Gion for Friday. Shall I add this to your Command Center?
                 </div>
               </motion.div>
            </div>
          </div>
        </section>

        {/* Voice Assistant Showcase */}
        <section id="voice" className="py-24 px-6 w-full max-w-7xl relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
             <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-6">
                  Vocal Intelligence
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">Zero-latency<br/> Voice Mode.</h2>
                <p className="text-lg text-slate-400 mb-8 font-light leading-relaxed">
                  Experience a conversational flow that feels entirely natural. Aura detects emotion, pauses, and tone, responding with lifelike speed and nuance. It's not a chatbot—it's a dialogue.
                </p>
                <div className="space-y-4">
                  {[
                    { title: "Real-time interruption handling", icon: Zap },
                    { title: "Natural vocal synthesized responses", icon: Mic },
                    { title: "Background noise filtration", icon: Activity }
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <f.icon className="w-4 h-4 text-slate-300" />
                      </div>
                      <span className="text-slate-200 font-medium text-sm">{f.title}</span>
                    </div>
                  ))}
                </div>
             </div>
             <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center p-8">
                 <div className="absolute inset-0 bg-cyan-900/10 rounded-[3rem] border border-cyan-500/10 shadow-[inset_0_0_100px_rgba(34,211,238,0.05)]" />
                 
                 {/* Voice Visualizer Mockup */}
                 <div className="relative w-full max-w-md bg-black/80 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-8 shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-16">
                       <div className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-cyan-400" />
                          <span className="text-sm font-semibold text-white tracking-wide">Aura Voice</span>
                       </div>
                       <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">ACTIVE</span>
                    </div>
                    
                    <div className="h-32 flex items-center justify-center gap-2 w-full mb-16">
                       {Array.from({ length: 12 }).map((_, i) => (
                          <motion.div
                             key={i}
                             animate={{ height: [10, 40 + Math.random() * 60, 10] }}
                             transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" }}
                             className="w-2 rounded-full bg-gradient-to-t from-cyan-600 to-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                          />
                       ))}
                    </div>

                    <div className="text-center">
                       <p className="text-slate-400 text-sm font-light">"Listening to your instructions..."</p>
                    </div>
                 </div>
             </div>
          </div>
        </section>

        {/* Memory System Showcase */}
        <section id="memory" className="py-24 px-6 w-full max-w-7xl relative">
          <div className="grid md:grid-cols-2 gap-16 items-center flex-col-reverse md:flex-row-reverse">
             <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold tracking-wide uppercase mb-6">
                  Neural Graph Memory
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">It never forgets.<br/> Ever.</h2>
                <p className="text-lg text-slate-400 mb-8 font-light leading-relaxed">
                  Aura builds a secure, local graph of your life. Over time, it learns your habits, connects the dots between your projects, and anticipates your needs before you even ask.
                </p>
                <div className="space-y-4">
                  {[
                    { title: "Infinite conversational context", desc: "Accesses every chat seamlessly." },
                    { title: "Cross-domain association", desc: "Connects code, docs, and plans." },
                    { title: "Secure local encryption", desc: "Your graph belongs only to you." }
                  ].map((f, i) => (
                    <div key={i} className="flex gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-slate-200 font-medium text-sm mb-1">{f.title}</div>
                        <div className="text-slate-400 text-sm font-light">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center p-8 bg-black/40 rounded-[3rem] border border-white/5">
                {/* Node Graph Mockup */}
                <div className="relative w-full h-full">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
                     <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                  
                  {/* Floating abstract nodes representing memories */}
                  {[
                    { top: '20%', left: '20%', delay: 0 },
                    { top: '80%', left: '30%', delay: 1 },
                    { top: '30%', left: '80%', delay: 2 },
                    { top: '70%', left: '70%', delay: 0.5 },
                  ].map((pos, i) => (
                     <motion.div 
                        key={i}
                        animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity, delay: pos.delay }}
                        className="absolute w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-md"
                        style={{ top: pos.top, left: pos.left }}
                     >
                       <div className="w-2 h-2 rounded-full bg-purple-400" />
                     </motion.div>
                  ))}
                  
                  {/* Connecting lines SVG overlay (static representation) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                     <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                     <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                     <line x1="50%" y1="50%" x2="85%" y2="35%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                     <line x1="50%" y1="50%" x2="35%" y2="85%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                  </svg>
                </div>
             </div>
          </div>
        </section>

        {/* Productivity Command Center Showcase */}
        <section id="productivity" className="py-24 px-6 w-full max-w-7xl">
          <div className="text-center mb-16">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-6">
                Command Center
             </div>
             <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Execute with precision.</h2>
             <p className="text-lg text-slate-400">Your entire life, analyzed, charted, and optimized.</p>
          </div>
          
          <div className="max-w-5xl mx-auto glass-panel border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl relative">
             <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
             
             <div className="grid md:grid-cols-3 gap-6">
               <div className="md:col-span-2 bg-black/60 rounded-3xl border border-white/5 p-6 shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-medium flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-emerald-400" /> Daily Output</h3>
                    <span className="text-3xl font-light text-white">85%</span>
                  </div>
                  <div className="h-40 flex items-end gap-2">
                     {[45, 70, 65, 85, 90, 50, 75].map((h, i) => (
                       <motion.div 
                         key={i}
                         initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }}
                         className="flex-1 bg-gradient-to-t from-emerald-600/50 to-emerald-400 rounded-t-md opacity-80"
                       />
                     ))}
                  </div>
               </div>
               
               <div className="bg-black/60 rounded-3xl border border-white/5 p-6 shadow-inner flex flex-col">
                  <h3 className="text-white font-medium flex items-center gap-2 mb-6"><Calendar className="w-4 h-4 text-blue-400" /> Active Directives</h3>
                  <div className="space-y-3 flex-1">
                     <div className="bg-white/5 p-3 rounded-xl border border-transparent text-sm text-slate-300 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-400" /> Executive Briefing
                     </div>
                     <div className="bg-white/5 p-3 rounded-xl border border-transparent text-sm text-slate-300 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-purple-400" /> Compile Q3 Report
                     </div>
                     <div className="bg-white/5 p-3 rounded-xl border border-transparent text-sm text-slate-300 flex items-center gap-3 opacity-50 line-through">
                       <div className="w-2 h-2 rounded-full bg-slate-600" /> Sync with Design
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 w-full max-w-7xl">
           <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Simple, powerful pricing.</h2>
            <p className="text-lg text-slate-400 font-light">Invest in your second brain. Pay once, or go boundless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Starter */}
            <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col shadow-xl">
              <h3 className="text-xl font-medium mb-2 text-slate-300">Starter</h3>
              <div className="text-4xl font-bold text-white mb-6">Free</div>
              <p className="text-sm text-slate-400 border-b border-white/10 pb-6 mb-6">Essential AI assistance for daily tasks.</p>
              <ul className="space-y-4 flex-1 mb-8">
                {['Gemini 1.5 Flash Model', 'Standard Memory', 'Basic Voice Input', 'Community Support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onLogin} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 font-medium">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 bg-[#0a0a0f] flex flex-col relative transform md:-translate-y-4 shadow-[0_0_80px_rgba(168,85,247,0.15)]">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 text-xs font-bold px-3 py-1 rounded-full text-white shadow-lg">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Boundless</h3>
              <div className="flex items-end gap-1 mb-6">
                <div className="text-5xl font-bold text-white">$20</div>
                <div className="text-sm text-slate-400 mb-2">/mo</div>
              </div>
              <p className="text-sm text-slate-400 border-b border-white/10 pb-6 mb-6">No limits. Pure cinematic intelligence.</p>
              <ul className="space-y-4 flex-1 mb-8">
                {['Gemini 1.5 Pro Model', 'Infinite Context Memory', 'Zero-latency Voice', 'Proactive Automations', 'Priority Support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onLogin} className="w-full py-4 rounded-xl bg-white text-black hover:bg-slate-200 transition-colors font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Upgrade to Boundless
              </button>
            </div>

            {/* Enterprise */}
            <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col shadow-xl">
              <h3 className="text-xl font-medium mb-2 text-slate-300">Enterprise</h3>
              <div className="text-4xl font-bold text-white mb-6">Custom</div>
              <p className="text-sm text-slate-400 border-b border-white/10 pb-6 mb-6">Deployed securely on your infrastructure.</p>
              <ul className="space-y-4 flex-1 mb-8">
                {['Self-hosted Deployment', 'Custom Model Tuning', 'SSO & Advanced Auth', 'Dedicated Account Manager'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 font-medium">
                Contact Sales
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 w-full">
           <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <h2 className="text-3xl font-semibold mb-8 text-center text-white">Trusted by pioneers</h2>
              <div className="grid md:grid-cols-3 gap-6">
                 {[
                   { quote: "Aura is the first AI that actually feels like a colleague. The contextual memory is uncanny.", author: "Jane Designer, Studio UX" },
                   { quote: "I've replaced 6 different productivity tools with Aura. The cinematic interface makes work a joy.", author: "Marcus Dev, Tech Founder" },
                   { quote: "It anticipated my scheduling conflicts before I even looked at my calendar. Flawless execution.", author: "Sarah Logistics, Operations" }
                 ].map((t, i) => (
                   <div key={i} className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-black/40 hover:bg-white/[0.02] transition-colors">
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />)}
                      </div>
                      <p className="text-lg font-light text-slate-200 indent-2 leading-relaxed mb-8">"{t.quote}"</p>
                      <div className="text-sm font-semibold text-white">{t.author}</div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Advanced FAQ */}
        <section id="faq" className="py-24 px-6 w-full max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-3">
            {[
              { q: "How is Aura different from other AI?", a: "Aura is designed as a continuous, stateful companion. Rather than isolated chats, Aura remembers your preferences across sessions, connects to your tools, and provides a unified, deeply personalized experience." },
              { q: "Is my data secure?", a: "Absolutely. We employ military-grade encryption for all data at rest and in transit. Your memory graph is stored in a private enclave that only your account can access." },
              { q: "Can Aura connect to my calendar and email?", a: "Yes. With the Boundless tier, you can link Aura to your major productivity suites. Aura will proactively manage your schedule and organize incoming communications." },
              { q: "What language model powers Aura?", a: "Aura utilizes a proprietary engine routing between tuned versions of Google's Gemini 1.5 Pro and Flash, heavily optimized for low-latency voice interactions and deep contextual reasoning." }
            ].map((faq, i) => (
              <div 
                key={i} 
                className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-6 flex items-center justify-between focus:outline-none"
                >
                  <span className="text-lg font-medium text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-white' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-slate-400 font-light leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-12 border-t border-white/10 bg-[#000] relative z-20 mt-20">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
             <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 p-[1px]">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-white">Aura</span>
                </div>
                <p className="text-slate-500 font-light max-w-xs text-sm leading-relaxed">
                  The cinematic daily companion engineered for the next generation of human-computer interaction. Designed in California.
                </p>
             </div>
             
             <div>
               <h4 className="font-semibold text-white mb-6">Product</h4>
               <ul className="space-y-4 text-sm font-medium text-slate-500">
                 <li><a href="#features" className="hover:text-white transition-colors">OS 2.0</a></li>
                 <li><a href="#voice" className="hover:text-white transition-colors">Intelligence</a></li>
                 <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
               </ul>
             </div>

             <div>
               <h4 className="font-semibold text-white mb-6">Company</h4>
               <ul className="space-y-4 text-sm font-medium text-slate-500">
                 <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
               </ul>
             </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600 font-medium tracking-wide">
            <p>© {new Date().getFullYear()} Aura Technologies. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-300 transition-colors">X (Twitter)</a>
              <a href="#" className="hover:text-slate-300 transition-colors">GitHub</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Dribbble</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
