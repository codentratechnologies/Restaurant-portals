import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, ExternalLink, MessageSquare, AlertTriangle, Flag, Receipt } from 'lucide-react';
import Button from '../../../components/common/Button';

export interface ReviewData {
 id: string;
 rating: number;
 date: string;
 customerName: string;
 isAnonymous: boolean;
 comment: string;
 orderId: string;
 isFlagged?: boolean;
 hasProfanity?: boolean;
 orderedItems: {
 name: string;
 price: number;
 }[];
}

interface ReviewDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 review: ReviewData | null;
 onOpenOrder: (orderId: string) => void;
}

export default function ReviewDrawer({ isOpen, onClose, review, onOpenOrder }: ReviewDrawerProps) {
 if (!review) return null;

 const displayName = review.isAnonymous ?"Anonymous Customer" : review.customerName;

 const renderStars = (rating: number) => {
 return (
 <div className="flex gap-1 text-lg">
 {[1, 2, 3, 4, 5].map((star) => (
 <span key={star} className={star <= rating ?"text-yellow-400 drop-shadow-sm" :"text-gray-200"}>
 ★
 </span>
 ))}
 </div>
 );
 };

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
 className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-border flex flex-col"
 >
 {/* Header */}
 <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
 <div>
 <h2 className="text-xl font-black text-brand-navy">Review Details</h2>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">ID: {review.id}</span>
 </div>
 </div>
 <button onClick={onClose} className="p-2 text-text-secondary hover:bg-gray-100 rounded-full transition-colors">
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
 
 {/* Moderation Warnings */}
 {(review.isFlagged || review.hasProfanity) && (
 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
 <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
 <div>
 <h4 className="text-sm font-bold text-amber-900">Content Moderation</h4>
 <p className="text-xs font-medium text-amber-700 mt-1">
 {review.hasProfanity ?"Automated systems detected potential profanity in this review." :""}
 {review.isFlagged ?"This review has been flagged for administrative review." :""}
 </p>
 </div>
 </div>
 )}

 {/* Meta Info */}
 <div className="grid grid-cols-2 gap-4">
 <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm">
 <div className="flex items-center gap-2 mb-1">
 <User className="w-4 h-4 text-text-secondary" />
 <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Customer</span>
 </div>
 <p className={`text-sm font-black ${review.isAnonymous ? 'text-text-secondary italic' : 'text-brand-navy'}`}>
 {displayName}
 </p>
 </div>
 <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm">
 <div className="flex items-center gap-2 mb-1">
 <Calendar className="w-4 h-4 text-text-secondary" />
 <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Date</span>
 </div>
 <p className="text-sm font-black text-brand-navy">{review.date}</p>
 </div>
 </div>

 {/* Linked Order */}
 <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm flex items-center justify-between">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <Receipt className="w-4 h-4 text-text-secondary" />
 <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Linked Order</span>
 </div>
 <p className="text-sm font-black text-brand-orange-600">{review.orderId}</p>
 </div>
 <Button 
 variant="outline" 
 size="sm"
 onClick={() => onOpenOrder(review.orderId)}
 className="bg-white hover:bg-gray-50 border-gray-200 text-brand-navy font-bold shadow-sm"
 >
 <ExternalLink className="w-4 h-4 mr-2" /> View Order
 </Button>
 </div>

 {/* Rating & Comment */}
 <div className="bg-white border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Rating</span>
 <div className="flex items-center gap-3">
 <span className="text-lg font-black text-brand-navy">{review.rating.toFixed(1)} <span className="text-text-secondary text-sm font-bold">/ 5.0</span></span>
 {renderStars(review.rating)}
 </div>
 </div>

 <div className="pt-4 border-t border-border">
 <div className="flex items-center gap-2 mb-3">
 <MessageSquare className="w-4 h-4 text-text-secondary" />
 <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Comment</span>
 </div>
 {review.comment ? (
 <p className="text-sm font-medium text-brand-navy leading-relaxed break-words whitespace-pre-wrap">
"{review.comment}"
 </p>
 ) : (
 <p className="text-sm font-medium text-text-secondary italic">No comment provided.</p>
 )}
 </div>
 </div>

 {/* Ordered Items */}
 {review.orderedItems && review.orderedItems.length > 0 && (
 <div className="bg-white border border-border/50 rounded-2xl p-5 shadow-sm">
 <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Items Ordered</h3>
 <ul className="space-y-3">
 {review.orderedItems.map((item, idx) => (
 <li key={idx} className="flex items-start gap-3">
 <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-500 mt-2 shrink-0" />
 <div className="flex-1 flex justify-between gap-4">
 <span className="text-sm font-bold text-brand-navy leading-relaxed">{item.name}</span>
 <span className="text-sm font-medium text-text-secondary whitespace-nowrap">₹{item.price.toFixed(2)}</span>
 </div>
 </li>
 ))}
 </ul>
 </div>
 )}

 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
