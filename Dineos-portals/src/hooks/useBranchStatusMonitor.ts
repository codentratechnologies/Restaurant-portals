import { useEffect, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export function useBranchStatusMonitor() {
  const isRunning = useRef(false);

  useEffect(() => {
    if (isRunning.current) return;
    
    const userStr = localStorage.getItem('restaurant_user');
    if (!userStr) return;

    let user: any;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      return;
    }

    if (!user || !user.adminId) return;

    isRunning.current = true;

    // Listen to all branches for this admin
    const branchesRef = ref(rtdb, `branch/${user.adminId}`);
    
    // We only need to set up the interval once, but we need the latest branch data.
    // Instead of re-triggering the interval on every data change, we store the latest data in a ref.
    let latestBranches: any = null;
    
    const unsub = onValue(branchesRef, (snapshot) => {
      if (snapshot.exists()) {
        latestBranches = snapshot.val();
        // Run an immediate check whenever branches data updates
        checkAllBranches();
      } else {
        latestBranches = null;
      }
    });

    const checkAllBranches = () => {
      if (!latestBranches) return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTimeMins = currentHour * 60 + currentMin;

      Object.keys(latestBranches).forEach((branchId) => {
        const branchData = latestBranches[branchId];
        
        if (!branchData.openTime || !branchData.closeTime) return;

        try {
          const [openH, openM] = branchData.openTime.split(':').map(Number);
          const [closeH, closeM] = branchData.closeTime.split(':').map(Number);
          
          const openMins = openH * 60 + openM;
          const closeMins = closeH * 60 + closeM;
          
          let isOpen = false;
          if (closeMins < openMins) {
            // Crosses midnight
            if (currentTimeMins >= openMins || currentTimeMins < closeMins) {
              isOpen = true;
            }
          } else {
            // Standard hours
            if (currentTimeMins >= openMins && currentTimeMins < closeMins) {
              isOpen = true;
            }
          }

          const currentIsActive = branchData.is_active;

          // Strictly enforce database correctness
          // if (isOpen && currentIsActive === false) {
          //   set(ref(rtdb, `branch/${user.adminId}/${branchId}/is_active`), true).catch(console.error);
          // } else if (!isOpen && currentIsActive !== false) {
          //   set(ref(rtdb, `branch/${user.adminId}/${branchId}/is_active`), false).catch(console.error);
          // }
        } catch (e) {
          console.error("Error monitoring branch:", e);
        }
      });
    };

    const interval = setInterval(checkAllBranches, 60000); // Check every minute

    return () => {
      isRunning.current = false;
      clearInterval(interval);
      unsub();
    };
  }, []);
}
