import mongoose from 'mongoose';
import Watch from '../../models/product/watch.model.js';
import WatchNew from '../../models/product/watchNew.model.js';

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
const normalizeOldWatch = (watch) => {
  try {
    const normalized = watch?.toObject ? watch.toObject() : (watch || {});
    
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
        manufacturer: normalized.productDetails?.manufacturer || '',
        IncludedComponents: normalized.productDetails?.IncludedComponents || ''
      },
      category: normalized.category || 'WATCHES',
      _schemaType: 'old'
    };
  } catch (error) {
    console.error('Error normalizing old watch:', error);
    return {
      _id: watch?._id || null,
      id: watch?._id || null,
      name: 'Product',
      title: 'Product',
      price: 0,
      mrp: 0,
      originalPrice: 0,
      finalPrice: 0,
      discountPercent: 0,
      images: [],
      category: 'WATCHES',
      _schemaType: 'old'
    };
  }
};

// Helper function to normalize new schema to common format (PRODUCTION-SAFE)
const normalizeNewWatch = (watch) => {
  try {
    const normalized = watch?.toObject ? watch.toObject() : (watch || {});
    
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
      imagesObject: normalized.images,
      _schemaType: 'new'
    };
  } catch (error) {
    console.error('Error normalizing new watch:', error);
    return {
      _id: watch?._id || null,
      id: watch?._id || null,
      name: 'Product',
      price: 0,
      originalPrice: 0,
      finalPrice: 0,
      discountPercent: 0,
      images: [],
      _schemaType: 'new'
    };
  }
};

