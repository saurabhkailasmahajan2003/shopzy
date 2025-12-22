import mongoose from 'mongoose';
import Accessory from '../../models/product/accessory.model.js';
import Shoes from '../../models/product/shoes.model.js';

// Helper to check MongoDB connection
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Helper to safely parse integers with defaults
const safeParseInt = (value, defaultValue, min = 1, max = 1000) => {
  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed < min) return defaultValue;
  if (parsed > max) return max;
  return parsed;
};

// Helper to safely validate sort field
const safeSortField = (sort) => {
  const allowed = ['createdAt', 'price', 'mrp', 'discountPercent', 'title', 'name'];
  return allowed.includes(sort) ? sort : 'createdAt';
};

// Helper to safely validate sort order
const safeSortOrder = (order) => {
  return order === 'asc' ? 'asc' : 'desc';
};

// Helper function to normalize old schema to common format (PRODUCTION-SAFE)
const normalizeOldAccessory = (product) => {
  try {
    const normalized = product?.toObject ? product.toObject() : (product || {});
    
    // Safely extract images array
    let imagesArray = [];
    if (normalized.images && Array.isArray(normalized.images)) {
      imagesArray = normalized.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    } else if (normalized.thumbnail && typeof normalized.thumbnail === 'string') {
      imagesArray = [normalized.thumbnail];
    } else if (normalized.image && typeof normalized.image === 'string') {
      imagesArray = [normalized.image];
    }

    // Safely calculate prices
    const mrp = Number(normalized.price) || Number(normalized.mrp) || Number(normalized.originalPrice) || 0;
    const discountPercent = Number(normalized.discountPercent) || 0;
    const finalPrice = Number(normalized.finalPrice) || (discountPercent > 0 ? Math.max(0, mrp - (mrp * discountPercent / 100)) : mrp);
    const originalPrice = Number(normalized.originalPrice) || mrp;

    return {
      ...normalized,
      _id: normalized._id || null,
      id: normalized._id || null,
      title: normalized.name || normalized.title || 'Untitled Product',
      name: normalized.name || normalized.title || 'Untitled Product',
      mrp: Math.max(0, mrp),
      price: Math.max(0, mrp),
      originalPrice: Math.max(0, originalPrice),
      finalPrice: Math.max(0, finalPrice),
      discountPercent: Math.max(0, Math.min(100, discountPercent)),
      images: Array.isArray(imagesArray) && imagesArray.length > 0 ? imagesArray : [],
      product_info: normalized.product_info || {
        brand: normalized.brand || '',
        manufacturer: normalized.specifications?.manufacturer || '',
      },
      category: normalized.category || 'Accessories',
      subCategory: normalized.subCategory || '',
      _schemaType: 'old'
    };
  } catch (error) {
    console.error('Error normalizing old accessory:', error);
    return {
      _id: product?._id || null,
      id: product?._id || null,
      name: 'Product',
      title: 'Product',
      price: 0,
      mrp: 0,
      originalPrice: 0,
      finalPrice: 0,
      discountPercent: 0,
      images: [],
      category: 'Accessories',
      subCategory: '',
      _schemaType: 'old'
    };
  }
};

// Helper function to normalize new schema shoes to common format (PRODUCTION-SAFE)
const normalizeNewShoes = (product) => {
  try {
    const normalized = product?.toObject ? product.toObject() : (product || {});
    
    // Safely convert images object to array
    let imagesArray = [];
    if (normalized.images && typeof normalized.images === 'object' && !Array.isArray(normalized.images)) {
      const imageKeys = Object.keys(normalized.images).sort((a, b) => {
        const numA = parseInt(a.replace('image', '')) || 0;
        const numB = parseInt(b.replace('image', '')) || 0;
        return numA - numB;
      });
      imagesArray = imageKeys
        .map(key => normalized.images[key])
        .filter(img => img && typeof img === 'string' && img.trim() !== '');
    } else if (Array.isArray(normalized.images)) {
      imagesArray = normalized.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    }

    if (imagesArray.length === 0) {
      if (normalized.thumbnail && typeof normalized.thumbnail === 'string') {
        imagesArray = [normalized.thumbnail];
      } else if (normalized.image && typeof normalized.image === 'string') {
        imagesArray = [normalized.image];
      }
    }

    const firstImage = imagesArray.length > 0 ? imagesArray[0] : null;

    // Safely calculate prices
    const mrp = Number(normalized.mrp) || Number(normalized.price) || 0;
    const discountPercent = Number(normalized.discountPercent) || 0;
    const finalPrice = discountPercent > 0 ? Math.max(0, mrp - (mrp * discountPercent / 100)) : mrp;
    const originalPrice = mrp;

    // Safely extract sizes
    const sizes = Array.isArray(normalized.product_info?.availableSizes) 
      ? normalized.product_info.availableSizes 
      : (Array.isArray(normalized.sizes) ? normalized.sizes : []);

    return {
      ...normalized,
      _id: normalized._id || null,
      id: normalized._id || null,
      name: normalized.title || normalized.name || 'Untitled Product',
      price: Math.max(0, mrp),
      originalPrice: Math.max(0, originalPrice),
      finalPrice: Math.max(0, finalPrice),
      discountPercent: Math.max(0, Math.min(100, discountPercent)),
      images: Array.isArray(imagesArray) && imagesArray.length > 0 ? imagesArray : [],
      image: firstImage,
      thumbnail: firstImage,
      subCategory: 'shoes',
      sizes: sizes,
      imagesObject: normalized.images,
      _schemaType: 'new-shoes'
    };
  } catch (error) {
    console.error('Error normalizing new shoes:', error);
    return {
      _id: product?._id || null,
      id: product?._id || null,
      name: 'Product',
      price: 0,
      originalPrice: 0,
      finalPrice: 0,
      discountPercent: 0,
      images: [],
      subCategory: 'shoes',
      sizes: [],
      _schemaType: 'new-shoes'
    };
  }
};

