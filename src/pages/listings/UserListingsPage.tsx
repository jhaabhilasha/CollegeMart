import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatPrice } from '../../lib/utils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  createdAt: string;
  location: string;
}

const UserListingsPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    fetch(`/api/listings?ownerId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch listings');
        return res.json();
      })
      .then(data => {
        setListings(data.map((l: any) => ({ ...l, id: l._id })));
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch listings');
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-5xl">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-center">User's Listings</h1>
      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 p-8 text-center">
          <p className="mb-4 text-lg text-gray-600">No listings found for this user.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map(listing => (
            <Link key={listing.id} to={`/listings/${listing.id}`} className="group overflow-hidden rounded-2xl bg-white shadow-md border-2 border-orange-100 transition-all hover:shadow-lg">
              <div className="relative h-48 overflow-hidden">
                <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute bottom-0 left-0 bg-accent px-3 py-1 text-sm font-medium text-white rounded-tr-2xl">{listing.category}</div>
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                  <span className="font-bold text-primary">{formatPrice(listing.price)}</span>
                </div>
                <p className="mb-3 text-sm text-gray-600">{listing.description.length > 80 ? `${listing.description.substring(0, 80)}...` : listing.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{listing.location}</span>
                  <span className="font-medium text-secondary">{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserListingsPage;
