import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  employeeName: string;
}

export default function ActivateEmployeeModal({ isOpen, onClose, onConfirm, employeeName }: Props) {
  const [isActivating, setIsActivating] = useState(false);

  const handleConfirm = async () => {
    setIsActivating(true);
    if (onConfirm) {
      await onConfirm();
    } else {
      await new Promise(r => setTimeout(r, 1500));
    }
    setIsActivating(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activate Employee" maxWidth="md">
      <div className="p-6">
        <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-100 rounded-xl mb-6">
          <div className="p-2 bg-green-100 rounded-full shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-green-900 mb-1">Confirmation</h3>
            <p className="text-sm text-green-700 leading-relaxed">
              Are you sure you want to activate <span className="font-bold text-green-900">{employeeName}</span>? This will restore their access to active ROMS portals and sessions.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto px-6 justify-center">Cancel</Button>
          <Button onClick={handleConfirm} disabled={isActivating} className="w-full sm:w-auto justify-center bg-green-600 hover:bg-green-700 text-white border-none gap-2 px-6 shadow-sm">
            {isActivating && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Activation
          </Button>
        </div>
      </div>
    </Modal>
  );
}
