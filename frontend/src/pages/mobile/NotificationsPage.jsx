import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NotificationsPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D2817]/30"></div>
      </div>
    );
  }

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
            <h2 className="text-lg font-bold">Notifications</h2>
            <p className="text-xs text-[#FAF8F5]/80">Email & SMS preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {[
          { id: 'email', title: 'Order Updates', description: 'Get notified when your order status changes.' },
          { id: 'promo', title: 'Promotional Emails', description: 'Receive emails about new products and sales.' },
        ].map((item) => (
          <label key={item.id} className="flex items-start gap-4 p-5 border border-[#3D2817]/30 bg-white/60 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-white/80 transition-colors luxury-shadow-sm">
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
    </div>
  );
};

export default NotificationsPage;

