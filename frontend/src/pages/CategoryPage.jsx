import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../utils/api';

const CategoryPage = () => {
  const { gender, category } = useParams();
  const location = useLocation();
  const pathname = location.pathname;
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [pathname, gender, category]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      let response = null;

      // Determine which API to call based on route
      if (pathname === '/watches') {
        response = await productAPI.getWatches();
        setPageTitle('Watches');
      } else if (pathname === '/lenses') {
        response = await productAPI.getLenses();
        setPageTitle('Lenses & Spectacles');
      } else if (pathname === '/men') {
        // Fetch fashion items for men
        response = await productAPI.getFashionItems({ gender: 'men' });
        setPageTitle("Men's Collection");
      } else if (pathname === '/women') {
        // Fetch fashion items for women
        response = await productAPI.getFashionItems({ gender: 'women' });
        setPageTitle("Women's Collection");
      } else if (gender && category) {
        // Handle subcategories like /men/shirt, /women/tshirt, /men/accessories
        // Map URL category to subCategory value
        const categoryMap = {
          'shirt': 'shirt',
          'tshirt': 'tshirt',
          't-shirt': 'tshirt',
          'jeans': 'jeans',
          'trousers': 'trousers',
          'accessories': 'accessories',
        };

        const subCategory = categoryMap[category.toLowerCase()];
        
        if (subCategory) {
          // Always fetch from fashion collection for men/women subcategories
          response = await productAPI.getFashionItems({ gender, subCategory });
          
          // Format category name for display
          const categoryDisplayName = subCategory === 'tshirt' 
            ? 'T-Shirt' 
            : subCategory.charAt(0).toUpperCase() + subCategory.slice(1);
          
          setPageTitle(`${gender.charAt(0).toUpperCase() + gender.slice(1)}'s ${categoryDisplayName}`);
        }
      } else {
        // Default: try to get all products
        response = await productAPI.getAllProducts();
        setPageTitle('All Products');
      }

      if (response && response.success) {
        setProducts(response.data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Normalize product for display
  const normalizeProduct = (product) => {
    return {
      ...product,
      id: product._id || product.id,
      images: product.images || [product.image || product.thumbnail],
      image: product.images?.[0] || product.image || product.thumbnail,
      price: product.finalPrice || product.price,
      originalPrice: product.originalPrice || product.mrp || product.price,
      rating: product.rating || 0,
      reviews: product.reviewsCount || product.reviews || 0,
      category: product.category,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{pageTitle}</h1>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
