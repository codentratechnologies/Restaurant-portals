import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertCircle, FileText, Tag, Layers, Calendar, User, Settings2 } from 'lucide-react';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';

export default function FoodDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [foodItem, setFoodItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { activeAssignment } = useAuth();

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        if (!activeAssignment) {
          // If no active assignment yet, don't redirect, just wait.
          return;
        }
        
        const adminId = activeAssignment.adminId;
        const branchId = activeAssignment.branchId;

        // Fetch Master Menu to find the item
        const menuSnap = await get(ref(rtdb, `menu/${adminId}`));
        let foundItem: any = null;

        if (menuSnap.exists()) {
          const data = menuSnap.val();
          
          for (const categoryKey of Object.keys(data)) {
            const node = data[categoryKey];
            if (typeof node === 'object' && node !== null) {
              if (node[id!]) {
                const itemData = node[id!];
                foundItem = {
                  ...itemData,
                  id: id,
                  _key: id,
                  displayId: itemData.foodId || id
                };
                break;
              }
            }
          }
        }

        if (foundItem) {
          const isAvailable = foundItem.branchAvailability && branchId ? foundItem.branchAvailability[branchId] !== false : true;
          foundItem.is_available = isAvailable;
          setFoodItem(foundItem);
        } else {
          setErrorMsg(`Item not found in menu for ID: ${id}`);
        }
      } catch (error: any) {
        console.error("Error fetching food details:", error);
        setErrorMsg(`Error fetching details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id && activeAssignment) {
      fetchFoodDetails();
    }
  }, [id, activeAssignment]);

  if (errorMsg) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-brand-navy">Oops! Something went wrong.</h2>
        <p className="text-text-secondary">{errorMsg}</p>
        <Link to="/restaurant/food" className="mt-4 inline-block px-4 py-2 bg-brand-navy text-white rounded-lg font-bold">
          Back to Menu
        </Link>
      </div>
    );
  }

  if (loading || !foodItem) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-[400px] bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  // Date formatter
  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          to="/restaurant/food"
          className="inline-flex items-center gap-2 text-[#FF6B00] hover:text-[#E66000] font-bold text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu List
        </Link>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-[28px] sm:text-[32px] font-black text-[#1a1f36] tracking-tight leading-tight">
              {foodItem.name}
            </h1>
            {foodItem.displayId && (
              <span className="px-2.5 py-1 bg-[#F4F6FA] text-[#8896AB] text-[13px] font-bold rounded-md uppercase tracking-wide">
                {foodItem.displayId}
              </span>
            )}
          </div>
          <p className="text-[#8896AB] text-[15px] font-medium">Detailed view of menu item</p>
        </motion.div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="w-full aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden relative shadow-sm border border-[#E8ECF4] bg-white group">
              <img
                src={foodItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                alt={foodItem.name}
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!foodItem.is_available && 'grayscale opacity-80'}`}
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }}
              />
              {!foodItem.is_available && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <span className="px-4 py-2 bg-[#FFF0F2] text-[#FF3B5C] text-sm font-black rounded-lg shadow-sm border border-[#FFD1D9]">UNAVAILABLE</span>
                </div>
              )}
              
              {/* Dietary Icon Overlay */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-[#E8ECF4] z-20">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="14" height="14" stroke={foodItem.dietary_types?.includes('Veg') || foodItem.is_vegetarian ? '#00A254' : '#FF3B5C'} strokeWidth="1.5" rx="2" />
                      {foodItem.dietary_types?.includes('Veg') || foodItem.is_vegetarian ? (
                          <circle cx="8" cy="8" r="3.5" fill="#00A254" />
                      ) : (
                          <path d="M8 4.5L11.5 10.5H4.5L8 4.5Z" fill="#FF3B5C" />
                      )}
                  </svg>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="bg-white rounded-2xl border border-[#E8ECF4] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-1.5 bg-[#FFF3E8] rounded-md text-[#FF6B00]">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-[15px] font-bold text-[#1a1f36]">Item Details</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5 text-[#8896AB]">
                    <Tag className="w-[15px] h-[15px]" />
                    <span className="text-[13px] font-semibold">Item ID</span>
                  </div>
                  <span className="text-[14px] font-bold text-[#1a1f36]">{foodItem.displayId || '-'}</span>
                </div>
                
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5 text-[#8896AB]">
                    <Layers className="w-[15px] h-[15px]" />
                    <span className="text-[13px] font-semibold">Type</span>
                  </div>
                  <span className="text-[14px] font-bold text-[#1a1f36]">
                    {foodItem.dietary_types?.includes('Veg') || foodItem.is_vegetarian ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5 text-[#8896AB]">
                    <CheckCircle2 className="w-[15px] h-[15px]" />
                    <span className="text-[13px] font-semibold">Availability</span>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold ${foodItem.is_available ? 'bg-[#E5F5ED] text-[#00A254]' : 'bg-[#FFF0F2] text-[#FF3B5C]'}`}>
                    {foodItem.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5 text-[#8896AB]">
                    <Calendar className="w-[15px] h-[15px]" />
                    <span className="text-[13px] font-semibold">Created On</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#1a1f36]">{formatDate(foodItem.created_at)}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5 text-[#8896AB]">
                    <Calendar className="w-[15px] h-[15px]" />
                    <span className="text-[13px] font-semibold">Updated On</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#1a1f36]">{formatDate(foodItem.updated_at)}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2.5 text-[#8896AB]">
                    <User className="w-[15px] h-[15px]" />
                    <span className="text-[13px] font-semibold">Last Updated By</span>
                  </div>
                  <span className="text-[13px] font-bold text-[#1a1f36]">{foodItem.updated_by_name || 'Admin'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white rounded-2xl border border-[#E8ECF4] p-6 sm:p-8 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-[#E8ECF4]">
                <div>
                  <p className="text-[13px] font-bold text-[#8896AB] mb-2">Base Price</p>
                  <div className="text-4xl font-black text-[#FF6B00]">₹{foodItem.price}</div>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#8896AB] mb-3">Menu Status</p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-bold ${foodItem.is_available ? 'bg-[#E5F5ED] text-[#00A254]' : 'bg-[#FFF0F2] text-[#FF3B5C]'}`}>
                    {foodItem.is_available ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {foodItem.is_available ? 'Serving Customers' : 'Hidden from Menu'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div>
                   <p className="text-[13px] font-bold text-[#8896AB] mb-3">Categories</p>
                   <div className="flex flex-wrap gap-2">
                    {foodItem.categories && foodItem.categories.length > 0 ? (
                      foodItem.categories.map((cat: string, idx: number) => (
                        <span key={idx} className="inline-flex px-3 py-1.5 bg-[#F0F5FF] text-[#3B82F6] text-[12px] font-bold rounded-md">
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex px-3 py-1.5 bg-[#F4F6FA] text-[#8896AB] text-[12px] font-bold rounded-md">
                        {foodItem.category || 'Uncategorized'}
                      </span>
                    )}
                   </div>
                 </div>
                 <div>
                   <p className="text-[13px] font-bold text-[#8896AB] mb-3">Dietary Profile</p>
                   <div className="flex flex-wrap gap-2">
                     <span className={`inline-flex px-3 py-1.5 text-[12px] font-bold rounded-md ${foodItem.dietary_types?.includes('Veg') || foodItem.is_vegetarian ? 'bg-[#E5F5ED] text-[#00A254]' : 'bg-[#FFF0F2] text-[#FF3B5C]'}`}>
                       {foodItem.dietary_types?.includes('Veg') || foodItem.is_vegetarian ? 'Veg' : 'Non-Veg'}
                     </span>
                   </div>
                 </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#E8ECF4] flex flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-[#FFF3E8] rounded-md text-[#FF6B00] shrink-0">
                     <Settings2 className="w-4 h-4" />
                   </div>
                   <h3 className="text-[15px] font-bold text-[#1a1f36]">Customizations & Add-ons</h3>
                 </div>
                 <span className="px-2.5 py-1 bg-[#F4F6FA] text-[#8896AB] text-[12px] font-bold rounded-md shrink-0">
                   {foodItem.customizations?.length || 0} Customizations
                 </span>
              </div>
              
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left min-w-[400px]">
                  <thead>
                    <tr className="bg-[#F8FAFC]/50 border-b border-[#E8ECF4]">
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider w-1/2">Customization Name</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider w-1/2">Extra Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8ECF4]">
                    {foodItem.customizations && foodItem.customizations.length > 0 ? (
                      foodItem.customizations.map((opt: any, idx: number) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC]/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-[14px] font-bold text-[#1a1f36]">{opt.label}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[14px] font-bold text-[#FF6B00]">
                              {Number(opt.price) === 0 ? 'Free' : `+₹${opt.price}`}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-6 py-12 text-center">
                           <p className="font-bold text-[#1a1f36]">No customizations available</p>
                           <p className="text-[13px] text-[#8896AB] mt-1">This item is served as-is without extra size or add-on choices.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
