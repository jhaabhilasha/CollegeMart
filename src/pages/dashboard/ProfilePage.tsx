import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../components/ui/Avatar';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Calendar,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Camera,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Trash2,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AVATAR_PRESETS = [
  { id: 'preset1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria', label: 'Aria' },
  { id: 'preset2', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', label: 'Felix' },
  { id: 'preset3', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya', label: 'Maya' },
  { id: 'preset4', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', label: 'Leo' },
  { id: 'preset5', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe', label: 'Chloe' },
  { id: 'preset6', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot', label: 'Bot' },
  { id: 'preset7', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', label: 'Portrait 1' },
  { id: 'preset8', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80', label: 'Portrait 2' },
];

const YEAR_OPTIONS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  '5th Year / Dual Degree',
  'Postgraduate / Masters',
  'PhD / Researcher',
  'Alumni',
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState<boolean>(Boolean(location.state?.edit));
  const [isSaving, setIsSaving] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    college: user?.college || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
    year: user?.year || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || null,
  });

  // Sync formData whenever user updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        college: user.college || '',
        studentId: user.studentId || '',
        department: user.department || '',
        year: user.year || '',
        bio: user.bio || '',
        profileImage: user.profileImage || null,
      });
    }
  }, [user]);

  // Handle local image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, profileImage: result }));
      toast.success('Photo uploaded! Click "Save Changes" to apply.');
    };
    reader.readAsDataURL(file);
  };

  // Handle custom URL input
  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    setFormData((prev) => ({ ...prev, profileImage: customUrl.trim() }));
    setCustomUrl('');
    setShowUrlInput(false);
    toast.success('Avatar image URL applied!');
  };

  // Save profile changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const sanitizedMobile = formData.mobile.replace(/\D/g, '');
    if (!sanitizedMobile || sanitizedMobile.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        mobile: sanitizedMobile,
        college: formData.college.trim(),
        studentId: formData.studentId.trim(),
        department: formData.department.trim(),
        year: formData.year,
        bio: formData.bio.trim(),
        profileImage: formData.profileImage,
      });
      setIsEditing(false);
    } catch (err: any) {
      // Error handled by useAuth toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        college: user.college || '',
        studentId: user.studentId || '',
        department: user.department || '',
        year: user.year || '',
        bio: user.bio || '',
        profileImage: user.profileImage || null,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-gray-700 font-bold shadow-sm hover:shadow-md border border-orange-100 hover:text-orange-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="primary"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold shadow-md hover:scale-105 transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition text-sm"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>

        {/* Profile Card Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
          {/* Banner Header */}
          <div className="h-36 sm:h-48 bg-gradient-to-r from-[#ef6c13] via-[#f3701a] to-orange-400 relative">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
            <div className="absolute bottom-4 right-4 sm:right-6 hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-semibold shadow-inner border border-white/30">
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span>CollegeConnect Campus Member</span>
            </div>
          </div>

          {/* Profile Header & Avatar Section */}
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-6 gap-4">
              <div className="relative group self-center sm:self-auto">
                <div className="ring-4 ring-white rounded-full shadow-2xl bg-white overflow-hidden">
                  <Avatar
                    src={formData.profileImage}
                    alt={formData.name || 'User'}
                    size="xl"
                    className="w-28 h-28 sm:w-36 sm:h-36 object-cover"
                  />
                </div>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2.5 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 hover:scale-110 transition border-2 border-white cursor-pointer"
                    title="Change profile picture"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Buttons in Header */}
              <div className="flex items-center gap-3 self-center sm:self-auto">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-4 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#ef6c13] to-[#f3701a] text-white font-bold shadow-lg hover:from-[#e65c00] hover:to-[#f3701a] hover:scale-105 transition text-sm disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="inline-flex items-center gap-2 rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50 font-bold"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Button>
                )}
              </div>
            </div>

            {/* View Mode Display */}
            {!isEditing ? (
              <div className="space-y-8 animate-fade-in">
                {/* Name & Primary Badges */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                      {user?.name || 'College Student'}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 px-3 py-0.5 text-xs font-bold border border-orange-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                      {user?.role === 'admin' ? 'Administrator' : 'Verified Student'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-semibold border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Active Account
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <span>Student at {user?.college || 'College Campus'}</span>
                    {user?.year && <span>• {user.year}</span>}
                  </p>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Contact Information */}
                  <div className="rounded-2xl bg-orange-50/50 p-5 border border-orange-100 shadow-sm">
                    <h2 className="text-sm font-bold text-orange-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-600" />
                      Contact Information
                    </h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-semibold text-gray-900">{user?.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-semibold text-gray-900">{user?.mobile || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Account Type:</span>
                        <span className="font-semibold text-primary capitalize">{user?.role || 'Student'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Campus & Academic Details */}
                  <div className="rounded-2xl bg-amber-50/50 p-5 border border-amber-100 shadow-sm">
                    <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      Academic Details
                    </h2>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">College / Campus:</span>
                        <span className="font-semibold text-gray-900 text-right truncate max-w-[200px]">
                          {user?.college || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">College / Student ID:</span>
                        <span className="font-semibold text-gray-900 text-right truncate max-w-[200px]">
                          {user?.studentId || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Department:</span>
                        <span className="font-semibold text-gray-900 text-right truncate max-w-[200px]">
                          {user?.department || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Year of Study:</span>
                        <span className="font-semibold text-gray-900">{user?.year || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About / Bio Section */}
                <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-orange-600" />
                    About Me
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {user?.bio || 'No bio added yet. Click "Edit Profile" above to tell fellow students about yourself, your department, and what you buy or sell!'}
                  </p>
                </div>

                {/* Quick Navigation Links */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold transition"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/listings"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 text-sm font-semibold transition"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>My Listings</span>
                  </Link>
                  <Link
                    to="/listings/create"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 hover:bg-green-200 text-green-800 text-sm font-semibold transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Post New Listing</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Edit Mode Form */
              <form onSubmit={handleSave} className="space-y-8 animate-fade-in">
                {/* Hidden File Input for Avatar */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Avatar Customization Box */}
                <div className="rounded-2xl bg-orange-50/60 p-5 sm:p-6 border border-orange-100 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                        <Camera className="w-4 h-4 text-orange-600" />
                        Choose or Upload Profile Picture
                      </h3>
                      <p className="text-xs text-gray-500">Pick a preset student avatar or upload a picture from your device</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      {formData.profileImage && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, profileImage: null }))}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium border border-red-200 transition"
                          title="Remove picture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Avatar Preset Grid */}
                  <div>
                    <span className="block text-xs font-semibold text-gray-600 mb-2">Student Avatar Presets:</span>
                    <div className="flex flex-wrap gap-3">
                      {AVATAR_PRESETS.map((preset) => {
                        const isSelected = formData.profileImage === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, profileImage: preset.url }))}
                            className={`relative rounded-full p-0.5 transition-all duration-150 hover:scale-110 ${
                              isSelected ? 'ring-4 ring-orange-500 scale-105 shadow-md' : 'ring-2 ring-gray-200 hover:ring-orange-300'
                            }`}
                            title={preset.label}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-12 h-12 rounded-full object-cover bg-white"
                            />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-orange-600 text-white rounded-full p-0.5 shadow">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* URL input toggle */}
                  <div className="pt-2 border-t border-orange-100">
                    {!showUrlInput ? (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="text-xs text-orange-600 hover:underline font-semibold"
                      >
                        + Or paste image URL
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCustomUrl}
                          className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition"
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="px-2 py-1.5 rounded-xl text-gray-500 hover:text-gray-700 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Abhilasha Jha"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm font-medium"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Used by buyers & sellers on campus to coordinate deals</p>
                  </div>

                  {/* Email Address (Read-Only) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Account login email cannot be changed</p>
                  </div>

                  {/* College / University */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      College / University Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                        placeholder="e.g. Techno India University"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* College ID / Student ID */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      College ID / Student ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        placeholder="Enter your college ID / Roll number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Department / Major */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Department / Branch
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g. Computer Science, Mechanical, B.Com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Academic Year
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm font-medium bg-white"
                      >
                        <option value="">Select your study year</option>
                        {YEAR_OPTIONS.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* About / Bio */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-bold text-gray-700">
                      About Me / Bio
                    </label>
                    <span className="text-xs text-gray-400">{formData.bio.length}/300</span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={300}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell campus peers about yourself! e.g., '3rd year CS student. Often selling engineering textbooks, tech accessories, and lab instruments.'"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-sm font-medium resize-none"
                  />
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-2xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition text-sm"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    variant="primary"
                    className="inline-flex items-center gap-2 px-8 py-2.5 rounded-2xl font-bold shadow-lg hover:scale-105 transition text-sm disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;