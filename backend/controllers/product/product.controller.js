import mongoose from 'mongoose';
import Women from '../../models/product/womenModel.js';
import Saree from '../../models/product/saree.model.js';
import Watch from '../../models/product/watch.model.js';
import WatchNew from '../../models/product/watchNew.model.js';
import Lens from '../../models/product/lens.model.js';
import Accessory from '../../models/product/accessory.model.js';
import SkincareProduct from '../../models/product/skincare.model.js';
import WomensShoe from '../../models/product/shoe.model.js';

// Normalization functions (duplicated from respective controllers)
const normalizeOldWomen = (product) => ({
  ...product,
  _id: product._id,
  id: product._id,
  name: product.name || product.title,
  title: product.name || product.title,
  price: product.finalPrice || product.price,
  mrp: product.originalPrice || product.price,
  images: Array.isArray(product.images) ? product.images : (product.thumbnail ? [product.thumbnail] : []),
  category: 'women',
});

const normalizeSaree = (product) => {
  const normalized = product.toObject ? product.toObject() : product;
  let imagesArray = [];
  if (normalized.images && typeof normalized.images === 'object' && !Array.isArray(normalized.images)) {
    imagesArray = [
      normalized.images.image1,
      normalized.images.image2,
      normalized.images.image3,
      normalized.images.image4,
    ].filter(Boolean);
  } else if (Array.isArray(normalized.images)) {
    imagesArray = normalized.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
  }
  const mrp = normalized.mrp || 0;
  const discountPercent = normalized.discountPercent || 0;
  const finalPrice = normalized.finalPrice || (discountPercent > 0 ? mrp - (mrp * discountPercent / 100) : mrp);
  const brand = normalized.product_info?.brand || normalized.brand || '';
  return {
    ...normalized,
    _id: normalized._id,
    id: normalized._id,
    name: normalized.title || normalized.name,
    title: normalized.title || normalized.name,
    price: finalPrice,
    mrp: mrp,
    originalPrice: mrp,
    finalPrice: finalPrice,
    discountPercent: discountPercent,
    images: imagesArray,
    brand: brand,
    category: 'women',
    subCategory: 'saree',
    product_info: normalized.product_info || {},
  };
};

const normalizeOldWatch = (watch) => {
  const normalized = watch.toObject ? watch.toObject() : watch;
  let imagesArray = [];
  if (normalized.images && Array.isArray(normalized.images)) {
    imagesArray = normalized.images.filter(img => img);
  } else if (normalized.thumbnail) {
    imagesArray = [normalized.thumbnail];
  } else if (normalized.image) {
    imagesArray = [normalized.image];
  }
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
      manufacturer: normalized.productDetails?.manufacturer || '',
      IncludedComponents: normalized.productDetails?.IncludedComponents || ''
    },
    category: normalized.category || 'WATCHES',
    _schemaType: 'old'
  };
};

const normalizeNewWatch = (watch) => {
  const normalized = watch.toObject ? watch.toObject() : watch;
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
    if (normalized.thumbnail) imagesArray = [normalized.thumbnail];
    else if (normalized.image) imagesArray = [normalized.image];
  }
  const mrp = normalized.mrp || normalized.price || 0;
  const discountPercent = normalized.discountPercent || 0;
  const finalPrice = discountPercent > 0 ? mrp - (mrp * discountPercent / 100) : mrp;
  return {
    ...normalized,
    name: normalized.title || normalized.name,
    price: mrp,
    mrp: mrp,
    originalPrice: mrp,
    finalPrice: finalPrice,
    discountPercent: discountPercent,
    images: imagesArray,
    image: imagesArray[0] || null,
    thumbnail: imagesArray[0] || null,
    product_info: normalized.product_info || {},
    category: normalized.category || 'WATCHES',
    _schemaType: 'new'
  };
};

