import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Watch from '../models/product/watch.model.js';
import Lens from '../models/product/lens.model.js';
import Accessory from '../models/product/accessory.model.js';
import Fashion from '../models/product/fashion.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const sampleProducts = {
  watch: {
    name: "Titan Stellar Analog with Sun Moon Phase and Blue Dial Silver Stainless Steel Strap Watch for Men",
    brand: "Titan",
    category: "watches",
    subCategory: "analog",
    gender: "men",
    price: 11995,
    originalPrice: 11995,
    discountPercent: 0,
    rating: 4.7,
    ratingsCount: 3,
    reviewsCount: 3,
    stock: 25,
    dialColor: "Blue",
    bandColor: "Silver",
    bandMaterial: "Stainless Steel",
    displayType: "Analog",
    movementType: "Quartz",
    glassMaterial: "Mineral Glass",
    waterResistance: "5 ATM",
    caseMaterial: "Stainless Steel",
    caseShape: "Round",
    caseWidth: "43 mm",
    caseLength: "45.5 mm",
    caseThickness: "11.55 mm",
    warranty: "24 Months Manufacturer Warranty on Movement",
    productDetails: {
      modelNumber: "10028SM01",
      function: "Analog",
      collection: "Stellar",
      strapMaterial: "Stainless Steel",
      strapColor: "Silver",
      lockMechanism: "Regular Deployant",
      movement: "Quartz",
      sunMoonPhase: true,
      specialFeatures: [
        "Sun–Moon disc with 24-hour markings",
        "Faceted bezel with 3-piece case construction",
        "Centre dial inspired by a black hole silhouette"
      ]
    },
    images: [
      "https://via.placeholder.com/600x600?text=Titan+Stellar+Watch"
    ],
    description: "Step into the cosmic realm with the Titan Stellar – a watch inspired by ancient astronomy. The Sun-Moon phase disc creates a 24-hour celestial display, powered by Titan's in-house Quartz 7137B movement. The centre dial, shaped like a black hole silhouette, adds infinite depth. Featuring a faceted bezel, stainless-steel strap, and premium build, this timepiece merges bold geometry with timeless elegance.",
    isNewArrival: true,
    onSale: false,
    isFeatured: true,
    inStock: true,
  },
  lens: {
    name: "Black Wayfarer Eyeglasses for Men",
    brand: "Fastrack",
    category: "lens",
    subCategory: "Wayfarer",
    price: 800,
    mrp: 800,
    gender: "men",
    frameColor: "Black",
    templeColor: "Black",
    frameMaterial: "TR90",
    frameShape: "Wayfarer",
    rimDetails: "Rimmed",
    warranty: "6 months",
    sku: "FT1504MFP11MBKV",
    dimensions: {
      lensWidth: "52 mm",
      bridgeWidth: "19 mm",
      templeLength: "145 mm",
      lensHeight: "40 mm"
    },
    stock: 50,
    rating: 4.2,
    reviews: 120,
    reviewsCount: 120,
    isNewArrival: true,
    onSale: false,
    inStock: true,
    images: [
      "https://via.placeholder.com/600x600?text=Fastrack+Eyeglasses"
    ],
    description: "Stylish black wayfarer eyeglasses for men with TR90 frame material, perfect for everyday wear.",
  },
  fashion: {
    name: "U.S. POLO ASSN. Solid Crew Neck Pure Cotton Black T-Shirt",
    brand: "U.S. POLO ASSN.",
    category: "fashion",
    subCategory: "tshirt",
    gender: "men",
    price: 863,
    originalPrice: 899,
    discountPercent: 4,
    rating: 4.2,
    ratingsCount: 79,
    reviewsCount: 3,
    sizes: ["S", "M", "L", "XL", "XXL"],
    productDetails: {
      type: "Crew Neck",
      sleeve: "Short Sleeve",
      fit: "Oversized",
      fabric: "Pure Cotton",
      packOf: 1,
      styleCode: "OEE04-002-PL",
      neckType: "Crew Neck",
      pattern: "Solid",
      suitableFor: "Western Wear",
      reversible: false,
      fabricCare: "Regular Machine Wash",
      occasion: "Casual"
    },
    color: "Black",
    brandColor: "Black",
    idealFor: "Men",
    stock: 50,
    images: [
      "https://via.placeholder.com/500?text=U.S.+POLO+T-Shirt"
    ],
    description: "Men's solid pure cotton oversized crew neck T-shirt, ideal for casual wear.",
    netQuantity: 1,
    isNewArrival: true,
    onSale: true,
    inStock: true,
  },
  accessory: {
    name: "Premium Leather Wallet with RFID Blocking",
    brand: "Accessorize",
    category: "Accessories",
    subCategory: "wallet",
    gender: "unisex",
    price: 1299,
    originalPrice: 1999,
    discountPercent: 35,
    rating: 4.5,
    ratingsCount: 45,
    reviewsCount: 12,
    stock: 30,
    colors: ["Black", "Brown", "Navy Blue"],
    material: "Genuine Leather",
    pattern: "Solid",
    specifications: {
      type: "Wallet",
      style: "Bifold",
      usage: "Daily Use",
      closureType: "Button",
      dimensions: {
        height: "10 cm",
        width: "8 cm",
        depth: "2 cm"
      },
      weight: "150g",
      warranty: "1 Year"
    },
    images: [
      "https://via.placeholder.com/600x600?text=Leather+Wallet"
    ],
    description: "Premium genuine leather wallet with RFID blocking technology to protect your cards from electronic theft. Features multiple card slots, cash compartments, and a sleek design.",
    isNewArrival: false,
    onSale: true,
    isFeatured: true,
    inStock: true,
    careInstructions: "Clean with a damp cloth. Avoid exposure to water and direct sunlight.",
  },
};

async function runSeed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Check if products already exist
    const existingWatch = await Watch.countDocuments();
    const existingLens = await Lens.countDocuments();
    const existingAccessory = await Accessory.countDocuments();
    const existingFashion = await Fashion.countDocuments();

    if (existingWatch > 0 || existingLens > 0 || existingAccessory > 0 || existingFashion > 0) {
      console.log('Products already exist in database. Skipping seed.');
      process.exit(0);
    }

    console.log('Seeding products...');

    // Insert products
    const watch = await Watch.create(sampleProducts.watch);
    console.log('✅ Watch created:', watch.name);

    const lens = await Lens.create(sampleProducts.lens);
    console.log('✅ Lens created:', lens.name);

    const fashion = await Fashion.create(sampleProducts.fashion);
    console.log('✅ Fashion item created:', fashion.name);

    const accessory = await Accessory.create(sampleProducts.accessory);
    console.log('✅ Accessory created:', accessory.name);

    console.log('✅ Seeding completed successfully - 4 products added');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

runSeed();

