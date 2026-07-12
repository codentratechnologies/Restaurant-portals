import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PasswordChecklist from './components/PasswordChecklist';
import PhoneInput from '../../components/common/PhoneInput';

export default function CreateEmployee() {
 const navigate = useNavigate();
 
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
 if (selectedDate > today) {
 newErrors.doj = 'Date of Joining cannot be in the future';
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
 
 setIsSubmitting(true);
 await new Promise(r => setTimeout(r, 1500));
 setIsSubmitting(false);
 
 alert('Employee created successfully!');
 navigate('/restaurant/employees');
 };

 const InputWrapper = ({ name, children }: any) => (
 <div ref={el => { errorRefs.current[name] = el; }}>
 {children}
 </div>
 );

 return (
 <div className="max-w-4xl mx-auto space-y-6">
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
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-hidden">
 <form id="create-employee-form" onSubmit={handleSubmit} className="flex flex-col">
 
 {/* SECTION 1: Personal Details */}
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Personal Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <InputWrapper name="firstName">
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
 </InputWrapper>

 <InputWrapper name="lastName">
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
 </InputWrapper>

 <InputWrapper name="email">
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
 </InputWrapper>

 <InputWrapper name="phone">
 <PhoneInput
 name="phone"
 value={formData.phone}
 extValue={formData.phoneExt}
 onChange={handleChange}
 onExtChange={handleChange}
 error={errors.phone}
 />
 </InputWrapper>
 </div>
 </div>

 {/* SECTION 2: Employment Details */}
 <div className="p-8 border-t border-border bg-gray-50/30">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">2. Employment Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 <InputWrapper name="role">
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Role <span className="text-brand-orange-500">*</span></label>
 <select
 name="role"
 value={formData.role}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all appearance-none cursor-pointer ${
 errors.role ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
 }`}
 >
 <option value="">Select Role</option>
 <option value="Branch Manager">Branch Manager</option>
 <option value="Delivery Partner">Delivery Partner</option>
 </select>
 {errors.role && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.role}</motion.span>}
 </div>
 </InputWrapper>

 <InputWrapper name="branch">
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">
 Assign Branch <span className="text-brand-orange-500">*</span>
 </label>
 <select
 name="branch"
 value={formData.branch}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all appearance-none cursor-pointer ${
 errors.branch ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
 }`}
 >
 <option value="">Select Branch</option>
 <option value="b1">Downtown Main (B001)</option>
 <option value="b2">Westside Plaza (B002)</option>
 <option value="b3">North Mall Kiosk (B003)</option>
 </select>
 {errors.branch && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.branch}</motion.span>}
 </div>
 </InputWrapper>

 <InputWrapper name="doj">
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Date of Joining <span className="text-brand-orange-500">*</span></label>
 <input
 name="doj"
 type="date"
 max={new Date().toISOString().split('T')[0]} // Max is today
 value={formData.doj}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.doj ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 {errors.doj && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.doj}</motion.span>}
 </div>
 </InputWrapper>

 </div>
 </div>

 {/* SECTION 3: Authentication */}
 <div className="p-8 border-t border-border">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">3. Authentication</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 <InputWrapper name="password">
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
 </InputWrapper>

 <InputWrapper name="confirmPassword">
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
 </InputWrapper>

 <div className="md:col-span-2">
 <PasswordChecklist password={formData.password} confirmPassword={formData.confirmPassword} />
 </div>

 </div>
 </div>

   <div className="p-8 border-t border-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
 <Link to="/restaurant/employees">
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
