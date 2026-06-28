import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X, AlertCircle, Volume2, VolumeX, Wifi, WifiOff, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import RejectionModal from './components/RejectionModal';
import { ref, onValue, set, push } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { OrderData } from '../../hooks/useRestaurantOrders';
import { get, query, orderByChild, equalTo } from 'firebase/database';

export default function OrderCalendar() {
 const [orders, setOrders] = useState<OrderData[]>([]);
 const [isOnline, setIsOnline] = useState(true);
 const [branchDetails, setBranchDetails] = useState<any>(null);
 const [isWithinWorkingHours, setIsWithinWorkingHours] = useState(true);
 const [soundEnabled, setSoundEnabled] = useState(() => {
 return localStorage.getItem('order_sound_enabled') === 'true';
 });
 const audioCtxRef = useRef<AudioContext | null>(null);

 const [currentUser, setCurrentUser] = useState<any>(null);

 // Modal State
 const [rejectModalOpen, setRejectModalOpen] = useState(false);
 const [orderToReject, setOrderToReject] = useState<OrderData | null>(null);

 // Sound generator
 const playBeep = useCallback(() => {
 if (!soundEnabled) return;
 try {
 if (!audioCtxRef.current) {
 audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
 }
 const ctx = audioCtxRef.current;
 if (ctx.state === 'suspended') ctx.resume();
 
 const osc = ctx.createOscillator();
 const gainNode = ctx.createGain();
 
 osc.type = 'sine';
 osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
 osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
 
 gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
 gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
 
 osc.connect(gainNode);
 gainNode.connect(ctx.destination);
 
 osc.start();
 osc.stop(ctx.currentTime + 0.3);
 } catch (e) {
 console.error("Audio play failed", e);
 }
 }, [soundEnabled]);

 const enableSound = () => {
 setSoundEnabled(true);
 localStorage.setItem('order_sound_enabled', 'true');
 // Initialize audio context on user interaction
 if (!audioCtxRef.current) {
 audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
 }
 audioCtxRef.current.resume();
 toast.success("Sound notifications enabled");
 };

 useEffect(() => {
 const userStr = localStorage.getItem('restaurant_user');
 if (userStr) {
 setCurrentUser(JSON.parse(userStr));
 }

 const unlockAudio = () => {
 if (localStorage.getItem('order_sound_enabled') === 'true') {
 if (!audioCtxRef.current) {
 audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
 }
 if (audioCtxRef.current.state === 'suspended') {
 audioCtxRef.current.resume();
 }
 }
 document.removeEventListener('click', unlockAudio);
 };
 document.addEventListener('click', unlockAudio);
 
 return () => {
 document.removeEventListener('click', unlockAudio);
 };
 }, []);

 const [rawOrders, setRawOrders] = useState<any[]>([]);
 const [customersData, setCustomersData] = useState<any>({});
 const [branchPushId, setBranchPushId] = useState<string>('');

 // 1. Fetch branch push ID & sync status
 useEffect(() => {
   if (!currentUser) return;
   
   const unsub = onValue(ref(rtdb, `branch/${currentUser.adminId}`), (branchSnap) => {
     if (branchSnap.exists()) {
       const branches = branchSnap.val();
       const matchedPushId = Object.keys(branches).find(key => 
         branches[key].code?.toLowerCase() === currentUser.branch?.toLowerCase()
       );
       const bId = matchedPushId || currentUser.branch;
       setBranchPushId(bId);
       
       const bDetails = branches[bId];
       if (bDetails) {
         setBranchDetails(bDetails);
         setIsOnline(bDetails.is_active ?? true);
       }
     } else {
       setBranchPushId(currentUser.branch);
     }
   });

   return () => unsub();
 }, [currentUser]);

 // Auto-close interval based on branch time
 useEffect(() => {
   if (!branchDetails?.closeTime || !branchDetails?.openTime || !currentUser || !branchPushId) return;

   const checkTime = () => {
     const now = new Date();
     const currentHour = now.getHours();
     const currentMin = now.getMinutes();
     const currentTime = currentHour * 60 + currentMin;

     const [openH, openM] = branchDetails.openTime.split(':').map(Number);
     const [closeH, closeM] = branchDetails.closeTime.split(':').map(Number);
     
     const openTimeMins = openH * 60 + openM;
     const closeTimeMins = closeH * 60 + closeM;

     let isOpen = false;
     if (closeTimeMins < openTimeMins) {
       if (currentTime >= openTimeMins || currentTime < closeTimeMins) isOpen = true;
     } else {
       if (currentTime >= openTimeMins && currentTime < closeTimeMins) isOpen = true;
     }

     setIsWithinWorkingHours(isOpen);
   };

   checkTime();
   const interval = setInterval(checkTime, 60000);
   return () => clearInterval(interval);
 }, [branchDetails, currentUser, branchPushId]);

 // FORCE DB UPDATE TO TRUE
 useEffect(() => {
    if (currentUser?.adminId && branchPushId && branchDetails?.is_active === false) {
      set(ref(rtdb, `branch/${currentUser.adminId}/${branchPushId}/is_active`), true)
        .then(() => toast.success("Branch force-activated in database!"))
        .catch(console.error);
    }
  }, [currentUser, branchPushId, branchDetails]);

 const handleToggleOnline = async () => {
   if (!branchPushId || !currentUser || !branchDetails) return;
   const newState = !(branchDetails.is_active ?? true);
   
   try {
     await set(ref(rtdb, `branch/${currentUser.adminId}/${branchPushId}/is_active`), newState);
     toast.success(`Branch is now ${newState ? 'ACTIVE' : 'PAUSED'}`);
   } catch (e) {
     toast.error("Failed to update status");
   }
 };

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
 const pending: any[] = [];
 
 Object.keys(data).forEach(orderId => {
 const rawOrder = data[orderId];
 if (rawOrder.status === 'Placed' || rawOrder.status === 'Pending') {
 pending.push({ ...rawOrder, _key: orderId });
 }
 });
 
 pending.sort((a, b) => (a.orderDate ? new Date(a.orderDate).getTime() : 0) - (b.orderDate ? new Date(b.orderDate).getTime() : 0));
 
 setRawOrders(prev => {
 if (pending.length > prev.length) playBeep();
 return pending;
 });
 } else {
 setRawOrders([]);
 }
 });
 
 return () => unsub();
 }, [currentUser, branchPushId, playBeep]);

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
 status: 'Pending',
 type: 'Delivery',
 customer: { 
 name: customer.fullName || 'Customer', 
 phone: customer.mobileNumber || '',
 address: rawOrder.deliveryAddress?.addressLine || '' 
 },
 items: itemsList.map((i:any) => ({
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
 status: 'Paid'
 },
 created_at: rawOrder.orderDate ? new Date(rawOrder.orderDate).getTime() : Date.now()
 };
 });
 setOrders(mergedOrders);
 }, [rawOrders, customersData, branchPushId]);

 const handleAccept = async (order: OrderData) => {
 if (!isOnline || !isWithinWorkingHours) {
 toast.error("Branch is currently offline or closed. Order actions unavailable.");
 return;
 }
 if (!currentUser || !order._customerId || !order._key) return;
 
 try {
 await set(ref(rtdb, `order/${currentUser.adminId}/${order._branchId}/${order._key}/status`), 'Accepted');
 await set(ref(rtdb, `order/${currentUser.adminId}/${order._branchId}/${order._key}/acceptedAt`), Date.now());
 toast.success(`Order #${order.id} accepted successfully.`);
 } catch (e) {
 toast.error("Failed to accept order.");
 }
 };

 const handleRejectClick = (order: OrderData) => {
 if (!isOnline || !isWithinWorkingHours) {
 toast.error("Branch is currently offline or closed. Order actions unavailable.");
 return;
 }
 setOrderToReject(order);
 setRejectModalOpen(true);
 };

 const handleConfirmReject = async (reason: string, notes: string) => {
 if (!orderToReject || !currentUser || !orderToReject._customerId || !orderToReject._key) return;
 
 try {
 await set(ref(rtdb, `order/${currentUser.adminId}/${orderToReject._branchId}/${orderToReject._key}/status`), 'Rejected');
 await set(ref(rtdb, `order/${currentUser.adminId}/${orderToReject._branchId}/${orderToReject._key}/rejectionReason`), reason);
 await set(ref(rtdb, `order/${currentUser.adminId}/${orderToReject._branchId}/${orderToReject._key}/rejectionNotes`), notes);
 
 setRejectModalOpen(false);
 setOrderToReject(null);
 toast.success("Order rejected successfully.");
 } catch (e) {
 toast.error("Failed to reject order.");
 }
 };

 const handleAutoReject = useCallback(async (order: OrderData) => {
 if (!currentUser || !order._branchId || !order._key) return;
 try {
 await set(ref(rtdb, `order/${currentUser.adminId}/${order._branchId}/${order._key}/status`), 'Rejected');
 await set(ref(rtdb, `order/${currentUser.adminId}/${order._branchId}/${order._key}/rejectionReason`), 'Auto-rejected due to 5-minute timeout');
 toast.error(`Order #${order.id} was auto-rejected due to timeout.`, { icon: '⏰' });
 } catch (e) {
 console.error(e);
 }
 }, [currentUser]);

 return (
 <div className="space-y-6 max-w-[1400px] mx-auto">
 
 {/* Modals */}
 {orderToReject && (
 <RejectionModal 
 isOpen={rejectModalOpen}
 onClose={() => setRejectModalOpen(false)}
 onConfirm={handleConfirmReject}
 orderId={orderToReject.id}
 paymentMethod={orderToReject.payment.method}
 />
 )}

 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div>
 <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">Live Pending Orders Queue</h1>
 <p className="text-text-secondary mt-1 text-sm font-medium">Manage incoming customer orders. Goal: Accept within 2 minutes.</p>
 </div>

 <div className="flex items-center gap-4">
 {!soundEnabled && (
 <button 
 onClick={enableSound}
 className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold shadow-sm hover:bg-amber-100 transition-colors"
 >
 <VolumeX className="w-4 h-4" />
 Enable Sound
 </button>
 )}
 
  <button
 onClick={handleToggleOnline}
 className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold shadow-sm transition-colors ${
 isOnline && isWithinWorkingHours ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
 }`}
 >
 {isOnline && isWithinWorkingHours ? (
 <>
 <div className="relative flex h-3 w-3">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
 </div>
 <Wifi className="w-4 h-4" /> ONLINE
 </>
 ) : (
 <>
 <div className="relative flex h-3 w-3">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
 </div>
 <WifiOff className="w-4 h-4" /> {!isWithinWorkingHours ? 'CLOSED NOW' : 'PAUSED'}
 </>
 )}
 </button>
 </div>
 </div>

 {(!isOnline || !isWithinWorkingHours) && (
 <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-center gap-2">
 <AlertCircle className="w-5 h-5 text-red-600" />
 <p className="text-red-900 font-bold text-sm">
    {!isWithinWorkingHours 
      ? 'Branch is currently outside working hours. Actions are disabled.' 
      : 'Branch is paused by admin. Actions are disabled.'}
  </p>
 </div>
 )}

 {/* Orders Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
 <AnimatePresence>
 {orders.length === 0 ? (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white border border-border/50 rounded-[2rem] shadow-sm"
 >
 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
 <Check className="w-8 h-8 text-green-500 opacity-80" />
 </div>
 <h3 className="text-xl font-black text-brand-navy mb-1">Queue is Empty</h3>
 <p className="text-sm font-medium text-text-secondary max-w-sm">
 You're all caught up! New incoming orders will appear here automatically.
 </p>
 </motion.div>
 ) : (
 orders.map(order => (
 <OrderCard 
 key={order._key} 
 order={order} 
 onAccept={() => handleAccept(order)}
 onReject={() => handleRejectClick(order)}
 onAutoReject={() => handleAutoReject(order)}
 disabled={!isOnline || !isWithinWorkingHours}
 />
 ))
 )}
 </AnimatePresence>
 </div>

 </div>
 );
}

// Order Card Component with Timer
function OrderCard({ order, onAccept, onReject, onAutoReject, disabled }: { order: OrderData, onAccept: () => void, onReject: () => void, onAutoReject: () => void, disabled: boolean }) {
 const [timeLeft, setTimeLeft] = useState(300); // 5 mins in seconds

 useEffect(() => {
 if (!order.created_at) return;
 let didAutoReject = false;
 
 const calculateTime = () => {
 const diff = Math.floor((order.created_at! + 300000 - Date.now()) / 1000);
 if (diff <= 0) {
 setTimeLeft(0);
 if (!didAutoReject) {
 didAutoReject = true;
 onAutoReject();
 }
 } else {
 setTimeLeft(diff);
 }
 };
 calculateTime();
 const interval = setInterval(calculateTime, 1000);
 return () => clearInterval(interval);
 }, [order.created_at, onAutoReject]);

 const mins = Math.floor(timeLeft / 60);
 const secs = timeLeft % 60;
 
 const timerClass = 
 timeLeft <= 30 ? 'bg-red-100 text-red-700 animate-pulse border-red-200' :
 timeLeft <= 60 ? 'bg-amber-100 text-amber-700 animate-pulse border-amber-200' :
 'bg-gray-100 text-brand-navy border-gray-200';

 const itemsSummary = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');

 return (
 <motion.div
 layout
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
 className="bg-white border border-border/50 rounded-2xl shadow-lg overflow-hidden flex flex-col"
 >
 <div className="p-5 border-b border-border bg-gray-50/50 flex items-center justify-between">
 <div>
 <h3 className="text-lg font-black text-brand-navy">{order.id}</h3>
 <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-orange-100 text-brand-orange-700">
 Pending
 </span>
 </div>
 <div className={`px-3 py-1.5 rounded-lg border font-mono text-lg font-black flex items-center gap-1.5 shadow-inner ${timerClass}`}>
 <Clock className="w-4 h-4" />
 {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
 </div>
 </div>

 <div className="p-5 flex-1 space-y-4">
 <div>
 <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Customer</p>
 <p className="text-sm font-bold text-brand-navy">{order.customer.name}</p>
 </div>

 <div>
 <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Items</p>
 <p className="text-sm font-medium text-brand-navy leading-relaxed">{itemsSummary}</p>
 </div>

 <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
 <div>
 <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-0.5">Payment</p>
 <p className="text-sm font-black text-brand-navy">{order.payment.method}</p>
 </div>
 <div>
 <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-0.5">Bill Total</p>
 <p className="text-sm font-black text-brand-orange-600">₹{order.billing.total.toFixed(2)}</p>
 </div>
 </div>
 </div>

 <div className="p-4 bg-gray-50 border-t border-border flex gap-3">
 <Button 
 variant="secondary" 
 onClick={onReject}
 disabled={disabled}
 className="flex-1 bg-white border border-gray-300 text-brand-navy hover:bg-gray-100 hover:text-red-600 font-bold shadow-sm"
 >
 <X className="w-4 h-4 mr-1.5" /> Reject
 </Button>
 <Button 
 onClick={onAccept}
 disabled={disabled}
 className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-600/20"
 >
 <Check className="w-4 h-4 mr-1.5" /> Accept
 </Button>
 </div>
 </motion.div>
 );
}
