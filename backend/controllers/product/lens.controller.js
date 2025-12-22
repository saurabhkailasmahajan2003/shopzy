import mongoose from 'mongoose';
import Lens from '../../models/product/lens.model.js';

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

// @desc    Get all lenses
// @route   GET /api/products/lens
// @access  Public
export const getLenses = async (req, res) => {
  try {
    // Check MongoDB connection first
    if (!isMongoConnected()) {
      console.warn('[Lens Controller] MongoDB not connected, returning empty results');
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
    const skip = (pageNum - 1) * limitNum;

    // Safely build query
    const query = {};

    if (gender && typeof gender === 'string') {
      query.gender = gender.toLowerCase().trim();
    }

    if (subCategory && typeof subCategory === 'string') {
      query.subCategory = subCategory.trim();
    }

    if (isNewArrival === 'true') query.isNewArrival = true;
    if (onSale === 'true') query.onSale = true;
    if (isFeatured === 'true') query.isFeatured = true;

    if (search && typeof search === 'string' && search.trim().length > 0) {
      query.$text = { $search: search.trim() };
    }

    // Safely build sort object
    const sortObj = {};
    sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Safely fetch lenses
    let lenses = [];
    let total = 0;

    try {
      if (Lens && typeof Lens.find === 'function') {
        lenses = await Lens.find(query)
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean()
          .catch(err => {
            console.error('[Lens Controller] Error fetching lenses:', err.message);
            return [];
          });

        total = await Lens.countDocuments(query).catch(() => 0);
      }
    } catch (error) {
      console.error('[Lens Controller] Error with Lens model:', error.message);
    }

    res.status(200).json({
      success: true,
      data: {
        products: Array.isArray(lenses) ? lenses : [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('[Lens Controller] Get lenses error:', error);
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

// @desc    Get single lens
// @route   GET /api/products/lens/:id
// @access  Public
export const getLensById = async (req, res) => {
  try {
    // Check MongoDB connection first
    if (!isMongoConnected()) {
      return res.status(404).json({
        success: false,
        message: 'Lens not found',
      });
    }

    // Safely validate ID
    const lensId = req.params?.id;
    if (!lensId || typeof lensId !== 'string' || lensId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lens ID',
      });
    }

    // Safely fetch lens
    let lens = null;
    try {
      if (Lens && typeof Lens.findById === 'function') {
        lens = await Lens.findById(lensId).lean().catch(() => null);
      }
    } catch (error) {
      console.error('[Lens Controller] Error finding lens:', error.message);
    }

    if (!lens) {
      return res.status(404).json({
        success: false,
        message: 'Lens not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product: lens },
    });
  } catch (error) {
    console.error('[Lens Controller] Get lens error:', error);
    res.status(404).json({
      success: false,
      message: 'Lens not found',
    });
  }
};

// @desc    Create lens
// @route   POST /api/products/lens
// @access  Private/Admin
export const createLens = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
      });
    }

    if (!Lens || typeof Lens.create !== 'function') {
      return res.status(500).json({
        success: false,
        message: 'Lens model not available',
      });
    }

    const lens = await Lens.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Lens created successfully',
      data: { product: lens },
    });
  } catch (error) {
    console.error('[Lens Controller] Create lens error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lens',
      error: error.message,
    });
  }
};

// @desc    Update lens
// @route   PUT /api/products/lens/:id
// @access  Private/Admin
export const updateLens = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
      });
    }

    const lensId = req.params?.id;
    if (!lensId || typeof lensId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid lens ID',
      });
    }

    if (!Lens || typeof Lens.findByIdAndUpdate !== 'function') {
      return res.status(500).json({
        success: false,
        message: 'Lens model not available',
      });
    }

    const lens = await Lens.findByIdAndUpdate(
      lensId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).catch(() => null);

    if (!lens) {
      return res.status(404).json({
        success: false,
        message: 'Lens not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lens updated successfully',
      data: { product: lens },
    });
  } catch (error) {
    console.error('[Lens Controller] Update lens error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lens',
      error: error.message,
    });
  }
};

// @desc    Delete lens
// @route   DELETE /api/products/lens/:id
// @access  Private/Admin
export const deleteLens = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable',
      });
    }

    const lensId = req.params?.id;
    if (!lensId || typeof lensId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid lens ID',
      });
    }

    if (!Lens || typeof Lens.findByIdAndDelete !== 'function') {
      return res.status(500).json({
        success: false,
        message: 'Lens model not available',
      });
    }

    const lens = await Lens.findByIdAndDelete(lensId).catch(() => null);

    if (!lens) {
      return res.status(404).json({
        success: false,
        message: 'Lens not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lens deleted successfully',
    });
  } catch (error) {
    console.error('[Lens Controller] Delete lens error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lens',
      error: error.message,
    });
  }
};
