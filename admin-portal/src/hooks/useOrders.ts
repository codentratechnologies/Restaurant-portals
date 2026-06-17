import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  branch: string;
  billing: {
    total: number;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
  };
  status: 'Delivered' | 'Cancelled' | 'Preparing' | 'Out for Delivery' | 'Pending';
  type: 'Delivery' | 'Dine-in' | 'Takeaway';
  created_at: string;
  updated_at: string;
  agent?: {
    name: string;
    phone: string;
  };
  items?: Array<{
    id: number | string;
    name: string;
    category: string;
    price: number;
    qty: number;
    subtotal: number;
    customizations?: any[];
  }>;
  timeline?: Array<{
    status: string;
    time: string;
    completed: boolean;
  }>;
}

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const ordersRef = ref(rtdb, `order/${user.uid}`);
    const branchesRef = ref(rtdb, `branch/${user.uid}`);
    const customersRef = ref(rtdb, `user_customer/${user.uid}`);

    const deliveriesRef = ref(rtdb, `delivery/${user.uid}`);
    const employeesRef = ref(rtdb, `employee/${user.uid}`);

    let currentBranches: Record<string, any> = {};
    let currentCustomers: Record<string, any> = {};
    let currentDeliveries: Record<string, any> = {};
    let currentEmployees: Record<string, any> = {};
    let currentRawOrders: any = null;

    const processOrders = () => {
      if (!currentRawOrders) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersList: Order[] = [];
      Object.keys(currentRawOrders).forEach(branchId => {
        const branchOrders = currentRawOrders[branchId];
        if (typeof branchOrders === 'object' && branchOrders !== null) {
          Object.keys(branchOrders).forEach(orderId => {
            const rawOrder = branchOrders[orderId];
            
            const custId = rawOrder.userId || rawOrder.customerId || rawOrder.user_id;
            const custData = custId ? (currentCustomers[custId] || {}) : {};
            
            const branchData = currentBranches[branchId] || {};
            const branchDisplayName = branchData.name || branchData.branchName || rawOrder.branch || rawOrder.branchName || branchId;

            const mappedOrder: Order = {
              id: rawOrder.id || rawOrder.orderId || orderId,
              customer: {
                name: rawOrder.customer?.name || rawOrder.customerName || custData.fullName || custData.name || 'Unknown Customer',
                phone: rawOrder.customer?.phone || rawOrder.customerMobile || custData.mobileNumber || custData.phone || 'N/A',
                address: rawOrder.deliveryAddress?.addressLine || rawOrder.deliveryAddress || custData.address || ''
              },
              branch: branchDisplayName,
              billing: {
                total: rawOrder.total || rawOrder.totalAmount || rawOrder.billing?.total || 0,
                subtotal: rawOrder.subtotal || rawOrder.subTotal || rawOrder.billing?.subtotal || 0,
                tax: rawOrder.tax || rawOrder.taxAmount || rawOrder.billing?.tax || 0,
                deliveryFee: rawOrder.deliveryFee || rawOrder.billing?.deliveryFee || 0,
                discount: rawOrder.discount || rawOrder.billing?.discount || 0
              },
              status: rawOrder.status || 'Pending',
              type: rawOrder.type || rawOrder.orderType || 'Delivery',
              created_at: rawOrder.orderDate || rawOrder.created_at || rawOrder.timestamp || new Date().toISOString(),
              updated_at: rawOrder.updated_at || rawOrder.orderDate || new Date().toISOString(),
              agent: (() => {
                let deliveryAgentObj: any = undefined;
                let foundBoyId: string | null = null;
                const orderKey = rawOrder.id || rawOrder.orderId || orderId;

                // 1. Search in currentDeliveries[branchId] for the boy holding this order
                if (currentDeliveries[branchId]) {
                  for (const boyId of Object.keys(currentDeliveries[branchId])) {
                    if (currentDeliveries[branchId][boyId] && currentDeliveries[branchId][boyId][orderKey]) {
                      foundBoyId = boyId;
                      break;
                    }
                  }
                }

                // 2. Fetch boy details from currentEmployees[branchId]
                if (foundBoyId && currentEmployees[branchId] && currentEmployees[branchId][foundBoyId]) {
                  const emp = currentEmployees[branchId][foundBoyId];
                  deliveryAgentObj = {
                    name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown',
                    phone: emp.phone || emp.mobileNumber || 'N/A'
                  };
                }

                // 3. Fallback
                if (!deliveryAgentObj) {
                  deliveryAgentObj = rawOrder.deliveryAgent ? {
                    name: rawOrder.deliveryAgent.name || rawOrder.deliveryAgent.fullName || 'Unknown',
                    phone: rawOrder.deliveryAgent.phone || rawOrder.deliveryAgent.contact || 'N/A'
                  } : (rawOrder.deliveryPartner ? {
                    name: rawOrder.deliveryPartner.name || rawOrder.deliveryPartner.fullName || 'Unknown',
                    phone: rawOrder.deliveryPartner.phone || rawOrder.deliveryPartner.contact || 'N/A'
                  } : (rawOrder.agent ? {
                    name: rawOrder.agent.name || rawOrder.agent.fullName || 'Unknown',
                    phone: rawOrder.agent.phone || rawOrder.agent.contact || 'N/A'
                  } : undefined));
                }

                return deliveryAgentObj;
              })(),
              items: (rawOrder.items || rawOrder.cartItems || []).map((i: any, index: number) => ({
                id: i.id || index,
                name: i.name || i.itemName || 'Item',
                category: i.category || 'Food',
                price: i.unit_price || i.price || i.itemPrice || 0,
                qty: i.quantity || i.qty || 1,
                subtotal: i.total_price || i.subtotal || i.totalPrice || 0,
                customizations: i.customizations || i.addons || i.modifiers || i.variants || []
              }))
            };
            
            ordersList.push(mappedOrder);
          });
        }
      });
      
      ordersList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(ordersList);
      setLoading(false);
    };

    const unsubBranches = onValue(branchesRef, (snap) => {
      currentBranches = snap.exists() ? snap.val() : {};
      if (currentRawOrders !== null) processOrders();
    });

    const unsubCustomers = onValue(customersRef, (snap) => {
      currentCustomers = snap.exists() ? snap.val() : {};
      if (currentRawOrders !== null) processOrders();
    });

    const unsubDeliveries = onValue(deliveriesRef, (snap) => {
      currentDeliveries = snap.exists() ? snap.val() : {};
      if (currentRawOrders !== null) processOrders();
    });

    const unsubEmployees = onValue(employeesRef, (snap) => {
      currentEmployees = snap.exists() ? snap.val() : {};
      if (currentRawOrders !== null) processOrders();
    });

    const unsubOrders = onValue(
      ordersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          currentRawOrders = snapshot.val();
          processOrders();
        } else {
          currentRawOrders = null;
          setOrders([]);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders.');
        setLoading(false);
      }
    );

    return () => {
      unsubBranches();
      unsubCustomers();
      unsubDeliveries();
      unsubEmployees();
      unsubOrders();
    };
  }, [user]);

  return { orders, loading, error };
}
