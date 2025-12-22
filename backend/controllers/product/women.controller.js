import mongoose from 'mongoose';
import Women from '../../models/product/womenModel.js';
import Saree from '../../models/product/saree.model.js';

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

// Helper function to normalize old women schema (PRODUCTION-SAFE)
const normalizeOldWomen = (product) => {
  try {
    const normalized = product?.toObject ? product.toObject() : (product || {});
    
    // Safely extract images
    let imagesArray = [];
    if (normalized.images && Array.isArray(normalized.images)) {
      imagesArray = normalized.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    } else if (normalized.thumbnail && typeof normalized.thumbnail === 'string') {
      imagesArray = [normalized.thumbnail];
    }

    // Safely calculate prices
    const finalPrice = Number(normalized.finalPrice) || Number(normalized.price) || 0;
    const originalPrice = Number(normalized.originalPrice) || Number(normalized.price) || 0;
    const mrp = originalPrice;

    return {
      ...normalized,
      _id: normalized._id || null,
      id: normalized._id || normalized.id || null,
      name: normalized.name || normalized.title || 'Untitled Product',
      title: normalized.name || normalized.title || 'Untitled Product',
      price: Math.max(0, finalPrice),
      mrp: Math.max(0, mrp),
      originalPrice: Math.max(0, originalPrice),
      finalPrice: Math.max(0, finalPrice),
      discountPercent: normalized.discountPercent || 0,
      images: Array.isArray(imagesArray) && imagesArray.length > 0 ? imagesArray : [],
      category: 'women',
    };
  } catch (error) {
    console.error('Error normalizing old women product:', error);
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
      category: 'women',
    };
  }
};

// Helper function to normalize saree schema (PRODUCTION-SAFE)
const normalizeSaree = (product) => {
  try {
    const normalized = product?.toObject ? product.toObject() : (product || {});
    
    // Safely convert images object to array
    let imagesArray = [];
    if (normalized.images && typeof normalized.images === 'object' && !Array.isArray(normalized.images)) {
      imagesArray = [
        normalized.images.image1,
        normalized.images.image2,
        normalized.images.image3,
        normalized.images.image4,
      ].filter(img => img && typeof img === 'string' && img.trim() !== '');
    } else if (Array.isArray(normalized.images)) {
      imagesArray = normalized.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
    }

    // Safely calculate prices
    const mrp = Number(normalized.mrp) || 0;
    const discountPercent = Number(normalized.discountPercent) || 0;
    const finalPrice = Number(normalized.finalPrice) || (discountPercent > 0 ? Math.max(0, mrp - (mrp * discountPercent / 100)) : mrp);
    const originalPrice = mrp;

    // Safely extract brand
    const brand = normalized.product_info?.brand || normalized.brand || '';

    return {
      ...normalized,
      _id: normalized._id || null,
      id: normalized._id || null,
      name: normalized.title || normalized.name || 'Untitled Product',
      title: normalized.title || normalized.name || 'Untitled Product',
      price: Math.max(0, finalPrice),
      mrp: Math.max(0, mrp),
      originalPrice: Math.max(0, originalPrice),
      finalPrice: Math.max(0, finalPrice),
      discountPercent: Math.max(0, Math.min(100, discountPercent)),
      images: Array.isArray(imagesArray) && imagesArray.length > 0 ? imagesArray : [],
      brand: brand,
      category: 'women',
      subCategory: 'saree',
      product_info: normalized.product_info || {},
    };
  } catch (error) {
    console.error('Error normalizing saree product:', error);
    return {
      _id: product?._id || null,
      id: product?._id || null,
      name: 'Product',
      price: 0,
      mrp: 0,
      originalPrice: 0,
      finalPrice: 0,
      discountPercent: 0,
      images: [],
      brand: '',
      category: 'women',
      subCategory: 'saree',
      product_info: {},
    };
  }
};

