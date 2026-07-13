import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Store, Eye, Edit2, AlertOctagon, CheckCircle2, Rocket, ChevronLeft, ChevronRight, FileX, Phone, User as UserIcon, Filter, LayoutGrid, BarChart2, MoreVertical, PauseCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Tooltip from '../../components/common/Tooltip';
import DeactivateBranchModal from './components/DeactivateBranchModal';
import { useBranches, Branch } from '../../hooks/useBranches';
import { useEmployees } from '../../hooks/useEmployees';
import { ref, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

export default function BranchList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { branches, loading: isLoading } = useBranches();
  const { employees } = useEmployees();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
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
    navigate(`/admin/branches/${branch.id}`);
  };

  // ── Empty State ──────────────────────────────────────────────────
  if (!isLoading && branches.length === 0) {
    return (
      <div className="space-y-6 min-h-[500px] flex-1 flex flex-col">


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
            <Link to="/admin/branches/new">
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-black text-[#1a1f36] tracking-tight">Branches</h1>
          <div className="flex items-center gap-2 mt-1">
            <Link to="/admin/dashboard" className="text-sm font-medium text-[#8896AB] hover:text-[#1a1f36]">Dashboard</Link>
            <span className="text-sm font-medium text-[#8896AB]">&gt;</span>
            <span className="text-sm font-medium text-[#FF6B00]">Branches</span>
          </div>
        </motion.div>
        
        <Link to="/admin/branches/new" className="shrink-0">
          <Button className="px-6 gap-2 shadow-sm font-bold bg-[#FF6B00] text-white border-0 hover:bg-[#E66000] rounded-lg">
            <Plus className="w-4 h-4" />
            Add New Branch
          </Button>
        </Link>
      </div>

      {/* KPI Cards Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white p-5 rounded-2xl border border-[#E8ECF4] shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF3E8] text-[#FF6B00] flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#8896AB] mb-0.5">Total Branches</p>
            <h3 className="text-2xl font-black text-[#1a1f36] leading-none mb-1">{branches.length}</h3>
            <p className="text-[11px] font-semibold text-[#8896AB]">Across all locations</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-[#E8ECF4] shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#E5F5ED] text-[#00A254] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#8896AB] mb-0.5">Active Branches</p>
            <h3 className="text-2xl font-black text-[#1a1f36] leading-none mb-1">{branches.filter(b => b.is_active).length}</h3>
            <p className="text-[11px] font-semibold text-[#8896AB]">{Math.round((branches.filter(b => b.is_active).length / (branches.length || 1)) * 100)}% of total</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8ECF4] shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF0F2] text-[#FF3B5C] flex items-center justify-center shrink-0">
            <PauseCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#8896AB] mb-0.5">Inactive Branches</p>
            <h3 className="text-2xl font-black text-[#1a1f36] leading-none mb-1">{branches.filter(b => !b.is_active).length}</h3>
            <p className="text-[11px] font-semibold text-[#8896AB]">{Math.round((branches.filter(b => !b.is_active).length / (branches.length || 1)) * 100)}% of total</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8ECF4] shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#F4EDFF] text-[#843BFF] flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#8896AB] mb-0.5">Total Cities</p>
            <h3 className="text-2xl font-black text-[#1a1f36] leading-none mb-1">{uniqueCities.length}</h3>
            <p className="text-[11px] font-semibold text-[#8896AB]">Across all branches</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="p-0 overflow-hidden border border-border/50 shadow-soft bg-white flex flex-col min-h-[600px]">

          {/* Filter Bar */}
          <div className="bg-white border-b border-[#E8ECF4] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Search */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896AB] group-focus-within:text-[#FF6B00] transition-colors" />
              <input
                type="text"
                placeholder="Search branches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E8ECF4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all hover:bg-white focus:bg-white placeholder:text-[#8896AB]"
              />
            </div>

            {/* Right: Dropdowns */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-full md:w-40">
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

              <div className="w-full md:w-40">
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
                  {searchQuery.length > 0 ? `No branches found matching"${searchQuery}"` : 'No branches found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl border border-border/50 shadow-sm">
                <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E8ECF4]">
                      <th className="px-6 py-4 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Branch Code</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Branch Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Manager</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginatedData.map((branch, i) => {
                      const manager = employees.find(emp => 
                        (emp.branchCode === branch.id || emp.branchCode === branch.code || emp.branch === branch.name) && 
                        emp.role === 'Branch Manager'
                      );
                      
                      return (
                      <motion.tr
                        key={branch.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#1a1f36] text-[15px]">
                            {branch.code || `BR-${String(i + 1).padStart(3, '0')}`}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-[#1a1f36] text-[15px]">
                            {branch.name}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-[#1a1f36]">
                            {branch.city}, Karnataka
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1a1f36] text-sm">
                              {manager ? `${manager.firstName} ${manager.lastName}` : (branch.owner_name || 'No Manager')}
                            </span>
                            <span className="text-xs font-medium text-[#8896AB] mt-0.5">
                              {manager ? manager.phone : (branch.phone || 'No Phone')}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {branch.is_active ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#E5F5ED] text-[#00A254] text-[11px] font-bold border border-[#00A254]/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#FFF3E8] text-[#FF6B00] text-[11px] font-bold border border-[#FF6B00]/20">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Link
                              to={`/admin/branches/${branch.id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8ECF4] text-[#8896AB] hover:text-[#1a1f36] hover:bg-[#F4F6FA] transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/branches/${branch.id}/edit`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8ECF4] text-[#FF6B00] hover:bg-[#FFF3E8] transition-colors"
                              title="Edit Branch"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            {branch.is_active ? (
                              <button
                                onClick={() => handleDeactivateClick(branch)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8ECF4] text-[#8896AB] hover:text-[#FF3B5C] hover:bg-[#FFF0F2] transition-colors"
                                title="Deactivate Branch"
                              >
                                <AlertOctagon className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(branch.id, true)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8ECF4] text-[#8896AB] hover:text-[#00A254] hover:bg-[#E5F5ED] transition-colors"
                                title="Activate Branch"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {!isLoading && totalPages > 0 && (
            <div className="mt-auto px-4 sm:px-6 py-4 border-t border-[#E8ECF4] flex flex-col items-center justify-center gap-4 bg-white rounded-b-xl">
              <div className="flex items-center justify-center w-full gap-2 sm:gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-[#E8ECF4] hover:bg-[#F4F6FA] text-[#8896AB] hover:text-[#1a1f36] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                      disabled={page === '...'}
                      className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                        page === currentPage
                          ? 'border border-[#FF6B00] text-[#FF6B00] bg-white'
                          : page === '...'
                            ? 'text-[#8896AB] cursor-default border-none bg-transparent'
                            : 'border border-[#E8ECF4] text-[#1a1f36] bg-white hover:bg-[#F4F6FA]'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-[#E8ECF4] hover:bg-[#F4F6FA] text-[#8896AB] hover:text-[#1a1f36] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-[#8896AB] font-semibold">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} branches
              </p>
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

