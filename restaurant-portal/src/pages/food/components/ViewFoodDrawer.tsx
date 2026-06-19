import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Store } from 'lucide-react';
import Badge from '../../../components/common/Badge';

interface BranchMapping {
 code: string;
 name: string;
 status: 'Active' | 'Inactive';
}

interface FoodItem {
 id: number;
 name: string;
 category: string;
 dietaryType: string;
 price: string;
 description?: string;
 image: string;
 branches: BranchMapping[];
}

interface ViewFoodDrawerProps {
 isOpen: boolean;
 onClose: () => void;
 foodItem: FoodItem | null;
}

export default function ViewFoodDrawer({ isOpen, onClose, foodItem }: ViewFoodDrawerProps) {
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
 src={foodItem.image} 
 alt={foodItem.name} 
 className="w-full h-full object-cover"
 />
 </div>
 
 <div>
 <div className="flex items-start justify-between gap-4 mb-2">
 <h3 className="text-2xl font-black text-brand-navy">{foodItem.name}</h3>
 <span className="text-xl font-black text-brand-orange-600">{foodItem.price}</span>
 </div>
 
 <div className="flex items-center gap-2 mb-4">
 <Badge variant={
 foodItem.dietaryType === 'Veg' ? 'success' : 
 foodItem.dietaryType === 'Non-Veg' ? 'error' : 
 foodItem.dietaryType === 'Vegan' ? 'success' : 'warning'
 }>
 {foodItem.dietaryType}
 </Badge>
 <Badge variant="default" className="bg-gray-100 text-text-secondary border-none">
 {foodItem.category}
 </Badge>
 </div>

 <p className="text-text-secondary text-sm font-medium leading-relaxed">
 {foodItem.description || 'No description provided for this item.'}
 </p>
 </div>
 </div>

 {/* Branch Mappings Table */}
 <div className="space-y-4">
 <h4 className="text-base font-black text-brand-navy flex items-center gap-2 pb-2 border-b border-border">
 <Store className="w-4 h-4 text-brand-orange-500" />
 Assigned Location Mappings
 </h4>
 
 {foodItem.branches && foodItem.branches.length > 0 ? (
 <div className="border border-border rounded-xl overflow-hidden shadow-sm">
 <table className="w-full text-left border-collapse text-sm">
 <thead>
 <tr className="bg-gray-50 border-b border-border">
 <th className="py-3 px-4 font-bold text-text-secondary">Code</th>
 <th className="py-3 px-4 font-bold text-text-secondary">Branch Name</th>
 <th className="py-3 px-4 font-bold text-text-secondary text-left">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {foodItem.branches.map((branch, idx) => (
 <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
 <td className="py-3 px-4 font-mono font-bold text-brand-navy">{branch.code}</td>
 <td className="py-3 px-4 font-medium text-text-primary">{branch.name}</td>
 <td className="py-3 px-4 text-left">
 <Badge variant={branch.status === 'Active' ? 'success' : 'error'} className="text-[10px] px-2 py-0.5">
 {branch.status}
 </Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="text-center py-8 bg-gray-50 border border-dashed border-border rounded-xl">
 <MapPin className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-50" />
 <p className="text-sm font-bold text-text-secondary">No Branches Assigned</p>
 </div>
 )}
 </div>

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

