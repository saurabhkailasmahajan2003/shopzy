import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import StickyCartSummary from '../components/StickyCartSummary';
import { productAPI } from '../utils/api';

const CategoryPage = () => {
  const { gender, category } = useParams();
  const location = useLocation();
  const pathname = location.pathname;
  
  // State for Data
  const [allProducts, setAllProducts] = useState([]); // Raw Data from API
  const [filteredList, setFilteredList] = useState([]); // Data after Filters apply
  const [products, setProducts] = useState([]); // Data currently Visible (Rendered)
  
  const [isLoading, setIsLoading] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  
  // State for Pagination & Filters
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    priceRange: null,
    brands: [],
    sizes: [],
    sortBy: null,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(true); // Desktop filter visibility
  const [isMobile, setIsMobile] = useState(false);

  const pathSegments = pathname.split('/').filter(Boolean);
  const genderFromPath = pathSegments[0] === 'women' ? 'women' : null;
  const derivedGender = (gender ? gender.toLowerCase() : null) || genderFromPath;
  const derivedCategory = category || pathSegments[1] || null;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 1. Initial Data Fetch
  useEffect(() => {
    fetchProducts();
    // Reset filters when category changes
    // Set default sort to price low-to-high for shoes, shirts, and t-shirts sections
    const defaultSort = (pathname === '/shoes' || pathname === '/women/shirt' || pathname === '/women/tshirt') ? 'price-low-high' : null;
    setFilters({
      priceRange: null,
      brands: [],
      sizes: [],
      sortBy: defaultSort,
    });
  }, [pathname, gender, category, location.search]);

  // 2. Filter Logic (Updates filteredList)
  useEffect(() => {
    let filtered = [...allProducts];

    // Skincare category filtering (from query parameter)
    if (pathname === '/skincare') {
      const urlParams = new URLSearchParams(location.search);
      const categoryParam = urlParams.get('category');
      if (categoryParam) {
        filtered = filtered.filter(product => {
          // For skincare, the category field in the database maps to subCategory in normalized product
          const productCategory = (product.subCategory || product.category || '').toLowerCase().trim();
          const expectedCategory = categoryParam.toLowerCase().trim();
          return productCategory === expectedCategory;
        });
      }
    }

    // Subcategory Filtering (for women's products)
    if (derivedGender && derivedCategory) {
      const categoryMap = {
        'shirt': { subCategory: 'shirt', displayName: 'Shirt' },
        'tshirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        't-shirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        'jeans': { subCategory: 'jeans', displayName: 'Jeans' },
        'trousers': { subCategory: 'trousers', displayName: 'Trousers' },
        'saree': { subCategory: 'saree', displayName: 'Saree' },
        'sari': { subCategory: 'saree', displayName: 'Saree' },
        'accessories': { subCategory: 'accessories', displayName: 'Accessories' },
      };
      const categoryInfo = categoryMap[derivedCategory.toLowerCase()];
      
      if (categoryInfo) {
        filtered = filtered.filter(product => {
          const productSubCategory = (product.subCategory || '').toLowerCase().trim().replace(/-/g, '');
          const expectedSubCategory = categoryInfo.subCategory.toLowerCase().trim().replace(/-/g, '');
          return productSubCategory === expectedSubCategory;
        });
      }
    }

    // Price Filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.finalPrice || product.price;
        const { min, max } = filters.priceRange;
        return price >= min && (max === Infinity || price <= max);
      });
    }

    // Brand Filter
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.brand)
      );
    }

    // Size Filter
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.sizes || !Array.isArray(product.sizes)) return false;
        return filters.sizes.some(size => product.sizes.includes(size));
      });
    }

    // Sort
    // Apply default sort for shoes, shirts, and t-shirts (price low-to-high) if no sort is selected
    const sortToApply = filters.sortBy || ((pathname === '/shoes' || pathname === '/women/shirt' || pathname === '/women/tshirt') ? 'price-low-high' : null);
    if (sortToApply && sortToApply !== 'default') {
      filtered.sort((a, b) => {
        const priceA = a.finalPrice || a.price;
        const priceB = b.finalPrice || b.price;

        switch (sortToApply) {
          case 'price-low-high': return priceA - priceB;
          case 'price-high-low': return priceB - priceA;
          case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          default: return 0;
        }
      });
    }

    setFilteredList(filtered);
    setPage(1); // Reset to page 1 when filters change
  }, [allProducts, filters, derivedGender, derivedCategory, pathname, location.search]);

  // Reset to page 1 when filter visibility changes (items per page changes)
  useEffect(() => {
    setPage(1);
  }, [showFilters]);

  // Calculate items per page based on device and filter visibility
  const itemsPerPage = isMobile ? 22 : (showFilters ? 21 : 28);

  // 3. Pagination Logic (Updates visible products)
  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setProducts(filteredList.slice(startIndex, endIndex));
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filteredList, page, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (page <= 3) {
        // Show first 5 pages
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        // Show last 5 pages
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current page
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      let response = null;

      // Get gender from query params if available
      const urlParams = new URLSearchParams(location.search);
      const genderParam = urlParams.get('gender');

      const activeGender =
        (gender ? gender.toLowerCase() : null) ||
        (genderParam ? genderParam.toLowerCase() : null) ||
        genderFromPath;

      const normalizedCategory = category || pathSegments[1] || null;

      // Determine which API to call based on route
      // Use a high limit to fetch all products (1000 should be enough for most cases)
      const fetchLimit = 1000;
      
      if (pathname === '/watches') {
        const params = { ...(genderParam ? { gender: genderParam } : {}), limit: fetchLimit };
        response = await productAPI.getWatches(params);
        setPageTitle(genderParam ? `${genderParam.charAt(0).toUpperCase() + genderParam.slice(1)}'s Watches` : 'Watches');
      } else if (pathname === '/lenses') {
        const params = { ...(genderParam ? { gender: genderParam } : {}), limit: fetchLimit };
        response = await productAPI.getLenses(params);
        setPageTitle(genderParam ? `${genderParam.charAt(0).toUpperCase() + genderParam.slice(1)}'s Lenses` : 'Lenses & Spectacles');
      } else if (pathname === '/accessories') {
        const urlParams = new URLSearchParams(location.search);
        const subCategoryParam = urlParams.get('subCategory');
        const params = { 
          ...(genderParam ? { gender: genderParam } : {}), 
          ...(subCategoryParam ? { subCategory: subCategoryParam } : {}),
          limit: fetchLimit 
        };
        response = await productAPI.getAccessories(params);
        if (subCategoryParam) {
          const subCategoryName = subCategoryParam.charAt(0).toUpperCase() + subCategoryParam.slice(1);
          setPageTitle(genderParam ? `${genderParam.charAt(0).toUpperCase() + genderParam.slice(1)}'s ${subCategoryName}` : subCategoryName);
        } else {
          setPageTitle(genderParam ? `${genderParam.charAt(0).toUpperCase() + genderParam.slice(1)}'s Accessories` : 'Accessories');
        }
      } else if (pathname === '/shoes') {
        const urlParams = new URLSearchParams(location.search);
        const subCategoryParam = urlParams.get('subCategory');
        const subSubCategoryParam = urlParams.get('subSubCategory');
        const params = { 
          ...(genderParam ? { gender: genderParam } : {}), 
          ...(subCategoryParam ? { subCategory: subCategoryParam } : {}),
          ...(subSubCategoryParam ? { subSubCategory: subSubCategoryParam } : {}),
          limit: fetchLimit 
        };
        response = await productAPI.getShoes(params);
        console.log('[CategoryPage] Shoes API Response:', response);
        if (response && response.success) {
          console.log('[CategoryPage] Shoes products count:', response.data?.products?.length || 0);
        }
        if (subSubCategoryParam) {
          const subSubCategoryName = subSubCategoryParam.charAt(0).toUpperCase() + subSubCategoryParam.slice(1);
          setPageTitle(subSubCategoryName);
        } else if (subCategoryParam) {
          const subCategoryName = subCategoryParam.charAt(0).toUpperCase() + subCategoryParam.slice(1);
          setPageTitle(subCategoryName);
        } else {
          setPageTitle("Women's Shoes");
        }
      } else if (pathname === '/skincare') {
        const urlParams = new URLSearchParams(location.search);
        const categoryParam = urlParams.get('category');
        const params = { ...(categoryParam ? { category: categoryParam } : {}), limit: fetchLimit };
        response = await productAPI.getSkincareProducts(params);
        if (categoryParam) {
          const categoryName = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
          setPageTitle(`${categoryName} - Skincare`);
        } else {
          setPageTitle('Skincare');
        }
      } else if (pathname === '/women') {
        response = await productAPI.getWomenItems({ limit: fetchLimit });
        setPageTitle("Women's Collection");
      } else if (activeGender && normalizedCategory) {
      const categoryMap = {
        'shirt': { subCategory: 'shirt', displayName: 'Shirt' },
        'tshirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        't-shirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        'jeans': { subCategory: 'jeans', displayName: 'Jeans' },
        'trousers': { subCategory: 'trousers', displayName: 'Trousers' },
        'saree': { subCategory: 'saree', displayName: 'Saree' },
        'sari': { subCategory: 'saree', displayName: 'Saree' },
        'accessories': { subCategory: 'accessories', displayName: 'Accessories' },
      };

        const categoryInfo = categoryMap[normalizedCategory.toLowerCase()];
        
        if (categoryInfo && activeGender === 'women') {
          response = await productAPI.getWomenItems({ subCategory: categoryInfo.subCategory, limit: fetchLimit });
          
          if (response && response.success && response.data.products) {
            const filteredProducts = response.data.products.filter(product => {
              const productSubCategory = (product.subCategory || '').toLowerCase().trim().replace(/-/g, '');
              const expectedSubCategory = categoryInfo.subCategory.toLowerCase().trim().replace(/-/g, '');
              return productSubCategory === expectedSubCategory;
            });
            response.data.products = filteredProducts;
          }
          
          const genderDisplay = activeGender.charAt(0).toUpperCase() + activeGender.slice(1);
          setPageTitle(`${genderDisplay}'s ${categoryInfo.displayName}`);
        } else {
          setPageTitle('Category Not Found');
          setAllProducts([]);
          setIsLoading(false);
          return;
        }
      } else {
        response = await productAPI.getAllProducts({ limit: fetchLimit });
        setPageTitle('All Products');
      }

      if (response && response.success) {
        setAllProducts(response.data.products || []);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const brands = useMemo(() => {
    const brandSet = new Set();
    allProducts.forEach(product => {
      if (product.brand) brandSet.add(product.brand);
    });
    return Array.from(brandSet).sort();
  }, [allProducts]);

  const sizes = useMemo(() => {
    const sizeSet = new Set();
    allProducts.forEach(product => {
      if (product.sizes && Array.isArray(product.sizes)) {
        product.sizes.forEach(size => sizeSet.add(size));
      }
    });
    return Array.from(sizeSet).sort();
  }, [allProducts]);

  const priceRange = useMemo(() => {
    if (allProducts.length === 0) {
      return { min: 0, max: 5000 };
    }
    const prices = allProducts.map(product => product.finalPrice || product.price || 0).filter(p => p > 0);
    if (prices.length === 0) {
      return { min: 0, max: 5000 };
    }
    const min = Math.floor(Math.min(...prices));
    const max = Math.min(Math.ceil(Math.max(...prices)), 5000); // Cap at 5000
    // Round to nearest 100 for better UX
    return {
      min: Math.floor(min / 100) * 100,
      max: Math.min(Math.ceil(max / 100) * 100, 5000)
    };
  }, [allProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: null,
      brands: [],
      sizes: [],
      sortBy: null,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        
        {/* Header Row - Breadcrumb, Title, and Product Count */}
        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
              {/* Breadcrumb Navigation */}
              {(derivedGender || pathname === '/women') && (
                <nav className="text-xs sm:text-sm">
                  <ol className="flex items-center space-x-1 sm:space-x-2 text-[#3D2817]/60">
                    <li>
                      <Link to="/" className="hover:text-[#3D2817] transition-colors">
                        Home
                      </Link>
                    </li>
                    <li className="text-[#3D2817]/40">/</li>
                    {derivedGender && (
                      <>
                        <li>
                          <Link to={`/${derivedGender}`} className="hover:text-[#3D2817] transition-colors capitalize">
                            {derivedGender}
                          </Link>
                        </li>
                        {category && (
                          <>
                            <li className="text-[#3D2817]/40">/</li>
                            <li className="text-[#3D2817] capitalize">
                              {category === 'tshirt' ? 'T-Shirt' : category}
                            </li>
                          </>
                        )}
                      </>
                    )}
                    {!derivedGender && pathname === '/women' && (
                      <li className="text-[#3D2817] capitalize">
                        {pathname.replace('/', '')}
                      </li>
                    )}
                  </ol>
                </nav>
              )}
              
              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#3D2817]">
                {isLoading && !pageTitle ? 'Loading...' : pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {/* Product Count */}
              {!isLoading && filteredList.length > 0 && (
                <p className="text-xs sm:text-sm text-[#3D2817]/60 whitespace-nowrap">
                  Showing {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, filteredList.length)} of {filteredList.length} products
                </p>
              )}
              
              {/* Filter Toggle Button */}
              <button
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    setShowFilters(!showFilters);
                  } else {
                    setShowMobileFilters(!showMobileFilters);
                  }
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#FAF8F5] border-2 border-[#3D2817]/30 text-xs sm:text-sm font-medium text-[#3D2817] hover:bg-[#3D2817] hover:text-[#fefcfb] transition-colors whitespace-nowrap"
                disabled={isLoading}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="hidden lg:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                <span className="lg:hidden">Filters</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 relative">
          {/* Filter Sidebar */}
          <div className={`
            ${showMobileFilters ? 'block' : 'hidden'} 
            ${showFilters ? 'lg:block' : 'lg:hidden'}
            w-full 
            lg:w-1/4 
            lg:flex-shrink-0
            lg:transition-all lg:duration-300 lg:ease-in-out
            ${showMobileFilters ? 'fixed top-14 left-0 right-0 bottom-0 z-40 bg-[#FAF8F5] p-4 sm:p-6 overflow-y-auto lg:relative lg:z-auto lg:bg-transparent lg:p-0 lg:top-0' : ''}
          `}>
             {showMobileFilters && (
               <div className="lg:hidden flex items-center justify-between mb-4 sm:mb-6">
                 <h2 className="text-lg sm:text-xl font-bold text-[#3D2817]">Filters</h2>
                 <button onClick={() => setShowMobileFilters(false)} className="text-[#3D2817] hover:opacity-70 transition-opacity">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
             )}

             {/* Sidebar Component */}
             <FilterSidebar
               filters={filters}
               onFilterChange={(newFilters) => {
                 handleFilterChange(newFilters);
                 if (window.innerWidth >= 1024) setShowMobileFilters(false);
               }}
               onClearFilters={() => {
                 handleClearFilters();
                 if (window.innerWidth >= 1024) setShowMobileFilters(false);
               }}
               onCloseMobile={() => setShowMobileFilters(false)}
               brands={brands}
               sizes={sizes}
               priceRange={priceRange}
             />
          </div>

          {/* Products Grid Area */}
          <div className={`
            flex-1 w-full lg:w-auto 
            lg:transition-all lg:duration-500 lg:ease-[cubic-bezier(0.25,0.1,0.25,1)]
            ${showFilters ? 'lg:translate-y-0' : 'lg:-translate-y-2'}
          `}>
            {isLoading ? null : (
              products.length > 0 ? (
                <>
                  {/* Subcategories Section - Above Product Cards */}
                  {(() => {
                    const getSubcategories = () => {
                      if (pathname === '/accessories' || pathname.startsWith('/accessories')) {
                        return [
                          { name: 'Accessories Collection', path: '/accessories', key: 'collection' },
                          { name: 'Wallets & Belts', path: '/accessories?type=general', key: 'wallets' },
                          { name: 'Earrings', path: '/accessories?subCategory=earrings', key: 'earrings' },
                        ];
                      } else if (pathname === '/women' || pathname.startsWith('/women/')) {
                        return [
                          { name: 'Shirts', path: '/women/shirt', key: 'shirt' },
                          { name: 'T-Shirts', path: '/women/tshirt', key: 'tshirt' },
                          { name: 'Jeans', path: '/women/jeans', key: 'jeans' },
                          { name: 'Trousers', path: '/women/trousers', key: 'trousers' },
                          { name: 'Saree', path: '/women/saree', key: 'saree' },
                        ];
                      } else if (pathname === '/shoes' || pathname.startsWith('/shoes')) {
                        return [
                          { name: 'All Shoes', path: '/shoes', key: 'all' },
                          { name: 'Heels', path: '/shoes?subCategory=Heels', key: 'heels' },
                          { name: 'Flats', path: '/shoes?subCategory=Flats', key: 'flats' },
                          { name: 'Boots', path: '/shoes?subCategory=Boots', key: 'boots' },
                          { name: 'Sandals', path: '/shoes?subCategory=Sandals', key: 'sandals' },
                        ];
                      } else if (pathname === '/watches' || pathname.startsWith('/watches')) {
                        return [
                          { name: 'Classic Watches', path: '/watches?gender=women', key: 'classic' },
                          { name: 'Smart Watches', path: '/watches?type=smart', key: 'smart' },
                        ];
                      } else if (pathname === '/lenses' || pathname.startsWith('/lenses')) {
                        return [
                          { name: 'Eyewear Collection', path: '/lenses?gender=women', key: 'eyewear' },
                          { name: 'Sunglasses', path: '/lenses?type=sun', key: 'sunglasses' },
                        ];
                      } else if (pathname === '/skincare' || pathname.startsWith('/skincare')) {
                        return [
                          { name: 'Serum', path: '/skincare?category=serum', key: 'serum' },
                          { name: 'Facewash', path: '/skincare?category=facewash', key: 'facewash' },
                          { name: 'Sunscreen', path: '/skincare?category=sunscreen', key: 'sunscreen' },
                          { name: 'Moisturizer', path: '/skincare?category=moisturizer', key: 'moisturizer' },
                          { name: 'Cleanser', path: '/skincare?category=cleanser', key: 'cleanser' },
                        ];
                      }
                      return [];
                    };

                    const subcategories = getSubcategories();
                    if (subcategories.length === 0) return null;

                    return (
                      <div className="mb-4 sm:mb-6 pb-4 border-b border-[#3D2817]/20">
                        <p className="text-xs sm:text-sm uppercase tracking-wide text-[#3D2817]/60 font-semibold mb-3">Subcategories</p>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {subcategories.map((sub) => {
                            const isActive = location.pathname === sub.path || 
                                           (sub.path.includes('?') && location.pathname + location.search === sub.path) ||
                                           (derivedCategory && sub.key === derivedCategory);
                            
                            return (
                              <Link
                                key={sub.key}
                                to={sub.path}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold border-2 rounded-lg transition-colors ${
                                  isActive 
                                    ? 'bg-[#3D2817] text-[#fefcfb] border-[#3D2817]' 
                                    : 'text-[#3D2817] border-[#3D2817]/30 hover:bg-[#3D2817] hover:text-[#fefcfb]'
                                }`}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 ${showFilters ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-4 xl:grid-cols-5'}`}>
                    {products.map((product) => (
                      <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                        {/* Previous Button */}
                        <button
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#3D2817] bg-[#FAF8F5] border-2 border-[#3D2817]/30 hover:bg-[#3D2817] hover:text-[#fefcfb] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FAF8F5] disabled:hover:text-[#3D2817] transition-all"
                        >
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">Prev</span>
                          </span>
                        </button>

                        {/* Page Numbers */}
                        {getPageNumbers().map((pageNum, index) => {
                          if (pageNum === '...') {
                            return (
                              <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-[#3D2817]/60 text-xs sm:text-sm">
                                ...
                              </span>
                            );
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`min-w-[32px] sm:min-w-[40px] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold border-2 transition-all ${
                                page === pageNum
                                  ? 'bg-[#3D2817] text-[#fefcfb] border-[#3D2817]/30'
                                  : 'text-[#3D2817] bg-[#FAF8F5] border-[#3D2817]/30 hover:bg-[#3D2817] hover:text-[#fefcfb]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        {/* Next Button */}
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === totalPages}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#3D2817] bg-[#FAF8F5] border-2 border-[#3D2817]/30 hover:bg-[#3D2817] hover:text-[#fefcfb] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FAF8F5] disabled:hover:text-[#3D2817] transition-all"
                        >
                          <span className="flex items-center gap-1">
                            <span className="hidden sm:inline">Next</span>
                            <span className="sm:hidden">Next</span>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </button>
                      </div>

                      {/* Page Info */}
                      <p className="text-xs sm:text-sm text-[#3D2817]/60">
                        Page {page} of {totalPages}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-4">No products found matching your filters.</p>
                  {filters.priceRange || filters.brands?.length > 0 || filters.sizes?.length > 0 ? (
                    <button
                      onClick={handleClearFilters}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear filters to see all products
                    </button>
                  ) : (derivedGender || pathname === '/women') ? (
                    <Link
                      to={`/${derivedGender || 'women'}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      ← Back to {derivedGender ? `${derivedGender.charAt(0).toUpperCase() + derivedGender.slice(1)}'s Collection` : "Women's Collection"}
                    </Link>
                  ) : null}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Sticky Cart Summary - Fixed at bottom until footer */}
      <StickyCartSummary />
    </div>
  );
};

export default CategoryPage;