import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings2, Bell, BrainCircuit, Sparkles, Moon, Sun, Monitor, BellRing, UserCircle, Activity } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, messaging } from '../../firebase';
import { getToken } from 'firebase/messaging';

interface UserSettings {
  smartReminders: boolean;
  pushNotifications: boolean;
  personalizedRecommendations: boolean;
  dailyInsights: boolean;
  personalityMode: 'professional' | 'friendly' | 'concise' | 'creative';
  theme: 'system' | 'dark' | 'light' | 'cosmic';
}

const defaultSettings: UserSettings = {
  smartReminders: true,
  pushNotifications: false,
  personalizedRecommendations: true,
  dailyInsights: true,
  personalityMode: 'professional',
  theme: 'dark'
};

function Toggle({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1 border border-white/5 ${checked ? 'bg-purple-500' : 'bg-white/10'}`}
    >
      <motion.div 
        animate={{ x: checked ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

export default function SettingsPanel({ user }: { user: any }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!user) return;
      try {
        const docRef = doc(db, `users/${user.uid}/settings/preferences`);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setSettings(snapshot.data() as UserSettings);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user]);

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return;
    setSaving(true);
    setSettings(newSettings);
    try {
      const docRef = doc(db, `users/${user.uid}/settings/preferences`);
      await setDoc(docRef, newSettings);

      if (newSettings.pushNotifications) {
        if (messaging) {
          try {
            if (typeof Notification === 'undefined') {
              alert("Your browser does not support notifications.");
              setSettings(s => ({ ...s, pushNotifications: false }));
              setSaving(false);
              return;
            }

            // Check if we are inside an iframe (preview mode)
            if (window !== window.top && Notification.permission !== 'granted') {
               alert("Browser blocks notification requests inside embedded previews.\n\nPlease click the '🔗' or pop-out icon at the top right of the preview pane to open the app in a new tab, then try again.");
               setSettings(s => ({ ...s, pushNotifications: false }));
               setSaving(false);
               return;
            }

            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
              if (!vapidKey) {
                 alert("Oops! The Magic VAPID Key is missing. Please add VITE_FIREBASE_VAPID_KEY in your secrets or .env file.");
                 setSettings(s => ({ ...s, pushNotifications: false }));
                 await setDoc(docRef, { ...newSettings, pushNotifications: false });
                 setSaving(false);
                 return;
              }

              const token = await getToken(messaging, { vapidKey });
              console.log("Notification permission granted! Token:", token);
              setDeviceToken(token);
              // Here you would save the token to the user's document in Firestore so you can message them later
              
            } else {
               alert(`Notification permission was ${permission}. Please allow notifications in your browser settings.`);
               setSettings(s => ({ ...s, pushNotifications: false }));
               await setDoc(docRef, { ...newSettings, pushNotifications: false });
            }
          } catch(e) {
             console.error("Notification permission failed", e);
             alert("Failed to request notification permission. " + (e as Error).message);
             setSettings(s => ({ ...s, pushNotifications: false }));
             await setDoc(docRef, { ...newSettings, pushNotifications: false });
          }
        } else {
           alert("Push notifications are not supported in this browser.");
           setSettings(s => ({ ...s, pushNotifications: false }));
           await setDoc(docRef, { ...newSettings, pushNotifications: false });
        }
      }

    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof UserSettings>(field: K, value: UserSettings[K]) => {
    saveSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-24 pb-32 h-full">
         <div className="animate-pulse text-slate-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-24 pb-32 scroll-smooth">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-light text-white tracking-tight flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-cyan-400" /> System Preferences
          </h1>
          <p className="text-slate-400 mt-2 font-light">Configure Aura to match your personal workflow.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Notifications Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                 <BellRing className="w-5 h-5 text-purple-400" />
               </div>
               <h2 className="text-xl font-medium text-slate-200">Alerts & Notifications</h2>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div>
                     <div className="text-slate-200 font-medium">Smart AI Reminders</div>
                     <div className="text-slate-400 text-sm mt-0.5">Contextual nudges based on your habits</div>
                   </div>
                   <Toggle checked={settings.smartReminders} onChange={(v) => updateField('smartReminders', v)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div>
                     <div className="text-slate-200 font-medium">Push Notifications</div>
                     <div className="text-slate-400 text-sm mt-0.5">Real-time alerts via Firebase Cloud Messaging</div>
                   </div>
                   <Toggle checked={settings.pushNotifications} onChange={(v) => updateField('pushNotifications', v)} />
                </div>
                {deviceToken && (
                   <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 break-all space-y-2">
                     <span className="font-bold text-purple-400 block mb-1">Your Device Token (For Testing):</span>
                     {deviceToken}
                     <button 
                       onClick={() => navigator.clipboard.writeText(deviceToken)}
                       className="block mt-2 font-medium bg-purple-500/20 hover:bg-purple-500/30 px-3 py-1.5 rounded-lg border border-purple-500/30 w-full transition-colors"
                     >
                        Copy Token
                     </button>
                   </div>
                )}
             </div>
          </motion.div>

          {/* AI Personality Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                 <BrainCircuit className="w-5 h-5 text-cyan-400" />
               </div>
               <h2 className="text-xl font-medium text-slate-200">Aura Core Intelligence</h2>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div>
                     <div className="text-slate-200 font-medium">Personalized Recommendations</div>
                     <div className="text-slate-400 text-sm mt-0.5">AI adapts to your historical tasks and data</div>
                   </div>
                   <Toggle checked={settings.personalizedRecommendations} onChange={(v) => updateField('personalizedRecommendations', v)} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div>
                     <div className="text-slate-200 font-medium">Daily Productivity Insights</div>
                     <div className="text-slate-400 text-sm mt-0.5">Receive an AI summary of your workflow</div>
                   </div>
                   <Toggle checked={settings.dailyInsights} onChange={(v) => updateField('dailyInsights', v)} />
                </div>
             </div>
          </motion.div>

          {/* Theme & Modes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6 lg:col-span-2">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                 <Sparkles className="w-5 h-5 text-emerald-400" />
               </div>
               <h2 className="text-xl font-medium text-slate-200">Interface & Persona</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className="text-sm font-medium text-slate-400 uppercase tracking-wider block">Personality Mode</label>
                 <div className="grid grid-cols-2 gap-3">
                    {['professional', 'friendly', 'concise', 'creative'].map(mode => (
                      <button 
                        key={mode}
                        onClick={() => updateField('personalityMode', mode as any)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all capitalize ${settings.personalityMode === mode ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                      >
                         {mode}
                      </button>
                    ))}
                 </div>
               </div>

               <div className="space-y-3">
                 <label className="text-sm font-medium text-slate-400 uppercase tracking-wider block">Visual Theme</label>
                 <div className="grid grid-cols-4 gap-3">
                    <button onClick={() => updateField('theme', 'system')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${settings.theme === 'system' ? 'bg-slate-500/20 border-slate-500/50 text-slate-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                      <Monitor className="w-5 h-5 mb-1" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Auto</span>
                    </button>
                    <button onClick={() => updateField('theme', 'dark')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${settings.theme === 'dark' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                      <Moon className="w-5 h-5 mb-1" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Dark</span>
                    </button>
                    <button onClick={() => updateField('theme', 'light')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${settings.theme === 'light' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                      <Sun className="w-5 h-5 mb-1" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Light</span>
                    </button>
                    <button onClick={() => updateField('theme', 'cosmic')} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${settings.theme === 'cosmic' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                      <Sparkles className="w-5 h-5 mb-1" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Cosmic</span>
                    </button>
                 </div>
               </div>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
