import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Lock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhoneInput from '../../components/common/PhoneInput';

export default function UpdateEmployee() {
 const navigate = useNavigate();
 const { id } = useParams();

 // Mock initial data
 const initialData = {
 empId: 'E101',
 firstName: 'John',
 lastName: 'Doe',
 email: 'john.doe@example.com',
 phoneExt: '+91',
 phone: '9876543210',
 role: 'Branch Manager',
 branch: 'b1', // ID for Downtown Main
 doj: '2023-01-15',
 };

 const [formData, setFormData] = useState({
 ...initialData,
 });

 const [initialFormData, setInitialFormData] = useState(initialData);

 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);

 const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
 
 setIsSubmitting(true);
 
 // Simulate API logic
 await new Promise(r => setTimeout(r, 1500));
 
 alert('Profile updated successfully!');
 
 setIsSubmitting(false);
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
 <h1 className="text-2xl font-black text-brand-navy tracking-tight">Update Employee &mdash; {initialData.firstName} {initialData.lastName} ({initialData.empId})</h1>
 <p className="text-text-secondary mt-0.5 text-sm font-medium">Modify employee profile and manage access credentials.</p>
 </motion.div>
 </div>
 
 </div>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-hidden">
 <form id="update-employee-form" onSubmit={handleSubmit} className="flex flex-col">
 
 {/* SECTION 1: Personal & Employment Details */}
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Personal & Employment Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 {/* Locked Fields */}
 <div className="flex flex-col gap-1.5 opacity-70">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Employee ID <Lock className="w-3 h-3 text-text-secondary"/></label>
 <input
 value={formData.empId}
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
 <InputWrapper name="firstName">
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
 </InputWrapper>

 <InputWrapper name="lastName">
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

 <InputWrapper name="doj">
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Date of Joining <span className="text-brand-orange-500">*</span></label>
 <input
 name="doj"
 type="date"
 max={new Date().toISOString().split('T')[0]}
 value={formData.doj}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.doj ? 'border-red-500' : 'border-border focus:border-brand-orange-500'
 }`}
 />
 {errors.doj && <span className="text-xs font-bold text-red-500">{errors.doj}</span>}
 </div>
 </InputWrapper>

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
 {errors.role && <span className="text-xs font-bold text-red-500">{errors.role}</span>}
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
 {errors.branch && <span className="text-xs font-bold text-red-500">{errors.branch}</span>}
 </div>
 </InputWrapper>

 </div>
 </div>



   <div className="p-8 border-t border-[#E8ECF4] flex items-center justify-end gap-3 bg-[#F8FAFC] rounded-b-2xl">
 <Link to="/restaurant/employees" onClick={handleCancelClick}>
 <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-[#1a1f36] bg-white border border-[#E8ECF4] hover:bg-[#F4F6FA] transition-all">
 Cancel
 </button>
 </Link>
 <Button className="gap-2 px-6 shadow-sm bg-[#FF6B00] text-white hover:bg-[#E66000] border-0" form="update-employee-form" type="submit" disabled={isSubmitting}>
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
