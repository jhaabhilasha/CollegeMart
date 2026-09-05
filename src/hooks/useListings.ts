import { create } from 'zustand';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { fetchWithAuth } from '../lib/api';

// Types
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  status: 'active' | 'sold' | 'archived';
  images: string[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName: string;
  ownerImage?: string | null;
  location: string;
  isFeatured?: boolean;
}

export type ListingFormData = Omit<
  Listing,
  'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'ownerName' | 'ownerImage'
>;

interface ListingsState {
  listings: Listing[];
  userListings: Listing[];
  featuredListings: Listing[];
  currentListing: Listing | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getListings: (filters?: any) => Promise<Listing[]>;
  getUserListings: () => Promise<Listing[]>;
  getFeaturedListings: () => Promise<Listing[]>;
  getListing: (id: string) => Promise<Listing | null>;
  createListing: (data: ListingFormData) => Promise<Listing>;
  updateListing: (id: string, data: Partial<ListingFormData>) => Promise<Listing>;
  deleteListing: (id: string) => Promise<boolean>;
  markAsSold: (id: string) => Promise<boolean>;
  markAsActive: (id: string) => Promise<boolean>;
}

// Create the store
export const useListings = create<ListingsState>()((set, get) => {
  return {
    listings: [],
    userListings: [],
    featuredListings: [],
    currentListing: null,
    isLoading: false,
    error: null,

    getListings: async (filters) => {
      set({ isLoading: true, error: null });
      try {
        let url = '/api/listings';
        const params = [];
        if (filters) {
          if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`);
          if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
          if (filters.minPrice) params.push(`minPrice=${filters.minPrice}`);
          if (filters.maxPrice) params.push(`maxPrice=${filters.maxPrice}`);
          if (filters.page) params.push(`page=${filters.page}`);
          if (filters.limit) params.push(`limit=${filters.limit}`);
        }
        if (params.length) url += `?${params.join('&')}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch listings');
        const data = await res.json();
        // Handle both old array format and new paginated format
        const listingsArray = Array.isArray(data) ? data : data.listings;
        // Map _id to id for frontend compatibility
        const listings = listingsArray.map((l: any) => ({ ...l, id: l._id }));
        set({ listings, isLoading: false });
        return listings;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch listings',
          listings: []
        });
        toast.error('Failed to load listings');
        return [];
      }
    },

    getUserListings: async () => {
      set({ isLoading: true, error: null });
      try {
        const { user } = useAuth.getState();
        if (!user) throw new Error('Not authenticated');
        const res = await fetchWithAuth(`/api/listings?ownerId=${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch user listings');
        const data = await res.json();
        // Handle both old array format and new paginated format
        const listingsArray = Array.isArray(data) ? data : data.listings;
        // Map _id to id for frontend compatibility
        const userListings = listingsArray.map((l: any) => ({ ...l, id: l._id }));
        set({ userListings, isLoading: false });
        return userListings;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch user listings',
          userListings: []
        });
        toast.error('Failed to load your listings');
        return [];
      }
    },

    getFeaturedListings: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch('/api/listings?isFeatured=true');
        if (!res.ok) throw new Error('Failed to fetch featured listings');
        const data = await res.json();
        // Handle both old array format and new paginated format
        const listingsArray = Array.isArray(data) ? data : data.listings;
        // Map _id to id for frontend compatibility
        const featuredListings = listingsArray.map((l: any) => ({ ...l, id: l._id }));
        set({ featuredListings, isLoading: false });
        return featuredListings;
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch featured listings',
          featuredListings: []
        });
        toast.error('Failed to load featured listings');
        return [];
      }
    },

    getListing: async (id: string) => {
      set({ isLoading: true, error: null, currentListing: null });
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) {
          throw new Error('Listing not found');
        }
        const l = await res.json();
        // Map _id to id for frontend compatibility
        const listing = { ...l, id: l._id };
        set({ currentListing: listing, isLoading: false });
        return listing;
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch listing',
          currentListing: null
        });
        toast.error('Failed to load listing details');
        return null;
      }
    },
    
    createListing: async (data: ListingFormData) => {
      set({ isLoading: true, error: null });
      try {
        const { user } = useAuth.getState();
        if (!user) {
          throw new Error('Not authenticated');
        }
        // Send POST request to backend
        const res = await fetchWithAuth('/api/listings', {
          method: 'POST',
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to create listing');
        }
        const l = await res.json();
        // Map _id to id for frontend compatibility
        const newListing: Listing = { ...l, id: l._id };
        // Update listings state
        const updatedListings = [newListing, ...get().listings];
        const updatedUserListings = [newListing, ...get().userListings];
        set({ 
          listings: updatedListings,
          userListings: updatedUserListings,
          isLoading: false 
        });
        toast.success('Listing created successfully!');
        return newListing;
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to create listing'
        });
        toast.error('Failed to create listing');
        throw error;
      }
    },
    
    updateListing: async (id: string, data: Partial<ListingFormData>) => {
      set({ isLoading: true, error: null });
      
      try {
        const { user } = useAuth.getState();
        if (!user) {
          throw new Error('Not authenticated');
        }

        const res = await fetchWithAuth(`/api/listings/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to update listing');
        }

        const updatedData = await res.json();
        const updatedListing: Listing = { ...updatedData, id: updatedData._id || id };
        
        // Update state
        const updatedListings = get().listings.map(listing => 
          listing.id === id ? updatedListing : listing
        );
        
        const updatedUserListings = get().userListings.map(listing => 
          listing.id === id ? updatedListing : listing
        );
        
        set({ 
          listings: updatedListings,
          userListings: updatedUserListings,
          currentListing: updatedListing,
          isLoading: false 
        });
        
        toast.success('Listing updated successfully!');
        return updatedListing;
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to update listing'
        });
        toast.error('Failed to update listing');
        throw error;
      }
    },
    
    deleteListing: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const { user } = useAuth.getState();
        if (!user) {
          throw new Error('Not authenticated');
        }
        // Call backend DELETE API
        const res = await fetchWithAuth(`/api/listings/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to delete listing');
        }
        // Update state by filtering out the deleted listing
        const updatedListings = get().listings.filter(listing => listing.id !== id);
        const updatedUserListings = get().userListings.filter(listing => listing.id !== id);
        const updatedFeaturedListings = get().featuredListings.filter(listing => listing.id !== id);
        set({ 
          listings: updatedListings,
          userListings: updatedUserListings,
          featuredListings: updatedFeaturedListings,
          currentListing: null,
          isLoading: false 
        });
        toast.success('Listing deleted successfully!');
        return true;
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to delete listing'
        });
        toast.error('Failed to delete listing');
        return false;
      }
    },

    markAsSold: async (id: string) => {
      try {
        const { user } = useAuth.getState();
        if (!user) throw new Error('Not authenticated');
        
        const res = await fetchWithAuth(`/api/listings/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'sold' }),
        });
        
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to mark as sold');
        }
        
        // Update local state
        const updateStatus = (listing: Listing) => 
          listing.id === id ? { ...listing, status: 'sold' as const } : listing;
        
        set({
          listings: get().listings.map(updateStatus),
          userListings: get().userListings.map(updateStatus),
          currentListing: get().currentListing?.id === id 
            ? { ...get().currentListing!, status: 'sold' } 
            : get().currentListing,
        });
        
        toast.success('Listing marked as sold!');
        return true;
      } catch (error) {
        toast.error('Failed to mark as sold');
        return false;
      }
    },

    markAsActive: async (id: string) => {
      try {
        const { user } = useAuth.getState();
        if (!user) throw new Error('Not authenticated');
        
        const res = await fetchWithAuth(`/api/listings/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'active' }),
        });
        
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to mark as active');
        }
        
        // Update local state
        const updateStatus = (listing: Listing) => 
          listing.id === id ? { ...listing, status: 'active' as const } : listing;
        
        set({
          listings: get().listings.map(updateStatus),
          userListings: get().userListings.map(updateStatus),
          currentListing: get().currentListing?.id === id 
            ? { ...get().currentListing!, status: 'active' } 
            : get().currentListing,
        });
        
        toast.success('Listing marked as active!');
        return true;
      } catch (error) {
        toast.error('Failed to mark as active');
        return false;
      }
    },
  };
});