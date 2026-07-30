import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout" maxWidth="sm">
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
            <LogOut className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1f36] mb-2">Ready to Leave?</h3>
          <p className="text-sm text-[#8896AB] mb-6">
            Are you sure you want to log out of your account? You will need to sign in again to access your portal.
          </p>
          <div className="flex w-full gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-white hover:bg-gray-50 text-[#1a1f36] border border-[#E8ECF4]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
