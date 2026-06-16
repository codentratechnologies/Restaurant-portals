import { useState, useRef } from 'react';
import { ref, push, set, get } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, Plus, Trash2, Tag, Layers } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ImageUploadZone from './components/ImageUploadZone';
import MultiSelect from '../../components/common/MultiSelect';
import Select from '../../components/common/Select';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface CustomizationOption {
  id: string;
  label: string;
  price: string;
}

const InputField = ({ label, name, type = 'text', placeholder = '', required = false, children, formData, handleChange, errors, errorRefs }: any) => (
  <div ref={el => { if (errorRefs) errorRefs.current[name] = el; }} className="flex flex-col gap-1.5">
    <label className="text-sm font-bold text-brand-navy">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children ? children : (
      <input
        type={type}
        name={name}
        value={formData[name as keyof typeof formData] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${errors[name] ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
          }`}
      />
    )}
    {errors[name] && <span className="text-xs font-bold text-red-500 mt-0.5">{errors[name]}</span>}
  </div>
);

export default function CreateFoodItem() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    categories: [] as string[],
    dietaryType: '',
    price: '',
    description: '',
  });

  const [image, setImage] = useState<string | undefined>(undefined);
  const [customizations, setCustomizations] = useState<CustomizationOption[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Section A Validations
    if (!formData.name) newErrors.name = 'Item Name is required';
    else if (formData.name.length < 3 || formData.name.length > 100) newErrors.name = 'Must be between 3 and 100 characters';

    // In a real app we'd check against an API for uniqueness:
    // if (isNameTaken(formData.name)) newErrors.name = 'Item Name must be unique';

    if (formData.categories.length === 0) newErrors.categories = 'At least one category is required';
    if (!formData.dietaryType) newErrors.dietaryType = 'Dietary type is required';

    if (!formData.price) newErrors.price = 'Base Price is required';
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) newErrors.price = 'Must be greater than 0';

    if (!formData.description) newErrors.description = 'Description is required';
    else if (formData.description.length > 500) newErrors.description = 'Cannot exceed 500 characters';

    if (!image) newErrors.image = 'Food image is required';
    // Image validation (JPG/PNG, Max 2MB) would typically be handled inside the ImageUploadZone or before setting the image state.

    // Section B Validations (Customizations)
    const labels = new Set<string>();
    customizations.forEach((option, index) => {
      const labelStr = option.label.trim();
      if (!labelStr) {
        newErrors[`customization_${index}_label`] = 'Option Label is required';
      } else if (labelStr.length > 60) {
        newErrors[`customization_${index}_label`] = 'Max 60 chars';
      } else if (labels.has(labelStr.toLowerCase())) {
        newErrors[`customization_${index}_label`] = 'Option Labels must be unique';
      } else {
        labels.add(labelStr.toLowerCase());
      }

      if (option.price && (isNaN(Number(option.price)) || Number(option.price) < 0)) {
        newErrors[`customization_${index}_price`] = 'Price must be >= 0';
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.keys(newErrors)[0];
      // For customizations, scroll to the section
      if (firstError.startsWith('customization_')) {
        errorRefs.current['customizations']?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        errorRefs.current[firstError]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
    setCustomizations(prev => [...prev, { id: Date.now().toString(), label: '', price: '0' }]);
  };

  const handleRemoveCustomization = (id: string) => {
    setCustomizations(prev => prev.filter(opt => opt.id !== id));
  };

  const handleCustomizationChange = (id: string, field: 'label' | 'price', value: string) => {
    setCustomizations(prev => prev.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));

    // Clear related error
    const index = customizations.findIndex(opt => opt.id === id);
    if (index !== -1 && errors[`customization_${index}_${field}`]) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[`customization_${index}_${field}`];
        return newErr;
      });
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
        // Iterate over categories
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
        categories: formData.categories,
        price: Number(formData.price),
        description: formData.description,
        is_available: true,
        dietary_types: formData.dietaryType ? [formData.dietaryType] : [],
        image_url: image,
        customizations: customizations.length > 0
          ? customizations.map(c => ({ id: c.id, label: c.label, price: Number(c.price) }))
          : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Write to every selected category
      const updates = formData.categories.map(category => {
        const newFoodRef = ref(rtdb, `menu/${user.uid}/${category}/${foodId}`);
        return set(newFoodRef, payload);
      });
      await Promise.all(updates);
      toast.success('Food item created successfully!');
      navigate('/food');
    } catch (error) {
      console.error('Failed to create food item:', error);
      toast.error('Failed to save food item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} type="button" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-gray-50 border border-border">
                <ArrowLeft className="w-5 h-5 text-text-secondary" />
              </button>
          <div>
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">Create Food Item</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/food">
            <button type="button" className="px-5 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-gray-100 border border-border transition-all text-sm">
              Cancel
            </button>
          </Link>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 px-6 shadow-sm">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? 'Saving...' : 'Save Food Item'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Section A - Item Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-orange-50 flex items-center justify-center border border-brand-orange-100">
                <Tag className="w-5 h-5 text-brand-orange-600" />
              </div>
              <h2 className="text-lg font-black text-brand-navy">Section A: Item Details</h2>
            </div>
            <div className="p-6 space-y-6 bg-white">
              <InputField label="Item Name" name="name" placeholder="e.g. Margherita Pizza" required formData={formData} handleChange={handleChange} errors={errors} errorRefs={errorRefs} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField label="Categories" name="categories" required formData={formData} handleChange={handleChange} errors={errors} errorRefs={errorRefs}>
                  <MultiSelect
                    value={formData.categories}
                    onChange={(val) => setFormData(prev => ({ ...prev, categories: val }))}
                    options={[
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
                    ]}
                    placeholder="Select Categories"
                    error={errors.categories}
                  />
                </InputField>

                <InputField label="Dietary Type" name="dietaryType" required formData={formData} handleChange={handleChange} errors={errors} errorRefs={errorRefs}>
                  <MultiSelect
                    value={formData.dietaryType ? [formData.dietaryType] : []}
                    onChange={(val) => setFormData(prev => ({ ...prev, dietaryType: val.length > 0 ? val[val.length - 1] : '' }))}
                    options={[
                      { value: 'Veg', label: 'Vegetarian' },
                      { value: 'Non-Veg', label: 'Non-Vegetarian' },
                      { value: 'Egg', label: 'Contains Egg' }
                    ]}
                    placeholder="Select Dietary Type"
                    error={errors.dietaryType}
                  />
                </InputField>
              </div>

              <InputField label="Base Price (₹)" name="price" type="number" placeholder="0.00" required formData={formData} handleChange={handleChange} errors={errors} errorRefs={errorRefs} />

              <InputField label="Description" name="description" required formData={formData} handleChange={handleChange} errors={errors} errorRefs={errorRefs}>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter a mouth-watering description..."
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium transition-all resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${errors.description ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
                    }`}
                />
              </InputField>
            </div>
          </Card>

          {/* SECTION B: Customize Food Item */}
          <Card className="p-0 border border-border shadow-sm overflow-hidden" ref={el => errorRefs.current['customizations'] = el}>
            <div className="p-6 border-b border-border bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center border border-border">
                  <Layers className="w-5 h-5 text-brand-navy" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-brand-navy">Section B: Customizations</h2>
                  <p className="text-xs font-medium text-text-secondary mt-0.5">Create customer-facing add-ons.</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleAddCustomization} className="gap-2 bg-white font-bold">
                <Plus className="w-4 h-4" /> Add Option
              </Button>
            </div>

            <div className="p-6 bg-gray-50/30">
              {customizations.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-white">
                  <Layers className="w-8 h-8 text-text-secondary opacity-30 mx-auto mb-3" />
                  <p className="text-sm font-bold text-brand-navy">No customizations added.</p>
                  <p className="text-xs font-medium text-text-secondary mt-1">Customers will not see any add-on options.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-4 px-4 pb-2 border-b border-border text-xs font-bold text-text-secondary uppercase tracking-wider">
                    <div className="col-span-7">Option Label</div>
                    <div className="col-span-4">Price Add-on (₹)</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>

                  <AnimatePresence>
                    {customizations.map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-12 gap-4 items-start bg-white p-3 rounded-xl border border-border shadow-sm"
                      >
                        <div className="col-span-7 flex flex-col gap-1">
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => handleCustomizationChange(option.id, 'label', e.target.value)}
                            placeholder="e.g. Add Cheese"
                            className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${errors[`customization_${index}_label`] ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500'
                              }`}
                          />
                          {errors[`customization_${index}_label`] && <span className="text-[10px] font-bold text-red-500 leading-tight">{errors[`customization_${index}_label`]}</span>}
                        </div>

                        <div className="col-span-4 flex flex-col gap-1">
                          <input
                            type="number"
                            value={option.price}
                            onChange={(e) => handleCustomizationChange(option.id, 'price', e.target.value)}
                            placeholder="0"
                            className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${errors[`customization_${index}_price`] ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500'
                              }`}
                          />
                          {errors[`customization_${index}_price`] && <span className="text-[10px] font-bold text-red-500 leading-tight">{errors[`customization_${index}_price`]}</span>}
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomization(option.id)}
                            className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Image Upload */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-0 border border-border shadow-sm overflow-hidden sticky top-24">
            <div className="p-6 border-b border-border bg-white">
              <h2 className="text-base font-bold text-brand-navy flex items-center gap-1">
                Item Image <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-text-secondary font-medium mt-1">Max 2MB. JPG or PNG only.</p>
            </div>
            <div className="p-6 bg-gray-50/50" ref={el => errorRefs.current['image'] = el}>
              <ImageUploadZone
                currentImage={image}
                onUploadSuccess={(url) => { setImage(url); setErrors(prev => ({ ...prev, image: '' })); }}
                onRemove={() => setImage(undefined)}
                error={errors.image}
              />
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}

