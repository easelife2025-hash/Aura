import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Task, Habit } from '../types';
import { Sparkles, X, Target, Flame } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface Toast {
  id: number;
  message: string;
  isUrgent: boolean;
  streak: number;
}

export default function MotivationalReminder({ user }: { user: any }) {
  const { settings } = useSettings();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Use ref to avoid re-triggering the interval effect unnecessarily
  const tasksRef = useRef(tasks);
  const habitsRef = useRef(habits);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  
  useEffect(() => {
    habitsRef.current = habits;
  }, [habits]);

  useEffect(() => {
    if (!user) return;
    const qT = query(collection(db, `users/${user.uid}/tasks`), orderBy('createdAt', 'desc'));
    const unsubT = onSnapshot(qT, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
    });

    const qH = query(collection(db, `users/${user.uid}/habits`), orderBy('createdAt', 'desc'));
    const unsubH = onSnapshot(qH, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Habit[]);
    });

    return () => { unsubT(); unsubH(); };
  }, [user]);

  useEffect(() => {
    if (!settings.smartReminders) return;

    const generateMotivation = async () => {
      const currentTasks = tasksRef.current;
      const currentHabits = habitsRef.current;
      
      const pendingTasks = currentTasks.filter(t => t.status === 'pending');
      const completedTasks = currentTasks.filter(t => t.status === 'completed');
      
      if (pendingTasks.length === 0) return; // All done

      const latestPending = pendingTasks[0].title;
      const hoursPending = (Date.now() - pendingTasks[0].createdAt) / (1000 * 60 * 60);
      const isUrgent = hoursPending > 24;
      
      const bestStreak = currentHabits.length > 0 ? Math.max(...currentHabits.map(h => h.streak)) : 0;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             message: `Generate a short (1-2 sentences max), highly motivational, human-like reminder for someone who has completed ${completedTasks.length} tasks today but still needs to finish "${latestPending}". ${isUrgent ? 'This task is URGENT and has been pending for over a day, emphasize taking immediate action.' : 'Keep it light and encouraging.'} ${bestStreak > 0 ? `They have a ${bestStreak}-day streak going, mention keeping the momentum alive.` : ''} Do not use markdown. Do not include quotes.`
          })
        });
        const text = await res.text();
        
        if (text) {
          const newToastId = Date.now();
          setToasts(current => [...current, { id: newToastId, message: text, isUrgent, streak: bestStreak }]);
          
          if (settings.pushNotifications && Notification.permission === 'granted') {
             try {
                navigator.serviceWorker.ready.then(reg => {
                  reg.showNotification(isUrgent ? "Action Required ⚡" : "Goal Reminder 🎯", {
                    body: text,
                    icon: "https://cdn-icons-png.flaticon.com/512/3237/3237472.png",
                  });
                });
             } catch(e) {}
          }

          setTimeout(() => {
            setToasts(current => current.filter(t => t.id !== newToastId));
          }, 10000); // 10 seconds visible
        }
      } catch (err) {
        console.error("Motivational prompt error", err);
      }
    };

    // First reminder after 10 seconds, then every 3 minutes
    const initialTimeout = setTimeout(generateMotivation, 10000);
    const interval = setInterval(generateMotivation, 3 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [settings.smartReminders, settings.pushNotifications]);

  const removeToast = (id: number) => {
    setToasts(current => current.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.2 } }}
            className={`pointer-events-auto relative overflow-hidden backdrop-blur-xl bg-black/80 border ${toast.isUrgent ? 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.2)]' : 'border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]'} p-5 rounded-2xl flex items-start gap-4 transition-all`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${toast.isUrgent ? 'from-orange-500/10 to-red-500/10' : 'from-cyan-500/10 to-purple-500/10'} animate-gradient`} />
            
            <div className="flex-shrink-0 mt-0.5 relative z-10">
               <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center border ${toast.isUrgent ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'}`}>
                  {toast.isUrgent ? <Flame className="w-5 h-5 animate-pulse" /> : <Target className="w-5 h-5" />}
               </div>
            </div>
            
            <div className="flex-1 relative z-10">
               <div className="flex items-center gap-2 mb-1">
                 <span className={`text-xs font-bold uppercase tracking-widest block ${toast.isUrgent ? 'text-orange-400' : 'text-cyan-400'}`}>
                   {toast.isUrgent ? 'Urgent Priority' : 'Aura Progress'}
                 </span>
                 {toast.streak > 0 && (
                    <span className="text-[10px] font-mono text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                      {toast.streak}D STREAK
                    </span>
                 )}
               </div>
               <p className="text-[14px] text-slate-100 leading-relaxed font-medium">
                 {toast.message}
               </p>
            </div>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors relative z-10 p-1 mt-0.5"
            >
               <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
