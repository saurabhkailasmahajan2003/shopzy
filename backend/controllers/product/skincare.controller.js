import mongoose from 'mongoose';
import SkincareProduct from '../../models/product/skincare.model.js';

// Helper function to normalize skincare product schema
const normalizeSkincare = (product) => {
  const normalized = product.toObject ? product.toObject() : product;
  
  // Calculate final price with discount
  const price = normalized.price || 0;
  const discountPercent = normalized.discountPercent || 0;
  const finalPrice = discountPercent > 0 ? price - (price * discountPercent / 100) : price;
  const originalPrice = price;

  // Convert imageUrl to images array for consistency with other products
  const imagesArray = normalized.imageUrl ? [normalized.imageUrl] : [];

  return {
    ...normalized,
    _id: normalized._id,
    id: normalized._id || normalized.productId,
    productId: normalized.productId,
    name: normalized.productName || normalized.name,
    title: normalized.productName || normalized.name,
    price: finalPrice,
    mrp: originalPrice,
    originalPrice: originalPrice,
    finalPrice: finalPrice,
    discountPercent: discountPercent,
    images: imagesArray,
    image: normalized.imageUrl,
    category: 'skincare',
    subCategory: normalized.category, // The category field (serum, facewash, etc.) becomes subCategory for frontend
    brand: normalized.brand || '',
    rating: normalized.rating || 0,
    stock: normalized.stock || 0,
    description: normalized.description || '',
    longDescription: normalized.longDescription || '',
    skinType: normalized.skinType || 'all',
    skinConcern: normalized.skinConcern || [],
    ingredients: normalized.ingredients || [],
    isActive: normalized.isActive !== undefined ? normalized.isActive : true,
  };
};

// Helper function to build query
const buildSkincareQuery = (reqQuery) => {
  const query = {};

  // Filter by category (serum, facewash, sunscreen, moisturizer, cleanser)
  if (reqQuery.subCategory || reqQuery.category) {
    const category = reqQuery.subCategory || reqQuery.category;
    const normalizedCategory = category.toLowerCase().trim();
    // Use case-insensitive regex to match categories like "facewash", "cleanser", "serum", etc.
    query.category = { $regex: new RegExp(`^${normalizedCategory}$`, 'i') };
  }

  // Filter by skin type
  if (reqQuery.skinType) {
    query.skinType = reqQuery.skinType.toLowerCase();
  }

  // Filter by skin concern
  if (reqQuery.skinConcern) {
    query.skinConcern = { $in: [reqQuery.skinConcern] };
  }

  // Filter by brand
  if (reqQuery.brand) {
    query.brand = { $regex: new RegExp(reqQuery.brand, 'i') };
  }

  // Filter by active status (only if explicitly requested, otherwise show all)
  if (reqQuery.isActive !== undefined) {
    query.isActive = reqQuery.isActive === 'true';
  }
  // Note: We don't filter by isActive by default to show all products from database

  // Search functionality
  if (reqQuery.search) {
    query.$or = [
      { productName: { $regex: new RegExp(reqQuery.search, 'i') } },
      { brand: { $regex: new RegExp(reqQuery.search, 'i') } },
      { description: { $regex: new RegExp(reqQuery.search, 'i') } },
    ];
  }

  // Price range filter
  if (reqQuery.minPrice || reqQuery.maxPrice) {
    query.price = {};
    if (reqQuery.minPrice) {
      query.price.$gte = Number(reqQuery.minPrice);
    }
    if (reqQuery.maxPrice) {
      query.price.$lte = Number(reqQuery.maxPrice);
    }
  }

  return query;
};

// Get all skincare products
export const getSkincareProducts = async (req, res) => {
  try {
    const query = buildSkincareQuery(req.query);
    
    // Debug logging
    console.log('[Skincare Controller] Query params:', req.query);
    console.log('[Skincare Controller] Built query:', JSON.stringify(query, null, 2));
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Sorting
    let sort = { createdAt: -1 }; // Default sort by newest
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.order === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'price':
          sort = { price: sortOrder };
          break;
        case 'rating':
          sort = { rating: sortOrder };
          break;
        case 'name':
          sort = { productName: sortOrder };
          break;
        default:
          sort = { createdAt: sortOrder };
      }
    }

    // Execute query - use lean() to get plain objects and bypass strict validation
    // This ensures we get all documents even if they don't match schema exactly
    const [products, totalCount] = await Promise.all([
      SkincareProduct.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      SkincareProduct.countDocuments(query),
    ]);

    // Debug logging
    console.log(`[Skincare Controller] Found ${products.length} products, total count: ${totalCount}`);
    
    // Normalize products
    const normalizedProducts = products.map(normalizeSkincare);

    res.status(200).json({
      success: true,
      data: {
        products: normalizedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalProducts: totalCount,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching skincare products:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error fetching skincare products',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Get single skincare product by ID
export const getSkincareProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product by _id or productId
    let product = null;
    
    // Check if id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await SkincareProduct.findById(id);
    }
    
    // If not found by _id, try by productId
    if (!product) {
      product = await SkincareProduct.findOne({ productId: id });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Skincare product not found',
      });
    }

    const normalizedProduct = normalizeSkincare(product);

    res.status(200).json({
      success: true,
      data: {
        product: normalizedProduct,
      },
    });
  } catch (error) {
    console.error('Error fetching skincare product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching skincare product',
      error: error.message,
    });
  }
};

