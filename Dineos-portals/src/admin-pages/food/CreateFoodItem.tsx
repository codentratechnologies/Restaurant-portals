import { useState, useRef } from 'react';
import { ref, set, get } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronRight, Loader2, Save, Plus, Trash2, Layers, Info, ChevronUp, UploadCloud, FileImage } from 'lucide-react';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import { useAuth } from '../../hooks/useAuth';
import ImageUploadZone from './components/ImageUploadZone';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomizationOption {
  id: string;
  label: string;
  price: string;
}

const baseCategories = [
  { value: 'Appetizers', label: 'Appetizers' },
  { value: 'Soups', label: 'Soups' },
  { value: 'Salads', label: 'Salads' },
  { value: 'Shawarma', label: 'Shawarma' },
  { value: 'Grills & BBQ', label: 'Grills & BBQ' },
  { value: 'Mandi', label: 'Mandi' },
  { value: 'Kabsa', label: 'Kabsa' },
  { value: 'Biryani', label: 'Biryani' },
  { value: 'Main Course', label: 'Main Course' },
  { value: 'Seafood', label: 'Seafood' },
  { value: 'Bakery', label: 'Bakery' },
  { value: 'Desserts', label: 'Desserts' },
  { value: 'Beverages', label: 'Beverages' },
  { value: 'Family Platters', label: 'Family Platters' },
  { value: 'Kids Menu', label: 'Kids Menu' },
  { value: 'Combo Meals', label: 'Combo Meals' }
];

