import { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadZoneProps {
 currentImage?: string;
 onUploadSuccess: (url: string) => void;
 onRemove?: () => void;
 error?: string;
}

export default function ImageUploadZone({ currentImage, onUploadSuccess, onRemove, error }: ImageUploadZoneProps) {
 const [isDragging, setIsDragging] = useState(false);
 const [isUploading, setIsUploading] = useState(false);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleDragOver = (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(true);
 };

 const handleDragLeave = (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(false);
 };

 const processFile = async (file: File) => {
 if (!file) return;

 const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
 if (!validTypes.includes(file.type)) {
 toast.error('Only JPG, PNG, and WebP files are allowed.');
 return;
 }
 if (file.size > 2 * 1024 * 1024) {
 toast.error('File size exceeds 2MB limit.');
 return;
 }

 setIsUploading(true);
 
 try {
 const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
 const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
 
 if (!cloudName || !uploadPreset) {
 throw new Error('Cloudinary config missing in .env');
 }

 const formData = new FormData();
 formData.append('file', file);
 formData.append('upload_preset', uploadPreset);

 const response = await fetch(
 `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
 {
 method: 'POST',
 body: formData,
 }
 );

 if (!response.ok) {
 throw new Error('Upload failed');
 }

 const data = await response.json();
 
 // Use the secure URL returned by Cloudinary
 onUploadSuccess(data.secure_url);
 } catch (err) {
 console.error('Cloudinary upload error:', err);
 toast.error('Failed to upload image. Please try again.');
 } finally {
 setIsUploading(false);
 }
 };

 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault();
 setIsDragging(false);
 if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
 processFile(e.dataTransfer.files[0]);
 }
 };

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files.length > 0) {
 processFile(e.target.files[0]);
 }
 };

 return (
 <div className="w-full flex flex-col">
 {currentImage ? (
 <div className="w-full relative rounded-lg border border-border overflow-hidden">
 <img src={currentImage} alt="Preview" className="w-full aspect-[4/3] object-cover" />
 <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
 <button
 type="button"
 onClick={() => fileInputRef.current?.click()}
 className="px-3 py-1.5 bg-white rounded text-sm font-bold text-brand-navy hover:bg-gray-50 transition-colors shadow-sm"
 >
 Change
 </button>
 {onRemove && (
 <button
 type="button"
 onClick={onRemove}
 className="px-3 py-1.5 bg-red-600 rounded text-sm font-bold text-white hover:bg-red-700 transition-colors shadow-sm"
 >
 Remove
 </button>
 )}
 </div>
 </div>
 ) : (
 <div
 className={`w-full aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-4 transition-colors cursor-pointer ${
 isDragging ? 'border-brand-orange-500 bg-brand-orange-50' : 
 error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
 }`}
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 onClick={() => !isUploading && fileInputRef.current?.click()}
 >
 {isUploading ? (
 <div className="flex flex-col items-center space-y-2">
 <div className="w-6 h-6 border-2 border-brand-orange-500 border-t-transparent rounded-full animate-spin" />
 <p className="text-xs font-bold text-text-secondary">Uploading...</p>
 </div>
 ) : (
 <div className="flex flex-col items-center text-center">
 <UploadCloud className="w-8 h-8 text-text-secondary mb-2" />
 <p className="text-sm font-bold text-brand-navy">Click or drag image</p>
 <p className="text-xs font-medium text-text-secondary mt-1">PNG, JPG up to 2MB</p>
 </div>
 )}
 </div>
 )}
 
 {error && !currentImage && (
 <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1.5">
 <X className="w-3 h-3" /> {error}
 </p>
 )}

 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileSelect}
 accept="image/jpeg, image/png"
 className="hidden"
 />
 </div>
 );
}
