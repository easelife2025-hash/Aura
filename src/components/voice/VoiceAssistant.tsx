import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, X, Activity } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Keep track of the last spoken message to avoid repeating
  const lastSpokenIdRef = useRef<string | null>(null);

  useEffect(() => {
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
      if (window.speechSynthesis) {
         window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playTTS = (text: string) => {
    setErrorMsg(null);
    return new Promise<void>((resolve) => {
      if (!window.speechSynthesis) {
        setErrorMsg("Your browser does not support Speech Synthesis API.");
        resolve();
        return;
      }
      
      const cleanText = text
        .replace(/>_\*\*[A-Za-z]+\*\*/g, '')
        .replace(/>_\s?/g, '')
        .replace(/>\s?/g, '')
        .replace(/[*_#`~>]/g, '')
        .trim();
        
      if (!cleanText) {
         resolve();
         return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Select the best male voice available
      const voices = window.speechSynthesis.getVoices();
      let bestVoice = voices.find(v => v.name.includes('Google UK English Male')) || 
                      voices.find(v => v.name.includes('Google US English Male') || v.name.includes('Google') && v.name.includes('Male')) ||
                      voices.find(v => (v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Arthur'))) ||
                      voices.find(v => v.name.toLowerCase().includes('male')) ||
                      voices.find(v => v.lang.startsWith('en')) || 
                      voices[0];
                      
      if (bestVoice) utterance.voice = bestVoice;
      utterance.rate = 0.95; // Slightly slower for a calmer tone
      utterance.pitch = 0.8; // Deeper pitch for male characteristic
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (sessionActive && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
        }
        resolve();
      };
      utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        setIsSpeaking(false);
        resolve();
      };
      
      window.speechSynthesis.cancel(); // Stop any pending speech
      window.speechSynthesis.speak(utterance);
    });
  }

  useEffect(() => {
    if (!sessionActive) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      recognitionRef.current?.stop();
      return;
    }

    const latestMessage = messages[messages.length - 1];
    
    // Only attempt to speak if it is an assistant message and it wasn't spoken yet
    if (latestMessage && latestMessage.role === 'assistant' && latestMessage.id !== lastSpokenIdRef.current) {
        // Exclude system/error messages starting with '⚠️'
        if (latestMessage.content.startsWith('⚠️')) {
            lastSpokenIdRef.current = latestMessage.id;
            return;
        }

        lastSpokenIdRef.current = latestMessage.id;
        
        // Stop current listening
        recognitionRef.current?.stop();
        
        // Generate and play TTS
        playTTS(latestMessage.content);
    }
  }, [messages, sessionActive]);

  const toggleSession = () => {
     setErrorMsg(null);
     if (sessionActive) {
        setSessionActive(false);
     } else {
        setSessionActive(true);
        // Start listening immediately
        try {
           recognitionRef.current?.start();
        } catch(e) {}
     }
  };

  const currentStatus = isSpeaking ? 'Speaking' : isTyping ? 'Thinking' : isListening ? 'Listening' : sessionActive ? 'Standby' : 'Offline';

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full overflow-hidden bg-[#0A0A0A]">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />
      
      {/* Header controls */}
      <div className="absolute top-6 inset-x-6 flex justify-between items-center z-20">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <Activity className="w-4 h-4 text-black" />
             </div>
             <div>
                <h3 className="text-white text-sm font-medium tracking-wide">Aura Voice Engine</h3>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{currentStatus}</p>
             </div>
         </div>
         <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
         </button>
      </div>

      {/* Main UI */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-[-5dvh]">
          {/* Animated Waveform Wrapper */}
          <div className="relative w-64 h-64 flex items-center justify-center">
              {sessionActive && (
                 <div className="absolute inset-0 flex items-center justify-center gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                       <motion.div
                          key={i}
                          animate={{
                             height: isSpeaking ? [24, Math.random() * 80 + 40, 24] : isListening ? [16, Math.random() * 30 + 16, 16] : 12,
                             opacity: isSpeaking || isListening ? 1 : 0.4
                          }}
                          transition={{
                             duration: isSpeaking ? 0.4 : 1,
                             repeat: Infinity,
                             delay: i * 0.1,
                             ease: "easeInOut"
                          }}
                          className={`w-3 rounded-full ${isSpeaking ? 'bg-white' : 'bg-zinc-500'}`}
                       />
                    ))}
                 </div>
              )}
              
              {!sessionActive && (
                 <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center">
                    <MicOff className="w-8 h-8 text-zinc-500" />
                 </div>
              )}
          </div>
          
          {errorMsg ? (
            <div className="mt-8 bg-black border border-rose-500/30 text-rose-400 text-sm p-3 rounded-xl max-w-sm text-center shadow-lg">
                <p>{errorMsg}</p>
            </div>
          ) : (
            <p className="mt-12 text-zinc-400 text-sm font-medium max-w-sm text-center px-4 h-10 tracking-wide">
              {isSpeaking ? "Aura is transmitting" : isTyping ? "Aura is processing..." : isListening ? "Aura is listening..." : sessionActive ? "Standby" : "Tap to connect"}
            </p>
          )}
      </div>

      {/* Bottom Control */}
      <div className="absolute bottom-12 inset-x-0 flex justify-center z-20">
          <button 
             onClick={toggleSession}
             className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                 sessionActive 
                   ? 'bg-zinc-100 text-black shadow-[0_0_40px_rgba(255,255,255,0.5)] scale-110' 
                   : 'bg-zinc-800 text-white hover:bg-zinc-700 hover:scale-105'
             }`}
          >
             {sessionActive ? <Activity className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
          </button>
      </div>
    </div>
  );
}
