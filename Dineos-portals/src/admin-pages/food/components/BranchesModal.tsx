import React from 'react';
import { Store, CheckCircle2, AlertCircle, X, Search } from 'lucide-react';
import Modal from '../../../components/common/Modal';

interface BranchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBranches: any[];
}

export default function BranchesModal({ isOpen, onClose, availableBranches }: BranchesModalProps) {
  const [search, setSearch] = React.useState('');

  const filteredBranches = React.useMemo(() => {
    return availableBranches.filter(b => 
      b.name?.toLowerCase().includes(search.toLowerCase()) || 
      b.code?.toLowerCase().includes(search.toLowerCase())
    );
  }, [availableBranches, search]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Available Branches" 
      maxWidth="lg"
    >
      <div className="p-0 flex flex-col h-[70vh] sm:h-auto sm:max-h-[80vh]">
        
        {/* Header & Search */}
        <div className="p-4 sm:p-6 border-b border-[#E8ECF4] bg-white sticky top-0 z-10">
          <p className="text-sm font-medium text-[#8896AB] mb-4">
            This item is currently available in <strong className="text-[#1a1f36]">{availableBranches.length}</strong> branches.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896AB]" />
            <input 
              type="text"
              placeholder="Search branches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-[#E8ECF4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/30">
          {filteredBranches.length > 0 ? (
            <div className="space-y-3">
              {filteredBranches.map(branch => (
                <div key={branch.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-[#E8ECF4] rounded-xl shadow-sm hover:border-[#FFD0B5] transition-colors group">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3E8] flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-[#1a1f36] group-hover:text-[#FF6B00] transition-colors">{branch.name}</h4>
                      <p className="text-xs font-semibold text-[#8896AB] uppercase tracking-wider">{branch.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E5F5ED] text-[#00A254] w-fit">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Serving</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Store className="w-12 h-12 text-[#E8ECF4] mb-3" />
              <h3 className="text-[15px] font-bold text-[#1a1f36]">No branches found</h3>
              <p className="text-sm font-medium text-[#8896AB]">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
