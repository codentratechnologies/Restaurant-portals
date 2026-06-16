import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, X } from 'lucide-react';
import Button from '../../../components/common/Button';

interface DisableConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function DisableConfirmationModal({ isOpen, onClose, onConfirm, itemName }: DisableConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-brand-navy/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto border border-border/50"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0 mb-4 border border-red-100">
                    <AlertOctagon className="w-6 h-6 text-red-600" />
                  </div>
                  <button onClick={onClose} className="p-2 text-text-secondary hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <h3 className="text-xl font-black text-brand-navy mb-2">Deactivate Food Item Globally?</h3>
                <p className="text-sm font-medium text-text-secondary leading-relaxed">
                  You are about to mark <span className="font-bold text-brand-navy">{itemName}</span> as unavailable.
                  Deactivating this item will instantly remove it from customer menus at all assigned branches.
                </p>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-border flex items-center gap-3 justify-end">
                <Button variant="secondary" onClick={onClose} className="px-6 font-bold bg-white shadow-sm hover:bg-gray-50">
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }} 
                  className="px-6 font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                >
                  Confirm Deactivation
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
