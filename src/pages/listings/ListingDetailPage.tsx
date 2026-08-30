import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, MessageCircle, Trash } from 'lucide-react';
import { useListings } from '../../hooks/useListings';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { ListingDetailSkeleton } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import { formatPrice } from '../../lib/utils';

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentListing, getListing, deleteListing, isLoading } = useListings();
  
  useEffect(() => {
    if (id) {
      getListing(id);
    }
  }, [id, getListing]);
  
  if (isLoading) {
    return <ListingDetailSkeleton />;
  }
  
  if (!currentListing) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 sm:p-8 text-center">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Listing Not Found</h2>
          <p className="mb-6 text-gray-600">The listing you're looking for doesn't exist or has been removed.</p>
          <Link to="/listings">
            <Button variant="primary">Browse Other Listings</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const isOwner = user?.id === currentListing.ownerId;
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      const success = await deleteListing(currentListing.id);
      if (success) {
        navigate('/listings');
      }
    }
  };
  
  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-3xl">
      <div className="rounded-lg bg-white p-4 sm:p-8 shadow-lg max-w-full sm:max-w-3xl mx-auto">
        {window.history.length > 1 && (
          <button
            onClick={() => navigate(-1)}
            className="mb-8 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold shadow hover:from-[#e65c00] hover:to-[#f3701a]"
          >
            &#8592; Back
          </button>
        )}
        
        {/* Back Button */}
        
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg">
              <img
                src={currentListing.images[0]}
                alt={currentListing.title}
                className="h-full w-full object-cover"
              />
            </div>
            
            {currentListing.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {currentListing.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${currentListing.title} - Image ${index + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Listing Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">{currentListing.title}</h1>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(currentListing.price)}
                </span>
              </div>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>{currentListing.category}</span>
                <span>•</span>
                <span>{currentListing.condition}</span>
                <span>•</span>
                <span>{currentListing.location}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="mb-4 text-lg font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-gray-600">{currentListing.description}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <h2 className="mb-4 text-lg font-semibold">Seller Information</h2>
              <div className="flex items-center space-x-4">
                <Avatar
                  src={currentListing.ownerImage}
                  alt={currentListing.ownerName}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-gray-900">{currentListing.ownerName}</p>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(currentListing.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              {isOwner ? (
                <div className="flex space-x-4">
                  <Link to={`/listings/edit/${currentListing.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Listing
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={handleDelete}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Listing
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link to={`/messages/${currentListing.id}/${currentListing.ownerId}`} className="flex-1">
                    <Button variant="primary" className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message Seller
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;