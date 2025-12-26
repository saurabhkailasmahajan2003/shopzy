import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Helper for left-side static icons
const LeftIcon = ({ children }) => (
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#120e0f]/40">
    {children}
  </div>
);

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signup, googleSignIn } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.phone
    );

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Signup failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleGoogleLogin = async () => {
    try {
      console.log("Google Login Triggered");
      // await googleSignIn(); 
    } catch (err) {
      setError('Failed to login with Google');
    }
  };

  const handleOTPLogin = () => {
    console.log("OTP Login Triggered");
    navigate('/login-otp');
  };

  // Cart Theme Input Class
  const inputClass = "block w-full pl-10 pr-10 py-2.5 sm:py-3 border-2 border-[#120e0f] bg-[#fefcfb] text-[#120e0f] placeholder-[#120e0f]/40 focus:outline-none focus:border-[#bb3435] sm:text-sm transition-colors duration-150";

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen font-sans bg-[#fefcfb]">
      
      {/* LEFT SIDE: Branding */}
      <div 
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 text-white relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://res.cloudinary.com/de1bg8ivx/image/upload/v1765260333/UrbanVastra_1_ndsc5c.svg')" }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-8">
            {/* Professional E-commerce Logo */}
            <div className="relative">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="8" fill="rgba(255,255,255,0.15)"/>
                <path d="M12 18C12 15.5 13.5 14 16 14C18.5 14 20 15.5 20 17C20 18.5 18.5 19.5 17 20C15.5 20.5 14 21.5 14 23C14 25.5 15.5 27 18 27C20.5 27 22 25.5 22 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight leading-none block" style={{ fontFamily: "'Dancing Script', cursive" }}>
                Shopzy
              </span>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-sm text-gray-200 drop-shadow-sm">
          <div className="relative z-10 text-sm text-gray-200 drop-shadow-sm -ml-3">
             <span className='text-white'>© 2024 Shopzy.</span> All rights reserved.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 overflow-y-auto bg-[#fefcfb]">
        <div className="w-full max-w-md space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#120e0f] tracking-tight">Create an account</h2>
            <p className="mt-2 text-xs sm:text-sm text-[#120e0f]/60">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#bb3435] hover:underline underline-offset-2 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#fefcfb] border-2 border-[#bb3435] p-3 sm:p-4 text-xs sm:text-sm text-[#bb3435]">
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Inputs */}
              <div className="relative">
                <label htmlFor="name" className="sr-only">Full Name</label>
                <LeftIcon>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </LeftIcon>
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className={inputClass} placeholder="Full Name" />
              </div>

              <div className="relative">
                <label htmlFor="email" className="sr-only">Email address</label>
                <LeftIcon>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </LeftIcon>
                <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="Email address" />
              </div>

              <div className="relative">
                <label htmlFor="phone" className="sr-only">Phone Number</label>
                <LeftIcon>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </LeftIcon>
                <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} className={inputClass} placeholder="Phone Number" />
              </div>

              {/* Password Inputs */}
              <div className="relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <LeftIcon>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </LeftIcon>
                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={formData.password} onChange={handleChange} className={inputClass} placeholder="Password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#120e0f]/40 hover:text-[#120e0f] focus:outline-none transition-colors">
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <LeftIcon>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </LeftIcon>
                <input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className={inputClass} placeholder="Confirm Password" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border-2 border-[#120e0f] bg-[#120e0f] text-[#fefcfb] text-xs sm:text-sm font-semibold uppercase tracking-tight hover:bg-[#120e0f]/90 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          {/* DIVIDER */}
          {/* SOCIAL BUTTONS GRID */}
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            
            {/* OTP / MOBILE BUTTON */}
            <button
              type="button"
              onClick={handleOTPLogin}
              className="flex w-full items-center justify-center gap-2 sm:gap-3 border-2 border-[#120e0f] bg-[#fefcfb] px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-[#120e0f] hover:bg-[#120e0f] hover:text-[#fefcfb] transition-all focus:outline-none"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Login by OTP</span>
            </button>

          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <Link to="/" className="text-xs sm:text-sm text-[#120e0f]/60 hover:text-[#120e0f] transition-colors">
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;