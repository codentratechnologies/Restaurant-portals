import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { auth, rtdb } from '../lib/firebase';
import { ref, onValue, set, get } from 'firebase/database';
import toast from 'react-hot-toast';

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;
const LOGIN_TIME_KEY = 'dineos_login_time';
const ACTIVE_ASSIGNMENT_KEY = 'dineos_active_assignment';

export interface Assignment {
  adminId: string;
  restaurantName?: string;
  branchId?: string;
  role: string;
}

export interface UserData {
  email: string;
  name?: string;
  assignments: Assignment[];
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  activeAssignment: Assignment | null;
  setActiveAssignment: (assignment: Assignment | null) => void;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeAssignment, setActiveAssignmentState] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setActiveAssignment = (assignment: Assignment | null) => {
    setActiveAssignmentState(assignment);
    if (assignment) {
      localStorage.setItem(ACTIVE_ASSIGNMENT_KEY, JSON.stringify(assignment));
    } else {
      localStorage.removeItem(ACTIVE_ASSIGNMENT_KEY);
    }
  };

  useEffect(() => {
    let dbUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
        if (loginTime && Date.now() - parseInt(loginTime, 10) > SESSION_EXPIRY_MS) {
          await signOut(auth);
          localStorage.removeItem(LOGIN_TIME_KEY);
          setUser(null);
          setLoading(false);
          return;
        }
        if (!loginTime) {
          localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());
        }

        // Fetch global user assignments
        const userRef = ref(rtdb, `users/${firebaseUser.uid}`);
        
        dbUnsubscribe = onValue(userRef, async (snapshot) => {
          let uData = snapshot.exists() ? snapshot.val() : null;
          
          // If no assignments found, check if they are an admin
          if (!uData?.assignments || uData.assignments.length === 0) {
            const adminSnap = await get(ref(rtdb, `admin_users/${firebaseUser.uid}`));
            if (adminSnap.exists()) {
              const data = adminSnap.val();
              uData = {
                email: firebaseUser.email || '',
                name: data.name || '',
                assignments: [{ adminId: firebaseUser.uid, role: data.role || 'Admin' }]
              };
            }
          }

          if (uData) {
            setUserData(uData);
            // Always derive assignment from fresh DB data — never trust stale localStorage
            if (uData.assignments?.length === 1) {
              // Single assignment: set it directly
              setActiveAssignmentState(uData.assignments[0]);
              localStorage.setItem(ACTIVE_ASSIGNMENT_KEY, JSON.stringify(uData.assignments[0]));
            } else if (uData.assignments?.length > 1) {
              // Multiple assignments: try saved, but verify it belongs to this user
              const saved = localStorage.getItem(ACTIVE_ASSIGNMENT_KEY);
              if (saved) {
                const parsed = JSON.parse(saved);
                const valid = uData.assignments.find((a: Assignment) => a.adminId === parsed.adminId && a.role === parsed.role);
                setActiveAssignmentState(valid || uData.assignments[0]);
              } else {
                setActiveAssignmentState(uData.assignments[0]);
              }
            }
          } else {
            setUserData(null);
          }
          setLoading(false); // Only stop loading when first DB fetch completes
        });

        setUser(firebaseUser);
      } else {
        if (dbUnsubscribe) {
          dbUnsubscribe();
          dbUnsubscribe = null;
        }
        setUser(null);
        setUserData(null);
        setActiveAssignment(null);
        localStorage.removeItem(LOGIN_TIME_KEY);
        setLoading(false); // Stop loading if logged out
      }
    });

    return () => {
      unsubscribe();
      if (dbUnsubscribe) dbUnsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      
      // For backwards compatibility and core admin info
      await set(ref(rtdb, `admin_users/${uid}`), { name, email, role: 'Admin', is_active: true });
      
      // New structure
      await set(ref(rtdb, `users/${uid}`), {
        email, name, assignments: [{ adminId: uid, role: 'Admin' }]
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.message.includes('invalid-credential') || err.message.includes('user-not-found')) {
        try {
          const { hashPassword } = await import('../lib/utils');
          const hashedPw = await hashPassword(password);
          const employeeRef = ref(rtdb, 'employee');
          const snapshot = await get(employeeRef);
          
          let matchedUser: any = null;
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            for (const adminUid in data) {
              const branches = data[adminUid];
              if (typeof branches === 'object') {
                for (const branchCode in branches) {
                  const employees = branches[branchCode];
                  if (typeof employees === 'object') {
                    for (const empUid in employees) {
                      const emp = employees[empUid];
                      if (emp && emp.email === email && emp.password === hashedPw) {
                        matchedUser = { ...emp, branch: branchCode, id: empUid, adminId: adminUid };
                      }
                    }
                  }
                }
              }
            }
          }

          if (matchedUser) {
            // Auto-migrate them to Firebase Auth
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = cred.user.uid;
            
            await set(ref(rtdb, `users/${uid}`), {
              email: matchedUser.email,
              name: `${matchedUser.firstName || ''} ${matchedUser.lastName || ''}`.trim() || matchedUser.name || 'User',
              assignments: [{
                adminId: matchedUser.adminId,
                branchId: matchedUser.branch,
                role: matchedUser.role
              }]
            });
            // Stop throwing error, user is now authenticated!
            return;
          }
        } catch (migrationErr) {
          console.error("Migration fallback failed:", migrationErr);
        }
      }

      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem(LOGIN_TIME_KEY);
    localStorage.removeItem(ACTIVE_ASSIGNMENT_KEY);
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, activeAssignment, setActiveAssignment, loading, error, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
