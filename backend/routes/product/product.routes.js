import express from 'express';
import { getProductById } from '../../controllers/product/product.controller.js';

const router = express.Router();

// Public routes
router.get('/:id', getProductById);

export default router;

