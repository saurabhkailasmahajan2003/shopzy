import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WomensShoe from './models/product/shoe.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || typeof MONGODB_URI !== 'string') {
  console.error('❌ Missing MONGODB_URI. Please set it in your .env file before running this script.');
  process.exit(1);
}

async function initWomenShoesCollection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if collection exists and has documents
    const collectionExists = await mongoose.connection.db.listCollections({ name: 'womensshoes' }).hasNext();
    const count = await WomensShoe.countDocuments();

    if (collectionExists && count > 0) {
      console.log(`✅ Women's Shoes collection already exists with ${count} document(s)`);
    } else {
      // Create the collection by inserting a sample document (will be deleted)
      console.log('📦 Creating Women\'s Shoes collection...');
      
      const sampleShoe = {
        title: 'Sample Shoe - Delete This',
        description: 'This is a sample document to initialize the collection. You can delete this.',
        price: 1000,
        originalPrice: 1000,
        discountPercent: 0,
        finalPrice: 1000,
        category: "Women's Shoes",
        subCategory: 'Sneakers',
        subSubCategory: 'Trainer',
        product_info: {
          brand: 'Sample Brand',
          gender: 'Women',
          color: 'White',
          outerMaterial: 'Leather',
          soleMaterial: 'Rubber',
          innerMaterial: 'Textile',
          closureType: 'Lace-Up',
          toeShape: 'Round',
          embellishments: [],
          warranty: '3 months',
        },
        images: ['https://via.placeholder.com/400x500?text=Sample+Shoe'],
        thumbnail: 'https://via.placeholder.com/400x500?text=Sample+Shoe',
        Images: {
          image1: 'https://via.placeholder.com/400x500?text=Sample+Shoe',
          image2: null,
          additionalImages: [],
        },
        sizes_inventory: [
          { size: 'US 7', quantity: 0 },
        ],
        stock: 0,
        inStock: false,
        isNewArrival: false,
        onSale: false,
        isFeatured: false,
        rating: 0,
        ratingsCount: 0,
        reviewsCount: 0,
      };

      const created = await WomensShoe.create(sampleShoe);
      console.log('✅ Women\'s Shoes collection created successfully!');
      console.log('📝 Sample document inserted (you can delete it later)');
      
      // Optionally delete the sample document
      await WomensShoe.deleteOne({ _id: created._id });
      console.log('🗑️  Sample document removed');
    }

    // Verify collection exists
    const finalCount = await WomensShoe.countDocuments();
    console.log(`✅ Women's Shoes collection is ready! Current document count: ${finalCount}`);
    console.log('💡 You can now add women\'s shoe products to the database.');
    console.log('📋 Collection name: womensshoes');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing Women\'s Shoes collection:', error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

initWomenShoesCollection();

