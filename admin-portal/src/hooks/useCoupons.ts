import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Coupon {
  id: string;
  couponId?: string;
  code: string;
  status: 'Active' | 'Inactive' | 'Terminated';
  discountType: 'Percentage' | 'Flat';
  discountPercentage?: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  validFrom: string;
  validUntil: string;
  targetAudience: 'All' | 'New Users' | 'Loyalty';
  applicableBranches: string[];
  created_at: string;
  updated_at: string;
}

const getDynamicStatus = (validFromStr: string, validUntilStr: string): 'Active' | 'Inactive' | 'Terminated' => {
  if (!validFromStr || !validUntilStr) return 'Active';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validFrom = new Date(validFromStr);
  validFrom.setHours(0, 0, 0, 0);

  const validUntil = new Date(validUntilStr);
  validUntil.setHours(0, 0, 0, 0);

  if (today < validFrom) {
    return 'Inactive';
  } else if (today > validUntil) {
    return 'Terminated';
  } else {
    return 'Active';
  }
};

export function useCoupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const couponsRef = query(ref(rtdb, `coupons/${user.uid}`), orderByChild('created_at'));

    const unsubscribe = onValue(
      couponsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const couponsList: Coupon[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            status: getDynamicStatus(data[key].validFrom, data[key].validUntil),
          }));
          
          setCoupons(couponsList.reverse());
        } else {
          setCoupons([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching coupons:', err);
        setError('Failed to load coupons.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { coupons, loading, error };
}

