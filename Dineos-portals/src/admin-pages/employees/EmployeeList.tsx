import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, AlertOctagon, CheckCircle, User as UserIcon, Store, Eye, UsersRound, Mail, ChevronLeft, ChevronRight, FileX, Filter } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Tooltip from '../../components/common/Tooltip';
import DeactivateEmployeeModal from './components/DeactivateEmployeeModal';
import ActivateEmployeeModal from './components/ActivateEmployeeModal';

import { useEmployees, Employee } from '../../hooks/useEmployees';
import { useAuth } from '../../hooks/useAuth';
import { ref, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useBranches } from '../../hooks/useBranches';
import toast from 'react-hot-toast';

export default function EmployeeList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees, loading: isLoading } = useEmployees();
  const { branches } = useBranches();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [roleFilter, setRoleFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal states
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Computed filtered data
  const filteredData = useMemo(() => {
    let result = employees;

    if (searchQuery.length > 0) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(lowerQuery) ||
          e.email.toLowerCase().includes(lowerQuery) ||
          e.id.toLowerCase().includes(lowerQuery)
      );
    }

    if (roleFilter !== 'All') {
      result = result.filter((e) => e.role === roleFilter);
    }

    if (branchFilter !== 'All') {
      result = result.filter((e) => {
        return e.branch === branchFilter || e.branchCode === branchFilter;
      });
    }

    return result;
  }, [employees, searchQuery, roleFilter, branchFilter]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, branchFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const handleDeactivateClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (selectedEmployee && user) {
      try {
        const employeeRef = ref(rtdb, `employee/${user.uid}/${selectedEmployee.branchCode}/${selectedEmployee.id}`);
        await update(employeeRef, {
          status: 'Inactive',
          updated_at: new Date().toISOString()
        });
        setDeactivateModalOpen(false);
        toast.success('Employee deactivated successfully.');
      } catch (error) {
        console.error('Error deactivating employee:', error);
        toast.error('Failed to deactivate employee.');
      }
    }
  };

  const handleActivateClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setActivateModalOpen(true);
  };

  const handleConfirmActivate = async () => {
    if (selectedEmployee && user) {
      try {
        const employeeRef = ref(rtdb, `employee/${user.uid}/${selectedEmployee.branchCode}/${selectedEmployee.id}`);
        await update(employeeRef, {
          status: 'Active',
          updated_at: new Date().toISOString()
        });
        setActivateModalOpen(false);
        toast.success('Employee activated successfully.');
      } catch (error) {
        console.error('Error activating employee:', error);
        toast.error('Failed to activate employee.');
      }
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

  const handleRowClick = (employee: Employee) => {
    navigate(`/admin/employees/${employee.id}`);
  };

  // ── Empty State ──────────────────────────────────────────────────
  if (!isLoading && employees.length === 0) {
    return (
      <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">


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
              <UsersRound className="w-12 h-12 text-brand-orange-500 relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy mb-2">No Employees Found</h2>
            <p className="text-text-secondary max-w-md mx-auto mb-8">
              You haven't added any staff members yet. Add your first employee to start managing your team, assigning roles, and tracking branch operations.
            </p>
            <Link to="/admin/employees/new">
              <Button className="font-bold py-3 px-8 shadow-premium text-base">
                <Plus className="w-5 h-5 mr-2 inline" />
                Add First Employee
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
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">Employees</h1>
          <p className="text-text-secondary mt-1 text-sm font-medium">Manage your restaurant staff, roles, and access.</p>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="p-0 overflow-hidden border border-border/50 shadow-soft bg-white flex flex-col min-h-[600px]">

          {/* Filter Bar (Sticky) */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-border p-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-2">
            
            {/* Top Row: Search & Mobile Filter Toggle & Add Button */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by Name/Email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 transition-all shadow-sm hover:bg-white focus:bg-white placeholder:text-text-secondary/60"
                />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className={`md:hidden p-2.5 border rounded-xl transition-all shadow-sm shrink-0 ${isMobileFilterOpen ? 'bg-brand-orange-50 border-brand-orange-200 text-brand-orange-600' : 'bg-gray-50 border-border text-text-secondary hover:text-brand-orange-600 hover:border-brand-orange-500'}`}
              >
                <Filter className="w-5 h-5" />
              </button>

              {/* Add Employee Button (Icon on mobile, text on desktop) */}
              <Link to="/admin/employees/new" className="shrink-0">
                <Button className="md:px-4 px-2.5 gap-2 shadow-sm font-bold bg-brand-orange-500 text-white border-0 hover:bg-brand-orange-600">
                  <Plus className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Add Employee</span>
                </Button>
              </Link>
            </div>

            {/* Filters Card */}
            <div className={`md:flex ${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col md:flex-row items-center gap-3 w-full md:w-auto bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl border border-border md:border-none shadow-sm md:shadow-none mt-2 md:mt-0`}>
              <div className="w-full md:w-[180px]">
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Roles' },
                    { value: 'Branch Manager', label: 'Branch Manager' },
                    { value: 'Delivery Partner', label: 'Delivery Partner' }
                  ]}
                />
              </div>

              <div className="w-full md:w-[220px]">
                <Select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Branches' },
                    ...branches.map((b) => ({ value: b.code || '', label: b.name }))
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Employee Records List */}
          <div className="flex-1 flex flex-col relative bg-gray-50/30 p-4 sm:p-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse border border-border/50"></div>
              ))
            ) : paginatedData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-secondary py-12">
                <FileX className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium text-lg">
                  {searchQuery.length > 0 ? `No employees found matching"${searchQuery}"` : 'No employees found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl border border-border/50 shadow-sm">
                <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-border/50">
                      <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                      <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                      <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {paginatedData.map((employee, i) => {
                      const branchName = branches.find(b => b.code === employee.branch)?.name || employee.branch;
                      return (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-brand-orange-50 text-brand-orange-500 flex items-center justify-center shrink-0 border border-brand-orange-100/50">
                                <UserIcon className="w-6 h-6" />
                              </div>
                              <Tooltip content={`${employee.firstName} ${employee.lastName}`} position="top">
                                <span
                                  className="font-bold text-brand-navy text-lg truncate max-w-[200px]"
                                >
                                  {employee.firstName} {employee.lastName}
                                </span>
                              </Tooltip>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                              <UsersRound className="w-4 h-4" />
                              {employee.role}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                              <Store className="w-4 h-4" />
                              {branchName}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <Badge variant={employee.status === 'Active' ? 'success' : 'error'} className="font-black px-2.5 py-1 shadow-sm uppercase tracking-widest text-[10px]">
                              {employee.status}
                            </Badge>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              {employee.status !== 'Inactive' ? (
                                <>
                                  <Link
                                    to={`/admin/employees/${employee.id}`}
                                    className="p-2 text-text-secondary hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-all"
                                    title="View Employee"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    to={`/admin/employees/${employee.id}/edit`}
                                    className="p-2 text-text-secondary hover:text-brand-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                    title="Edit Employee"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Link>
                                </>
                              ) : (
                                <>
                                  <span className="p-2 text-gray-300 cursor-not-allowed rounded-lg" title="View Blocked (Inactive)">
                                    <Eye className="w-4 h-4" />
                                  </span>
                                  <span className="p-2 text-gray-300 cursor-not-allowed rounded-lg" title="Edit Blocked (Inactive)">
                                    <Edit2 className="w-4 h-4" />
                                  </span>
                                </>
                              )}

                              {employee.status === 'Active' ? (
                                <button
                                  onClick={() => handleDeactivateClick(employee)}
                                  className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Deactivate Employee"
                                >
                                  <AlertOctagon className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateClick(employee)}
                                  className="p-2 text-text-secondary hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                  title="Activate Employee"
                                >
                                  <CheckCircle className="w-4 h-4" />
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
            <div className="mt-auto px-4 sm:px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 rounded-b-xl">
              <p className="hidden sm:block text-sm text-text-secondary font-medium">
                Showing page <span className="font-bold text-brand-navy">{currentPage}</span> of <span className="font-bold text-brand-navy">{totalPages}</span>
              </p>

              <div className="flex items-center justify-center w-full sm:w-auto gap-2 sm:gap-3 mx-auto sm:mx-0">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-border hover:bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange-500" />
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {getPageNumbers().map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                      disabled={page === '...'}
                      className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 flex items-center justify-center rounded-lg text-sm sm:text-base font-bold transition-all ${
                        page === currentPage
                          ? 'bg-gradient-to-br from-brand-orange-400 to-brand-orange-600 text-white shadow-md border-none shadow-brand-orange-500/20'
                          : page === '...'
                            ? 'text-text-secondary cursor-default border-none bg-transparent'
                            : 'bg-transparent border border-border text-text-secondary hover:text-brand-navy hover:bg-white shadow-sm'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-border hover:bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 bg-transparent"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange-500" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modals */}
      <DeactivateEmployeeModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmDeactivate}
        employeeName={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ''}
      />
      <ActivateEmployeeModal
        isOpen={activateModalOpen}
        onClose={() => setActivateModalOpen(false)}
        onConfirm={handleConfirmActivate}
        employeeName={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : ''}
      />
    </div>
  );
}
