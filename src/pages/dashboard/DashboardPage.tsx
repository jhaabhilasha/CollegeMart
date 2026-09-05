import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar';
import {
  User,
  ShoppingBag,
  LogOut,
  Edit3,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  PlusCircle,
  ArrowLeft,
} from 'lucide-react';
import { useListings } from '../../hooks/useListings';
import { useEffect, useState, useRef } from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import { fetchWithAuth } from '../../lib/api';

const navLinks = [
  { label: 'Dashboard', icon: User, to: '/dashboard' },
  { label: 'Profile', icon: Edit3, to: '/profile' },
  { label: 'My Listings', icon: ShoppingBag, to: '#my-listings' },
  { label: 'Post Listing', icon: ShoppingBag, to: '/listings/create' },
];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { userListings, getUserListings, isLoading } = useListings();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'listings'>('dashboard');
  const centerContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserListings();
    // Fetch unread messages count
    fetchWithAuth('/api/messages/unread')
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => setUnreadCount(0));
  }, [getUserListings]);

  // Track scroll position in the center container to update active tab indicator
  useEffect(() => {
    const handleScroll = () => {
      const listingsEl = document.getElementById('my-listings');
      const container = centerContentRef.current;
      if (listingsEl && container) {
        const rect = listingsEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (rect.top - containerRect.top <= 220) {
          setActiveTab('listings');
        } else {
          setActiveTab('dashboard');
        }
      } else if (listingsEl) {
        const rect = listingsEl.getBoundingClientRect();
        if (rect.top <= 250) {
          setActiveTab('listings');
        } else {
          setActiveTab('dashboard');
        }
      }
    };

    const container = centerContentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Click handler for navigation items
  const handleNavClick = (to: string) => {
    if (to === '/dashboard') {
      setActiveTab('dashboard');
      if (centerContentRef.current) {
        centerContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (to === '#my-listings') {
      setActiveTab('listings');
      const el = document.getElementById('my-listings');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/listings');
      }
    } else {
      navigate(to);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-gradient-to-br from-orange-50 via-white to-orange-100/50 flex flex-col overflow-hidden">
      {/* ================= 1. STATIC TOP DASHBOARD NAVBAR ================= */}
      <header className="w-full flex flex-row items-center justify-between px-4 sm:px-8 py-3 bg-white/95 backdrop-blur-md shadow-sm border-b border-orange-100 z-30 shrink-0 flex-nowrap">
        <div className="flex items-center gap-3 sm:gap-4 flex-nowrap">
          <Avatar src={user?.profileImage} alt={user?.name} size="md" />
          <div>
            <span className="text-base sm:text-xl font-bold text-gray-900 block leading-tight">
              Welcome, {user?.name?.split(' ')[0] || 'Student'}
            </span>
            <span className="text-[11px] sm:text-xs text-orange-600 font-semibold hidden sm:inline-block">
              Campus Seller Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-nowrap">
          {/* Message Icon with unread badge */}
          <button
            className="relative p-2 rounded-xl hover:bg-orange-50 transition group cursor-pointer"
            onClick={() => navigate('/messages')}
            aria-label="Messages"
            title="View Messages"
          >
            <MessageSquare className="h-5 sm:h-6 w-5 sm:w-6 text-primary group-hover:text-orange-600 transition" />
            {unreadCount > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.2 font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Quick Post Listing Button */}
          <Link
            to="/listings/create"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition"
          >
            <PlusCircle className="w-4 h-4 text-orange-600" />
            <span>Post Listing</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-sm hover:from-orange-700 hover:to-orange-600 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Top Navigation Tabs (< 768px) */}
      <div className="flex md:hidden items-center justify-around bg-white border-b border-orange-100 px-2 py-1.5 shrink-0 z-20 shadow-xs">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isSelected =
            (link.to === '/dashboard' && activeTab === 'dashboard') ||
            (link.to === '#my-listings' && activeTab === 'listings');

          return (
            <button
              key={link.label}
              type="button"
              onClick={() => handleNavClick(link.to)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                isSelected
                  ? 'bg-orange-100 text-orange-700 font-bold'
                  : 'text-gray-500 hover:text-orange-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= 2. MAIN 3-COLUMN LAYOUT CONTAINER ================= */}
      <div className="flex-1 flex flex-row overflow-hidden relative max-w-7xl mx-auto w-full p-2 sm:p-4 md:p-6 gap-4 lg:gap-6">
        
        {/* ----- COLUMN 1: LEFT STATIC NAVIGATION SIDEBAR ----- */}
        {/* This stays 100% static in place when scrolling through listings */}
        <aside className="hidden md:flex flex-col items-center gap-3 bg-white border border-orange-100 py-6 px-2 sm:px-3 w-20 lg:w-24 shrink-0 rounded-3xl shadow-md h-full overflow-y-auto custom-scrollbar select-none z-10">
          <Link to="/profile" className="group block mb-2" title="View & Edit Profile">
            <Avatar
              src={user?.profileImage}
              alt={user?.name}
              size="md"
              className="transition-transform group-hover:scale-110 group-hover:ring-2 ring-orange-400 cursor-pointer shadow-sm"
            />
          </Link>

          <nav className="flex flex-col gap-3 w-full">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isSelected =
                (link.to === '/dashboard' && activeTab === 'dashboard') ||
                (link.to === '#my-listings' && activeTab === 'listings');

              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavClick(link.to)}
                  className={`group flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer w-full font-semibold select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 shadow-xs font-bold scale-105'
                      : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50 hover:scale-105'
                  }`}
                  title={link.label}
                >
                  <Icon className="h-6 w-6 mb-1 transition-transform group-hover:scale-110" />
                  <span className="text-[11px] text-center leading-tight">{link.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ----- COLUMN 2: CENTER SCROLLABLE CONTENT FEED ----- */}
        {/* The user scrolls here to explore their items, while sidebars remain static */}
        <main
          ref={centerContentRef}
          className="flex-1 h-full overflow-y-auto pr-1 pb-12 custom-scrollbar space-y-6"
        >
          {/* Welcome Card */}
          <div className="rounded-3xl bg-white shadow-md border border-orange-100 p-5 sm:p-8 animate-fade-in">
            {window.history.length > 1 && (
              <button
                onClick={() => navigate(-1)}
                className="mb-4 sm:mb-6 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition border border-orange-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 text-gray-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
            </h1>

            {/* Verification & Seller Badges */}
            <div className="mb-6 flex flex-wrap gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowStudentModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 text-primary font-semibold text-xs sm:text-sm transition-all duration-200 hover:scale-105 shadow-xs border border-primary/20 cursor-pointer"
                title="Click to view student verification details"
              >
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Verified Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('#my-listings')}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 hover:bg-accent/20 px-3.5 py-1.5 text-accent font-semibold text-xs sm:text-sm transition-all duration-200 hover:scale-105 shadow-xs border border-accent/20 cursor-pointer"
                title="Click to jump to your active listings"
              >
                <ShoppingBag className="w-4 h-4 text-accent shrink-0" />
                <span>Active Seller ({userListings.length})</span>
              </button>
            </div>

            {/* 3 Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-2">
              <Link
                to="/listings/create"
                className="rounded-2xl bg-orange-50 hover:bg-orange-100/80 p-4 transition group border border-orange-200 shadow-xs hover:shadow"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-xl bg-orange-200/70 text-orange-700">
                    <ShoppingBag className="w-4 h-4 text-accent" />
                  </div>
                  <span className="font-bold text-sm text-gray-900 group-hover:text-orange-600 transition">
                    Post a Listing
                  </span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Sell textbooks, electronics, drafters, or campus notes.
                </p>
              </Link>

              <button
                type="button"
                onClick={() => handleNavClick('#my-listings')}
                className="rounded-2xl bg-green-50 hover:bg-green-100/80 p-4 transition group border border-green-200 shadow-xs hover:shadow text-left cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-xl bg-green-200/70 text-green-700">
                    <ShoppingBag className="w-4 h-4 text-success" />
                  </div>
                  <span className="font-bold text-sm text-gray-900 group-hover:text-green-700 transition">
                    My Listings ({userListings.length})
                  </span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Manage and view your {userListings.length} active college items.
                </p>
              </button>

              <Link
                to="/profile"
                state={{ edit: true }}
                className="rounded-2xl bg-purple-50 hover:bg-purple-100/80 p-4 transition group border border-purple-200 shadow-xs hover:shadow"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-xl bg-purple-200/70 text-purple-700">
                    <Edit3 className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="font-bold text-sm text-gray-900 group-hover:text-purple-700 transition">
                    Edit Profile
                  </span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Update avatar, college, branch, year & campus bio.
                </p>
              </Link>
            </div>
          </div>

          {/* My Listings Section */}
          <div id="my-listings" className="rounded-3xl bg-white shadow-md border border-orange-100 p-5 sm:p-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />
                <span>My Listings</span>
                <span className="text-xs sm:text-sm font-bold bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full ml-1">
                  {userListings.length}
                </span>
              </h2>
              <Link
                to="/listings/create"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold text-xs sm:text-sm shadow-xs hover:scale-105 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ New Item</span>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : userListings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-6 sm:p-10 text-center">
                <p className="mb-4 text-base text-gray-600">You have not posted any listings yet.</p>
                <Link to="/listings/create">
                  <Button variant="primary" className="text-sm px-6 py-2 rounded-2xl font-bold">
                    Post Your First Listing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {userListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listings/${listing.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-xs hover:shadow-md border border-orange-100 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white rounded-md">
                        {listing.category}
                      </div>
                    </div>
                    <div className="p-3.5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition">
                            {listing.title}
                          </h3>
                          <span className="font-extrabold text-sm text-orange-600 shrink-0">
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
        </main>

        {/* ----- COLUMN 3: RIGHT STATIC PROFILE CARD ----- */}
        {/* This stays 100% static in place when scrolling through listings */}
        <aside className="hidden lg:flex flex-col items-center bg-white border border-orange-100 p-6 w-72 xl:w-80 shrink-0 rounded-3xl shadow-md h-full overflow-y-auto custom-scrollbar select-none z-10">
          <Avatar
            src={user?.profileImage}
            alt={user?.name}
            size="xl"
            className="shadow-md ring-4 ring-orange-50"
          />
          <h2 className="mt-3 text-lg xl:text-xl font-bold text-gray-900 text-center leading-tight">
            {user?.name}
          </h2>
          <p className="text-xs text-gray-500 mb-0.5">{user?.mobile}</p>
          <p className="text-xs text-gray-500 mb-3 truncate max-w-[220px]">{user?.email}</p>

          <div className="flex gap-1.5 mb-4">
            <button
              type="button"
              onClick={() => setShowStudentModal(true)}
              className="rounded-full bg-primary/10 hover:bg-primary/20 px-2.5 py-1 text-xs text-primary font-bold transition hover:scale-105 cursor-pointer shadow-xs border border-primary/20"
              title="Verified Student details"
            >
              Verified Student
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('#my-listings')}
              className="rounded-full bg-accent/10 hover:bg-accent/20 px-2.5 py-1 text-xs text-accent font-bold transition hover:scale-105 cursor-pointer shadow-xs border border-accent/20"
              title="View your listings"
            >
              Seller ({userListings.length})
            </button>
          </div>

          <div className="w-full space-y-3 text-left pt-2 border-t border-orange-100">
            {user?.college && (
              <div>
                <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider">Campus</span>
                <span className="text-xs font-semibold text-gray-800 line-clamp-2">{user.college}</span>
              </div>
            )}
            {user?.department && (
              <div>
                <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider">Branch</span>
                <span className="text-xs font-semibold text-gray-800 line-clamp-1">{user.department}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider">Listings</span>
                <span className="text-base font-extrabold text-orange-600">{userListings.length}</span>
              </div>
              <div>
                <span className="block text-[11px] text-gray-400 font-medium uppercase tracking-wider">Joined</span>
                <span className="text-base font-extrabold text-gray-800">2025</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/profile"
                state={{ edit: true }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow transition hover:scale-102"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Full Profile</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ================= VERIFIED STUDENT MODAL ================= */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm relative border border-orange-100 text-center animate-slide-up">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl p-1 leading-none cursor-pointer"
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
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;