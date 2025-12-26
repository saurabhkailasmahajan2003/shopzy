import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const GeneralPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const labelClass = "block text-xs font-semibold text-[#3D2817] uppercase tracking-wider mb-2.5";

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [authLoading, isAuthenticated, navigate]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await profileAPI.getProfile();
      if (response.success) {
        setProfileData(response.data);
        const user = response.data.user;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address 
            ? `${user.address.address || ''}, ${user.address.city || ''}, ${user.address.state || ''}, ${user.address.country || 'India'}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')
            : '',
        });
      } else {
        setError(response.message || 'Failed to load profile data.');
      }
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let addressObj = null;
      if (formData.address && formData.address.trim()) {
        const parts = formData.address.split(',').map(p => p.trim()).filter(p => p);
        if (parts.length > 0) {
          addressObj = {
            address: parts[0] || '',
            city: parts[1] || '',
            state: parts[2] || '',
            country: parts[3] || 'India',
          };
        }
      }

      const updateData = {
        name: formData.name,
        phone: formData.phone,
      };

      if (addressObj) updateData.address = addressObj;

      const response = await profileAPI.updateProfile(updateData);
      if (response.success) {
        setSuccess('Profile updated successfully!');
        await loadProfile();
      } else {
        setError(response.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D2817]/30"></div>
      </div>
    );
  }

  const { user } = profileData || {};
  const displayName = user?.name || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF8F5] lg:hidden">
      {/* Header */}
      <div className="bg-[#3D2817] text-[#FAF8F5] sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-4">
          <Link to="/profile" className="p-2 -ml-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h2 className="text-lg font-bold">General</h2>
            <p className="text-xs text-[#FAF8F5]/80">Personal details & address</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {(error || success) && (
          <div className={`mb-6 px-4 py-3 border ${error ? 'bg-red-50/80 backdrop-blur-sm text-red-800 border-red-300' : 'bg-green-50/80 backdrop-blur-sm text-green-800 border-green-300'} text-sm flex items-center gap-2.5 rounded luxury-shadow-sm`}>
            <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {error || success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-[#3D2817]/30 text-sm bg-white/60 backdrop-blur-sm text-[#3D2817] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513] transition duration-150 ease-in-out placeholder-[#3D2817]/40 rounded-lg luxury-shadow-sm"
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-[#3D2817]/30 text-sm bg-white/60 backdrop-blur-sm text-[#3D2817] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513] transition duration-150 ease-in-out placeholder-[#3D2817]/40 rounded-lg luxury-shadow-sm"
            />
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                disabled
                className="block w-full px-4 py-3 border border-[#3D2817]/30 text-sm bg-[#3D2817]/5 text-[#3D2817]/60 cursor-not-allowed rounded-lg luxury-shadow-sm"
              />
              <span className="absolute right-3 top-3 text-xs font-semibold text-[#3D2817] bg-[#8B4513]/10 px-2.5 py-1 border border-[#8B4513]/30 rounded">
                Verified
              </span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Delivery Address</label>
            <textarea
              name="address"
              rows="4"
              value={formData.address}
              onChange={handleChange}
              className="block w-full px-4 py-3 border border-[#3D2817]/30 text-sm bg-white/60 backdrop-blur-sm text-[#3D2817] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/20 focus:border-[#8B4513] transition duration-150 ease-in-out placeholder-[#3D2817]/40 resize-none rounded-lg luxury-shadow-sm"
              placeholder="Street, City, State, Zip, Country"
            />
          </div>
          <div className="pt-4 border-t border-[#3D2817]/30 flex gap-3">
            <button type="submit" className="flex-1 px-6 py-3 bg-[#3D2817] text-[#FAF8F5] text-sm font-semibold hover:bg-[#8B4513] transition-colors border border-[#3D2817] rounded-lg luxury-shadow">
              Save Changes
            </button>
            <button type="button" onClick={loadProfile} className="px-6 py-3 bg-white/60 backdrop-blur-sm text-[#3D2817] text-sm font-semibold border border-[#3D2817]/30 hover:bg-[#3D2817]/5 hover:border-[#3D2817]/50 transition-colors rounded-lg luxury-shadow-sm">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralPage;

