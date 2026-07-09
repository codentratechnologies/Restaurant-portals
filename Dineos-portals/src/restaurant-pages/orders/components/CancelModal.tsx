import { useState, useEffect, useState as reactUseState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => void;
  orderId: string;
}

const REASON_OPTIONS = [
  'Items out of stock',
  'Customer requested cancellation',
  'Restaurant too busy',
  'Store closed',
  'Other'
];

export default function CancelModal({ isOpen, onClose, onConfirm, orderId }: CancelModalProps) {
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isNotesRequired = reason === 'Other';
  const isValid = !isNotesRequired || (notes.trim().length >= 10);

  const handleSubmit = () => {
    if (isValid) {
      onConfirm(reason, notes);
      setReason(REASON_OPTIONS[0]);
      setNotes('');
    }
  };

  const handleClose = () => {
    setReason(REASON_OPTIONS[0]);
    setNotes('');
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[9999] bg-brand-navy/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto border border-border/50 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-gray-50/50">
                <h3 className="text-xl font-black text-brand-navy">Cancel Order #{orderId}</h3>
                <button onClick={handleClose} className="p-2 text-text-secondary hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-brand-navy">
                    Reason for Cancellation <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={reason}
                    onChange={(e: any) => setReason(e.target.value)}
                    options={REASON_OPTIONS.map(opt => ({ value: opt, label: opt }))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-bold text-brand-navy">
                      Additional Notes {isNotesRequired && <span className="text-red-500">*</span>}
                    </label>
                    <span className={`text-xs font-bold ${notes.length > 250 ? 'text-red-500' : 'text-text-secondary'}`}>
                      {notes.length}/250
                    </span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 250))}
                    placeholder={isNotesRequired ? "Please provide details (min 10 chars)..." : "Optional notes..."}
                    rows={4}
                    className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 transition-all shadow-sm resize-none"
                  />
                  {isNotesRequired && notes.length > 0 && notes.length < 10 && (
                    <p className="text-xs font-bold text-red-500 mt-1">Minimum 10 characters required.</p>
                  )}
                </div>

              </div>
              
              <div className="p-6 bg-gray-50 border-t border-border flex items-center gap-3 justify-end shrink-0">
                <Button variant="secondary" onClick={handleClose} className="px-6 font-bold bg-white shadow-sm hover:bg-gray-50">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!isValid}
                  className="px-6 font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 disabled:opacity-50 disabled:shadow-none"
                >
                  Confirm Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
