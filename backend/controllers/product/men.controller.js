import mongoose from 'mongoose';
import Men from '../../models/product/menModel.js';
import MenTshirt from '../../models/product/menTshirt.model.js';
import Shoes from '../../models/product/shoes.model.js';

// Helper to check MongoDB connection
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
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
const normalizeOldMen = (product) => {
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

    // Safely calculate prices with defaults
    const mrp = Number(normalized.price) || Number(normalized.mrp) || Number(normalized.originalPrice) || 0;
    const discountPercent = Number(normalized.discountPercent) || 0;
    const finalPrice = Number(normalized.finalPrice) || (discountPercent > 0 ? Math.max(0, mrp - (mrp * discountPercent / 100)) : mrp);
    const originalPrice = Number(normalized.originalPrice) || mrp;

    return {
      ...normalized,
      _id: normalized._id || null,
      id: normalized._id || normalized.id || null,
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
      },
      category: normalized.category || 'men',
      subCategory: normalized.subCategory || '',
      _schemaType: 'old'
    };
  } catch (error) {
    console.error('Error normalizing old men product:', error);
    // Return minimal safe product
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
      category: 'men',
      subCategory: '',
      _schemaType: 'old'
    };
  }
};

// Helper function to normalize new schema shoes to common format (PRODUCTION-SAFE)
const normalizeNewShoesForMen = (product) => {
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
      category: 'men',
      imagesObject: normalized.images,
      _schemaType: 'new-shoes'
    };
  } catch (error) {
    console.error('Error normalizing new shoes product:', error);
    return {
      _id: product?._id || null,
      id: product?._id || null,
      name: 'Product',
      price: 0,
      originalPrice: 0,
      finalPrice: 0,
      discountPercent: 0,
      images: [],
      category: 'men',
      subCategory: 'shoes',
      sizes: [],
      _schemaType: 'new-shoes'
    };
  }
};

// Helper function to normalize new schema to common format (PRODUCTION-SAFE)
const normalizeNewMenTshirt = (product) => {
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
      subCategory: 'tshirt',
      imagesObject: normalized.images,
      _schemaType: 'new'
    };
  } catch (error) {
    console.error('Error normalizing new tshirt product:', error);
    return {
      _id: product?._id || null,
      id: product?._id || null,
      name: 'Product',
      price: 0,
      originalPrice: 0,
      finalPrice: 0,
      discountPercent: 0,
      images: [],
      category: 'men',
      subCategory: 'tshirt',
      _schemaType: 'new'
    };
  }
};

