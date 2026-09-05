import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Search, X, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useListings, type Listing } from '../../hooks/useListings';
import Button from '../../components/ui/Button';
import { ListingsGridSkeleton } from '../../components/ui/Skeleton';
import { formatPrice } from '../../lib/utils';

const ListingsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const { listings, getListings, isLoading } = useListings();

  // Sync state when URL params change (e.g. from Header search)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCat = searchParams.get('category') || '';
    setSearchQuery(urlSearch);
    setSelectedCategory(urlCat);
  }, [searchParams]);

  useEffect(() => {
    getListings({ category: selectedCategory, search: searchQuery });
  }, [getListings, selectedCategory, searchQuery]);

  const handleCategorySelect = (category: string) => {
    const newCat = category === 'All' ? '' : category;
    setSelectedCategory(newCat);
    const params: Record<string, string> = {};
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (newCat) params.category = newCat;
    setSearchParams(params);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    const params: Record<string, string> = {};
    if (selectedCategory) params.category = selectedCategory;
    setSearchParams(params);
  };

  // Client-side instant filter to ensure 100% responsive search matching
  const displayedListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;
    const q = searchQuery.toLowerCase().trim();
    return listings.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q)
    );
  }, [listings, searchQuery]);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col py-6 sm:py-10">
      <div className="container mx-auto px-3 sm:px-6 max-w-7xl">
        {/* Page Title & On-Page Search Bar */}
        <div className="mb-6 sm:mb-8 text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Browse Campus Listings
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Find textbooks, student electronics, class notes, and essentials directly from peers.
          </p>

          {/* Mobile Horizontal Category Pills */}
          <div className="flex lg:hidden overflow-x-auto gap-2 py-1 scrollbar-none justify-start sm:justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${
                  selectedCategory === (category === 'All' ? '' : category)
                    ? 'bg-[#ef6c13] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-orange-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Active Search Results Indicator */}
        {searchQuery.trim() && (
          <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between flex-wrap gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-orange-600" />
              <span className="text-xs sm:text-sm text-gray-700">
                Showing results for <span className="font-bold text-gray-900">"{searchQuery}"</span>
                {selectedCategory && (
                  <span> in <span className="font-bold text-orange-600">{selectedCategory}</span></span>
                )}
                <span className="ml-1 text-gray-500 font-medium">({displayedListings.length} items found)</span>
              </span>
            </div>
            <button
              onClick={handleClearSearch}
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:text-orange-900 hover:underline cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Categories Sidebar on Desktop */}
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm sticky top-20">
              <div className="flex items-center gap-2 mb-4 text-gray-900 font-extrabold text-lg">
                <SlidersHorizontal className="w-5 h-5 text-orange-600" />
                <span>Categories</span>
              </div>
              <div className="space-y-1.5">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition cursor-pointer flex items-center justify-between ${
                      selectedCategory === (category === 'All' ? '' : category)
                        ? 'bg-orange-500 text-white shadow-xs font-bold'
                        : 'hover:bg-orange-50 text-gray-700'
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    <span>{category}</span>
                    {selectedCategory === (category === 'All' ? '' : category) && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>

              {/* Quick link to notes */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <Link
                  to="/notes"
                  className="flex items-center justify-between p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 transition group"
                >
                  <div>
                    <p className="text-xs font-extrabold">Study Notes Portal</p>
                    <p className="text-[10px] text-red-500">Sem 1 - 8 lecture PDFs & labs</p>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <ListingsGridSkeleton count={6} />
            ) : displayedListings.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange-200 bg-white/80 p-8 text-center shadow-xs">
                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {searchQuery ? `No listings matching "${searchQuery}"` : 'No listings found'}
                </h3>
                <p className="mb-5 text-xs sm:text-sm text-gray-500 max-w-sm">
                  {searchQuery
                    ? 'Try searching with different keywords, check the spelling, or clear filters.'
                    : 'Be the first student to post an item in this category!'}
                </p>
                <div className="flex items-center gap-3">
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
                    >
                      Clear Search
                    </button>
                  )}
                  <Link to="/listings/create">
                    <Button variant="primary" className="text-xs sm:text-sm px-6 py-2.5 rounded-xl font-bold">
                      Create a Listing
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayedListings.map((listing) => (
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