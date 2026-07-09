import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'Branch Manager' | 'Delivery Partner' | string;
  branch: string;
  doj: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
  branchCode: string;
}

export function useEmployees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Reference to the 'employee/{user_id}' node containing branch folders
    const employeeRef = ref(rtdb, `employee/${user.uid}`);

    // Set up a real-time listener
    const unsubscribe = onValue(
      employeeRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const employeeList: Employee[] = [];
          
          // Flatten the nested structure
          // data is like: { "B001": { "push1": {...}, "push2": {...} }, "B002": {...} }
          Object.keys(data).forEach((branchCode) => {
            const branchEmployees = data[branchCode];
            if (branchEmployees && typeof branchEmployees === 'object') {
              Object.keys(branchEmployees).forEach((empId) => {
                const emp = branchEmployees[empId];
                let role = emp.role;
                if (role === 'Manager') role = 'Branch Manager';
                if (role === 'Delivery Executive') role = 'Delivery Partner';
                
                let status = emp.status;
                
                employeeList.push({
                  id: empId,
                  branchCode,
                  ...emp,
                  role,
                  status,
                });
              });
            }
          });
          
          // Sort by created_at descending (newest first)
          employeeList.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          setEmployees(employeeList);
        } else {
          setEmployees([]); // Database node doesn't exist or is empty
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees.');
        setLoading(false);
      }
    );

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [user]);

  return { employees, loading, error };
}