// Helper function to build query for old schema (PRODUCTION-SAFE)
const buildOldAccessoryQuery = (reqQuery) => {
  const query = {};

  if (reqQuery.gender && typeof reqQuery.gender === 'string') {
    query.gender = reqQuery.gender.toLowerCase().trim();
  }

  if (reqQuery.subCategory && typeof reqQuery.subCategory === 'string') {
    query.subCategory = reqQuery.subCategory.trim();
  }

  if (reqQuery.isNewArrival === 'true') query.isNewArrival = true;
  if (reqQuery.onSale === 'true') query.onSale = true;
  if (reqQuery.isFeatured === 'true') query.isFeatured = true;

  if (reqQuery.search && typeof reqQuery.search === 'string' && reqQuery.search.trim().length > 0) {
    query.$text = { $search: reqQuery.search.trim() };
  }

  return query;
};

// Helper function to build query for new schema shoes (PRODUCTION-SAFE)
const buildNewShoesQuery = (reqQuery) => {
  const query = {};

  // Always include shoe products from new schema
  query.category = { 
    $regex: /^shoe/i
  };

  if (reqQuery.category && typeof reqQuery.category === 'string') {
    const cat = reqQuery.category.toLowerCase();
    if (!cat.includes('shoe')) {
      query._id = { $in: [] }; // Safely return no results
    }
  }

  if (reqQuery.categoryId && typeof reqQuery.categoryId === 'string') {
    query.categoryId = reqQuery.categoryId.trim();
  }

  if (reqQuery.isNewArrival === 'true') query.isNewArrival = true;
  if (reqQuery.onSale === 'true') query.onSale = true;

  if (reqQuery.search && typeof reqQuery.search === 'string' && reqQuery.search.trim().length > 0) {
    query.$text = { $search: reqQuery.search.trim() };
  }

  return query;
};

// @desc    Get all accessories from both collections
// @route   GET /api/products/accessories
// @access  Public
export const getAccessories = async (req, res) => {
  try {
    // Check MongoDB connection first
    if (!isMongoConnected()) {
      console.warn('[Accessory Controller] MongoDB not connected, returning empty results');
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        },
      });
    }

    // Safely extract and validate query parameters
    const {
      gender,
      subCategory,
      category,
      categoryId,
      isNewArrival,
      onSale,
      isFeatured,
      search,
      page,
      limit,
      sort,
      order,
    } = req.query;

    const pageNum = safeParseInt(page, 1, 1, 1000);
    const limitNum = safeParseInt(limit, 20, 1, 100);
    const sortField = safeSortField(sort);
    const sortOrder = safeSortOrder(order);

    // Build queries for both schemas
    const oldQuery = buildOldAccessoryQuery({ gender, subCategory, isNewArrival, onSale, isFeatured, search });
    const newQuery = buildNewShoesQuery({ category, categoryId, isNewArrival, onSale, search });

    // Safely fetch from both collections
    let oldProducts = [];
    let newProducts = [];

    try {
      if (Accessory && typeof Accessory.find === 'function') {
        oldProducts = await Accessory.find(oldQuery).lean().catch(err => {
          console.error('[Accessory Controller] Error fetching old products:', err.message);
          return [];
        });
      }
    } catch (error) {
      console.error('[Accessory Controller] Error with Accessory model:', error.message);
    }

    try {
      if (Shoes && typeof Shoes.find === 'function') {
        newProducts = await Shoes.find(newQuery).lean().catch(err => {
          console.error('[Accessory Controller] Error fetching shoes products:', err.message);
          return [];
        });
      }
    } catch (error) {
      console.error('[Accessory Controller] Error with Shoes model:', error.message);
    }

    // Safely normalize both schemas to common format
    const normalizedOld = Array.isArray(oldProducts) ? oldProducts.map(normalizeOldAccessory).filter(p => p) : [];
    const normalizedNew = Array.isArray(newProducts) ? newProducts.map(normalizeNewShoes).filter(p => p) : [];

    // Combine and sort all products
    let allProducts = [...normalizedOld, ...normalizedNew];

    // Safely sort combined results
    const sortOrderNum = sortOrder === 'asc' ? 1 : -1;
    allProducts.sort((a, b) => {
      try {
        let aVal, bVal;

        switch (sortField) {
          case 'price':
          case 'mrp':
            aVal = Number(a.mrp) || Number(a.price) || 0;
            bVal = Number(b.mrp) || Number(b.price) || 0;
            break;
          case 'discountPercent':
            aVal = Number(a.discountPercent) || 0;
            bVal = Number(b.discountPercent) || 0;
            break;
          case 'title':
          case 'name':
            aVal = (a.title || a.name || '').toLowerCase();
            bVal = (b.title || b.name || '').toLowerCase();
            break;
          case 'createdAt':
          default:
            aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            break;
        }

        if (typeof aVal === 'string') {
          return aVal.localeCompare(bVal) * sortOrderNum;
        }
        return (aVal - bVal) * sortOrderNum;
      } catch (error) {
        console.error('[Accessory Controller] Error sorting products:', error.message);
        return 0;
      }
    });

    // Apply pagination after sorting
    const total = allProducts.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedProducts = allProducts.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('[Accessory Controller] Get accessories error:', error);
    // Return empty results instead of 500 error
    res.status(200).json({
      success: true,
      data: {
        products: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
      },
    });
  }
};

