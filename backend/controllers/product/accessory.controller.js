import Accessory from '../../models/product/accessory.model.js';

// Helper function to normalize old schema to common format
const normalizeOldAccessory = (product) => {
  const normalized = product.toObject ? product.toObject() : product;
  
  // Keep images as array (frontend expects array format)
  let imagesArray = [];
  if (normalized.images && Array.isArray(normalized.images)) {
    imagesArray = normalized.images.filter(img => img);
  } else if (normalized.thumbnail) {
    imagesArray = [normalized.thumbnail];
  } else if (normalized.image) {
    imagesArray = [normalized.image];
  }

  // Calculate prices
  const mrp = normalized.price || normalized.mrp || normalized.originalPrice || 0;
  const discountPercent = normalized.discountPercent || 0;
  const finalPrice = normalized.finalPrice || (discountPercent > 0 ? mrp - (mrp * discountPercent / 100) : mrp);
  const originalPrice = normalized.originalPrice || mrp;

  return {
    ...normalized,
    title: normalized.name || normalized.title,
    name: normalized.name || normalized.title,
    mrp: mrp,
    price: mrp,
    originalPrice: originalPrice,
    finalPrice: finalPrice,
    discountPercent: discountPercent,
    images: imagesArray.length > 0 ? imagesArray : [],
    product_info: normalized.product_info || {
      brand: normalized.brand || '',
      manufacturer: normalized.specifications?.manufacturer || '',
    },
    category: normalized.category || 'Accessories',
    subCategory: normalized.subCategory || '',
    _schemaType: 'old'
  };
};

// Helper function to build query for old schema
const buildOldAccessoryQuery = (reqQuery) => {
  const query = {};

  // Exclude men's products - only show women's or unisex
  query.gender = { $in: ['women', 'female', 'unisex'] };

  if (reqQuery.gender) {
    const requestedGender = reqQuery.gender.toLowerCase();
    // Only allow women/female/unisex, filter out men/male
    if (['women', 'female', 'unisex'].includes(requestedGender)) {
      query.gender = requestedGender;
    }
  }

  // Exclude shoes subcategory - always exclude regardless of request
  if (reqQuery.subCategory && reqQuery.subCategory.toLowerCase() !== 'shoes') {
    query.subCategory = reqQuery.subCategory;
  } else {
    // If no subCategory specified or if shoes is requested, exclude shoes
    query.subCategory = { $ne: 'shoes' };
  }

  if (reqQuery.isNewArrival === 'true') {
    query.isNewArrival = true;
  }

  if (reqQuery.onSale === 'true') {
    query.onSale = true;
  }

  if (reqQuery.isFeatured === 'true') {
    query.isFeatured = true;
  }

  if (reqQuery.search) {
    query.$text = { $search: reqQuery.search };
  }

  return query;
};

// Removed buildNewShoesQuery - shoes are no longer included in accessories

// @desc    Get all accessories from both collections
// @route   GET /api/products/accessories
// @access  Public
export const getAccessories = async (req, res) => {
  try {
    const {
      gender,
      subCategory,
      category,
      categoryId,
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

    // Build query for accessories only (no shoes, no men's products)
    const oldQuery = buildOldAccessoryQuery({ gender, subCategory, isNewArrival, onSale, isFeatured, search });

    // Only fetch from Accessory collection (no shoes)
    const oldProducts = await Accessory.find(oldQuery).lean();

    // Normalize to common format
    const normalizedOld = oldProducts.map(normalizeOldAccessory);

    // Filter out any men's products and shoes that might have slipped through
    const filteredProducts = normalizedOld.filter(product => {
      const productGender = (product.gender || '').toLowerCase();
      const productSubCategory = (product.subCategory || '').toLowerCase();
      const productCategory = (product.category || '').toLowerCase();
      
      // Exclude men's products
      if (['men', 'male', 'm'].includes(productGender)) {
        return false;
      }
      
      // Exclude shoes
      if (productSubCategory === 'shoes' || productCategory.includes('shoe')) {
        return false;
      }
      
      return true;
    });

    // Combine and sort all products
    let allProducts = [...filteredProducts];

    // Sort combined results
    const sortOrder = order === 'asc' ? 1 : -1;
    allProducts.sort((a, b) => {
      let aVal, bVal;

      switch (sort) {
        case 'price':
        case 'mrp':
          aVal = a.mrp || a.price || 0;
          bVal = b.mrp || b.price || 0;
          break;
        case 'discountPercent':
          aVal = a.discountPercent || 0;
          bVal = b.discountPercent || 0;
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
        return aVal.localeCompare(bVal) * sortOrder;
      }
      return (aVal - bVal) * sortOrder;
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
    console.error('Get accessories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accessories',
      error: error.message,
    });
  }
};

// @desc    Get single accessory from both collections
// @route   GET /api/products/accessories/:id
// @access  Public
export const getAccessoryById = async (req, res) => {
  try {
    // Only search in Accessory collection (no shoes)
    const oldProduct = await Accessory.findById(req.params.id).lean();

    if (!oldProduct) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    // Check if it's a men's product or shoes - exclude it
    const productGender = (oldProduct.gender || '').toLowerCase();
    const productSubCategory = (oldProduct.subCategory || '').toLowerCase();
    
    if (['men', 'male', 'm'].includes(productGender) || productSubCategory === 'shoes') {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found',
      });
    }

    const product = normalizeOldAccessory(oldProduct);

    res.status(200).json({
      success: true,
      data: { product: product },
    });
  } catch (error) {
    console.error('Get accessory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accessory',
      error: error.message,
    });
  }
};

// @desc    Create accessory
// @route   POST /api/products/accessories
// @access  Private/Admin
export const createAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Accessory created successfully',
      data: { product: accessory },
    });
  } catch (error) {
    console.error('Create accessory error:', error);
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
    const accessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

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
    console.error('Update accessory error:', error);
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
    const accessory = await Accessory.findByIdAndDelete(req.params.id);

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
    console.error('Delete accessory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting accessory',
      error: error.message,
    });
  }
};

