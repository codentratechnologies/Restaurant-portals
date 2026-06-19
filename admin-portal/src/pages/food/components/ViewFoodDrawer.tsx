import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Store, Layers } from 'lucide-react';
import Badge from '../../../components/common/Badge';
import { MenuItem } from '../../../hooks/useMenuItems';

interface ViewFoodDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 foodItem: MenuItem | null;
}

export default function ViewFoodDrawer({ isOpen, onClose, foodItem }: ViewFoodDrawerProps) {
 if (!foodItem) return null;

 if (!foodItem) return null;

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-40"
 />
 
 {/* Drawer */}
 <motion.div
 initial={{ x: '100%' }}
 animate={{ x: 0 }}
 exit={{ x: '100%' }}
 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
 className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
 >
 {/* Header */}
 <div className="flex items-center justify-between p-6 border-b border-border bg-gray-50/50">
 <h2 className="text-xl font-black text-brand-navy tracking-tight truncate pr-4">
 {foodItem.name} Detail View
 </h2>
 <button
 onClick={onClose}
 className="p-2 text-text-secondary hover:text-brand-navy hover:bg-gray-100 rounded-full transition-colors shrink-0"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto">
 <div className="p-6 space-y-8">
 
 {/* Image & Metadata */}
 <div className="space-y-4">
 <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-border/50">
 <img 
 src={foodItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} 
 alt={foodItem.name} 
 className="w-full h-full object-cover"
 />
 </div>
 
 <div>
 <div className="flex items-start justify-between gap-4 mb-2">
 <div>
 <div className="mb-1 text-xs font-bold text-text-secondary uppercase tracking-wider font-mono">
 {foodItem.foodId || '-'}
 </div>
 <h3 className="text-2xl font-black text-brand-navy">{foodItem.name}</h3>
 </div>
 <span className="text-xl font-black text-brand-orange-600">₹{foodItem.price}</span>
 </div>
 
 <div className="flex flex-wrap items-center gap-2 mb-4">
 {(foodItem.dietary_types || []).map((dt, idx) => (
 <Badge key={`dt-${idx}`} variant={
 dt === 'Veg' ? 'success' : 
 dt === 'Egg' ? 'warning' : 'error'
 }>
 {dt}
 </Badge>
 ))}
 {(foodItem.categories || []).map((cat, idx) => (
 <Badge key={`cat-${idx}`} variant="default" className="bg-gray-100 text-text-secondary border-none">
 {cat}
 </Badge>
 ))}
 <Badge variant={foodItem.is_available ? 'success' : 'error'} className="border-none">
 {foodItem.is_available ? 'Available' : 'Unavailable'}
 </Badge>
 </div>

 <p className="text-text-secondary text-sm font-medium leading-relaxed">
 {foodItem.description || 'No description provided for this item.'}
 </p>
 </div>
 </div>

 {/* Customization Options */}
 {foodItem.customizations && foodItem.customizations.length > 0 && (
 <div className="space-y-4">
 <h4 className="text-base font-black text-brand-navy flex items-center gap-2 pb-2 border-b border-border">
 <Layers className="w-4 h-4 text-brand-orange-500" />
 Customization Options ({foodItem.customizations.length})
 </h4>
 
 <div className="border border-border rounded-xl overflow-hidden shadow-sm">
 <table className="w-full text-left border-collapse text-sm">
 <thead>
 <tr className="bg-gray-50 border-b border-border">
 <th className="py-3 px-4 font-bold text-text-secondary">Option Label</th>
 <th className="py-3 px-4 font-bold text-text-secondary text-right">Price Add-on</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 bg-white">
 {foodItem.customizations.map((opt, idx) => (
 <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
 <td className="py-3 px-4 font-bold text-brand-navy">{opt.label}</td>
 <td className="py-3 px-4 text-right font-medium text-brand-orange-600">
 {Number(opt.price) === 0 ? 'Free' : `₹${opt.price}`}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 </div>
 
 {/* Footer */}
 <div className="p-6 border-t border-border bg-gray-50 mt-auto">
 <button 
 onClick={onClose}
 className="w-full py-3 rounded-xl font-bold bg-white border border-border text-text-primary hover:bg-gray-50 hover:text-brand-navy transition-colors shadow-sm"
 >
 Close Drawer
 </button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
