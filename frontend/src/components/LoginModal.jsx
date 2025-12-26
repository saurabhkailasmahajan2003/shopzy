import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose, redirectTo = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      onClose();
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        window.location.reload();
      }
    } else {
      setError(result.message || 'Login failed. Please try again.');
    }

    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF8F5] border border-[#3D2817]/30 max-w-md w-full mx-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#3D2817] hover:opacity-70 transition-opacity"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#3D2817] uppercase tracking-tight">Sign In Required</h2>
          <p className="text-sm text-[#3D2817]/60 mt-2">
            Please sign in to add items to your cart.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[#FAF8F5] border-2 border-[#bb3435] text-[#bb3435] px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#3D2817] mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] focus:outline-none focus:border-[#8B4513] transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#3D2817] mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] focus:outline-none focus:border-[#8B4513] transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 border border-[#3D2817]/30 bg-[#3D2817] text-white py-2.5 px-4 font-medium hover:bg-[#3D2817]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tight text-sm"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] hover:bg-[#3D2817] hover:text-white transition-colors uppercase tracking-tight text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-[#3D2817]/30 text-center text-sm">
          <p className="text-[#3D2817]/60">
            Don't have an account?{' '}
            <Link
              to="/signup"
              onClick={onClose}
              className="text-[#bb3435] hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

