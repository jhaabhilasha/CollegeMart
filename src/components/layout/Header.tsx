import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, MessageCircle, ShoppingBag, PlusCircle, Bell, User } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { token, logout } = useAuth();

  const notifications = [
    { id: 1, text: 'New message from Alice', link: '/messages' },
    { id: 2, text: 'Your item was sold!', link: '/dashboard' },
    { id: 3, text: 'New message from Bob', link: '/messages' },
  ];

  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false); // close mobile menu on search
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 sm:py-3 md:py-2 bg-white shadow-lg z-50 min-h-[56px] sm:min-h-[64px] md:min-h-[48px] border-b border-gray-200 transition-all duration-200">
      {/* Logo and Brand */}
      <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[160px] md:min-w-[120px]">
        <Link to="/" className="font-extrabold text-xl sm:text-2xl md:text-lg text-black tracking-tight select-none">
          <span className="text-[#ef6c13]">C</span>ollege
          <span className="text-[#ef6c13]">C</span>onnect
        </Link>
      </div>
      {/* Desktop Search Bar */}
      <div className="hidden md:flex w-full max-w-md flex-1 items-center justify-center mx-4">
        <form onSubmit={handleSearch} className="relative w-full">
          <input
            type="text"
            placeholder="Search for products, books, or more..."
            className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary shadow text-base transition-all duration-200"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </form>
      </div>
      {/* Always visible actions: Notification & Mode Toggle */}
      <div className="flex items-center gap-2 ml-2">
        {/* Notification Bell */}
        <div className="relative">
          <button
            className="relative group px-2 py-1 rounded-lg hover:bg-gray-100 transition"
            title="Notifications"
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            <Bell className="h-5 w-5 text-gray-500 hover:text-primary transition" />
            <span className="absolute -top-1 -right-2 bg-primary text-white text-xs rounded-full px-2 py-0.5 font-bold">{notifications.length}</span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fade-in overflow-hidden">
              <div className="p-3 border-b font-bold text-gray-700 bg-gray-50">Notifications</div>
              <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 && (
                  <li className="p-3 text-gray-400 text-center">No notifications</li>
                )}
                {notifications.map((notif) => (
                  <li key={notif.id} className="p-3 hover:bg-gray-50 transition">
                    <Link to={notif.link} className="text-primary font-medium hover:underline" onClick={() => setShowNotifications(false)}>{notif.text}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden ml-1 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-7 w-7 text-gray-700" /> : <Menu className="h-7 w-7 text-gray-700" />}
        </button>
      </div>
      {/* Desktop Nav */}
      <nav className="hidden md:flex flex-wrap items-center gap-2 text-sm font-semibold relative w-auto justify-end">
        <Link to="/listings" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:text-primary hover:bg-gray-100 transition"><ShoppingBag className="h-5 w-5" />Browse</Link>
        <Link to="/messages" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:text-primary hover:bg-gray-100 transition relative">
          <MessageCircle className="h-5 w-5" />Messages
          <span className="absolute -top-2 -right-3 bg-primary text-white text-xs rounded-full px-2 py-0.5 font-bold">3</span>
        </Link>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:text-primary hover:bg-gray-100 transition"><User className="h-5 w-5" />Dashboard</Link>
        <Link to="/listings/create" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:text-primary hover:bg-gray-100 transition"><PlusCircle className="h-5 w-5" />Post Item</Link>
        {token && (
          <button onClick={logout} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:text-primary hover:bg-gray-100 transition font-bold"><LogOut className="h-5 w-5" />Logout</button>
        )}
        {/* Auth Buttons */}
        {!token && (
          <>
            <Link to="/login" className="flex items-center gap-2 px-2 py-1 rounded-lg bg-orange-700 text-white font-bold hover:bg-orange-800 transition">
              Login
            </Link>
            <Link to="/signup" className="flex items-center gap-2 px-2 py-1 rounded-lg border-2 border-orange-700 text-orange-700 font-bold hover:bg-orange-700 hover:text-white transition ml-2">
              Sign Up
            </Link>
          </>
        )}
      </nav>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}
      <div
        className={`fixed top-0 left-0 w-full z-50 bg-white shadow-lg border-b border-gray-200 transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'} flex flex-col`}
        style={{ minHeight: '56px' }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Link to="/" className="font-extrabold text-xl text-black tracking-tight select-none" onClick={() => setMobileMenuOpen(false)}>
              <span className="text-[#ef6c13]">C</span>ollege
              <span className="text-[#ef6c13]">C</span>onnect
            </Link>
          </div>
          <button
            className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-7 w-7 text-gray-700" />
          </button>
        </div>
        {/* Mobile Search Bar */}
        <div className="px-4 pb-2">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search for products, books, or more..."
              className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary shadow text-base transition-all duration-200"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </form>
        </div>
        {/* Mobile Nav */}
        <nav className="flex flex-col gap-1 px-4 pb-4 text-base font-semibold">
          <Link to="/listings" className="flex items-center gap-2 px-2 py-2 rounded-lg hover:text-primary hover:bg-gray-100 transition" onClick={() => setMobileMenuOpen(false)}><ShoppingBag className="h-5 w-5" />Browse</Link>
          <Link to="/messages" className="flex items-center gap-2 px-2 py-2 rounded-lg hover:text-primary hover:bg-gray-100 transition relative" onClick={() => setMobileMenuOpen(false)}>
            <MessageCircle className="h-5 w-5" />Messages
            <span className="absolute -top-2 -right-3 bg-primary text-white text-xs rounded-full px-2 py-0.5 font-bold">3</span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2 rounded-lg hover:text-primary hover:bg-gray-100 transition" onClick={() => setMobileMenuOpen(false)}><User className="h-5 w-5" />Dashboard</Link>
          <Link to="/listings/create" className="flex items-center gap-2 px-2 py-2 rounded-lg hover:text-primary hover:bg-gray-100 transition" onClick={() => setMobileMenuOpen(false)}><PlusCircle className="h-5 w-5" />Post Item</Link>
          {token && (
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:text-primary hover:bg-gray-100 transition font-bold"><LogOut className="h-5 w-5" />Logout</button>
          )}
          {!token && (
            <>
              <Link to="/login" className="flex items-center gap-2 px-2 py-2 rounded-lg bg-orange-700 text-white font-bold hover:bg-orange-800 transition" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="flex items-center gap-2 px-2 py-2 rounded-lg border-2 border-orange-700 text-orange-700 font-bold hover:bg-orange-700 hover:text-white transition mt-1" onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;