import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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
      navigate('/');
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

  const handleOTPLogin = () => {
    navigate('/login-otp');
  };

  // Illustration image
  const illustrationImage = 'https://res.cloudinary.com/dvkxgrcbv/image/upload/v1767158665/women-in-a-clothing-boutique-2023-11-27-05-27-02-u_rnsjan.jpg';

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans lg:bg-[#FAF8F5]">
      {/* MOBILE VIEW - Onboarding Style */}
      <div className="lg:hidden min-h-screen flex flex-col bg-[#FAF8F5]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <Link to="/" className="text-xl font-bold text-[#3D2817]">
            SHOPZY
          </Link>
          <button className="p-2">
            <svg className="w-6 h-6 text-[#3D2817]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Top Content Area - Light Beige Background */}
        <div className="flex-1 px-6 pt-8 pb-4 bg-[#FAF8F5]">
          <h1 className="text-3xl font-bold text-[#8B4513] mb-3">Welcome Back!</h1>
          <p className="text-sm text-gray-600 mb-8">
            Please fill the forms below to get started. If you are not member yet, please click on Register now below.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3D2817] mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3.5 bg-[#F5F1EB] border border-[#3D2817]/20 rounded-lg text-[#3D2817] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D2817] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3.5 bg-[#F5F1EB] border border-[#3D2817]/20 rounded-lg text-[#3D2817] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8B4513] focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#3D2817]"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#8B4513] hover:bg-[#A0522D] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Not member?{' '}
            <Link to="/signup" className="text-[#8B4513] font-semibold hover:underline">
              Register Now!
            </Link>
          </p>

          {/* OTP Login Link */}
          <div className="text-center mt-4">
            <button
              onClick={handleOTPLogin}
              className="text-sm text-[#8B4513] hover:underline"
            >
              Login by OTP
            </button>
          </div>
        </div>

        {/* Bottom Illustration Area - Orange Background with Wavy Edge */}
        <div className="relative bg-[#8B4513] pt-8 pb-6">
          {/* Wavy Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-8 overflow-hidden">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="absolute top-0 left-0 w-full h-full"
            >
              <path
                d="M0,0 C150,80 350,80 500,40 C650,0 850,0 1000,40 C1100,60 1150,60 1200,40 L1200,120 L0,120 Z"
                fill="#FAF8F5"
              />
            </svg>
          </div>

          {/* Illustration Placeholder */}
          <div className="px-6 pt-4">
            <div className="w-full h-48 bg-[#A0522D]/20 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={illustrationImage}
                alt="Welcome illustration"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW - Original Design */}
      <div className="hidden lg:flex fixed inset-0 z-50 min-h-screen bg-[#FAF8F5]">
        {/* LEFT SIDE: Branding */}
        <div
          className="flex flex-col justify-between w-[45%] p-12 text-white relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('https://res.cloudinary.com/de1bg8ivx/image/upload/v1765192160/1_08426779-951c-47b7-9feb-ef29ca85b27c_frapuz.webp')" }}
        >
          <div className="absolute inset-0 bg-black/50 z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="relative">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="36" height="36" rx="8" fill="rgba(255,255,255,0.15)"/>
                  <path d="M12 18C12 15.5 13.5 14 16 14C18.5 14 20 15.5 20 17C20 18.5 18.5 19.5 17 20C15.5 20.5 14 21.5 14 23C14 25.5 15.5 27 18 27C20.5 27 22 25.5 22 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <div className="bg-transparent">
                <img 
                  src="https://res.cloudinary.com/dvkxgrcbv/image/upload/v1766755411/White_and_Beige_Neutral_Clean_Women_Bags_Instagram_Post_1_xytoa9.png"
                  alt="Shopzy Logo"
                  className="h-10 w-auto object-contain"
                  style={{ backgroundColor: 'transparent', background: 'transparent' }}
                />
              </div>
            </div>
            <h1 className="text-4xl font-light leading-tight mb-4 text-white drop-shadow-md">
              Welcome back.
            </h1>
          </div>
          <div className="relative z-10 text-sm text-gray-300 drop-shadow-sm">
            © 2024 Shopzy. All rights reserved.
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="w-[55%] flex flex-col justify-center items-center p-12 xl:p-16 overflow-y-auto bg-[#FAF8F5]">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-[#3D2817] tracking-tight">Sign in</h2>
              <p className="mt-2 text-sm text-[#3D2817]/60">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-[#bb3435] hover:underline underline-offset-2 transition-colors">
                  Create a new account
                </Link>
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-[#FAF8F5] border-2 border-[#bb3435] p-4 text-sm text-[#bb3435]">
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-5">
                <div className="relative">
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3D2817]/40">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border-2 border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] placeholder-[#120e0f]/40 focus:outline-none focus:border-[#bb3435] text-sm transition-colors duration-150"
                    placeholder="Email address"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#3D2817]/40">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border-2 border-[#3D2817]/30 bg-[#FAF8F5] text-[#3D2817] placeholder-[#120e0f]/40 focus:outline-none focus:border-[#bb3435] text-sm transition-colors duration-150"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3D2817]/40 hover:text-[#3D2817] focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#3D2817] focus:ring-[#120e0f] border-2 border-[#3D2817]/30 rounded cursor-pointer"
                  />
                  <span className="ml-2 block text-sm text-[#3D2817] cursor-pointer">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-[#bb3435] hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border-2 border-[#3D2817]/30 bg-[#3D2817] text-[#fefcfb] text-sm font-semibold uppercase tracking-tight hover:bg-[#3D2817]/90 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={handleOTPLogin}
                className="flex w-full items-center justify-center gap-3 border-2 border-[#3D2817]/30 bg-[#FAF8F5] px-3 py-2.5 text-sm font-medium text-[#3D2817] hover:bg-[#3D2817] hover:text-[#fefcfb] transition-all focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Login by OTP</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-[#3D2817]/60 hover:text-[#3D2817] transition-colors">
                ← Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
