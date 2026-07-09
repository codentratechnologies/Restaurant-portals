import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../../../components/common/Button';

interface DeleteCouponModalProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm: () => void;
 couponCode: string;
}

export default function DeleteCouponModal({ isOpen, onClose, onConfirm, couponCode }: DeleteCouponModalProps) {
 if (!isOpen) return null;

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm"
 onClick={onClose}
 />
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
 >
 <div className="p-6">
 <div className="flex items-start justify-between mb-4">
 <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
 <AlertTriangle className="w-6 h-6 text-red-500" />
 </div>
 <button
 onClick={onClose}
 className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-gray-100 transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <h3 className="text-xl font-black text-brand-navy mb-2 tracking-tight">
 Delete Coupon - {couponCode}?
 </h3>
 
 <p className="text-text-secondary font-medium">
 Deleting this coupon will permanently remove it from the system and immediately prevent customers from redeeming it at checkout. Are you sure you want to continue?
 </p>
 </div>
 
 <div className="p-6 pt-0 flex items-center justify-end gap-3">
 <Button variant="outline" onClick={onClose} className="font-bold">
 Cancel
 </Button>
 <Button 
 variant="primary" 
 onClick={() => {
 onConfirm();
 onClose();
 }}
 className="bg-red-500 hover:bg-red-600 border-transparent shadow-sm font-bold text-white"
 >
 Confirm Deletion
 </Button>
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 );
}
