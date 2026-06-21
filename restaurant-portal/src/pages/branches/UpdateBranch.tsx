import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import BranchStepper from './components/BranchStepper';
import AssignMenuStep from './components/AssignMenuStep';
import PhoneInput from '../../components/common/PhoneInput';

const STEPS = [
 { id: 1, label: 'Branch Details' },
 { id: 2, label: 'Assign Menu' }
];

export default function UpdateBranch() {
 const navigate = useNavigate();
 const { id } = useParams();
 
 const [currentStep, setCurrentStep] = useState(1);
 const [formData, setFormData] = useState({
 code: 'B001',
 name: 'MG Road Branch',
 email: 'mgroad@example.com',
 phoneExt: '+91',
 phone: '9876543210',
 address: '123 MG Road',
 city: 'New York',
 state: 'NY',
 pincode: '100001',
 openTime: '09:00',
 closeTime: '22:00',
 });

 const [initialData, setInitialData] = useState(formData);
 const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set(['f1', 'f3']));
 const [initialSelectedMenuIds, setInitialSelectedMenuIds] = useState<Set<string>>(new Set(['f1', 'f3']));
 
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);

 // Unsaved changes detection
 useEffect(() => {
 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 const formChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
 
 // Basic set comparison for selected menus
 const menusChanged = 
 selectedMenuIds.size !== initialSelectedMenuIds.size || 
 [...selectedMenuIds].some(id => !initialSelectedMenuIds.has(id));

 if (formChanged || menusChanged) {
 e.preventDefault();
 e.returnValue = '';
 }
 };
 window.addEventListener('beforeunload', handleBeforeUnload);
 return () => window.removeEventListener('beforeunload', handleBeforeUnload);
 }, [formData, initialData, selectedMenuIds, initialSelectedMenuIds]);

 const validateStep1 = () => {
 const newErrors: Record<string, string> = {};

 if (!formData.name) newErrors.name = 'Branch Name is required';
 if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
 newErrors.email = 'Valid email is required';
 }
 if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
 newErrors.phone = 'Phone number must be exactly 10 digits';
 }

 if (!formData.address) newErrors.address = 'Address is required';
 if (!formData.city) newErrors.city = 'City is required';
 if (!formData.state) newErrors.state = 'State is required';
 if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
 newErrors.pincode = 'Pincode must be exactly 6 digits';
 }

 if (!formData.openTime) newErrors.openTime = 'Opening time is required';
 if (!formData.closeTime) newErrors.closeTime = 'Closing time is required';
 
 if (formData.openTime && formData.closeTime) {
 if (formData.closeTime <= formData.openTime) {
 newErrors.closeTime = 'Closing time must be after opening time';
 }
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
 };

 const handleNextStep1 = async () => {
 if (!validateStep1()) return;
 
 setIsSubmitting(true);
 await new Promise(r => setTimeout(r, 1000)); // API call
 setIsSubmitting(false);
 
 setCurrentStep(2);
 };

 const handleBackToStep1 = () => {
 setCurrentStep(1);
 };

 const handleSaveAndFinish = async () => {
 if (selectedMenuIds.size === 0) {
 setErrors({ menu: 'Please assign at least one menu item to continue.' });
 return;
 }
 setErrors({});
 setIsSubmitting(true);
 await new Promise(r => setTimeout(r, 1500)); // API call
 setIsSubmitting(false);
 
 setInitialData(formData);
 setInitialSelectedMenuIds(new Set(selectedMenuIds));
 
 alert('Branch updated successfully!');
 navigate(`/branches/${id}`);
 };

 const handleCancelClick = (e: React.MouseEvent) => {
 const formChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
 const menusChanged = 
 selectedMenuIds.size !== initialSelectedMenuIds.size || 
 [...selectedMenuIds].some(menuId => !initialSelectedMenuIds.has(menuId));

 if (formChanged || menusChanged) {
 if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
 e.preventDefault();
 }
 }
 };

 const InputField = ({ label, name, type = 'text', placeholder = '', disabled = false }: any) => (
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">{label}</label>
 <input
 type={type}
 name={name}
 value={formData[name as keyof typeof formData]}
 onChange={handleChange}
 placeholder={placeholder}
 disabled={disabled}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${
 disabled 
 ? 'opacity-60 cursor-not-allowed border-border bg-gray-100 text-text-secondary font-bold' 
 : `focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${
 errors[name] ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`
 }`}
 />
 {errors[name] && <span className="text-xs font-bold text-red-500 mt-0.5">{errors[name]}</span>}
 </div>
 );

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
 <div className="flex items-center gap-4">
 <Link to={`/branches/${id}`} onClick={handleCancelClick} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-gray-50 border border-border">
 <ArrowLeft className="w-5 h-5 text-text-secondary" />
 </Link>
 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
 <h1 className="text-2xl font-black text-brand-navy tracking-tight">Update Branch &mdash; {formData.name}</h1>
 <p className="text-text-secondary mt-0.5 text-sm font-medium">Modify operational details for this branch.</p>
 </motion.div>
 </div>
 <div className="flex items-center gap-3">
 {currentStep === 1 ? (
 <>
 <Link to={`/branches/${id}`} onClick={handleCancelClick}>
 <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all">
 Cancel
 </button>
 </Link>
 <Button onClick={handleNextStep1} disabled={isSubmitting} className="gap-2 px-8">
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
 Next
 {!isSubmitting && <ChevronRight className="w-5 h-5" />}
 </Button>
 </>
 ) : (
 <>
 <button
 onClick={handleBackToStep1}
 className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all flex items-center gap-2"
 >
 <ChevronLeft className="w-5 h-5" />
 Back
 </button>
 <Button onClick={handleSaveAndFinish} disabled={isSubmitting} className="gap-2 px-8 shadow-sm">
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 {isSubmitting ? 'Updating...' : 'Update Branch'}
 </Button>
 </>
 )}
 </div>
 </div>

 <BranchStepper steps={STEPS} currentStep={currentStep} />

 <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-hidden">
 
 <AnimatePresence mode="wait">
 {currentStep === 1 && (
 <motion.div
 key="step1"
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.3 }}
 >
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Basic Information</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <InputField label="Branch Code" name="code" disabled />
 <InputField label="Branch Name" name="name" />
 <InputField label="Contact Email" name="email" type="email" />
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

 <div className="p-8 border-t border-border bg-gray-50/30">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">2. Location Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <InputField label="Address Line 1" name="address" />
 </div>
 
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">City</label>
 <select
 name="city"
 value={formData.city}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all appearance-none cursor-pointer ${
 errors.city ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
 }`}
 >
 <option value="New York">New York</option>
 <option value="Chicago">Chicago</option>
 <option value="Los Angeles">Los Angeles</option>
 </select>
 {errors.city && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.city}</span>}
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">State</label>
 <select
 name="state"
 value={formData.state}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all appearance-none cursor-pointer ${
 errors.state ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
 }`}
 >
 <option value="NY">New York (NY)</option>
 <option value="IL">Illinois (IL)</option>
 <option value="CA">California (CA)</option>
 </select>
 {errors.state && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.state}</span>}
 </div>

 <InputField label="Pincode" name="pincode" />
 </div>
 </div>

 <div className="p-8 border-t border-border">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">3. Operational Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <InputField label="Opening Time" name="openTime" type="time" />
 <InputField label="Closing Time" name="closeTime" type="time" />
 </div>
 </div>
 </motion.div>
 )}

 {currentStep === 2 && (
 <motion.div
 key="step2"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.3 }}
 >
 <div className="p-6 border-b border-border">
 <h2 className="text-lg font-black text-brand-navy">Assign Menu Items</h2>
 <p className="text-sm font-medium text-text-secondary mt-1">Select the food items available at this branch.</p>
 {errors.menu && (
 <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-lg">
 {errors.menu}
 </div>
 )}
 </div>

 <AssignMenuStep 
 selectedIds={selectedMenuIds} 
 onChange={setSelectedMenuIds} 
 />
 </motion.div>
 )}
 </AnimatePresence>
 </Card>
 </motion.div>
 </div>
 );
}
