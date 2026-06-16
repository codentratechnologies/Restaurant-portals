import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, FileX, CheckCircle2, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import Table, { Column } from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import OrderDrawer, { OrderData } from './components/OrderDrawer';

import { ref, onValue, set, get, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

const TABS = [
  { id: 'accept', label: 'Accepted Orders', statuses: ['Accepted', 'Preparing', 'Ready For Pickup', 'Out For Delivery', 'Arrived', 'Arrived Customer'] },
  { id: 'reject', label: 'Rejected', statuses: ['Rejected'] },
  { id: 'delivered', label: 'Delivered', statuses: ['Delivered'] },
  { id: 'cancel', label: 'Cancelled', statuses: ['Cancelled'] },
];

// ─── Status badge styles ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; dot?: boolean }> = {
    Accepted:          { cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    Preparing:         { cls: 'bg-amber-50 text-amber-700 border-amber-300', dot: true },
    'Ready For Pickup':{ cls: 'bg-green-50 text-green-700 border-green-200' },
    'Out For Delivery':{ cls: 'bg-purple-50 text-purple-700 border-purple-200' },
    Arrived:           { cls: 'bg-teal-50 text-teal-700 border-teal-200' },
    Rejected:          { cls: 'bg-red-50 text-red-700 border-red-200' },
    Cancelled:         { cls: 'bg-red-50 text-red-700 border-red-200' },
    Delivered:         { cls: 'bg-green-50 text-green-700 border-green-200' },
  };
  const { cls, dot } = cfg[status] ?? { cls: 'bg-gray-100 text-gray-600 border-gray-200' };

  return (
    <Badge variant="default" className={cls}>
      {dot && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
      )}
      {status}
    </Badge>
  );
}

