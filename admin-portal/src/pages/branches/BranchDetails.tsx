import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2, Phone, Mail, MapPin, Clock, Search, Eye, Loader2, Copy, CheckCircle, Store, Users, MenuSquare, ChevronRight, Globe, Calendar, Building2, ExternalLink } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table, { Column } from '../../components/common/Table';
import Select from '../../components/common/Select';

import DeactivateBranchModal from './components/DeactivateBranchModal';
import { useAuth } from '../../hooks/useAuth';
import { ref, onValue, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

const TABS = [
 { id: 'info', label: 'Branch Information' },
 { id: 'employees', label: 'Employees' },
];

export default function BranchDetails() {
 const navigate = useNavigate();
 const { id } = useParams();
 const [searchParams, setSearchParams] = useSearchParams();
 const activeTab = searchParams.get('tab') || 'info';

 const { user } = useAuth();
 const [isDeactivateModalOpen, setDeactivateModalOpen] = useState(false);
 const [branchInfo, setBranchInfo] = useState<any>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [employees, setEmployees] = useState<any[]>([]);
 const [copied, setCopied] = useState(false);

 const handleCopyCode = () => {
 if (branchInfo?.code) {
 navigator.clipboard.writeText(branchInfo.code);
 setCopied(true);
 toast.success('Branch code copied!');
 setTimeout(() => setCopied(false), 2000);
 }
 };

 useEffect(() => {
 if (!user || !id) return;
 const branchRef = ref(rtdb, `branch/${user.uid}/${id}`);
 const unsubscribe = onValue(branchRef, (snapshot) => {
 if (snapshot.exists()) {
 const data = snapshot.val();
 setBranchInfo(data);
 } else {
 navigate('/branches');
 }
 setIsLoading(false);
 });

 return () => {
 unsubscribe();
 };
 }, [user, id, navigate]);

 useEffect(() => {
 if (!user || !branchInfo?.code) return;
 
 const employeesRef = ref(rtdb, `employee/${user.uid}/${branchInfo.code}`);
 const unsubscribeEmployees = onValue(employeesRef, (snapshot) => {
 if (snapshot.exists()) {
 const data = snapshot.val();
 const branchEmployees = Object.keys(data)
 .map(empId => ({
 id: empId,
 ...data[empId]
 }))
 .map(emp => ({
 id: emp.id,
 empId: emp.employeeId || emp.empId || emp.id.substring(0, 8).toUpperCase(),
 name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown',
 role: emp.role || 'Unknown',
 status: emp.status || 'Active'
 }));
 setEmployees(branchEmployees);
 } else {
 setEmployees([]);
 }
 });

 return () => {
 unsubscribeEmployees();
 };
 }, [user, branchInfo?.code]);

 const handleTabChange = (tabId: string) => {
 setSearchParams({ tab: tabId });
 };

 // Employee Tab State
 const [empSearchQuery, setEmpSearchQuery] = useState('');
 const [empRoleFilter, setEmpRoleFilter] = useState('All');
 const [empStatusFilter, setEmpStatusFilter] = useState('All');
 const [empCurrentPage, setEmpCurrentPage] = useState(1);
 const EMP_ITEMS_PER_PAGE = 5;

 const filteredEmployees = useMemo(() => {
 let result = employees;
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
 }, [employees, empSearchQuery, empRoleFilter, empStatusFilter]);

 useEffect(() => {
 setEmpCurrentPage(1);
 }, [empSearchQuery, empRoleFilter, empStatusFilter]);

 const empTotalPages = Math.max(1, Math.ceil(filteredEmployees.length / EMP_ITEMS_PER_PAGE));

 const paginatedEmployees = useMemo(() => {
 const start = (empCurrentPage - 1) * EMP_ITEMS_PER_PAGE;
 return filteredEmployees.slice(start, start + EMP_ITEMS_PER_PAGE);
 }, [filteredEmployees, empCurrentPage]);

 if (isLoading) {
 return (
 <div className="flex justify-center items-center h-[500px]">
 <Loader2 className="w-8 h-8 animate-spin text-brand-orange-500" />
 </div>
 );
 }

 if (!branchInfo) return null;

 return (
 <div className="space-y-6">

 {/* Breadcrumbs & Back */}
 <div className="flex items-center gap-4 mb-4 px-2">
 <Link to="/branches" title="Back to Branches">
 <Button variant="secondary" className="p-2 bg-white shadow-sm border border-border hover:bg-gray-50 transition-colors rounded-xl flex items-center justify-center">
 <ArrowLeft className="w-5 h-5 text-text-secondary" />
 </Button>
 </Link>
 <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
 <Link to="/branches" className="hover:text-brand-orange-600 transition-colors">Branches</Link>
 <ChevronRight className="w-4 h-4" />
 <span className="text-brand-navy font-bold">{branchInfo.name}</span>
 </div>
 </div>

 {/* ZONE 1: Premium Hero Header */}
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative z-10">
 <Card className="p-6 sm:p-8 bg-gradient-to-r from-brand-orange-500/10 via-brand-orange-500/5 to-white border border-brand-orange-500/20 shadow-premium overflow-hidden relative rounded-2xl flex flex-col">
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none"></div>
 
 <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
 <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white border-4 border-white rounded-2xl shadow-md flex items-center justify-center shrink-0 relative overflow-hidden">
 <div className="absolute inset-0 bg-brand-orange-50/50"></div>
 <Store className="w-12 h-12 sm:w-16 sm:h-16 text-brand-orange-500 relative z-10" />
 </div>
 
 <div className="flex-1 space-y-3 text-center sm:text-left mt-2 sm:mt-4">
 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
 <h1 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">{branchInfo.name}</h1>
 <Badge variant={branchInfo.is_active ? 'success' : 'error'} className="font-black px-3 py-1 shadow-sm uppercase tracking-widest text-[11px] rounded-md">
 {branchInfo.is_active ? 'Active' : 'Inactive'}
 </Badge>
 </div>
 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
 <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-brand-orange-500/20 shadow-sm cursor-pointer hover:bg-white transition-colors" onClick={handleCopyCode} title="Copy Branch Code">
 <span className="font-mono font-bold text-xs text-brand-navy">{branchInfo.code}</span>
 {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
 </div>
 <span className="text-text-secondary/50">•</span>
 <div className="text-sm font-bold text-brand-navy flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1 rounded border border-brand-orange-500/20 shadow-sm">
 <MapPin className="w-4 h-4 text-brand-orange-500" /> {branchInfo.city}, {branchInfo.state}
 </div>
 </div>
 </div>
 </div>

 {/* Quick Contact & Address Info Bar */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 bg-white/60 backdrop-blur-md rounded-xl p-4 border border-brand-orange-500/20 shadow-sm relative z-10">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-brand-orange-100 shadow-sm">
 <Phone className="w-4 h-4 text-brand-orange-600" />
 </div>
 <div>
 <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Phone</p>
 <p className="text-sm font-bold text-brand-navy">{branchInfo.phone}</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
 <Mail className="w-4 h-4 text-blue-600" />
 </div>
 <div>
 <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Email</p>
 <div className="group relative">
 <p className="text-sm font-bold text-brand-navy truncate max-w-[150px] sm:max-w-[200px] cursor-default">{branchInfo.email}</p>
 <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-white text-brand-navy text-sm font-bold rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-border/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-[100] whitespace-nowrap">
 {branchInfo.email}
 <div className="absolute -top-1.5 left-4 w-3 h-3 bg-white border-t border-l border-border/50 rotate-45"></div>
 </div>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-green-100 shadow-sm">
 <MapPin className="w-4 h-4 text-green-600" />
 </div>
 <div>
 <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Address</p>
 <div className="group relative">
 <p className="text-sm font-bold text-brand-navy truncate max-w-[150px] sm:max-w-[200px] cursor-default">{branchInfo.address}</p>
 <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 px-3 py-2 bg-white text-brand-navy text-sm font-bold rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-border/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-[100] w-max max-w-[250px] sm:max-w-[300px] whitespace-normal">
 {branchInfo.address}
 <div className="absolute -top-1.5 right-4 sm:left-4 sm:right-auto w-3 h-3 bg-white border-t border-l border-border/50 rotate-45"></div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </Card>
 </motion.div>

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
 className="grid grid-cols-1 lg:grid-cols-2 gap-6"
 >
 {/* Left Column */}
 <div className="space-y-6">
 {/* Location Information Card */}
 <Card className="p-6 border border-border/40 shadow-sm bg-white hover:shadow-premium transition-shadow rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full pointer-events-none opacity-50"></div>
 <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-green-50 rounded-xl shadow-inner border border-green-100"><MapPin className="w-5 h-5 text-green-600" /></div>
 <h3 className="text-lg font-black text-brand-navy">Location Details</h3>
 </div>
 <a 
 href={branchInfo.googleMapUrl || `https://maps.google.com/?q=${encodeURIComponent(`${branchInfo.address}, ${branchInfo.city}, ${branchInfo.state} ${branchInfo.pincode}`)}`} 
 target="_blank" 
 rel="noreferrer" 
 className="text-xs font-bold text-brand-orange-600 hover:text-brand-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-orange-100"
 >
 <ExternalLink className="w-3.5 h-3.5" /> Maps
 </a>
 </div>
 
 <div className="space-y-5 relative z-10">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Full Address</p>
 <p className="font-semibold text-brand-navy bg-gray-50 p-3 rounded-xl border border-border/50">{branchInfo.address}</p>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">City</p>
 <p className="font-bold text-brand-navy">{branchInfo.city}</p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">State</p>
 <p className="font-bold text-brand-navy">{branchInfo.state}</p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">PIN Code</p>
 <p className="font-bold text-brand-navy">{branchInfo.pincode}</p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Country</p>
 <p className="font-bold text-brand-navy">{branchInfo.country || 'India'}</p>
 </div>
 </div>
 </div>
 </Card>

 {/* Branch Identity Card */}
 <Card className="p-6 border border-border/40 shadow-sm bg-white hover:shadow-premium transition-shadow rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full pointer-events-none opacity-50"></div>
 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="p-2.5 bg-gray-100 rounded-xl shadow-inner border border-gray-200"><Building2 className="w-5 h-5 text-gray-600" /></div>
 <h3 className="text-lg font-black text-brand-navy">Branch Identity</h3>
 </div>
 <div className="grid grid-cols-2 gap-6 relative z-10">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Branch Code</p>
 <p className="font-mono font-bold text-brand-navy bg-gray-50 px-2 py-1 rounded-lg border border-border/50 inline-block">{branchInfo.code}</p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Status</p>
 <Badge variant={branchInfo.is_active ? 'success' : 'error'} className="font-bold shadow-sm">{branchInfo.is_active ? 'Active' : 'Inactive'}</Badge>
 </div>
 <div className="col-span-2">
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Created On</p>
 <p className="font-semibold text-brand-navy flex items-center gap-2">
 <Calendar className="w-4 h-4 text-text-secondary" /> 
 {new Date(branchInfo.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
 </p>
 </div>
 </div>
 </Card>
 </div>

 {/* Right Column */}
 <div className="space-y-6">
 {/* Contact Card */}
 <Card className="p-6 border border-border/40 shadow-sm bg-white hover:shadow-premium transition-shadow rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full pointer-events-none opacity-50"></div>
 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="p-2.5 bg-blue-50 rounded-xl shadow-inner border border-blue-100"><Phone className="w-5 h-5 text-blue-600" /></div>
 <h3 className="text-lg font-black text-brand-navy">Contact Information</h3>
 </div>
 <div className="space-y-5 relative z-10">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Primary Phone</p>
 <a href={`tel:${branchInfo.phone}`} className="font-bold text-brand-navy hover:text-brand-orange-600 transition-colors flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-border/50">
 <Phone className="w-4 h-4 text-brand-orange-500" /> {branchInfo.phone}
 </a>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Email Address</p>
 <a href={`mailto:${branchInfo.email}`} className="font-bold text-brand-navy hover:text-brand-orange-600 transition-colors flex items-center gap-2 break-all bg-gray-50 p-3 rounded-xl border border-border/50">
 <Mail className="w-4 h-4 text-brand-orange-500" /> {branchInfo.email}
 </a>
 </div>
 </div>
 </Card>

 {/* Operations Card */}
 <Card className="p-6 border border-border/40 shadow-sm bg-white hover:shadow-premium transition-shadow rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full pointer-events-none opacity-50"></div>
 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="p-2.5 bg-purple-50 rounded-xl shadow-inner border border-purple-100"><Clock className="w-5 h-5 text-purple-600" /></div>
 <h3 className="text-lg font-black text-brand-navy">Operations</h3>
 </div>
 <div className="grid grid-cols-1 gap-6 relative z-10">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Operating Hours</p>
 <p className="font-bold text-brand-navy bg-gray-50 p-3 rounded-xl border border-border/50 flex items-center gap-2">
 <Clock className="w-4 h-4 text-brand-orange-500" /> {branchInfo.openTime} - {branchInfo.closeTime}
 </p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Timezone</p>
 <p className="font-bold text-brand-navy">Asia/Kolkata (IST)</p>
 </div>
 </div>
 </Card>
 </div>
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
 <Card className="p-0 overflow-hidden border border-border/50 shadow-premium flex flex-col min-h-[400px] rounded-2xl bg-white">
 <div className="p-6 border-b border-border/50 bg-gray-50/30 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
 <div className="flex items-center gap-4 w-full xl:w-auto">
 <div className="p-3 bg-white border border-border rounded-xl shadow-sm"><Users className="w-6 h-6 text-brand-orange-500" /></div>
 <div>
 <h3 className="text-xl font-black text-brand-navy">Team Members</h3>
 <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-0.5">{filteredEmployees.length} Total Employees</p>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto bg-white p-2 rounded-2xl border border-border shadow-sm">
 <div className="relative w-full sm:w-64 shrink-0">
 <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
 <input
 type="text"
 placeholder="Search employees..."
 value={empSearchQuery}
 onChange={e => setEmpSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-xl text-sm font-medium focus:outline-none focus:ring-0 transition-all placeholder:text-text-secondary/60"
 />
 </div>
 <div className="hidden sm:block w-px bg-border/50 my-2"></div>
 <div className="w-full sm:w-[150px] shrink-0">
 <Select
 value={empRoleFilter}
 onChange={e => setEmpRoleFilter(e.target.value)}
 options={[
 { value: 'All', label: 'All Roles' },
 { value: 'Branch Manager', label: 'Manager' },
 { value: 'Delivery Partner', label: 'Delivery' }
 ]}
 className="bg-transparent border-none shadow-none focus:ring-0 text-sm font-bold"
 />
 </div>
 <div className="hidden sm:block w-px bg-border/50 my-2"></div>
 <div className="w-full sm:w-[140px] shrink-0">
 <Select
 value={empStatusFilter}
 onChange={e => setEmpStatusFilter(e.target.value)}
 options={[
 { value: 'All', label: 'All Status' },
 { value: 'Active', label: 'Active' },
 { value: 'Inactive', label: 'Inactive' }
 ]}
 className="bg-transparent border-none shadow-none focus:ring-0 text-sm font-bold"
 />
 </div>
 </div>
 </div>
 <div className="flex-1 bg-white flex flex-col">
 <Table
 columns={[
 {
 header: 'Employee Profile',
 cell: (item) => (
 <div className="flex items-center gap-4 py-1">
 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-orange-50 to-orange-100 border border-brand-orange-200 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
 <span className="font-black text-brand-orange-700 text-lg relative z-10">
 {item.name.charAt(0).toUpperCase()}
 </span>
 </div>
 <div className="flex flex-col">
 <span className="font-black text-brand-navy text-sm">{item.name}</span>
 <span className="text-[11px] font-mono font-bold text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded mt-0.5 inline-block w-max border border-border/50">{item.empId}</span>
 </div>
 </div>
 )
 },
 {
 header: 'Assigned Role',
 cell: (item) => (
 <div className="flex items-center">
 <span className={`inline-flex px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${
 item.role === 'Branch Manager' ? 'bg-purple-50 text-purple-700 border border-purple-200/50 shadow-sm' :
 item.role === 'Delivery Partner' ? 'bg-blue-50 text-blue-700 border border-blue-200/50 shadow-sm' :
 'bg-gray-100 text-text-secondary border border-border/50 shadow-sm'
 }`}>
 {item.role}
 </span>
 </div>
 )
 },
 {
 header: 'Status',
 cell: (item) => (
 <Badge variant={item.status === 'Active' ? 'success' : 'error'} className="font-black px-3 py-1 shadow-sm text-[11px] uppercase tracking-wider rounded-lg">
 {item.status}
 </Badge>
 )
 },
 {
 header: '',
 cell: (item) => (
 <div className="flex justify-end pr-4">
 <Link to={`/employees/${item.id}`} className="px-4 py-2 text-sm font-bold text-brand-navy hover:text-brand-orange-600 bg-white hover:bg-orange-50 rounded-xl transition-all shadow-sm border border-border hover:border-brand-orange-200 flex items-center gap-2">
 <span>View</span> <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 ),
 className: 'w-32',
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
