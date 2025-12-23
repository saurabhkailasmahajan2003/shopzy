import express from 'express';
import { getSkincareProducts, getSkincareProductById } from '../../controllers/product/skincare.controller.js';

const router = express.Router();

// Public routes
router.get('/', getSkincareProducts);
router.get('/:id', getSkincareProductById);

export default router;


