import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, Briefcase, Store, User, Loader2, Calendar, MapPin, Hash, Copy, CheckCircle, ChevronRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function EmployeeDetails() {
 const navigate = useNavigate();
 const { id } = useParams();
 const { user } = useAuth();
 const { branches } = useBranches();
 
 const [employeeInfo, setEmployeeInfo] = useState<any | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [copied, setCopied] = useState(false);

 const handleCopyCode = () => {
 if (employeeInfo?.empId || employeeInfo?.id) {
 navigator.clipboard.writeText(employeeInfo.empId || employeeInfo.id.substring(0, 8).toUpperCase());
 setCopied(true);
 toast.success('Employee ID copied!');
 setTimeout(() => setCopied(false), 2000);
 }
 };

 useEffect(() => {
 const fetchEmployee = async () => {
 if (!user || !id) return;
 try {
 const snapshot = await get(ref(rtdb, `employee/${user.uid}`));
 if (snapshot.exists()) {
 const data = snapshot.val();
 let foundEmployee: any = null;

 for (const branchCode of Object.keys(data)) {
 if (data[branchCode][id]) {
 foundEmployee = data[branchCode][id];
 break;
 }
 }

 if (foundEmployee) {
 let role = foundEmployee.role;
 if (role === 'Manager') role = 'Branch Manager';
 if (role === 'Delivery Executive') role = 'Delivery Partner';
 setEmployeeInfo({ id, ...foundEmployee, role });
 } else {
 toast.error('Employee not found');
 navigate('/admin/employees');
 }
 } else {
 toast.error('Employee not found');
 navigate('/admin/employees');
 }
 } catch (err) {
 console.error('Error fetching employee details:', err);
 toast.error('Failed to load employee details');
 } finally {
 setIsLoading(false);
 }
 };
 fetchEmployee();
 }, [user, id, navigate]);

 if (isLoading) {
 return (
 <div className="flex justify-center items-center h-[500px]">
 <Loader2 className="w-8 h-8 animate-spin text-brand-orange-500" />
 </div>
 );
 }

 if (!employeeInfo) return null;

 const branch = branches.find(b => b.code === employeeInfo.branch);
 const branchName = branch?.name || employeeInfo.branch || 'None';

 const formattedCreatedAt = employeeInfo.created_at
 ? new Date(employeeInfo.created_at).toLocaleString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })
 : 'N/A';

 const formattedUpdatedAt = employeeInfo.updated_at
 ? new Date(employeeInfo.updated_at).toLocaleString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })
 : 'N/A';

 return (
 <div className="space-y-6">
 
 {/* Breadcrumbs & Back */}
 <div className="flex items-center gap-4 mb-4 px-2">
 <button onClick={() => navigate(-1)} title="Back" className="p-2 bg-white shadow-sm border border-border hover:bg-gray-50 transition-colors rounded-xl flex items-center justify-center">
 <ArrowLeft className="w-5 h-5 text-text-secondary" />
 </button>
 <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
 <Link to="/admin/employees" className="hover:text-brand-orange-600 transition-colors">Employees</Link>
 <ChevronRight className="w-4 h-4" />
 <span className="text-brand-navy font-bold">{employeeInfo.firstName} {employeeInfo.lastName}</span>
 </div>
 </div>

 {/* ZONE 1: Premium Hero Header */}
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative z-10">
 <Card className="p-6 sm:p-8 bg-gradient-to-r from-brand-orange-500/10 via-brand-orange-500/5 to-white border border-brand-orange-500/20 shadow-premium overflow-hidden relative rounded-2xl flex flex-col">
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none"></div>
 
 <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
 <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-brand-orange-50 to-orange-100 border-4 border-white rounded-2xl shadow-md flex items-center justify-center shrink-0 overflow-hidden">
 <span className="text-4xl sm:text-5xl font-black text-brand-orange-600">
 {employeeInfo.firstName?.charAt(0).toUpperCase()}
 </span>
 </div>
 
 <div className="flex-1 space-y-3 text-center sm:text-left mt-2 sm:mt-4">
 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
 <h1 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
 {employeeInfo.firstName} {employeeInfo.lastName}
 </h1>
 <Badge variant={employeeInfo.status === 'Active' ? 'success' : 'error'} className="font-black px-3 py-1 shadow-sm uppercase tracking-widest text-[11px] rounded-md">
 {employeeInfo.status}
 </Badge>
 </div>
 
 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
 <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-brand-orange-500/20 cursor-pointer hover:bg-white transition-colors shadow-sm" onClick={handleCopyCode} title="Copy Employee ID">
 <span className="font-mono font-bold text-xs text-brand-navy">{employeeInfo.empId || employeeInfo.id.substring(0, 8).toUpperCase()}</span>
 {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
 </div>
 <span className="text-text-secondary/50">•</span>
 <div className="text-sm font-bold text-brand-navy flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1 rounded border border-brand-orange-500/20 shadow-sm">
 <Briefcase className="w-4 h-4 text-brand-orange-500" /> {employeeInfo.role}
 </div>
 </div>
 </div>
 </div>
 </Card>
 </motion.div>

 <div className="mt-6">
 <motion.div 
 initial={{ opacity: 0, y: 10 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.3 }}
 className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
 >
 {/* Personal Details Card */}
 <Card className="p-6 border border-border/40 shadow-sm bg-white hover:shadow-premium transition-shadow rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full pointer-events-none opacity-50"></div>
 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="p-2.5 bg-blue-50 rounded-xl shadow-inner border border-blue-100"><User className="w-5 h-5 text-blue-600" /></div>
 <h3 className="text-lg font-black text-brand-navy">Personal Details</h3>
 </div>
 <div className="space-y-5 relative z-10">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Employee ID</p>
 <p className="font-mono font-bold text-brand-navy bg-gray-50 px-3 py-2 rounded-xl border border-border/50 inline-block">
 {employeeInfo.empId || employeeInfo.id.substring(0, 8).toUpperCase()}
 </p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Contact Phone</p>
 <a href={`tel:${employeeInfo.phone}`} className="font-bold text-brand-navy hover:text-brand-orange-600 transition-colors flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-border/50">
 <Phone className="w-4 h-4 text-brand-orange-500" /> {employeeInfo.phone}
 </a>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Email Address</p>
 <a href={`mailto:${employeeInfo.email}`} className="font-bold text-brand-navy hover:text-brand-orange-600 transition-colors flex items-center gap-2 break-all bg-gray-50 p-3 rounded-xl border border-border/50">
 <Mail className="w-4 h-4 text-brand-orange-500" /> {employeeInfo.email}
 </a>
 </div>
 </div>
 </Card>

 {/* Employment Details Card */}
 <Card className="p-6 border border-border/40 shadow-sm bg-white hover:shadow-premium transition-shadow rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full pointer-events-none opacity-50"></div>
 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="p-2.5 bg-purple-50 rounded-xl shadow-inner border border-purple-100"><Briefcase className="w-5 h-5 text-purple-600" /></div>
 <h3 className="text-lg font-black text-brand-navy">Employment Details</h3>
 </div>
 <div className="space-y-5 relative z-10">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Assigned Role</p>
 <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm ${
 employeeInfo.role === 'Branch Manager' ? 'bg-purple-50 text-purple-700 border border-purple-200/50' :
 employeeInfo.role === 'Delivery Partner' ? 'bg-blue-50 text-blue-700 border border-blue-200/50' :
 'bg-gray-100 text-text-secondary border border-border/50'
 }`}>
 {employeeInfo.role}
 </span>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Assigned Branch</p>
 <p className="font-bold text-brand-navy bg-gray-50 p-3 rounded-xl border border-border/50 flex items-center gap-2">
 <Store className="w-4 h-4 text-brand-orange-500" /> {branchName}
 </p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Date of Joining</p>
 <p className="font-bold text-brand-navy flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-border/50">
 <Calendar className="w-4 h-4 text-brand-orange-500" /> {employeeInfo.doj || 'Not specified'}
 </p>
 </div>
 </div>
 </Card>

 {/* Audit Trail Card */}
 <Card className="p-6 border border-border/40 shadow-sm bg-white hover:shadow-premium transition-shadow rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full pointer-events-none opacity-50"></div>
 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="p-2.5 bg-gray-100 rounded-xl shadow-inner border border-gray-200"><Hash className="w-5 h-5 text-gray-600" /></div>
 <h3 className="text-lg font-black text-brand-navy">Audit Trail</h3>
 </div>
 <div className="space-y-5 relative z-10">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Created At</p>
 <p className="font-semibold text-brand-navy bg-gray-50 p-3 rounded-xl border border-border/50">{formattedCreatedAt}</p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Last Edited At</p>
 <p className="font-semibold text-brand-navy bg-gray-50 p-3 rounded-xl border border-border/50">{formattedUpdatedAt}</p>
 </div>
 </div>
 </Card>
 </motion.div>
 </div>
 </div>
 );
}
