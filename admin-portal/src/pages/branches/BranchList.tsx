import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Store, Eye, Edit2, AlertOctagon, CheckCircle2, Rocket, ChevronLeft, ChevronRight, FileX, Phone } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import DeactivateBranchModal from './components/DeactivateBranchModal';
import { useBranches, Branch } from '../../hooks/useBranches';
import { ref, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function BranchList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { branches, loading: isLoading } = useBranches();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Modal states
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Extract unique cities from branches for the filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = new Set(branches.map(b => b.city).filter(Boolean));
    return Array.from(cities).sort();
  }, [branches]);

  // Computed filtered data
  const filteredData = useMemo(() => {
    let result = branches;
    
    // Search validation
    if (searchQuery.length > 0) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (b) => b.name.toLowerCase().includes(lowerQuery) || 
               b.city.toLowerCase().includes(lowerQuery) ||
               b.address.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (statusFilter !== 'All') {
      const isActiveFilter = statusFilter === 'Active';
      result = result.filter((b) => b.is_active === isActiveFilter);
    }
    
    if (cityFilter !== 'All') {
      result = result.filter((b) => b.city === cityFilter);
    }
    
    return result;
  }, [branches, searchQuery, statusFilter, cityFilter]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, cityFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  // Handle Firebase updates
  const handleToggleStatus = async (branchId: string, newStatus: boolean) => {
    if (!user) return;
    try {
      await update(ref(rtdb, `branch/${user.uid}/${branchId}`), {
        is_active: newStatus,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update branch status', error);
    }
  };

  const handleDeactivateClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (selectedBranch) {
      await handleToggleStatus(selectedBranch.id, false);
      setDeactivateModalOpen(false);
    }
  };

  const getPageNumbers = () => {
    if (!totalPages || !currentPage) return [];
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handleRowClick = (branch: Branch) => {
    navigate(`/branches/${branch.id}`);
  };

  // ── Empty State ──────────────────────────────────────────────────
  if (!isLoading && branches.length === 0) {
    return (
      <div className="space-y-6 pb-16 h-[calc(100vh-100px)] flex flex-col">
        {/* Top Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight">Branches</h1>
            <p className="text-text-secondary mt-1 text-sm font-medium">Manage all restaurant branches and operational locations.</p>
          </motion.div>
        </div>

        {/* Empty State Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1"
        >
          <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border/60 bg-white/50 backdrop-blur-sm">
            <div className="w-24 h-24 mb-6 rounded-full bg-brand-orange-50 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full bg-brand-orange-100 animate-ping opacity-20"></div>
              <Rocket className="w-12 h-12 text-brand-orange-500 relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy mb-2">No Branches Found</h2>
            <p className="text-text-secondary max-w-md mx-auto mb-8">
              You haven't added any restaurant branches to DineOS yet. Set up your first location to start managing operations, menus, and orders.
            </p>
            <Link to="/branches/new">
              <Button className="font-bold py-3 px-8 shadow-premium text-base">
                <Plus className="w-5 h-5 mr-2 inline" />
                Launch First Branch
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Normal List View ─────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-16">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">Branches</h1>
          <p className="text-text-secondary mt-1 text-sm font-medium">Manage all restaurant branches and operational locations.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Link to="/branches/new">
            <Button className="gap-2 shadow-sm font-bold">
              <Plus className="w-5 h-5" />
              Add Branch
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="p-0 overflow-hidden border border-border/50 shadow-soft bg-white flex flex-col min-h-[600px]">
          
          {/* Filter Bar */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
              <input
                type="text"
                placeholder="Search branches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 transition-all shadow-sm hover:bg-white focus:bg-white placeholder:text-text-secondary/60"
              />
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <div className="w-full md:w-[160px]">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Status' },
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                />
              </div>

              <div className="w-full md:w-[160px]">
                <Select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Cities' },
                    ...uniqueCities.map((city) => ({ value: city, label: city }))
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Branch Records List */}
          <div className="flex-1 flex flex-col relative bg-gray-50/30 p-4 sm:p-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse border border-border/50"></div>
              ))
            ) : paginatedData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-secondary py-12">
                <FileX className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium text-lg">
                  {searchQuery.length > 0 ? `No branches found matching "${searchQuery}"` : 'No branches found.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {paginatedData.map((branch, i) => (
                  <motion.div
                    key={branch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() => handleRowClick(branch)}
                    className="group relative bg-white border border-border/60 hover:border-brand-orange-500/30 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-premium transition-all cursor-pointer overflow-hidden flex flex-col lg:flex-row lg:items-center gap-6"
                  >
                    {/* Hover Decoration */}
                    <div className="absolute inset-y-0 left-0 w-1 bg-brand-orange-500 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
                    
                    {/* Identity Section */}
                    <div className="flex items-center gap-4 lg:w-1/3">
                      <div className="w-14 h-14 rounded-2xl bg-brand-orange-50 border border-brand-orange-100 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                        <Store className="w-7 h-7 text-brand-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-black text-brand-navy truncate">{branch.name}</h3>
                          {branch.code && (
                            <span className="px-2 py-0.5 rounded bg-gray-100 border border-border text-[10px] font-bold text-text-secondary tracking-widest uppercase shrink-0">
                              {branch.code}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{branch.city}</span>
                        </div>
                      </div>
                    </div>

                    {/* Divider for mobile */}
                    <div className="h-px w-full bg-border/50 lg:hidden"></div>

                    {/* Contact & Location Section */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      <div className="flex flex-col justify-center">
                        <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Address</p>
                        <p className="text-sm font-medium text-brand-navy line-clamp-2">{branch.address}</p>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Manager</p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {(branch.owner_name?.[0] || 'M').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-brand-navy truncate">{branch.owner_name || 'Manager'}</p>
                            <p className="text-xs text-text-secondary flex items-center gap-1 truncate">
                              <Phone className="w-3 h-3" /> {branch.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions Section */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 lg:w-1/4 shrink-0">
                      <Badge variant={branch.is_active ? 'success' : 'error'} className="font-black px-3 py-1 shadow-sm uppercase tracking-widest text-[11px]">
                        {branch.is_active ? 'Active' : 'Inactive'}
                      </Badge>

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Link 
                          to={`/branches/${branch.id}`} 
                          className="p-2.5 text-text-secondary hover:text-brand-navy hover:bg-gray-100 rounded-xl transition-all shadow-sm border border-transparent hover:border-border"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link 
                          to={`/branches/${branch.id}/edit`} 
                          className="p-2.5 text-text-secondary hover:text-brand-orange-600 hover:bg-orange-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-brand-orange-200"
                          title="Edit Branch"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        {branch.is_active ? (
                          <button 
                            onClick={() => handleDeactivateClick(branch)}
                            className="p-2.5 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-200"
                            title="Deactivate Branch"
                          >
                            <AlertOctagon className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleToggleStatus(branch.id, true)}
                            className="p-2.5 text-text-secondary hover:text-green-600 hover:bg-green-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-green-200"
                            title="Activate Branch"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {!isLoading && totalPages > 0 && (
            <div className="mt-auto px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 rounded-b-xl">
              <p className="text-sm text-text-secondary font-medium">
                Showing page <span className="font-bold text-brand-navy">{currentPage}</span> of <span className="font-bold text-brand-navy">{totalPages}</span>
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-white hover:text-brand-navy hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
                
                <div className="hidden sm:flex items-center gap-1 px-2">
                  {getPageNumbers().map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                      disabled={page === '...'}
                      className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        page === currentPage
                          ? 'bg-brand-navy text-white shadow-sm'
                          : page === '...'
                          ? 'text-text-secondary cursor-default'
                          : 'text-text-secondary hover:bg-white hover:text-brand-navy hover:shadow-sm'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-white hover:text-brand-navy hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modals */}
      <DeactivateBranchModal 
        isOpen={deactivateModalOpen} 
        onClose={() => setDeactivateModalOpen(false)} 
        onConfirm={handleConfirmDeactivate}
        branchName={selectedBranch?.name || ''} 
      />
    </div>
  );
}

