import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, ChevronDown, LayoutTemplate, Info, MapPin, Receipt, TrendingUp, Store, Star, Image as ImageIcon, Activity, Circle, CheckCircle2 } from 'lucide-react';
import { useMenuItems, MenuItem } from '../../hooks/useMenuItems';
import { useBranches } from '../../hooks/useBranches';
import Card from '../../components/common/Card';
import BranchesModal from './components/BranchesModal';

export default function FoodDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { menuItems, loading: menuLoading } = useMenuItems();
  const { branches, loading: branchesLoading } = useBranches();
  
  const [foodItem, setFoodItem] = useState<MenuItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBranchesModalOpen, setIsBranchesModalOpen] = useState(false);

  useEffect(() => {
    if (!menuLoading && id) {
      const item = menuItems.find(m => m.id === id);
      if (item) {
        setFoodItem(item);
      } else {
        setErrorMsg(`Item not found for ID: ${id}`);
      }
    }
  }, [id, menuItems, menuLoading, navigate]);

  if (errorMsg) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#1a1f36]">Oops! Something went wrong.</h2>
        <p className="text-[#8896AB]">{errorMsg}</p>
        <Link to="/admin/food" className="mt-4 inline-block px-4 py-2 bg-[#1a1f36] text-white rounded-lg font-bold">
          Back to Menu
        </Link>
      </div>
    );
  }

  if (menuLoading || branchesLoading || !foodItem) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="h-10 w-32 bg-gray-200 rounded mb-6"></div>
        <div className="flex justify-between">
            <div className="h-10 w-64 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 w-32 bg-gray-200 rounded mb-2"></div>
        </div>
        <div className="h-[400px] bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  const categoryString = foodItem.categories?.join(' • ') || '';
  const dietaryString = foodItem.dietary_types?.join(' • ') || '';
  const subtitle = [categoryString, dietaryString].filter(Boolean).join(' • ');

  // Calculate available branches
  const availableBranches = branches.filter((branch: any) => {
    const foodKey = foodItem.foodId || foodItem.id;
    return branch.menu_availability ? branch.menu_availability[foodKey] !== false : true;
  });

  const isVeg = foodItem.dietary_types?.includes('Veg');
  const isEgg = foodItem.dietary_types?.includes('Egg');

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
  };

  // Mock stats (To be calculated properly when DB fields are added)
  const stats = {
      ordersToday: 48,
      ordersGrowth: "+12.5%",
      revenueToday: 19152,
      revenueGrowth: "+8.3%",
      rating: 4.8,
      reviews: 128
  };

  return (
    <div className="space-y-5 pb-10 w-full px-4 sm:px-6 lg:px-8 pt-4">


      {/* Header Section */}
      <div className="flex flex-row items-start justify-between gap-4 pt-2 mb-6">
        <div>
          <Link 
            to="/admin/food" 
            className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white border border-[#E8ECF4] rounded-lg text-sm font-bold text-[#1a1f36] hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Menu</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to={`/admin/food/${foodItem.id}/edit`}>
            <button className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 bg-white border border-[#FF6B00] rounded-xl text-sm font-bold text-[#FF6B00] hover:bg-[#FFF3E8] transition-colors shadow-sm">
              <Edit2 className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline sm:ml-2">Edit Item</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Main Detail Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6 border border-[#E8ECF4] shadow-sm rounded-2xl bg-white overflow-hidden relative">
          <div className="flex flex-col lg:flex-row gap-10 items-stretch">
            
            {/* Left: Huge Image */}
            <div className="w-full lg:w-[320px] shrink-0 relative rounded-2xl overflow-hidden bg-gray-50 border border-[#E8ECF4] shadow-sm h-full min-h-[320px]">
                <img
                  src={foodItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                  alt={foodItem.name}
                  className="w-full h-full object-cover absolute inset-0"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' }}
                />
                
                {/* Dietary Icon Overlay */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-md border border-[#E8ECF4]">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="14" height="14" stroke={isVeg ? '#00A254' : '#FF3B5C'} strokeWidth="1.5" rx="2" />
                        {isVeg ? (
                            <circle cx="8" cy="8" r="3.5" fill="#00A254" />
                        ) : (
                            <path d="M8 4.5L11.5 10.5H4.5L8 4.5Z" fill="#FF3B5C" />
                        )}
                    </svg>
                </div>
            </div>

            {/* Right: Details */}
            <div className="flex-1 flex flex-col py-2 justify-center">
                {/* Active Badge */}
                <div className="mb-4">
                    <span className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${foodItem.is_available ? 'bg-[#E5F5ED] text-[#00A254]' : 'bg-[#FFF0F2] text-[#FF3B5C]'}`}>
                        {foodItem.is_available ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-[#1a1f36] tracking-tight mb-3 leading-tight">
                    {foodItem.name}
                </h1>

                {/* Subtitle */}
                {subtitle && (
                    <div className="flex items-center gap-2 mb-6">
                        <span className={`w-2 h-2 rounded-full ${isVeg ? 'bg-[#00A254]' : 'bg-[#FF3B5C]'}`}></span>
                        <p className="text-[#8896AB] font-semibold text-[15px]">
                            {foodItem.categories?.[0] || 'Uncategorized'} <span className="mx-1">•</span> {foodItem.dietary_types?.[0] || 'Other'}
                        </p>
                    </div>
                )}

                {/* Price */}
                <div className="mb-6">
                    <p className="text-3xl font-black text-[#1a1f36] leading-none">
                        ₹{foodItem.price.toFixed(2)}
                    </p>
                </div>

                {/* Description */}
                <p className="text-[#8896AB] font-medium leading-relaxed mb-10 max-w-2xl text-[15px]">
                    {foodItem.description || 'No description provided for this item.'}
                </p>

                {/* Chips */}
                <div className="flex flex-wrap items-center gap-8 mt-auto">
                    {foodItem.categories && foodItem.categories.length > 0 && (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#FFF3E8] flex items-center justify-center text-[#FF6B00]">
                                <LayoutTemplate className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[11px] text-[#8896AB] font-bold uppercase tracking-wider mb-0.5">Category</p>
                                <p className="text-sm font-bold text-[#1a1f36]">{foodItem.categories[0]}</p>
                            </div>
                        </div>
                    )}

                    {foodItem.dietary_types && foodItem.dietary_types.length > 0 && (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#E5F5ED] flex items-center justify-center text-[#00A254]">
                                <Info className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[11px] text-[#8896AB] font-bold uppercase tracking-wider mb-0.5">Food Type</p>
                                <p className="text-sm font-bold text-[#1a1f36]">{foodItem.dietary_types[0]}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3.5 sm:p-6 border border-[#E8ECF4] shadow-sm rounded-2xl bg-white flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-xl bg-[#F0F4FE] flex items-center justify-center text-[#3B66FF] shrink-0">
                  <Receipt className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#8896AB] mb-0.5 sm:mb-1">Orders Today</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1a1f36] leading-none mb-1 sm:mb-2">{stats.ordersToday}</h3>
                  <p className="hidden sm:flex text-[10px] font-bold text-[#00A254] items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {stats.ordersGrowth} <span className="text-[#8896AB] font-semibold">from yesterday</span>
                  </p>
              </div>
          </Card>

          <Card className="p-3.5 sm:p-6 border border-[#E8ECF4] shadow-sm rounded-2xl bg-white flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-xl bg-[#E5F5ED] flex items-center justify-center text-[#00A254] shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#8896AB] mb-0.5 sm:mb-1">Revenue Today</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1a1f36] leading-none mb-1 sm:mb-2">₹{stats.revenueToday.toLocaleString()}</h3>
                  <p className="hidden sm:flex text-[10px] font-bold text-[#00A254] items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {stats.revenueGrowth} <span className="text-[#8896AB] font-semibold">from yesterday</span>
                  </p>
              </div>
          </Card>

          <Card className="p-3.5 sm:p-6 border border-[#E8ECF4] shadow-sm rounded-2xl bg-white flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-xl bg-[#FFF3E8] flex items-center justify-center text-[#FF6B00] shrink-0">
                  <Store className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#8896AB] mb-0.5 sm:mb-1">Total Branches</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1a1f36] leading-none mb-1 sm:mb-2">{availableBranches.length}</h3>
                  <p className="hidden sm:block text-[10px] font-semibold text-[#8896AB]">
                      Across all branches
                  </p>
              </div>
          </Card>

          <Card className="p-3.5 sm:p-6 border border-[#E8ECF4] shadow-sm rounded-2xl bg-white flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-[10px] sm:rounded-xl bg-[#FFF9E5] flex items-center justify-center text-[#F5B500] shrink-0">
                  <Star className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#8896AB] mb-0.5 sm:mb-1">Average Rating</p>
                  <div className="flex items-end gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                      <h3 className="text-xl sm:text-2xl font-black text-[#1a1f36] leading-none">{stats.rating}</h3>
                      <div className="flex items-center gap-0.5 pb-0.5">
                          {[1,2].map(star => (
                              <Star key={star} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${star <= Math.floor(stats.rating) ? 'fill-[#F5B500] text-[#F5B500]' : 'fill-[#E8ECF4] text-[#E8ECF4]'}`} />
                          ))}
                          <span className="text-[10px] font-bold text-[#8896AB] ml-1 sm:hidden">({stats.reviews})</span>
                      </div>
                  </div>
                  <p className="hidden sm:block text-[10px] font-semibold text-[#8896AB]">
                      Based on {stats.reviews} reviews
                  </p>
              </div>
          </Card>
      </motion.div>

      {/* Availability Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border border-[#E8ECF4] shadow-sm rounded-2xl bg-white overflow-hidden relative min-h-[250px]">
          {/* Subtle Map Background (Right side only) */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] pointer-events-none"></div>

          <div className="relative z-10 p-8 flex flex-col justify-between h-full">
              <div>
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#00A254]"></div>
                          <h3 className="text-[15px] font-black text-[#1a1f36]">Availability</h3>
                      </div>
                      <button 
                          onClick={() => setIsBranchesModalOpen(true)}
                          className="px-4 py-2 bg-white border border-[#E8ECF4] hover:bg-[#F8FAFC] text-[#1a1f36] text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                          View All Branches
                      </button>
                  </div>

                  <h2 className="text-xl font-black text-[#1a1f36] mb-6">Available in {availableBranches.length} Branches</h2>

                  <div className="flex flex-wrap gap-3">
                      {availableBranches.slice(0, 4).map((b: any) => (
                          <div key={b.id} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E8ECF4] bg-[#FAFBFC]">
                              <CheckCircle2 className="w-4 h-4 text-[#00A254]" />
                              <span className="text-[13px] font-bold text-[#1a1f36]">{b.name}</span>
                          </div>
                      ))}
                      {availableBranches.length > 4 && (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0F4FE]">
                              <span className="text-[13px] font-bold text-[#3B66FF]">+{availableBranches.length - 4} More Branch{availableBranches.length - 4 !== 1 ? 'es' : ''}</span>
                          </div>
                      )}
                      {availableBranches.length === 0 && (
                          <span className="text-[13px] font-semibold text-[#8896AB] italic">No branches currently serving this item.</span>
                      )}
                  </div>
              </div>
          </div>
        </Card>
      </motion.div>

      {/* Activity Log Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border border-[#E8ECF4] shadow-sm rounded-2xl p-8 bg-white">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#F0F4FE] flex items-center justify-center text-[#3B66FF]">
                    <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-black text-[#1a1f36]">Activity Log</h3>
            </div>

            <div className="relative ml-2">
                {/* Vertical Line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#E8ECF4]"></div>

                <div className="space-y-8">
                    <div className="relative pl-8 flex items-start justify-between group">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-[4px] border-[#3B66FF] ring-4 ring-[#F0F4FE] z-10"></div>
                        <div>
                            <h4 className="text-sm font-black text-[#1a1f36] mb-1 group-hover:text-[#3B66FF] transition-colors">Item Created</h4>
                            <p className="text-[13px] font-medium text-[#8896AB]">Food item was created in the system</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-bold text-[#8896AB] mb-0.5 uppercase tracking-wider">{formatDate(foodItem.created_at)}</p>
                            <p className="text-[12px] font-medium text-[#1a1f36]">Super Admin</p>
                        </div>
                    </div>

                    <div className="relative pl-8 flex items-start justify-between group">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-[4px] border-[#9747FF] ring-4 ring-[#F5F0FF] z-10"></div>
                        <div>
                            <h4 className="text-sm font-black text-[#1a1f36] mb-1 group-hover:text-[#9747FF] transition-colors">Item Updated</h4>
                            <p className="text-[13px] font-medium text-[#8896AB]">Food item details were updated</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-bold text-[#8896AB] mb-0.5 uppercase tracking-wider">{formatDate(foodItem.updated_at)}</p>
                            <p className="text-[12px] font-medium text-[#1a1f36]">Super Admin</p>
                        </div>
                    </div>
                    
                    <div className="relative pl-8 flex items-start justify-between group">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-[4px] border-[#9747FF] ring-4 ring-[#F5F0FF] z-10"></div>
                        <div>
                            <h4 className="text-sm font-black text-[#1a1f36] mb-1 group-hover:text-[#9747FF] transition-colors">Status Changed</h4>
                            <p className="text-[13px] font-medium text-[#8896AB]">Item status changed to {foodItem.is_available ? 'Active' : 'Inactive'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-bold text-[#8896AB] mb-0.5 uppercase tracking-wider">{formatDate(foodItem.updated_at)}</p>
                            <p className="text-[12px] font-medium text-[#1a1f36]">Super Admin</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
      </motion.div>

      {/* Branches Modal */}
      <BranchesModal 
        isOpen={isBranchesModalOpen} 
        onClose={() => setIsBranchesModalOpen(false)} 
        availableBranches={availableBranches} 
      />

    </div>
  );
}
