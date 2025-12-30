import mongoose from 'mongoose';
import WomensShoe from '../../models/product/shoe.model.js';

// Helper function to normalize shoe to common format
const normalizeShoe = (product) => {
  const normalized = product.toObject ? product.toObject() : product;
  
  // Keep images as array (frontend expects array format)
  let imagesArray = [];
  if (normalized.images && Array.isArray(normalized.images)) {
    imagesArray = normalized.images.filter(img => img);
  } else if (normalized.thumbnail) {
    imagesArray = [normalized.thumbnail];
  } else if (normalized.Images?.image1) {
    imagesArray = [normalized.Images.image1];
  }

  // Calculate prices
  const mrp = normalized.price || normalized.originalPrice || 0;
  const discountPercent = normalized.discountPercent || 0;
  const finalPrice = normalized.finalPrice || (discountPercent > 0 ? mrp - (mrp * discountPercent / 100) : mrp);
  const originalPrice = normalized.originalPrice || mrp;

  // Extract sizes from sizes_inventory
  const sizes = normalized.sizes_inventory 
    ? normalized.sizes_inventory.map(item => item.size).filter(Boolean)
    : [];

  return {
    ...normalized,
    title: normalized.title || normalized.name,
    name: normalized.title || normalized.name,
    mrp: mrp,
    price: mrp,
    originalPrice: originalPrice,
    finalPrice: finalPrice,
    discountPercent: discountPercent,
    images: imagesArray.length > 0 ? imagesArray : [],
    product_info: normalized.product_info || {
      brand: normalized.brand || '',
    },
    category: normalized.category || "Women's Shoes",
    subCategory: normalized.subCategory || '',
    sizes: sizes,
    _schemaType: 'shoe'
  };
};

// @desc    Get all shoes
// @route   GET /api/products/shoes
// @access  Public
export const getShoes = async (req, res) => {
  try {
    // Debug: Check collection name and count
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const shoeCollections = collections.filter(c => c.name.toLowerCase().includes('shoe'));
    console.log('[Shoes Controller] Collections with "shoe" in name:', shoeCollections.map(c => c.name));
    
    const {
      gender,
      subCategory,
      subSubCategory,
      isNewArrival,
      onSale,
      isFeatured,
      search,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Build query - start with empty query to get all shoes
    const query = {};

    // Only add gender filter if explicitly provided
    if (gender) {
      const requestedGender = gender.toLowerCase();
      // Match 'Women' or 'women' case-insensitively
      query['product_info.gender'] = { $regex: new RegExp(requestedGender, 'i') };
    }

    // Only filter by subCategory if provided
    if (subCategory) {
      query.subCategory = { $regex: new RegExp(subCategory, 'i') };
    }

    // Only filter by subSubCategory if provided
    if (subSubCategory) {
      query.subSubCategory = { $regex: new RegExp(subSubCategory, 'i') };
    }

    if (isNewArrival === 'true') {
      query.isNewArrival = true;
    }

    if (onSale === 'true') {
      query.onSale = true;
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Fetch all shoes
    const allShoes = await WomensShoe.find(query).lean();
    console.log(`[Shoes Controller] Query:`, JSON.stringify(query, null, 2));
    console.log(`[Shoes Controller] Found ${allShoes.length} shoes`);
    
    // Debug: Log first shoe if exists
    if (allShoes.length > 0) {
      console.log(`[Shoes Controller] Sample shoe:`, {
        title: allShoes[0].title,
        subCategory: allShoes[0].subCategory,
        brand: allShoes[0].product_info?.brand,
        hasImages: !!allShoes[0].images?.length
      });
    } else {
      console.log(`[Shoes Controller] No shoes found. Checking collection...`);
      const totalCount = await WomensShoe.countDocuments({});
      console.log(`[Shoes Controller] Total documents in collection: ${totalCount}`);
    }

    // Normalize products
    const normalizedProducts = allShoes.map(normalizeShoe);

    // Sort products
    const sortOrder = order === 'asc' ? 1 : -1;
    normalizedProducts.sort((a, b) => {
      let aVal, bVal;

      switch (sort) {
        case 'price':
          aVal = a.finalPrice || a.price || 0;
          bVal = b.finalPrice || b.price || 0;
          break;
        case 'rating':
          aVal = a.rating || 0;
          bVal = b.rating || 0;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt || 0);
          bVal = new Date(b.createdAt || 0);
          break;
        default:
          aVal = new Date(a.createdAt || 0);
          bVal = new Date(b.createdAt || 0);
      }

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * sortOrder;
      }
      return (aVal - bVal) * sortOrder;
    });

    // Apply pagination after sorting
    const total = normalizedProducts.length;
    const skip = (pageNum - 1) * limitNum;
    const paginatedProducts = normalizedProducts.slice(skip, skip + limitNum);

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
    console.error('Get shoes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shoes',
      error: error.message,
    });
  }
};

// @desc    Get single shoe by ID
// @route   GET /api/products/shoes/:id
// @access  Public
export const getShoeById = async (req, res) => {
  try {
    const shoe = await WomensShoe.findById(req.params.id).lean();

    if (!shoe) {
      return res.status(404).json({
        success: false,
        message: 'Shoe not found',
      });
    }

    const normalized = normalizeShoe(shoe);

    res.status(200).json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    console.error('Get shoe by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shoe',
      error: error.message,
    });
  }
};

// @desc    Create new shoe
// @route   POST /api/products/shoes
// @access  Private/Admin
export const createShoe = async (req, res) => {
  try {
    const shoe = await WomensShoe.create(req.body);
    const normalized = normalizeShoe(shoe);

    res.status(201).json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    console.error('Create shoe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shoe',
      error: error.message,
    });
  }
};

// @desc    Update shoe
// @route   PUT /api/products/shoes/:id
// @access  Private/Admin
export const updateShoe = async (req, res) => {
  try {
    const shoe = await WomensShoe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    if (!shoe) {
      return res.status(404).json({
        success: false,
        message: 'Shoe not found',
      });
    }

    const normalized = normalizeShoe(shoe);

    res.status(200).json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    console.error('Update shoe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shoe',
      error: error.message,
    });
  }
};

// @desc    Delete shoe
// @route   DELETE /api/products/shoes/:id
// @access  Private/Admin
export const deleteShoe = async (req, res) => {
  try {
    const shoe = await WomensShoe.findByIdAndDelete(req.params.id);

    if (!shoe) {
      return res.status(404).json({
        success: false,
        message: 'Shoe not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shoe deleted successfully',
    });
  } catch (error) {
    console.error('Delete shoe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting shoe',
      error: error.message,
    });
  }
};

