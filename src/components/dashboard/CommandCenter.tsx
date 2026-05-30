import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Task, Habit } from '../../types';
import { CheckCircle, Circle, Plus, Zap, TrendingUp, Calendar as CalendarIcon, Flame, BrainCircuit, Activity, Bot } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, isToday, isYesterday, startOfWeek, eachDayOfInterval } from 'date-fns';
import { useSettings } from '../../contexts/SettingsContext';

import { Mail } from 'lucide-react';
import { getAccessToken } from '../../hooks/useAuth';

const MOCK_ANALYTICS = [
  { name: 'Mon', score: 45 },
//...

  { name: 'Tue', score: 70 },
  { name: 'Wed', score: 65 },
  { name: 'Thu', score: 85 },
  { name: 'Fri', score: 90 },
  { name: 'Sat', score: 50 },
  { name: 'Sun', score: 75 },
];

function MailWidget() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    let active = true;
    const fetchMails = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          setErr("No valid Gmail token.");
          setLoading(false);
          return;
        }
        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=in:inbox', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch messages. Please sign out and sign in again to grant permissions.");
        const data = await res.json();
        const msgs = data.messages || [];
        const fullEmails = await Promise.all(msgs.map(async (m: any) => {
             const mRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
                 headers: { Authorization: `Bearer ${token}` }
             });
             const mData = await mRes.json();
             const subjectLine = mData.payload?.headers?.find((h:any) => h.name === 'Subject')?.value || 'No Subject';
             const fromLine = mData.payload?.headers?.find((h:any) => h.name === 'From')?.value || 'Unknown';
             return { id: m.id, snippet: mData.snippet, subject: subjectLine, from: fromLine };
        }));
        if (active) {
            setEmails(fullEmails);
            setErr(null);
            setLoading(false);
        }
      } catch (e: any) {
        if (active) {
          setErr(e.message);
          setLoading(false);
        }
      }
    };
    fetchMails();
    return () => { active = false; };
  }, []);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-slate-200 flex items-center gap-2">
          <Mail className="w-4 h-4 text-rose-400" /> Recent Emails
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500 animate-pulse">Loading inbox...</div>
        ) : err ? (
          <div className="h-full flex items-center justify-center text-rose-400/80 text-sm">{err}</div>
        ) : emails.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">Inbox empty</div>
        ) : (
          emails.map(email => (
            <div key={email.id} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-transparent transition-colors">
               <div className="font-medium text-slate-200 text-sm truncate">{email.subject}</div>
               <div className="text-xs text-slate-400 truncate mb-1">{email.from.replace(/<.*>/, '')}</div>
               <div className="text-xs text-slate-500 truncate" dangerouslySetInnerHTML={{ __html: email.snippet }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function CommandCenter({ user }: { user: any }) {
  const { settings } = useSettings();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newHabit, setNewHabit] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [dailyPlan, setDailyPlan] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const tasksQ = query(collection(db, `users/${user.uid}/tasks`), orderBy('createdAt', 'desc'));
    const unsubsTasks = onSnapshot(tasksQ, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
    });

    const habitsQ = query(collection(db, `users/${user.uid}/habits`), orderBy('createdAt', 'desc'));
    const unsubsHabits = onSnapshot(habitsQ, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Habit[]);
    });

    return () => {
      unsubsTasks();
      unsubsHabits();
    };
  }, [user]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await addDoc(collection(db, `users/${user.uid}/tasks`), {
      title: newTask,
      status: 'pending',
      createdAt: Date.now()
    });
    setNewTask('');
  };

  const toggleTask = async (task: Task) => {
    await updateDoc(doc(db, `users/${user.uid}/tasks`, task.id), {
      status: task.status === 'pending' ? 'completed' : 'pending'
    });
  };

  const deleteHabit = async (id: string) => {
    await deleteDoc(doc(db, `users/${user.uid}/habits`, id));
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    await addDoc(collection(db, `users/${user.uid}/habits`), {
      title: newHabit,
      streak: 0,
      createdAt: Date.now()
    });
    setNewHabit('');
  };

  const completeHabit = async (habit: Habit) => {
    if (habit.lastCompleted && isToday(new Date(habit.lastCompleted))) return; // Already done today
    
    let newStreak = habit.streak;
    if (!habit.lastCompleted || isYesterday(new Date(habit.lastCompleted))) {
      newStreak++;
    } else {
      newStreak = 1; // Streak reset!
    }

    await updateDoc(doc(db, `users/${user.uid}/habits`, habit.id), {
       streak: newStreak,
       lastCompleted: Date.now()
    });

    if (settings.pushNotifications && user?.email) {
       import('../../hooks/useAuth').then(async ({ getAccessToken }) => {
         const token = await getAccessToken();
         if (token) {
           const subjectText = `Aura: Core Routine Update 🔁`;
             const subjectBase64 = btoa(unescape(encodeURIComponent(subjectText)));
             const emailBody = [
               `To: ${user.email}`,
               `Subject: =?utf-8?B?${subjectBase64}?=`,
             `Content-Type: text/plain; charset=utf-8`,
             '',
             `Great job! You just completed your core routine: "${habit.title}".`,
             `Your current streak is now ${newStreak} day${newStreak > 1 ? 's' : ''}! Keep up the momentum.`,
             '',
             '-- ',
             'Sent by Aura Assistant'
           ].join('\n');
           const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailBody)))
             .replace(/\+/g, '-')
             .replace(/\//g, '_')
             .replace(/=+$/, '');
           fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
             method: 'POST',
             headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
             },
             body: JSON.stringify({ raw: base64EncodedEmail })
           }).catch(e => console.error("Habit email failed", e));
         }
       });
    }
  };

  const generatePlan = async () => {
    setIsGeneratingPlan(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
       const res = await fetch('/api/chat', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ message: "Generate a strategic daily plan based on optimal productivity. Give me a concise schedule and focus priorities. Format plainly using simple markdown." }),
         signal: controller.signal
       });
       clearTimeout(timeoutId);
       
       if (!res.ok) {
         console.error("Strategy generation failed:", res.status);
         return;
       }

       const text = await res.text();
       setDailyPlan(text);
       
       if (settings.pushNotifications && user?.email) {
          import('../../hooks/useAuth').then(async ({ getAccessToken }) => {
            const token = await getAccessToken();
            if (token) {
              const subjectText = `Aura: Your Daily AI Strategy`;
                const subjectBase64 = btoa(unescape(encodeURIComponent(subjectText)));
                const emailBody = [
                  `To: ${user.email}`,
                  `Subject: =?utf-8?B?${subjectBase64}?=`,
                `Content-Type: text/plain; charset=utf-8`,
                '',
                text,
                '',
                '-- ',
                'Sent by Aura Assistant'
              ].join('\n');
              const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailBody)))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
              fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ raw: base64EncodedEmail })
              }).catch(e => console.error("Strategy email failed", e));
            }
          });
       }
    } catch(err) {
       console.error(err);
    } finally {
       setIsGeneratingPlan(false);
    }
  };

  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 scroll-smooth">
      <header className="mb-10">
        <h1 className="text-3xl font-medium text-white tracking-tight mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400" />
          Command Center
        </h1>
        <p className="text-slate-400">Optimize your focus, track routines, and visualize progress.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tasks & Plan */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Widget */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="flex items-center justify-between mb-4 relative z-10">
               <div>
                 <h2 className="text-lg font-medium text-slate-100 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-400"/> Daily Output</h2>
                 <p className="text-sm text-slate-400">{completedTasksCount} / {tasks.length} tasks completed</p>
               </div>
               <div className="text-3xl font-semibold text-white">{progress}%</div>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative z-10">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="h-full bg-gradient-to-r from-purple-500 to-cyan-500" 
               />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Tasks */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col h-[400px]">
              <h3 className="text-base font-medium text-slate-200 mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Objectives
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-transparent transition-colors group">
                    <button onClick={() => toggleTask(task)}>
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 group-hover:text-cyan-400/50" />
                      )}
                    </button>
                    <span className={`text-sm ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-sm text-slate-500 text-center mt-10">No active objectives.</p>}
              </div>

              <form onSubmit={addTask} className="relative mt-auto border-t border-white/5 pt-4">
                <input 
                  type="text" 
                  value={newTask} 
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="Define new task..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-purple-500/50 outline-none transition-all"
                />
                <button type="submit" disabled={!newTask.trim()} className="absolute right-2 top-[24px] text-slate-400 hover:text-cyan-400 transition-colors disabled:opacity-50">
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* AI Strat Plan */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col h-[400px] relative overflow-hidden">
               <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none" />
               <h3 className="text-base font-medium text-slate-200 mb-4 flex items-center gap-2 relative z-10">
                 <BrainCircuit className="w-4 h-4 text-purple-400" /> AI Strategy
               </h3>
               
               <div className="flex-1 overflow-y-auto relative z-10">
                  {dailyPlan ? (
                    <div className="prose prose-sm prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 max-w-none">
                       {dailyPlan}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                      <Bot className="w-10 h-10 text-slate-700" />
                      <p className="text-sm">No strategy generated for today.</p>
                      <button 
                        onClick={generatePlan} 
                        disabled={isGeneratingPlan}
                        className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-sm font-medium rounded-xl transition-all border border-purple-500/20 flex items-center gap-2"
                      >
                         {isGeneratingPlan ? <Zap className="w-4 h-4 animate-pulse" /> : <Zap className="w-4 h-4" />}
                         Generate Daily Plan
                      </button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Habits & Analytics */}
        <div className="space-y-6">
          
          {/* Output Graph */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
             <h3 className="text-base font-medium text-slate-200 mb-6 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-emerald-400" /> Focus Analytics
             </h3>
             <div className="h-40 w-full mb-2">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_ANALYTICS}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                       itemStyle={{ color: '#22d3ee' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#22d3ee" fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Habit Tracker */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col h-[320px]">
             <h3 className="text-base font-medium text-slate-200 mb-4 flex items-center gap-2">
                 <Flame className="w-4 h-4 text-orange-500" /> Core Routines
             </h3>
             <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {habits.map(habit => {
                   const doneToday = habit.lastCompleted ? isToday(new Date(habit.lastCompleted)) : false;
                   return (
                    <div key={habit.id} className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-transparent transition-colors group">
                      <div className="flex items-center gap-3">
                         <button 
                           disabled={doneToday}
                           onClick={() => completeHabit(habit)}
                           className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${doneToday ? 'bg-orange-500/20 border-orange-500/50' : 'border-slate-500 hover:border-orange-400'}`}
                         >
                           {doneToday && <Flame className="w-3 h-3 text-orange-500" />}
                         </button>
                         <span className="text-sm outline-none bg-transparent text-slate-200">{habit.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-mono text-orange-400/80 tracking-wide">{habit.streak} DAY{habit.streak !== 1 && 'S'}</span>
                         <button onClick={() => deleteHabit(habit.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                           <Plus className="w-3 h-3 rotate-45" />
                         </button>
                      </div>
                    </div>
                 )})}
                {habits.length === 0 && <p className="text-sm text-slate-500 text-center mt-6">Install focus routines.</p>}
             </div>
             
             <form onSubmit={addHabit} className="relative mt-auto border-t border-white/5 pt-4">
                <input 
                  type="text" 
                  value={newHabit} 
                  onChange={e => setNewHabit(e.target.value)}
                  placeholder="Install routine..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-4 pr-9 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/50 outline-none transition-all"
                />
                <button type="submit" disabled={!newHabit.trim()} className="absolute right-2 top-[22px] text-slate-400 hover:text-orange-400 transition-colors disabled:opacity-50">
                  <Plus className="w-4 h-4" />
                </button>
              </form>
          </div>

          <MailWidget />

        </div>
      </div>
    </div>
  );
}
