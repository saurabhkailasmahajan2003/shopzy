import mongoose from "mongoose";

const skincareProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: false, // Not unique since some documents might not have it
    required: false, // Make optional to handle existing documents
  },

  productName: {
    type: String,
    required: true,
    trim: true,
  },

  brand: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    // Remove enum restriction to allow any category value from database
    // Common categories: cleanser, serum, moisturizer, sunscreen, facewash
    required: true,
  },

  subCategory: {
    type: String,
    required: false, // Make optional to handle existing documents
  },

  skinType: {
    type: String,
    // Remove enum to allow any value from database
    default: "all",
  },

  skinConcern: [{
    type: String,
    // Remove enum to allow any value from database
  }],

  ingredients: [String],

  price: {
    type: Number,
    required: true,
  },

  discountPercent: {
    type: Number,
    default: 0,
  },

  rating: {
    type: Number,
    default: 0,
  },

  description: {
    type: String,
  },

  imageUrl: {
    type: String,
    required: true,
  },

  stock: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  }

}, { 
  timestamps: true,
  strict: false // Allow fields not defined in schema (like longDescription, etc.)
});

export default mongoose.model("SkincareProduct", skincareProductSchema, "skincare");

