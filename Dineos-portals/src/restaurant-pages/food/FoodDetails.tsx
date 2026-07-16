import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function FoodDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [foodItem, setFoodItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        const userStr = localStorage.getItem('restaurant_user');
        if (!userStr) {
          navigate('/login');
          return;
        }
        const user = JSON.parse(userStr);
        const adminId = user.adminId;
        const branchId = user.branch;

        // Fetch Branch Availability
        const branchSnap = await get(ref(rtdb, `branch/${adminId}`));
        let menuAvailability: Record<string, boolean> = {};
        
        if (branchSnap.exists()) {
          const data = branchSnap.val();
          const matchingBranchKey = Object.keys(data).find(key => data[key].code === branchId);
          if (matchingBranchKey) {
            menuAvailability = data[matchingBranchKey].menu_availability || {};
          }
        }

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
          const isAvailable = menuAvailability[foundItem.displayId] !== false;
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

    if (id) {
      fetchFoodDetails();
    }
  }, [id, navigate]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <Link
            to="/restaurant/food"
            className="mt-1 sm:mt-0 p-2 sm:p-2.5 text-text-secondary hover:text-brand-navy hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-border bg-gray-50 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight leading-tight">
                {foodItem.name}
              </h1>
              {foodItem.displayId && (
                <span className="font-mono text-[10px] sm:text-xs font-bold text-text-secondary bg-gray-100 border border-border/50 px-2 py-0.5 rounded tracking-widest uppercase shrink-0">
                  {foodItem.displayId}
                </span>
              )}
            </div>
            <p className="text-text-secondary mt-1 text-xs sm:text-sm font-medium">Detailed view of menu item</p>
          </motion.div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left Column - Image & Description */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-0 overflow-hidden border-border/50 shadow-sm rounded-2xl bg-white">
              <div className="aspect-[4/3] w-full bg-gray-50 relative group">
                <img
                  src={foodItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                  alt={foodItem.name}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!foodItem.is_available && 'grayscale'}`}
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }}
                />
                {!foodItem.is_available && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <Badge variant="error" className="px-4 py-2 text-sm font-black shadow-lg">CURRENTLY UNAVAILABLE</Badge>
                  </div>
                )}
                
                {/* Dietary Icon Overlay */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-md border border-border/50 z-20">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="14" height="14" stroke={foodItem.dietary_types?.includes('Veg') ? '#00A254' : '#FF3B5C'} strokeWidth="1.5" rx="2" />
                        {foodItem.dietary_types?.includes('Veg') ? (
                            <circle cx="8" cy="8" r="3.5" fill="#00A254" />
                        ) : (
                            <path d="M8 4.5L11.5 10.5H4.5L8 4.5Z" fill="#FF3B5C" />
                        )}
                    </svg>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <h3 className="text-sm font-black text-brand-navy mb-3 uppercase tracking-wider">Item Description</h3>
                <p className="text-text-secondary text-sm leading-relaxed font-medium">
                  {foodItem.description || 'No description provided for this item.'}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Details & Customizations */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border/50 shadow-sm rounded-2xl p-6 sm:p-8 bg-white">
              
              {/* Top Key Metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-border/50">
                <div>
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Base Price</p>
                  <div className="text-3xl sm:text-4xl font-black text-brand-orange-600">₹{foodItem.price}</div>
                </div>
                <div className="flex flex-col gap-1 sm:items-end">
                  <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Menu Status</p>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold w-fit ${foodItem.is_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {foodItem.is_available ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {foodItem.is_available ? 'Serving Customers' : 'Hidden from Menu'}
                  </div>
                </div>
              </div>

              {/* Categorization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {foodItem.categories && foodItem.categories.length > 0 ? (
                      foodItem.categories.map((cat: string, idx: number) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 border border-border/50 text-brand-navy text-xs font-bold shadow-sm">
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="text-text-secondary text-sm italic">No categories assigned</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">Dietary Profile</h4>
                  <div className="flex flex-wrap gap-2">
                    {foodItem.dietary_types && foodItem.dietary_types.length > 0 ? (
                      foodItem.dietary_types.map((type: string, idx: number) => (
                        <Badge key={idx} variant={type === 'Veg' ? 'success' : type === 'Egg' ? 'warning' : 'error'} className="px-3 py-1.5 text-xs font-bold shadow-sm">
                          {type}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-text-secondary text-sm italic">No dietary types specified</span>
                    )}
                  </div>
                </div>
              </div>

            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border/50 shadow-sm rounded-2xl p-6 sm:p-8 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-brand-navy">Customizations & Add-ons</h3>
                <span className="text-xs font-bold text-text-secondary bg-gray-100 px-2.5 py-1 rounded-full">
                  {foodItem.customizations?.length || 0} Options
                </span>
              </div>

              {foodItem.customizations && foodItem.customizations.length > 0 ? (
                <div className="space-y-3">
                  {foodItem.customizations.map((opt: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-gray-50/50 hover:bg-white hover:border-brand-orange-500/30 hover:shadow-sm transition-all group">
                      <span className="font-bold text-brand-navy group-hover:text-brand-orange-600 transition-colors">{opt.label}</span>
                      <span className="font-black text-brand-orange-600 text-lg">
                        {Number(opt.price) === 0 ? 'Free' : `+₹${opt.price}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-border/50 border-dashed">
                  <p className="font-bold text-brand-navy">No customizations available</p>
                  <p className="text-sm text-text-secondary mt-1">This item is served as-is without extra size or add-on choices.</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
