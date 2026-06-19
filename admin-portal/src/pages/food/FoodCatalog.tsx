import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UtensilsCrossed, AlertCircle, CheckCircle2, Box, LayoutGrid, List as ListIcon, Edit2, Eye, Leaf, EggFried, Drumstick, Plus, RefreshCw, Pizza } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Table, { Column } from '../../components/common/Table';
import AvailabilityToggle from './components/AvailabilityToggle';
import DisableConfirmationModal from './components/DisableConfirmationModal';
import ViewFoodDrawer from './components/ViewFoodDrawer';
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

 // Filters & Views
 const [searchInput, setSearchInput] = useState('');
 const [debouncedSearch, setDebouncedSearch] = useState('');
 const [categoryFilter, setCategoryFilter] = useState('All');
 const [dietaryFilter, setDietaryFilter] = useState('All');
 const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Available' | 'Unavailable'
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 12;

 // Modals / Drawers
 const [modalOpen, setModalOpen] = useState(false);
 const [itemToDisable, setItemToDisable] = useState<MenuItem | null>(null);

 const [drawerOpen, setDrawerOpen] = useState(false);
 const [itemToView, setItemToView] = useState<MenuItem | null>(null);

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

 const getDietaryString = (item: MenuItem) => {
 if (item.tags?.includes('Egg')) return 'Egg';
 if (item.is_vegetarian) return 'Veg';
 return 'Non-Veg';
 };

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

 // Pagination slice
 const paginatedItems = useMemo(() => {
 const start = (currentPage - 1) * itemsPerPage;
 return filteredItems.slice(start, start + itemsPerPage);
 }, [filteredItems, currentPage]);

 const totalItems = menuItems.length;
 const availableCount = menuItems.filter(i => i.is_available).length;

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
 const baseClass ="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm";
 switch (type) {
 case 'Veg': return <div key={key} className={`${baseClass} bg-green-50/90 text-green-700 border-green-200`}><Leaf className="w-3 h-3" /> Veg</div>;
 case 'Non-Veg': return <div key={key} className={`${baseClass} bg-red-50/90 text-red-700 border-red-200`}><Drumstick className="w-3 h-3" /> Non-Veg</div>;
 case 'Egg': return <div key={key} className={`${baseClass} bg-amber-50/90 text-amber-700 border-amber-200`}><EggFried className="w-3 h-3" /> Egg</div>;
 default: return null;
 }
 };

 const renderSkeletons = () => (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
 {Array.from({ length: 8 }).map((_, idx) => (
 <div key={idx} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm h-[340px] flex flex-col animate-pulse">
 <div className="h-44 bg-gray-200"></div>
 <div className="p-4 flex flex-col flex-grow">
 <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-3"></div>
 <div className="h-5 bg-gray-200 rounded-md w-1/4 mb-4"></div>
 <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-auto"></div>
 <div className="mt-4 pt-4 border-t border-border flex justify-between">
 <div className="h-8 bg-gray-200 rounded-md w-20"></div>
 <div className="h-8 bg-gray-200 rounded-md w-20"></div>
 </div>
 </div>
 </div>
 ))}
 </div>
 );

 const renderListSkeletons = () => (
 <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
 <div className="divide-y divide-border">
 {Array.from({ length: 5 }).map((_, idx) => (
 <div key={idx} className="p-4 flex items-center gap-4 animate-pulse">
 <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
 <div className="flex-1 space-y-2">
 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
 <div className="h-3 bg-gray-200 rounded w-1/6"></div>
 </div>
 <div className="w-24 h-6 bg-gray-200 rounded"></div>
 <div className="w-20 h-6 bg-gray-200 rounded"></div>
 <div className="w-16 h-8 bg-gray-200 rounded"></div>
 </div>
 ))}
 </div>
 </div>
 );

 // List View Columns
 const columns: Column<MenuItem>[] = [
 {
 header: 'Image',
 cell: (item) => (
 <img
 src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
 alt={item.name}
 onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }}
 className={`w-12 h-12 rounded-lg object-cover border border-border shadow-sm ${!item.is_available && 'opacity-50 grayscale'}`}
 />
 )
 },
 {
 header: 'Food ID',
 cell: (item) => (
 <span className={`font-mono text-xs font-bold px-2 py-1 rounded bg-gray-50 border border-border ${!item.is_available && 'opacity-60'}`}>
 {item.foodId || '-'}
 </span>
 )
 },
 {
 header: 'Food Name',
 cell: (item) => (
 <span className={`font-bold tracking-tight ${item.is_available ? 'text-brand-navy' : 'text-text-secondary opacity-60'}`}>
 {item.name}
 </span>
 )
 },
 {
 header: 'Category',
 cell: (item) => (
 <div className={`flex flex-wrap gap-1 ${!item.is_available && 'opacity-60'}`}>
 {(item.categories || []).slice(0, 2).map((cat, idx) => (
 <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-text-secondary text-[10px] font-semibold">
 {cat}
 </span>
 ))}
 {(item.categories || []).length > 2 && (
 <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-gray-100 text-text-secondary text-[10px] font-semibold">
 +{(item.categories || []).length - 2}
 </span>
 )}
 </div>
 )
 },
 {
 header: 'Dietary Type',
 cell: (item) => (
 <div className={`flex flex-wrap gap-1 ${!item.is_available && 'opacity-60'}`}>
 {(item.dietary_types || []).map((type, idx) => getDietaryBadge(type, String(idx)))}
 </div>
 )
 },
 {
 header: 'Price',
 cell: (item) => (
 <span className={`font-bold ${item.is_available ? 'text-brand-orange-600' : 'text-text-secondary opacity-60'}`}>
 ₹{item.price}
 </span>
 )
 },
 {
 header: 'Status',
 cell: (item) => (
 <div className="flex items-center gap-3 justify-start">
 <span className={`text-[11px] font-bold uppercase tracking-wider ${item.is_available ? 'text-green-600' : 'text-text-secondary'}`}>
 {item.is_available ? 'Available' : 'Unavailable'}
 </span>
 <AvailabilityToggle isAvailable={item.is_available} onToggle={() => handleToggleClick(item)} />
 </div>
 )
 },
 {
 header: 'Actions',
 cell: (item) => (
 <div className="flex items-center gap-2">
 <button onClick={() => { setItemToView(item); setDrawerOpen(true); }} className="p-2 text-text-secondary hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors">
 <Eye className="w-4 h-4" />
 </button>
 <Link to={`/food/${item.id}/edit`} className="p-2 text-text-secondary hover:text-brand-orange-600 hover:bg-brand-orange-50 rounded-lg transition-colors">
 <Edit2 className="w-4 h-4" />
 </Link>
 </div>
 )
 }
 ];

 // ── Empty State Handling ─────────────────────────────────────────
 if (!isLoading && menuItems.length === 0) {
 return (
 <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col max-w-[1400px] mx-auto">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
 <h1 className="text-3xl font-black text-brand-navy tracking-tight">Food Catalog</h1>
 <p className="text-text-secondary mt-1 text-sm font-medium">Manage your central menu items and availability.</p>
 </motion.div>
 </div>

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
 <Link to="/food/new">
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

 return (
 <div className="max-w-[1400px] mx-auto">

 <DisableConfirmationModal
 isOpen={modalOpen}
 onClose={() => setModalOpen(false)}
 onConfirm={handleConfirmDisable}
 itemName={itemToDisable?.name || ''}
 />

 {itemToView && (
 <ViewFoodDrawer
 isOpen={drawerOpen}
 onClose={() => setDrawerOpen(false)}
 foodItem={itemToView as any} // Using any to avoid type mismatch with old mock component type
 />
 )}

 <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md pb-4 pt-6 -mt-6 mb-2">
 {/* Header section with stats */}
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
 <div>
 <h1 className="text-2xl font-bold text-brand-navy tracking-tight">Food Catalog</h1>
 <p className="text-text-secondary mt-1 text-sm">Manage your central menu items and availability.</p>
 </div>

 <div className="flex items-center gap-3">
 <div className="flex bg-white rounded-lg p-1.5 border border-border shadow-sm">
 <div className="px-3 py-1 flex flex-col items-center justify-center border-r border-border min-w-[80px]">
 <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">Total Items</span>
 <span className="text-lg font-black text-brand-navy leading-none">{totalItems}</span>
 </div>
 <div className="px-3 py-1 flex flex-col items-center justify-center min-w-[80px]">
 <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-0.5">Available</span>
 <span className="text-lg font-black text-green-600 leading-none">{availableCount}</span>
 </div>
 </div>
 <Link to="/food/new">
 <button className="h-[52px] px-5 bg-brand-navy hover:bg-brand-navy/90 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2">
 <Plus className="w-4 h-4" /> Add Item
 </button>
 </Link>
 </div>
 </div>

 {/* Filter Toolbar */}
 <div className="bg-white border border-border rounded-xl p-2 shadow-sm flex flex-col md:flex-row items-center gap-2">
 <div className="relative w-full md:w-80 flex-shrink-0">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <input
 type="text"
 placeholder="Search food item..."
 value={searchInput}
 onChange={(e) => setSearchInput(e.target.value)}
 className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-border/50 rounded-lg text-sm focus:bg-white focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/20 transition-all outline-none"
 />
 </div>

 <div className="w-px h-6 bg-border hidden md:block mx-1"></div>

 <div className="flex flex-1 w-full md:w-auto items-center gap-2 flex-wrap">
 <div className="min-w-[150px]">
 <Select
 value={categoryFilter}
 onChange={(e) => setCategoryFilter(e.target.value)}
 options={categories.map(cat => ({ value: cat, label: cat === 'All' ? 'All Categories' : cat }))}
 className="bg-gray-50"
 />
 </div>

 <div className="min-w-[140px]">
 <Select
 value={dietaryFilter}
 onChange={(e) => setDietaryFilter(e.target.value)}
 options={dietaryTypes.map(type => ({ value: type, label: type === 'All' ? 'All Dietary' : type }))}
 className="bg-gray-50"
 />
 </div>

 <div className="min-w-[140px]">
 <Select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 options={[
 { value: 'All', label: 'All Status' },
 { value: 'Available', label: 'Available' },
 { value: 'Unavailable', label: 'Unavailable' }
 ]}
 className="bg-gray-50"
 />
 </div>
 </div>
 </div>
 </div>


 {/* Main Content Area */}
 <div className="min-h-[500px]">
 {isLoading ? (
 renderListSkeletons()
 ) : filteredItems.length === 0 ? (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-border border-dashed rounded-2xl"
 >
 <div className="w-16 h-16 bg-brand-orange-50 rounded-full flex items-center justify-center mb-4">
 <UtensilsCrossed className="w-8 h-8 text-brand-orange-500" />
 </div>
 <h3 className="text-lg font-bold text-brand-navy mb-1">No items found</h3>
 <p className="text-sm text-text-secondary mb-6 max-w-sm">
 We couldn't find any menu items matching your criteria. Try adjusting your filters or search term.
 </p>
 <button
 onClick={() => { setSearchInput(''); setCategoryFilter('All'); setDietaryFilter('All'); setStatusFilter('All'); }}
 className="px-4 py-2 bg-white border border-border hover:bg-gray-50 text-brand-navy font-semibold rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2"
 >
 <RefreshCw className="w-4 h-4" /> Clear Filters
 </button>
 </motion.div>
 ) : (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 >
 <Table
 columns={columns}
 data={paginatedItems}
 currentPage={currentPage}
 totalPages={Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))}
 onPageChange={setCurrentPage}
 />
 </motion.div>
 )}
 </div>
 </div>
 );
}

