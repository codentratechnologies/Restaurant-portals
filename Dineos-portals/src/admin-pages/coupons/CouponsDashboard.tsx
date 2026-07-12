import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, Tag, Calendar, ChevronLeft, ChevronRight, FileX, Scissors } from 'lucide-react';
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

    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
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

        if (typeFilter !== 'All') {
            result = result.filter((c) => c.discountType === typeFilter);
        }

        return result;
    }, [coupons, searchQuery, statusFilter, typeFilter]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, typeFilter]);

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

    const handleRowClick = (coupon: Coupon) => {
        navigate(`/admin/coupons/${coupon.id}`);
    };

    if (couponsLoading) {
        return (
            <div className="flex justify-center items-center h-[500px]">
                <div className="w-8 h-8 animate-spin rounded-full border-4 border-brand-orange-200 border-t-brand-orange-500" />
            </div>
        );
    }

    if (coupons.length === 0) {
        return (
            <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">


                {/* Empty State Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex-1"
                >
                    <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border/60 bg-white/50 backdrop-blur-sm">
                        <div className="w-24 h-24 mb-6 rounded-full bg-brand-orange-50 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full bg-brand-orange-100 animate-ping opacity-20"></div>
                            <Tag className="w-12 h-12 text-brand-orange-500 relative z-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-navy mb-2">No Coupons Found</h2>
                        <p className="text-text-secondary max-w-md mx-auto mb-8">
                            You haven't created any promotional coupons yet. Create your first coupon to offer discounts, drive target audiences, and restrict location campaigns.
                        </p>
                        {canCreateCoupon && (
                            <Link to="/admin/coupons/new">
                                <Button className="font-bold py-3 px-8 shadow-premium text-base">
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

    return (
    <div className="space-y-0">

            {/* Main Content Area */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card className="p-0 overflow-hidden border border-border/50 shadow-soft bg-white flex flex-col min-h-[600px]">

                    {/* Filter Bar */}
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by Coupon Code..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 transition-all shadow-sm hover:bg-white focus:bg-white placeholder:text-text-secondary/60"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                            <div className="w-full md:w-[160px]">
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    options={[
                                        { value: 'All', label: 'All Statuses' },
                                        { value: 'Active', label: 'Active' },
                                        { value: 'Inactive', label: 'Inactive' },
                                        { value: 'Terminated', label: 'Terminated' }
                                    ]}
                                />
                            </div>

                            <div className="w-full md:w-[160px]">
                                <Select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    options={[
                                        { value: 'All', label: 'All Types' },
                                        { value: 'Percentage', label: 'Percentage' },
                                        { value: 'Flat', label: 'Flat' }
                                    ]}
                                />
                            </div>
                            {canCreateCoupon && (
                                <Link to="/admin/coupons/new" className="w-full md:w-auto">
                                    <Button className="w-full justify-center md:w-auto gap-2 shadow-sm font-bold bg-brand-orange-500 text-white border-0 hover:bg-brand-orange-600">
                                        <Plus className="w-4 h-4" />
                                        Create Coupon
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Coupon Records List */}
                    <div className="flex-1 flex flex-col relative bg-gray-50/30 p-4 sm:p-6 space-y-4">
                        {isLoading ? (
                            <div className="absolute inset-0 flex justify-center items-center bg-white/50 z-10 backdrop-blur-sm">
                                <div className="w-8 h-8 animate-spin rounded-full border-4 border-brand-orange-200 border-t-brand-orange-500" />
                            </div>
                        ) : null}

                        {paginatedData.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary py-12">
                                <FileX className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-medium text-lg">
                                    {searchQuery.length > 0 ? `No coupons found matching"${searchQuery}"` : 'No coupons found.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-2xl border border-border/50 shadow-sm">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-border/50">
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[25%]">Coupon Code</th>
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%]">Type</th>
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%]">Discount</th>
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[20%]">Valid Until</th>
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%]">Status</th>
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[10%] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {paginatedData.map((coupon, i) => {
                                            const isActive = coupon.status === 'Active';
                                            const isTerminated = coupon.status === 'Terminated';
                                            return (
                                            <motion.tr
                                                key={coupon.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                                className="hover:bg-gray-50/50 transition-colors group"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-brand-orange-50 text-brand-orange-500 flex items-center justify-center shrink-0 border border-brand-orange-100/50">
                                                            <Tag className="w-6 h-6" />
                                                        </div>
                                                        <span className="font-bold text-brand-navy text-lg truncate max-w-[200px]">{coupon.code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                                                        <Scissors className="w-4 h-4" />
                                                        {coupon.discountType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="font-black text-brand-navy text-base">
                                                        {coupon.discountType === 'Percentage' ? `${coupon.discountPercentage}%` : `₹${coupon.maxDiscountAmount}`}
                                                        <span className="text-xs font-bold text-text-secondary ml-1 uppercase tracking-wider">OFF</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(coupon.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <Badge variant={isActive ? 'success' : isTerminated ? 'error' : 'warning'} className="font-black px-2.5 py-1 shadow-sm uppercase tracking-widest text-[10px]">
                                                        {coupon.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <Link to={`/admin/coupons/${coupon.id}`} className="p-2 text-text-secondary hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-all" title="View Details">
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link to={`/admin/coupons/${coupon.id}/edit`} className="p-2 text-text-secondary hover:text-brand-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="Edit Coupon">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                        {canDeleteCoupon && (
                                                            <button onClick={() => handleDeleteClick(coupon)} className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Coupon">
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

                    {/* Pagination Footer */}
                    {!isLoading && totalPages > 0 && (
                        <div className="mt-auto px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 rounded-b-xl">
                            <p className="text-sm text-text-secondary font-medium">
                                Showing page <span className="font-bold text-brand-navy">{currentPage}</span> of <span className="font-bold text-brand-navy">{totalPages}</span>
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-white hover:text-brand-navy hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Prev</span>
                                </button>

                                <div className="hidden sm:flex items-center gap-1 px-2">
                                    {getPageNumbers().map((page, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                                            disabled={page === '...'}
                                            className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${page === currentPage
                                                    ? 'bg-brand-navy text-white shadow-sm'
                                                    : page === '...'
                                                        ? 'text-text-secondary cursor-default'
                                                        : 'text-text-secondary hover:bg-white hover:text-brand-navy hover:shadow-sm'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-text-secondary hover:bg-white hover:text-brand-navy hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
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
