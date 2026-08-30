import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import { useListings, type Listing } from '../../hooks/useListings';
import Button from '../../components/ui/Button';
import { ListingsGridSkeleton } from '../../components/ui/Skeleton';
import { formatPrice } from '../../lib/utils';

const ListingsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { listings, getListings, isLoading } = useListings();
  
  useEffect(() => {
    getListings({ category: selectedCategory, search: searchQuery });
  }, [getListings, selectedCategory, searchQuery]);
  
  const categories = [
    'All',
    'Textbooks',
    'Electronics',
    'Clothing',
    'Appliances',
    'Notes',
    'PYQ',
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col py-10">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-5xl">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-center">Browse Listings</h1>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Categories Sidebar */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`w-full rounded-xl px-4 py-3 text-left text-lg font-semibold transition-colors ${
                      selectedCategory === (category === 'All' ? '' : category)
                        ? 'bg-gradient-to-r from-orange-400 to-orange-300 text-white shadow'
                        : 'hover:bg-orange-100 text-gray-700'
                    }`}
                    onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <ListingsGridSkeleton count={6} />
            ) : listings.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 p-8 text-center">
                <p className="mb-4 text-lg text-gray-600">No listings found</p>
                <Link to="/listings/create">
                  <Button variant="primary" className="text-lg px-8 py-3 rounded-2xl font-bold">Create a Listing</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ListingCard = ({ listing }: { listing: Listing }) => {
  return (
    <Link 
      to={`/listings/${listing.id}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-md border-2 border-orange-100 transition-all hover:shadow-lg animate-fade-in"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 bg-accent px-3 py-1 text-sm font-medium text-white rounded-tr-2xl">
          {listing.category}
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
          <span className="font-bold text-primary">{formatPrice(listing.price)}</span>
        </div>
        <p className="mb-3 text-sm text-gray-600">
          {listing.description.length > 80 
            ? `${listing.description.substring(0, 80)}...` 
            : listing.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{listing.location}</span>
          <span className="font-medium text-secondary">
            {new Date(listing.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ListingsPage;