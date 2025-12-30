import express from 'express';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user profile with all data
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    // Get cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Get orders
    const orders = await Order.find({ user: req.user._id })
      .sort({ orderDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        cart,
        orders,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
});

// Update user profile
router.put('/update', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address) {
      user.address = user.address || {};
      user.address = { ...user.address, ...address };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
});

export default router;

