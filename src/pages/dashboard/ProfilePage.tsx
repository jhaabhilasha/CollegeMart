import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../components/ui/Avatar';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold shadow hover:from-[#e65c00] hover:to-[#f3701a] z-50"
      >
        &#8592; Back
      </button>
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-full sm:max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col items-center">
        <Avatar src={user?.profileImage} alt={user?.name || user?.email || 'User'} size="xl" className="mb-2 sm:mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{user?.name || 'User'}</h1>
        <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">{user?.email}</p>
        <p className="text-gray-600 mb-1 sm:mb-2 text-sm sm:text-base">{user?.mobile}</p>
        <span className="inline-block rounded-full bg-primary/10 px-3 sm:px-4 py-1 sm:py-2 text-primary font-medium text-xs sm:text-base mb-2 sm:mb-4">{user?.role === 'admin' ? 'Admin' : 'Student'}</span>
        <div className="w-full mt-2 sm:mt-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">About</h2>
          <p className="text-gray-700 mb-2 sm:mb-4 text-sm sm:text-base">This is your public profile. Other users can see your name, email, and mobile number here.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;