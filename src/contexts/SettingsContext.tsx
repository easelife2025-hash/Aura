import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';

export interface UserSettings {
  smartReminders: boolean;
  pushNotifications: boolean;
  personalizedRecommendations: boolean;
  dailyInsights: boolean;
  personalityMode: 'professional' | 'friendly' | 'concise' | 'creative';
  theme: 'system' | 'dark' | 'light' | 'cosmic';
}

export const defaultSettings: UserSettings = {
  smartReminders: true,
  pushNotifications: false,
  personalizedRecommendations: true,
  dailyInsights: true,
  personalityMode: 'friendly',
  theme: 'dark'
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Initialize from exact stored theme or default
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('aura_settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return defaultSettings;
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadSettings() {
      try {
        const docRef = doc(db, `users/${user!.uid}/settings/preferences`);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const loaded = snapshot.data() as UserSettings;
          setSettings(loaded);
          localStorage.setItem('aura_settings', JSON.stringify(loaded));
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user]);

  useEffect(() => {
    // Apply theme
    let activeTheme = settings.theme;
    if (activeTheme === 'system') {
       activeTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.documentElement.setAttribute('data-personality', settings.personalityMode);
  }, [settings.theme, settings.personalityMode]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('aura_settings', JSON.stringify(newSettings));
    
    if (user) {
      try {
         const docRef = doc(db, `users/${user.uid}/settings/preferences`);
         await setDoc(docRef, newSettings, { merge: true });
      } catch(err) {
         console.error("Failed to sync settings", err);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
