import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Lock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import PhoneInput from '../../components/common/PhoneInput';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { ref, get, set } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function UpdateEmployee() {
 const navigate = useNavigate();
 const { id } = useParams();
 const { user } = useAuth();
 const { branches, loading: branchesLoading } = useBranches();

 const [formData, setFormData] = useState({
 empId: '',
 firstName: '',
 lastName: '',
 email: '',
 phoneExt: '+91',
 phone: '',
 role: '',
 branch: '',
 doj: '',
 status: 'Active',
 });

 const [initialFormData, setInitialFormData] = useState({
 empId: '',
 firstName: '',
 lastName: '',
 email: '',
 phoneExt: '+91',
 phone: '',
 role: '',
 branch: '',
 doj: '',
 status: 'Active',
 oldBranchCode: '',
 });

 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isLoading, setIsLoading] = useState(true);

 const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

 // Fetch initial employee data
 useEffect(() => {
 const fetchEmployee = async () => {
 if (!user || !id) return;
 try {
 const snapshot = await get(ref(rtdb, `employee/${user.uid}`));
 if (snapshot.exists()) {
 const data = snapshot.val();
 let foundEmployee: any = null;
 let foundBranchCode = '';

 for (const branchCode of Object.keys(data)) {
 if (data[branchCode][id]) {
 foundEmployee = data[branchCode][id];
 foundBranchCode = branchCode;
 break;
 }
 }

 if (foundEmployee) {
 const phoneData = foundEmployee.phone || '';
 let pExt = '+91';
 let pNum = phoneData;
 if (phoneData.includes(' ')) {
 const parts = phoneData.split(' ');
 pExt = parts[0];
 pNum = parts.slice(1).join(' ');
 }

 const loadedData = {
 empId: foundEmployee.empId || '',
 firstName: foundEmployee.firstName || '',
 lastName: foundEmployee.lastName || '',
 email: foundEmployee.email || '',
 phoneExt: pExt,
 phone: pNum,
 role: foundEmployee.role || '',
 branch: foundEmployee.branch || '',
 doj: foundEmployee.doj || '',
 status: foundEmployee.status || 'Active',
 oldBranchCode: foundBranchCode,
 };
 setFormData(prev => ({
 ...prev,
 ...loadedData,
 }));
 setInitialFormData(loadedData);
 } else {
 toast.error('Employee not found.');
 navigate('/employees');
 }
 } else {
 toast.error('Employee not found.');
 navigate('/employees');
 }
 } catch (err) {
 console.error('Error fetching employee:', err);
 toast.error('Failed to load employee details.');
 } finally {
 setIsLoading(false);
 }
 };
 fetchEmployee();
 }, [user, id, navigate]);

 // Unsaved changes detection
 useEffect(() => {
 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 // Check if profile details changed
 const profileChanged = 
 formData.firstName !== initialFormData.firstName ||
 formData.lastName !== initialFormData.lastName ||
 formData.phone !== initialFormData.phone ||
 formData.role !== initialFormData.role ||
 formData.branch !== initialFormData.branch ||
 formData.status !== initialFormData.status ||
 formData.doj !== initialFormData.doj;

 if (profileChanged) {
 e.preventDefault();
 e.returnValue = '';
 }
 };
 window.addEventListener('beforeunload', handleBeforeUnload);
 return () => window.removeEventListener('beforeunload', handleBeforeUnload);
 }, [formData, initialFormData]);

 const validate = () => {
 const newErrors: Record<string, string> = {};

 // First Name
 if (!formData.firstName) {
 newErrors.firstName = 'First Name is required';
 } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
 newErrors.firstName = 'First Name must contain only letters';
 }

 // Last Name
 if (!formData.lastName) {
 newErrors.lastName = 'Last Name is required';
 } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
 newErrors.lastName = 'Last Name must contain only letters';
 }

 // Phone
 if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
 newErrors.phone = 'Phone number must be exactly 10 digits';
 }

 // Role & Branch
 if (!formData.role) {
 newErrors.role = 'Role selection is required';
 }
 if (!formData.branch) {
 newErrors.branch = 'Branch assignment is required';
 }

 setErrors(newErrors);

 if (Object.keys(newErrors).length > 0) {
 const firstErrorField = Object.keys(newErrors)[0];
 if (errorRefs.current[firstErrorField]) {
 errorRefs.current[firstErrorField]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }
 return false;
 }

 return true;
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
 };

 const handleCancelClick = (e: React.MouseEvent) => {
 const profileChanged = 
 formData.firstName !== initialFormData.firstName ||
 formData.lastName !== initialFormData.lastName ||
 formData.phone !== initialFormData.phone ||
 formData.role !== initialFormData.role ||
 formData.branch !== initialFormData.branch ||
 formData.status !== initialFormData.status ||
 formData.doj !== initialFormData.doj;

 if (profileChanged) {
 if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
 e.preventDefault();
 }
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!validate()) return;
 if (!user || !id) return;
 
 setIsSubmitting(true);
 
 try {
 const oldBranchCode = initialFormData.oldBranchCode;
 const newBranchCode = formData.branch;

 const oldRef = ref(rtdb, `employee/${user.uid}/${oldBranchCode}/${id}`);
 const snapshot = await get(oldRef);
 const oldData = snapshot.exists() ? snapshot.val() : {};

 

 const payload: any = {
 ...oldData,
 firstName: formData.firstName,
 lastName: formData.lastName,
 phone: `${formData.phoneExt} ${formData.phone}`,
 role: formData.role,
 branch: formData.branch,
 doj: formData.doj,
 status: formData.status,
 updated_at: new Date().toISOString()
 };
 
 if (oldBranchCode !== newBranchCode) {
 // Moved branch, so delete old one
 await set(oldRef, null);
 }
 
 const newRef = ref(rtdb, `employee/${user.uid}/${newBranchCode}/${id}`);
 await set(newRef, payload);

 setInitialFormData({
 firstName: formData.firstName,
 lastName: formData.lastName,
 email: formData.email,
 phoneExt: formData.phoneExt,
 phone: formData.phone,
 role: formData.role,
 branch: formData.branch,
 doj: formData.doj,
 status: formData.status,
 oldBranchCode: newBranchCode,
 empId: formData.empId,
 });

 toast.success('Profile updated successfully!');
 
 navigate('/employees');
 } catch (error) {
 console.error('Error updating employee:', error);
 toast.error('Failed to update employee. Please try again.');
 } finally {
 setIsSubmitting(false);
 }
 };

 if (isLoading) {
 return (
 <div className="flex justify-center items-center h-[500px]">
 <Loader2 className="w-8 h-8 animate-spin text-brand-orange-500" />
 </div>
 );
 }

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
 <div className="flex items-center gap-4">
 <button onClick={() => navigate(-1)} type="button" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-gray-50 border border-border">
 <ArrowLeft className="w-5 h-5 text-text-secondary" />
 </button>
 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
 <h1 className="text-2xl font-black text-brand-navy tracking-tight">
 Update Employee &mdash; {formData.firstName} {formData.lastName} ({formData.empId || (id ? id.substring(0, 8).toUpperCase() : '')})
 </h1>
 <p className="text-text-secondary mt-0.5 text-sm font-medium">Modify employee profile and manage access credentials.</p>
 </motion.div>
 </div>
 
 </div>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-visible">
 <form id="update-employee-form" onSubmit={handleSubmit} className="flex flex-col">
 
 {/* SECTION 1: Personal & Employment Details */}
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Personal & Employment Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 {/* Locked Fields */}
 <div className="flex flex-col gap-1.5 opacity-70">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Employee ID <Lock className="w-3 h-3 text-text-secondary"/></label>
 <input
 value={formData.empId || (id ? id.substring(0, 8).toUpperCase() : '')}
 disabled
 className="w-full px-4 py-2.5 bg-gray-100 border border-border rounded-xl text-sm font-bold text-text-secondary cursor-not-allowed"
 />
 </div>

 <div className="flex flex-col gap-1.5 opacity-70">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Email Address <Lock className="w-3 h-3 text-text-secondary"/></label>
 <input
 value={formData.email}
 disabled
 className="w-full px-4 py-2.5 bg-gray-100 border border-border rounded-xl text-sm font-bold text-text-secondary cursor-not-allowed"
 />
 </div>

 {/* Editable Personal Fields */}
 <div ref={el => errorRefs.current["firstName"] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">First Name <span className="text-brand-orange-500">*</span></label>
 <input
 name="firstName"
 value={formData.firstName}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.firstName ? 'border-red-500' : 'border-border focus:border-brand-orange-500'
 }`}
 />
 {errors.firstName && <span className="text-xs font-bold text-red-500">{errors.firstName}</span>}
 </div>
 </div>

 <div ref={el => errorRefs.current["lastName"] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Last Name <span className="text-brand-orange-500">*</span></label>
 <input
 name="lastName"
 value={formData.lastName}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.lastName ? 'border-red-500' : 'border-border focus:border-brand-orange-500'
 }`}
 />
 {errors.lastName && <span className="text-xs font-bold text-red-500">{errors.lastName}</span>}
 </div>
 </div>

 <div ref={el => errorRefs.current["phone"] = el}>
 <PhoneInput
 name="phone"
 value={formData.phone}
 extValue={formData.phoneExt}
 onChange={handleChange}
 onExtChange={handleChange}
 error={errors.phone}
 />
 </div>

 <div ref={el => errorRefs.current["doj"] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Date of Joining <span className="text-brand-orange-500">*</span></label>
 <input
 name="doj"
 type="date"
 min={new Date().toISOString().split('T')[0]}
 value={formData.doj}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.doj ? 'border-red-500' : 'border-border focus:border-brand-orange-500'
 }`}
 />
 {errors.doj && <span className="text-xs font-bold text-red-500">{errors.doj}</span>}
 </div>
 </div>

 <div ref={el => errorRefs.current["role"] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Role <span className="text-brand-orange-500">*</span></label>
 <Select
 name="role"
 value={formData.role}
 onChange={(e) => handleChange(e as any)}
 options={[
 { value: 'Branch Manager', label: 'Branch Manager' },
 { value: 'Delivery Partner', label: 'Delivery Partner' }
 ]}
 placeholder="Select Role"
 error={errors.role}
 />
 {errors.role && <span className="text-xs font-bold text-red-500">{errors.role}</span>}
 </div>
 </div>

 <div ref={el => errorRefs.current["branch"] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">
 Assign Branch <span className="text-brand-orange-500">*</span>
 </label>
 <Select
 name="branch"
 value={formData.branch}
 onChange={(e) => handleChange(e as any)}
 disabled={branchesLoading}
 options={branches.map((b) => ({ value: b.code, label: `${b.name} ${b.city ? `(${b.city})` : ''}` }))}
 placeholder={branchesLoading ? 'Loading branches...' : 'Select Branch'}
 error={errors.branch}
 />
 {errors.branch && <span className="text-xs font-bold text-red-500">{errors.branch}</span>}
 </div>
 </div>

 <div ref={el => errorRefs.current["status"] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Status</label>
 <Select
 name="status"
 value={formData.status}
 onChange={(e) => handleChange(e as any)}
 options={[
 { value: 'Active', label: 'Active' },
 { value: 'Inactive', label: 'Inactive' }
 ]}
 />
 </div>
 </div>

 </div>
 </div>

   <div className="p-8 border-t border-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
 <Link to="/employees" onClick={handleCancelClick}>
 <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all">
 Cancel
 </button>
 </Link>
 <Button form="update-employee-form" type="submit" disabled={isSubmitting} className="gap-2 px-8 shadow-sm">
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 {isSubmitting ? 'Saving...' : 'Save Changes'}
 </Button>
 </div>
        </form>
 </Card>
 </motion.div>
 </div>
 );
}
