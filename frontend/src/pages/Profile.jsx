import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { profileAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Invoice from '../components/Invoice';
import { FileText } from 'lucide-react';

// --- ICONS (Minimalist / Stroke Style) ---
const IconUser = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconShoppingBag = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const IconHeart = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const IconShoppingCart = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IconMapPin = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconCreditCard = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);
const IconBell = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.007 2.007 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const IconShieldCheck = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.002 12.002 0 002.944 12c.047 1.994.496 3.931 1.258 5.728a11.97 11.97 0 006.183 4.288c.376.108.775.108 1.151 0a11.97 11.97 0 006.183-4.288c.762-1.797 1.211-3.734 1.258-5.728a12.002 12.002 0 00-1.742-9.056z" />
  </svg>
);
const IconLogout = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IconAdmin = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.002 12.002 0 002.944 12c.047 1.994.496 3.931 1.258 5.728a11.97 11.97 0 006.183 4.288c.376.108.775.108 1.151 0a11.97 11.97 0 006.183-4.288c.762-1.797 1.211-3.734 1.258-5.728a12.002 12.002 0 00-1.742-9.056z" />
  </svg>
);
const IconChevronRight = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
    </svg>
  );

// Mobile Order Card component
const MobileOrderCard = ({ order, user }) => {
  const [showInvoice, setShowInvoice] = useState(false);

  return (
    <>
      <div className="bg-white/60 backdrop-blur-sm border border-[#3D2817]/30 rounded-lg p-4 luxury-shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[#3D2817]/60 mb-1">Order ID</p>
            <p className="text-sm font-bold text-[#3D2817]">#{order._id?.slice(-6).toUpperCase()}</p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold border rounded ${
            order.status === 'delivered' ? 'bg-green-50/80 text-green-800 border-green-300' : 
            order.status === 'shipped' ? 'bg-blue-50/80 text-blue-800 border-blue-300' :
            'bg-yellow-50/80 text-yellow-800 border-yellow-300'
          }`}>
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[#3D2817]/60 mb-1">Date</p>
            <p className="text-sm text-[#3D2817]">{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#3D2817]/60 mb-1">Total</p>
            <p className="text-lg font-bold text-[#8B4513]">₹{order.totalAmount?.toLocaleString()}</p>
          </div>
        </div>
        <button
          onClick={() => setShowInvoice(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#3D2817]/30 text-sm font-semibold text-[#3D2817] hover:bg-[#3D2817] hover:text-[#FAF8F5] transition-colors rounded luxury-shadow-sm"
        >
          <FileText className="w-4 h-4" />
          View Invoice
        </button>
      </div>
      {showInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowInvoice(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Invoice</h2>
              <button
                onClick={() => setShowInvoice(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <Invoice 
                order={order} 
                user={user}
                onPrint={() => window.print()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// OrderRow component for displaying order with invoice
const OrderRow = ({ order, user }) => {
  const [showInvoice, setShowInvoice] = useState(false);

  return (
    <>
      <tr className="hover:bg-white/40 backdrop-blur-sm transition-colors">
        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#3D2817]">
          #{order._id?.slice(-6).toUpperCase()}
        </td>
        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-[#3D2817]/70">
          {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
        </td>
        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold border
            ${order.status === 'delivered' ? 'bg-green-50/80 backdrop-blur-sm text-green-800 border-green-300' : 
              order.status === 'shipped' ? 'bg-blue-50/80 backdrop-blur-sm text-blue-800 border-blue-300' :
              'bg-yellow-50/80 backdrop-blur-sm text-yellow-800 border-yellow-300'}`}>
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </span>
        </td>
        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-[#8B4513] text-right font-bold">
          ₹{order.totalAmount?.toLocaleString()}
        </td>
        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
          <button
            onClick={() => setShowInvoice(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3D2817] hover:text-[#FAF8F5] border border-[#3D2817]/30 hover:bg-[#3D2817] transition-colors luxury-shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            View
          </button>
        </td>
      </tr>
      {showInvoice && (
        <tr>
          <td colSpan="5" className="p-0">
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowInvoice(false)}>
              <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Invoice</h2>
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <Invoice 
                    order={order} 
                    user={user}
                    onPrint={() => window.print()}
                  />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const Profile = () => {
  const { user: authUser, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // Menu items config
  const menuItems = [
    { id: 'profile', label: 'General', icon: IconUser, description: 'Personal details & address' },
    { id: 'orders', label: 'Orders', icon: IconShoppingBag, description: 'History & status' },
    { id: 'payments', label: 'Billing', icon: IconCreditCard, description: 'Cards & payments' },
    { id: 'security', label: 'Security', icon: IconShieldCheck, description: 'Password & 2FA' },
    { id: 'notifications', label: 'Notifications', icon: IconBell, description: 'Email & SMS preferences' },
  ];

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setProfileData(null);
      setIsLoading(false);
      return;
    }
    loadProfile();
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
    if (searchParams.get('payment') === 'success') {
      setSuccess('Payment successful! Your order has been placed.');
      navigate('/profile?tab=orders', { replace: true });
    }
  }, [searchParams, navigate]);

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

      console.log('Updating profile with data:', updateData);
      const response = await profileAPI.updateProfile(updateData);
      console.log('Profile update response:', response);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        await loadProfile();
        setIsEditMode(false);
      } else {
        setError(response.message || response.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Reusable Input Style (Cart Style)
  const labelClass = "block text-xs font-semibold text-[#3D2817] uppercase tracking-wider mb-2.5";

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D2817]/30"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null; // Or redirect logic handled by router

  const { user } = profileData || {};
  const displayName = user?.name || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();
  const isAdmin = authUser?.isAdmin || user?.isAdmin;

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#3D2817]">
      
      {/* MOBILE VIEW - Profile Style */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-[#3D2817] text-[#FAF8F5]">
          <div className="px-4 pt-12 pb-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#FAF8F5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-lg font-bold text-[#FAF8F5] pb-10">Profile</h1>
              <button 
                onClick={() => {
                  setIsEditMode(!isEditMode);
                  if (!isEditMode) {
                    // Scroll to form after a short delay to allow state update
                    setTimeout(() => {
                      document.getElementById('mobile-profile-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5 text-[#FAF8F5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Content - White Background */}
        <div className="bg-white rounded-t-3xl -mt-4 pt-8 pb-10">
          {/* Profile Picture & Info */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-24 w-24 rounded-full bg-[#8B4513] text-[#FAF8F5] flex items-center justify-center font-bold text-3xl mb-3 border-4 border-white shadow-lg">
              {userInitial}
            </div>
            <h2 className="text-2xl font-bold text-[#3D2817] mb-1">{displayName}</h2>
            <p className="text-sm text-[#3D2817]/60">{user?.email}</p>
          </div>

          {/* Location Section - Hide when in edit mode */}
          {!isEditMode && (
            <div className="px-4 mb-6">
              <p className="text-xs text-[#3D2817]/60 mb-10 uppercase tracking-wider">Location</p>
              <div className="flex items-center justify-between py-3 border-b border-[#3D2817]/10">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#8B4513]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[#8B4513] font-medium">
                    {user?.address?.country || user?.address?.state || 'India'}
                  </span>
                </div>
                <svg className="w-4 h-4 text-[#3D2817]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          {/* Account Settings Section - Hide when in edit mode */}
          {!isEditMode && (
            <div className="px-4 mb-6">
            <p className="text-xs text-[#3D2817]/60 mb-3 uppercase tracking-wider">Account Settings</p>
            {menuItems.map((item) => {
              const routeMap = {
                'profile': '/profile/general',
                'orders': '/profile/orders',
                'payments': '/profile/billing',
                'security': '/profile/security',
                'notifications': '/profile/notifications',
              };
              return (
                <Link
                  key={item.id}
                  to={routeMap[item.id] || '/profile'}
                  className="flex items-center justify-between py-4 border-b border-[#3D2817]/10 active:bg-[#3D2817]/5"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-[#3D2817]/70" />
                    <span className="text-[#3D2817] font-medium">{item.label}</span>
                  </div>
                  <IconChevronRight className="w-5 h-5 text-[#3D2817]/40" />
                </Link>
              );
            })}
            {isAdmin && (
              <Link to="/admin" className="flex items-center justify-between py-4 border-b border-[#3D2817]/10 active:bg-[#3D2817]/5">
                <div className="flex items-center gap-3">
                  <IconAdmin className="w-5 h-5 text-[#3D2817]/70" />
                  <span className="text-[#3D2817] font-medium">Admin Dashboard</span>
                </div>
                <IconChevronRight className="w-5 h-5 text-[#3D2817]/40" />
              </Link>
            )}
            </div>
          )}

          {/* Quick Actions - Hide when in edit mode */}
          {!isEditMode && (
            <div className="px-4 mb-6">
            <p className="text-xs text-[#3D2817]/60 mb-3 uppercase tracking-wider">Quick Actions</p>
            <Link to="/" className="flex items-center justify-between py-4 border-b border-[#3D2817]/10 active:bg-[#3D2817]/5">
              <div className="flex items-center gap-3">
                <IconShoppingBag className="w-5 h-5 text-[#3D2817]/70" />
                <span className="text-[#3D2817] font-medium">Continue Shopping</span>
              </div>
              <IconChevronRight className="w-5 h-5 text-[#3D2817]/40" />
            </Link>
            <Link to="/cart" className="flex items-center justify-between py-4 border-b border-[#3D2817]/10 active:bg-[#3D2817]/5">
              <div className="flex items-center gap-3">
                <IconShoppingCart className="w-5 h-5 text-[#3D2817]/70" />
                <span className="text-[#3D2817] font-medium">View Cart</span>
              </div>
              <IconChevronRight className="w-5 h-5 text-[#3D2817]/40" />
            </Link>
            </div>
          )}

          {/* Logout - Hide when in edit mode */}
          {!isEditMode && (
            <div className="px-4">
            <button
              onClick={logout}
              className="flex items-center justify-between w-full py-4 border-b border-[#3D2817]/10 active:bg-red-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <IconLogout className="w-3 h-3 text-white" />
                </div>
                <span className="text-red-600 font-medium">Log out</span>
              </div>
              <IconChevronRight className="w-5 h-5 text-red-600/40" />
            </button>
            </div>
          )}
        </div>

        {/* Mobile Profile Form - Only show when edit mode is enabled */}
        {isEditMode && (
          <div id="mobile-profile-form" className="px-4 py-6 bg-white">
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
                <button 
                  type="button" 
                  onClick={() => {
                    loadProfile();
                    setIsEditMode(false);
                  }} 
                  className="px-6 py-3 bg-white/60 backdrop-blur-sm text-[#3D2817] text-sm font-semibold border border-[#3D2817]/30 hover:bg-[#3D2817]/5 hover:border-[#3D2817]/50 transition-colors rounded-lg luxury-shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW - Dashboard Style */}
      <div className="hidden lg:flex min-h-screen bg-[#FAF8F5]">
        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-white border-r border-[#3D2817]/30 flex flex-col">
          {/* Logo/Header */}
          <div className="p-6 border-b border-[#3D2817]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#3D2817] text-[#FAF8F5] flex items-center justify-center font-bold text-lg">
                  {userInitial}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#3D2817]">Shopzy</h2>
                  <p className="text-xs text-[#3D2817]/60">Account</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg ${
                  activeTab === item.id
                    ? 'bg-[#3D2817] text-[#FAF8F5] luxury-shadow'
                    : 'text-[#3D2817]/70 hover:text-[#3D2817] hover:bg-[#3D2817]/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#FAF8F5]' : 'text-[#3D2817]/70'}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            ))}
            {isAdmin && (
              <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#3D2817]/70 hover:text-[#3D2817] hover:bg-[#3D2817]/5 rounded-lg transition-all">
                <IconAdmin className="w-5 h-5 text-[#3D2817]/70" />
                <span className="flex-1 text-left">Admin Dashboard</span>
              </Link>
            )}
          </nav>

          {/* User Info Footer */}
          <div className="p-4 border-t border-[#3D2817]/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-[#8B4513] text-[#FAF8F5] flex items-center justify-center font-bold">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#3D2817] truncate">{displayName}</p>
                <p className="text-xs text-[#3D2817]/60 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <IconLogout className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-[#3D2817]/30 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#3D2817]">Hey, {displayName.split(' ')[0]}!</h1>
                <p className="text-sm text-[#3D2817]/60 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            {/* Content Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#3D2817]">
                  {menuItems.find(i => i.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-[#3D2817]/70 mt-1">
                  {menuItems.find(i => i.id === activeTab)?.description}
                </p>
              </div>
              {activeTab === 'profile' && (
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#3D2817] border border-[#3D2817]/30 hover:bg-[#3D2817] hover:text-[#FAF8F5] transition-colors rounded-lg luxury-shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {isEditMode ? 'Cancel' : 'Edit'}
                </button>
              )}
            </div>

            {/* Notifications & Messages */}
            {(error || success) && (
              <div className={`mb-6 px-4 py-3 border ${error ? 'bg-red-50/80 backdrop-blur-sm text-red-800 border-red-300' : 'bg-green-50/80 backdrop-blur-sm text-green-800 border-green-300'} text-sm flex items-center gap-2.5 rounded luxury-shadow-sm`}>
                <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></span>
                {error || success}
              </div>
            )}

            <div className="bg-white rounded-lg border border-[#3D2817]/30 luxury-shadow-sm">
              <div className="p-6">
                    {/* --- TAB: PROFILE --- */}
                    {activeTab === 'profile' && (
                      <>
                        {!isEditMode ? (
                          <div className="max-w-2xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                              <div>
                                <label className={labelClass}>Full Name</label>
                                <div className="block w-full px-4 py-3 border border-[#3D2817]/30 text-sm bg-white/60 backdrop-blur-sm text-[#3D2817] rounded-lg luxury-shadow-sm">
                                  {formData.name || 'Not provided'}
                                </div>
                              </div>
                              <div>
                                <label className={labelClass}>Phone</label>
                                <div className="block w-full px-4 py-3 border border-[#3D2817]/30 text-sm bg-white/60 backdrop-blur-sm text-[#3D2817] rounded-lg luxury-shadow-sm">
                                  {formData.phone || 'Not provided'}
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className={labelClass}>Email Address</label>
                                <div className="relative">
                                  <div className="block w-full px-4 py-3 border border-[#3D2817]/30 text-sm bg-[#3D2817]/5 text-[#3D2817]/60 rounded-lg luxury-shadow-sm">
                                    {formData.email || 'Not provided'}
                                  </div>
                                  {formData.email && (
                                    <span className="absolute right-3 top-3 text-xs font-semibold text-[#3D2817] bg-[#8B4513]/10 px-2.5 py-1 border border-[#8B4513]/30 rounded">
                                      Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className={labelClass}>Delivery Address</label>
                                <div className="block w-full px-4 py-3 border border-[#3D2817]/30 text-sm bg-white/60 backdrop-blur-sm text-[#3D2817] rounded-lg luxury-shadow-sm min-h-[100px]">
                                  {formData.address || 'Not provided'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
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
                                <div className="md:col-span-2">
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
                                <div className="md:col-span-2">
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
                            </div>
                            <div className="pt-6 border-t border-[#3D2817]/30 flex gap-3">
                                <button type="submit" className="px-6 py-3 bg-[#3D2817] text-[#FAF8F5] text-sm font-semibold hover:bg-[#8B4513] transition-colors border border-[#3D2817] luxury-shadow">
                                    Save Changes
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    loadProfile();
                                    setIsEditMode(false);
                                  }} 
                                  className="px-6 py-3 bg-white/60 backdrop-blur-sm text-[#3D2817] text-sm font-semibold border border-[#3D2817]/30 hover:bg-[#3D2817]/5 hover:border-[#3D2817]/50 transition-colors luxury-shadow-sm"
                                >
                                  Cancel
                                </button>
                            </div>
                          </form>
                        )}
                      </>
                    )}

                    {/* --- TAB: ORDERS (Table View) --- */}
                    {activeTab === 'orders' && (
                        <div>
                           {profileData?.orders && profileData.orders.length > 0 ? (
                            <div className="overflow-x-auto border border-[#3D2817]/30 luxury-shadow-sm">
                                <table className="min-w-full divide-y divide-[#3D2817]/20">
                                    <thead className="bg-white/40 backdrop-blur-sm">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-[#3D2817] uppercase tracking-wider border-b border-[#3D2817]/30">Order ID</th>
                                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-[#3D2817] uppercase tracking-wider border-b border-[#3D2817]/30">Date</th>
                                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-[#3D2817] uppercase tracking-wider border-b border-[#3D2817]/30">Status</th>
                                            <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-[#3D2817] uppercase tracking-wider border-b border-[#3D2817]/30">Total</th>
                                            <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-[#3D2817] uppercase tracking-wider border-b border-[#3D2817]/30">Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/20 backdrop-blur-sm divide-y divide-[#3D2817]/20">
                                        {profileData.orders.map((order) => (
                                            <OrderRow key={order._id} order={order} user={profileData.user} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                           ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-white/60 backdrop-blur-sm border border-[#3D2817]/30 rounded-full flex items-center justify-center mx-auto mb-5 luxury-shadow">
                                    <IconShoppingBag className="w-10 h-10 text-[#3D2817]/60" />
                                </div>
                                <h3 className="text-xl font-semibold text-[#3D2817] mb-2">No orders placed yet</h3>
                                <p className="text-sm text-[#3D2817]/70 mb-6">Start shopping to see your orders here</p>
                                <Link to="/" className="inline-flex items-center px-6 py-3 border border-[#3D2817]/30 text-sm font-semibold text-[#3D2817] bg-white/60 backdrop-blur-sm hover:bg-[#3D2817] hover:text-[#FAF8F5] transition-colors luxury-shadow">
                                    Browse Products
                                </Link>
                            </div>
                           )}
                        </div>
                    )}

                     {/* --- TAB: PAYMENTS (Credit Card UI) --- */}
                     {activeTab === 'payments' && (
                        <div className="max-w-2xl space-y-6">
                            <div>
                                <h3 className="text-base font-bold text-[#3D2817] mb-1">Saved Cards</h3>
                                <p className="text-sm text-[#3D2817]/70">Manage your payment methods</p>
                            </div>
                            
                            {/* Realistic CSS Credit Card */}
                            <div className="relative w-full max-w-sm h-52 bg-gradient-to-br from-[#3D2817] to-[#1A1209] overflow-hidden text-[#FAF8F5] p-6 mb-6 border border-[#3D2817]/50 luxury-shadow-lg transition-transform transform hover:-translate-y-1">
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

                            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 border border-[#3D2817]/30 text-sm font-semibold text-[#3D2817] bg-white/60 backdrop-blur-sm hover:bg-[#3D2817] hover:text-[#FAF8F5] transition-colors luxury-shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Add Payment Method
                            </button>
                        </div>
                    )}

                    {/* --- TAB: SECURITY --- */}
                    {activeTab === 'security' && (
                         <div className="max-w-2xl space-y-4">
                            <div className="flex items-center justify-between p-5 border border-[#3D2817]/30 bg-white/60 backdrop-blur-sm luxury-shadow-sm">
                                <div>
                                    <h4 className="text-sm font-bold text-[#3D2817]">Password</h4>
                                    <p className="text-xs text-[#3D2817]/70 mt-1">Last changed 30 days ago</p>
                                </div>
                                <button className="text-sm font-semibold text-[#3D2817] hover:text-[#FAF8F5] border border-[#3D2817]/30 px-4 py-2 hover:bg-[#3D2817] transition-colors luxury-shadow-sm">Update</button>
                            </div>
                            <div className="flex items-center justify-between p-5 border border-[#3D2817]/30 bg-white/60 backdrop-blur-sm luxury-shadow-sm">
                                <div>
                                    <h4 className="text-sm font-bold text-[#3D2817]">Two-Factor Authentication</h4>
                                    <p className="text-xs text-[#3D2817]/70 mt-1">Add an extra layer of security</p>
                                </div>
                                <div className="relative inline-block w-11 h-6 align-middle select-none">
                                    <input type="checkbox" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border border-[#3D2817]/30 appearance-none cursor-pointer top-0.5 left-0.5 transition-all"/>
                                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-[#3D2817]/20 cursor-pointer"></label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: NOTIFICATIONS --- */}
                    {activeTab === 'notifications' && (
                        <div className="max-w-2xl space-y-3">
                             {[
                              { id: 'email', title: 'Order Updates', description: 'Get notified when your order status changes.' },
                              { id: 'promo', title: 'Promotional Emails', description: 'Receive emails about new products and sales.' },
                            ].map((item) => (
                                <label key={item.id} className="flex items-start gap-4 p-5 border border-[#3D2817]/30 bg-white/60 backdrop-blur-sm cursor-pointer hover:bg-white/80 transition-colors luxury-shadow-sm">
                                    <div className="flex h-5 items-center mt-0.5">
                                        <input type="checkbox" className="h-4 w-4 border border-[#3D2817]/30 text-[#8B4513] focus:ring-[#8B4513]/20 rounded" defaultChecked />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-sm font-semibold text-[#3D2817]">{item.title}</span>
                                        <span className="block text-xs text-[#3D2817]/70 mt-1">{item.description}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;