import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UtensilsCrossed, AlertCircle, CheckCircle2, Box, Leaf, Drumstick, EggFried } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table, { Column } from '../../components/common/Table';
import AvailabilityToggle from './components/AvailabilityToggle';
import DisableConfirmationModal from './components/DisableConfirmationModal';
import { ref, onValue, set, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

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
 // Use foodId (f001) instead of Firebase keys
 // If it exists in menu_availability with value false, it is inactive
 const foodId = m.foodId || m._key;
 const isAvailable = menuAvailability[foodId] !== false;
 return {
 id: m._key,
 displayId: foodId,
 name: m.name,
 category: m.categories ? m.categories[0] : m.category, // handle array categories if needed
 price: m.price,
 image_url: m.image_url,
 is_vegetarian: m.is_vegetarian || m.dietary_types?.includes('Veg'), // fallback for new dietary_types array
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
 const baseClass ="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm w-fit";
 switch (type) {
 case 'Veg': return <div className={`${baseClass} bg-green-50/90 text-green-700 border-green-200`}><Leaf className="w-3 h-3" /> Veg</div>;
 case 'Non-Veg': return <div className={`${baseClass} bg-red-50/90 text-red-700 border-red-200`}><Drumstick className="w-3 h-3" /> Non-Veg</div>;
 case 'Egg': return <div className={`${baseClass} bg-amber-50/90 text-amber-700 border-amber-200`}><EggFried className="w-3 h-3" /> Egg</div>;
 default: return null;
 }
 };
 
 // Filters
 const [searchInput, setSearchInput] = useState('');
 const [debouncedSearch, setDebouncedSearch] = useState('');
 const [categoryFilter, setCategoryFilter] = useState('All');
 const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Available' | 'Unavailable'
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

 // Pagination reset when filters change
 useEffect(() => {
 setCurrentPage(1);
 }, [debouncedSearch, categoryFilter, statusFilter]);

 const totalItems = items.length;
 const availableCount = items.filter(i => i.isAvailable).length;
 const unavailableCount = totalItems - availableCount;

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
 // To restore availability, we remove the false flag from the branch's menu_availability
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
 // To disable availability, we set the false flag in the branch's menu_availability
 await set(ref(rtdb, `branch/${currentUser.adminId}/${branchKey}/menu_availability/${displayId}`), false);
 toast.success(`${name} marked as unavailable.`);
 } catch (error) {
 toast.error("Failed to synchronize menu changes.");
 }
 };

 const columns: Column<typeof items[0]>[] = [
 {
 header: 'Image',
 cell: (item) => (
 <img
 src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
 alt={item.name}
 onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }}
 className={`w-12 h-12 rounded-lg object-cover border border-border shadow-sm shrink-0 ${!item.isAvailable && 'opacity-50 grayscale'}`}
 />
 )
 },
 {
 header: 'Food ID',
 cell: (item) => (
 <span className={`font-mono text-xs font-bold px-2 py-1 rounded bg-gray-50 border border-border ${!item.isAvailable && 'opacity-60'}`}>
 {item.displayId || item.id}
 </span>
 )
 },
 {
 header: 'Food Name',
 cell: (item) => (
 <span className={`font-bold tracking-tight ${item.isAvailable ? 'text-brand-navy' : 'text-text-secondary opacity-60'}`}>
 {item.name}
 </span>
 )
 },
 {
 header: 'Category',
 cell: (item) => (
 <span className={`inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-text-secondary text-xs font-semibold ${!item.isAvailable && 'opacity-60'}`}>
 {item.category}
 </span>
 )
 },
 {
 header: 'Dietary Type',
 cell: (item) => <div className={`${!item.isAvailable && 'opacity-60'}`}>{getDietaryBadge(getDietaryString(item))}</div>
 },
 {
 header: 'Price',
 cell: (item) => (
 <span className={`font-bold ${item.isAvailable ? 'text-brand-orange-600' : 'text-text-secondary opacity-60'}`}>
 ₹{item.price}
 </span>
 )
 },
 {
 header: 'Availability',
 cell: (item) => (
 <div className="flex items-center gap-3 justify-start">
 <span className={`text-[11px] font-bold uppercase tracking-wider ${item.isAvailable ? 'text-green-600' : 'text-text-secondary'}`}>
 {item.isAvailable ? 'Available' : 'Unavailable'}
 </span>
 <AvailabilityToggle 
 isAvailable={item.isAvailable} 
 onToggle={() => handleToggle(item.id, item.isAvailable)} 
 />
 </div>
 )
 }
 ];

 return (
 <div className="space-y-6 max-w-[1200px] mx-auto">
 
 <DisableConfirmationModal 
 isOpen={modalOpen} 
 onClose={() => setModalOpen(false)} 
 onConfirm={handleConfirmDisable}
 itemName={itemToDisable?.name || ''} 
 />

 {/* Header section with stats */}
 <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
 <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">
 {branchName ? `${branchName}'s Menu` : 'Menu Availability Manager'}
 </h1>
 <p className="text-text-secondary mt-1 text-sm font-medium">Manage real-time food availability for customer ordering.</p>
 </motion.div>
 
 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-wrap gap-4">
 <div className="bg-white border border-border rounded-2xl p-4 min-w-[140px] shadow-sm flex-1 sm:flex-none">
 <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1 flex items-center gap-1.5"><UtensilsCrossed className="w-3.5 h-3.5" /> Total Items</p>
 <p className="text-2xl font-black text-brand-navy">{totalItems}</p>
 </div>
 <div className="bg-green-50 border border-green-100 rounded-2xl p-4 min-w-[140px] shadow-sm flex-1 sm:flex-none">
 <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Available</p>
 <p className="text-2xl font-black text-green-700">{availableCount}</p>
 </div>
 <div className="bg-red-50 border border-red-100 rounded-2xl p-4 min-w-[140px] shadow-sm flex-1 sm:flex-none">
 <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Unavailable</p>
 <p className="text-2xl font-black text-red-700">{unavailableCount}</p>
 </div>
 </motion.div>
 </div>

 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
 
 {/* Filter Toolbar (Admin Style) */}
 <div className="bg-white border border-border rounded-xl p-2 mb-6 shadow-sm sticky top-16 z-30 flex flex-col md:flex-row items-center gap-2">
 <div className="relative w-full md:w-80 flex-shrink-0 group">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
 <input 
 type="text" 
 placeholder="Search food item by name or ID..." 
 maxLength={100}
 value={searchInput}
 onChange={(e) => setSearchInput(e.target.value)}
 className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-border/50 rounded-lg text-sm focus:bg-white focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/20 transition-all outline-none"
 />
 </div>

 <div className="w-px h-6 bg-border hidden md:block mx-1"></div>

 <div className="flex flex-1 w-full md:w-auto items-center gap-2 flex-wrap">
 <select 
 value={categoryFilter}
 onChange={(e) => setCategoryFilter(e.target.value)}
 className="appearance-none bg-gray-50 hover:bg-gray-100 border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 cursor-pointer transition-colors min-w-[130px]"
 >
 {categories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
 </select>

 <select 
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="appearance-none bg-gray-50 hover:bg-gray-100 border border-border/50 rounded-lg px-3 py-2 text-sm font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 cursor-pointer transition-colors min-w-[110px]"
 >
 <option value="All">All Status</option>
 <option value="Available">Available</option>
 <option value="Unavailable">Unavailable</option>
 </select>
 </div>
 </div>
 
 {/* Main Content Area */}
 <div className="min-h-[500px]">
 <AnimatePresence mode="wait">
 {filteredItems.length === 0 ? (
 <motion.div
 key="empty"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0 }}
 className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-border border-dashed rounded-2xl"
 >
 <div className="w-16 h-16 bg-brand-orange-50 rounded-full flex items-center justify-center mb-4">
 <UtensilsCrossed className="w-8 h-8 text-brand-orange-500" />
 </div>
 <h3 className="text-lg font-bold text-brand-navy mb-1">
 {searchInput ?"No matching items found." : categoryFilter !== 'All' ?"No items available in this category." :"No menu items available."}
 </h3>
 <p className="text-sm font-medium text-text-secondary mb-6 max-w-sm">
 {searchInput || categoryFilter !== 'All' || statusFilter !== 'All' 
 ?"We couldn't find any items matching your current filters. Try adjusting your search criteria."
 :"Your menu availability catalog is currently empty."}
 </p>
 {(searchInput || categoryFilter !== 'All' || statusFilter !== 'All') && (
 <button 
 onClick={() => { setSearchInput(''); setCategoryFilter('All'); setStatusFilter('All'); }}
 className="px-4 py-2 bg-white border border-border hover:bg-gray-50 text-brand-navy font-semibold rounded-lg transition-colors text-sm shadow-sm"
 >
 Clear Filters
 </button>
 )}
 </motion.div>
 ) : (
 <motion.div
 key="table"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="bg-white border border-border rounded-xl shadow-sm overflow-hidden"
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
 </AnimatePresence>
 </div>

 </motion.div>
 </div>
 );
}


