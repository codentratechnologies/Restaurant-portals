import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowLeft, ChevronDown, Edit2, Loader2, Calendar, 
    ShoppingCart, Users, Tag, Lock, User, Percent, Info, IndianRupee, CheckSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
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
    if (today < validFrom) return 'Inactive';
    else if (today > validUntil) return 'Terminated';
    return 'Active';
};

export default function CouponDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { canEditCoupon } = useRoleAccess();
    const { branches } = useBranches();
    const [couponInfo, setCouponInfo] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
            </div>
        );
    }

    if (!couponInfo) return null;

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `${day}, ${time}`;
    };

    const branchesList = couponInfo.applicableBranches || ['All Branches'];
    const branchNames = branchesList.includes('All Branches')
        ? 'All Restaurants'
        : branchesList.map((branchId: string) => branches.find((b) => b.id === branchId)?.name || branchId).join(', ');

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto space-y-6">
            
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm font-semibold text-[#8896AB] mb-2 gap-2">
                <Link to="/admin/coupons" className="hover:text-[#1a1f36] transition-colors">Coupons</Link>
                <ChevronDown className="w-3 h-3 -rotate-90" />
                <span className="text-[#1a1f36]">Coupon Details</span>
            </div>

            {/* Header */}
            <div className="flex flex-row items-start justify-between gap-4 mb-6">
                <div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white border border-[#E8ECF4] rounded-lg text-sm font-bold text-[#1a1f36] hover:bg-[#F8FAFC] transition-colors shadow-sm mb-4 w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Coupons</span>
                        <span className="sm:hidden">Back</span>
                    </button>
                    <h1 className="text-2xl sm:text-[28px] font-black text-[#1a1f36] tracking-tight">Coupon Details</h1>
                    <p className="text-xs sm:text-sm font-medium text-[#8896AB] mt-1">View detailed information about this coupon.</p>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 mt-1 sm:mt-0">
                    {canEditCoupon && (
                        <Link to={`/admin/coupons/${id}/edit`}>
                            <button className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-5 sm:py-2.5 bg-white border border-[#FF6B00] rounded-xl text-sm font-bold text-[#FF6B00] hover:bg-[#FFF3E8] transition-colors shadow-sm">
                                <Edit2 className="w-5 h-5 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline sm:ml-2">Edit Coupon</span>
                            </button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Main Ticket Card */}
            <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-center">
                
                {/* Ticket Side */}
                <div className="relative shrink-0 w-full lg:w-[280px] h-[160px] bg-[#FFF8F3] border-[2px] border-dashed border-[#FFD0B5] rounded-2xl flex flex-col items-center justify-center">
                    {/* Cutouts */}
                    <div className="absolute top-1/2 -left-[14px] -translate-y-1/2 w-7 h-7 bg-white rounded-full"></div>
                    <div className="absolute top-1/2 -right-[14px] -translate-y-1/2 w-7 h-7 bg-white rounded-full"></div>
                    
                    <p className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider mb-2">Coupon Code</p>
                    <h2 className="text-4xl font-black text-[#FF6B00] tracking-tight">{couponInfo.code}</h2>
                </div>

                {/* Details Side */}
                <div className="flex-1 flex flex-col w-full py-2">
                    <div className="flex items-center gap-4 mb-4">
                        <Badge 
                            variant={couponInfo.status === 'Active' ? 'success' : couponInfo.status === 'Terminated' ? 'error' : 'warning'} 
                            className="font-black px-3 py-1.5 text-xs rounded uppercase tracking-wider shadow-sm"
                        >
                            {couponInfo.status}
                        </Badge>
                    </div>
                    <p className="text-sm font-medium text-[#8896AB] mb-8">
                        {couponInfo.discountType === 'Percentage' 
                            ? `Flat ${couponInfo.discountPercentage}% off on orders above ₹${couponInfo.minOrderValue || '0'}`
                            : `Flat ₹${couponInfo.maxDiscountAmount} off on orders above ₹${couponInfo.minOrderValue || '0'}`
                        }
                    </p>

                    {/* 4 Column Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FFF3E8] flex items-center justify-center shrink-0">
                                <Tag className="w-5 h-5 text-[#FF6B00]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-[#8896AB] mb-0.5 whitespace-nowrap">Discount Type</p>
                                <p className="text-[13px] font-bold text-[#1a1f36]">
                                    {couponInfo.discountType === 'Percentage' ? 'Percentage' : 'Flat Amount'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FFF3E8] flex items-center justify-center shrink-0">
                                {couponInfo.discountType === 'Percentage' ? <Percent className="w-5 h-5 text-[#FF6B00]" /> : <IndianRupee className="w-5 h-5 text-[#FF6B00]" />}
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-[#8896AB] mb-0.5 whitespace-nowrap">Discount Value</p>
                                <p className="text-[13px] font-bold text-[#1a1f36]">
                                    {couponInfo.discountType === 'Percentage' ? `${couponInfo.discountPercentage}%` : `₹${couponInfo.maxDiscountAmount}.00`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F4F6FA] flex items-center justify-center shrink-0">
                                <ShoppingCart className="w-5 h-5 text-[#8896AB]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-[#8896AB] mb-0.5 whitespace-nowrap">Min. Order Value</p>
                                <p className="text-[13px] font-bold text-[#1a1f36]">
                                    {couponInfo.minOrderValue ? `₹${couponInfo.minOrderValue}.00` : 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#F4F6FA] flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 text-[#8896AB]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-[#8896AB] mb-0.5 whitespace-nowrap">Applies To</p>
                                <p className="text-[13px] font-bold text-[#1a1f36]">
                                    {couponInfo.targetAudience === 'Existing Users' ? 'Existing Users' : couponInfo.targetAudience === 'New Users' ? 'New Users' : 'All Users'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Validity */}
                <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF3E8] flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-[#FF6B00]" />
                        </div>
                        <h3 className="text-lg font-black text-[#1a1f36]">Validity</h3>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 text-[#8896AB]">
                                <Calendar className="w-4 h-4 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold">Valid From</span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-[#1a1f36] text-right">{formatDateTime(couponInfo.validFrom)}</span>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 text-[#8896AB]">
                                <Calendar className="w-4 h-4 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold">Valid Until</span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-[#1a1f36] text-right">{formatDateTime(couponInfo.validUntil)}</span>
                        </div>
                        <div className="flex flex-row items-start justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 text-[#8896AB] mt-0.5">
                                <CheckSquare className="w-4 h-4 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold">Applicable On</span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-[#1a1f36] text-right leading-snug">{branchNames}</span>
                        </div>
                    </div>
                </div>

                {/* System Information */}
                <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF3E8] flex items-center justify-center">
                            <Info className="w-4 h-4 text-[#FF6B00]" />
                        </div>
                        <h3 className="text-lg font-black text-[#1a1f36]">System Information</h3>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 text-[#8896AB]">
                                <Info className="w-4 h-4 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold">Coupon ID</span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-[#1a1f36]">{couponInfo.id.substring(0,8).toUpperCase()}</span>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 text-[#8896AB]">
                                <Calendar className="w-4 h-4 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold">Created At</span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-[#1a1f36] text-right">{formatDateTime(couponInfo.created_at)}</span>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 text-[#8896AB]">
                                <Edit2 className="w-4 h-4 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold">Last Updated</span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-[#1a1f36] text-right">{formatDateTime(couponInfo.updated_at)}</span>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 text-[#8896AB]">
                                <CheckSquare className="w-4 h-4 shrink-0" />
                                <span className="text-xs sm:text-sm font-bold">Current Status</span>
                            </div>
                            <Badge 
                                variant={couponInfo.status === 'Active' ? 'success' : couponInfo.status === 'Terminated' ? 'error' : 'warning'} 
                                className="font-black px-2.5 py-1 text-[10px] sm:text-[11px] rounded uppercase tracking-wider"
                            >
                                {couponInfo.status}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
