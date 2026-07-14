import { useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface StatusConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemName: string;
  action: 'activate' | 'deactivate';
}

export default function StatusConfirmationModal({ isOpen, onClose, onConfirm, itemName, action }: StatusConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isDeactivate = action === 'deactivate';

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isDeactivate ? "Deactivate Food Item" : "Activate Food Item"} 
      maxWidth="md"
    >
      <div className="p-6">
        <div className={`flex items-start gap-4 p-4 border rounded-xl mb-6 ${isDeactivate ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
          <div className={`p-2 rounded-full shrink-0 ${isDeactivate ? 'bg-red-100' : 'bg-green-100'}`}>
            {isDeactivate ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div>
            <h3 className={`font-bold mb-1 ${isDeactivate ? 'text-red-900' : 'text-green-900'}`}>
              {isDeactivate ? 'Warning' : 'Confirmation'}
            </h3>
            <p className={`text-sm leading-relaxed ${isDeactivate ? 'text-red-700' : 'text-green-700'}`}>
              {isDeactivate ? (
                <>Are you sure you want to deactivate <span className="font-bold text-red-900">{itemName}</span>? This will instantly remove it from customer menus at all assigned branches.</>
              ) : (
                <>Are you sure you want to activate <span className="font-bold text-green-900">{itemName}</span>? This will instantly publish the item to customer menus at all assigned branches.</>
              )}
            </p>
          </div>
        </div>

        {isDeactivate && (
          <div className="bg-gray-50 border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-8">
            <span className="text-sm font-bold text-text-secondary shrink-0">Note:</span>
            <span className="text-sm font-medium text-text-secondary">Historical orders with this item will remain unaffected.</span>
          </div>
        )}

        <div className={`flex flex-col-reverse sm:flex-row gap-3 sm:justify-end ${!isDeactivate && 'mt-8'}`}>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto px-6 justify-center">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isProcessing} 
            className={`w-full sm:w-auto justify-center text-white border-none gap-2 px-6 shadow-sm ${
              isDeactivate ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeactivate ? 'Confirm Deactivation' : 'Confirm Activation'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
