import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="animate-fade-in animate-slide-up">
        <h1 className="mb-2 sm:mb-4 text-6xl sm:text-9xl font-bold text-primary">404</h1>
        <h2 className="mb-4 sm:mb-8 text-xl sm:text-2xl font-semibold text-gray-700">Page Not Found</h2>
        <p className="mb-4 sm:mb-8 max-w-full sm:max-w-md text-gray-600 text-sm sm:text-base">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" className="flex items-center text-xs sm:text-base">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;