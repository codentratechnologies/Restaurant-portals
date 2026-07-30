import { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import Button from '../../components/common/Button';
import { Save, Edit3, X, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoutModal from '../../components/common/LogoutModal';

export default function StandaloneProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-medium text-[#8896AB] mb-4">
        <Link to="/admin/settings" className="hover:text-[#1a1f36] transition-colors">Settings</Link>
        <span>&gt;</span>
        <span className="text-[#1a1f36]">Profile</span>
      </div>

      {/* Page heading row */}
      <div className="flex flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-[28px] font-black text-[#1a1f36] tracking-tight leading-none mb-1">Profile</h1>
          <p className="text-xs sm:text-sm font-medium text-[#8896AB] hidden sm:block">Manage your profile information and account details.</p>
        </div>
        <div className="shrink-0 flex items-center gap-2 sm:gap-4">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)} 
                className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto text-[#8896AB] hover:text-[#1a1f36] transition-colors"
              >
                <X className="w-5 h-5 sm:hidden" />
                <span className="hidden sm:inline text-[13px] font-bold">Cancel</span>
              </button>
              <Button 
                type="submit" 
                form="profile-form" 
                className="flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E66000] text-white w-10 h-10 p-0 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 rounded-xl shadow-sm text-sm font-bold border-transparent"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save Changes</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-[#E8ECF4] text-[#1a1f36] w-10 h-10 p-0 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 rounded-xl shadow-sm text-sm font-bold"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </Button>
              <Button 
                onClick={() => setIsLogoutOpen(true)}
                className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 border border-red-200 text-red-500 w-10 h-10 p-0 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 rounded-xl shadow-sm text-sm font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <ProfileSettings isEditing={isEditing} setIsEditing={setIsEditing} />
      
      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </div>
  );
}
