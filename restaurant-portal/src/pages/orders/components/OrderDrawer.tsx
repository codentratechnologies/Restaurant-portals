import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Phone, CreditCard, CheckCircle2, AlertCircle, Motorbike, Map } from 'lucide-react';

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
 }[];
 billing: {
 subtotal: number;
 tax: number;
 total: number;
 };
 payment: {
 method: 'Online' | 'COD';
 status: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
 };
 deliveryAgent?: {
 name: string;
 contact: string;
 };
 rejectionReason?: string;
 rejectionNotes?: string;
 cancellationReason?: string;
 created_at?: number;
 acceptedAt?: number;
 _key?: string;
 _customerId?: string;
}

interface OrderDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 order: OrderData | null;
}

export default function OrderDrawer({ isOpen, onClose, order }: OrderDrawerProps) {
 if (!order) return null;

 const isTerminal = ['Cancelled', 'Rejected', 'Delivered'].includes(order.status);
 const showAddress = order.type === 'Delivery' && order.customer.address;

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 z-40 bg-brand-navy/30 backdrop-blur-sm"
 />
 <motion.div
 initial={{ x: '100%' }}
 animate={{ x: 0 }}
 exit={{ x: '100%' }}
 transition={{ type:"spring", stiffness: 300, damping: 30 }}
 className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-border flex flex-col"
 >
 {/* Header */}
 <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
 <div>
 <h2 className="text-xl font-black text-brand-navy">Order #{order.id}</h2>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{order.type}</span>
 <span className="w-1 h-1 rounded-full bg-border" />
 <span className={`text-xs font-bold uppercase tracking-wider ${
 isTerminal ? 'text-red-600' : 'text-brand-orange-600'
 }`}>
 {order.status}
 </span>
 </div>
 </div>
 <button onClick={onClose} className="p-2 text-text-secondary hover:bg-gray-100 rounded-full transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
 
 {/* Warnings / Rejection Reasons */}
 {(order.rejectionReason || order.cancellationReason) && (
 <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-2">
 <div className="flex items-center gap-2 text-red-700 font-bold text-sm uppercase tracking-wider">
 <AlertCircle className="w-4 h-4" />
 {order.status === 'Rejected' ? 'Restaurant Rejection' : 'Customer Cancellation'}
 </div>
 <p className="text-sm font-medium text-red-900">
 <strong className="font-bold">Reason:</strong> {order.rejectionReason || order.cancellationReason}
 </p>
 {order.rejectionNotes && (
 <p className="text-sm font-medium text-red-900 mt-1">
 <strong className="font-bold">Notes:</strong> {order.rejectionNotes}
 </p>
 )}
 </div>
 )}

 {/* Customer Details */}
 <section>
 <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-4">Customer Details</h3>
 <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
 <User className="w-5 h-5 text-text-secondary" />
 </div>
 <div>
 <p className="text-sm font-bold text-brand-navy">{order.customer.name}</p>
 <p className="text-xs font-medium text-text-secondary flex items-center gap-1 mt-0.5">
 <Phone className="w-3 h-3" /> {order.customer.phone}
 </p>
 </div>
 </div>
 {showAddress && (
 <div className="pt-3 border-t border-border flex items-start gap-2">
 <MapPin className="w-4 h-4 text-brand-orange-500 shrink-0 mt-0.5" />
 <p className="text-sm font-medium text-text-secondary leading-relaxed">{order.customer.address}</p>
 </div>
 )}
 </div>
 </section>

 {/* Order Items */}
 <section>
 <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-4">Order Items</h3>
 <div className="bg-white border border-border/50 rounded-2xl overflow-hidden shadow-sm">
 <table className="w-full text-left">
 <thead className="bg-gray-50/80 border-b border-border/50">
 <tr>
 <th className="py-3 px-4 text-xs font-bold text-text-secondary">Item</th>
 <th className="py-3 px-4 text-xs font-bold text-text-secondary text-left">Qty</th>
 <th className="py-3 px-4 text-xs font-bold text-text-secondary text-left">Total</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/50">
 {order.items.map((item, idx) => (
 <tr key={idx}>
 <td className="py-3 px-4">
 <p className="text-sm font-bold text-brand-navy">{item.name}</p>
 <p className="text-xs font-medium text-text-secondary">₹{item.price.toFixed(2)}</p>
 </td>
 <td className="py-3 px-4 text-sm font-bold text-brand-navy text-left">x{item.qty}</td>
 <td className="py-3 px-4 text-sm font-bold text-brand-navy text-left">₹{item.subtotal.toFixed(2)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>

 {/* Billing Summary */}
 <section>
 <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-4">Billing Summary</h3>
 <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm space-y-3">
 <div className="flex justify-between text-sm font-medium text-text-secondary">
 <span>Subtotal</span>
 <span>₹{order.billing.subtotal.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-sm font-medium text-text-secondary">
 <span>Tax (GST)</span>
 <span>₹{order.billing.tax.toFixed(2)}</span>
 </div>
 <div className="pt-3 border-t border-border flex justify-between text-base font-black text-brand-navy">
 <span>Total Bill</span>
 <span>₹{order.billing.total.toFixed(2)}</span>
 </div>
 </div>
 </section>

 {/* Payment Details */}
 <section>
 <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-4">Payment Details</h3>
 <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
 <CreditCard className="w-5 h-5 text-blue-600" />
 </div>
 <div>
 <p className="text-sm font-bold text-brand-navy">{order.payment.method}</p>
 <p className="text-xs font-medium text-text-secondary mt-0.5">Method</p>
 </div>
 </div>
 <div className="text-right">
 <p className={`text-sm font-black ${
 order.payment.status === 'Paid' ? 'text-green-600' : 
 order.payment.status === 'Refunded' ? 'text-amber-600' :
 order.payment.status === 'Failed' ? 'text-red-600' : 'text-brand-orange-600'
 }`}>
 {order.payment.status}
 </p>
 <p className="text-xs font-medium text-text-secondary mt-0.5">Status</p>
 </div>
 </div>
 </section>

 {/* Delivery Agent Details (If assigned) */}
 {order.deliveryAgent && (
 <section>
 <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-4">Delivery Partner</h3>
 <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-brand-orange-50 rounded-full flex items-center justify-center shrink-0">
 <Motorbike className="w-5 h-5 text-brand-orange-600" />
 </div>
 <div>
 <p className="text-sm font-bold text-brand-navy">{order.deliveryAgent.name}</p>
 <p className="text-xs font-medium text-text-secondary mt-0.5">{order.deliveryAgent.contact}</p>
 </div>
 </div>
 </div>
 </section>
 )}
 
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}

