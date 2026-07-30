import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UtensilsCrossed, AlertCircle, CheckCircle2, Leaf, Drumstick, EggFried, FileX, ChevronLeft, ChevronRight, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from '../../components/common/Select';
import AvailabilityToggle from './components/AvailabilityToggle';
import DisableConfirmationModal from './components/DisableConfirmationModal';
import EnableConfirmationModal from './components/EnableConfirmationModal';
import { ref, onValue, set, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function FoodCatalog() {
 const navigate = useNavigate();
 const [currentUser, setCurrentUser] = useState<any>(null);
 const [masterMenu, setMasterMenu] = useState<any[]>([]);
 const [assignedMenuIds, setAssignedMenuIds] = useState<string[]>([]);
 
 const [branchCode, setBranchCode] = useState<string>('');
 const [branchName, setBranchName] = useState<string>('');
 const [branchKey, setBranchKey] = useState<string>('');
 
 // Real-time Database Sync
 const { activeAssignment } = useAuth();
 useEffect(() => {
 if (!activeAssignment) return;
 
 setCurrentUser({
 adminId: activeAssignment.adminId,
 branch: activeAssignment.branchId
 });

 const adminId = activeAssignment.adminId || '';
 const branchId = activeAssignment.branchId || '';

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
 } else {
 setBranchKey('');
 setAssignedMenuIds([]);
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
 id: foodIdKey,
 _categoryKey: categoryKey
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
 }, [activeAssignment]);

 const items = useMemo(() => {
 if (!currentUser) return [];
 const activeBranchCode = branchCode || currentUser.branch;
 if (!activeBranchCode) return [];
 return masterMenu.map(m => {
 const foodId = m.foodId || m._key;
 const isAvailable = m.branchAvailability ? m.branchAvailability[activeBranchCode] !== false : true;
 return {
 id: m._key,
 displayId: foodId,
 name: m.name,
 category: m.categories ? m.categories[0] : m.category,
 price: m.price,
 image_url: m.image_url,
 is_vegetarian: m.is_vegetarian || m.dietary_types?.includes('Veg'),
 tags: m.tags || m.dietary_types || [],
 isAvailable,
 _categoryKey: m._categoryKey
 };
 });
 }, [masterMenu, currentUser, branchCode]);
 
  const categories = useMemo(() => {
    const uniqueCats = new Set<string>();
    items.forEach(item => {
      if (item.category) uniqueCats.add(item.category);
    });
    return ['All', ...Array.from(uniqueCats).sort()];
  }, [items]);

 const getDietaryString = (item: any) => {
 if (item.tags?.includes('Egg')) return 'Egg';
 if (item.is_vegetarian) return 'Veg';
 return 'Non-Veg';
 };

 const getDietaryBadge = (type: string) => {
 const isVeg = type === 'Veg';
 return (
 <div className="flex items-center gap-1.5">
 <div className={`w-2.5 h-2.5 rounded-[2px] ${isVeg ? 'bg-[#00A254]' : 'bg-[#FF3B5C]'}`}></div>
 <span className="text-[12px] font-medium text-[#8896AB]">{isVeg ? 'Veg' : 'Non-Veg'}</span>
 </div>
 );
 };
 
 // Filters
 const [searchInput, setSearchInput] = useState('');
 const [debouncedSearch, setDebouncedSearch] = useState('');
 const [categoryFilter, setCategoryFilter] = useState('All');
 const [dietaryFilter, setDietaryFilter] = useState('All');
 const [statusFilter, setStatusFilter] = useState('All');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;
 
 // Modal State
 const [modalOpen, setModalOpen] = useState(false);
 const [itemToDisable, setItemToDisable] = useState<any>(null);
 const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
 
 const [enableModalOpen, setEnableModalOpen] = useState(false);
 const [itemToEnable, setItemToEnable] = useState<any>(null);

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
 
 const matchesDietary = dietaryFilter === 'All' || getDietaryString(item) === dietaryFilter;
 
 return matchesSearch && matchesCategory && matchesStatus && matchesDietary;
 });
 }, [items, debouncedSearch, categoryFilter, statusFilter, dietaryFilter]);

 // Pagination slice
 const paginatedItems = useMemo(() => {
 const start = (currentPage - 1) * itemsPerPage;
 return filteredItems.slice(start, start + itemsPerPage);
 }, [filteredItems, currentPage]);

 const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

 // Pagination reset when filters change
 useEffect(() => {
 setCurrentPage(1);
 }, [debouncedSearch, categoryFilter, statusFilter, dietaryFilter]);

 // Optimistic Toggle Handler
 const handleToggle = async (id: string, currentlyAvailable: boolean) => {
 if (!currentUser || !branchCode || !branchKey) return;
 const item = items.find(i => i.id === id);
 if (!item) return;

 if (currentlyAvailable) {
 setItemToDisable(item);
 setModalOpen(true);
 } else {
 setItemToEnable(item);
 setEnableModalOpen(true);
 }
 };

 const handleConfirmDisable = async () => {
 if (!itemToDisable || !currentUser || !branchCode || !branchKey) return;
 const { id, name, _categoryKey } = itemToDisable;
 
 setModalOpen(false);
 setItemToDisable(null);
 
 try {
 await set(ref(rtdb, `menu/${currentUser.adminId}/${_categoryKey}/${id}/branchAvailability/${branchCode}`), false);
 toast.success(`${name} marked as unavailable.`);
 } catch (error) {
 toast.error("Failed to synchronize menu changes.");
 }
 };

 const handleConfirmEnable = async () => {
 if (!itemToEnable || !currentUser || !branchCode || !branchKey) return;
 const { id, name, _categoryKey } = itemToEnable;
 
 setEnableModalOpen(false);
 setItemToEnable(null);
 
 try {
 await set(ref(rtdb, `menu/${currentUser.adminId}/${_categoryKey}/${id}/branchAvailability/${branchCode}`), true);
 toast.success(`${name} availability restored.`);
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
 <div className="space-y-6 w-full px-4 sm:px-6 lg:px-8 pb-10 pt-4">
 
 <DisableConfirmationModal 
 isOpen={modalOpen} 
 onClose={() => setModalOpen(false)} 
 onConfirm={handleConfirmDisable}
 itemName={itemToDisable?.name || ''} 
 />

 <EnableConfirmationModal 
 isOpen={enableModalOpen} 
 onClose={() => setEnableModalOpen(false)} 
 onConfirm={handleConfirmEnable}
 itemName={itemToEnable?.name || ''} 
 />

 {/* Top Section */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
 <h1 className="text-[28px] font-black text-[#1a1f36] tracking-tight">
 Menu List
 </h1>
 <p className="text-[#8896AB] mt-1 text-[15px] font-medium">Manage your restaurant menu and availability.</p>
 </motion.div>
 </div>

 {/* Main Content Area */}
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
 <div className="bg-white rounded-2xl border border-[#E8ECF4] flex flex-col min-h-[600px] shadow-sm">
 
 {/* Filter Bar */}
 <div className="sticky top-0 z-10 bg-white p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#E8ECF4] rounded-t-2xl shadow-sm">
 <div className="flex items-center justify-between gap-2 sm:gap-3 w-full xl:w-auto flex-1">
 <div className="relative w-full xl:w-[350px] group shrink-0">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896AB] group-focus-within:text-[#FF6B00] transition-colors" />
 <input
 type="text"
 placeholder="Search food items..."
 maxLength={100}
 value={searchInput}
 onChange={(e) => setSearchInput(e.target.value)}
 className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-[#E8ECF4] rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all text-[#1a1f36] placeholder:text-[#8896AB]"
 />
 </div>
 
 <button
 onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
 className={`xl:hidden p-2.5 border rounded-xl transition-all shadow-sm shrink-0 ${isMobileFilterOpen ? 'bg-[#FFF3E8] border-[#FFD0B5] text-[#FF6B00]' : 'bg-gray-50 border-[#E8ECF4] text-[#8896AB] hover:text-[#FF6B00] hover:border-[#FF6B00]'}`}
 >
 <Filter className="w-5 h-5" />
 </button>
 </div>

 <div className={`xl:flex ${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col md:flex-row items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0`}>
 <div className="w-full md:w-[150px]">
 <Select
 value={categoryFilter}
 onChange={(e) => setCategoryFilter(e.target.value)}
 options={categories.map(cat => ({ value: cat, label: cat === 'All' ? 'All Categories' : cat }))}
 className="w-full py-2.5 h-auto text-[13px] font-bold border-[#E8ECF4] bg-gray-50/50 text-[#1a1f36] rounded-xl shadow-sm hover:bg-white focus:bg-white transition-colors"
 />
 </div>
 <div className="w-full md:w-[130px]">
 <Select
 value={dietaryFilter}
 onChange={(e) => setDietaryFilter(e.target.value)}
 options={[
 {value: "All", label: "All"},
 {value: "Veg", label: "Veg"},
 {value: "Non-Veg", label: "Non-Veg"}
 ]}
 className="w-full py-2.5 h-auto text-[13px] font-bold border-[#E8ECF4] bg-gray-50/50 text-[#1a1f36] rounded-xl shadow-sm hover:bg-white focus:bg-white transition-colors"
 />
 </div>
 <div className="w-full md:w-[140px]">
 <Select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 options={[
 { value: 'All', label: 'All Status' },
 { value: 'Available', label: 'Available' },
 { value: 'Unavailable', label: 'Unavailable' }
 ]}
 className="w-full py-2.5 h-auto text-[13px] font-bold border-[#E8ECF4] bg-gray-50/50 text-[#1a1f36] rounded-xl shadow-sm hover:bg-white focus:bg-white transition-colors"
 />
 </div>
 </div>
 </div>

 {/* Menu Item Records */}
 <div className="flex-1 overflow-x-auto relative bg-white">
 {paginatedItems.length === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center text-[#8896AB] py-16">
 <FileX className="w-12 h-12 mb-4 opacity-50" />
 <p className="font-medium text-[15px]">
 {debouncedSearch.length > 0 ? `No items found matching "${debouncedSearch}"` : 'No menu items found.'}
 </p>
 {(searchInput || categoryFilter !== 'All' || statusFilter !== 'All' || dietaryFilter !== 'All') && (
 <button 
 onClick={() => { setSearchInput(''); setCategoryFilter('All'); setStatusFilter('All'); setDietaryFilter('All'); }}
 className="mt-4 px-4 py-2 bg-white border border-[#E8ECF4] hover:bg-gray-50 text-[#1a1f36] font-semibold rounded-lg transition-colors text-[13px] shadow-sm"
 >
 Clear Filters
 </button>
 )}
 </div>
 ) : (
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className="border-b border-[#E8ECF4]">
 <th className="px-6 py-4 text-[13px] font-bold text-[#1a1f36] w-[5%]">No.</th>
 <th className="px-6 py-4 text-[13px] font-bold text-[#1a1f36] w-[35%]">Item</th>
 <th className="px-6 py-4 text-[13px] font-bold text-[#1a1f36] w-[20%] text-center">Category</th>
 <th className="px-6 py-4 text-[13px] font-bold text-[#1a1f36] w-[15%] text-center">Price</th>
 <th className="px-6 py-4 text-[13px] font-bold text-[#1a1f36] w-[15%] text-center">Availability</th>
 <th className="px-6 py-4 text-[13px] font-bold text-[#1a1f36] w-[10%] text-center">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#E8ECF4]">
 {paginatedItems.map((item, i) => (
 <motion.tr
 key={item.id}
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.2, delay: i * 0.03 }}
 className={`hover:bg-[#F8FAFC]/50 transition-colors group ${!item.isAvailable && 'opacity-80'}`}
 >
 {/* Index */}
 <td className="px-6 py-5 text-[13px] font-medium text-[#1a1f36]">
 {(currentPage - 1) * itemsPerPage + i + 1}
 </td>

 {/* Item Details */}
 <td className="px-6 py-5">
 <div className="flex items-center gap-4">
 <img
 src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
 alt={item.name}
 onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }}
 className={`w-[52px] h-[52px] rounded-xl object-cover shadow-sm shrink-0 ${!item.isAvailable && 'grayscale'}`}
 />
 <div className="flex flex-col justify-center">
 <span className="text-[14px] font-bold text-[#1a1f36] leading-tight mb-1">{item.name}</span>
 {getDietaryBadge(item.is_vegetarian ? 'Veg' : 'Non-Veg')}
 </div>
 </div>
 </td>

 {/* Category */}
 <td className="px-6 py-5 text-center">
 <span className="text-[13px] font-medium text-[#8896AB]">
 {item.category}
 </span>
 </td>

 {/* Price */}
 <td className="px-6 py-5 text-center">
 <span className="text-[14px] font-bold text-[#1a1f36]">₹{item.price}</span>
 </td>

 {/* Availability */}
 <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-center">
 <AvailabilityToggle 
 isAvailable={item.isAvailable} 
 onToggle={() => handleToggle(item.id, item.isAvailable)} 
 />
 </div>
 </td>

 {/* Actions */}
 <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-center">
 <Link
 to={`/restaurant/food/${item.id}`}
 className="w-9 h-9 rounded-[10px] border border-[#E8ECF4] flex items-center justify-center text-[#8896AB] hover:text-[#1a1f36] hover:bg-[#F8FAFC] transition-colors"
 title="View Details"
 >
 <Eye className="w-[18px] h-[18px]" />
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
 </div>
 </motion.div>
 </div>
 );
}
