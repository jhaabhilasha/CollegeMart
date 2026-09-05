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
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-7xl">
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
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md border border-orange-100 transition-all duration-200 hover:-translate-y-0.5 animate-fade-in"
    >
      <div className="relative h-40 w-full overflow-hidden bg-gray-100">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white rounded-md">
          {listing.category}
        </div>
      </div>
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition">
              {listing.title}
            </h3>
            <span className="font-extrabold text-sm sm:text-base text-orange-600 shrink-0">
              {formatPrice(listing.price)}
            </span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {listing.description}
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100 mt-auto">
          <span className="truncate max-w-[130px]">{listing.location}</span>
          <span className="shrink-0">{new Date(listing.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
};

export default ListingsPage;