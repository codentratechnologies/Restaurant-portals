import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface Props {
 isOpen: boolean;
 onClose: () => void;
 onConfirm?: () => Promise<void> | void;
 branchName: string;
}

export default function DeactivateBranchModal({ isOpen, onClose, onConfirm, branchName }: Props) {
 const [isDeactivating, setIsDeactivating] = useState(false);

 const handleConfirm = async () => {
 setIsDeactivating(true);
 // Simulate API call delay if no onConfirm is provided, else await it
 if (onConfirm) {
 await onConfirm();
 } else {
 await new Promise(r => setTimeout(r, 1500));
 }
 setIsDeactivating(false);
 onClose();
 };

 return (
 <Modal isOpen={isOpen} onClose={onClose} title={`Deactivate Branch — ${branchName}?`} maxWidth="md">
 <div className="p-6">
 <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
 <div className="p-2 bg-red-100 rounded-full shrink-0">
 <AlertTriangle className="w-5 h-5 text-red-600" />
 </div>
 <div>
 <h3 className="font-bold text-red-900 mb-1">Warning</h3>
 <p className="text-sm text-red-700 leading-relaxed">
 Deactivating this branch will immediately stop all customer applications from placing new orders here. 
 </p>
 </div>
 </div>

 <div className="bg-gray-50 border border-border rounded-xl p-4 flex items-center justify-between mb-8">
 <span className="text-sm font-bold text-text-secondary">Active Orders</span>
 <span className="font-mono font-black text-brand-navy">12</span>
 </div>

 <div className="flex gap-3 justify-end">
 <Button variant="outline" onClick={onClose} className="px-6">Cancel</Button>
 <Button onClick={handleConfirm} disabled={isDeactivating} className="bg-red-600 hover:bg-red-700 text-white border-none gap-2 px-6 shadow-sm">
 {isDeactivating && <Loader2 className="w-4 h-4 animate-spin" />}
 Confirm Deactivation
 </Button>
 </div>
 </div>
 </Modal>
 );
}
