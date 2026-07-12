import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PasswordChecklist from './components/PasswordChecklist';
import Select from '../../components/common/Select';
import PhoneInput from '../../components/common/PhoneInput';
import { ref, push, get } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { hashPassword } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function CreateEmployee() {
 const navigate = useNavigate();
 const { user } = useAuth();
 const { branches, loading: branchesLoading } = useBranches();
 
 const [formData, setFormData] = useState({
 firstName: '',
 lastName: '',
 email: '',
 phoneExt: '+91',
 phone: '',
 role: '',
 branch: '',
 doj: '',
 password: '',
 confirmPassword: '',
 });

 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);

 // References for scrolling
 const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

 const validate = () => {
 const newErrors: Record<string, string> = {};

 // First Name
 if (!formData.firstName) {
 newErrors.firstName = 'First Name is required';
 } else if (formData.firstName.length < 2 || formData.firstName.length > 50) {
 newErrors.firstName = 'First Name must be between 2 and 50 characters';
 } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
 newErrors.firstName = 'First Name must contain only letters';
 }

 // Last Name
 if (!formData.lastName) {
 newErrors.lastName = 'Last Name is required';
 } else if (formData.lastName.length < 2 || formData.lastName.length > 50) {
 newErrors.lastName = 'Last Name must be between 2 and 50 characters';
 } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
 newErrors.lastName = 'Last Name must contain only letters';
 }

 // Email
 if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
 newErrors.email = 'Valid email is required';
 }

 // Phone
 if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
 newErrors.phone = 'Phone number must be exactly 10 digits';
 }

 // Role
 if (!formData.role) {
 newErrors.role = 'Role selection is required';
 }

 // Branch
 if (!formData.branch) {
 newErrors.branch = 'Branch assignment is required';
 }

 // DOJ
 if (!formData.doj) {
 newErrors.doj = 'Date of Joining is required';
 } else {
 const selectedDate = new Date(formData.doj);
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 if (selectedDate < today) {
 newErrors.doj = 'Date of Joining cannot be in the past';
 }
 }

 // Password
 const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
 if (!formData.password) {
 newErrors.password = 'Password is required';
 } else if (!passRegex.test(formData.password)) {
 newErrors.password = 'Password does not meet all requirements';
 }

 // Confirm Password
 if (formData.password !== formData.confirmPassword) {
 newErrors.confirmPassword = 'Passwords do not match';
 }

 setErrors(newErrors);

 if (Object.keys(newErrors).length > 0) {
 // Auto-scroll to first error
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

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!validate()) return;
 
 if (!user) {
 toast.error('You must be logged in to create an employee.');
 return;
 }
 
 setIsSubmitting(true);
 
 try {
 const branchCode = formData.branch; // Because we change the select to use b.code

 const employeeRootRef = ref(rtdb, `employee/${user.uid}`);
 
 // Determine the next sequential Employee ID (e.g., EMP001, EMP002, etc.)
 const snapshot = await get(employeeRootRef);
 let nextIdNumber = 1;
 if (snapshot.exists()) {
 const branchData = snapshot.val();
 let maxSeq = 0;
 // Iterate over branches
 Object.values(branchData).forEach((employeesObj: any) => {
 // Iterate over employees in the branch
 Object.values(employeesObj).forEach((emp: any) => {
 if (emp && emp.empId && emp.empId.startsWith('EMP')) {
 const num = parseInt(emp.empId.substring(3), 10);
 if (!isNaN(num) && num > maxSeq) {
 maxSeq = num;
 }
 }
 });
 });
 nextIdNumber = maxSeq + 1;
 }
 const empId = `EMP${String(nextIdNumber).padStart(3, '0')}`;

 const hashedPassword = await hashPassword(formData.password);
 
 const today = new Date();
 const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
 const isFutureDoj = formData.doj > todayStr;

 const newEmployee = {
 empId: empId,
 firstName: formData.firstName,
 lastName: formData.lastName,
 email: formData.email,
 phone: `${formData.phoneExt} ${formData.phone}`,
 role: formData.role,
 branch: branchCode, // Map directly to branch code
 doj: formData.doj,
 password: hashedPassword,
 status: isFutureDoj ? 'Inactive' : 'Active',
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 };
 
 const specificBranchRef = ref(rtdb, `employee/${user.uid}/${branchCode}`);
 await push(specificBranchRef, newEmployee);
 
 toast.success('Employee created successfully!');
 navigate('/admin/employees');
 } catch (error) {
 console.error('Error creating employee:', error);
 toast.error('Failed to create employee. Please try again.');
 } finally {
 setIsSubmitting(false);
 }
 };


 return (
 <div className="max-w-3xl mx-auto space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
 <div className="flex items-center gap-4">
 <button onClick={() => navigate(-1)} type="button" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-gray-50 border border-border">
 <ArrowLeft className="w-5 h-5 text-text-secondary" />
 </button>
 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
 <h1 className="text-2xl font-black text-brand-navy tracking-tight">Create New Employee</h1>
 <p className="text-text-secondary mt-0.5 text-sm font-medium">Add a new staff member to the platform.</p>
 </motion.div>
 </div>
 
 </div>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-visible">
 <form id="create-employee-form" onSubmit={handleSubmit} className="flex flex-col">
 
 {/* SECTION 1: Personal Details */}
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Personal Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div ref={el => { errorRefs.current['firstName'] = el; }}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">First Name <span className="text-brand-orange-500">*</span></label>
 <input
 name="firstName"
 value={formData.firstName}
 onChange={handleChange}
 placeholder="e.g. John"
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 {errors.firstName && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.firstName}</motion.span>}
 </div>
 </div>

 <div ref={el => { errorRefs.current['lastName'] = el; }}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Last Name <span className="text-brand-orange-500">*</span></label>
 <input
 name="lastName"
 value={formData.lastName}
 onChange={handleChange}
 placeholder="e.g. Doe"
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 {errors.lastName && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.lastName}</motion.span>}
 </div>
 </div>

 <div ref={el => { errorRefs.current['email'] = el; }}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Email Address <span className="text-brand-orange-500">*</span></label>
 <input
 name="email"
 type="email"
 value={formData.email}
 onChange={handleChange}
 placeholder="john.doe@example.com"
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.email ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 {errors.email && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.email}</motion.span>}
 </div>
 </div>

 <div ref={el => { errorRefs.current['phone'] = el; }}>
 <PhoneInput
 name="phone"
 value={formData.phone}
 extValue={formData.phoneExt}
 onChange={handleChange}
 onExtChange={handleChange}
 error={errors.phone}
 />
 </div>
 </div>
 </div>

 {/* SECTION 2: Employment Details */}
 <div className="p-8 border-t border-border bg-gray-50/30">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">2. Employment Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 <div ref={el => { errorRefs.current['role'] = el; }}>
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
 {errors.role && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.role}</motion.span>}
 </div>
 </div>

 <div ref={el => { errorRefs.current['branch'] = el; }}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">
 Assign Branch <span className="text-brand-orange-500">*</span>
 </label>
 <Select
 name="branch"
 value={formData.branch}
 onChange={(e) => handleChange(e as any)}
 disabled={branchesLoading}
 options={branches.map((b) => ({ value: b.code || '', label: `${b.name} ${b.city ? `(${b.city})` : ''}` }))}
 placeholder={branchesLoading ? 'Loading branches...' : 'Select Branch'}
 error={errors.branch}
 />
 {errors.branch && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.branch}</motion.span>}
 </div>
 </div>

 <div ref={el => { errorRefs.current['doj'] = el; }}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Date of Joining <span className="text-brand-orange-500">*</span></label>
 <input
 name="doj"
 type="date"
 min={new Date().toISOString().split('T')[0]}
 value={formData.doj}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.doj ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 {errors.doj && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.doj}</motion.span>}
 </div>
 </div>

 </div>
 </div>

 {/* SECTION 3: Authentication */}
 <div className="p-8 border-t border-border">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">3. Authentication</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 <div ref={el => { errorRefs.current['password'] = el; }}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Password <span className="text-brand-orange-500">*</span></label>
 <div className="relative">
 <input
 name="password"
 type={showPassword ? 'text' : 'password'}
 value={formData.password}
 onChange={handleChange}
 className={`w-full pl-4 pr-10 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.password ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 <button 
 type="button" 
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-brand-navy"
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {errors.password && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.password}</motion.span>}
 </div>
 </div>

 <div ref={el => { errorRefs.current['confirmPassword'] = el; }}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Confirm Password <span className="text-brand-orange-500">*</span></label>
 <div className="relative">
 <input
 name="confirmPassword"
 type={showConfirmPassword ? 'text' : 'password'}
 value={formData.confirmPassword}
 onChange={handleChange}
 className={`w-full pl-4 pr-10 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 <button 
 type="button" 
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-brand-navy"
 >
 {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {errors.confirmPassword && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.confirmPassword}</motion.span>}
 </div>
 </div>

 <div className="md:col-span-2">
 <PasswordChecklist password={formData.password} confirmPassword={formData.confirmPassword} />
 </div>

 </div>
 </div>

   <div className="p-8 border-t border-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
 <Link to="/admin/employees">
 <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all">
 Cancel
 </button>
 </Link>
 <Button form="create-employee-form" type="submit" disabled={isSubmitting} className="gap-2 px-8 shadow-sm">
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 {isSubmitting ? 'Saving...' : 'Save Profile'}
 </Button>
 </div>
        </form>
 </Card>
 </motion.div>
 </div>
 );
}

