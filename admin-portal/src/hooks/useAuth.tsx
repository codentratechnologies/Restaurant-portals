// Authentication Context
// -----------------------
// Provides auth state (current user, loading, login, logout)
// to the entire admin portal.
//
// 24-hour session enforcement:
//   - On login (onAuthStateChanged fires), we store the timestamp.
//   - On every subsequent load we check if 24h has passed.
//   - If yes, we force sign out automatically.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { auth, rtdb } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import toast from 'react-hot-toast';

// ── Constants ────────────────────────────────────────────────────
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const LOGIN_TIME_KEY    = 'dineos_login_time';

// ── Types ─────────────────────────────────────────────────────────
interface AuthContextType {
  user:    User | null;
  loading: boolean;
  error:   string | null;
  login:   (email: string, password: string) => Promise<void>;
  signup:  (email: string, password: string, name: string) => Promise<void>;
  logout:  () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let dbUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const loginTime = localStorage.getItem(LOGIN_TIME_KEY);

        if (loginTime) {
          // User was previously logged in — check if 24h has expired
          const elapsed = Date.now() - parseInt(loginTime, 10);
          if (elapsed > SESSION_EXPIRY_MS) {
            // Session expired — force logout
            await signOut(auth);
            localStorage.removeItem(LOGIN_TIME_KEY);
            setUser(null);
            setLoading(false);
            return;
          }
        } else {
          // No timestamp yet — this is a FRESH login event.
          // Store the timestamp now so future loads can check expiry.
          localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());
        }

        // Real-Time Database Profile Status Listener
        const userRef = ref(rtdb, `admin_users/${firebaseUser.uid}`);
        dbUnsubscribe = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.is_active === false) {
              signOut(auth);
              toast.error('Your account has been deactivated.');
            }
          }
        });

        // Valid session — set the user
        setUser(firebaseUser);
      } else {
        // Signed out
        if (dbUnsubscribe) {
          dbUnsubscribe();
          dbUnsubscribe = null;
        }
        setUser(null);
        localStorage.removeItem(LOGIN_TIME_KEY);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (dbUnsubscribe) dbUnsubscribe();
    };
  }, []);

  // ── Signup ───────────────────────────────────────────────────────
  const signup = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Create admin user record in RTDB
      await set(ref(rtdb, `admin_users/${newUser.uid}`), {
        name,
        email,
        role: 'Admin',
        is_active: true,
        created_at: new Date().toISOString()
      });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      if (message.includes('email-already-in-use')) {
        setError('An account with this email already exists.');
      } else if (message.includes('weak-password')) {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Signup failed. Please try again.');
      }
      throw err;
    }
  };

  // ── Login ────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setError(null);
    // signInWithEmailAndPassword triggers onAuthStateChanged automatically.
    // The timestamp is stored there, not here, to avoid race conditions.
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message.includes('invalid-credential') || message.includes('wrong-password') || message.includes('user-not-found')) {
        setError('Invalid email or password. Please try again.');
      } else if (message.includes('too-many-requests')) {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
      throw err;
    }
  };

  // ── Logout ───────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem(LOGIN_TIME_KEY);
  };

  // ── Reset Password ───────────────────────────────────────────────
  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      if (message.includes('user-not-found') || message.includes('invalid-email')) {
        setError('No user found with this email address.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
