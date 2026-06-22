import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Filter, MessageSquareText, StarHalf } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

import Table, { Column } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

import ReviewDrawer, { ReviewData } from './components/ReviewDrawer';
import { OrderData } from '../../hooks/useRestaurantOrders';

export default function ReviewsDashboard() {
 const navigate = useNavigate();
 const [reviews, setReviews] = useState<ReviewData[]>([]);
 const [allOrdersMap, setAllOrdersMap] = useState<Record<string, OrderData>>({});
 const [currentUser, setCurrentUser] = useState<any>(null);
 
 const [rawOrders, setRawOrders] = useState<any[]>([]);
 const [customersData, setCustomersData] = useState<any>({});
 const [branchPushId, setBranchPushId] = useState<string>('');

 const [selectedRating, setSelectedRating] = useState<number | 'All'>('All');
 const [sortOrder, setSortOrder] = useState<'Newest' | 'Oldest'>('Newest');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

 // Drawer States
 const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
 const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);

 useEffect(() => {
 const userStr = localStorage.getItem('restaurant_user');
 if (userStr) {
 setCurrentUser(JSON.parse(userStr));
 }
 }, []);

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

 // 2. Fetch Orders and Reviews
 useEffect(() => {
 if (!currentUser || !branchPushId) return;
 
 const ordersRef = ref(rtdb, `order/${currentUser.adminId}/${branchPushId}`);
 const unsub = onValue(ordersRef, async (snapshot) => {
 if (snapshot.exists()) {
 const data = snapshot.val();
 const loadedReviews: ReviewData[] = [];
 const ordersMap: Record<string, OrderData> = {};
 
 const orderIds = Object.keys(data);
 
 // We'll map everything, then wait for all customer names to load
 const reviewPromises = orderIds.map(async (orderId) => {
 const rawOrder = data[orderId];
 const customerId = rawOrder.customerId || '';
 
 let customerName = rawOrder.customer?.name || rawOrder.customerName || rawOrder.deliveryAddress?.name || 'Customer';
 
 // Asynchronously fetch from user_customer if customerId exists
 if (customerId) {
 try {
 const { get } = await import('firebase/database');
 const custSnap = await get(ref(rtdb, `user_customer/${currentUser.adminId}/${customerId}`));
 if (custSnap.exists()) {
 const c = custSnap.val();
 customerName = c.fullName || c.name || (c.firstName ? `${c.firstName} ${c.lastName || ''}`.trim() : null) || customerName;
 }
 } catch (e) {
 console.error("Failed to fetch customer", e);
 }
 }
 
 const itemsList = Array.isArray(rawOrder.items) 
 ? rawOrder.items 
 : rawOrder.items ? Object.values(rawOrder.items) : [];

 // Map OrderData
 const mappedOrder: OrderData = {
 id: rawOrder.id || orderId,
 _key: orderId,
 _customerId: customerId,
 status: rawOrder.status === 'Placed' ? 'Pending' : (rawOrder.status || 'Pending'),
 type: 'Delivery',
 customer: { 
 name: customerName, 
 phone: rawOrder.customer?.phone || rawOrder.deliveryAddress?.phone || '',
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
 
 ordersMap[mappedOrder.id] = mappedOrder;

 // Extract review from customer_review
 if (rawOrder.customer_review) {
 loadedReviews.push({
 id: rawOrder.customer_review.id || `REV-${mappedOrder.id}`,
 rating: rawOrder.customer_review.rating || 5,
 date: rawOrder.customer_review.date || new Date(mappedOrder.created_at || Date.now()).toISOString().replace('T', ' ').slice(0, 16),
 customerName: customerName,
 isAnonymous: rawOrder.customer_review.isAnonymous || false,
 comment: rawOrder.customer_review.comment || '',
 orderId: mappedOrder.id,
 orderedItems: mappedOrder.items.map((i: any) => ({ name: i.name, price: i.price }))
 });
 }
 });
 
 await Promise.all(reviewPromises);
 
 loadedReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
 setReviews(loadedReviews);
 setAllOrdersMap(ordersMap);
 } else {
 setReviews([]);
 setAllOrdersMap({});
 }
 });
 return () => unsub();
 }, [currentUser, branchPushId]);



 // --- Analytics Calculations ---
 const { averageRating, distribution, totalReviews } = useMemo(() => {
 const total = reviews.length;
 if (total === 0) return { averageRating: 0, distribution: [0,0,0,0,0], totalReviews: 0 };
 
 const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
 const dist = [0, 0, 0, 0, 0]; // 1-star to 5-star
 reviews.forEach(rev => dist[rev.rating - 1]++);
 
 return {
 averageRating: sum / total,
 distribution: dist,
 totalReviews: total
 };
 }, [reviews]);

 // --- Filtering & Sorting ---
 const filteredReviews = useMemo(() => {
 let result = reviews;
 if (selectedRating !== 'All') {
 result = result.filter(r => r.rating === selectedRating);
 }
 result.sort((a, b) => {
 const dateA = new Date(a.date).getTime();
 const dateB = new Date(b.date).getTime();
 return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
 });
 return result;
 }, [reviews, selectedRating, sortOrder]);

 const paginatedReviews = useMemo(() => {
 const start = (currentPage - 1) * itemsPerPage;
 return filteredReviews.slice(start, start + itemsPerPage);
 }, [filteredReviews, currentPage]);

 // --- Handlers ---
 const handleOpenReview = (review: ReviewData) => {
 setSelectedReview(review);
 setReviewDrawerOpen(true);
 };

 const handleOpenLinkedOrder = (orderId: string) => {
 navigate(`/orders/${orderId}`);
 };

 // --- Rendering Helpers ---
 const renderStars = (rating: number) => {
 return (
 <div className="flex gap-0.5">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star key={star} className={`w-3.5 h-3.5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} />
 ))}
 </div>
 );
 };

 const columns: Column<ReviewData>[] = [
 {
 header: 'Rating',
 cell: (item) => (
 <div className="flex flex-col gap-1">
 {renderStars(item.rating)}
 <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{item.rating}.0 Score</span>
 </div>
 )
 },
 {
 header: 'Date',
 cell: (item) => <span className="text-sm font-bold text-brand-navy">{item.date}</span>
 },
 {
 header: 'Customer',
 cell: (item) => (
 <span className={`text-sm font-bold ${item.isAnonymous ? 'text-text-secondary italic' : 'text-brand-navy'}`}>
 {item.isAnonymous ?"Anonymous Customer" : item.customerName}
 </span>
 )
 },
 {
 header: 'Comment',
 cell: (item) => (
 <div className="max-w-[300px]">
 {item.isFlagged ? (
 <Badge variant="destructive" className="mb-1 text-[10px] py-0 px-1.5 h-4">Flagged</Badge>
 ) : null}
 <p className="text-sm font-medium text-text-secondary truncate">
 {item.comment ? `"${item.comment}"` : <span className="italic">No comment</span>}
 </p>
 </div>
 )
 },
 {
 header: 'Order Ref',
 cell: (item) => (
 <button 
 onClick={(e) => { e.stopPropagation(); handleOpenLinkedOrder(item.orderId); }}
 className="text-sm font-black text-brand-orange-600 hover:text-brand-orange-700 hover:underline underline-offset-4"
 >
 {item.orderId}
 </button>
 )
 },
 {
 header: 'Action',
 cell: (item) => (
 <Button 
 variant="secondary" 
 size="sm"
 className="bg-white border border-gray-200 text-brand-navy hover:bg-gray-50 shadow-sm"
 onClick={() => handleOpenReview(item)}
 >
 View
 </Button>
 )
 }
 ];

 return (
 <div className="space-y-8 max-w-[1400px] mx-auto">
 
 {/* Drawers */}
 <ReviewDrawer 
 isOpen={reviewDrawerOpen} 
 onClose={() => setReviewDrawerOpen(false)} 
 review={selectedReview} 
 onOpenOrder={handleOpenLinkedOrder}
 />

 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div>
 <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">Reviews & Ratings</h1>
 <p className="text-text-secondary mt-1 text-sm font-medium">Monitor customer sentiment and operational feedback in real-time.</p>
 </div>
 </div>

 {/* Analytics Section */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Total Score Card */}
 <div className="bg-white border border-border/50 rounded-3xl p-8 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
 <div className="absolute top-0 right-0 p-6 opacity-10">
 <StarHalf className="w-32 h-32 text-brand-orange-600" />
 </div>
 <h3 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-4">Average Rating</h3>
 <div className="flex items-end justify-center gap-2 text-brand-navy mb-4">
 <span className="text-6xl font-black tracking-tighter">{averageRating.toFixed(1)}</span>
 <span className="text-2xl font-bold text-text-secondary pb-1.5">/ 5.0</span>
 </div>
 {renderStars(Math.round(averageRating))}
 <p className="mt-4 text-sm font-bold text-text-secondary bg-gray-50 px-4 py-1.5 rounded-full border border-border/50">
 Based on {totalReviews} reviews
 </p>
 </div>

 {/* Rating Distribution */}
 <div className="lg:col-span-2 bg-white border border-border/50 rounded-3xl p-8 shadow-sm">
 <h3 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-6">Rating Distribution</h3>
 <div className="space-y-3">
 {[5, 4, 3, 2, 1].map(stars => {
 const count = distribution[stars - 1];
 const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
 return (
 <div key={stars} className="flex items-center gap-4 group">
 <div className="flex items-center gap-1 w-20 shrink-0">
 <span className="text-sm font-black text-brand-navy">{stars}</span>
 <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
 </div>
 <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${percentage}%` }}
 transition={{ duration: 1, type:"spring", bounce: 0 }}
 className={`absolute top-0 left-0 bottom-0 rounded-full ${
 stars >= 4 ? 'bg-green-500' : stars === 3 ? 'bg-amber-400' : 'bg-red-500'
 }`}
 />
 </div>
 <div className="w-12 text-right">
 <span className="text-sm font-bold text-text-secondary group-hover:text-brand-navy transition-colors">{count}</span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>

 {/* Reviews Management Area */}
 <div className="bg-white border border-border/50 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
 
 {/* Sticky Filter Toolbar */}
 <div className="p-5 border-b border-border bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-10">
 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
 <select 
 value={selectedRating}
 onChange={(e) => setSelectedRating(e.target.value === 'All' ? 'All' : Number(e.target.value))}
 className="w-full sm:w-48 appearance-none bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 cursor-pointer shadow-sm transition-all"
 >
 <option value="All">All Ratings</option>
 <option value="5">5 Stars</option>
 <option value="4">4 Stars</option>
 <option value="3">3 Stars</option>
 <option value="2">2 Stars</option>
 <option value="1">1 Star</option>
 </select>
 
 <select 
 value={sortOrder}
 onChange={(e) => setSortOrder(e.target.value as 'Newest' | 'Oldest')}
 className="w-full sm:w-48 appearance-none bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 cursor-pointer shadow-sm transition-all"
 >
 <option value="Newest">Newest First</option>
 <option value="Oldest">Oldest First</option>
 </select>
 </div>
 
 <div className="flex items-center gap-2 text-sm font-bold text-text-secondary px-2">
 <MessageSquareText className="w-4 h-4" />
 Showing {filteredReviews.length} Reviews
 </div>
 </div>

 {/* Reviews Table */}
 <div className="min-h-[400px] flex flex-col bg-white">
 <AnimatePresence mode="wait">
 {filteredReviews.length === 0 ? (
 <motion.div
 key="empty"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="flex flex-col items-center justify-center py-24 px-4 text-center flex-1"
 >
 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-border/50 shadow-inner">
 <Filter className="w-8 h-8 text-text-secondary opacity-50" />
 </div>
 <h3 className="text-xl font-black text-brand-navy mb-1">No Reviews Found</h3>
 <p className="text-sm font-medium text-text-secondary max-w-sm">
 We couldn't find any reviews matching your current filter criteria or in the database.
 </p>
 {(selectedRating !== 'All' || sortOrder !== 'Newest') && (
 <Button 
 variant="outline"
 className="mt-6 bg-white font-bold"
 onClick={() => { setSelectedRating('All'); setSortOrder('Newest'); }}
 >
 Clear Filters
 </Button>
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
 columns={columns}
 data={paginatedReviews}
 currentPage={currentPage}
 totalPages={Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage))}
 onPageChange={setCurrentPage}
 onRowClick={handleOpenReview}
 />
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </div>
 </div>
 );
}
