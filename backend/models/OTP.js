import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // Auto-delete after expiration
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index for faster lookups
otpSchema.index({ phoneNumber: 1, verified: 1 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;