// Helper function to build query for old women schema (PRODUCTION-SAFE)
const buildOldWomenQuery = (reqQuery) => {
  const query = {};

  if (reqQuery.subCategory && typeof reqQuery.subCategory === 'string') {
    const normalizedSubCategory = reqQuery.subCategory.toLowerCase().trim().replace(/-/g, '');
    // Exclude saree from old schema
    if (normalizedSubCategory === 'saree' || normalizedSubCategory === 'sari') {
      query._id = { $in: [] }; // Safely return no results
      return query;
    }
    if (normalizedSubCategory.length > 0) {
      query.subCategory = { 
        $regex: new RegExp(`^${normalizedSubCategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') 
      };
    }
  }

  if (reqQuery.isNewArrival === 'true') query.isNewArrival = true;
  if (reqQuery.onSale === 'true') query.onSale = true;
  if (reqQuery.isFeatured === 'true') query.isFeatured = true;

  if (reqQuery.search && typeof reqQuery.search === 'string' && reqQuery.search.trim().length > 0) {
    query.$text = { $search: reqQuery.search.trim() };
  }

  return query;
};

// Helper function to build query for saree schema (PRODUCTION-SAFE)
const buildSareeQuery = (reqQuery) => {
  const query = {};

  if (reqQuery.subCategory && typeof reqQuery.subCategory === 'string') {
    const normalizedSubCategory = reqQuery.subCategory.toLowerCase().trim().replace(/-/g, '');
    if (normalizedSubCategory !== 'saree' && normalizedSubCategory !== 'sari') {
      query._id = { $in: [] }; // Safely return no results
      return query;
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

// @desc    Get all women's products (shirts, tshirts, jeans, trousers, sarees)
// @route   GET /api/products/women
// @access  Public
export const getWomenItems = async (req, res) => {
  try {
    // Check MongoDB connection first
    if (!isMongoConnected()) {
      console.warn('[Women Controller] MongoDB not connected, returning empty results');
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

    // Build queries for all schemas
    const oldQuery = buildOldWomenQuery({ subCategory, isNewArrival, onSale, isFeatured, search });
    const sareeQuery = buildSareeQuery({ subCategory, category, categoryId, isNewArrival, onSale, search });

    // Safely fetch from both collections
    let oldProducts = [];
    let sareeProducts = [];

    try {
      if (Women && typeof Women.find === 'function') {
        oldProducts = await Women.find(oldQuery).lean().catch(err => {
          console.error('[Women Controller] Error fetching old products:', err.message);
          return [];
        });
      }
    } catch (error) {
      console.error('[Women Controller] Error with Women model:', error.message);
    }

    try {
      if (Saree && typeof Saree.find === 'function') {
        sareeProducts = await Saree.find(sareeQuery).lean().catch(err => {
          console.error('[Women Controller] Error fetching saree products:', err.message);
          return [];
        });
      }
    } catch (error) {
      console.error('[Women Controller] Error with Saree model:', error.message);
    }

    // Safely normalize all schemas to common format
    const normalizedOld = Array.isArray(oldProducts) ? oldProducts.map(normalizeOldWomen).filter(p => p) : [];
    const normalizedSarees = Array.isArray(sareeProducts) ? sareeProducts.map(normalizeSaree).filter(p => p) : [];

    // Combine and sort all products
    let allProducts = [...normalizedOld, ...normalizedSarees];

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
        console.error('[Women Controller] Error sorting products:', error.message);
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
    console.error('[Women Controller] Get women items error:', error);
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

// @desc    Get single women product from all collections
// @route   GET /api/products/women/:id
// @access  Public
export const getWomenItemById = async (req, res) => {
  try {
    // Check MongoDB connection first
    if (!isMongoConnected()) {
      return res.status(404).json({
        success: false,
        message: 'Women product not found',
      });
    }

    // Safely validate ID
    const productId = req.params?.id;
    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Safely try to find in all collections
    let oldProduct = null;
    let sareeProduct = null;

    try {
      if (Women && typeof Women.findById === 'function') {
        oldProduct = await Women.findById(productId).lean().catch(() => null);
      }
    } catch (error) {
      console.error('[Women Controller] Error finding old product:', error.message);
    }

    try {
      if (Saree && typeof Saree.findById === 'function') {
        sareeProduct = await Saree.findById(productId).lean().catch(() => null);
      }
    } catch (error) {
      console.error('[Women Controller] Error finding saree product:', error.message);
    }

    let product = null;
    if (oldProduct) {
      product = normalizeOldWomen(oldProduct);
    } else if (sareeProduct) {
      product = normalizeSaree(sareeProduct);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Women product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product: product },
    });

  } catch (error) {
    console.error('[Women Controller] Get women item error:', error);
    res.status(404).json({
      success: false,
      message: 'Women product not found',
    });
  }
};
