import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        if (!cachedAccessToken && !isSigningIn) {
             // Incase we have user but no access token, we might need them to re-login if token requires
             // but we keep user signed in.
        }
      } else {
         setUser(null);
         cachedAccessToken = null;
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setErr(null);
      
      // Notify the user if they're attempting to sign in from inside the AI Studio iframe
      // as many modern browsers (Chrome, Safari, Brave) block the popup or cross-origin cookies.
      if (window !== window.top) {
        const proceed = window.confirm(
          "You are running this app inside the AI Studio preview window. " +
          "Google Sign-In often fails here due to browser security blocking secure popups inside embedded frames.\n\n" +
          "If the sign-in popup fails to open or gets stuck, please click the 🔗 (Open in new tab) icon in the top right of the preview pane to open the app in its own window, and try again.\n\n" +
          "Do you want to try signing in here anyway?"
        );
        if (!proceed) return;
      }

      isSigningIn = true;
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      provider.addScope('https://www.googleapis.com/auth/gmail.send');
      provider.addScope('https://www.googleapis.com/auth/gmail.modify');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
         cachedAccessToken = credential.accessToken;
      }
      setUser(result.user);
    } catch (e: any) {
      console.error("Sign in error: ", e);
      setErr(e?.message || "Failed to authenticate.");
      alert(
        `Authentication Error: ${e?.message}\n\n` +
        `If you have already authorized this domain, this error is usually caused by browser third-party cookie restrictions inside the preview iframe.\n\n` +
        `HOW TO FIX:\n` +
        `1. Click the 'Open in new tab' ↗️ button in the top right corner of the AI Studio preview.\n` +
        `2. Try signing in again from the full-screen tab.\n` +
        `3. Ensure popup blockers are disabled for this site.`
      );
    } finally {
      isSigningIn = false;
    }
  };

  const logout = async () => {
     await signOut(auth);
     cachedAccessToken = null;
  };

  return { user, loading, login, logout, err };
}
