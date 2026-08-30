import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { useListings, type ListingFormData } from '../../hooks/useListings';
import Button from '../../components/ui/Button';
import { fileToDataUrl } from '../../lib/utils';

const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Please select a category'),
  condition: z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor']),
  location: z.string().min(1, 'Please select a location'),
});

type FormData = z.infer<typeof listingSchema>;

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { createListing, isLoading } = useListings();
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      condition: 'New',
      location: '',
    },
  });
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setImageError(null);
    
    if (images.length + files.length > 5) {
      setImageError('Maximum 5 images allowed');
      return;
    }
    
    const newImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        setImageError('Only image files are allowed');
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size should be less than 5MB');
        continue;
      }
      
      try {
        const dataUrl = await fileToDataUrl(file);
        newImages.push(dataUrl);
      } catch (error) {
        setImageError('Failed to process image');
      }
    }
    
    setImages([...images, ...newImages]);
  };
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  const onSubmit = async (data: FormData) => {
    if (images.length === 0) {
      setImageError('At least one image is required');
      return;
    }
    
    try {
      const listingData: ListingFormData = {
        ...data,
        images,
      };
      
      const newListing = await createListing(listingData);
      navigate(`/listings/${newListing.id}`);
    } catch (error) {
      // Error is handled by the useListings hook
    }
  };
  
  const categories = [
    'Textbooks',
    'Electronics',
    'Clothing',
    'Appliances',
    'Notes',
    'PYQ',
    'Other',
  ];
  
  const locations = [
    'North Campus',
    'South Campus',
    'West Dorms',
    'East Dorms',
    'Off Campus',
  ];
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto animate-fade-in animate-slide-up p-4 sm:p-8">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          {window.history.length > 1 && (
            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold shadow hover:from-[#e65c00] hover:to-[#f3701a]"
            >
              &#8592; Back
            </button>
          )}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#D35400"/>
                <text x="50%" y="56%" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial, sans-serif" dy=".3em">CC</text>
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Post a New Item</h1>
            <p className="text-gray-600 text-base">Fill in the details below to list your item for sale on campus.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 text-lg">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-semibold text-gray-800 mb-2">Title</label>
              <input
                type="text"
                id="title"
                className={`mt-1 block w-full rounded-2xl border-2 border-gray-200 shadow focus:border-orange-700 focus:ring-2 focus:ring-orange-200 text-lg p-4 bg-gray-50 placeholder-gray-400 transition-all duration-200 ${errors.title ? 'border-red-500' : ''}`}
                {...register('title')}
                placeholder="Enter a catchy title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-lg font-semibold text-gray-800 mb-2">Description</label>
              <textarea
                id="description"
                rows={5}
                className={`mt-1 block w-full rounded-2xl border-2 border-gray-200 shadow focus:border-orange-700 focus:ring-2 focus:ring-orange-200 text-lg p-4 bg-gray-50 placeholder-gray-400 transition-all duration-200 ${errors.description ? 'border-red-500' : ''}`}
                {...register('description')}
                placeholder="Describe your item in detail"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-lg font-semibold text-gray-800 mb-2">Price ($)</label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0"
                className={`mt-1 block w-full rounded-2xl border-2 border-gray-200 shadow focus:border-orange-700 focus:ring-2 focus:ring-orange-200 text-lg p-4 bg-gray-50 placeholder-gray-400 transition-all duration-200 ${errors.price ? 'border-red-500' : ''}`}
                {...register('price', { valueAsNumber: true })}
                placeholder="Enter price"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-lg font-semibold text-gray-800 mb-2">Category</label>
              <select
                id="category"
                className={`mt-1 block w-full rounded-2xl border-2 border-gray-200 shadow focus:border-orange-700 focus:ring-2 focus:ring-orange-200 text-lg p-4 bg-gray-50 transition-all duration-200 ${errors.category ? 'border-red-500' : ''}`}
                {...register('category')}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
            {/* Condition */}
            <div>
              <label htmlFor="condition" className="block text-lg font-semibold text-gray-800 mb-2">Condition</label>
              <select
                id="condition"
                className={`mt-1 block w-full rounded-2xl border-2 border-gray-200 shadow focus:border-orange-700 focus:ring-2 focus:ring-orange-200 text-lg p-4 bg-gray-50 transition-all duration-200 ${errors.condition ? 'border-red-500' : ''}`}
                {...register('condition')}
              >
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
              {errors.condition && (
                <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
              )}
            </div>
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-lg font-semibold text-gray-800 mb-2">Location</label>
              <select
                id="location"
                className={`mt-1 block w-full rounded-2xl border-2 border-gray-200 shadow focus:border-orange-700 focus:ring-2 focus:ring-orange-200 text-lg p-4 bg-gray-50 transition-all duration-200 ${errors.location ? 'border-red-500' : ''}`}
                {...register('location')}
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
            {/* Image Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">Images (Max 5)</label>
              <div className="mt-1 flex justify-center rounded-2xl border-2 border-dashed border-orange-300 px-6 pt-8 pb-8 bg-orange-50">
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-16 w-16 text-orange-400" />
                  <div className="flex text-lg text-gray-600 justify-center">
                    <label htmlFor="images" className="relative cursor-pointer rounded-md bg-white font-medium text-orange-700 hover:text-orange-900 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-700 focus-within:ring-offset-2 px-2">
                      <span>Upload images</span>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              {imageError && (
                <p className="mt-1 text-xs text-red-600">{imageError}</p>
              )}
              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full rounded-xl object-cover border border-orange-200 shadow"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-3 -right-3 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 shadow-lg"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="w-full max-w-xs text-xl py-4 rounded-2xl shadow-lg font-bold bg-gradient-to-r from-[#ef6c13] to-[#f3701a] hover:from-[#e65c00] hover:to-[#f3701a] text-white flex items-center justify-center gap-2 transition-all duration-200"
                disabled={isLoading}
              >
                <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                {isLoading ? 'Posting...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListingPage;