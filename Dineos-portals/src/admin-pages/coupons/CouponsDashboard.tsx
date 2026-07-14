import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Tag, Calendar, ChevronLeft, ChevronRight, FileX, Scissors, Filter, Percent, CheckCircle2, PauseCircle, MoreVertical, Eye } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import DeleteCouponModal from './components/DeleteCouponModal';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useAuth } from '../../hooks/useAuth';
import { useCoupons, Coupon } from '../../hooks/useCoupons';
import { ref, remove } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function CouponsDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { canCreateCoupon, canDeleteCoupon } = useRoleAccess();
    const { coupons, loading: couponsLoading } = useCoupons();

    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isLoading, setIsLoading] = useState(false);

    // Modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Computed filtered data
    const filteredData = useMemo(() => {
        let result = coupons;

        if (searchQuery.length > 0) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter((c) => c.code.toLowerCase().includes(lowerQuery));
        }

        if (statusFilter !== 'All') {
            result = result.filter((c) => c.status === statusFilter);
        }

        return result;
    }, [coupons, searchQuery, statusFilter]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

    const handleDeleteClick = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedCoupon && user) {
            setIsLoading(true);
            try {
                const couponRef = ref(rtdb, `coupons/${user.uid}/${selectedCoupon.id}`);
                await remove(couponRef);
                toast.success('Coupon deleted successfully!');
                setDeleteModalOpen(false);
            } catch (error) {
                console.error('Error deleting coupon:', error);
                toast.error('Failed to delete coupon. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const getPageNumbers = () => {
        if (!totalPages || !currentPage) return [];
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const handleClearFilters = () => {
        setSearchInput('');
        setSearchQuery('');
        setStatusFilter('All');
    };

    const getCodeColor = (code: string) => {
        const colors = [
            { bg: 'bg-[#FFF3E8]', text: 'text-[#FF6B00]', border: 'border-[#FF6B00]' }, // Orange
            { bg: 'bg-[#E5F5ED]', text: 'text-[#00A254]', border: 'border-[#00A254]' }, // Green
            { bg: 'bg-[#F3E8FF]', text: 'text-[#A855F7]', border: 'border-[#A855F7]' }, // Purple
            { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', border: 'border-[#D97706]' }, // Yellow
            { bg: 'bg-[#FFF0F2]', text: 'text-[#FF3B5C]', border: 'border-[#FF3B5C]' }, // Red
        ];
        let hash = 0;
        for (let i = 0; i < code.length; i++) {
            hash = code.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    if (couponsLoading) {
        return (
            <div className="flex justify-center items-center h-[500px]">
                <div className="w-8 h-8 animate-spin rounded-full border-4 border-[#FF6B00] border-t-transparent" />
            </div>
        );
    }

    if (coupons.length === 0) {
        return (
            <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col w-full px-4 sm:px-6 lg:px-8 pt-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex-1"
                >
                    <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-[#E8ECF4] bg-white/50 backdrop-blur-sm">
                        <div className="w-24 h-24 mb-6 rounded-full bg-[#FFF3E8] flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full bg-[#FFF3E8] animate-ping opacity-20"></div>
                            <Tag className="w-12 h-12 text-[#FF6B00] relative z-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1a1f36] mb-2">No Coupons Found</h2>
                        <p className="text-[#8896AB] max-w-md mx-auto mb-8">
                            You haven't created any promotional coupons yet. Create your first coupon to offer discounts, drive target audiences, and restrict location campaigns.
                        </p>
                        {canCreateCoupon && (
                            <Link to="/admin/coupons/new">
                                <Button className="font-bold py-3 px-8 shadow-md shadow-[#FF6B00]/20 text-base">
                                    <Plus className="w-5 h-5 mr-2 inline" />
                                    Create First Coupon
                                </Button>
                            </Link>
                        )}
                    </Card>
                </motion.div>
            </div>
        );
    }

    // KPI Calculations
    const activeCouponsCount = coupons.filter(c => c.status === 'Active').length;
    const inactiveCouponsCount = coupons.filter(c => c.status === 'Inactive' || c.status === 'Terminated').length;
    const activePercent = coupons.length > 0 ? ((activeCouponsCount / coupons.length) * 100).toFixed(2) : '0';
    const inactivePercent = coupons.length > 0 ? ((inactiveCouponsCount / coupons.length) * 100).toFixed(2) : '0';

    return (
        <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8 pb-10 pt-4">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <h1 className="text-[28px] font-black text-[#1a1f36] tracking-tight">Coupons</h1>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#8896AB] mt-1">
                        <span>Dashboard</span>
                        <span className="text-lg leading-none">›</span>
                        <span className="text-[#FF6B00]">Coupons</span>
                    </div>
                </motion.div>

                {canCreateCoupon && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                        <Link to="/admin/coupons/new">
                            <Button className="gap-2 shadow-md shadow-[#FF6B00]/20 font-bold px-6">
                                <Plus className="w-5 h-5" />
                                Add Coupon
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* KPI Cards */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border border-[#E8ECF4] shadow-sm rounded-2xl bg-white flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-[#FFF3E8] border-[6px] border-[#fff9f2] flex items-center justify-center text-[#FF6B00] shrink-0">
                        <Percent className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-[#1a1f36] mb-0.5">Total Coupons</p>
                        <h3 className="text-[32px] font-black text-[#1a1f36] leading-none mb-1">{coupons.length}</h3>
                        <p className="text-xs font-semibold text-[#8896AB]">
                            All coupons created
                        </p>
                    </div>
                </Card>

                <Card className="p-6 border border-[#E8ECF4] shadow-sm rounded-2xl bg-white flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-[#E5F5ED] border-[6px] border-[#f0f9f4] flex items-center justify-center text-[#00A254] shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-[#1a1f36] mb-0.5">Active Coupons</p>
                        <h3 className="text-[32px] font-black text-[#1a1f36] leading-none mb-1">{activeCouponsCount}</h3>
                        <p className="text-xs font-semibold text-[#8896AB]">
                            <span className="text-[#00A254]">{activePercent}%</span> of total
                        </p>
                    </div>
                </Card>

                <Card className="p-6 border border-[#E8ECF4] shadow-sm rounded-2xl bg-white flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-[#FFF0F2] border-[6px] border-[#fff7f8] flex items-center justify-center text-[#FF3B5C] shrink-0">
                        <PauseCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-[#1a1f36] mb-0.5">Inactive Coupons</p>
                        <h3 className="text-[32px] font-black text-[#1a1f36] leading-none mb-1">{inactiveCouponsCount}</h3>
                        <p className="text-xs font-semibold text-[#8896AB]">
                            <span className="text-[#FF3B5C]">{inactivePercent}%</span> of total
                        </p>
                    </div>
                </Card>
            </motion.div>

            {/* Main Table Area */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Card className="p-0 overflow-hidden border border-[#E8ECF4] shadow-sm bg-white flex flex-col min-h-[500px] rounded-2xl">

                    {/* Filter Bar */}
                    <div className="bg-white border-b border-[#E8ECF4] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
                            <div className="relative flex-1 md:w-[320px]">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896AB]" />
                                <input
                                    type="text"
                                    placeholder="Search coupon by name or code..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8ECF4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all shadow-sm placeholder:text-[#8896AB]"
                                />
                            </div>

                            <button
                                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                                className={`md:hidden p-2.5 border rounded-xl transition-all shadow-sm shrink-0 ${isMobileFilterOpen ? 'bg-[#FFF3E8] border-[#FF6B00]/20 text-[#FF6B00]' : 'bg-white border-[#E8ECF4] text-[#8896AB]'}`}
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>

                        <div className={`md:flex ${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col md:flex-row items-center gap-3 w-full md:w-auto`}>
                            <div className="w-full md:w-[180px]">
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    options={[
                                        { value: 'All', label: 'All Status' },
                                        { value: 'Active', label: 'Active' },
                                        { value: 'Inactive', label: 'Inactive' },
                                        { value: 'Terminated', label: 'Terminated' }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 flex flex-col relative bg-white space-y-4">
                        {isLoading && (
                            <div className="absolute inset-0 flex justify-center items-center bg-white/50 z-10 backdrop-blur-sm">
                                <div className="w-8 h-8 animate-spin rounded-full border-4 border-[#FF6B00]/30 border-t-[#FF6B00]" />
                            </div>
                        )}

                        {paginatedData.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-[#8896AB] py-16">
                                <FileX className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-bold text-[#1a1f36]">No coupons found.</p>
                                <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left border-collapse min-w-[900px] whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-[#E8ECF4]">
                                            <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider">Discount</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider">Valid Until</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F4F6FA]">
                                        {paginatedData.map((coupon, i) => {
                                            const isActive = coupon.status === 'Active';
                                            const isTerminated = coupon.status === 'Terminated';
                                            const codeColor = getCodeColor(coupon.code);

                                            return (
                                            <motion.tr
                                                key={coupon.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                                className="hover:bg-gray-50/50 transition-colors group"
                                            >
                                                <td className="px-6 py-5">
                                                    <span className="font-bold text-[#1a1f36] text-[15px] uppercase tracking-wider">
                                                        {coupon.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="font-bold text-[#1a1f36] text-[15px]">
                                                        {coupon.discountType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-[#1a1f36] text-[15px]">
                                                            {coupon.discountType === 'Percentage' ? `${coupon.discountPercentage}% OFF` : `₹${coupon.maxDiscountAmount} OFF`}
                                                        </span>
                                                        <span className="text-xs font-medium text-[#8896AB] mt-0.5">
                                                            {coupon.minOrderValue ? `Min. Order ₹${coupon.minOrderValue}` : 'No Min Order'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[13px] font-bold text-[#8896AB] flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 opacity-70" />
                                                        {new Date(coupon.validUntil).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg border border-dashed font-bold text-xs uppercase tracking-wider ${
                                                        isActive ? 'bg-[#E5F5ED] text-[#00A254] border-[#00A254]' : isTerminated ? 'bg-gray-100 text-[#8896AB] border-[#8896AB]' : 'bg-[#FFF0F2] text-[#FF3B5C] border-[#FF3B5C]'
                                                    }`}>
                                                        {coupon.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <Link to={`/admin/coupons/${coupon.id}`} className="p-2 text-[#8896AB] hover:text-[#1a1f36] hover:bg-gray-100 rounded-lg transition-all" title="View Details">
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link to={`/admin/coupons/${coupon.id}/edit`} className="p-2 text-[#8896AB] hover:text-[#FF6B00] hover:bg-[#FFF3E8] rounded-lg transition-all" title="Edit Coupon">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                        {canDeleteCoupon && (
                                                            <button onClick={() => handleDeleteClick(coupon)} className="p-2 text-[#8896AB] hover:text-[#FF3B5C] hover:bg-[#FFF0F2] rounded-lg transition-all" title="Delete Coupon">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!isLoading && totalPages > 0 && (
                        <div className="mt-auto px-6 py-4 border-t border-[#E8ECF4] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-[#8896AB] font-medium">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of <span className="font-bold text-[#1a1f36]">{filteredData.length}</span> coupons
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8ECF4] text-[#8896AB] hover:bg-gray-50 hover:text-[#1a1f36] transition-all disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    {getPageNumbers().map((page, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                                            disabled={page === '...'}
                                            className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                                page === currentPage
                                                    ? 'border border-[#FF6B00] text-[#FF6B00] bg-[#FFF3E8]'
                                                    : page === '...'
                                                        ? 'text-[#8896AB] cursor-default'
                                                        : 'text-[#8896AB] hover:text-[#1a1f36] hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E8ECF4] text-[#8896AB] hover:bg-gray-50 hover:text-[#1a1f36] transition-all disabled:opacity-50"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center border border-[#E8ECF4] rounded-lg px-2 h-8 hover:bg-gray-50 transition-colors">
                                    <select 
                                        value={itemsPerPage} 
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="bg-transparent text-sm font-bold text-[#1a1f36] outline-none cursor-pointer pr-1"
                                    >
                                        <option value={5}>5 / page</option>
                                        <option value={10}>10 / page</option>
                                        <option value={20}>20 / page</option>
                                        <option value={50}>50 / page</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Modals */}
            <DeleteCouponModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                couponCode={selectedCoupon?.code || ''}
            />
        </div>
    );
}
