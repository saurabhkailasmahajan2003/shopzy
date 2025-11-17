// Helper function to generate multiple images
const generateImages = (baseImage, count = 3) => {
  const images = [baseImage];
  for (let i = 1; i < count; i++) {
    // Generate variations by changing image parameters
    images.push(baseImage.replace('?w=400', `?w=400&v=${i}`));
  }
  return images;
};

// Mock product data
export const products = [
  // Men's Shirts
  { 
    id: 1, 
    name: 'Colorblock Casual Jacket', 
    category: 'shirt', 
    gender: 'men', 
    price: 468, 
    originalPrice: 2599,
    image: 'https://images.unsplash.com/photo-1594938291221-94f3133915f8?w=400', 
    images: generateImages('https://images.unsplash.com/photo-1594938291221-94f3133915f8?w=400', 3),
    vendor: 'MOTREX', 
    brand: 'MOTREX',
    rating: 4.5, 
    reviews: 120,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#3B82F6', '#EF4444']
  },
  { 
    id: 2, 
    name: 'Men\'s Casual Shirt', 
    category: 'shirt', 
    gender: 'men', 
    price: 899, 
    originalPrice: 1999,
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400', 
    images: generateImages('https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400', 3),
    vendor: 'Brand B', 
    brand: 'Brand B',
    rating: 4.3, 
    reviews: 89,
    sizes: ['M', 'L', 'XL'],
    colors: ['#1F2937', '#DC2626', '#2563EB']
  },
  { 
    id: 3, 
    name: 'Men\'s Checkered Shirt', 
    category: 'shirt', 
    gender: 'men', 
    price: 1099, 
    originalPrice: 2299,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 
    images: generateImages('https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 3),
    vendor: 'Brand C', 
    brand: 'Brand C',
    rating: 4.7, 
    reviews: 156,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#059669', '#7C3AED']
  },
  
  // Men's T-shirts
  { id: 4, name: 'Men\'s Cotton T-Shirt', category: 'tshirt', gender: 'men', price: 499, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', vendor: 'Brand A', rating: 4.4, reviews: 234 },
  { id: 5, name: 'Men\'s Polo T-Shirt', category: 'tshirt', gender: 'men', price: 699, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', vendor: 'Brand B', rating: 4.6, reviews: 178 },
  { id: 6, name: 'Men\'s V-Neck T-Shirt', category: 'tshirt', gender: 'men', price: 449, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', vendor: 'Brand C', rating: 4.2, reviews: 145 },
  
  // Men's Jeans
  { id: 7, name: 'Men\'s Slim Fit Jeans', category: 'jeans', gender: 'men', price: 1499, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', vendor: 'Brand A', rating: 4.5, reviews: 267 },
  { id: 8, name: 'Men\'s Regular Fit Jeans', category: 'jeans', gender: 'men', price: 1299, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', vendor: 'Brand B', rating: 4.3, reviews: 189 },
  { id: 9, name: 'Men\'s Skinny Jeans', category: 'jeans', gender: 'men', price: 1599, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', vendor: 'Brand C', rating: 4.7, reviews: 312 },
  
  // Men's Trousers
  { id: 10, name: 'Men\'s Formal Trousers', category: 'trousers', gender: 'men', price: 1799, image: 'https://images.unsplash.com/photo-1594938291221-94f3133915f8?w=400', vendor: 'Brand A', rating: 4.6, reviews: 198 },
  { id: 11, name: 'Men\'s Chinos', category: 'trousers', gender: 'men', price: 1399, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', vendor: 'Brand B', rating: 4.4, reviews: 156 },
  { id: 12, name: 'Men\'s Cargo Trousers', category: 'trousers', gender: 'men', price: 1599, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', vendor: 'Brand C', rating: 4.5, reviews: 223 },
  
  // Men's Accessories
  { id: 13, name: 'Men\'s Leather Belt', category: 'accessories', gender: 'men', price: 799, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=400', vendor: 'Brand A', rating: 4.5, reviews: 134 },
  { id: 14, name: 'Men\'s Wallet', category: 'accessories', gender: 'men', price: 599, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', vendor: 'Brand B', rating: 4.3, reviews: 98 },
  { id: 15, name: 'Men\'s Watch Strap', category: 'accessories', gender: 'men', price: 399, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', vendor: 'Brand C', rating: 4.2, reviews: 67 },
  
  // Women's Shirts
  { id: 16, name: 'Women\'s Formal Shirt', category: 'shirt', gender: 'women', price: 1199, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', vendor: 'Brand A', rating: 4.6, reviews: 145 },
  { id: 17, name: 'Women\'s Casual Shirt', category: 'shirt', gender: 'women', price: 999, image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400', vendor: 'Brand B', rating: 4.4, reviews: 112 },
  { id: 18, name: 'Women\'s Oversized Shirt', category: 'shirt', gender: 'women', price: 1099, image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400', vendor: 'Brand C', rating: 4.7, reviews: 178 },
  
  // Women's T-shirts
  { id: 19, name: 'Women\'s Cotton T-Shirt', category: 'tshirt', gender: 'women', price: 449, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', vendor: 'Brand A', rating: 4.5, reviews: 267 },
  { id: 20, name: 'Women\'s Crop T-Shirt', category: 'tshirt', gender: 'women', price: 549, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', vendor: 'Brand B', rating: 4.6, reviews: 189 },
  { id: 21, name: 'Women\'s V-Neck T-Shirt', category: 'tshirt', gender: 'women', price: 399, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', vendor: 'Brand C', rating: 4.3, reviews: 156 },
  
  // Women's Jeans
  { id: 22, name: 'Women\'s Skinny Jeans', category: 'jeans', gender: 'women', price: 1399, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', vendor: 'Brand A', rating: 4.6, reviews: 312 },
  { id: 23, name: 'Women\'s High Waist Jeans', category: 'jeans', gender: 'women', price: 1499, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', vendor: 'Brand B', rating: 4.7, reviews: 278 },
  { id: 24, name: 'Women\'s Straight Fit Jeans', category: 'jeans', gender: 'women', price: 1299, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', vendor: 'Brand C', rating: 4.5, reviews: 234 },
  
  // Women's Trousers
  { id: 25, name: 'Women\'s Formal Trousers', category: 'trousers', gender: 'women', price: 1599, image: 'https://images.unsplash.com/photo-1594938291221-94f3133915f8?w=400', vendor: 'Brand A', rating: 4.6, reviews: 198 },
  { id: 26, name: 'Women\'s Palazzo', category: 'trousers', gender: 'women', price: 1199, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', vendor: 'Brand B', rating: 4.4, reviews: 167 },
  { id: 27, name: 'Women\'s Joggers', category: 'trousers', gender: 'women', price: 999, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', vendor: 'Brand C', rating: 4.5, reviews: 189 },
  
  // Women's Accessories
  { id: 28, name: 'Women\'s Handbag', category: 'accessories', gender: 'women', price: 1999, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400', vendor: 'Brand A', rating: 4.7, reviews: 234 },
  { id: 29, name: 'Women\'s Scarf', category: 'accessories', gender: 'women', price: 499, image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', vendor: 'Brand B', rating: 4.3, reviews: 145 },
  { id: 30, name: 'Women\'s Belt', category: 'accessories', gender: 'women', price: 699, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=400', vendor: 'Brand C', rating: 4.5, reviews: 112 },
  
  // Watches
  { id: 31, name: 'Smart Watch', category: 'watch', gender: 'unisex', price: 4999, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', vendor: 'Tech Brand', rating: 4.8, reviews: 456 },
  { id: 32, name: 'Analog Watch', category: 'watch', gender: 'unisex', price: 2999, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', vendor: 'Classic Brand', rating: 4.6, reviews: 312 },
  { id: 33, name: 'Digital Watch', category: 'watch', gender: 'unisex', price: 1999, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', vendor: 'Sport Brand', rating: 4.5, reviews: 278 },
  { id: 34, name: 'Luxury Watch', category: 'watch', gender: 'unisex', price: 9999, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', vendor: 'Premium Brand', rating: 4.9, reviews: 189 },
  
  // Lenses/Spectacles
  { id: 35, name: 'Blue Light Glasses', category: 'lenses', gender: 'unisex', price: 1499, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', vendor: 'Optical Brand', rating: 4.6, reviews: 234 },
  { id: 36, name: 'Reading Glasses', category: 'lenses', gender: 'unisex', price: 999, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', vendor: 'Optical Brand', rating: 4.4, reviews: 178 },
  { id: 37, name: 'Sunglasses', category: 'lenses', gender: 'unisex', price: 1999, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', vendor: 'Optical Brand', rating: 4.7, reviews: 312 },
  { id: 38, name: 'Prescription Glasses', category: 'lenses', gender: 'unisex', price: 2499, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', vendor: 'Optical Brand', rating: 4.8, reviews: 267 },
];

// Normalize all products to have required fields
const normalizedProducts = products.map((product) => ({
  ...product,
  images: product.images || generateImages(product.image, 3),
  sizes: product.sizes || ['S', 'M', 'L', 'XL'],
  colors: product.colors || ['#000000', '#3B82F6', '#EF4444'],
  brand: product.brand || product.vendor || 'Brand',
  originalPrice: product.originalPrice || Math.round(product.price * (2 + Math.random() * 2)),
}));

export const getProductsByCategory = (category, gender = null) => {
  if (gender) {
    return normalizedProducts.filter(p => p.category === category && p.gender === gender);
  }
  return normalizedProducts.filter(p => p.category === category);
};

export const getProductById = (id) => {
  return normalizedProducts.find(p => p.id === parseInt(id));
};

export const getProductsByGender = (gender) => {
  return normalizedProducts.filter(p => p.gender === gender || p.gender === 'unisex');
};

// Export normalized products as default
export default normalizedProducts;

