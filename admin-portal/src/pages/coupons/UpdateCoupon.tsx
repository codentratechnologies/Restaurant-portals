import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { ref, get, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function UpdateCoupon() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();
 const { canEditCoupon } = useRoleAccess();
 const { branches, loading: branchesLoading } = useBranches();
 
 useEffect(() => {
 if (!canEditCoupon) {
 navigate('/coupons');
 }
 }, [canEditCoupon, navigate]);

 const [formData, setFormData] = useState({
 code: '',
 discountType: 'Percentage',
 discountPercentage: '',
 maxDiscountAmount: '',
 minOrderValue: '',
 validFrom: '',
 validUntil: '',
 targetAudience: 'All', // 'All', 'New Users'
 });

 const [initialData, setInitialData] = useState(formData);
 const [applyToAllBranches, setApplyToAllBranches] = useState(true);
 const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
 const [initialBranches, setInitialBranches] = useState<string[]>([]);
 const [dropdownOpen, setDropdownOpen] = useState(false);
 
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isLoading, setIsLoading] = useState(true);

 const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});
 const dropdownRef = useRef<HTMLDivElement | null>(null);

 // Fetch initial coupon data
 useEffect(() => {
 const fetchCoupon = async () => {
 if (!user || !id) return;
 try {
 const snapshot = await get(ref(rtdb, `coupons/${user.uid}/${id}`));
 if (snapshot.exists()) {
 const data = snapshot.val();
 const loadedData = {
 code: data.code || '',
 discountType: data.discountType || 'Percentage',
 discountPercentage: data.discountPercentage ? String(data.discountPercentage) : '',
 maxDiscountAmount: data.maxDiscountAmount ? String(data.maxDiscountAmount) : '',
 minOrderValue: data.minOrderValue ? String(data.minOrderValue) : '',
 validFrom: data.validFrom || '',
 validUntil: data.validUntil || '',
 targetAudience: data.targetAudience || 'All',
 };
 setFormData(loadedData);
 setInitialData(loadedData);
 
 const branchesList = data.applicableBranches || ['All Branches'];
 const isAll = branchesList.includes('All Branches');
 setApplyToAllBranches(isAll);
 setSelectedBranches(isAll ? [] : branchesList);
 setInitialBranches(isAll ? [] : branchesList);
 } else {
 toast.error('Coupon not found.');
 navigate('/coupons');
 }
 } catch (err) {
 console.error('Error fetching coupon:', err);
 toast.error('Failed to load coupon details.');
 } finally {
 setIsLoading(false);
 }
 };
 fetchCoupon();
 }, [user, id, navigate]);

 // Close dropdown on click outside
 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setDropdownOpen(false);
 }
 }
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 // Unsaved changes detection
 useEffect(() => {
 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 const formChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
 const branchesChanged = 
 applyToAllBranches !== (initialBranches.length === 0) ||
 JSON.stringify(selectedBranches.sort()) !== JSON.stringify(initialBranches.sort());

 if (formChanged || branchesChanged) {
 e.preventDefault();
 e.returnValue = '';
 }
 };
 window.addEventListener('beforeunload', handleBeforeUnload);
 return () => window.removeEventListener('beforeunload', handleBeforeUnload);
 }, [formData, initialData, applyToAllBranches, selectedBranches, initialBranches]);

 const validate = () => {
 const newErrors: Record<string, string> = {};

 // Discount Fields
 if (formData.discountType === 'Percentage') {
 if (!formData.discountPercentage) {
 newErrors.discountPercentage = 'Discount Percentage is required';
 } else if (Number(formData.discountPercentage) <= 0 || Number(formData.discountPercentage) > 100) {
 newErrors.discountPercentage = 'Percentage must be between 1 and 100';
 }
 } else {
 if (!formData.maxDiscountAmount) {
 newErrors.maxDiscountAmount = 'Discount Amount is required';
 } else if (Number(formData.maxDiscountAmount) <= 0) {
 newErrors.maxDiscountAmount = 'Amount must be greater than 0';
 }
 }

 // Minimum Order Value
 if (!formData.minOrderValue) {
 newErrors.minOrderValue = 'Minimum Order Value is required';
 } else if (Number(formData.minOrderValue) < 0) {
 newErrors.minOrderValue = 'Minimum Order Value must be greater than or equal to 0';
 }

 // Dates
 if (!formData.validFrom) {
 newErrors.validFrom = 'Valid From date is required';
 }

 if (!formData.validUntil) {
 newErrors.validUntil = 'Valid Until date is required';
 } else if (formData.validFrom) {
 const fromDate = new Date(formData.validFrom);
 const untilDate = new Date(formData.validUntil);
 fromDate.setHours(0, 0, 0, 0);
 untilDate.setHours(0, 0, 0, 0);
 if (untilDate < fromDate) {
 newErrors.validUntil = 'Valid Until must be chronologically after or same as Valid From';
 }
 }

 // Applicable Branches
 if (!applyToAllBranches && selectedBranches.length === 0) {
 newErrors.applicableBranches = 'Select at least one branch or check Apply to All Branches';
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

 const handleBranchToggle = (branchId: string) => {
 setSelectedBranches(prev => {
 const updated = prev.includes(branchId)
 ? prev.filter(id => id !== branchId)
 : [...prev, branchId];
 if (errors.applicableBranches && updated.length > 0) {
 setErrors(err => ({ ...err, applicableBranches: '' }));
 }
 return updated;
 });
 };

 const handleAllBranchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setApplyToAllBranches(e.target.checked);
 if (e.target.checked) {
 setSelectedBranches([]);
 if (errors.applicableBranches) {
 setErrors(err => ({ ...err, applicableBranches: '' }));
 }
 }
 };

 const handleCancelClick = (e: React.MouseEvent) => {
 const formChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
 const branchesChanged = 
 applyToAllBranches !== (initialBranches.length === 0) ||
 JSON.stringify(selectedBranches.sort()) !== JSON.stringify(initialBranches.sort());

 if (formChanged || branchesChanged) {
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
 const couponRef = ref(rtdb, `coupons/${user.uid}/${id}`);
 
 const payload: any = {
 couponId: id,
 discountType: formData.discountType,
 discountPercentage: formData.discountType === 'Percentage' && formData.discountPercentage ? Number(formData.discountPercentage) : null,
 maxDiscountAmount: formData.discountType === 'Flat' && formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
 minOrderValue: Number(formData.minOrderValue),
 validFrom: formData.validFrom,
 validUntil: formData.validUntil,
 targetAudience: formData.targetAudience,
 applicableBranches: applyToAllBranches ? ['All Branches'] : selectedBranches,
 updated_at: new Date().toISOString()
 };

 Object.keys(payload).forEach(key => {
 if (payload[key] === undefined) {
 delete payload[key];
 }
 });
 
 await update(couponRef, payload);
 
 setInitialData(formData);
 setInitialBranches(applyToAllBranches ? [] : selectedBranches);
 toast.success('Coupon updated successfully!');
 navigate('/coupons');
 } catch (error) {
 console.error('Error updating coupon:', error);
 toast.error('Failed to update coupon. Please try again.');
 } finally {
 setIsSubmitting(false);
 }
 };

 if (!canEditCoupon) return null;

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
 <h1 className="text-2xl font-black text-brand-navy tracking-tight">Update Coupon &mdash; {formData.code}</h1>
 <p className="text-text-secondary mt-0.5 text-sm font-medium">Modify existing promotion settings.</p>
 </motion.div>
 </div>
 <div className="flex items-center gap-3">
 <Link to="/coupons" onClick={handleCancelClick}>
 <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all">
 Cancel
 </button>
 </Link>
 <Button form="update-coupon-form" type="submit" disabled={isSubmitting} className="gap-2 px-8 shadow-sm">
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 {isSubmitting ? 'Saving...' : 'Save Coupon'}
 </Button>
 </div>
 </div>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-visible">
 <form id="update-coupon-form" onSubmit={handleSubmit} className="flex flex-col">
 
 {/* SECTION 1: Basic Details */}
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Basic Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div ref={el => errorRefs.current['code'] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Coupon Code</label>
 <input
 name="code"
 value={formData.code}
 readOnly
 disabled
 className="w-full px-4 py-2.5 bg-gray-100 border border-border rounded-xl text-sm font-bold text-text-secondary cursor-not-allowed"
 />
 <span className="text-xs text-text-secondary font-medium mt-0.5">Coupon code cannot be changed once created.</span>
 </div>
 </div>

 <div ref={el => errorRefs.current['discountType'] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">Discount Type <span className="text-brand-orange-500">*</span></label>
 <Select
 name="discountType"
 value={formData.discountType}
 onChange={(e) => handleChange(e as any)}
 options={[
 { value: 'Percentage', label: 'Percentage (%)' },
 { value: 'Flat', label: 'Flat (₹)' }
 ]}
 />
 </div>
 </div>

 {formData.discountType === 'Percentage' ? (
 <div ref={el => errorRefs.current['discountPercentage'] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Discount Percentage <span className="text-brand-orange-500">*</span></label>
 <div className="relative">
 <input
 name="discountPercentage"
 type="number"
 value={formData.discountPercentage}
 onChange={handleChange}
 placeholder="20"
 className={`w-full pl-4 pr-8 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.discountPercentage ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">%</span>
 </div>
 {errors.discountPercentage && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.discountPercentage}</motion.span>}
 </div>
 </div>
 ) : (
 <div ref={el => errorRefs.current['maxDiscountAmount'] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Discount Amount <span className="text-brand-orange-500">*</span></label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">₹</span>
 <input
 name="maxDiscountAmount"
 type="number"
 value={formData.maxDiscountAmount}
 onChange={handleChange}
 placeholder="150"
 className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.maxDiscountAmount ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 </div>
 {errors.maxDiscountAmount && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.maxDiscountAmount}</motion.span>}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* SECTION 2: Conditions & Targeting */}
 <div className="p-8 border-t border-border bg-gray-50/30">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">2. Conditions & Targeting</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 <div ref={el => errorRefs.current['minOrderValue'] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Minimum Order Value <span className="text-brand-orange-500">*</span></label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">₹</span>
 <input
 name="minOrderValue"
 type="number"
 value={formData.minOrderValue}
 onChange={handleChange}
 placeholder="500"
 className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.minOrderValue ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 </div>
 {errors.minOrderValue && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.minOrderValue}</motion.span>}
 </div>
 </div>

 <div ref={el => errorRefs.current['validFrom'] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Valid From <span className="text-brand-orange-500">*</span></label>
 <input
 name="validFrom"
 type="date"
 min={new Date().toISOString().split('T')[0]}
 value={formData.validFrom}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.validFrom ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 {errors.validFrom && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.validFrom}</motion.span>}
 </div>
 </div>

 <div ref={el => errorRefs.current['validUntil'] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Valid Until <span className="text-brand-orange-500">*</span></label>
 <input
 name="validUntil"
 type="date"
 min={formData.validFrom || new Date().toISOString().split('T')[0]}
 value={formData.validUntil}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.validUntil ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 {errors.validUntil && <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.validUntil}</motion.span>}
 </div>
 </div>

 <div ref={el => errorRefs.current['targetAudience'] = el}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Target Audience <span className="text-brand-orange-500">*</span></label>
 <Select
 name="targetAudience"
 value={formData.targetAudience}
 onChange={(e) => handleChange(e as any)}
 options={[
 { value: 'All', label: 'All' },
 { value: 'New Users', label: 'New Users' }
 ]}
 />
 </div>
 </div>

 <div ref={el => errorRefs.current['applicableBranches'] = el}>
 <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Applicable Branches <span className="text-brand-orange-500">*</span></label>
 <button
 type="button"
 onClick={() => setDropdownOpen(!dropdownOpen)}
 className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-sm font-medium text-left focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all flex items-center justify-between cursor-pointer"
 >
 <span className="truncate">
 {applyToAllBranches 
 ? 'All Branches' 
 : selectedBranches.length === 0 
 ? 'Select Branches' 
 : `${selectedBranches.length} branch(es) selected`}
 </span>
 <ChevronDown className="w-4 h-4 text-text-secondary shrink-0" />
 </button>

 {dropdownOpen && (
 <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-xl shadow-premium z-30 p-3 max-h-60 overflow-y-auto space-y-2.5">
 <label className="flex items-center gap-2.5 text-sm font-bold text-brand-navy cursor-pointer select-none pb-2 border-b border-border/50">
 <input
 type="checkbox"
 checked={applyToAllBranches}
 onChange={handleAllBranchesChange}
 className="w-4 h-4 rounded border-gray-300 text-brand-orange-600 focus:ring-brand-orange-500 cursor-pointer"
 />
 All Branches
 </label>

 {!applyToAllBranches && (
 <div className="space-y-2 pt-1">
 {branchesLoading ? (
 <div className="text-xs text-text-secondary font-medium">Loading branches...</div>
 ) : branches.map(b => (
 <label key={b.id} className="flex items-center gap-2.5 text-sm font-semibold text-brand-navy cursor-pointer select-none">
 <input
 type="checkbox"
 checked={selectedBranches.includes(b.id)}
 onChange={() => handleBranchToggle(b.id)}
 className="w-4 h-4 rounded border-gray-300 text-brand-orange-600 focus:ring-brand-orange-500 cursor-pointer"
 />
 {b.name} {b.city ? `(${b.city})` : ''}
 </label>
 ))}
 </div>
 )}
 </div>
 )}
 {errors.applicableBranches && <span className="text-xs font-bold text-red-500 mt-1">{errors.applicableBranches}</span>}
 </div>
 </div>

 </div>
 </div>

 </form>
 </Card>
 </motion.div>
 </div>
 );
}