// Helper function to build query for old schema (PRODUCTION-SAFE)
const buildOldWatchQuery = (reqQuery) => {
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

// Helper function to build query for new schema (PRODUCTION-SAFE)
const buildNewWatchQuery = (reqQuery) => {
  const query = {};

  if (reqQuery.category && typeof reqQuery.category === 'string') {
    query.category = reqQuery.category.toUpperCase().trim();
  }

  if (reqQuery.categoryId && typeof reqQuery.categoryId === 'string') {
    query.categoryId = reqQuery.categoryId.trim();
  }

  if (reqQuery.isNewArrival === 'true') query.isNewArrival = true;
  if (reqQuery.onSale === 'true') query.onSale = true;
  if (reqQuery.isFeatured === 'true') query.isFeatured = true;

  if (reqQuery.search && typeof reqQuery.search === 'string' && reqQuery.search.trim().length > 0) {
    query.$text = { $search: reqQuery.search.trim() };
  }

  return query;
};

// @desc    Get all watches from both collections
// @route   GET /api/products/watches
// @access  Public
export const getWatches = async (req, res) => {
  try {
    // Check MongoDB connection first
    if (!isMongoConnected()) {
      console.warn('[Watch Controller] MongoDB not connected, returning empty results');
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
    const oldQuery = buildOldWatchQuery({ gender, subCategory, isNewArrival, onSale, isFeatured, search });
    const newQuery = buildNewWatchQuery({ category, categoryId, isNewArrival, onSale, isFeatured, search });

    // Safely fetch from both collections
    let oldWatches = [];
    let newWatches = [];

    try {
      if (Watch && typeof Watch.find === 'function') {
        oldWatches = await Watch.find(oldQuery).lean().catch(err => {
          console.error('[Watch Controller] Error fetching old watches:', err.message);
          return [];
        });
      }
    } catch (error) {
      console.error('[Watch Controller] Error with Watch model:', error.message);
    }

    try {
      if (WatchNew && typeof WatchNew.find === 'function') {
        newWatches = await WatchNew.find(newQuery).lean().catch(err => {
          console.error('[Watch Controller] Error fetching new watches:', err.message);
          return [];
        });
      }
    } catch (error) {
      console.error('[Watch Controller] Error with WatchNew model:', error.message);
    }

    // Safely normalize both schemas to common format
    const normalizedOld = Array.isArray(oldWatches) ? oldWatches.map(normalizeOldWatch).filter(p => p) : [];
    const normalizedNew = Array.isArray(newWatches) ? newWatches.map(normalizeNewWatch).filter(p => p) : [];

    // Combine and sort all watches
    let allWatches = [...normalizedOld, ...normalizedNew];

    // Safely sort combined results
    const sortOrderNum = sortOrder === 'asc' ? 1 : -1;
    allWatches.sort((a, b) => {
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
        console.error('[Watch Controller] Error sorting watches:', error.message);
        return 0;
      }
    });

    // Apply pagination after sorting
    const total = allWatches.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedWatches = allWatches.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data: {
        products: paginatedWatches,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('[Watch Controller] Get watches error:', error);
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

// @desc    Get single watch from both collections
// @route   GET /api/products/watches/:id
// @access  Public
export const getWatchById = async (req, res) => {
  try {
    // Check MongoDB connection first
    if (!isMongoConnected()) {
      return res.status(404).json({
        success: false,
        message: 'Watch not found',
      });
    }

    // Safely validate ID
    const watchId = req.params?.id;
    if (!watchId || typeof watchId !== 'string' || watchId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid watch ID',
      });
    }

    // Safely try to find in both collections
    let oldWatch = null;
    let newWatch = null;

    try {
      if (Watch && typeof Watch.findById === 'function') {
        oldWatch = await Watch.findById(watchId).lean().catch(() => null);
      }
    } catch (error) {
      console.error('[Watch Controller] Error finding old watch:', error.message);
    }

    try {
      if (WatchNew && typeof WatchNew.findById === 'function') {
        newWatch = await WatchNew.findById(watchId).lean().catch(() => null);
      }
    } catch (error) {
      console.error('[Watch Controller] Error finding new watch:', error.message);
    }

    let watch = null;
    if (oldWatch) {
      watch = normalizeOldWatch(oldWatch);
    } else if (newWatch) {
      watch = normalizeNewWatch(newWatch);
    }

    if (!watch) {
      return res.status(404).json({
        success: false,
        message: 'Watch not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product: watch },
    });
  } catch (error) {
    console.error('[Watch Controller] Get watch error:', error);
    res.status(404).json({
      success: false,
      message: 'Watch not found',
    });
  }
};

// @desc    Create watch
// @route   POST /api/products/watches
// @access  Private/Admin
export const createWatch = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
      });
    }

    if (!Watch || typeof Watch.create !== 'function') {
      return res.status(500).json({
        success: false,
        message: 'Watch model not available',
      });
    }

    const watch = await Watch.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Watch created successfully',
      data: { product: watch },
    });
  } catch (error) {
    console.error('[Watch Controller] Create watch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating watch',
      error: error.message,
    });
  }
};

// @desc    Update watch
// @route   PUT /api/products/watches/:id
// @access  Private/Admin
export const updateWatch = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
      });
    }

    const watchId = req.params?.id;
    if (!watchId || typeof watchId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watch ID',
      });
    }

    if (!Watch || typeof Watch.findByIdAndUpdate !== 'function') {
      return res.status(500).json({
        success: false,
        message: 'Watch model not available',
      });
    }

    const watch = await Watch.findByIdAndUpdate(
      watchId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).catch(() => null);

    if (!watch) {
      return res.status(404).json({
        success: false,
        message: 'Watch not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Watch updated successfully',
      data: { product: watch },
    });
  } catch (error) {
    console.error('[Watch Controller] Update watch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating watch',
      error: error.message,
    });
  }
};

// @desc    Delete watch
// @route   DELETE /api/products/watches/:id
// @access  Private/Admin
export const deleteWatch = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
      });
    }

    const watchId = req.params?.id;
    if (!watchId || typeof watchId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watch ID',
      });
    }

    if (!Watch || typeof Watch.findByIdAndDelete !== 'function') {
      return res.status(500).json({
        success: false,
        message: 'Watch model not available',
      });
    }

    const watch = await Watch.findByIdAndDelete(watchId).catch(() => null);

    if (!watch) {
      return res.status(404).json({
        success: false,
        message: 'Watch not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Watch deleted successfully',
    });
  } catch (error) {
    console.error('[Watch Controller] Delete watch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting watch',
      error: error.message,
    });
  }
};
