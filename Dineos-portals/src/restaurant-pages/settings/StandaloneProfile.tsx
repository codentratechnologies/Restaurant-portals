import { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import Button from '../../components/common/Button';
import { Edit3, X, LogOut } from 'lucide-react';
import LogoutModal from '../../components/common/LogoutModal';

export default function StandaloneProfile() {
  const [editing, setEditing] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="bg-white rounded-2xl border border-border shadow-soft p-4 sm:p-8">
        {/* Page heading row — Edit button lives here, right edge */}
        <div className="flex flex-row items-start justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">My Profile</h1>
            <p className="text-text-secondary mt-1 text-xs sm:text-sm">Manage your personal account details and preferences.</p>
          </div>
          <div className="shrink-0 mt-1 sm:mt-0">
            {!editing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-white border border-brand-orange-500 rounded-xl text-sm font-bold text-brand-orange-500 hover:bg-brand-orange-50 transition-colors shadow-sm"
                >
                  <Edit3 className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline sm:ml-2">Edit Profile</span>
                </button>
                <button
                  onClick={() => setIsLogoutOpen(true)}
                  className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-white border border-red-200 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                >
                  <LogOut className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline sm:ml-2">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 text-sm font-bold text-text-secondary hover:text-brand-navy border border-border rounded-xl transition-colors shadow-sm"
              >
                <X className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline sm:ml-1.5">Discard</span>
              </button>
            )}
          </div>
        </div>

        <ProfileSettings editing={editing} onSetEditing={setEditing} />
      </div>
      
      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </div>
  );
}
