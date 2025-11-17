import mongoose from 'mongoose';

const fashionSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'fashion',
    immutable: true,
  },
  subCategory: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'unisex'],
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  finalPrice: {
    type: Number,
    min: 0,
  },
  images: [{
    type: String,
  }],
  thumbnail: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  sizes: [{
    type: String,
  }],
  color: String,
  brandColor: String,
  idealFor: String,
  productDetails: {
    type: String,
    sleeve: String,
    fit: String,
    fabric: String,
    packOf: Number,
    styleCode: String,
    neckType: String,
    pattern: String,
    suitableFor: String,
    reversible: Boolean,
    fabricCare: String,
    occasion: String,
  },
  description: {
    type: String,
  },
  netQuantity: {
    type: Number,
    default: 1,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  onSale: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate finalPrice before saving
fashionSchema.pre('save', function (next) {
  if (this.discountPercent > 0 && this.price) {
    this.finalPrice = this.price - (this.price * this.discountPercent / 100);
  } else if (this.originalPrice && this.price) {
    this.finalPrice = this.price;
  } else {
    this.finalPrice = this.price;
  }
  this.updatedAt = Date.now();
  next();
});

// Indexes
fashionSchema.index({ category: 1, gender: 1 });
fashionSchema.index({ name: 'text', brand: 'text', description: 'text' });

const Fashion = mongoose.model('Fashion', fashionSchema, 'fashions');

export default Fashion;

