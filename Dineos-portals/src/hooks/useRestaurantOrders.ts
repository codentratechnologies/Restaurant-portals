import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
export interface OrderData {
 id: string;
 status: string;
 type: 'Delivery' | 'Takeaway' | 'Dine-In';
 customer: {
 name: string;
 phone: string;
 address?: string;
 };
 items: {
 name: string;
 price: number;
 qty: number;
 subtotal: number;
 customizations?: any[];
 }[];
 billing: {
 subtotal: number;
 tax: number;
 total: number;
 deliveryFee?: number;
 discount?: number;
 };
 payment: {
 method: 'Online' | 'COD';
 status: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
 };
 deliveryAgent?: {
 name: string;
 contact: string;
 };
 agent?: {
 name: string;
 phone: string;
 };
 timeline?: any[];
 rejectionReason?: string;
 rejectionNotes?: string;
 cancellationReason?: string;
 created_at?: number;
 acceptedAt?: number;
 _key?: string;
 _customerId?: string;
 _branchId?: string;
 branch?: string;
}

import { useAuth } from './useAuth';

export function useRestaurantOrders() {
  const { activeAssignment } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [customersData, setCustomersData] = useState<any>({});
  const [deliveriesData, setDeliveriesData] = useState<any>({});
  const [employeesData, setEmployeesData] = useState<any>({});
  const [branchPushId, setBranchPushId] = useState<string>('');
  const [masterMenu, setMasterMenu] = useState<any[]>([]);

  useEffect(() => {
    if (activeAssignment) {
      setCurrentUser({
        adminId: activeAssignment.adminId,
        branch: activeAssignment.branchId,
      });
    } else {
      setLoading(false);
    }
  }, [activeAssignment]);

  // 1. Fetch branch push ID
  useEffect(() => {
    if (!currentUser) return;
    
    const unsub = onValue(ref(rtdb, `branch/${currentUser.adminId}`), (branchSnap) => {
      if (branchSnap.exists()) {
        const branches = branchSnap.val();
        const matchedPushId = Object.keys(branches).find(key => 
          branches[key].code?.toLowerCase() === currentUser.branch?.toLowerCase()
        );
        if (matchedPushId) {
          setBranchPushId(matchedPushId);
        } else {
          setBranchPushId(currentUser.branch);
        }
      } else {
        setBranchPushId(currentUser.branch);
      }
    });

    return () => unsub();
  }, [currentUser]);

  // 2. Listen to customers
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onValue(ref(rtdb, `user_customer/${currentUser.adminId}`), (snap) => {
      if (snap.exists()) setCustomersData(snap.val());
    });
    return () => unsub();
  }, [currentUser]);

  // 3. Listen to orders for this branch
  useEffect(() => {
    if (!currentUser || !branchPushId) return;
    setLoading(true);
    
    const ordersRef = ref(rtdb, `order/${currentUser.adminId}/${branchPushId}`);
    const unsub = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loaded: any[] = [];
        
        Object.keys(data).forEach(orderId => {
          loaded.push({ ...data[orderId], _key: orderId });
        });
        
        loaded.sort((a, b) => (b.orderDate ? new Date(b.orderDate).getTime() : 0) - (a.orderDate ? new Date(a.orderDate).getTime() : 0));
        setRawOrders(loaded);
      } else {
        setRawOrders([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [currentUser, branchPushId]);

  // 3a. Listen to deliveries for this branch
  useEffect(() => {
    if (!currentUser || !branchPushId) return;
    const unsub = onValue(ref(rtdb, `delivery/${currentUser.adminId}/${branchPushId}`), snap => {
      if (snap.exists()) setDeliveriesData(snap.val());
      else setDeliveriesData({});
    });
    return () => unsub();
  }, [currentUser, branchPushId]);

  // 3b. Listen to employees for this admin
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onValue(ref(rtdb, `employee/${currentUser.adminId}`), snap => {
      if (snap.exists()) setEmployeesData(snap.val());
      else setEmployeesData({});
    });
    return () => unsub();
  }, [currentUser]);

  // 4. Merge data
  useEffect(() => {
    const mergedOrders: OrderData[] = rawOrders.map(rawOrder => {
      const custId = rawOrder.customerId || rawOrder.userId || rawOrder.user_id;
      const customer = custId ? (customersData[custId] || {}) : {};
      const itemsList = Array.isArray(rawOrder.items) 
        ? rawOrder.items 
        : rawOrder.items ? Object.values(rawOrder.items) : [];

      return {
        id: rawOrder.id || rawOrder._key,
        _key: rawOrder._key,
        _customerId: custId,
        _branchId: branchPushId,
        status: rawOrder.status === 'Placed' ? 'Pending' : rawOrder.status,
        type: 'Delivery',
        customer: {
          name: customer.fullName || customer.name || rawOrder.customer?.name || rawOrder.customerName || 'Customer',
          phone: customer.mobileNumber || customer.phone || rawOrder.customer?.phone || rawOrder.customerMobile || '',
          address: customer.address || rawOrder.deliveryAddress?.addressLine || ''
        },
        items: itemsList.map((i: any) => ({
          name: i.name || 'Item',
          qty: i.quantity || 1,
          price: i.unit_price || 0,
          subtotal: i.total_price || 0
        })),
        billing: {
          subtotal: rawOrder.subtotal || 0,
          tax: rawOrder.tax || 0,
          total: rawOrder.total || 0
        },
        payment: {
          method: rawOrder.paymentMethod || 'Online',
          status: rawOrder.paymentStatus || 'Paid'
        },
        created_at: rawOrder.orderDate ? new Date(rawOrder.orderDate).getTime() : Date.now(),
        acceptedAt: rawOrder.acceptedAt || null,
        rejectionReason: rawOrder.rejectionReason,
        rejectionNotes: rawOrder.rejectionNotes,
        cancellationReason: rawOrder.cancellationReason,
        deliveryAgent: (() => {
          let deliveryAgentObj: any = undefined;
          let foundBoyId: string | null = null;
          const orderKey = rawOrder.id || rawOrder._key;

          // 1. Search in deliveriesData for the boy holding this order
          if (deliveriesData) {
            for (const boyId of Object.keys(deliveriesData)) {
              if (deliveriesData[boyId] && deliveriesData[boyId][orderKey]) {
                foundBoyId = boyId;
                break;
              }
            }
          }

          // 2. Fetch boy details from employeesData
          if (foundBoyId && employeesData) {
            // Find employee in any branch (since deliveriesData is branch-specific but employeesData might be grouped by branch code)
            for (const branchCode of Object.keys(employeesData)) {
              if (employeesData[branchCode] && employeesData[branchCode][foundBoyId]) {
                const emp = employeesData[branchCode][foundBoyId];
                deliveryAgentObj = {
                  name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown',
                  contact: emp.phone || emp.mobileNumber || 'N/A'
                };
                break;
              }
            }
          }

          // 3. Fallback
          if (!deliveryAgentObj) {
            deliveryAgentObj = rawOrder.deliveryAgent ? {
              name: rawOrder.deliveryAgent.name || rawOrder.deliveryAgent.fullName || 'Unknown',
              contact: rawOrder.deliveryAgent.contact || rawOrder.deliveryAgent.phone || 'N/A'
            } : (rawOrder.deliveryPartner ? {
              name: rawOrder.deliveryPartner.name || rawOrder.deliveryPartner.fullName || 'Unknown',
              contact: rawOrder.deliveryPartner.contact || rawOrder.deliveryPartner.phone || 'N/A'
            } : (rawOrder.agent ? {
              name: rawOrder.agent.name || rawOrder.agent.fullName || 'Unknown',
              contact: rawOrder.agent.contact || rawOrder.agent.phone || 'N/A'
            } : undefined));
          }

          return deliveryAgentObj;
        })()
      };
    });
    setOrders(mergedOrders);
  }, [rawOrders, customersData, deliveriesData, employeesData, branchPushId]);

  // 5. Listen to master menu
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onValue(ref(rtdb, `menu/${currentUser.adminId}`), (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        let itemsList: any[] = [];
        
        Object.keys(data).forEach((categoryKey) => {
          const node = data[categoryKey];
          if (typeof node === 'object' && node !== null) {
            if (node.name !== undefined && node.price !== undefined) return;
            Object.keys(node).forEach((foodIdKey) => {
              const item = node[foodIdKey];
              if (typeof item === 'object' && item !== null && item.name) {
                itemsList.push(item);
              }
            });
          }
        });
        setMasterMenu(itemsList);
      } else {
        setMasterMenu([]);
      }
    });
    return () => unsub();
  }, [currentUser]);

  return { orders, loading, currentUser, branchPushId, masterMenu };
}
