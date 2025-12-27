import express from 'express';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateToken } from '../utils/generateToken.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendOTP } from '../utils/fast2sms.js';
import crypto from 'crypto';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
          isAdmin: req.user.isAdmin,
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validation
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // Format phone number (remove +91 or any country code, keep only 10 digits)
    let formattedPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
    
    if (formattedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be 10 digits.',
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set expiration time (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any existing OTPs for this phone number
    await OTP.deleteMany({ phoneNumber: formattedPhone, verified: false });

    // Save OTP to database
    await OTP.create({
      phoneNumber: formattedPhone,
      otp,
      expiresAt,
      verified: false,
    });

    // Send OTP via Fast2SMS
    try {
      await sendOTP(formattedPhone, otp);
      
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your phone number',
        data: {
          phoneNumber: formattedPhone,
          expiresIn: 300, // 5 minutes in seconds
        },
      });
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      // Still return success but log the error
      // In production, you might want to handle this differently
      res.status(200).json({
        success: true,
        message: 'OTP generated. Please check your phone.',
        data: {
          phoneNumber: formattedPhone,
          expiresIn: 300,
          // For development/testing, you might want to return OTP
          // Remove this in production!
          otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        },
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login/register user
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, name, email } = req.body;

    // Validation
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    // Format phone number
    let formattedPhone = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
    
    if (formattedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be 10 digits.',
      });
    }

    if (otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits',
      });
    }

    // Find OTP in database
    const otpRecord = await OTP.findOne({
      phoneNumber: formattedPhone,
      otp,
      verified: false,
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Find user first to check if they exist
    let user = await User.findOne({ phone: formattedPhone });

    if (!user) {
      // User doesn't exist - require name and email
      if (!name || !email) {
        // Mark OTP as verified but don't delete it yet
        otpRecord.verified = true;
        await otpRecord.save();
        
        return res.status(400).json({
          success: false,
          message: 'Name and email are required for new users',
          requiresRegistration: true,
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists. Please use a different email.',
        });
      }

      // Generate a random password for OTP-based registration
      const randomPassword = crypto.randomBytes(16).toString('hex');
      
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: randomPassword, // Will be hashed by pre-save hook
        phone: formattedPhone,
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Generate token
    const token = generateToken(user._id);

    // Delete verified OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
});

export default router;

