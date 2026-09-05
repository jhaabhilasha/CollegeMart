import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  LogOut,
  MessageCircle,
  ShoppingBag,
  PlusCircle,
  Bell,
  User,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { fetchWithAuth } from '../../lib/api';
import Avatar from '../ui/Avatar';

interface LiveNotification {
  id: string;
  type: 'message' | 'seller' | 'system';
  title: string;
  subtitle: string;
  link: string;
  time: string;
  isRead: boolean;
  avatar?: string | null;
}

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchLiveNotifications = async () => {
    if (!token || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const unreadRes = await fetchWithAuth('/api/messages/unread');
      if (unreadRes.ok) {
        const unreadData = await unreadRes.json();
        setUnreadCount(unreadData.count || 0);
      }

      const msgsRes = await fetchWithAuth('/api/messages');
      if (msgsRes.ok) {
        const msgs = await msgsRes.json();
        const incomingMsgs = Array.isArray(msgs)
          ? msgs.filter((m: any) => {
              const recId = typeof m.receiverId === 'object' ? m.receiverId?._id : m.receiverId;
              return recId === user.id;
            })
          : [];

        const recentNotifs: LiveNotification[] = incomingMsgs
          .slice(-6)
          .reverse()
          .map((m: any) => {
            const senderObj = typeof m.senderId === 'object' ? m.senderId : null;
            const senderIdStr = senderObj?._id || m.senderId;
            const senderName = senderObj?.username || 'Campus Student';
            const listingIdStr = typeof m.listingId === 'object' ? m.listingId?._id : m.listingId;

            return {
              id: m._id,
              type: 'message',
              title: `New message from ${senderName}`,
              subtitle: m.text,
              link: `/messages/${listingIdStr || 'direct'}/${senderIdStr}`,
              time: formatRelativeTime(m.createdAt),
              isRead: Boolean(m.isRead),
              avatar: senderObj?.profileImage,
            };
          });

        if (recentNotifs.length < 3) {
          recentNotifs.push({
            id: 'system-welcome',
            type: 'system',
            title: 'Welcome to CollegeConnect!',
            subtitle: 'Your campus student marketplace is active and ready for deals.',
            link: '/listings',
            time: 'Active now',
            isRead: true,
          });

          recentNotifs.push({
            id: 'seller-alert',
            type: 'seller',
            title: 'Seller Dashboard Ready',
            subtitle: 'Manage your active items and check student buyer inquiries.',
            link: '/dashboard',
            time: 'Today',
            isRead: true,
          });
        }

        setNotifications(recentNotifs);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, user?.id]);

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchWithAuth('/api/messages/mark-read', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 sm:py-3 md:py-2 bg-white shadow-lg z-50 min-h-[56px] sm:min-h-[64px] md:min-h-[48px] border-b border-gray-200 transition-all duration-200 sticky top-0">
      <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[160px] md:min-w-[120px]">
        <Link to="/" className="font-extrabold text-xl sm:text-2xl md:text-lg text-black tracking-tight select-none">
          <span className="text-[#ef6c13]">C</span>ollege
          <span className="text-[#ef6c13]">C</span>onnect
        </Link>
      </div>

      <div className="hidden md:flex w-full max-w-md flex-1 items-center justify-center mx-4">
        <form onSubmit={handleSearch} className="relative w-full">
          <input
            type="text"
            placeholder="Search for products, books, or more..."
            className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary shadow text-base transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </form>
      </div>

      <div className="flex items-center gap-2 ml-2">
        <div className="relative" ref={notifRef}>
          <button
            className="relative group p-2 rounded-xl hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition cursor-pointer"
            title="Notifications"
            type="button"
            onClick={() => {
              setShowNotifications((prev) => !prev);
              if (!showNotifications) {
                fetchLiveNotifications();
              }
            }}
          >
            <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-extrabold px-1 shadow animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-orange-100 z-50 animate-fade-in overflow-hidden">
              <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50/80 to-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
                    <Bell className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-sm text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-600 text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                {notifications.length === 0 ? (
                  <li className="p-8 text-center text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">All caught up!</p>
                    <p className="text-xs text-gray-400 mt-0.5">No new campus notifications right now.</p>
                  </li>
                ) : (
                  notifications.map((notif) => (
                    <li
                      key={notif.id}
                      className={`p-3.5 hover:bg-orange-50/50 transition cursor-pointer ${
                        !notif.isRead ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      <Link
                        to={notif.link}
                        onClick={() => setShowNotifications(false)}
                        className="flex items-start gap-3"
                      >
                        {notif.type === 'message' ? (
                          <div className="relative shrink-0 mt-0.5">
                            <Avatar src={notif.avatar} alt={notif.title} size="sm" />
                            {!notif.isRead && (
                              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-orange-600 ring-2 ring-white" />
                            )}
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-orange-100 text-orange-700 shrink-0 mt-0.5">
                            {notif.type === 'seller' ? (
                              <ShoppingBag className="w-4 h-4" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4
                              className={`text-xs truncate ${
                                !notif.isRead
                                  ? 'font-extrabold text-gray-900'
                                  : 'font-semibold text-gray-700'
                              }`}
                            >
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {notif.subtitle}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>

              <div className="p-3 border-t border-orange-100 bg-gray-50/60 text-center">
                <Link
                  to="/messages"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>View All Messages</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        <button
          className="md:hidden ml-1 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-7 w-7 text-gray-700" /> : <Menu className="h-7 w-7 text-gray-700" />}
        </button>
      </div>

      <nav className="hidden md:flex flex-wrap items-center gap-2 text-sm font-semibold relative w-auto justify-end">
        <Link
          to="/listings"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:text-orange-600 hover:bg-orange-50 transition"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Browse</span>
        </Link>

        <Link
          to="/messages"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:text-orange-600 hover:bg-orange-50 transition relative"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Messages</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white text-[10px] rounded-full px-1.5 py-0.2 min-w-[16px] text-center font-extrabold shadow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:text-orange-600 hover:bg-orange-50 transition"
        >
          <User className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/listings/create"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:text-orange-600 hover:bg-orange-50 transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post Item</span>
        </Link>

        {token && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition font-bold cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        )}

        {!token && (
          <>
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition shadow-sm"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-orange-600 text-orange-600 font-bold hover:bg-orange-50 transition ml-2"
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 w-full z-50 bg-white shadow-lg border-b border-gray-200 transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        } flex flex-col`}
        style={{ minHeight: '56px' }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="font-extrabold text-xl text-black tracking-tight select-none"
              onClick={() => setMobileMenuOpen(false)}
            >
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

        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search for products, books, or more..."
              className="w-full pl-12 pr-4 py-2 rounded-full bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary shadow text-base transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </form>
        </div>

        <nav className="flex flex-col gap-1 px-4 pb-4 text-base font-semibold">
          <Link
            to="/listings"
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:text-primary hover:bg-gray-100 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Browse</span>
          </Link>
          <Link
            to="/messages"
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:text-primary hover:bg-gray-100 transition relative"
            onClick={() => setMobileMenuOpen(false)}
          >
            <MessageCircle className="h-5 w-5" />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:text-primary hover:bg-gray-100 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/listings/create"
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:text-primary hover:bg-gray-100 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            <PlusCircle className="h-5 w-5" />
            <span>Post Item</span>
          </Link>
          {token && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:text-primary hover:bg-gray-100 transition font-bold text-left"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          )}
          {!token && (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 px-2 py-2 rounded-lg bg-orange-700 text-white font-bold hover:bg-orange-800 transition text-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 px-2 py-2 rounded-lg border-2 border-orange-700 text-orange-700 font-bold hover:bg-orange-700 hover:text-white transition mt-1 text-center justify-center"
                onClick={() => setMobileMenuOpen(false)}
              >
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