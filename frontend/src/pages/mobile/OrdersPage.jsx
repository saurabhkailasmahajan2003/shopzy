import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Invoice from '../../components/Invoice';
import { FileText } from 'lucide-react';

const IconShoppingBag = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

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

const OrdersPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
            <h2 className="text-lg font-bold">Orders</h2>
            <p className="text-xs text-[#FAF8F5]/80">History & status</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {profileData?.orders && profileData.orders.length > 0 ? (
          <div className="space-y-4">
            {profileData.orders.map((order) => (
              <MobileOrderCard key={order._id} order={order} user={profileData.user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-white/60 backdrop-blur-sm border border-[#3D2817]/30 rounded-full flex items-center justify-center mx-auto mb-5 luxury-shadow">
              <IconShoppingBag className="w-10 h-10 text-[#3D2817]/60" />
            </div>
            <h3 className="text-xl font-semibold text-[#3D2817] mb-2">No orders placed yet</h3>
            <p className="text-sm text-[#3D2817]/70 mb-6">Start shopping to see your orders here</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 border border-[#3D2817]/30 text-sm font-semibold text-[#3D2817] bg-white/60 backdrop-blur-sm hover:bg-[#3D2817] hover:text-[#FAF8F5] transition-colors rounded-lg luxury-shadow">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

