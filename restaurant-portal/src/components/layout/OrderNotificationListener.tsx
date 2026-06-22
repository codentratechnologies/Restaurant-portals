import { useEffect, useRef } from 'react';
import { ref, onValue, get, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function OrderNotificationListener() {
  const initialLoadComplete = useRef(false);
  const knownOrders = useRef(new Set<string>());

  useEffect(() => {
    const userStr = localStorage.getItem('restaurant_user');
    if (!userStr) return;
    const currentUser = JSON.parse(userStr);

    let isCancelled = false;
 let unsubOrders: any;

    const initListener = async () => {
      let branchPushId = currentUser.branch;
      try {
        const branchSnap = await get(ref(rtdb, `branch/${currentUser.adminId}`));
        if (branchSnap.exists()) {
          const branches = branchSnap.val();
          const matchedPushId = Object.keys(branches).find(key => 
            branches[key].code?.toLowerCase() === currentUser.branch?.toLowerCase()
          );
          if (matchedPushId) {
            branchPushId = matchedPushId;
          }
        }
      } catch (e) {}

      if (isCancelled) return;

      const ordersRef = ref(rtdb, `order/${currentUser.adminId}/${branchPushId}`);
      
      unsubOrders = onValue(ordersRef, async (snapshot) => {
        if (!snapshot.exists()) {
          initialLoadComplete.current = true;
          return;
        }

        const data = snapshot.val();
        const currentOrderIds = new Set<string>();
        const newOrdersToNotify: any[] = [];

        Object.keys(data).forEach(orderId => {
          currentOrderIds.add(orderId);
          const rawOrder = data[orderId];
          const status = rawOrder.status;

          if (
            initialLoadComplete.current && 
            !knownOrders.current.has(orderId) &&
            (status === 'Placed' || status === 'Pending')
          ) {
            newOrdersToNotify.push({ ...rawOrder, _key: orderId });
          }
        });

        for (const rawOrder of newOrdersToNotify) {
          let customerName = 'Customer';
          if (rawOrder.customerId) {
            try {
              const custSnap = await get(ref(rtdb, `user_customer/${rawOrder.customerId}`));
              if (custSnap.exists()) {
                customerName = custSnap.val().fullName || 'Customer';
              }
            } catch (e) {}
          }

          toast((t) => (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-brand-orange-100 rounded-full flex items-center justify-center">
                <span className="text-brand-orange-600 text-lg">🔔</span>
              </div>
              <div>
                <p className="text-sm font-bold text-brand-navy">New Order Received!</p>
                <p className="text-xs font-medium text-text-secondary">
                  Order <span className="font-mono text-brand-orange-600">#{(rawOrder.id || rawOrder._key || '').slice(-6).toUpperCase()}</span> from {customerName}
                </p>
              </div>
            </div>
          ), { duration: 8000, position: 'top-right' });

          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => {});
          } catch (e) {}
        }

        knownOrders.current = currentOrderIds;
        initialLoadComplete.current = true;
      });
    };

    initListener();

    return () => { 
 isCancelled = true;
 if (unsubOrders) unsubOrders(); 
 };
  }, []);

  return null;
}
