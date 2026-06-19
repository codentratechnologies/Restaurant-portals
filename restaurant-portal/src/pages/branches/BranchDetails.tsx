import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2, AlertOctagon, Phone, Mail, MapPin, Clock, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table, { Column } from '../../components/common/Table';

import DeactivateBranchModal from './components/DeactivateBranchModal';
import AssignMenuStep from './components/AssignMenuStep';

const TABS = [
 { id: 'info', label: 'Branch Information' },
 { id: 'menu', label: 'Assigned Menu' },
 { id: 'employees', label: 'Employees' },
];

export default function BranchDetails() {
 const navigate = useNavigate();
 const { id } = useParams();
 const [searchParams, setSearchParams] = useSearchParams();
 const activeTab = searchParams.get('tab') || 'info';

 const [isDeactivateModalOpen, setDeactivateModalOpen] = useState(false);

 const handleTabChange = (tabId: string) => {
 setSearchParams({ tab: tabId });
 };

 // Mock Data
 const branchInfo = {
 code: 'B001',
 name: 'MG Road Branch',
 status: 'Active',
 email: 'mgroad@example.com',
 phone: '9876543210',
 address: '123 MG Road, New York, NY 100001',
 openTime: '09:00 AM',
 closeTime: '10:00 PM',
 createdBy: 'Admin User',
 createdAt: '2023-10-01 10:30 AM',
 editedBy: 'Super Admin',
 editedAt: '2023-10-05 02:15 PM'
 };

 const selectedMenuIds = new Set(['f1', 'f3']); // Mock selected menu IDs

 const ALL_EMPLOYEES = [
 { id: '1', empId: 'EMP-101', name: 'John Doe', role: 'Branch Manager', status: 'Active' },
 { id: '2', empId: 'EMP-102', name: 'Jane Smith', role: 'Chef', status: 'Active' },
 { id: '3', empId: 'EMP-103', name: 'Mark Wood', role: 'Waiter', status: 'Inactive' },
 { id: '4', empId: 'EMP-104', name: 'Alice Johnson', role: 'Waiter', status: 'Active' },
 { id: '5', empId: 'EMP-105', name: 'Bob Brown', role: 'Chef', status: 'Active' },
 { id: '6', empId: 'EMP-106', name: 'Charlie Davis', role: 'Branch Manager', status: 'Inactive' },
 { id: '7', empId: 'EMP-107', name: 'Diana Evans', role: 'Waiter', status: 'Active' },
 { id: '8', empId: 'EMP-108', name: 'Evan Foster', role: 'Chef', status: 'Active' },
 { id: '9', empId: 'EMP-109', name: 'Fiona Green', role: 'Waiter', status: 'Active' },
 ];

 // Employee Tab State
 const [empSearchQuery, setEmpSearchQuery] = useState('');
 const [empRoleFilter, setEmpRoleFilter] = useState('All');
 const [empStatusFilter, setEmpStatusFilter] = useState('All');
 const [empCurrentPage, setEmpCurrentPage] = useState(1);
 const EMP_ITEMS_PER_PAGE = 5;

 const filteredEmployees = useMemo(() => {
 let result = ALL_EMPLOYEES;
 if (empSearchQuery.length >= 2) {
 const q = empSearchQuery.toLowerCase();
 result = result.filter(e => e.name.toLowerCase().includes(q) || e.empId.toLowerCase().includes(q));
 }
 if (empRoleFilter !== 'All') {
 result = result.filter(e => e.role === empRoleFilter);
 }
 if (empStatusFilter !== 'All') {
 result = result.filter(e => e.status === empStatusFilter);
 }
 return result;
 }, [empSearchQuery, empRoleFilter, empStatusFilter]);

 useEffect(() => {
 setEmpCurrentPage(1);
 }, [empSearchQuery, empRoleFilter, empStatusFilter]);

 const empTotalPages = Math.max(1, Math.ceil(filteredEmployees.length / EMP_ITEMS_PER_PAGE));

 const paginatedEmployees = useMemo(() => {
 const start = (empCurrentPage - 1) * EMP_ITEMS_PER_PAGE;
 return filteredEmployees.slice(start, start + EMP_ITEMS_PER_PAGE);
 }, [filteredEmployees, empCurrentPage]);

 return (
 <div className="space-y-6">

 {/* ZONE 1: Persistent Header Card */}
 <div className="sticky top-0 z-20 -mx-4 px-4 sm:mx-0 sm:px-0">
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
 <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <button onClick={() => navigate(-1)} type="button" className="p-2 hover:bg-white rounded-full transition-colors shrink-0 shadow-sm border border-border bg-gray-50">
 <ArrowLeft className="w-5 h-5 text-text-secondary" />
 </button>
 <div>
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">{branchInfo.name}</h1>
 <Badge variant={branchInfo.status === 'Active' ? 'success' : 'error'} className="font-bold">
 {branchInfo.status}
 </Badge>
 </div>
 <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
 <span className="font-mono bg-gray-100 border border-border px-1.5 py-0.5 rounded text-brand-navy font-bold">{branchInfo.code}</span>
 <span>•</span>
 <span>{branchInfo.email}</span>
 </div>
 </div>
 </div>


 </Card>
 </motion.div>
 </div>

 {/* ZONE 2: Tab Navigation */}
 <div className="px-2">
 <div className="flex gap-6 border-b border-border">
 {TABS.map((tab) => (
 <button
 key={tab.id}
 onClick={() => handleTabChange(tab.id)}
 className={`relative pb-3 text-sm font-bold transition-colors ${activeTab === tab.id ? 'text-brand-orange-600' : 'text-text-secondary hover:text-brand-navy'
 }`}
 >
 <div className="flex items-center gap-2">
 {tab.label}
 {tab.count !== undefined && (
 <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-orange-100 text-brand-orange-700' : 'bg-gray-100 text-text-secondary'
 }`}>
 {tab.count}
 </span>
 )}
 </div>
 {activeTab === tab.id && (
 <motion.div
 layoutId="activeTabIndicator"
 className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange-500 rounded-t-full"
 transition={{ type:"spring", stiffness: 500, damping: 30 }}
 />
 )}
 </button>
 ))}
 </div>
 </div>

 {/* TAB CONTENT */}
 <AnimatePresence mode="wait">
 {/* TAB 1: Branch Information */}
 {activeTab === 'info' && (
 <motion.div
 key="info"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 className="space-y-6"
 >
 <Card className="p-8 border border-border/50 shadow-soft">
 <h3 className="text-lg font-black text-brand-navy mb-6">General Details</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Branch Code</p>
 <p className="font-mono font-bold text-brand-navy">{branchInfo.code}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Contact Phone</p>
 <p className="font-medium text-brand-navy flex items-center gap-2"><Phone className="w-4 h-4 text-brand-orange-500" /> {branchInfo.phone}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Email Address</p>
 <p className="font-medium text-brand-navy flex items-center gap-2"><Mail className="w-4 h-4 text-brand-orange-500" /> {branchInfo.email}</p>
 </div>
 <div className="space-y-1 lg:col-span-2">
 <p className="text-sm font-bold text-text-secondary">Full Address</p>
 <p className="font-medium text-brand-navy flex items-start gap-2"><MapPin className="w-4 h-4 text-brand-orange-500 mt-0.5 shrink-0" /> {branchInfo.address}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Operating Hours</p>
 <p className="font-medium text-brand-navy flex items-center gap-2"><Clock className="w-4 h-4 text-brand-orange-500" /> {branchInfo.openTime} - {branchInfo.closeTime}</p>
 </div>
 </div>
 </Card>

 <Card className="p-8 border border-border/50 shadow-soft bg-gray-50/50">
 <h3 className="text-sm font-black text-text-secondary uppercase tracking-widest mb-6">Audit Trail</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Created By</p>
 <p className="font-medium text-brand-navy">{branchInfo.createdBy} <span className="text-text-secondary text-sm ml-2">({branchInfo.createdAt})</span></p>
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Last Edited By</p>
 <p className="font-medium text-brand-navy">{branchInfo.editedBy} <span className="text-text-secondary text-sm ml-2">({branchInfo.editedAt})</span></p>
 </div>
 </div>
 </Card>
 </motion.div>
 )}

 {/* TAB 2: Assigned Menu */}
 {activeTab === 'menu' && (
 <motion.div
 key="menu"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 >
 <Card className="p-0 overflow-hidden border border-border/50 shadow-soft flex flex-col">
 <div className="bg-white rounded-xl">
 <AssignMenuStep
 selectedIds={selectedMenuIds}
 onChange={() => { }}
 readOnly={true}
 />
 </div>
 </Card>
 </motion.div>
 )}

 {/* TAB 3: Employees */}
 {activeTab === 'employees' && (
 <motion.div
 key="employees"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.3 }}
 >
 <Card className="p-0 overflow-hidden border border-border/50 shadow-soft flex flex-col min-h-[400px]">
 <div className="p-4 border-b border-border bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
 <div className="flex items-center gap-3 w-full sm:w-auto">
 <h3 className="text-lg font-black text-brand-navy">Branch Employees</h3>
 </div>

 <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
 <div className="relative w-full sm:w-64">
 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
 <input
 type="text"
 placeholder="Search employees..."
 value={empSearchQuery}
 onChange={e => setEmpSearchQuery(e.target.value)}
 className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 shadow-sm"
 />
 </div>
 <select
 value={empRoleFilter}
 onChange={e => setEmpRoleFilter(e.target.value)}
 className="border border-border rounded-lg px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 shadow-sm"
 >
 <option value="All">All Roles</option>
 <option value="Branch Manager">Branch Manager</option>
 <option value="Chef">Chef</option>
 <option value="Waiter">Waiter</option>
 </select>
 <select
 value={empStatusFilter}
 onChange={e => setEmpStatusFilter(e.target.value)}
 className="border border-border rounded-lg px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 shadow-sm"
 >
 <option value="All">All Statuses</option>
 <option value="Active">Active</option>
 <option value="Inactive">Inactive</option>
 </select>
 </div>
 </div>
 <div className="flex-1 bg-white flex flex-col">
 <Table
 columns={[
 { header: 'Employee ID', accessor: 'empId', className: 'font-mono text-brand-navy' },
 { header: 'Full Name', accessor: 'name', className: 'font-bold' },
 { header: 'Role', accessor: 'role', className: 'text-text-secondary font-medium' },
 {
 header: 'Status',
 cell: (item) => (
 <Badge variant={item.status === 'Active' ? 'success' : 'error'} className="font-bold px-2 py-0.5">
 {item.status}
 </Badge>
 )
 },
 {
 header: 'Action',
 cell: (item) => (
 <Link to={`/employees/${item.id}`} className="p-1.5 text-text-secondary hover:text-brand-orange-500 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-bold inline-flex">
 <Eye className="w-4 h-4" /> View
 </Link>
 ),
 className: 'w-24',
 }
 ]}
 data={paginatedEmployees}
 currentPage={empCurrentPage}
 totalPages={empTotalPages}
 onPageChange={setEmpCurrentPage}
 />
 </div>
 </Card>
 </motion.div>
 )}
 </AnimatePresence>

 <DeactivateBranchModal
 isOpen={isDeactivateModalOpen}
 onClose={() => setDeactivateModalOpen(false)}
 branchName={branchInfo.name}
 />
 </div>
 );
}

