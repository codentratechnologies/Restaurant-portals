import { useState, useMemo } from 'react';
import { Country, State, City } from 'country-state-city';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import PhoneInput from '../../components/common/PhoneInput';
import { ref, push, set } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

const InputField = ({ label, name, type = 'text', placeholder = '', formData, handleChange, errors, disabled = false, required = true }: any) => (
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">
 {label} {required && !disabled && <span className="text-brand-orange-500">*</span>}
 </label>
 <input
 type={type}
 name={name}
 value={formData[name as keyof typeof formData] || ''}
 onChange={handleChange}
 placeholder={placeholder}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${
 disabled ? 'opacity-70 cursor-not-allowed border-border' : `focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${
 errors[name] ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`
 }`}
 disabled={disabled}
 />
 {errors[name] && <span className="text-xs font-bold text-red-500 mt-0.5">{errors[name]}</span>}
 </div>
);

export default function CreateBranch() {
 const navigate = useNavigate();
 const { user } = useAuth();

 const [formData, setFormData] = useState({
 code: '',
 name: '',
 email: '',
 phoneExt: '+91',
 phone: '',
 address: '',
 country: 'IN', // Default to India
 city: '',
 state: '',
 pincode: '',
 googleMapUrl: '',
 openTime: '',
 closeTime: '',
 });

 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);

 // Derive dropdown options dynamically
 const countries = useMemo(() => Country.getAllCountries(), []);
 const availableStates = useMemo(() => formData.country ? State.getStatesOfCountry(formData.country) : [], [formData.country]);
 const availableCities = useMemo(() => (formData.country && formData.state) ? City.getCitiesOfState(formData.country, formData.state) : [], [formData.country, formData.state]);

 const validateForm = () => {
 const newErrors: Record<string, string> = {};

 if (!formData.code) newErrors.code = 'Branch Code is required';
 if (!formData.name) newErrors.name = 'Branch Name is required';
 
 if (!formData.email) {
 newErrors.email = 'Email is required';
 } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
 newErrors.email = 'Valid email is required';
 }

 if (!formData.phone) {
 newErrors.phone = 'Phone number is required';
 } else if (!/^\d{10}$/.test(formData.phone)) {
 newErrors.phone = 'Phone number must be exactly 10 digits';
 }

 if (!formData.address) newErrors.address = 'Address is required';
 if (!formData.country) newErrors.country = 'Country is required';
 if (!formData.state) newErrors.state = 'State is required';
 if (!formData.city) newErrors.city = 'City is required';
 
 if (!formData.pincode) {
 newErrors.pincode = 'Pincode is required';
 } else if (!/^\d{6}$/.test(formData.pincode)) {
 newErrors.pincode = 'Pincode must be exactly 6 digits';
 }
 
 if (!formData.googleMapUrl) {
 newErrors.googleMapUrl = 'Google Map URL is required';
 } else if (!formData.googleMapUrl.startsWith('http')) {
 newErrors.googleMapUrl = 'Please enter a valid URL starting with http:// or https://';
 }

 if (!formData.openTime) newErrors.openTime = 'Opening time is required';
 if (!formData.closeTime) newErrors.closeTime = 'Closing time is required';
 
 // Removed strict time validation to allow closing times past midnight (e.g. next day)

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 
 setFormData(prev => {
 const next = { ...prev, [name]: value };
 // Cascade resets
 if (name === 'country') {
 next.state = '';
 next.city = '';
 } else if (name === 'state') {
 next.city = '';
 }
 return next;
 });
 
 if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
 };

 const handleSaveAndFinish = async () => {
 if (!validateForm()) return;
 if (!user) return;
 setIsSubmitting(true);
 
 try {
 const branchesRef = ref(rtdb, `branch/${user.uid}`);
 const newBranchRef = push(branchesRef);
 
 const payload = {
 name: formData.name,
 code: formData.code,
 email: formData.email,
 phone: `${formData.phoneExt} ${formData.phone}`,
 address: formData.address,
 country: formData.country,
 city: formData.city,
 state: formData.state,
 pincode: formData.pincode,
 googleMapUrl: formData.googleMapUrl,
 openTime: formData.openTime,
 closeTime: formData.closeTime,
 is_active: true,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 };
 
 await set(newBranchRef, payload);
 toast.success('Branch created successfully!');
 navigate('/admin/branches');
 } catch (error) {
 console.error('Failed to create branch:', error);
 toast.error('Failed to save branch. Please try again.');
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
 <h1 className="text-2xl font-black text-brand-navy tracking-tight">
 Create New Branch
 </h1>
 <p className="text-text-secondary mt-0.5 text-sm font-medium">Add a new operational location to your network.</p>
 </motion.div>
 </div>
 
 </div>

 <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-hidden">
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Basic Information</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <InputField label="Branch Code" name="code" placeholder="e.g. B001" formData={formData} handleChange={handleChange} errors={errors} />
 <InputField label="Branch Name" name="name" placeholder="e.g. MG Road Branch" formData={formData} handleChange={handleChange} errors={errors} />
 <InputField label="Contact Email" name="email" type="email" placeholder="branch@example.com" formData={formData} handleChange={handleChange} errors={errors} />
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
 <InputField label="Address Line 1" name="address" placeholder="123 Street Name" formData={formData} handleChange={handleChange} errors={errors} />
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Country <span className="text-brand-orange-500">*</span></label>
 <Select
 name="country"
 value={formData.country}
 onChange={(e) => handleChange(e as any)}
 options={[{ value: '', label: 'Select Country' }, ...countries.map(c => ({ value: c.isoCode, label: c.name }))]}
 error={errors.country}
 />
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">State <span className="text-brand-orange-500">*</span></label>
 <Select
 name="state"
 value={formData.state}
 onChange={(e) => handleChange(e as any)}
 disabled={!formData.country}
 options={[{ value: '', label: 'Select State' }, ...availableStates.map(s => ({ value: s.isoCode, label: s.name }))]}
 error={errors.state}
 />
 </div>

 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">City <span className="text-brand-orange-500">*</span></label>
 <Select
 name="city"
 value={formData.city}
 onChange={(e) => handleChange(e as any)}
 disabled={!formData.state}
 options={[{ value: '', label: 'Select City' }, ...availableCities.map(c => ({ value: c.name, label: c.name }))]}
 error={errors.city}
 />
 </div>

 <InputField label="Pincode" name="pincode" placeholder="6 digit pincode" formData={formData} handleChange={handleChange} errors={errors} />
 <div className="md:col-span-2">
 <InputField label="Google Map URL" name="googleMapUrl" type="url" placeholder="https://maps.google.com/..." formData={formData} handleChange={handleChange} errors={errors} />
 </div>
 </div>
 </div>

 <div className="p-8 border-t border-border">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">3. Operational Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <InputField label="Opening Time" name="openTime" type="time" formData={formData} handleChange={handleChange} errors={errors} />
 <InputField label="Closing Time" name="closeTime" type="time" formData={formData} handleChange={handleChange} errors={errors} />
 </div>
 </div>

 <div className="p-8 border-t border-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
   <Link to="/admin/branches">
     <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all">
       Cancel
     </button>
   </Link>
   <Button onClick={handleSaveAndFinish} disabled={isSubmitting} className="gap-2 px-8 shadow-sm">
     {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
     {isSubmitting ? 'Saving...' : 'Save Branch'}
   </Button>
 </div>
 </Card>
 </motion.div>
 </div>
 );
}
