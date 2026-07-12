import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UtensilsCrossed, Edit2, Eye, Leaf, EggFried, Drumstick, Plus, Pizza, ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Tooltip from '../../components/common/Tooltip';
import AvailabilityToggle from './components/AvailabilityToggle';
import DisableConfirmationModal from './components/DisableConfirmationModal';
import { useMenuItems, MenuItem } from '../../hooks/useMenuItems';
import { ref, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

const categories = [
    'All',
    'Appetizers', 'Soups', 'Salads', 'Shawarma',
    'Grills & BBQ', 'Mandi', 'Kabsa', 'Biryani',
    'Main Course', 'Seafood', 'Bakery', 'Desserts',
    'Beverages', 'Family Platters', 'Kids Menu', 'Combo Meals'
];
const dietaryTypes = ['All', 'Veg', 'Non-Veg', 'Egg'];

export default function FoodCatalog() {
    const { user } = useAuth();
    const { menuItems, loading: isLoading } = useMenuItems();
    const navigate = useNavigate();

    // Filters & Views
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [dietaryFilter, setDietaryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modals
    const [modalOpen, setModalOpen] = useState(false);
    const [itemToDisable, setItemToDisable] = useState<MenuItem | null>(null);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, categoryFilter, dietaryFilter, statusFilter]);

    // Derived filtered items
    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const q = debouncedSearch.toLowerCase();
            const matchesSearch = item.name.toLowerCase().includes(q) || (item.foodId?.toLowerCase() || '').includes(q);
            const itemCategories = item.categories || [];
            const matchesCategory = categoryFilter === 'All' || itemCategories.includes(categoryFilter);
            const itemDietary = item.dietary_types || [];
            const matchesDietary = dietaryFilter === 'All' || itemDietary.includes(dietaryFilter);
            const matchesStatus = statusFilter === 'All'
                ? true
                : statusFilter === 'Available' ? item.is_available : !item.is_available;
            return matchesSearch && matchesCategory && matchesDietary && matchesStatus;
        });
    }, [menuItems, debouncedSearch, categoryFilter, dietaryFilter, statusFilter]);

    // Pagination
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

    // Toggle Availability in Firebase across all categories
    const handleToggleStatus = async (item: MenuItem, newStatus: boolean) => {
        if (!user) return;
        try {
            const itemCategories = item.categories || [];
            const updates = itemCategories.map(cat => {
                return update(ref(rtdb, `menu/${user.uid}/${cat}/${item.id}`), {
                    is_available: newStatus,
                    updated_at: new Date().toISOString()
                });
            });
            await Promise.all(updates);
            toast.success(`Availability updated successfully.`);
        } catch (error) {
            toast.error("Failed to synchronize menu changes.");
        }
    };

    const handleToggleClick = (item: MenuItem) => {
        if (item.is_available) {
            setItemToDisable(item);
            setModalOpen(true);
        } else {
            handleToggleStatus(item, true);
        }
    };

    const handleConfirmDisable = async () => {
        if (!itemToDisable) return;
        await handleToggleStatus(itemToDisable, false);
        setModalOpen(false);
        setItemToDisable(null);
    };

    const getDietaryBadge = (type: string, key?: string) => {
        const baseClass = "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border";
        switch (type) {
            case 'Veg': return <div key={key} className={`${baseClass} bg-green-50 text-green-700 border-green-200`}><Leaf className="w-3 h-3" /> Veg</div>;
            case 'Non-Veg': return <div key={key} className={`${baseClass} bg-red-50 text-red-700 border-red-200`}><Drumstick className="w-3 h-3" /> Non-Veg</div>;
            case 'Egg': return <div key={key} className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200`}><EggFried className="w-3 h-3" /> Egg</div>;
            default: return null;
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

    // ── Empty State Handling ─────────────────────────────────────────
    if (!isLoading && menuItems.length === 0) {
        return (
            <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">


                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex-1"
                >
                    <Card className="h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-border/60 bg-white/50 backdrop-blur-sm">
                        <div className="w-24 h-24 mb-6 rounded-full bg-brand-orange-50 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full bg-brand-orange-100 animate-ping opacity-20"></div>
                            <Pizza className="w-12 h-12 text-brand-orange-500 relative z-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-navy mb-2">No Menu Items Found</h2>
                        <p className="text-text-secondary max-w-md mx-auto mb-8">
                            Your master food catalog is empty. Create your first menu item so that branches can start serving it to customers.
                        </p>
                        <Link to="/admin/food/new">
                            <Button className="font-bold py-3 px-8 shadow-premium text-base">
                                <Plus className="w-5 h-5 mr-2 inline" />
                                Create First Item
                            </Button>
                        </Link>
                    </Card>
                </motion.div>
            </div>
        );
    }

    // ── Normal List View ─────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <h1 className="text-3xl font-black text-brand-navy tracking-tight">Menu Catalog</h1>
                    <p className="text-text-secondary mt-1 text-sm font-medium">Manage master food items and availability.</p>
                </motion.div>
            </div>

            <DisableConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmDisable}
                itemName={itemToDisable?.name || ''}
            />

            {/* Main Content Area */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card className="p-0 overflow-hidden border border-border/50 shadow-soft bg-white flex flex-col min-h-[600px]">

                    {/* Filter Bar */}
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 transition-all shadow-sm hover:bg-white focus:bg-white placeholder:text-text-secondary/60"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                            <div className="w-full md:w-[160px]">
                                <Select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    options={categories.map(cat => ({ value: cat, label: cat === 'All' ? 'All Categories' : cat }))}
                                />
                            </div>
                            <div className="w-full md:w-[150px]">
                                <Select
                                    value={dietaryFilter}
                                    onChange={(e) => setDietaryFilter(e.target.value)}
                                    options={dietaryTypes.map(type => ({ value: type, label: type === 'All' ? 'All Dietary' : type }))}
                                />
                            </div>
                            <div className="w-full md:w-[150px]">
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    options={[
                                        { value: 'All', label: 'All Status' },
                                        { value: 'Available', label: 'Available' },
                                        { value: 'Unavailable', label: 'Unavailable' }
                                    ]}
                                />
                            </div>
                            <Link to="/admin/food/new" className="w-full md:w-auto">
                                <Button className="w-full justify-center md:w-auto gap-2 shadow-sm font-bold bg-brand-orange-500 text-white border-0 hover:bg-brand-orange-600">
                                    <Plus className="w-4 h-4" />
                                    Add Item
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Menu Item Records */}
                    <div className="flex-1 flex flex-col relative bg-gray-50/30 p-4 sm:p-6 space-y-4">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : paginatedItems.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-secondary py-16">
                                <FileX className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-medium text-lg">
                                    {debouncedSearch.length > 0 ? `No items found matching "${debouncedSearch}"` : 'No menu items found.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-2xl border border-border/50 shadow-sm">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-border/50">
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[25%]">Item Details</th>
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%]">Category</th>
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%]">Dietary</th>
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%]">Price</th>
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%]">Availability</th>
                                            <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {paginatedItems.map((item, i) => (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                                onClick={() => navigate(`/admin/food/${item.id}`)}
                                                className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${!item.is_available && 'opacity-70'}`}
                                            >
                                                {/* Item Details */}
                                                <td className="px-6 py-5 relative">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                                                            alt={item.name}
                                                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }}
                                                            className={`w-12 h-12 rounded-xl object-cover border border-border shadow-sm shrink-0 ${!item.is_available && 'grayscale'}`}
                                                        />
                                                        <Tooltip content={item.name} position="top">
                                                            <span
                                                                className="font-bold text-brand-navy text-lg truncate max-w-[200px]"
                                                            >
                                                                {item.name}
                                                            </span>
                                                        </Tooltip>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(item.categories || []).slice(0, 1).map((cat, idx) => (
                                                            <span key={`cat-${idx}`} className="text-sm font-semibold text-text-secondary">
                                                                {cat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* Dietary */}
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(item.dietary_types || []).slice(0, 1).map((type, idx) => (
                                                            <span key={`diet-${idx}`} className="text-sm font-semibold text-text-secondary">
                                                                {type}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* Price */}
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <span className="font-black text-brand-navy">₹{item.price}</span>
                                                </td>

                                                {/* Availability */}
                                                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={item.is_available ? 'success' : 'error'} className="font-black px-2.5 py-1 shadow-sm uppercase tracking-widest text-[10px]">
                                                            {item.is_available ? 'Available' : 'Unavailable'}
                                                        </Badge>
                                                        <AvailabilityToggle isAvailable={item.is_available} onToggle={() => handleToggleClick(item)} />
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/admin/food/${item.id}`}
                                                            className="px-3 py-1.5 text-sm font-semibold text-brand-navy bg-gray-100 hover:bg-brand-orange-50 hover:text-brand-orange-600 rounded-lg transition-all flex items-center gap-1.5"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            <span>View</span>
                                                        </Link>
                                                        <Link
                                                            to={`/admin/food/${item.id}/edit`}
                                                            className="p-2 text-text-secondary hover:text-brand-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                            title="Edit Item"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
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
        </div>
    );
}
