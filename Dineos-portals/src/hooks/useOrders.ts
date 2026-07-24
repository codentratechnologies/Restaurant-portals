import { useState, useEffect, useRef } from 'react';
import { ref, onValue, query, limitToLast, Unsubscribe } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface OrderItem {
  id: number | string;
  name: string;
  category: string;
  price: number;
  qty: number;
  subtotal: number;
  customizations?: unknown[];
}

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
  status: 'Delivered' | 'Cancelled' | 'Preparing' | 'Out for Delivery' | 'Pending' | 'Accepted' | string;
  type: 'Delivery' | 'Dine-in' | 'Takeaway' | string;
  created_at: string;
  updated_at: string;
  agent?: {
    name: string;
    phone: string;
  };
  items?: OrderItem[];
  timeline?: Array<{
    status: string;
    time: string;
    completed: boolean;
  }>;
  customer_review?: any;
}

export function useOrders(limitPerBranch = 200) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to hold current state data so listeners always access latest without causing dependency loops
  const branchesRefData = useRef<Record<string, any>>({});
  const customersRefData = useRef<Record<string, any>>({});
  const deliveriesRefData = useRef<Record<string, any>>({});
  const employeesRefData = useRef<Record<string, any>>({});
  const rawOrdersRefData = useRef<Record<string, Record<string, any>>>({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const branchesRefNode = ref(rtdb, `branch/${user.uid}`);
    const customersRefNode = ref(rtdb, `user_customer/${user.uid}`);
    const deliveriesRefNode = ref(rtdb, `delivery/${user.uid}`);
    const employeesRefNode = ref(rtdb, `employee/${user.uid}`);

    let orderListeners: Record<string, Unsubscribe> = {};

    const processOrders = () => {
      const currentRawOrders = rawOrdersRefData.current;
      const currentBranches = branchesRefData.current;
      const currentCustomers = customersRefData.current;
      const currentDeliveries = deliveriesRefData.current;
      const currentEmployees = employeesRefData.current;

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
                name: custData.fullName || custData.name || rawOrder.customer?.name || rawOrder.customerName || 'Unknown Customer',
                phone: custData.mobileNumber || custData.phone || rawOrder.customer?.phone || rawOrder.customerMobile || 'N/A',
                address: custData.address || rawOrder.deliveryAddress?.addressLine || rawOrder.deliveryAddress || ''
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

                if (currentDeliveries[branchId]) {
                  for (const boyId of Object.keys(currentDeliveries[branchId])) {
                    if (currentDeliveries[branchId][boyId] && currentDeliveries[branchId][boyId][orderKey]) {
                      foundBoyId = boyId;
                      break;
                    }
                  }
                }

                if (foundBoyId) {
                  let emp = null;
                  for (const bCode of Object.keys(currentEmployees)) {
                    if (currentEmployees[bCode] && currentEmployees[bCode][foundBoyId]) {
                      emp = currentEmployees[bCode][foundBoyId];
                      break;
                    }
                  }
                  if (emp) {
                    deliveryAgentObj = {
                      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown',
                      phone: emp.phone || emp.mobileNumber || 'N/A'
                    };
                  }
                }

                if (!deliveryAgentObj) {
                  const agentData = rawOrder.deliveryAgent || rawOrder.deliveryPartner || rawOrder.agent || rawOrder.deliveryBoy || rawOrder.assignedTo;
                  if (agentData) {
                    deliveryAgentObj = {
                      name: agentData.name || agentData.fullName || agentData.firstName || 'Unknown',
                      phone: agentData.phone || agentData.contact || agentData.mobileNumber || 'N/A'
                    };
                  }
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
              })),
              customer_review: rawOrder.customer_review
            };
            
            ordersList.push(mappedOrder);
          });
        }
      });
      
      ordersList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(ordersList);
      setLoading(false);
    };

    const unsubBranches = onValue(branchesRefNode, (snap) => {
      const branches = snap.exists() ? snap.val() : {};
      branchesRefData.current = branches;
      
      // Dynamic paginated listeners for each branch
      const activeBranchIds = Object.keys(branches);
      activeBranchIds.forEach(branchId => {
        if (!orderListeners[branchId]) {
          const branchOrdersRef = query(ref(rtdb, `order/${user.uid}/${branchId}`), limitToLast(limitPerBranch));
          orderListeners[branchId] = onValue(branchOrdersRef, (orderSnap) => {
            rawOrdersRefData.current[branchId] = orderSnap.exists() ? orderSnap.val() : {};
            processOrders();
          }, (err) => {
            console.error(`Error fetching orders for branch ${branchId}:`, err);
          });
        }
      });

      // Cleanup removed branches
      Object.keys(orderListeners).forEach(branchId => {
        if (!activeBranchIds.includes(branchId)) {
          orderListeners[branchId](); // Unsubscribe
          delete orderListeners[branchId];
          delete rawOrdersRefData.current[branchId];
        }
      });

      processOrders();
    });

    const unsubCustomers = onValue(customersRefNode, (snap) => {
      customersRefData.current = snap.exists() ? snap.val() : {};
      processOrders();
    });

    const unsubDeliveries = onValue(deliveriesRefNode, (snap) => {
      deliveriesRefData.current = snap.exists() ? snap.val() : {};
      processOrders();
    });

    const unsubEmployees = onValue(employeesRefNode, (snap) => {
      employeesRefData.current = snap.exists() ? snap.val() : {};
      processOrders();
    });

    return () => {
      unsubBranches();
      unsubCustomers();
      unsubDeliveries();
      unsubEmployees();
      Object.values(orderListeners).forEach(unsub => unsub());
    };
  }, [user, limitPerBranch]);

  return { orders, loading, error };
}