// Helper function to build query for old schema (PRODUCTION-SAFE)
const buildOldMenQuery = (reqQuery) => {
  const query = {};

  // Safe subcategory filter
  if (reqQuery.subCategory && typeof reqQuery.subCategory === 'string') {
    const normalizedSubCategory = reqQuery.subCategory
      .toLowerCase()
      .trim()
      .replace(/-/g, '');
    
    if (normalizedSubCategory.length > 0) {
      query.subCategory = {
        $regex: new RegExp(`^${normalizedSubCategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      };
    }
  }

  // Safe Boolean Filters
  if (reqQuery.isNewArrival === 'true') query.isNewArrival = true;
  if (reqQuery.onSale === 'true') query.onSale = true;

  // Safe Search Filter (only if text index exists)
  if (reqQuery.search && typeof reqQuery.search === 'string' && reqQuery.search.trim().length > 0) {
    query.$text = { $search: reqQuery.search.trim() };
  }

  return query;
};

// Helper function to build query for new schema t-shirts (PRODUCTION-SAFE)
const buildNewMenTshirtQuery = (reqQuery) => {
  const query = {};

  // Always include t-shirt products from new schema
  query.category = { 
    $regex: /^tshirt/i
  };

  // Only override if a specific category is provided and it's NOT a t-shirt variant
  if (reqQuery.category && typeof reqQuery.category === 'string') {
    const cat = reqQuery.category.toLowerCase();
    if (!cat.includes('tshirt')) {
      // For non-tshirt categories, use impossible query instead of _id = null
      query._id = { $in: [] }; // This safely returns no results
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

// Helper function to build query for new schema shoes (PRODUCTION-SAFE)
const buildNewShoesQuery = (reqQuery) => {
  const query = {};

  // Always include shoe products from new schema
  query.category = { 
    $regex: /^shoe/i
  };

  // Only override if a specific category is provided and it's NOT a shoe variant
  if (reqQuery.category && typeof reqQuery.category === 'string') {
    const cat = reqQuery.category.toLowerCase();
    if (!cat.includes('shoe')) {
      // For non-shoe categories, use impossible query instead of _id = null
      query._id = { $in: [] }; // This safely returns no results
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

// @desc    Get all men's products from both collections
// @route   GET /api/products/men
// @access  Public
export const getMenItems = async (req, res) => {
  try {
    // Check MongoDB connection first
    if (!isMongoConnected()) {
      console.warn('[Men Controller] MongoDB not connected, returning empty results');
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
    const oldQuery = buildOldMenQuery({ subCategory, isNewArrival, onSale, search });
    const newTshirtQuery = buildNewMenTshirtQuery({ subCategory, category, categoryId, isNewArrival, onSale, search });
    const newShoesQuery = buildNewShoesQuery({ subCategory, category, categoryId, isNewArrival, onSale, search });

    // Safely fetch from all collections with error handling
    let oldProducts = [];
    let newTshirtProducts = [];
    let newShoesProducts = [];

    try {
      // Check if models exist before querying
      if (Men && typeof Men.find === 'function') {
        oldProducts = await Men.find(oldQuery).lean().catch(err => {
          console.error('[Men Controller] Error fetching old products:', err.message);
          return [];
        });
      }
    } catch (error) {
      console.error('[Men Controller] Error with Men model:', error.message);
    }

    try {
      if (MenTshirt && typeof MenTshirt.find === 'function') {
        newTshirtProducts = await MenTshirt.find(newTshirtQuery).lean().catch(err => {
          console.error('[Men Controller] Error fetching tshirt products:', err.message);
          return [];
        });
      }
    } catch (error) {
      console.error('[Men Controller] Error with MenTshirt model:', error.message);
    }

    try {
      if (Shoes && typeof Shoes.find === 'function') {
        newShoesProducts = await Shoes.find(newShoesQuery).lean().catch(err => {
          console.error('[Men Controller] Error fetching shoes products:', err.message);
          return [];
        });
      }
    } catch (error) {
      console.error('[Men Controller] Error with Shoes model:', error.message);
    }

    // Safely normalize all schemas to common format
    const normalizedOld = Array.isArray(oldProducts) ? oldProducts.map(normalizeOldMen).filter(p => p) : [];
    const normalizedNewTshirts = Array.isArray(newTshirtProducts) ? newTshirtProducts.map(normalizeNewMenTshirt).filter(p => p) : [];
    const normalizedNewShoes = Array.isArray(newShoesProducts) ? newShoesProducts.map(normalizeNewShoesForMen).filter(p => p) : [];

    // Combine and sort all products
    let allProducts = [...normalizedOld, ...normalizedNewTshirts, ...normalizedNewShoes];

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
        console.error('[Men Controller] Error sorting products:', error.message);
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
    console.error('[Men Controller] Get men items error:', error);
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

// @desc    Get single men product from all collections
// @route   GET /api/products/men/:id
// @access  Public
export const getMenItemById = async (req, res) => {
  try {
    // Check MongoDB connection first
    if (!isMongoConnected()) {
      return res.status(404).json({
        success: false,
        message: 'Men product not found',
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
    let newTshirtProduct = null;
    let newShoesProduct = null;

    try {
      if (Men && typeof Men.findById === 'function') {
        oldProduct = await Men.findById(productId).lean().catch(() => null);
      }
    } catch (error) {
      console.error('[Men Controller] Error finding old product:', error.message);
    }

    try {
      if (MenTshirt && typeof MenTshirt.findById === 'function') {
        newTshirtProduct = await MenTshirt.findById(productId).lean().catch(() => null);
      }
    } catch (error) {
      console.error('[Men Controller] Error finding tshirt product:', error.message);
    }

    try {
      if (Shoes && typeof Shoes.findById === 'function') {
        newShoesProduct = await Shoes.findById(productId).lean().catch(() => null);
      }
    } catch (error) {
      console.error('[Men Controller] Error finding shoes product:', error.message);
    }

    let product = null;
    if (oldProduct) {
      product = normalizeOldMen(oldProduct);
    } else if (newTshirtProduct) {
      product = normalizeNewMenTshirt(newTshirtProduct);
    } else if (newShoesProduct) {
      product = normalizeNewShoesForMen(newShoesProduct);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Men product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { product: product },
    });

  } catch (error) {
    console.error('[Men Controller] Get men item error:', error);
    res.status(404).json({
      success: false,
      message: 'Men product not found',
    });
  }
};
