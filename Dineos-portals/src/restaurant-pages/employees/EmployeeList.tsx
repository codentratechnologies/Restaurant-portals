import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, AlertOctagon, CheckCircle, User, Store, Eye, Filter } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table, { Column } from '../../components/common/Table';
import DeactivateEmployeeModal from './components/DeactivateEmployeeModal';
import ActivateEmployeeModal from './components/ActivateEmployeeModal';

interface Employee {
 id: string;
 empId: string;
 name: string;
 email: string;
 role: 'Branch Manager' | 'Delivery Partner';
 branch: string;
 status: 'Active' | 'Inactive';
}

const initialMockEmployees: Employee[] = [
 { id: '1', empId: 'E101', name: 'John Doe', email: 'john.doe@example.com', role: 'Branch Manager', branch: 'Downtown Main (B001)', status: 'Active' },
 { id: '3', empId: 'E103', name: 'Mark Wood', email: 'mark.w@example.com', role: 'Delivery Partner', branch: 'Westside Plaza (B002)', status: 'Inactive' },
 { id: '4', empId: 'E104', name: 'Alice Cooper', email: 'alice.c@example.com', role: 'Branch Manager', branch: 'North Mall Kiosk (B003)', status: 'Active' },
];

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>(initialMockEmployees);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
 const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
 
 const [roleFilter, setRoleFilter] = useState('All');
 const [branchFilter, setBranchFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const isLoading = false;
 
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
 e.name.toLowerCase().includes(lowerQuery) || 
 e.email.toLowerCase().includes(lowerQuery) ||
 e.empId.toLowerCase().includes(lowerQuery)
 );
 }
 
 if (roleFilter !== 'All') {
 result = result.filter((e) => e.role === roleFilter);
 }
 
 if (branchFilter !== 'All') {
 // In a real app, branch filter might use an ID, here we do simple text match
 result = result.filter((e) => e.branch.includes(branchFilter));
 }
 
 return result;
 }, [employees, searchQuery, roleFilter, branchFilter]);

 const handleDeactivateClick = (employee: Employee) => {
 setSelectedEmployee(employee);
 setDeactivateModalOpen(true);
 };

 const handleConfirmDeactivate = async () => {
 if (selectedEmployee) {
 // Optimistic UI update
 setEmployees(prev => prev.map(e => e.id === selectedEmployee.id ? { ...e, status: 'Inactive' } : e));
 }
 };

 const handleActivateClick = (employee: Employee) => {
 setSelectedEmployee(employee);
 setActivateModalOpen(true);
 };

 const handleConfirmActivate = async () => {
 if (selectedEmployee) {
 // Optimistic UI update
 setEmployees(prev => prev.map(e => e.id === selectedEmployee.id ? { ...e, status: 'Active' } : e));
 setActivateModalOpen(false);
 }
 };

 const columns: Column<Employee>[] = [
 {
 header: 'Employee ID',
 accessor: 'empId',
 className: 'font-mono text-brand-navy font-bold',
 },
 {
 header: 'Employee Name',
 cell: (item) => (
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-border shadow-sm">
 <User className="w-5 h-5 text-text-secondary" />
 </div>
 <div>
 <p className="font-bold text-brand-navy">{item.name}</p>
 <p className="text-xs text-text-secondary mt-0.5">{item.email}</p>
 </div>
 </div>
 ),
 },
 {
 header: 'Role',
 cell: (item) => (
 <span className="font-medium text-text-secondary bg-gray-100 px-2 py-1 rounded-md text-sm border border-border">
 {item.role}
 </span>
 ),
 },
 {
 header: 'Assigned Branch',
 cell: (item) => (
 <div className="flex items-center gap-1.5 text-text-secondary font-medium text-sm">
 <Store className="w-4 h-4 shrink-0 text-brand-orange-500" />
 <span className="truncate max-w-[200px]">{item.branch}</span>
 </div>
 ),
 },
 {
 header: 'Status',
 cell: (item) => (
 <Badge variant={item.status === 'Active' ? 'success' : 'error'} className="font-bold px-3 py-1 shadow-sm">
 {item.status}
 </Badge>
 ),
 },
 {
 header: 'Action',
 cell: (item) => (
 <div className="flex items-center justify-start gap-1.5" onClick={(e) => e.stopPropagation()}>
 <Link to={`/restaurant/employees/${item.id}`} className="p-2 text-text-secondary hover:text-brand-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="View Employee">
 <Eye className="w-4 h-4" />
 </Link>
 <Link to={`/restaurant/employees/${item.id}/edit`} className="p-2 text-text-secondary hover:text-brand-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
 <Edit2 className="w-4 h-4" />
 </Link>
 {item.status === 'Active' && (
 <button 
 onClick={() => handleDeactivateClick(item)}
 className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
 title="Deactivate Employee"
 >
 <AlertOctagon className="w-4 h-4" />
 </button>
 )}
 {item.status === 'Inactive' && (
 <button 
 onClick={() => handleActivateClick(item)}
 className="p-2 text-text-secondary hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
 title="Activate Employee"
 >
 <CheckCircle className="w-4 h-4" />
 </button>
 )}
 </div>
 ),
 
 }
 ];

 return (
 <div className="space-y-6">
 {/* Top Section */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
 <h1 className="text-3xl font-black text-brand-navy tracking-tight">Employees</h1>
 <p className="text-text-secondary mt-1 text-sm font-medium">Manage all staff members, operational roles, and branch assignments.</p>
 </motion.div>
 
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
 <Link to="/restaurant/employees/new">
 <Button className="gap-2 shadow-sm font-bold">
 <Plus className="w-5 h-5" />
 Add Employee
 </Button>
 </Link>
 </motion.div>
 </div>

 {/* Main Content Area */}
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
 <Card className="p-0 overflow-hidden border border-border/50 shadow-soft bg-white flex flex-col min-h-[600px]">
 
 {/* Filter Bar (Sticky) */}
 <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-border p-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-2">
 
   {/* Top Row: Search & Mobile Filter Toggle */}
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
   </div>

   {/* Filters Card */}
   <div className={`md:flex ${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col md:flex-row items-center gap-3 w-full md:w-auto bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl border border-border md:border-none shadow-sm md:shadow-none mt-2 md:mt-0`}>
     <select 
       value={roleFilter}
       onChange={(e) => setRoleFilter(e.target.value)}
       className="w-full md:w-auto flex-1 md:flex-none appearance-none bg-gray-50/50 hover:bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 cursor-pointer shadow-sm transition-all"
     >
       <option value="All">All Roles</option>
       <option value="Branch Manager">Branch Manager</option>
       <option value="Delivery Partner">Delivery Partner</option>
     </select>

     <select 
       value={branchFilter}
       onChange={(e) => setBranchFilter(e.target.value)}
       className="w-full md:w-auto flex-1 md:flex-none appearance-none bg-gray-50/50 hover:bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 cursor-pointer shadow-sm transition-all"
     >
       <option value="All">All Branches</option>
       <option value="Downtown">Downtown Main</option>
       <option value="Westside">Westside Plaza</option>
       <option value="North Mall">North Mall Kiosk</option>
     </select>
   </div>
 </div>

 {/* Table Area */}
 <div className="flex-1 flex flex-col relative bg-white">
 <Table
 columns={columns}
 data={filteredData}
 isLoading={isLoading}
 emptyStateMessage={
 searchQuery.length > 0 
 ? `No employees found matching"${searchQuery}"` 
 : 'No employees found.'
 }
 currentPage={currentPage}
 totalPages={1}
 onPageChange={setCurrentPage}
 />
 </div>
 </Card>
 </motion.div>

 {/* Modals */}
 <DeactivateEmployeeModal 
 isOpen={deactivateModalOpen} 
 onClose={() => setDeactivateModalOpen(false)} 
 onConfirm={handleConfirmDeactivate}
 employeeName={selectedEmployee?.name || ''} 
 />
 <ActivateEmployeeModal 
 isOpen={activateModalOpen} 
 onClose={() => setActivateModalOpen(false)} 
 onConfirm={handleConfirmActivate}
 employeeName={selectedEmployee?.name || ''} 
 />
 </div>
 );
}


