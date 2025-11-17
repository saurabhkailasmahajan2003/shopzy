import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  products: [{
    type: mongoose.Schema.Types.Mixed, // Store full product objects
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

wishlistSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;