const normalizeOldLens = (lens) => {
  const normalized = lens.toObject ? lens.toObject() : lens;
  return {
    ...normalized,
    name: normalized.name || normalized.title,
    title: normalized.name || normalized.title,
    price: normalized.finalPrice || normalized.price || normalized.mrp || 0,
    mrp: normalized.mrp || normalized.price || 0,
    finalPrice: normalized.finalPrice || normalized.price || normalized.mrp || 0,
    images: Array.isArray(normalized.images) ? normalized.images : (normalized.thumbnail ? [normalized.thumbnail] : []),
    category: 'lens',
  };
};

const normalizeOldAccessory = (product) => {
  const normalized = product.toObject ? product.toObject() : product;
  let imagesArray = [];
  if (normalized.images && Array.isArray(normalized.images)) {
    imagesArray = normalized.images.filter(img => img);
  } else if (normalized.thumbnail) {
    imagesArray = [normalized.thumbnail];
  } else if (normalized.image) {
    imagesArray = [normalized.image];
  }
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

const normalizeSkincare = (product) => {
  const normalized = product.toObject ? product.toObject() : product;
  return {
    ...normalized,
    _id: normalized._id,
    id: normalized._id,
    name: normalized.productName || normalized.name,
    title: normalized.productName || normalized.name,
    price: normalized.price || normalized.finalPrice || 0,
    mrp: normalized.mrp || normalized.price || 0,
    finalPrice: normalized.finalPrice || normalized.price || 0,
    images: Array.isArray(normalized.images) ? normalized.images : (normalized.image ? [normalized.image] : []),
    category: 'skincare',
    subCategory: normalized.category || '',
  };
};

const normalizeShoe = (product) => {
  const normalized = product.toObject ? product.toObject() : product;
  let imagesArray = [];
  if (normalized.images && Array.isArray(normalized.images)) {
    imagesArray = normalized.images.filter(img => img);
  } else if (normalized.thumbnail) {
    imagesArray = [normalized.thumbnail];
  } else if (normalized.Images?.image1) {
    imagesArray = [normalized.Images.image1];
  }
  const mrp = normalized.price || normalized.originalPrice || 0;
  const discountPercent = normalized.discountPercent || 0;
  const finalPrice = normalized.finalPrice || (discountPercent > 0 ? mrp - (mrp * discountPercent / 100) : mrp);
  const originalPrice = normalized.originalPrice || mrp;
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
  };
};

// @desc    Get product by ID from all categories
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Search in all collections in parallel
    const [
      womenProduct,
      sareeProduct,
      oldWatch,
      newWatch,
      lensProduct,
      accessoryProduct,
      skincareProduct,
      shoeProduct,
    ] = await Promise.all([
      Women.findById(id).lean(),
      Saree.findById(id).lean(),
      Watch.findById(id).lean(),
      WatchNew.findById(id).lean(),
      Lens.findById(id).lean(),
      Accessory.findById(id).lean(),
      SkincareProduct.findById(id).lean(),
      WomensShoe.findById(id).lean(),
    ]);

    let product = null;
    let category = null;

    // Check each result and normalize
    if (womenProduct) {
      product = normalizeOldWomen(womenProduct);
      category = 'women';
    } else if (sareeProduct) {
      product = normalizeSaree(sareeProduct);
      category = 'women';
    } else if (oldWatch) {
      product = normalizeOldWatch(oldWatch);
      category = 'watches';
    } else if (newWatch) {
      product = normalizeNewWatch(newWatch);
      category = 'watches';
    } else if (lensProduct) {
      product = normalizeOldLens(lensProduct);
      category = 'lens';
    } else if (accessoryProduct) {
      // Check if it's a men's product or shoes (should be filtered out)
      const productGender = (accessoryProduct.gender || '').toLowerCase();
      const productSubCategory = (accessoryProduct.subCategory || '').toLowerCase();
      
      if (!['men', 'male', 'm'].includes(productGender) && productSubCategory !== 'shoes') {
        product = normalizeOldAccessory(accessoryProduct);
        category = 'accessories';
      }
    } else if (skincareProduct) {
      product = normalizeSkincare(skincareProduct);
      category = 'skincare';
    } else if (shoeProduct) {
      product = normalizeShoe(shoeProduct);
      category = 'shoes';
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        product: product,
        category: category,
      },
    });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

