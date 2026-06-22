import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UtensilsCrossed, AlertCircle, CheckCircle2, Leaf, Drumstick, EggFried, FileX, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import AvailabilityToggle from './components/AvailabilityToggle';
import DisableConfirmationModal from './components/DisableConfirmationModal';
import { ref, onValue, set, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';

const categories = ['All', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

export default function FoodCatalog() {
 const navigate = useNavigate();
 const [currentUser, setCurrentUser] = useState<any>(null);
 const [masterMenu, setMasterMenu] = useState<any[]>([]);
 const [assignedMenuIds, setAssignedMenuIds] = useState<string[]>([]);
 const [menuAvailability, setMenuAvailability] = useState<Record<string, boolean>>({});
 
 const [branchCode, setBranchCode] = useState<string>('');
 const [branchName, setBranchName] = useState<string>('');
 const [branchKey, setBranchKey] = useState<string>('');
 
 // Real-time Database Sync
 useEffect(() => {
 const userStr = localStorage.getItem('restaurant_user');
 if (!userStr) {
 navigate('/login');
 return;
 }
 const user = JSON.parse(userStr);
 setCurrentUser(user);

 const adminId = user.adminId;
 const branchId = user.branch;

 // Listen to branch assignments by code
 const branchQuery = query(ref(rtdb, `branch/${adminId}`), orderByChild('code'), equalTo(branchId));
 const branchUnsub = onValue(branchQuery, (snap) => {
 if (snap.exists()) {
 const data = snap.val();
 const firstKey = Object.keys(data)[0];
 const val = data[firstKey];
 
 setBranchKey(firstKey);
 setAssignedMenuIds(val.assigned_menu_ids || []);
 setBranchCode(val.code || branchId);
 setBranchName(val.name || '');
 setMenuAvailability(val.menu_availability || {});
 } else {
 setBranchKey('');
 setAssignedMenuIds([]);
 setMenuAvailability({});
 setBranchCode(branchId);
 setBranchName(branchId);
 }
 });

 // Listen to master menu
 const menuUnsub = onValue(ref(rtdb, `menu/${adminId}`), (snap) => {
 if (snap.exists()) {
 const data = snap.val();
 let itemsList: any[] = [];
 
 Object.keys(data).forEach((categoryKey) => {
 const node = data[categoryKey];
 if (typeof node === 'object' && node !== null) {
 // Check if this node is an old flat food item
 if (node.name !== undefined && node.price !== undefined) return;
 
 // Otherwise it's a category folder
 Object.keys(node).forEach((foodIdKey) => {
 const item = node[foodIdKey];
 if (typeof item === 'object' && item !== null && item.name) {
 itemsList.push({
 ...item,
 _key: foodIdKey,
 id: foodIdKey
 });
 }
 });
 }
 });
 setMasterMenu(itemsList);
 } else {
 setMasterMenu([]);
 }
 });

 return () => {
 branchUnsub();
 menuUnsub();
 };
 }, [navigate]);

 const items = useMemo(() => {
 if (!currentUser) return [];
 const activeBranchCode = branchCode || currentUser.branch;
 if (!activeBranchCode) return [];
 return masterMenu.map(m => {
 const foodId = m.foodId || m._key;
 const isAvailable = menuAvailability[foodId] !== false;
 return {
 id: m._key,
 displayId: foodId,
 name: m.name,
 category: m.categories ? m.categories[0] : m.category,
 price: m.price,
 image_url: m.image_url,
 is_vegetarian: m.is_vegetarian || m.dietary_types?.includes('Veg'),
 tags: m.tags || m.dietary_types || [],
 isAvailable
 };
 });
 }, [masterMenu, menuAvailability, currentUser, branchCode]);
 
 const getDietaryString = (item: any) => {
 if (item.tags?.includes('Egg')) return 'Egg';
 if (item.is_vegetarian) return 'Veg';
 return 'Non-Veg';
 };

 const getDietaryBadge = (type: string) => {
 const baseClass ="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border";
 switch (type) {
 case 'Veg': return <div className={`${baseClass} bg-green-50 text-green-700 border-green-200`}><Leaf className="w-3 h-3" /> Veg</div>;
 case 'Non-Veg': return <div className={`${baseClass} bg-red-50 text-red-700 border-red-200`}><Drumstick className="w-3 h-3" /> Non-Veg</div>;
 case 'Egg': return <div className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200`}><EggFried className="w-3 h-3" /> Egg</div>;
 default: return null;
 }
 };
 
 // Filters
 const [searchInput, setSearchInput] = useState('');
 const [debouncedSearch, setDebouncedSearch] = useState('');
 const [categoryFilter, setCategoryFilter] = useState('All');
 const [statusFilter, setStatusFilter] = useState('All');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;
 
 // Modal State
 const [modalOpen, setModalOpen] = useState(false);
 const [itemToDisable, setItemToDisable] = useState<any>(null);

 // Debounce search input
 useEffect(() => {
 const handler = setTimeout(() => {
 setDebouncedSearch(searchInput);
 }, 300);
 return () => clearTimeout(handler);
 }, [searchInput]);

 // Derived filtered items
 const filteredItems = useMemo(() => {
 return items.filter(item => {
 const q = debouncedSearch.toLowerCase();
 const matchesSearch = item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
 const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
 const matchesStatus = statusFilter === 'All' 
 ? true 
 : statusFilter === 'Available' ? item.isAvailable : !item.isAvailable;
 
 return matchesSearch && matchesCategory && matchesStatus;
 });
 }, [items, debouncedSearch, categoryFilter, statusFilter]);

 // Pagination slice
 const paginatedItems = useMemo(() => {
 const start = (currentPage - 1) * itemsPerPage;
 return filteredItems.slice(start, start + itemsPerPage);
 }, [filteredItems, currentPage]);

 const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

 // Pagination reset when filters change
 useEffect(() => {
 setCurrentPage(1);
 }, [debouncedSearch, categoryFilter, statusFilter]);

 // Optimistic Toggle Handler
 const handleToggle = async (id: string, currentlyAvailable: boolean) => {
 if (!currentUser || !branchCode || !branchKey) return;
 const item = items.find(i => i.id === id);
 if (!item) return;

 if (currentlyAvailable) {
 setItemToDisable(item);
 setModalOpen(true);
 } else {
 try {
 await set(ref(rtdb, `branch/${currentUser.adminId}/${branchKey}/menu_availability/${item.displayId}`), null);
 toast.success(`${item.name} availability restored.`);
 } catch (error) {
 toast.error("Failed to synchronize menu changes.");
 }
 }
 };

 const handleConfirmDisable = async () => {
 if (!itemToDisable || !currentUser || !branchCode || !branchKey) return;
 const { displayId, name } = itemToDisable;
 
 setModalOpen(false);
 setItemToDisable(null);
 
 try {
 await set(ref(rtdb, `branch/${currentUser.adminId}/${branchKey}/menu_availability/${displayId}`), false);
 toast.success(`${name} marked as unavailable.`);
 } catch (error) {
 toast.error("Failed to synchronize menu changes.");
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

 return (
 <div className="space-y-6">
 
 <DisableConfirmationModal 
 isOpen={modalOpen} 
 onClose={() => setModalOpen(false)} 
 onConfirm={handleConfirmDisable}
 itemName={itemToDisable?.name || ''} 
 />

 {/* Top Section */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
 <h1 className="text-3xl font-black text-brand-navy tracking-tight">
 {branchName ? `${branchName}'s Menu` : 'Menu'}
 </h1>
 <p className="text-text-secondary mt-1 text-sm font-medium">Manage real-time food availability for customer ordering.</p>
 </motion.div>
 </div>

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
 maxLength={100}
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
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 options={[
 { value: 'All', label: 'All Status' },
 { value: 'Available', label: 'Available' },
 { value: 'Unavailable', label: 'Unavailable' }
 ]}
 />
 </div>
 </div>
 </div>

 {/* Menu Item Records */}
 <div className="flex-1 overflow-x-auto relative bg-white">
 {paginatedItems.length === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center text-text-secondary py-16">
 <FileX className="w-12 h-12 mb-4 opacity-50" />
 <p className="font-medium text-lg">
 {debouncedSearch.length > 0 ? `No items found matching "${debouncedSearch}"` : 'No menu items found.'}
 </p>
 {(searchInput || categoryFilter !== 'All' || statusFilter !== 'All') && (
 <button 
 onClick={() => { setSearchInput(''); setCategoryFilter('All'); setStatusFilter('All'); }}
 className="mt-4 px-4 py-2 bg-white border border-border hover:bg-gray-50 text-brand-navy font-semibold rounded-lg transition-colors text-sm shadow-sm"
 >
 Clear Filters
 </button>
 )}
 </div>
 ) : (
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className="bg-gray-50/50 border-b border-border/50">
 <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[35%]">Item Details</th>
 <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%]">Category</th>
 <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[10%]">Dietary</th>
 <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[10%]">Price</th>
 <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[20%] text-left">Availability</th>
 <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[10%] text-left">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/50">
 {paginatedItems.map((item, i) => (
 <motion.tr
 key={item.id}
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.2, delay: i * 0.03 }}
 className={`hover:bg-orange-50/30 transition-colors group ${!item.isAvailable && 'opacity-70'}`}
 >
 {/* Item Details */}
 <td className="px-6 py-5 relative">
 {/* Hover Decoration */}
 <div className="absolute inset-y-0 left-0 w-1 bg-brand-orange-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r"></div>
 <div className="flex items-center gap-4">
 <img
 src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
 alt={item.name}
 onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }}
 className={`w-12 h-12 rounded-xl object-cover border border-border shadow-sm shrink-0 group-hover:scale-105 transition-transform ${!item.isAvailable && 'grayscale'}`}
 />
 <div>
 <div className="flex items-center gap-2 mb-0.5">
 <h3 className="text-sm font-black text-brand-navy truncate max-w-[200px] group-hover:text-brand-orange-600 transition-colors">{item.name}</h3>
 </div>
 {item.displayId && (
 <span className="font-mono text-[10px] font-bold text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded tracking-widest">
 {item.displayId}
 </span>
 )}
 </div>
 </div>
 </td>

 {/* Category */}
 <td className="px-6 py-5">
 <span className="text-sm font-semibold text-text-secondary">
 {item.category}
 </span>
 </td>

 {/* Dietary */}
 <td className="px-6 py-5">
 <span className="text-sm font-semibold text-text-secondary">
 {getDietaryString(item)}
 </span>
 </td>

 {/* Price */}
 <td className="px-6 py-5 whitespace-nowrap">
 <span className="font-black text-brand-navy">₹{item.price}</span>
 </td>

 {/* Availability */}
 <td className="px-6 py-5 text-left" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-start gap-3">
 <Badge variant={item.isAvailable ? 'success' : 'error'} className="font-black px-2.5 py-1 shadow-sm uppercase tracking-widest text-[10px]">
 {item.isAvailable ? 'Available' : 'Unavailable'}
 </Badge>
 <AvailabilityToggle 
 isAvailable={item.isAvailable} 
 onToggle={() => handleToggle(item.id, item.isAvailable)} 
 />
 </div>
 </td>

 {/* Actions */}
 <td className="px-6 py-5 text-left whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-start gap-2">
 <Link
 to={`/food/${item.id}`}
 className="p-2 text-text-secondary hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-all"
 title="View Details"
 >
 <Eye className="w-4 h-4" />
 </Link>
 </div>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 )}
 </div>

 {/* Pagination Footer */}
 {totalPages > 0 && (
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
 className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
 page === currentPage
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