// @desc    Get single accessory from both collections
// @route   GET /api/products/accessories/:id
// @access  Public
export const getAccessoryById = async (req, res) => {
  try {
    // Check MongoDB connection first
    if (!isMongoConnected()) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    // Safely validate ID
    const productId = req.params?.id;
    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid accessory ID',
      });
    }

    // Safely try to find in both collections
    let oldProduct = null;
    let newProduct = null;

    try {
      if (Accessory && typeof Accessory.findById === 'function') {
        oldProduct = await Accessory.findById(productId).lean().catch(() => null);
      }
    } catch (error) {
      console.error('[Accessory Controller] Error finding old product:', error.message);
    }

    try {
      if (Shoes && typeof Shoes.findById === 'function') {
        newProduct = await Shoes.findById(productId).lean().catch(() => null);
      }
    } catch (error) {
      console.error('[Accessory Controller] Error finding shoes product:', error.message);
    }

    let product = null;
    if (oldProduct) {
      product = normalizeOldAccessory(oldProduct);
    } else if (newProduct) {
      product = normalizeNewShoes(newProduct);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product: product },
    });
  } catch (error) {
    console.error('[Accessory Controller] Get accessory error:', error);
    res.status(404).json({
      success: false,
      message: 'Accessory not found',
    });
  }
};

// @desc    Create accessory
// @route   POST /api/products/accessories
// @access  Private/Admin
export const createAccessory = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
      });
    }

    if (!Accessory || typeof Accessory.create !== 'function') {
      return res.status(500).json({
        success: false,
        message: 'Accessory model not available',
      });
    }

    const accessory = await Accessory.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Accessory created successfully',
      data: { product: accessory },
    });
  } catch (error) {
    console.error('[Accessory Controller] Create accessory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating accessory',
      error: error.message,
    });
  }
};

// @desc    Update accessory
// @route   PUT /api/products/accessories/:id
// @access  Private/Admin
export const updateAccessory = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
      });
    }

    const accessoryId = req.params?.id;
    if (!accessoryId || typeof accessoryId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid accessory ID',
      });
    }

    if (!Accessory || typeof Accessory.findByIdAndUpdate !== 'function') {
      return res.status(500).json({
        success: false,
        message: 'Accessory model not available',
      });
    }

    const accessory = await Accessory.findByIdAndUpdate(
      accessoryId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).catch(() => null);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Accessory updated successfully',
      data: { product: accessory },
    });
  } catch (error) {
    console.error('[Accessory Controller] Update accessory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating accessory',
      error: error.message,
    });
  }
};

// @desc    Delete accessory
// @route   DELETE /api/products/accessories/:id
// @access  Private/Admin
export const deleteAccessory = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
      });
    }

    const accessoryId = req.params?.id;
    if (!accessoryId || typeof accessoryId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid accessory ID',
      });
    }

    if (!Accessory || typeof Accessory.findByIdAndDelete !== 'function') {
      return res.status(500).json({
        success: false,
        message: 'Accessory model not available',
      });
    }

    const accessory = await Accessory.findByIdAndDelete(accessoryId).catch(() => null);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Accessory deleted successfully',
    });
  } catch (error) {
    console.error('[Accessory Controller] Delete accessory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting accessory',
      error: error.message,
    });
  }
};
