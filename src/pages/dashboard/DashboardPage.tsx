import { useAuth } from '../../hooks/useAuth';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import { User, ShoppingBag, LogOut, Edit3, MessageSquare, ShieldCheck, CheckCircle } from 'lucide-react';
import { useListings } from '../../hooks/useListings';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { fetchWithAuth } from '../../lib/api';

const navLinks = [
  { label: 'Dashboard', icon: User, to: '/dashboard' },
  { label: 'Profile', icon: Edit3, to: '/profile' },
  { label: 'My Listings', icon: ShoppingBag, to: '/listings' },
  { label: 'Post Listing', icon: ShoppingBag, to: '/listings/create' },
];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { userListings, getUserListings, isLoading } = useListings();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    getUserListings();
    // Fetch unread messages count
    fetchWithAuth('/api/messages/unread')
      .then(res => res.json())
      .then(data => setUnreadCount(data.count || 0))
      .catch(() => setUnreadCount(0));
  }, [getUserListings]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to prevent navigation if already on dashboard
  const handleNavClick = (e: React.MouseEvent, to: string) => {
    if (to === '/dashboard' && window.location.pathname === '/dashboard') {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex flex-col">
      <div className="w-full max-w-7xl mx-auto flex flex-col flex-1">
        {/* Dashboard Navbar */}
        <header className="w-full flex flex-row items-center justify-between px-4 sm:px-10 py-4 sm:py-6 bg-white shadow-lg border-b border-orange-100 z-30 flex-nowrap">
          <div className="flex items-center gap-2 sm:gap-4 flex-nowrap">
            <Avatar src={user?.profileImage} alt={user?.name} size="md" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0] || 'Student'}</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 flex-nowrap">
            {/* Message Icon with badge */}
            <button
              className="relative group"
              onClick={() => navigate('/messages')}
              aria-label="Messages"
            >
              <MessageSquare className="h-6 sm:h-7 w-6 sm:w-7 text-primary hover:text-orange-600 transition" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse">{unreadCount}</span>
              )}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow hover:from-orange-700 hover:to-orange-500 transition-all text-base sm:text-lg">
              <LogOut className="h-5 w-5" />Logout
            </button>
          </div>
        </header>
        <div className="flex flex-col md:flex-row flex-1">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col items-center gap-4 bg-white border-r border-orange-100 py-6 sm:py-10 px-2 sm:px-4 min-w-[80px] sm:min-w-[100px] rounded-tr-3xl rounded-br-3xl shadow-lg">
            <Avatar src={user?.profileImage} alt={user?.name} size="md" className="mb-4" />
            <nav className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-8 w-full">
              {/* Remove Messages from navLinks */}
              {navLinks.filter(link => link.label !== 'Messages').map(link => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    onClick={e => handleNavClick(e, link.to)}
                    className={({ isActive }) =>
                      `group flex flex-col items-center py-2 sm:py-3 rounded-2xl transition cursor-pointer w-full text-base sm:text-lg font-semibold ${isActive ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-primary shadow pointer-events-none opacity-70' : 'text-gray-400 hover:text-primary hover:bg-orange-50'}`
                    }
                    title={link.label}
                  >
                    <Icon className="h-6 sm:h-7 w-6 sm:w-7 mb-1 transition group-hover:scale-110" />
                    <span className="text-xs">{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>
          {/* Main Content */}
          <main className="flex-1 flex flex-col md:flex-row gap-4 sm:gap-8 p-4 sm:p-6 md:p-12">
            <section className="flex-1">
              <div className="rounded-2xl bg-white shadow-xl p-4 sm:p-10 mb-6 sm:mb-10 animate-fade-in animate-slide-up">
                {window.history.length > 1 && (
                  <button
                    onClick={() => navigate(-1)}
                    className="mb-6 sm:mb-8 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold shadow hover:from-[#e65c00] hover:to-[#f3701a]"
                  >
                    &#8592; Back
                  </button>
                )}
                <h1 className="text-2xl sm:text-4xl font-extrabold mb-4 sm:mb-6 text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
                <div className="mb-4 sm:mb-8 flex flex-wrap gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setShowStudentModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 px-3.5 sm:px-4 py-1.5 sm:py-2 text-primary font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 shadow-sm border border-primary/20 cursor-pointer"
                    title="Click to view student verification details"
                  >
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    <span>Verified Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('my-listings')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 hover:bg-accent/20 px-3.5 sm:px-4 py-1.5 sm:py-2 text-accent font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 shadow-sm border border-accent/20 cursor-pointer"
                    title="Click to jump to your active listings"
                  >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-accent shrink-0" />
                    <span>Active Seller ({userListings.length})</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <Link to="/listings/create" className="rounded-2xl bg-orange-50 p-4 sm:p-6 shadow hover:shadow-lg transition group border-2 border-orange-100">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <ShoppingBag className="text-accent" />
                      <span className="font-semibold text-base sm:text-lg text-accent group-hover:underline">Post a Listing</span>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">Sell books, electronics, or anything else to students.</p>
                  </Link>
                  <Link to="/listings" className="rounded-2xl bg-green-50 p-4 sm:p-6 shadow hover:shadow-lg transition group border-2 border-green-100">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <ShoppingBag className="text-success" />
                      <span className="font-semibold text-base sm:text-lg text-success group-hover:underline">My Listings</span>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">Manage your active and past listings.</p>
                  </Link>
                  <Link to="/profile" className="rounded-2xl bg-purple-50 p-4 sm:p-6 shadow hover:shadow-lg transition group border-2 border-purple-100">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                      <Edit3 className="text-secondary" />
                      <span className="font-semibold text-base sm:text-lg text-secondary group-hover:underline">Edit Profile</span>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">Update your personal information and profile picture.</p>
                  </Link>
                </div>
                {/* My Listings Section */}
                <div id="my-listings" className="mt-6 sm:mt-10 scroll-mt-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="text-success" /> My Listings
                  </h2>
                  {isLoading ? (
                    <div className="flex h-24 sm:h-40 items-center justify-center">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : userListings.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 p-4 sm:p-8 text-center">
                      <p className="mb-2 sm:mb-4 text-base sm:text-lg text-gray-600">You have not posted any listings yet.</p>
                      <Link to="/listings/create">
                        <Button variant="primary" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 rounded-2xl font-bold">Post Your First Listing</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                      {userListings.map((listing) => (
                        <Link
                          key={listing.id}
                          to={`/listings/${listing.id}`}
                          className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md border border-orange-100 transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-gray-100">
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                                  ₹{listing.price.toLocaleString('en-IN')}
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
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Right: Profile Card */}
            <aside className="w-full md:w-80 bg-white rounded-3xl shadow-xl p-6 sm:p-10 flex flex-col items-center border-2 border-orange-100 animate-fade-in animate-slide-up mt-4 md:mt-0">
              <Avatar src={user?.profileImage} alt={user?.name} size="xl" />
              <h2 className="mt-2 sm:mt-4 text-xl sm:text-2xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 mb-1 sm:mb-2">{user?.mobile}</p>
              <p className="text-gray-500 mb-2 sm:mb-4">{user?.email}</p>
              <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-6">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(true)}
                  className="rounded-full bg-primary/10 hover:bg-primary/20 px-2.5 py-1 text-xs text-primary font-semibold transition hover:scale-105 cursor-pointer shadow-sm"
                  title="Verified Student details"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('my-listings')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-full bg-accent/10 hover:bg-accent/20 px-2.5 py-1 text-xs text-accent font-semibold transition hover:scale-105 cursor-pointer shadow-sm"
                  title="View your listings"
                >
                  Seller ({userListings.length})
                </button>
              </div>
              <div className="w-full mt-2 sm:mt-4">
                <div className="mb-2 sm:mb-4">
                  <span className="block text-xs sm:text-sm text-gray-500">Listings</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900">{userListings.length}</span>
                </div>
                <div className="mb-2 sm:mb-4">
                  <span className="block text-xs sm:text-sm text-gray-500">Messages</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900">--</span>
                </div>
                <div>
                  <span className="block text-xs sm:text-sm text-gray-500">Member since</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900">2025</span>
                </div>
              </div>
            </aside>
          </main>
        </div>

        {/* Verified Student Details Modal */}
        {showStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm relative border border-orange-100 text-center">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl p-1 leading-none"
                onClick={() => setShowStudentModal(false)}
                type="button"
              >
                &times;
              </button>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Verified Student</h3>
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-4">Official Campus Account</p>
              
              <div className="bg-orange-50/60 rounded-2xl p-4 text-left space-y-2 text-sm mb-6 border border-orange-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student Name:</span>
                  <span className="font-bold text-gray-900">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-semibold text-gray-900 truncate max-w-[170px]">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Type:</span>
                  <span className="font-semibold text-primary">Student & Seller</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verification:</span>
                  <span className="inline-flex items-center text-green-700 font-bold text-xs gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Active
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/profile"
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow transition text-center"
                >
                  View Full Profile
                </Link>
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;