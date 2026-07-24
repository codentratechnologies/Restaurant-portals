import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, AlertOctagon, CheckCircle, User as UserIcon, Store, Eye, UsersRound, Mail, ChevronLeft, ChevronRight, FileX, Filter, Phone, LayoutGrid, UserCheck, UserX, Shield, MoreVertical } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Modal states
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Extract unique roles from employees
  const uniqueRoles = useMemo(() => {
    const roles = new Set(employees.map(e => e.role).filter(Boolean));
    return Array.from(roles).sort();
  }, [employees]);

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

    if (statusFilter !== 'All') {
      result = result.filter((e) => e.status === statusFilter);
    }

    return result;
  }, [employees, searchQuery, roleFilter, branchFilter, statusFilter]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, branchFilter, statusFilter]);

  // Derived Stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const inactiveEmployees = employees.filter(e => e.status === 'Inactive').length;
  const rolesCount = new Set(employees.map(e => e.role)).size;

  const activePercent = totalEmployees ? ((activeEmployees / totalEmployees) * 100).toFixed(2) : 0;
  const inactivePercent = totalEmployees ? ((inactiveEmployees / totalEmployees) * 100).toFixed(2) : 0;

  const getRoleBadgeStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('manager')) return 'bg-orange-100 text-orange-600';
    if (r.includes('cashier')) return 'bg-purple-100 text-purple-600';
    if (r.includes('chef') || r.includes('cook')) return 'bg-yellow-100 text-yellow-600';
    if (r.includes('waiter') || r.includes('service')) return 'bg-blue-100 text-blue-600';
    if (r.includes('delivery')) return 'bg-green-100 text-green-600';
    if (r.includes('supervisor')) return 'bg-pink-100 text-pink-600';
    return 'bg-gray-100 text-gray-600';
  };

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
      <div className="flex flex-row items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a1f36] tracking-tight">Employees</h1>
          <p className="text-sm font-medium text-[#8896AB] mt-1">Manage staff accounts and permissions across branches.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Link to="/admin/employees/new">
              <Button className="flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E66000] text-white w-10 h-10 p-0 sm:w-auto sm:h-auto sm:px-6 sm:py-2.5 border-0 rounded-lg shadow-sm font-bold">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Employee</span>
              </Button>
            </Link>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Employees */}
        <Card className="p-3.5 sm:p-5 border border-[#E8ECF4] shadow-sm bg-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:shadow-md transition-shadow">
          <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-[10px] sm:rounded-full bg-[#FFF3E8] flex items-center justify-center shrink-0">
            <UsersRound className="w-4 h-4 sm:w-6 sm:h-6 text-[#FF6B00]" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#1a1f36] mb-1 sm:mb-1 line-clamp-1">Total Employees</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1f36] leading-none mb-1">{totalEmployees}</h3>
            <p className="hidden sm:block text-[10px] font-semibold text-[#8896AB]">Across all branches</p>
          </div>
        </Card>

        {/* Active Employees */}
        <Card className="p-3.5 sm:p-5 border border-[#E8ECF4] shadow-sm bg-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:shadow-md transition-shadow">
          <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-[10px] sm:rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#1a1f36] mb-1 sm:mb-1 line-clamp-1">Active</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1f36] leading-none mb-1">{activeEmployees}</h3>
            <p className="hidden sm:block text-[10px] font-bold text-green-600">{activePercent}% <span className="text-[#8896AB] font-semibold">of total</span></p>
          </div>
        </Card>

        {/* Inactive Employees */}
        <Card className="p-3.5 sm:p-5 border border-[#E8ECF4] shadow-sm bg-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:shadow-md transition-shadow">
          <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-[10px] sm:rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4 sm:w-6 sm:h-6 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#1a1f36] mb-1 sm:mb-1 line-clamp-1">Inactive</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1f36] leading-none mb-1">{inactiveEmployees}</h3>
            <p className="hidden sm:block text-[10px] font-semibold text-[#8896AB]">{inactivePercent}% of total</p>
          </div>
        </Card>

        {/* Roles */}
        <Card className="p-3.5 sm:p-5 border border-[#E8ECF4] shadow-sm bg-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:shadow-md transition-shadow">
          <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-[10px] sm:rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-[#1a1f36] mb-1 sm:mb-1 line-clamp-1">Roles</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1f36] leading-none mb-1">{rolesCount}</h3>
            <p className="hidden sm:block text-[10px] font-semibold text-[#8896AB]">Across all employees</p>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="p-0 overflow-hidden border border-border/50 shadow-soft bg-white flex flex-col min-h-[600px]">

          {/* Filter Bar */}
          <div className="bg-white border-b border-[#E8ECF4] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Top Row: Search & Mobile Filter Toggle */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 md:w-[400px] group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896AB] group-focus-within:text-[#FF6B00] transition-colors" />
                <input
                  type="text"
                  placeholder="Search employees by name, email or phone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E8ECF4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all hover:bg-white focus:bg-white placeholder:text-[#8896AB]"
                />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className={`md:hidden p-2 border rounded-xl transition-all shadow-sm shrink-0 ${isMobileFilterOpen ? 'bg-orange-50 border-orange-200 text-[#FF6B00]' : 'bg-[#F8FAFC] border-[#E8ECF4] text-[#8896AB] hover:text-[#FF6B00] hover:border-[#FF6B00]'}`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Dropdowns */}
            <div className={`md:flex ${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col md:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0`}>
              <div className="w-full md:w-40">
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Roles' },
                    ...uniqueRoles.map((role) => ({ value: role, label: role }))
                  ]}
                  className="bg-[#F8FAFC] border-[#E8ECF4] h-[38px] text-sm font-bold w-full"
                />
              </div>

              <div className="w-full md:w-48">
                <Select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Branches' },
                    ...branches.map((b) => ({ value: b.code || '', label: b.name }))
                  ]}
                  className="bg-[#F8FAFC] border-[#E8ECF4] h-[38px] text-sm font-bold w-full"
                />
              </div>

              <div className="w-full md:w-40">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Status' },
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                  className="bg-[#F8FAFC] border-[#E8ECF4] h-[38px] text-sm font-bold w-full"
                />
              </div>


            </div>
          </div>

          {/* Employee Records List */}
          <div className="flex-1 flex flex-col relative bg-white space-y-4 rounded-b-2xl">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse border border-[#E8ECF4]"></div>
                ))}
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-secondary py-12">
                <FileX className="w-12 h-12 mb-4 opacity-50 text-[#8896AB]" />
                <p className="font-semibold text-[#1a1f36]">
                  {searchQuery.length > 0 ? `No employees found matching "${searchQuery}"` : 'No employees found.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px] whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#E8ECF4]">
                      <th className="px-6 py-4 text-[11px] font-black text-[#8896AB] uppercase tracking-wider">EmpID</th>
                      <th className="px-6 py-4 text-[11px] font-black text-[#8896AB] uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-[11px] font-black text-[#8896AB] uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-[11px] font-black text-[#8896AB] uppercase tracking-wider">Branch Name</th>
                      <th className="px-6 py-4 text-[11px] font-black text-[#8896AB] uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-[11px] font-black text-[#8896AB] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[11px] font-black text-[#8896AB] uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8ECF4]">
                    {paginatedData.map((employee, i) => {
                      const branchName = branches.find(b => b.code === employee.branchCode || b.code === employee.branch)?.name || employee.branch;
                      const empCode = employee.empId || employee.employeeCode || employee.id.substring(1, 8).toUpperCase();
                      return (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          className="hover:bg-[#F8FAFC] transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="text-[#8896AB] text-sm font-bold">{empCode}</span>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-bold text-[#1a1f36] text-sm">{employee.firstName} {employee.lastName}</p>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-black ${getRoleBadgeStyle(employee.role)}`}>
                              {employee.role}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <p className="font-bold text-[#1a1f36] text-sm">{branchName}</p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8896AB]">
                                <Phone className="w-3.5 h-3.5" />
                                {employee.phone || '+91 98765 43210'}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8896AB]">
                                <Mail className="w-3.5 h-3.5" />
                                {employee.email}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {employee.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Link
                                to={`/admin/employees/${employee.id}`}
                                className="p-2 border border-[#E8ECF4] rounded-lg hover:bg-gray-50 transition-colors text-[#8896AB]"
                                title="View Employee"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/admin/employees/${employee.id}/edit`}
                                className="p-2 border border-[#E8ECF4] rounded-lg hover:bg-orange-50 hover:border-orange-200 hover:text-[#FF6B00] transition-colors text-[#8896AB]"
                                title="Edit Employee"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  employee.status === 'Active' ? handleDeactivateClick(employee) : handleActivateClick(employee);
                                }}
                                className={`p-2 border border-[#E8ECF4] rounded-lg transition-colors text-[#8896AB] ${employee.status === 'Active' ? 'hover:bg-red-50 hover:border-red-200 hover:text-red-500' : 'hover:bg-green-50 hover:border-green-200 hover:text-green-500'}`}
                                title={employee.status === 'Active' ? 'Deactivate Employee' : 'Activate Employee'}
                              >
                                {employee.status === 'Active' ? <AlertOctagon className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
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
          {/* Pagination Footer */}
          {!isLoading && totalPages > 0 && (
            <div className="mt-auto px-4 sm:px-6 py-4 border-t border-[#E8ECF4] flex flex-col items-center justify-center gap-4 bg-white rounded-b-2xl">
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
                      className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${page === currentPage
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} employees
              </p>
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
