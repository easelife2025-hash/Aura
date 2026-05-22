import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Mic, MicOff, Sparkles, X, Power } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';

export default function VoiceAssistant({ 
  user, 
  messages, 
  onClose,
  isTyping,
  sendMessage 
}: { 
  user: any, 
  messages: any[], 
  onClose: () => void,
  isTyping: boolean,
  sendMessage: (text: string) => Promise<void>
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Keep track of the last spoken message to avoid repeating
  const lastSpokenIdRef = useRef<string | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = async (event: any) => {
        setIsListening(false);
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        if (transcript.trim()) {
           await sendMessage(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
         recognitionRef.current.stop();
      }
      if (synthRef.current) {
         synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!sessionActive) {
      synthRef.current?.cancel();
      recognitionRef.current?.stop();
      return;
    }

    // Identify if there's a new assistant message to speak
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage && latestMessage.role === 'assistant' && latestMessage.id !== lastSpokenIdRef.current) {
        lastSpokenIdRef.current = latestMessage.id;
        
        if (synthRef.current) {
           synthRef.current.cancel(); // Stop current speech
           const utterance = new SpeechSynthesisUtterance(latestMessage.content);
           
           // Try to find a good English voice
           const voices = synthRef.current.getVoices();
           const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural')));
           if (preferredVoice) utterance.voice = preferredVoice;
           
           utterance.rate = 1.0;
           utterance.pitch = 0.95; 

           utterance.onstart = () => {
               setIsSpeaking(true);
           };

           utterance.onend = () => {
               setIsSpeaking(false);
               // Automatically start listening again after finishing speaking
               if (sessionActive && recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch(e) {}
               }
           };

           utterance.onerror = () => {
               setIsSpeaking(false);
           };

           synthRef.current.speak(utterance);
        }
    }
  }, [messages, sessionActive]);

  const toggleSession = () => {
     if (sessionActive) {
        setSessionActive(false);
        synthRef.current?.cancel();
        recognitionRef.current?.stop();
        setIsSpeaking(false);
        setIsListening(false);
     } else {
        setSessionActive(true);
        // Start listening immediately
        try {
           recognitionRef.current?.start();
        } catch(e) {}
     }
  };

  const currentStatus = isSpeaking ? 'Transmitting' : isTyping ? 'Processing' : isListening ? 'Listening' : sessionActive ? 'Standby' : 'Offline';

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full overflow-hidden bg-black">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black" />
      
      {/* Header controls */}
      <div className="absolute top-6 inset-x-6 flex justify-between items-center z-20">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
             </div>
             <div>
                <h3 className="text-white text-sm font-medium tracking-wide">Aura Voice Interface</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest">{currentStatus}</p>
             </div>
         </div>
         <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
         </button>
      </div>

      {/* Main Holographic Orb */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-[-10dvh]">
          <motion.div
             animate={{
                scale: isSpeaking ? [1, 1.15, 1] : isListening ? [1, 1.05, 1] : isTyping ? [1, 1.3, 1] : 1,
                rotate: isSpeaking || isTyping ? 360 : 0,
             }}
             transition={{
                duration: isSpeaking ? 1.5 : isTyping ? 2 : 4,
                repeat: Infinity,
                ease: "linear"
             }}
             className="relative w-64 h-64 flex items-center justify-center"
          >
             {/* Glowing layers */}
             <div className={`absolute inset-0 rounded-full blur-[60px] transition-colors duration-1000 ${
                 isSpeaking ? 'bg-cyan-500/60' : isTyping ? 'bg-purple-500/50' : isListening ? 'bg-emerald-500/40' : 'bg-slate-800/40'
             }`} />
             <div className={`absolute inset-4 rounded-full blur-[30px] transition-colors duration-1000 ${
                 isSpeaking ? 'bg-blue-400/50' : isTyping ? 'bg-fuchsia-500/40' : isListening ? 'bg-emerald-400/30' : 'bg-slate-700/30'
             }`} />
             
             {/* Center core */}
             <div className="absolute inset-12 bg-black rounded-full border border-white/10 shadow-[inset_0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden z-10">
                {sessionActive && (
                    <motion.div 
                       animate={{ 
                          scale: isSpeaking ? [1, 1.5, 1] : isListening ? [1, 1.2, 1] : 1,
                          opacity: isTyping ? [0.3, 0.8, 0.3] : 1
                       }}
                       transition={{ duration: isSpeaking ? 0.5 : 1.5, repeat: Infinity }}
                       className={`w-full h-full bg-gradient-to-br ${
                           isSpeaking ? 'from-cyan-400 to-blue-600' : isTyping ? 'from-purple-500 to-fuchsia-500' : isListening ? 'from-emerald-400 to-teal-600' : 'from-slate-700 to-slate-800'
                       } opacity-40 mix-blend-screen`}
                    />
                )}
                {!sessionActive && <Bot className="w-12 h-12 text-slate-600 relative z-20" />}
             </div>
          </motion.div>
          
          {/* Audio Visualizer Waves (Mock) */}
          <div className="h-16 mt-16 flex items-center justify-center gap-1.5 w-full min-w-[200px]">
             {sessionActive && Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                   key={i}
                   animate={{
                      height: isSpeaking ? [8, 10 + Math.random() * 40, 8] : isListening ? [8, 10 + Math.random() * 15, 8] : 8,
                      opacity: isSpeaking || isListening ? 1 : 0.3
                   }}
                   transition={{
                      duration: isSpeaking ? 0.3 : 1,
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: "easeInOut"
                   }}
                   className={`w-1.5 rounded-full ${
                      isSpeaking ? 'bg-cyan-400' : isListening ? 'bg-emerald-400' : 'bg-slate-700'
                   }`}
                />
             ))}
          </div>

          <p className="mt-8 text-slate-400 text-sm font-light max-w-sm text-center px-4 h-10">
              {isSpeaking ? "Aura is speaking..." : isTyping ? "Aura is thinking..." : isListening ? "Listening... speak now." : sessionActive ? "Waiting for vocal input..." : "Voice session inactive."}
          </p>
      </div>

      {/* Bottom Control */}
      <div className="absolute bottom-12 inset-x-0 flex justify-center z-20">
          <button 
             onClick={toggleSession}
             className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                 sessionActive 
                   ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.3)]' 
                   : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:border-white/20'
             }`}
          >
             {sessionActive ? <Power className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
      </div>
    </div>
  );
}
