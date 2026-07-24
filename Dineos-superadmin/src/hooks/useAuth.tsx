import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, rtdb } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if this UID exists in super_admins node
        const snap = await get(ref(rtdb, `super_admins/${firebaseUser.uid}`));
        if (snap.exists()) {
          setUser(firebaseUser);
          setIsSuperAdmin(true);
        } else {
          // Not a super admin — sign them out immediately
          await firebaseSignOut(auth);
          setUser(null);
          setIsSuperAdmin(false);
          setError('Access denied. This portal is for Super Admins only.');
        }
      } else {
        setUser(null);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the super_admin check
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found'
        ? 'Invalid email or password.'
        : err.message;
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, isSuperAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
