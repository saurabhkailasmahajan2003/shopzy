import express from 'express';
import {
  getShoes,
  getShoeById,
  createShoe,
  updateShoe,
  deleteShoe,
} from '../../controllers/product/shoe.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { adminOnly } from '../../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getShoes);
router.get('/:id', getShoeById);

// Protected admin routes
router.post('/', protect, adminOnly, createShoe);
router.put('/:id', protect, adminOnly, updateShoe);
router.delete('/:id', protect, adminOnly, deleteShoe);

export default router;

