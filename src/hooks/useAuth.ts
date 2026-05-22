import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      setErr(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to authenticate.");
      alert(`Authentication Error: ${e?.message}\n\nPlease ensure you have:\n1. Enabled Google Auth in Firebase Console.\n2. Added this app's URL to Authorized Domains in Firebase Auth settings.`);
    }
  };

  const logout = () => signOut(auth);

  return { user, loading, login, logout, err };
}
