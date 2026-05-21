import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Bot, Mic, Brain, Calendar, Zap, 
  ChevronRight, Star, Cpu, Lock, CheckCircle2,
  Globe, LayoutDashboard, MessageSquare, ChevronDown
} from 'lucide-react';

export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative z-10 bg-[#050505] min-h-screen text-slate-200 overflow-x-hidden font-sans selection:bg-purple-500/30">
      
      {/* Background ambient light */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/50 backdrop-blur-xl border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 p-[1px]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Aura</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#memory" className="hover:text-white transition-colors">Memory</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <button 
            onClick={onLogin}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform duration-300"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center text-center inset-0 min-h-screen">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Aura OS 2.0 is now live</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[1.1]">
              Intelligence that <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 animate-gradient">
                feels alive.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-12 font-light leading-relaxed">
              Your cinematic AI companion. Deeply empathetic, exceptionally capable, and seamlessly integrated into your daily life.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button 
                onClick={onLogin}
                className="px-8 py-4 w-full sm:w-auto rounded-full bg-white text-black font-semibold text-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 group"
              >
                Summon Aura 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 w-full sm:w-auto rounded-full bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-colors backdrop-blur-md">
                Watch Keynote
              </button>
            </div>
          </motion.div>

          {/* AI Orb Animation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="relative mt-24 mb-10 w-full max-w-lg mx-auto aspect-square flex items-center justify-center"
          >
            {/* Outer blur bounds */}
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 rounded-full blur-[80px]"
            />
            {/* Inner rotating layers */}
            <motion.div 
              animate={{ rotate: -360, scale: [1, 1.2, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-10 bg-gradient-to-bl from-purple-500/40 to-emerald-400/40 rounded-full blur-[50px]"
            />
            {/* Solid Core */}
            <div className="w-32 h-32 md:w-48 md:h-48 bg-black/80 backdrop-blur-3xl border border-white/20 shadow-[0_0_80px_rgba(168,85,247,0.4)] rounded-full flex items-center justify-center z-10 overflow-hidden relative group">
               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <Bot className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </div>

            {/* Floating preview cards */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-10 md:left-0 top-10 glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 z-20 shadow-2xl"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400">Memory Matrix</div>
                <div className="text-sm font-medium text-white">Active & Syncing</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-10 md:right-0 bottom-10 glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 z-20 shadow-2xl"
            >
              <div className="text-right">
                <div className="text-xs text-slate-400">Context Window</div>
                <div className="text-sm font-medium text-white">Infinite Context</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-cyan-400" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Showcase Grid */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Capabilities beyond imagination</h2>
              <p className="text-lg text-slate-400 font-light">
                Aura combines cutting edge large language models with a cinematic user interface to deliver a profound computing experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Natural Voice Converse",
                  desc: "Speak naturally. Aura understands nuance, tone, and emotion, responding with zero latency.",
                  icon: Mic,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10"
                },
                {
                  title: "Infinite Neural Memory",
                  desc: "Aura never forgets. It builds a secure local graph of your preferences, goals, and history.",
                  icon: Brain,
                  color: "text-cyan-400",
                  bg: "bg-cyan-500/10"
                },
                {
                  title: "Proactive Planner",
                  desc: "Anticipates your needs. Aura schedules, tracks, and manages your entire digital life.",
                  icon: Calendar,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10"
                },
                {
                  title: "Real-time Context",
                  desc: "Aura sees what you see, utilizing screen awareness and multi-modal sensory inputs.",
                  icon: LayoutDashboard,
                  color: "text-rose-400",
                  bg: "bg-rose-500/10"
                },
                {
                  title: "Hyper-fast Execution",
                  desc: "Powered by Gemini 1.5 Pro, delivering unparalleled reasoning at blazing speeds.",
                  icon: Zap,
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10"
                },
                {
                  title: "Military-grade Privacy",
                  desc: "Your data stays yours. End-to-end encrypted storage with private local enclaves.",
                  icon: Lock,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10"
                }
              ].map((feature, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  key={i}
                  className="glass-panel p-8 rounded-3xl hover:bg-white/[0.04] transition-colors group cursor-default"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Interface Preview */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
          
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Pure cinematic interface</h2>
            
            <div className="relative mt-16 mx-auto w-full max-w-4xl aspect-[16/10] md:aspect-[21/9] rounded-2xl overflow-hidden glass-panel border border-white/20 shadow-[-20px_20px_80px_rgba(0,0,0,0.8)] flex flex-col justify-end p-6">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              
              <div className="relative z-10 w-full max-w-2xl mx-auto space-y-4">
                 <div className="self-end ms-auto bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl rounded-tr-sm border border-white/10 text-white shadow-xl text-sm md:text-base w-max max-w-[80%]">
                    "Aura, plan my trip to Kyoto for tomorrow. Include local hidden gems."
                 </div>
                 <div className="flex gap-4 items-end">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                     <Sparkles className="w-5 h-5 text-white" />
                   </div>
                   <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm text-slate-200 shadow-xl text-sm md:text-base">
                      I've constructed a 5-day itinerary. Your flight leaves at 10 AM. I've also secured a reservation at a secluded matcha house in Arashiyama as requested. Shall I sync to your calendar?
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
             <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Simple, powerful pricing</h2>
              <p className="text-lg text-slate-400 font-light">Invest in your second brain. Pay once, or go boundless.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Basic */}
              <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col">
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
              <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 bg-purple-500/5 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(168,85,247,0.15)]">
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 text-xs font-bold px-3 py-1 rounded-full text-white">
                  MOST POPULAR
                </div>
                <h3 className="text-xl font-medium mb-2 text-purple-300">Boundless</h3>
                <div className="flex items-end gap-1 mb-6">
                  <div className="text-4xl font-bold text-white">$20</div>
                  <div className="text-sm text-slate-400 mb-1">/mo</div>
                </div>
                <p className="text-sm text-slate-400 border-b border-white/10 pb-6 mb-6">No limits. Pure cinematic intelligence.</p>
                <ul className="space-y-4 flex-1 mb-8">
                  {['Gemini 1.5 Pro Model', 'Infinite Context Memory', 'Zero-latency Voice', 'Proactive Automations', 'Priority Support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={onLogin} className="w-full py-3 rounded-xl bg-white text-black hover:bg-slate-200 transition-colors font-semibold shadow-lg shadow-white/10">
                  Upgrade to Boundless
                </button>
              </div>

              {/* Enterprise */}
              <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col">
                <h3 className="text-xl font-medium mb-2 text-slate-300">Enterprise</h3>
                <div className="text-4xl font-bold text-white mb-6">Custom</div>
                <p className="text-sm text-slate-400 border-b border-white/10 pb-6 mb-6">Deployed on your own private cloud.</p>
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
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 px-6 bg-black/40 border-y border-white/5">
           <div className="max-w-7xl mx-auto">
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[
                 { quote: "Aura is the first AI that actually feels like a colleague. The contextual memory is uncanny.", author: "Jane Designer, Studio UX" },
                 { quote: "I've replaced 6 different productivity tools with Aura. The cinematic interface makes work a joy.", author: "Marcus Dev, Tech Founder" },
                 { quote: "It anticipated my scheduling conflicts before I even looked at my calendar. Flawless execution.", author: "Sarah Logistics, Operations" }
               ].map((t, i) => (
                 <div key={i} className="glass-panel p-8 rounded-2xl">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />)}
                    </div>
                    <p className="text-lg font-light text-slate-200 italic mb-6">"{t.quote}"</p>
                    <div className="text-sm font-medium text-slate-400">{t.author}</div>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Frequently Asked Questions</h2>
              <p className="text-lg text-slate-400 font-light">Everything you need to know about Aura.</p>
            </div>
            
            <div className="space-y-4">
              {[
                { q: "How is Aura different from other AI?", a: "Aura is designed as a continuous, stateful companion. Rather than isolated chats, Aura remembers your preferences across sessions, connects to your tools, and provides a unified, deeply personalized experience." },
                { q: "Is my data secure?", a: "Absolutely. We employ military-grade encryption for all data at rest and in transit. Your memory graph is stored in a private enclave that only your account can access." },
                { q: "Can Aura connect to my calendar and email?", a: "Yes. With the Boundless tier, you can link Aura to your major productivity suites. Aura will proactively manage your schedule and organize incoming communications." },
                { q: "What language model powers Aura?", a: "Aura is built on a proprietary tuned version of Google's Gemini 1.5 Pro, heavily optimized for low-latency voice interactions and deep contextual reasoning." }
              ].map((faq, i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl cursor-default group">
                  <h3 className="text-lg font-medium text-white mb-2 flex items-center justify-between">
                    {faq.q}
                    <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                  </h3>
                  <p className="text-slate-400 font-light text-sm leading-relaxed pr-8">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/10 bg-[#050505] relative z-20">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
             <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <span className="text-xl font-bold tracking-tight text-white">Aura</span>
                </div>
                <p className="text-slate-500 font-light max-w-sm text-sm">
                  The cinematic daily companion engineered for the next generation of human-computer interaction.
                </p>
             </div>
             
             <div>
               <h4 className="font-semibold text-white mb-4">Product</h4>
               <ul className="space-y-3 text-sm text-slate-400">
                 <li><a href="#" className="hover:text-white transition-colors">OS 2.0</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Capabilities</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
               </ul>
             </div>

             <div>
               <h4 className="font-semibold text-white mb-4">Company</h4>
               <ul className="space-y-3 text-sm text-slate-400">
                 <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
               </ul>
             </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
            <p>© 2026 Aura Technologies, Inc. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
