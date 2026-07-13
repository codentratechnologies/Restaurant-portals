import { useState } from 'react';
import { AlertTriangle, Loader2, Power, X, FileText, EyeOff, Trash2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  employeeName: string;
}

export default function DeactivateEmployeeModal({ isOpen, onClose, onConfirm, employeeName }: Props) {
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleConfirm = async () => {
    setIsDeactivating(true);
    if (onConfirm) {
      await onConfirm();
    } else {
      await new Promise(r => setTimeout(r, 1500));
    }
    setIsDeactivating(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="p-8">
        {/* Custom Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF3E8] flex items-center justify-center shrink-0">
              <Power className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1a1f36] tracking-tight mb-1">
                Deactivate Employee — {employeeName}?
              </h2>
              <p className="text-xs font-semibold text-[#8896AB]">
                You are about to deactivate this employee. Please review the details below.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#8896AB] hover:bg-[#F8FAFC] rounded-full transition-colors shrink-0 -mt-2 -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Box */}
        <div className="flex items-start gap-4 p-5 bg-[#FFF3E8]/50 border border-[#FF6B00]/20 rounded-xl mb-8">
          <AlertTriangle className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-[#FF6B00] mb-1 text-sm">Warning</h3>
            <p className="text-xs font-semibold text-[#1a1f36] leading-relaxed">
              Deactivating this employee will immediately revoke<br/>
              all access to active portals and sessions.
            </p>
          </div>
        </div>

        {/* What will happen? Section */}
        <div className="mb-8">
          <h3 className="font-black text-[#1a1f36] mb-5 text-sm">What will happen?</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <X className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-xs font-semibold text-[#1a1f36]">
                This employee will no longer have access to the system.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-xs font-semibold text-[#1a1f36]">
                Active orders handled by them will not be deleted.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <EyeOff className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xs font-semibold text-[#1a1f36]">
                This employee will be marked as inactive across the platform.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl font-bold text-[#FF6B00] bg-white border border-[#FF6B00] hover:bg-[#FFF3E8] transition-all text-sm shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            disabled={isDeactivating} 
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#FF6B00] hover:bg-[#E66000] border-none flex items-center gap-2 text-sm shadow-sm transition-all"
          >
            {isDeactivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Confirm Deactivation
          </button>
        </div>
      </div>
    </Modal>
  );
}
