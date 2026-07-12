import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

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
 <Modal isOpen={isOpen} onClose={onClose} title="Deactivate Employee" maxWidth="md">
 <div className="p-6">
 <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
 <div className="p-2 bg-red-100 rounded-full shrink-0">
 <AlertTriangle className="w-5 h-5 text-red-600" />
 </div>
 <div>
 <h3 className="font-bold text-red-900 mb-1">Warning</h3>
 <p className="text-sm text-red-700 leading-relaxed">
 Are you sure you want to deactivate <span className="font-bold text-red-900">{employeeName}</span>? This will immediately revoke all access to active ROMS portals and sessions.
 </p>
 </div>
 </div>

 <div className="bg-gray-50 border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-8">
 <span className="text-sm font-bold text-text-secondary shrink-0">Note:</span>
 <span className="text-sm font-medium text-text-secondary">Active orders handled by them will not be deleted.</span>
 </div>

 <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
 <Button variant="outline" onClick={onClose} className="w-full sm:w-auto px-6 justify-center">Cancel</Button>
 <Button onClick={handleConfirm} disabled={isDeactivating} className="w-full sm:w-auto justify-center bg-red-600 hover:bg-red-700 text-white border-none gap-2 px-6 shadow-sm">
 {isDeactivating && <Loader2 className="w-4 h-4 animate-spin" />}
 Confirm Deactivation
 </Button>
 </div>
 </div>
 </Modal>
 );
}
