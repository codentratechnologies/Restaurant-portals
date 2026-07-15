import { useState } from 'react';
import { Sun, Menu, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import GlobalSearch from '../common/GlobalSearch';

interface AdminTopNavProps {
  onMenuClick?: () => void;
}

export default function AdminTopNav({ onMenuClick }: AdminTopNavProps) {
  const { user } = useAuth();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white border-b border-[#E8ECF4] flex items-center justify-between px-4 sm:px-6">
      
      {isMobileSearchOpen ? (
        <div className="flex w-full items-center gap-2 sm:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <GlobalSearch variant="nav" onSearchComplete={() => setIsMobileSearchOpen(false)} />
          <button 
            onClick={() => setIsMobileSearchOpen(false)}
            className="text-sm font-bold text-gray-500 hover:text-gray-700 px-2 shrink-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          {/* LEFT: Mobile Menu Toggle & Search */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 text-[#8896AB] hover:text-[#1a1f36] focus:outline-none transition-colors rounded-lg hover:bg-[#F4F6FA]"
            >
              <Menu className="w-6 h-6" />
            </button>

            <img 
              src="/logo.png" 
              alt="DineOS Logo" 
              className="lg:hidden h-[22px] object-contain ml-1" 
            />

            <div className="hidden sm:block">
              <GlobalSearch variant="nav" />
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="sm:hidden p-2 text-[#8896AB] hover:text-[#1a1f36] rounded-full hover:bg-[#F4F6FA] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button className="p-2 text-[#8896AB] hover:text-[#1a1f36] rounded-full hover:bg-[#F4F6FA] transition-colors">
              <Sun className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-[#E8ECF4] mx-1 sm:mx-2"></div>

            {/* TopNav Profile Initial */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFF3E8] text-[#FF6B00] flex items-center justify-center font-black text-sm shrink-0 border border-[#FF6B00]/20">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>

          </div>
        </>
      )}
    </header>
  );
}
