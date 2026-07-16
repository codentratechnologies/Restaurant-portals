import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Eye, Plus, ChevronLeft, ChevronRight, FileX, Upload, Filter, LayoutGrid, LayoutTemplate, CheckCircle, PauseCircle, Tag, AlertOctagon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import StatusConfirmationModal from './components/StatusConfirmationModal';
import { useMenuItems, MenuItem } from '../../hooks/useMenuItems';
import { ref, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

const categories = [
    'All Categories',
    'Pizza', 'Burger', 'Biryani', 'Indian', 'Sushi',
    'Appetizers', 'Soups', 'Salads', 'Shawarma',
    'Grills & BBQ', 'Mandi', 'Kabsa',
    'Main Course', 'Seafood', 'Bakery', 'Desserts',
    'Beverages', 'Family Platters', 'Kids Menu', 'Combo Meals'
];

export default function FoodCatalog() {
    const { user } = useAuth();
    const { menuItems, loading: isLoading } = useMenuItems();
    const navigate = useNavigate();

    // Filters & Views
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Modals
    const [modalOpen, setModalOpen] = useState(false);
    const [itemToToggle, setItemToToggle] = useState<MenuItem | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchInput]);

    // Reset pagination on filter change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [debouncedSearch, categoryFilter, statusFilter, itemsPerPage]);

    // Derived filtered items
    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const q = debouncedSearch.toLowerCase();
            const matchesSearch = item.name.toLowerCase().includes(q) || (item.foodId?.toLowerCase() || '').includes(q) || (item.categories || []).join(' ').toLowerCase().includes(q);
            const itemCategories = item.categories || [];
            const matchesCategory = categoryFilter === 'All Categories' || itemCategories.includes(categoryFilter);
            const matchesStatus = statusFilter === 'All Status'
                ? true
                : statusFilter === 'Active' ? item.is_available : !item.is_available;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [menuItems, debouncedSearch, categoryFilter, statusFilter]);

    // Pagination
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

    // Stats calculations
    const totalItems = menuItems.length;
    const activeItems = menuItems.filter(item => item.is_available).length;
    const inactiveItems = menuItems.filter(item => !item.is_available).length;
    const activePercentage = totalItems > 0 ? ((activeItems / totalItems) * 100).toFixed(2) : '0.00';
    const inactivePercentage = totalItems > 0 ? ((inactiveItems / totalItems) * 100).toFixed(2) : '0.00';

    // Unique categories count
    const uniqueCategories = useMemo(() => {
        const cats = new Set<string>();
        menuItems.forEach(item => {
            (item.categories || []).forEach(c => cats.add(c));
        });
        return cats.size;
    }, [menuItems]);

    // Toggle Availability in Firebase
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
        } catch {
            toast.error("Failed to synchronize menu changes.");
        }
    };

    const handleToggleClick = (item: MenuItem) => {
        setItemToToggle(item);
        setModalOpen(true);
    };

    const handleConfirmToggle = async () => {
        if (!itemToToggle) return;
        await handleToggleStatus(itemToToggle, !itemToToggle.is_available);
        setModalOpen(false);
        setItemToToggle(null);
    };

    const getDietaryBadge = (types: string[] = []) => {
        if (types.includes('Veg')) {
            return (
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm border border-[#00A254] flex items-center justify-center p-[1px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00A254]"></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#00A254] uppercase tracking-wider">Veg</span>
                </div>
            );
        }
        if (types.includes('Non-Veg')) {
            return (
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm border border-[#FF3B5C] flex items-center justify-center p-[1px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B5C]"></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#FF3B5C] uppercase tracking-wider">Non-Veg</span>
                </div>
            );
        }
        return null;
    };

    const getCategoryStyle = (category: string) => {
        const colors = [
            { bg: 'bg-[#FFF3E8]', text: 'text-[#FF6B00]' },
            { bg: 'bg-[#F3E8FF]', text: 'text-[#A855F7]' },
            { bg: 'bg-[#E5F5ED]', text: 'text-[#00A254]' },
            { bg: 'bg-[#F0F5FF]', text: 'text-[#3B82F6]' },
            { bg: 'bg-[#FFF0F2]', text: 'text-[#FF3B5C]' },
            { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]' },
        ];
        // simple hash to pick consistent color
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
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
                        <div className="w-24 h-24 mb-6 rounded-full bg-[#FFF3E8] flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full bg-[#FFF3E8] animate-ping opacity-20"></div>
                            <LayoutTemplate className="w-12 h-12 text-[#FF6B00] relative z-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1a1f36] mb-2">No Menu Items Found</h2>
                        <p className="text-[#8896AB] max-w-md mx-auto mb-8 font-medium">
                            Your master food catalog is empty. Create your first menu item so that branches can start serving it to customers.
                        </p>
                        <Link to="/admin/food/new">
                            <Button size="lg" className="gap-2 shadow-sm font-bold mt-4">
                                <Plus className="w-5 h-5" />
                                Create First Item
                            </Button>
                        </Link>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8 pb-10 pt-4">
            {/* Page Header */}
            <div className="flex flex-row items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <h1 className="text-2xl sm:text-[28px] font-black text-[#1a1f36] tracking-tight">Food Items</h1>
                    <p className="text-xs sm:text-sm font-medium text-[#8896AB] mt-1">Manage your central food catalog.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <Link to="/admin/food/new" className="shrink-0">
                        <Button className="sm:hidden w-10 h-10 p-0 flex items-center justify-center shadow-md shadow-[#FF6B00]/20 font-bold bg-[#FF6B00] text-white border-0 hover:bg-[#E66000] rounded-lg">
                            <Plus className="w-5 h-5" />
                        </Button>
                        <Button className="hidden sm:flex gap-2 shadow-sm font-bold px-6">
                            <Plus className="w-5 h-5" />
                            Add New Item
                        </Button>
                    </Link>
                </motion.div>
            </div>

            <StatusConfirmationModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setItemToToggle(null); }}
                onConfirm={handleConfirmToggle}
                itemName={itemToToggle?.name || ''}
                action={itemToToggle?.is_available ? 'deactivate' : 'activate'}
            />

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
            >
                <Card className="p-3.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-[10px] sm:rounded-full bg-[#FFF3E8] border sm:border-[#FFD0B5]/50 flex items-center justify-center shrink-0">
                        <LayoutTemplate className="w-4 h-4 sm:w-6 sm:h-6 text-[#FF6B00]" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-sm font-bold text-[#1a1f36] mb-0.5 sm:mb-0.5 line-clamp-1">Total Items</p>
                        <h3 className="text-xl sm:text-[22px] font-black text-[#1a1f36] leading-none">{totalItems}</h3>
                        <p className="hidden sm:block text-xs font-semibold text-[#8896AB] mt-1.5">Across all categories</p>
                    </div>
                </Card>
                <Card className="p-3.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-[10px] sm:rounded-full bg-[#E5F5ED] border sm:border-[#00A254]/20 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-[#00A254]" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-sm font-bold text-[#1a1f36] mb-0.5 sm:mb-0.5 line-clamp-1">Active Items</p>
                        <h3 className="text-xl sm:text-[22px] font-black text-[#1a1f36] leading-none">{activeItems}</h3>
                        <p className="hidden sm:block text-xs font-semibold text-[#8896AB] mt-1.5">{activePercentage}% of total</p>
                    </div>
                </Card>
                <Card className="p-3.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-[10px] sm:rounded-full bg-[#FFF0F2] border sm:border-[#FF3B5C]/20 flex items-center justify-center shrink-0">
                        <PauseCircle className="w-4 h-4 sm:w-6 sm:h-6 text-[#FF3B5C]" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-sm font-bold text-[#1a1f36] mb-0.5 sm:mb-0.5 line-clamp-1">Inactive Items</p>
                        <h3 className="text-xl sm:text-[22px] font-black text-[#1a1f36] leading-none">{inactiveItems}</h3>
                        <p className="hidden sm:block text-xs font-semibold text-[#8896AB] mt-1.5">{inactivePercentage}% of total</p>
                    </div>
                </Card>
                <Card className="p-3.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 sm:w-14 sm:h-14 rounded-[10px] sm:rounded-full bg-[#F3E8FF] border sm:border-[#A855F7]/20 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 sm:w-6 sm:h-6 text-[#A855F7]" />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-sm font-bold text-[#1a1f36] mb-0.5 sm:mb-0.5 line-clamp-1">Categories</p>
                        <h3 className="text-xl sm:text-[22px] font-black text-[#1a1f36] leading-none">{uniqueCategories}</h3>
                        <p className="hidden sm:block text-xs font-semibold text-[#8896AB] mt-1.5">Food categories</p>
                    </div>
                </Card>
            </motion.div>

            {/* Main Content Area */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                <Card className="p-0 overflow-visible bg-white shadow-sm border border-[#E8ECF4]">

                    {/* Filter Bar (Sticky) */}
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#E8ECF4] p-4 flex flex-col xl:flex-row xl:items-center justify-between shadow-sm gap-2">
                        {/* Top Row: Search & Mobile Filter Toggle */}
                        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full xl:w-auto">
                            <div className="relative w-full md:w-80 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896AB] group-focus-within:text-[#FF6B00] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by item name or category..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-[#E8ECF4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all shadow-sm hover:bg-white focus:bg-white placeholder:text-[#8896AB]/60 text-[#1a1f36]"
                                />
                            </div>

                            {/* Mobile Filter Button */}
                            <button
                                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                                className={`xl:hidden p-2.5 border rounded-xl transition-all shadow-sm shrink-0 ${isMobileFilterOpen ? 'bg-[#FFF3E8] border-[#FFD0B5] text-[#FF6B00]' : 'bg-gray-50 border-[#E8ECF4] text-[#8896AB] hover:text-[#FF6B00] hover:border-[#FF6B00]'}`}
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Filters Card */}
                        <div className={`xl:flex ${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col md:flex-row items-center gap-3 w-full xl:w-auto bg-gray-50 xl:bg-transparent p-4 xl:p-0 rounded-xl border border-[#E8ECF4] xl:border-none shadow-sm xl:shadow-none mt-2 xl:mt-0`}>
                            <div className="w-full md:w-[160px]">
                                <Select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    options={categories.map(cat => ({ value: cat, label: cat }))}
                                    className="py-2 h-auto text-sm font-bold border-[#E8ECF4] shadow-sm bg-gray-50/50 hover:bg-white"
                                />
                            </div>

                            <div className="w-full md:w-[150px]">
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    options={[
                                        { value: 'All Status', label: 'All Status' },
                                        { value: 'Active', label: 'Active' },
                                        { value: 'Inactive', label: 'Inactive' }
                                    ]}
                                    className="py-2 h-auto text-sm font-bold border-[#E8ECF4] shadow-sm bg-gray-50/50 hover:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Menu Item Records */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-[#F8FAFC]/50 border-b border-[#E8ECF4]">
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider w-[10%]">Photo</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider w-[25%]">Name & Food ID</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider w-[15%]">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider w-[15%]">Dietary</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider w-[10%]">Price</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider w-[15%]">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8ECF4]">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-5"><div className="w-12 h-12 bg-gray-100 rounded-lg"></div></td>
                                            <td className="px-6 py-5">
                                                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                                            </td>
                                            <td className="px-6 py-5"><div className="h-6 bg-gray-100 rounded-md w-16"></div></td>
                                            <td className="px-6 py-5"><div className="h-6 bg-gray-100 rounded-md w-16"></div></td>
                                            <td className="px-6 py-5"><div className="h-6 bg-gray-100 rounded-md w-16"></div></td>
                                            <td className="px-6 py-5"><div className="h-6 bg-gray-100 rounded-md w-24"></div></td>
                                            <td className="px-6 py-5"><div className="h-8 bg-gray-100 rounded-md w-24 ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : paginatedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <FileX className="w-12 h-12 mb-4 opacity-30 text-[#8896AB] mx-auto" />
                                            <p className="font-semibold text-[#8896AB] text-sm">
                                                {debouncedSearch.length > 0 ? `No items found matching "${debouncedSearch}"` : 'No menu items found.'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map((item, i) => {
                                        const catStyle = getCategoryStyle(item.categories?.[0] || 'Unknown');
                                        return (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: i * 0.05 }}
                                                className="hover:bg-[#F8FAFC]/50 transition-colors group"
                                            >
                                                {/* Photo */}
                                                <td className="px-6 py-4 whitespace-nowrap relative">
                                                    <img
                                                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                                                        alt={item.name}
                                                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }}
                                                        className="w-12 h-12 rounded-lg object-cover border border-[#E8ECF4] shadow-sm shrink-0"
                                                    />
                                                </td>

                                                {/* Name & Food ID */}
                                                <td className="px-6 py-4">
                                                    <span className="block font-bold text-[#1a1f36] text-[15px] hover:text-[#FF6B00] transition-colors mb-0.5">{item.name}</span>
                                                    <span className="text-[11px] font-semibold text-[#8896AB] uppercase tracking-wider">{item.foodId || item.id.substring(0, 8)}</span>
                                                </td>

                                                {/* Category */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.categories && item.categories.length > 0 ? (
                                                        <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-md ${catStyle.bg} ${catStyle.text}`}>
                                                            {item.categories[0]}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm font-semibold text-[#8896AB]">-</span>
                                                    )}
                                                </td>

                                                {/* Dietary */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getDietaryBadge(item.dietary_types)}
                                                </td>

                                                {/* Price */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-[13px] font-black text-[#1a1f36]">₹ {item.price.toFixed(2)}</span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${item.is_available ? 'bg-[#E5F5ED] text-[#00A254]' : 'bg-[#FFF0F2] text-[#FF3B5C]'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-[#00A254]' : 'bg-[#FF3B5C]'}`}></span>
                                                        {item.is_available ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-start gap-1.5 -ml-2">
                                                        <Link
                                                            to={`/admin/food/${item.id}`}
                                                            className="p-2 text-[#8896AB] hover:text-[#FF6B00] hover:bg-[#FFF3E8] rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            to={`/admin/food/${item.id}/edit`}
                                                            className="p-2 text-[#8896AB] hover:text-[#FF6B00] hover:bg-[#FFF3E8] rounded-lg transition-colors"
                                                            title="Edit Item"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                        {item.is_available ? (
                                                            <button
                                                                onClick={() => handleToggleClick(item)}
                                                                className="p-2 text-[#8896AB] hover:text-[#FF3B5C] hover:bg-[#FFF0F2] rounded-lg transition-colors"
                                                                title="Deactivate Item"
                                                            >
                                                                <AlertOctagon className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleToggleClick(item)}
                                                                className="p-2 text-[#8896AB] hover:text-[#00A254] hover:bg-[#E5F5ED] rounded-lg transition-colors"
                                                                title="Activate Item"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {!isLoading && totalPages > 0 && (
                        <div className="mt-auto px-4 sm:px-6 py-4 border-t border-[#E8ECF4] flex flex-col items-center justify-center gap-4 bg-white rounded-b-2xl">
                            <div className="flex items-center justify-center w-full gap-2 sm:gap-3">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-[#E8ECF4] hover:bg-[#F4F6FA] text-[#8896AB] hover:text-[#1a1f36] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {getPageNumbers().map((page, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                                            disabled={page === '...'}
                                            className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                                page === currentPage
                                                    ? 'border border-[#FF6B00] text-[#FF6B00] bg-white'
                                                    : page === '...'
                                                        ? 'text-[#8896AB] cursor-default border-none bg-transparent'
                                                        : 'border border-[#E8ECF4] text-[#1a1f36] bg-white hover:bg-[#F4F6FA]'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-[#E8ECF4] hover:bg-[#F4F6FA] text-[#8896AB] hover:text-[#1a1f36] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-sm text-[#8896AB] font-semibold">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                            </p>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
