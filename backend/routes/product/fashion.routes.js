import express from 'express';
import {
  getFashionItems,
  getFashionItemById,
  createFashionItem,
  updateFashionItem,
  deleteFashionItem,
} from '../../controllers/product/fashion.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getFashionItems);
router.get('/:id', getFashionItemById);

// Protected/Admin routes
router.post('/', protect, createFashionItem);
router.put('/:id', protect, updateFashionItem);
router.delete('/:id', protect, deleteFashionItem);

export default router;

