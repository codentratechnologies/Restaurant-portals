import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../components/common/Button';

interface DeactivateFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export default function DeactivateFoodModal({ isOpen, onClose, onConfirm, itemName }: DeactivateFoodModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setIsDeleting(false);
    onConfirm();
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
            className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden pointer-events-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-text-secondary hover:text-brand-navy hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl font-black text-brand-navy mb-2">
                  Deactivate Food Item Globally?
                </h3>
                <p className="text-text-secondary text-sm font-medium mb-4">
                  You are about to deactivate <span className="font-bold text-brand-navy">"{itemName}"</span>.
                </p>
                
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                  <p className="text-sm font-bold text-red-800">WARNING:</p>
                  <p className="text-sm text-red-700 mt-1">
                    Deactivating this item will instantly remove it from customer menus at all assigned branches. Existing historical orders remain unchanged.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-gray-50 transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white border-none gap-2 px-6"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isDeleting ? 'Deactivating...' : 'Confirm Deactivation'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