export default function CreateFoodItem() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    dietaryType: 'Veg',
    price: '',
    description: '',
  });

  const [image, setImage] = useState<string | undefined>(undefined);
  const [customizations, setCustomizations] = useState<CustomizationOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // New Category State
  const [customCategoriesList, setCustomCategoriesList] = useState<{value: string, label: string}[]>([]);
  const [showCategorySidebar, setShowCategorySidebar] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState<string | undefined>(undefined);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Item Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price) newErrors.price = 'Base Price is required';
    if (!image) newErrors.image = 'Food image is required';

    customizations.forEach((option, index) => {
      if (!option.label.trim()) newErrors[`customization_${index}_label`] = 'Required';
      if (!option.price) newErrors[`customization_${index}_price`] = 'Required';
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.keys(newErrors)[0];
      errorRefs.current[firstError]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddCustomization = () => {
    setCustomizations(prev => [...prev, { id: Date.now().toString(), label: '', price: '' }]);
  };

  const handleRemoveCustomization = (id: string) => {
    setCustomizations(prev => prev.filter(opt => opt.id !== id));
  };

  const handleCustomizationChange = (id: string, field: 'label' | 'price', value: string) => {
    setCustomizations(prev => prev.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));
    const index = customizations.findIndex(opt => opt.id === id);
    if (index !== -1 && errors[`customization_${index}_${field}`]) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[`customization_${index}_${field}`];
        return newErr;
      });
    }
  };

  const handleSaveNewCategory = async () => {
    if (!user) return;
    const catName = newCategoryName.trim();
    if (!catName) return toast.error("Category name is required");
    if (!newCategoryImage) return toast.error("Category image is required");

    setIsSavingCategory(true);
    try {
      // Store the image_url directly under the new category in the menu tree
      await set(ref(rtdb, `menu/${user.uid}/${catName}/image_url`), newCategoryImage);
      
      setCustomCategoriesList(prev => [...prev, { value: catName, label: catName }]);
      setFormData(prev => ({ ...prev, category: catName }));
      setNewCategoryName('');
      setNewCategoryImage(undefined);
      setShowCategorySidebar(false);
      toast.success("Category added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!validate() || !user) return;

    setIsSubmitting(true);
    try {
      const menuRootRef = ref(rtdb, `menu/${user.uid}`);
      const snapshot = await get(menuRootRef);
      let nextIdNumber = 1;
      if (snapshot.exists()) {
        const data = snapshot.val();
        let maxSeq = 0;
        Object.keys(data).forEach((categoryKey) => {
          const categoryItems = data[categoryKey];
          if (typeof categoryItems === 'object' && categoryItems !== null) {
            Object.keys(categoryItems).forEach((foodKey) => {
              const item = categoryItems[foodKey];
              if (item && item.foodId && item.foodId.startsWith('f')) {
                const num = parseInt(item.foodId.substring(1), 10);
                if (!isNaN(num) && num > maxSeq) {
                  maxSeq = num;
                }
              }
            });
          }
        });
        nextIdNumber = maxSeq + 1;
      }
      const foodId = `f${String(nextIdNumber).padStart(3, '0')}`;

      const payload = {
        foodId: foodId,
        name: formData.name,
        categories: [formData.category],
        price: Number(formData.price),
        description: formData.description,
        is_available: true,
        dietary_types: [formData.dietaryType],
        image_url: image,
        customizations: customizations.length > 0
          ? customizations.map(c => ({ id: c.id, label: c.label, price: Number(c.price) }))
          : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const newFoodRef = ref(rtdb, `menu/${user.uid}/${formData.category}/${foodId}`);
      await set(newFoodRef, payload);

      toast.success('Food item created successfully!');
      navigate('/admin/food');
    } catch (error) {
      console.error('Failed to create food item:', error);
      toast.error('Failed to save food item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allCategories = [...baseCategories, ...customCategoriesList];

  const addCategoryCardJSX = (
    <AnimatePresence>
      {showCategorySidebar && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-white border border-[#E8ECF4] rounded-xl shadow-sm overflow-hidden mt-4">
            <div 
              className="flex items-center justify-between p-4 border-b border-[#F4F6FA] cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors"
              onClick={() => setShowCategorySidebar(false)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FFF3E8] flex items-center justify-center border border-[#FFD0B5]/30">
                  <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
                </div>
                <h3 className="text-[14px] font-bold text-[#1a1f36]">Add New Category</h3>
              </div>
              <ChevronUp className="w-4 h-4 text-[#8896AB]" />
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#1a1f36]">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 bg-white border border-[#E8ECF4] rounded-lg text-[13px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-[#1a1f36]">
                  Category Image <span className="text-red-500">*</span>
                </label>
                <div className="border border-dashed border-[#E8ECF4] rounded-lg overflow-hidden bg-gray-50/30">
                  <ImageUploadZone
                    currentImage={newCategoryImage}
                    onUploadSuccess={(url) => setNewCategoryImage(url)}
                    onRemove={() => setNewCategoryImage(undefined)}
                    className="h-32"
                  />
                </div>
              </div>

              <Button 
                type="button"
                onClick={handleSaveNewCategory}
                disabled={isSavingCategory}
                className="w-full gap-2 text-[13px] bg-[#FFF3E8] text-[#FF6B00] hover:bg-[#FFE5B4] border-0"
              >
                {isSavingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isSavingCategory ? 'Adding...' : 'Add Category'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-20 mx-auto max-w-[1400px]">
      
      {/* Breadcrumbs & Title */}
      <div className="mb-6">
        <h1 className="text-[26px] font-black text-[#1a1f36] tracking-tight mb-2">Add Menu</h1>
        <div className="flex items-center text-xs font-bold text-[#8896AB]">
          <Link to="/admin/dashboard" className="hover:text-[#1a1f36] transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5" />
          <Link to="/admin/food" className="hover:text-[#1a1f36] transition-colors">Menu</Link>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5" />
          <span className="text-[#FF6B00]">Add Menu</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-[#E8ECF4] overflow-hidden">
            <div className="p-6">
              
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F4F6FA]">
                <div className="w-8 h-8 rounded-full bg-[#FFF3E8] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <h2 className="text-lg font-black text-[#1a1f36]">Menu Details</h2>
              </div>

              <form id="create-food-form" onSubmit={handleSubmit} className="space-y-5">
                
                {/* Category Row */}
                <div ref={el => { errorRefs.current['category'] = el; }} className="flex flex-col sm:flex-row gap-4 sm:items-start">
                  <div className="flex-1 w-full flex flex-col">
                    <label className="text-[13px] font-bold text-[#1a1f36] mb-1.5">Category</label>
                    <Select
                      value={formData.category}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, category: e.target.value }));
                        if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                      }}
                      options={allCategories}
                      placeholder="Select Category"
                      error={errors.category}
                    />
                    <div className="h-4 mt-1">
                      {errors.category && <span className="text-[11px] font-bold text-red-500 block">{errors.category}</span>}
                    </div>
                  </div>
                  <div className="w-full sm:w-auto sm:mt-[27px]">
                    <button
                      type="button"
                      onClick={() => setShowCategorySidebar(true)}
                      className="w-full sm:w-auto px-5 h-[42px] rounded-xl border border-[#FFD0B5] text-[#FF6B00] font-bold text-sm bg-white hover:bg-[#FFF3E8] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" /> Add New Category
                    </button>
                  </div>
                </div>

                {/* Mobile Add Category Card */}
                <div className="block lg:hidden w-full">
                  {addCategoryCardJSX}
                </div>

                {/* Food Name */}
                <div ref={el => { errorRefs.current['name'] = el; }} className="flex flex-col">
                  <label className="text-[13px] font-bold text-[#1a1f36] mb-1.5">
                    Food Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter food name"
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-[13px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] ${errors.name ? 'border-red-500' : 'border-[#E8ECF4]'}`}
                  />
                  <div className="h-4 mt-1">
                    {errors.name && <span className="text-[11px] font-bold text-red-500 block">{errors.name}</span>}
                  </div>
                </div>

                {/* Food Type & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-[#1a1f36] mb-1.5">Food Type</label>
                    <div className="flex gap-3 sm:gap-4">
                      <label className={`flex-1 flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 h-[42px] rounded-xl border cursor-pointer transition-all ${formData.dietaryType === 'Veg' ? 'border-[#00A254] bg-[#E5F5ED]/50' : 'border-[#E8ECF4] bg-white hover:bg-gray-50'}`}>
                        <div className={`w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center shrink-0 ${formData.dietaryType === 'Veg' ? 'border-[#00A254]' : 'border-gray-300'}`}>
                          {formData.dietaryType === 'Veg' && <div className="w-2 h-2 rounded-full bg-[#00A254]" />}
                        </div>
                        <span className="text-[13px] font-bold text-[#1a1f36]">Veg</span>
                        <input
                          type="radio"
                          name="dietaryType"
                          value="Veg"
                          checked={formData.dietaryType === 'Veg'}
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                      <label className={`flex-1 flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 h-[42px] rounded-xl border cursor-pointer transition-all ${formData.dietaryType === 'Non-Veg' ? 'border-[#FF3B5C] bg-[#FFF0F2]/50' : 'border-[#E8ECF4] bg-white hover:bg-gray-50'}`}>
                        <div className={`w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center shrink-0 ${formData.dietaryType === 'Non-Veg' ? 'border-[#FF3B5C]' : 'border-gray-300'}`}>
                          {formData.dietaryType === 'Non-Veg' && <div className="w-2 h-2 rounded-full bg-[#FF3B5C]" />}
                        </div>
                        <span className="text-[13px] font-bold text-[#1a1f36]">Non-Veg</span>
                        <input
                          type="radio"
                          name="dietaryType"
                          value="Non-Veg"
                          checked={formData.dietaryType === 'Non-Veg'}
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="h-4 mt-1"></div>
                  </div>

                  <div ref={el => { errorRefs.current['price'] = el; }} className="flex flex-col">
                    <label className="text-[13px] font-bold text-[#1a1f36] mb-1.5">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Enter price"
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl text-[13px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] ${errors.price ? 'border-red-500' : 'border-[#E8ECF4]'}`}
                    />
                    <div className="h-4 mt-1">
                      {errors.price && <span className="text-[11px] font-bold text-red-500 block">{errors.price}</span>}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col">
                  <label className="text-[13px] font-bold text-[#1a1f36] mb-1.5">Description</label>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      maxLength={250}
                      placeholder="Enter description of the food"
                      className="w-full px-4 py-3 bg-white border border-[#E8ECF4] rounded-xl text-[13px] font-medium transition-all resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                    <div className="absolute bottom-3 right-3 text-[11px] font-bold text-[#8896AB]">
                      {formData.description.length}/250
                    </div>
                  </div>
                  <div className="h-4 mt-1"></div>
                </div>

                {/* Customization Details */}
                <div>
                  <div className="mb-3">
                    <h3 className="text-[14px] font-bold text-[#1a1f36]">Customize Food Details <span className="text-[#8896AB] font-medium">(Optional)</span></h3>
                    <p className="text-xs font-medium text-[#8896AB] mt-0.5">Add extra options for customers to customize their food.</p>
                  </div>
                  
                  <div className="space-y-3 bg-[#F8FAFC] rounded-xl p-4 border border-[#F4F6FA]">
                    {customizations.length > 0 && (
                      <div className="flex items-center gap-2 sm:gap-4 px-1 mb-1 hidden sm:flex">
                        <div className="flex-1 text-[11px] font-bold text-[#8896AB] uppercase tracking-wider">Customize Food Detail Name</div>
                        <div className="w-[100px] sm:w-[120px] text-[11px] font-bold text-[#8896AB] uppercase tracking-wider">Price (₹)</div>
                        <div className="w-[38px]"></div>
                      </div>
                    )}
                    
                    <AnimatePresence>
                      {customizations.map((c, index) => (
                        <motion.div key={c.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-row items-start gap-2 sm:gap-4">
                          <div className="flex-1 flex flex-col">
                            <input
                              type="text"
                              value={c.label}
                              onChange={(e) => handleCustomizationChange(c.id, 'label', e.target.value)}
                              placeholder="e.g. Extra Cheese"
                              className={`w-full px-3 py-2 bg-white border rounded-lg text-[13px] font-medium transition-all focus:outline-none focus:border-[#FF6B00] ${errors[`customization_${index}_label`] ? 'border-red-500' : 'border-[#E8ECF4]'}`}
                            />
                            <div className="h-4 mt-0.5">
                              {errors[`customization_${index}_label`] && <span className="text-[10px] font-bold text-red-500 block">{errors[`customization_${index}_label`]}</span>}
                            </div>
                          </div>
                          
                          <div className="w-[80px] sm:w-[120px] flex flex-col">
                            <input
                              type="number"
                              value={c.price}
                              onChange={(e) => handleCustomizationChange(c.id, 'price', e.target.value)}
                              placeholder="0"
                              className={`w-full px-3 py-2 bg-white border rounded-lg text-[13px] font-medium transition-all focus:outline-none focus:border-[#FF6B00] ${errors[`customization_${index}_price`] ? 'border-red-500' : 'border-[#E8ECF4]'}`}
                            />
                            <div className="h-4 mt-0.5">
                              {errors[`customization_${index}_price`] && <span className="text-[10px] font-bold text-red-500 block">{errors[`customization_${index}_price`]}</span>}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCustomization(c.id)}
                            className="w-[38px] h-[38px] flex items-center justify-center rounded-lg border border-[#FFE5E5] bg-[#FFF0F0] text-[#FF3B5C] hover:bg-[#FFE5E5] transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={handleAddCustomization}
                      className="w-full py-2.5 mt-1 rounded-xl border border-dashed border-[#FFD0B5] text-[#FF6B00] font-bold text-[13px] bg-[#FFF9F5] hover:bg-[#FFF3E8] transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Another Option
                    </button>
                  </div>
                </div>

                {/* Food Image */}
                <div ref={el => { errorRefs.current['image'] = el; }} className="flex flex-col pt-2">
                  <label className="text-[13px] font-bold text-[#1a1f36] mb-1.5">
                    Food Image <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-dashed border-[#E8ECF4] rounded-xl overflow-hidden">
                    <ImageUploadZone
                      currentImage={image}
                      onUploadSuccess={(url) => { setImage(url); setErrors(prev => ({ ...prev, image: '' })); }}
                      onRemove={() => setImage(undefined)}
                      error={errors.image}
                      className="h-40"
                    />
                  </div>
                  <div className="h-4 mt-1">
                    {errors.image && <span className="text-[11px] font-bold text-red-500 block">{errors.image}</span>}
                  </div>
                </div>

              </form>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-[#F4F6FA] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F8FAFC]">
              <Link to="/admin/food" className="w-full sm:w-auto">
                <button type="button" className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-[#1a1f36] bg-white border border-[#E8ECF4] hover:bg-[#F4F6FA] transition-all text-sm">
                  Cancel
                </button>
              </Link>
              <Button form="create-food-form" type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2 px-8 shadow-sm text-sm">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? 'Saving...' : 'Save Menu'}
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebars */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Note Card */}
          <div className="bg-[#FFF9F0] border border-[#FFE5B4] rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#FFB020] flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#1a1f36] mb-1.5">Note</h3>
                <p className="text-[13px] font-medium text-[#8896AB] leading-relaxed">
                  Make sure the food details are correct.<br/>
                  This will be visible to customers.
                </p>
              </div>
            </div>
          </div>

          {/* Add Category Card */}
          {/* Add Category Card (Desktop) */}
          <div className="hidden lg:block">
            {addCategoryCardJSX}
          </div>

        </div>
      </div>
    </div>
  );
}