// ─── Ready For Pickup Button Component ──────────────────────────────────────
function ReadyForPickupButton({ order, updatingIds, onReady }: { order: OrderData, updatingIds: Set<string>, onReady: (o: OrderData) => void }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!order.acceptedAt) return 0;
    // 5 minutes from acceptedAt
    const unlockTime = order.acceptedAt + 5 * 60 * 1000;
    return Math.max(0, unlockTime - Date.now());
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      const unlockTime = order.acceptedAt! + 5 * 60 * 1000;
      const remaining = Math.max(0, unlockTime - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, order.acceptedAt]);

  const isDisabled = timeLeft > 0 || updatingIds.has(order._key!);
  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const timeString = timeLeft > 0 ? `(${mins}:${secs.toString().padStart(2, '0')})` : '';

  return (
    <button
      disabled={isDisabled}
      onClick={() => onReady(order)}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-colors whitespace-nowrap shadow-sm ${
        isDisabled ? 'bg-gray-400 cursor-not-allowed opacity-80' : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
      }`}
    >
      <PackageCheck className="w-3.5 h-3.5" />
      Ready for Pickup {timeString}
    </button>
  );
}

export default function OrderTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'accept';

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('restaurant_user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [customersData, setCustomersData] = useState<any>({});
  const [branchPushId, setBranchPushId] = useState<string>('');

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
    const unsub = onValue(ref(rtdb, 'user_customer'), (snap) => {
      if (snap.exists()) setCustomersData(snap.val());
    });
    return () => unsub();
  }, []);

  // 3. Listen to orders for this branch
  useEffect(() => {
    if (!currentUser || !branchPushId) return;
    
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
    });
    return () => unsub();
  }, [currentUser, branchPushId]);

  // 4. Merge data
  useEffect(() => {
    const mergedOrders: OrderData[] = rawOrders.map(rawOrder => {
      const customer = customersData[rawOrder.customerId] || {};
        const itemsList = Array.isArray(rawOrder.items) 
          ? rawOrder.items 
          : rawOrder.items ? Object.values(rawOrder.items) : [];

        return {
          id: rawOrder.id || rawOrder._key,
          _key: rawOrder._key,
          _customerId: rawOrder.customerId,
          _branchId: branchPushId,
          status: rawOrder.status === 'Placed' ? 'Pending' : rawOrder.status,
          type: 'Delivery',
          customer: {
            name: customer.fullName || 'Customer',
            phone: customer.mobileNumber || '',
            address: rawOrder.deliveryAddress?.addressLine || ''
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
        rejectionNotes: rawOrder.rejectionNotes
      };
    });
    setOrders(mergedOrders);
  }, [rawOrders, customersData, branchPushId]);

  // ─── Auto-transition: Accepted → Preparing after 1 minute ────────────────
  useEffect(() => {
    const acceptedOrders = orders.filter(
      o => o.status === 'Accepted' && o.acceptedAt && o._customerId && o._key
    );
    if (acceptedOrders.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    acceptedOrders.forEach(order => {
      const elapsed = Date.now() - (order.acceptedAt!);
      const remaining = 60_000 - elapsed; // 1 minute

      if (remaining <= 0) {
        // Already past the 1-minute mark — transition immediately
        transitionToPreparing(order);
      } else {
        const t = setTimeout(() => transitionToPreparing(order), remaining);
        timers.push(t);
      }
    });

    return () => timers.forEach(t => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const transitionToPreparing = useCallback(async (order: OrderData) => {
    if (!currentUser || !order._branchId || !order._key) return;
    // Guard: only transition if still Accepted (Firebase may have already changed)
    try {
      await set(ref(rtdb, `order/${currentUser.adminId}/${order._branchId}/${order._key}/status`), 'Preparing');
      toast.success(`Order #${order.id} is now Preparing 🍳`, { icon: '⏱️' });
    } catch (e) {
      console.error('Auto-transition to Preparing failed', e);
    }
  }, [currentUser]);

  // ─── Ready for Pickup handler ─────────────────────────────────────────────
  const handleReadyForPickup = useCallback(async (order: OrderData) => {
    if (!currentUser || !order._branchId || !order._key) return;
    setUpdatingIds(prev => new Set(prev).add(order._key!));
    try {
      await set(ref(rtdb, `order/${currentUser.adminId}/${order._branchId}/${order._key}/status`), 'Ready For Pickup');
      toast.success(`Order #${order.id} is Ready for Pickup! 🎉`);
    } catch (e) {
      toast.error('Failed to update order status.');
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(order._key!);
        return next;
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
    setCurrentPage(1);
  };

  const filteredOrders = useMemo(() => {
    const activeTabDef = TABS.find(t => t.id === currentTab) || TABS[0];
    return orders.filter(order => {
      const matchStatus = activeTabDef.statuses.includes(order.status);
      const matchSearch = order.id.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchPayment = paymentFilter === 'All' || order.payment.method === paymentFilter;
      return matchStatus && matchSearch && matchPayment;
    });
  }, [orders, currentTab, debouncedSearch, paymentFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const handleExportCSV = () => {
    toast.success('CSV Export initiated. It will download shortly.');
  };

  const openOrderDrawer = (order: OrderData) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  // ─── Columns ──────────────────────────────────────────────────────────────
  const getColumns = (): Column<OrderData>[] => {
    const baseColumns: Column<OrderData>[] = [
      {
        header: 'Order ID',
        cell: (item) => (
          <span
            onClick={() => openOrderDrawer(item)}
            className="font-mono text-sm font-black text-brand-orange-600 hover:text-brand-orange-700 cursor-pointer transition-colors"
          >
            {item.id}
          </span>
        )
      },
      {
        header: 'Items',
        cell: (item) => (
          <span className="text-sm font-medium text-text-secondary truncate block max-w-[200px]">
            {item.items.map(i => i.name).join(', ')}
          </span>
        )
      },
      {
        header: 'Total Value',
        cell: (item) => <span className="font-black text-brand-navy">₹{item.billing.total.toFixed(2)}</span>
      },
      {
        header: 'Status',
        cell: (item) => <StatusBadge status={item.status} />
      }
    ];

    if (currentTab === 'accept') {
      baseColumns.splice(3, 0, {
        header: 'Payment Mode',
        cell: (item) => <span className="text-sm font-bold text-text-secondary">{item.payment.method}</span>
      });
    }

    if (currentTab === 'reject') {
      baseColumns.splice(3, 0, {
        header: 'Rejection Reason',
        cell: (item) => <span className="text-sm font-bold text-red-600">{item.rejectionReason}</span>
      });
      baseColumns.push({
        header: 'Refund Status',
        cell: (item) => (
          <Badge variant="default" className={item.payment.status === 'Refunded' ? 'text-green-600 border-green-200 bg-green-50' : 'text-amber-600 border-amber-200 bg-amber-50'}>
            {item.payment.status === 'Refunded' ? 'Refunded' : 'Refund Pending'}
          </Badge>
        )
      });
    }

    if (currentTab === 'cancel') {
      baseColumns.splice(3, 0, {
        header: 'Cancel Reason',
        cell: (item) => <span className="text-sm font-bold text-red-600">{item.cancellationReason}</span>
      });
    }

    // ─── Action Column ───────────────────────────────────────────────────────
    baseColumns.push({
      header: 'Action',
      cell: (item) => (
        <div className="flex items-center gap-2">
          {/* Ready for Pickup — only for Preparing orders */}
          {item.status === 'Preparing' && (
            <ReadyForPickupButton 
              order={item} 
              updatingIds={updatingIds} 
              onReady={handleReadyForPickup} 
            />
          )}

          {/* View button — always visible */}
          <button
            onClick={() => openOrderDrawer(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-navy bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> View
          </button>
        </div>
      ),
    });

    return baseColumns;
  };

  return (
    <div className="space-y-6 pb-16 max-w-[1400px] mx-auto">

      <OrderDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        order={selectedOrder}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">Order Ledger</h1>
          <p className="text-text-secondary mt-1 text-sm font-medium">Enterprise order history, reporting, and fulfillment tracking.</p>
        </div>
      </div>

      <div className="bg-white border border-border/50 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">

        {/* Persistent Ledger Header */}
        <div className="p-5 border-b border-border bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full sm:max-w-xs group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
              <input
                type="text"
                placeholder="Search Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 transition-all shadow-sm"
              />
            </div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full sm:w-48 appearance-none bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 cursor-pointer shadow-sm transition-all"
            >
              <option value="All">All Payment Modes</option>
              <option value="Online">Online / Prepaid</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>

          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="w-full md:w-auto bg-white font-bold text-brand-navy hover:bg-gray-50 hover:text-brand-orange-600 border-gray-300 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-6 border-b border-border overflow-x-auto no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative py-4 text-sm font-bold whitespace-nowrap transition-colors ${
                currentTab === tab.id ? 'text-brand-navy' : 'text-text-secondary hover:text-brand-navy'
              }`}
            >
              {tab.label}
              {currentTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange-600"
                />
              )}
            </button>
          ))}
        </div>

        {/* Ledger Data Table */}
        <div className="min-h-[500px] flex flex-col bg-white">
          <AnimatePresence mode="wait">
            {filteredOrders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 px-4 text-center flex-1"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-border/50 shadow-inner">
                  <FileX className="w-8 h-8 text-text-secondary opacity-50" />
                </div>
                <h3 className="text-xl font-black text-brand-navy mb-1">No Orders Found</h3>
                <p className="text-sm font-medium text-text-secondary mb-6 max-w-sm">
                  We couldn't find any orders matching your criteria in the <strong className="text-brand-navy">{TABS.find(t => t.id === currentTab)?.label}</strong> ledger.
                </p>
                {(searchQuery || paymentFilter !== 'All') && (
                  <button
                    onClick={() => { setSearchQuery(''); setPaymentFilter('All'); }}
                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-brand-navy font-bold rounded-xl transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                <Table
                  columns={getColumns()}
                  data={paginatedOrders}
                  currentPage={currentPage}
                  totalPages={Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage))}
                  onPageChange={setCurrentPage}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
