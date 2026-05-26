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
      console.error(e);
      setErr(e?.message || "Failed to authenticate.");
      alert(`Authentication Error: ${e?.message}\n\nPlease ensure you have:\n1. Enabled Google Auth in Firebase Console.\n2. Added this app's URL to Authorized Domains in Firebase Auth settings.`);
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
