import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../utils/api';
import { useState } from 'react';

const BillingPage = () => {
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D2817]/30"></div>
      </div>
    );
  }

  const { user } = profileData || {};
  const displayName = user?.name || authUser?.name || 'User';

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
            <h2 className="text-lg font-bold">Billing</h2>
            <p className="text-xs text-[#FAF8F5]/80">Cards & payments</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#3D2817] mb-1">Saved Cards</h3>
          <p className="text-sm text-[#3D2817]/70">Manage your payment methods</p>
        </div>
        
        {/* Credit Card */}
        <div className="relative w-full h-52 bg-gradient-to-br from-[#3D2817] to-[#1A1209] overflow-hidden text-[#FAF8F5] p-6 border border-[#3D2817]/50 rounded-lg luxury-shadow-lg">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-white opacity-5"></div>
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 rounded-full bg-white opacity-5"></div>
          <div className="flex justify-between items-start mb-8">
            <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center border border-white/30">
              <div className="w-8 h-5 border border-white/30 rounded-sm"></div>
            </div>
            <span className="text-xs font-mono opacity-80">DEBIT</span>
          </div>
          <div className="mb-6">
            <p className="font-mono text-2xl tracking-widest">•••• •••• •••• 4242</p>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] opacity-70 uppercase tracking-wider mb-1">Card Holder</p>
              <p className="font-semibold tracking-wide uppercase text-sm">{displayName}</p>
            </div>
            <div>
              <p className="text-[10px] opacity-70 uppercase tracking-wider mb-1">Expires</p>
              <p className="font-semibold tracking-wide text-sm">12/28</p>
            </div>
          </div>
        </div>
        
        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-[#3D2817]/30 text-sm font-semibold text-[#3D2817] bg-white/60 backdrop-blur-sm hover:bg-[#3D2817] hover:text-[#FAF8F5] transition-colors rounded-lg luxury-shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Payment Method
        </button>
      </div>
    </div>
  );
};

export default BillingPage;

