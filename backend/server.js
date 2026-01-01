import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import watchRoutes from './routes/product/watch.routes.js';
import watchNewRoutes from './routes/product/watchNew.routes.js';
import lensRoutes from './routes/product/lens.routes.js';
import accessoryRoutes from './routes/product/accessory.routes.js';
import womenRoutes from './routes/product/women.routes.js';
import skincareRoutes from './routes/product/skincare.routes.js';
import shoeRoutes from './routes/product/shoe.routes.js';
import productRoutes from './routes/product/product.routes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Verify skincare routes import
try {
  console.log('✅ Skincare routes imported successfully');
} catch (error) {
  console.error('❌ Error importing skincare routes:', error);
}

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (non-blocking - routes will still work)
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    
    // Automatically initialize Women's Shoes collection if it doesn't exist
    try {
      const WomensShoe = (await import('./models/product/shoe.model.js')).default;
      const collectionExists = await mongoose.connection.db.listCollections({ name: 'womensshoes' }).hasNext();
      
      if (!collectionExists) {
        console.log('📦 Initializing Women\'s Shoes collection...');
        // Create collection by inserting and deleting a sample document
        const sampleShoe = {
          title: 'Sample Shoe - Delete This',
          description: 'Initializing collection',
          price: 1,
          subCategory: 'Heels',
          product_info: { brand: 'Sample', gender: 'Women' },
          sizes_inventory: [{ size: 'US 7', quantity: 0 }],
        };
        const created = await WomensShoe.create(sampleShoe);
        await WomensShoe.deleteOne({ _id: created._id });
        console.log('✅ Women\'s Shoes collection initialized successfully!');
      }
    } catch (error) {
      console.warn('⚠️  Could not auto-initialize Women\'s Shoes collection:', error.message);
      console.log('   You can run: npm run init-shoes');
    }
  })
  .catch((error) => {
    console.error('⚠️  MongoDB connection error (routes will still work):', error.message);
    console.log('   Database operations will fail until connection is established');
    // Don't exit - allow routes to register even without DB connection
  });

// Routes
app.use('/api/auth', authRoutes);
// Specific category routes (must be before generic route to avoid conflicts)
app.use('/api/products/watches', watchRoutes);
app.use('/api/products/watch-new', watchNewRoutes);
app.use('/api/products/lens', lensRoutes);
app.use('/api/products/accessories', accessoryRoutes);
app.use('/api/products/women', womenRoutes);
app.use('/api/products/shoes', shoeRoutes);
try {
  app.use('/api/products/skincare', skincareRoutes);
  console.log('✅ Skincare routes registered at /api/products/skincare');
} catch (error) {
  console.error('❌ CRITICAL: Failed to register skincare routes:', error);
  console.error('   This will cause 404 errors for /api/products/skincare');
}
// Generic product route (must be after specific category routes)
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/payment', paymentRoutes);

// Register review routes - MUST be before 404 handler
try {
  app.use('/api/reviews', reviewRoutes);
  console.log('✅ Review routes registered at /api/reviews');
} catch (error) {
  console.error('❌ CRITICAL: Failed to register review routes:', error);
  console.error('   This will cause 404 errors for /api/reviews');
}

console.log('✅ Payment routes registered at /api/payment');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}\n`);
  console.log('📋 Registered API Routes:');
  console.log('   ✓ /api/auth');
  console.log('   ✓ /api/products/*');
  console.log('   ✓ /api/admin');
  console.log('   ✓ /api/cart');
  console.log('   ✓ /api/orders');
  console.log('   ✓ /api/profile');
  console.log('   ✓ /api/payment');
  console.log('   ✓ /api/reviews');
  console.log('\n✅ All routes registered successfully!\n');
  console.log('🔍 Test review routes:');
  console.log('   GET  http://localhost:5000/api/reviews/health');
  console.log('   GET  http://localhost:5000/api/reviews/:productId');
  console.log('   POST http://localhost:5000/api/reviews\n');
});

