import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { useCoupons } from '../../hooks/useCoupons';
import { ref, set } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function CreateCoupon() {
 const navigate = useNavigate();
 const { user } = useAuth();
 const { canCreateCoupon } = useRoleAccess();
 const { branches, loading: branchesLoading } = useBranches();
 const { coupons, loading: couponsLoading } = useCoupons();

 useEffect(() => {
 if (!canCreateCoupon) {
 navigate('/admin/coupons');
 }
 }, [canCreateCoupon, navigate]);

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

 const [applyToAllBranches, setApplyToAllBranches] = useState(false);
 const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
 const [dropdownOpen, setDropdownOpen] = useState(false);
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);

 const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});
 const dropdownRef = useRef<HTMLDivElement | null>(null);

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

 const validate = () => {
 const newErrors: Record<string, string> = {};

 // Coupon Code
 if (!formData.code) {
 newErrors.code = 'Coupon code is required';
 } else if (formData.code.length < 4) {
 newErrors.code = 'Coupon code must be at least 4 characters';
 } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
 newErrors.code = 'Coupon code must be uppercase alphanumeric only';
 } else if (coupons.some(c => c.code.toUpperCase() === formData.code.toUpperCase())) {
 newErrors.code = 'Coupon code already exists in the database';
 }

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
 const today = new Date();
 today.setHours(0, 0, 0, 0);

 if (!formData.validFrom) {
 newErrors.validFrom = 'Valid From date is required';
 } else {
 const fromDate = new Date(formData.validFrom);
 fromDate.setHours(0, 0, 0, 0);
 if (fromDate < today) {
 newErrors.validFrom = 'Valid From cannot be a past date';
 }
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
 
 const processedValue = name === 'code' ? value.toUpperCase() : value;
 
 setFormData(prev => ({ ...prev, [name]: processedValue }));
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

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!validate()) return;
 if (!user) return;
 
 setIsSubmitting(true);
 
 try {
 let nextIdNumber = 1;
 coupons.forEach(c => {
 if (c.couponId && c.couponId.startsWith('C')) {
 const num = parseInt(c.couponId.substring(1), 10);
 if (!isNaN(num) && num >= nextIdNumber) {
 nextIdNumber = num + 1;
 }
 }
 });
 const couponId = `C${String(nextIdNumber).padStart(3, '0')}`;
 
 const newCouponRef = ref(rtdb, `coupons/${user.uid}/${couponId}`);
 
 const payload = {
 couponId: couponId,
 code: formData.code.toUpperCase(),
 status: 'Active',
 discountType: formData.discountType,
 discountPercentage: formData.discountType === 'Percentage' && formData.discountPercentage ? Number(formData.discountPercentage) : null,
 maxDiscountAmount: formData.discountType === 'Flat' && formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
 minOrderValue: Number(formData.minOrderValue),
 validFrom: formData.validFrom,
 validUntil: formData.validUntil,
 targetAudience: formData.targetAudience,
 applicableBranches: applyToAllBranches ? ['All Branches'] : selectedBranches,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 };
 
 // Clean payload
 Object.keys(payload).forEach(key => {
 if ((payload as any)[key] === undefined) {
 delete (payload as any)[key];
 }
 });

 await set(newCouponRef, payload);
 toast.success('Coupon created successfully!');
 navigate('/admin/coupons');
 } catch (error) {
 console.error('Error creating coupon:', error);
 toast.error('Failed to create coupon. Please try again.');
 } finally {
 setIsSubmitting(false);
 }
 };
 if (!canCreateCoupon || couponsLoading) {
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
 <h1 className="text-2xl font-black text-brand-navy tracking-tight">Create New Coupon</h1>
 <p className="text-text-secondary mt-0.5 text-sm font-medium">Add a new promotion for your customers.</p>
 </motion.div>
 </div>
 
 </div>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-visible">
 <form id="create-coupon-form" onSubmit={handleSubmit} className="flex flex-col">
 
 {/* SECTION 1: Basic Details */}
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Basic Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div ref={el => { errorRefs.current[''] = el; }}>
 <div className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">Coupon Code <span className="text-brand-orange-500">*</span></label>
 <input
 name="code"
 value={formData.code}
 onChange={handleChange}
 placeholder="e.g. SUMMER20"
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all uppercase ${
 errors.code ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 {errors.code ? (
 <motion.span initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-xs font-bold text-red-500 mt-0.5">{errors.code}</motion.span>
 ) : (
 <span className="text-xs text-text-secondary font-medium mt-0.5">Will be automatically converted to uppercase.</span>
 )}
 </div>
 </div>

 <div ref={el => { errorRefs.current[''] = el; }}>
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
 <div ref={el => { errorRefs.current[''] = el; }}>
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
 <div ref={el => { errorRefs.current[''] = el; }}>
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
 
 <div ref={el => { errorRefs.current[''] = el; }}>
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

 <div ref={el => { errorRefs.current[''] = el; }}>
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

 <div ref={el => { errorRefs.current[''] = el; }}>
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

 <div ref={el => { errorRefs.current[''] = el; }}>
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

 <div ref={el => { errorRefs.current[''] = el; }}>
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

   <div className="p-8 border-t border-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
 <Link to="/admin/coupons">
 <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all">
 Cancel
 </button>
 </Link>
 <Button form="create-coupon-form" type="submit" disabled={isSubmitting} className="gap-2 px-8 shadow-sm">
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 {isSubmitting ? 'Saving...' : 'Save Coupon'}
 </Button>
 </div>
        </form>
 </Card>
 </motion.div>
 </div>
 );
}

