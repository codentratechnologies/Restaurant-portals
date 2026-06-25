import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Save, Plus, Trash2, Tag, Layers, ChevronDown } from 'lucide-react';
import { ref, get, update, set } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ImageUploadZone from './components/ImageUploadZone';
import MultiSelect from '../../components/common/MultiSelect';
import Select from '../../components/common/Select';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function UpdateFoodItem() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();

 const [formData, setFormData] = useState({
 foodId: '',
 name: '',
 categories: [] as string[],
 dietaryType: '',
 price: '',
 description: '',
 oldCategories: [] as string[],
 });

 const [image, setImage] = useState<string | undefined>(undefined);
 const [customizations, setCustomizations] = useState<CustomizationOption[]>([]);

 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isLoading, setIsLoading] = useState(true);

 const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

 // Fetch existing data
 useEffect(() => {
 const fetchItem = async () => {
 if (!user || !id) return;
 try {
 const snapshot = await get(ref(rtdb, `menu/${user.uid}`));
 if (snapshot.exists()) {
 const data = snapshot.val();
 
 let foundItem: any = null;
 let foundCategory = '';
 
 Object.keys(data).forEach((cat) => {
 if (data[cat][id]) {
 foundItem = data[cat][id];
 foundCategory = cat;
 }
 });

 if (foundItem) {
 let dietaryTypes = foundItem.dietary_types || [];
 if (!dietaryTypes.length && foundItem.is_vegetarian !== undefined) {
 dietaryTypes = foundItem.is_vegetarian ? ['Veg'] : ['Non-Veg'];
 }
 if (foundItem.tags && foundItem.tags.includes('Egg') && !dietaryTypes.includes('Egg')) dietaryTypes.push('Egg');

 const itemCategories = foundItem.categories || [foundCategory];

 setFormData({
 foodId: foundItem.foodId || '',
 name: foundItem.name || '',
 categories: itemCategories,
 dietaryType: dietaryTypes.length > 0 ? dietaryTypes[0] : '',
 price: foundItem.price ? String(foundItem.price) : '',
 description: foundItem.description || '',
 oldCategories: itemCategories,
 });

 setImage(foundItem.image_url);

 if (foundItem.customizations) {
 // Convert to array format with ids
 const formattedCustomizations = foundItem.customizations.map((c: any, index: number) => ({
 id: c.id || (Date.now() + index).toString(),
 label: c.label,
 price: String(c.price)
 }));
 setCustomizations(formattedCustomizations);
 }
 } else {
 toast.error('Food item not found!');
 navigate('/food');
 }
 } else {
 toast.error('Food item not found!');
 navigate('/food');
 }
 } catch (err) {
 console.error('Error fetching food item:', err);
 } finally {
 setIsLoading(false);
 }
 };

 fetchItem();
 }, [user, id, navigate]);

 const validate = () => {
 const newErrors: Record<string, string> = {};

 if (!formData.name) newErrors.name = 'Item Name is required';
 else if (formData.name.length < 3 || formData.name.length > 100) newErrors.name = 'Must be between 3 and 100 characters';

 if (formData.categories.length === 0) newErrors.categories = 'At least one category is required';
 if (!formData.dietaryType) newErrors.dietaryType = 'Dietary type is required';

 if (!formData.price) newErrors.price = 'Base Price is required';
 else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) newErrors.price = 'Must be greater than 0';

 if (!formData.description) newErrors.description = 'Description is required';
 else if (formData.description.length > 500) newErrors.description = 'Cannot exceed 500 characters';

 if (!image) newErrors.image = 'Food image is required';

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

 const handleRemoveCustomization = (idStr: string) => {
 setCustomizations(prev => prev.filter(opt => opt.id !== idStr));
 };

 const handleCustomizationChange = (idStr: string, field: 'label' | 'price', value: string) => {
 setCustomizations(prev => prev.map(opt => opt.id === idStr ? { ...opt, [field]: value } : opt));

 const index = customizations.findIndex(opt => opt.id === idStr);
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
 if (!validate() || !user || !id) return;

 setIsSubmitting(true);

 try {
 const payload: any = {
 name: formData.name,
 categories: formData.categories,
 price: Number(formData.price),
 description: formData.description,
 is_vegetarian: formData.dietaryType === 'Veg', // fallback
 dietary_types: formData.dietaryType ? [formData.dietaryType] : [],
 image_url: image,
 customizations: customizations.length > 0
 ? customizations.map(c => ({ id: c.id, label: c.label, price: Number(c.price) }))
 : null,
 updated_at: new Date().toISOString()
 };

 // Keep original foodId in payload just in case
 payload.foodId = formData.foodId || id;
 
 const updates: Promise<void>[] = [];

 // 1. Delete from categories that are no longer selected
 formData.oldCategories.forEach(oldCat => {
 if (!formData.categories.includes(oldCat)) {
 updates.push(set(ref(rtdb, `menu/${user.uid}/${oldCat}/${id}`), null));
 }
 });

 // 2. Update/set in all currently selected categories
 formData.categories.forEach(async (cat) => {
 const newRef = ref(rtdb, `menu/${user.uid}/${cat}/${id}`);
 // If it's a completely new category for this item, try to fetch existing item data (like created_at) from an old category if needed
 // But since we just overwrite the whole payload, we should fetch the original data once
 updates.push(update(newRef, payload));
 });

 // To ensure created_at isn't lost if moved to a brand new category, fetch it once from any old category
 if (formData.oldCategories.length > 0) {
 const snap = await get(ref(rtdb, `menu/${user.uid}/${formData.oldCategories[0]}/${id}`));
 if (snap.exists()) {
 const oldData = snap.val();
 if (oldData.created_at) {
 payload.created_at = oldData.created_at;
 }
 }
 }

 // Firebase RTDB crashes if any field is exactly `undefined`. Clean the payload.
 Object.keys(payload).forEach(key => {
 if (payload[key] === undefined) {
 delete payload[key];
 }
 });

 await Promise.all(updates);
 toast.success('Food item updated successfully!');
 navigate('/food');
 } catch (error) {
 console.error('Failed to update food item:', error);
 toast.error('Failed to update food item. Please try again.');
 } finally {
 setIsSubmitting(false);
 }
 };



 if (isLoading) {
 return (
 <div className="flex justify-center items-center h-64">
 <Loader2 className="w-8 h-8 text-brand-orange-500 animate-spin" />
 </div>
 );
 }

 return (
 <div className="max-w-3xl mx-auto space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
 <div className="flex items-center gap-4">
 <button onClick={() => navigate(-1)} type="button" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-gray-50 border border-border">
 <ArrowLeft className="w-5 h-5 text-text-secondary" />
 </button>
 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
 <h1 className="text-2xl font-black text-brand-navy tracking-tight">Update Food Item</h1>
 <p className="text-xs text-text-secondary font-medium mt-0.5">ID: <span className="font-mono font-bold text-brand-navy">{formData.foodId || '-'}</span></p>
 </motion.div>
 </div>
 
 </div>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-hidden">
 <form id="update-food-form" onSubmit={handleSubmit} className="flex flex-col">
 
 {/* SECTION 1: Item Details */}
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Item Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <InputField label="Item Name" name="name" placeholder="e.g. Margherita Pizza" required formData={formData} handleChange={handleChange} errors={errors} errorRefs={errorRefs} />
 </div>
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

 <InputField label="Base Price (₹)" name="price" type="number" placeholder="0.00" required formData={formData} handleChange={handleChange} errors={errors} errorRefs={errorRefs} />
 
 <div className="md:col-span-2">
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
 </div>
 </div>

 {/* SECTION 2: Item Image */}
 <div className="p-8 border-t border-border bg-gray-50/30">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border flex items-center justify-between">
 <span>2. Item Image <span className="text-red-500 text-sm">*</span></span>
 <span className="text-xs text-text-secondary font-medium font-normal">Max 2MB. JPG or PNG only. Existing image retained.</span>
 </h2>
 <div ref={el => { errorRefs.current[''] = el; }} className="max-w-sm">
 <ImageUploadZone
 currentImage={image}
 onUploadSuccess={(url) => { setImage(url); setErrors(prev => ({ ...prev, image: '' })); }}
 onRemove={() => setImage(undefined)}
 error={errors.image}
 />
 </div>
 </div>

 {/* SECTION 3: Customizations */}
 <div className="p-8 border-t border-border" ref={el => { errorRefs.current[''] = el; }}>
 <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
 <h2 className="text-lg font-black text-brand-navy">3. Customizations (Optional)</h2>
 <Button type="button" variant="outline" onClick={handleAddCustomization} className="gap-2 bg-white font-bold py-1.5 px-3 text-sm">
 <Plus className="w-4 h-4" /> Add Option
 </Button>
 </div>

 {customizations.length === 0 ? (
 <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-gray-50">
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

   <div className="p-8 border-t border-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
 <Link to="/food">
 <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all">
 Cancel
 </button>
 </Link>
 <Button form="update-food-form" type="submit" disabled={isSubmitting} className="gap-2 px-8 shadow-sm">
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 {isSubmitting ? 'Updating...' : 'Save Changes'}
 </Button>
 </div>
        </form>
 </Card>
 </motion.div>
 </div>
 );
}

