// src/pages/Login-otp.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// CORRECT IMPORT: Points to src/firebase.js
import { auth } from '../firebase'; 

const LeftIcon = ({ children }) => (
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#120e0f]/40">
    {children}
  </div>
);

const LoginOTP = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [expandForm, setExpandForm] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const generateRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        }
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    try {
      generateRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      // Adds +91 automatically if user didn't type it
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setExpandForm(true);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Error sending OTP:", err);
      // Reset recaptcha
      if(window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      setError("Failed to send OTP. " + err.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      setIsLoading(false);
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      navigate('/'); 
    } catch (err) {
      setIsLoading(false);
      setError("Invalid OTP. Please check and try again.");
    }
  };

  const inputClass = "block w-full pl-10 pr-3 py-2.5 sm:py-3 border-2 border-[#120e0f] bg-[#fefcfb] text-[#120e0f] placeholder-[#120e0f]/40 focus:outline-none focus:border-[#bb3435] sm:text-sm transition-colors duration-150";

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen bg-[#fefcfb] font-sans">
      {/* Left Side */}
      <div 
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 text-white relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://res.cloudinary.com/de1bg8ivx/image/upload/v1765192160/1_08426779-951c-47b7-9feb-ef29ca85b27c_frapuz.webp')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>
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
          <h1 className="text-4xl font-light leading-tight mb-4 text-white drop-shadow-md">
            Secure Login.
          </h1>
        </div>
        <div className="relative z-10 text-sm text-gray-300 drop-shadow-sm">
          © 2024 Shopzy. All rights reserved.
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 overflow-y-auto bg-[#fefcfb]">
        <div className="w-full max-w-md space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#120e0f] tracking-tight">Login via OTP</h2>
            <p className="mt-2 text-xs sm:text-sm text-[#120e0f]/60">
              Go back to{' '}
              <Link to="/login" className="font-medium text-[#bb3435] hover:underline underline-offset-2 transition-colors">
                Standard Login
              </Link>
            </p>
          </div>

          <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={expandForm ? handleVerifyOtp : handleSendOtp}>
            {error && (
              <div className="bg-[#fefcfb] border-2 border-[#bb3435] p-3 sm:p-4 text-xs sm:text-sm text-[#bb3435]">
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-5">
              {!expandForm && (
                <div className="relative">
                  <label htmlFor="phone" className="sr-only">Phone Number</label>
                  <LeftIcon>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </LeftIcon>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={inputClass}
                    placeholder="Enter phone number"
                  />
                </div>
              )}

              {expandForm && (
                <div className="relative">
                  <label htmlFor="otp" className="sr-only">OTP</label>
                  <LeftIcon>
                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </LeftIcon>
                  <input
                    id="otp"
                    name="otp"
                    type="number"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={inputClass}
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
              )}
              
              <div id="recaptcha-container"></div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border-2 border-[#120e0f] bg-[#120e0f] text-[#fefcfb] text-xs sm:text-sm font-semibold uppercase tracking-tight hover:bg-[#120e0f]/90 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (expandForm ? "Verifying..." : "Sending OTP...") : (expandForm ? 'Verify OTP' : 'Send OTP')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginOTP;