import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Branch {
  id: string;
  code?: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  cuisine_type: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  logo_url?: string;
  googleMapUrl?: string;
}

export function useBranches() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Reference to the 'branch/{user_id}' node
    const branchesRef = query(ref(rtdb, `branch/${user.uid}`), orderByChild('created_at'));

    // Set up a real-time listener
    const unsubscribe = onValue(
      branchesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const branchesList: Branch[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          
          // Reverse to show newest first
          setBranches(branchesList.reverse());
        } else {
          setBranches([]); // Database node doesn't exist or is empty
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching branches:', err);
        setError('Failed to load branches.');
        setLoading(false);
      }
    );

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return { branches, loading, error };
}

