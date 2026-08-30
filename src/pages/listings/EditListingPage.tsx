import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { useListings, type ListingFormData } from '../../hooks/useListings';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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

const EditListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentListing, getListing, updateListing, isLoading } = useListings();
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(listingSchema),
  });
  
  useEffect(() => {
    if (id) {
      getListing(id);
    }
  }, [id, getListing]);
  
  useEffect(() => {
    if (currentListing) {
      reset({
        title: currentListing.title,
        description: currentListing.description,
        price: currentListing.price,
        category: currentListing.category,
        condition: currentListing.condition,
        location: currentListing.location,
      });
      setImages(currentListing.images);
    }
  }, [currentListing, reset]);
  
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!currentListing) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Listing Not Found</h2>
          <p className="mb-6 text-gray-600">The listing you're trying to edit doesn't exist or has been removed.</p>
          <Button variant="primary" onClick={() => navigate('/listings')}>
            Back to Listings
          </Button>
        </div>
      </div>
    );
  }
  
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
      
      const updatedListing = await updateListing(currentListing.id, listingData);
      navigate(`/listings/${updatedListing.id}`);
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
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-2xl">
      <div className="mx-auto max-w-full sm:max-w-2xl">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          {window.history.length > 1 && (
            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold shadow hover:from-[#e65c00] hover:to-[#f3701a]"
            >
              &#8592; Back
            </button>
          )}
          <h1 className="mb-6 text-3xl font-bold">Edit Listing</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title"className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('title')}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
              )}
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('category')}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
              )}
            </div>
            
            {/* Condition */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                Condition
              </label>
              <select
                id="condition"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                  errors.condition ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('condition')}
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
              {errors.condition && (
                <p className="mt-1 text-xs text-red-600">{errors.condition.message}</p>
              )}
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <select
                id="location"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('location')}
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>
              )}
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Images (Max 5)
              </label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                    >
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
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
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
                        className="h-24 w-full rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full sm:w-auto"
              >
                Update Listing
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditListingPage;