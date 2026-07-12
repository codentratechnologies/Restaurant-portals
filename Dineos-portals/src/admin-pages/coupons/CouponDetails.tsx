import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Tag, Calendar, Users, Store, Edit2, Loader2, Copy, CheckCircle, ChevronRight, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

const getDynamicStatus = (validFromStr: string, validUntilStr: string): 'Active' | 'Inactive' | 'Terminated' => {
 if (!validFromStr || !validUntilStr) return 'Active';
 
 const today = new Date();
 today.setHours(0, 0, 0, 0);

 const validFrom = new Date(validFromStr);
 validFrom.setHours(0, 0, 0, 0);

 const validUntil = new Date(validUntilStr);
 validUntil.setHours(0, 0, 0, 0);

 if (today < validFrom) {
 return 'Inactive';
 } else if (today > validUntil) {
 return 'Terminated';
 } else {
 return 'Active';
 }
};

export default function CouponDetails() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();
 const { canEditCoupon } = useRoleAccess();
 const { branches } = useBranches();

 const [couponInfo, setCouponInfo] = useState<any | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [copied, setCopied] = useState(false);

 const handleCopyCode = () => {
 if (couponInfo?.code) {
 navigator.clipboard.writeText(couponInfo.code);
 setCopied(true);
 toast.success('Coupon Code copied!');
 setTimeout(() => setCopied(false), 2000);
 }
 };

 useEffect(() => {
 const fetchCoupon = async () => {
 if (!user || !id) return;
 try {
 const snapshot = await get(ref(rtdb, `coupons/${user.uid}/${id}`));
 if (snapshot.exists()) {
 const data = snapshot.val();
 setCouponInfo({ 
 id, 
 ...data,
 status: getDynamicStatus(data.validFrom, data.validUntil)
 });
 } else {
 toast.error('Coupon not found');
 navigate('/admin/coupons');
 }
 } catch (err) {
 console.error('Error fetching coupon details:', err);
 toast.error('Failed to load coupon details');
 } finally {
 setIsLoading(false);
 }
 };
 fetchCoupon();
 }, [user, id, navigate]);

 if (isLoading) {
 return (
 <div className="flex justify-center items-center h-[500px]">
 <Loader2 className="w-8 h-8 animate-spin text-brand-orange-500" />
 </div>
 );
 }

 if (!couponInfo) return null;

 // Resolve applicable branch names
 const branchesList = couponInfo.applicableBranches || ['All Branches'];
 const branchNames = branchesList.includes('All Branches')
 ? 'All Branches'
 : branchesList
 .map((branchId: string) => branches.find((b) => b.id === branchId)?.name || branchId)
 .join(', ');

 const formattedValidFrom = new Date(couponInfo.validFrom).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 });

 const formattedValidUntil = new Date(couponInfo.validUntil).toLocaleDateString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 });

 const formattedCreatedAt = couponInfo.created_at
 ? new Date(couponInfo.created_at).toLocaleString('en-US', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })
 : 'N/A';

 const formattedUpdatedAt = couponInfo.updated_at
 ? new Date(couponInfo.updated_at).toLocaleString('en-US', {
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
 
 </div>

 {/* ZONE 1: Premium Hero Header */}
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative z-10">
 <Card className="p-6 sm:p-8 bg-gradient-to-r from-brand-orange-500/10 via-brand-orange-500/5 to-white border border-brand-orange-500/20 shadow-premium overflow-hidden relative rounded-2xl flex flex-col">
 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none"></div>
 
 <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
 <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-brand-orange-50 to-orange-100 border-4 border-white rounded-2xl shadow-md flex items-center justify-center shrink-0 overflow-hidden relative">
 <div className="absolute inset-0 bg-brand-orange-50/50"></div>
 <Tag className="w-12 h-12 sm:w-16 sm:h-16 text-brand-orange-500 relative z-10" />
 </div>
 
 <div className="flex-1 space-y-3 text-center sm:text-left mt-2 sm:mt-4">
 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
 <h1 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
 {couponInfo.code}
 </h1>
 <Badge 
 variant={
 couponInfo.status === 'Active' ? 'success' : 
 couponInfo.status === 'Terminated' ? 'error' : 
 'warning'
 } 
 className="font-black px-3 py-1 shadow-sm uppercase tracking-widest text-[11px] rounded-md"
 >
 {couponInfo.status}
 </Badge>
 </div>
 
 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
 <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-brand-orange-500/20 cursor-pointer hover:bg-white transition-colors shadow-sm" onClick={handleCopyCode} title="Copy Coupon Code">
 <span className="font-mono font-bold text-xs text-brand-navy">{couponInfo.code}</span>
 {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-text-secondary" />}
 </div>
 <span className="text-text-secondary/50">•</span>
 <div className="text-sm font-bold text-brand-navy flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1 rounded border border-brand-orange-500/20 shadow-sm">
 <span className="text-brand-orange-600 font-black">
 {couponInfo.discountType === 'Percentage' ? `${couponInfo.discountPercentage}%` : `₹${couponInfo.maxDiscountAmount}`}
 </span>
 OFF
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
 {/* Discount Details Card */}
 <Card className="p-6 border border-border/40 shadow-sm bg-white hover:shadow-premium transition-shadow rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full pointer-events-none opacity-50"></div>
 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="p-2.5 bg-blue-50 rounded-xl shadow-inner border border-blue-100"><Tag className="w-5 h-5 text-blue-600" /></div>
 <h3 className="text-lg font-black text-brand-navy">Discount Specs</h3>
 </div>
 <div className="space-y-5 relative z-10">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Discount Type</p>
 <p className="font-bold text-brand-navy bg-gray-50 px-3 py-2 rounded-xl border border-border/50 inline-block">
 {couponInfo.discountType}
 </p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Value</p>
 <p className="font-black text-brand-orange-600 bg-orange-50/50 p-3 rounded-xl border border-brand-orange-100/50 inline-block">
 {couponInfo.discountType === 'Percentage' ? `${couponInfo.discountPercentage}%` : `₹${couponInfo.maxDiscountAmount}`}
 </p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Minimum Order Value</p>
 <p className="font-bold text-brand-navy bg-gray-50 p-3 rounded-xl border border-border/50 inline-block">
 {couponInfo.minOrderValue ? `₹${couponInfo.minOrderValue}` : 'No Minimum'}
 </p>
 </div>
 </div>
 </Card>

 {/* Conditions & Targeting Card */}
 <Card className="p-6 border border-border/40 shadow-sm bg-white hover:shadow-premium transition-shadow rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full pointer-events-none opacity-50"></div>
 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="p-2.5 bg-purple-50 rounded-xl shadow-inner border border-purple-100"><Users className="w-5 h-5 text-purple-600" /></div>
 <h3 className="text-lg font-black text-brand-navy">Targeting & Validity</h3>
 </div>
 <div className="space-y-5 relative z-10">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Valid Period</p>
 <p className="font-bold text-brand-navy bg-gray-50 p-3 rounded-xl border border-border/50 flex items-center gap-2">
 <Calendar className="w-4 h-4 text-brand-orange-500" /> {formattedValidFrom} - {formattedValidUntil}
 </p>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Target Audience</p>
 <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm ${
 couponInfo.targetAudience === 'New Users' ? 'bg-green-50 text-green-700 border border-green-200/50' :
 couponInfo.targetAudience === 'Existing Users' ? 'bg-blue-50 text-blue-700 border border-blue-200/50' :
 'bg-purple-50 text-purple-700 border border-purple-200/50'
 }`}>
 {couponInfo.targetAudience}
 </span>
 </div>
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Applicable Branches</p>
 <p className="font-bold text-brand-navy flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-border/50">
 <Store className="w-4 h-4 text-brand-orange-500 shrink-0 mt-0.5" /> 
 <span className="leading-snug">{branchNames}</span>
 </p>
 </div>
 </div>
 </Card>

 {/* Audit Trail Card */}
 <Card className="p-6 border border-border/40 shadow-sm bg-white hover:shadow-premium transition-shadow rounded-2xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full pointer-events-none opacity-50"></div>
 <div className="flex items-center gap-3 mb-6 relative z-10">
 <div className="p-2.5 bg-gray-100 rounded-xl shadow-inner border border-gray-200"><Hash className="w-5 h-5 text-gray-600" /></div>
 <h3 className="text-lg font-black text-brand-navy">System Information</h3>
 </div>
 <div className="space-y-5 relative z-10">
 <div>
 <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Coupon DB ID</p>
 <p className="font-mono font-bold text-brand-navy bg-gray-50 px-3 py-2 rounded-xl border border-border/50 inline-block">
 {couponInfo.couponId || couponInfo.id.substring(0, 8).toUpperCase()}
 </p>
 </div>
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
