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
import { hashPassword } from '../lib/utils';

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;
const LOGIN_TIME_KEY = 'dineos_login_time';
const ACTIVE_ASSIGNMENT_KEY = 'dineos_active_assignment';
const CACHED_USER_KEY = 'dineos_cached_user';
const CACHED_USER_DATA_KEY = 'dineos_cached_user_data';

export interface Assignment {
  adminId: string;
  restaurantName?: string;
  logoUrl?: string;
  branchId?: string;
  role: string;
}

export interface UserData {
  email: string;
  name?: string;
  assignments: Assignment[];
  isOnboardingComplete?: boolean;
  isUnderReview?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  activeAssignment: Assignment | null;
  setActiveAssignment: (assignment: Assignment | null) => void;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, restaurantName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(CACHED_USER_KEY);
      return stored ? JSON.parse(stored) as User : null;
    } catch { return null; }
  });
  const [userData, setUserData] = useState<UserData | null>(() => {
    try {
      const stored = localStorage.getItem(CACHED_USER_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [activeAssignment, setActiveAssignmentState] = useState<Assignment | null>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_ASSIGNMENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(!localStorage.getItem(CACHED_USER_KEY));
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
        if (loginTime && Date.now() - parseInt(loginTime, 10) > SESSION_EXPIRY_MS) {
          await signOut(auth);
          localStorage.removeItem(LOGIN_TIME_KEY);
          localStorage.removeItem(CACHED_USER_KEY);
          localStorage.removeItem(CACHED_USER_DATA_KEY);
          localStorage.removeItem(ACTIVE_ASSIGNMENT_KEY);
          setUser(null);
          setLoading(false);
          return;
        }
        if (!loginTime) {
          localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());
        }

        const fetchUserData = async () => {
          // Check if they are an admin first
          const adminRef = ref(rtdb, `admin_users/${firebaseUser.uid}`);
          
          onValue(adminRef, async (adminSnap) => {
            if (adminSnap.exists()) {
              const data = adminSnap.val();
              const uData = {
                email: firebaseUser.email || '',
                name: data.authorized_person_name || data.name || '',
                assignments: [{ 
                  adminId: firebaseUser.uid, 
                  role: data.role || 'root_admin',
                  restaurantName: data.restaurant_details?.businessDetails?.restaurantName || data.restaurant_name || 'My Restaurant',
                  logoUrl: data.restaurant_details?.operationalDetails?.logoUrl || null
                }],
                isOnboardingComplete: data.restaurant_details?.status === 'Approved',
                isUnderReview: !!data.restaurant_details && data.restaurant_details.status !== 'Approved'
              };
              localStorage.setItem(CACHED_USER_KEY, JSON.stringify({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL }));
              localStorage.setItem(CACHED_USER_DATA_KEY, JSON.stringify(uData));
              setUser(firebaseUser);
              setUserData(uData);
              setActiveAssignmentState(uData.assignments[0]);
              localStorage.setItem(ACTIVE_ASSIGNMENT_KEY, JSON.stringify(uData.assignments[0]));
              setLoading(false);
            } else {
              // Not an admin, scan entire employee DB
              const employeeRef = ref(rtdb, 'employee');
              const snapshot = await get(employeeRef);
          
          let uData: UserData | null = null;

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
                      // Match by UID or fallback to Email since auto-migration changes UID
                      if (empUid === firebaseUser.uid || (emp.email && firebaseUser.email && emp.email.toLowerCase() === firebaseUser.email.toLowerCase())) {
                        uData = {
                          email: emp.email || firebaseUser.email || '',
                          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || 'User',
                          assignments: [{
                            adminId: adminUid,
                            branchId: branchCode,
                            role: emp.role || 'Employee'
                          }]
                        };
                        break;
                      }
                    }
                  }
                  if (uData) break;
                }
              }
              if (uData) break;
            }
          }

          if (uData) {
            localStorage.setItem(CACHED_USER_KEY, JSON.stringify({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL }));
            localStorage.setItem(CACHED_USER_DATA_KEY, JSON.stringify(uData));
            setUser(firebaseUser);
            setUserData(uData);
            setActiveAssignmentState(uData.assignments[0]);
            localStorage.setItem(ACTIVE_ASSIGNMENT_KEY, JSON.stringify(uData.assignments[0]));
          } else {
            localStorage.removeItem(CACHED_USER_KEY);
            localStorage.removeItem(CACHED_USER_DATA_KEY);
            localStorage.removeItem(ACTIVE_ASSIGNMENT_KEY);
            localStorage.removeItem(LOGIN_TIME_KEY);
            setUser(null);
            setUserData(null);
            setActiveAssignmentState(null);
          }
          setLoading(false);
            }
          });
        };

        fetchUserData();
        setUser(firebaseUser);
      } else {
        // Check if there is a custom employee session active
        const cachedUser = localStorage.getItem(CACHED_USER_KEY);
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            if (parsedUser.isCustomEmployee) {
              const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
              if (loginTime && Date.now() - parseInt(loginTime, 10) > SESSION_EXPIRY_MS) {
                // Session expired
                setUser(null);
                setUserData(null);
                setActiveAssignment(null);
                localStorage.removeItem(LOGIN_TIME_KEY);
                localStorage.removeItem(CACHED_USER_KEY);
                localStorage.removeItem(CACHED_USER_DATA_KEY);
                localStorage.removeItem(ACTIVE_ASSIGNMENT_KEY);
                setLoading(false);
                return;
              }
              
              // Restore custom employee session
              setUser(parsedUser as unknown as User);
              const cachedData = localStorage.getItem(CACHED_USER_DATA_KEY);
              if (cachedData) setUserData(JSON.parse(cachedData));
              const cachedAssignment = localStorage.getItem(ACTIVE_ASSIGNMENT_KEY);
              if (cachedAssignment) setActiveAssignment(JSON.parse(cachedAssignment));
              setLoading(false);
              return;
            }
          } catch {
            // parsing error, fallback to logout
          }
        }
        
        setUser(null);
        setUserData(null);
        setActiveAssignment(null);
        localStorage.removeItem(LOGIN_TIME_KEY);
        localStorage.removeItem(CACHED_USER_KEY);
        localStorage.removeItem(CACHED_USER_DATA_KEY);
        localStorage.removeItem(ACTIVE_ASSIGNMENT_KEY);
        setLoading(false); // Stop loading if logged out
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string, name: string, restaurantName: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      
      // For backwards compatibility and core admin info
      await set(ref(rtdb, `admin_users/${uid}`), { authorized_person_name: name, restaurant_name: restaurantName, email, role: 'root_admin', is_active: true });
    } catch (err: unknown) {
      const authErr = err as { message: string };
      setError(authErr.message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const authErr = err as { code?: string; message?: string };
      // If it's an invalid credential or user not found, try Custom Employee DB Login
      if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password') {
        try {
          const employeeRef = ref(rtdb, 'employee');
          const snapshot = await get(employeeRef);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let foundEmployee: any = null;
          let adminUidOfEmployee = '';
          let branchCodeOfEmployee = '';

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
                      if (emp.email && emp.email.toLowerCase() === email.toLowerCase()) {
                        foundEmployee = { ...emp, empUid };
                        adminUidOfEmployee = adminUid;
                        branchCodeOfEmployee = branchCode;
                        break;
                      }
                    }
                  }
                  if (foundEmployee) break;
                }
              }
              if (foundEmployee) break;
            }
          }

          if (foundEmployee) {
            const hashedAttempt = await hashPassword(password);
            if (foundEmployee.password === hashedAttempt) {
              // Login successful!
              const fakeUser = {
                uid: foundEmployee.empUid,
                email: foundEmployee.email,
                displayName: `${foundEmployee.firstName || ''} ${foundEmployee.lastName || ''}`.trim() || foundEmployee.name,
                isCustomEmployee: true
              };
              
              const uData: UserData = {
                email: foundEmployee.email,
                name: fakeUser.displayName,
                assignments: [{
                  adminId: adminUidOfEmployee,
                  branchId: branchCodeOfEmployee,
                  role: foundEmployee.role || 'Employee'
                }],
                isOnboardingComplete: true
              };

              localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());
              localStorage.setItem(CACHED_USER_KEY, JSON.stringify(fakeUser));
              localStorage.setItem(CACHED_USER_DATA_KEY, JSON.stringify(uData));
              localStorage.setItem(ACTIVE_ASSIGNMENT_KEY, JSON.stringify(uData.assignments[0]));
              
              setUser(fakeUser as unknown as User);
              setUserData(uData);
              setActiveAssignment(uData.assignments[0]);
              
              return; // Successfully logged in custom employee
            } else {
              throw new Error('Invalid email or password', { cause: err });
            }
          } else {
             throw new Error('Invalid email or password', { cause: err });
          }
        } catch (dbErr: unknown) {
          const dbError = dbErr as Error;
          setError(dbError.message || 'Invalid email or password');
          if (dbError.message === 'Invalid email or password') throw dbError;
          throw new Error('Invalid email or password', { cause: dbErr });
        }
      }

      setError(authErr.message || 'Authentication error');
      throw err;
    }
  };

  const logout = async () => {
    try { await signOut(auth); } catch { /* ignore */ }
    localStorage.removeItem(LOGIN_TIME_KEY);
    localStorage.removeItem(CACHED_USER_KEY);
    localStorage.removeItem(CACHED_USER_DATA_KEY);
    localStorage.removeItem(ACTIVE_ASSIGNMENT_KEY);
    setUser(null);
    setUserData(null);
    setActiveAssignment(null);
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const authErr = err as { message: string };
      setError(authErr.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, activeAssignment, setActiveAssignment, loading, error, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
