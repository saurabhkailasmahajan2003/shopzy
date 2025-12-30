import { useState } from 'react';

// --- Polished Icons ---
const ChevronIcon = ({ isOpen }) => (
  <svg 
    className={`w-4 h-4 text-[#3D2817] transition-all duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} 
    fill="none" viewBox="0 0 24 24" stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);


const SortIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
  </svg>
);

const PriceIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BrandIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const SizeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
  </svg>
);

// --- Custom UI Elements ---

const FilterSection = ({ title, isOpen, onToggle, activeCount, children, icon: Icon }) => (
  <div className="border-b border-[#3D2817]/20 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 px-5 group focus:outline-none transition-all duration-200 hover:bg-white/50"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`transition-colors duration-200 ${isOpen ? 'text-[#8B4513]' : 'text-[#3D2817]/50'}`}>
            <Icon />
          </div>
        )}
        <h3 className={`text-sm font-bold text-[#3D2817] uppercase tracking-wide`}>
          {title}
        </h3>
        {activeCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-2 text-[10px] font-bold text-white bg-[#8B4513] rounded-full luxury-shadow-sm">
            {activeCount}
          </span>
        )}
      </div>
      <ChevronIcon isOpen={isOpen} />
    </button>
    
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[600px] opacity-100 pb-4' : 'max-h-0 opacity-0 pb-0'
        }`}
      >
        <div className="px-5 pt-3">
          {children}
        </div>
      </div>
  </div>
);

const CustomCheckbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group py-2.5 px-2 -mx-2 select-none transition-all duration-200 hover:bg-white/40 rounded-md">
    <div className="relative flex-shrink-0">
      <input 
        type="checkbox" 
        className="peer sr-only" 
        checked={checked} 
        onChange={onChange} 
      />
      <div className={`
        w-5 h-5 border-2 transition-all duration-300 ease-out flex items-center justify-center rounded-sm
        ${checked 
          ? 'bg-[#8B4513] border-[#8B4513] luxury-shadow-sm' 
          : 'bg-white border-[#3D2817]/30 group-hover:border-[#8B4513]/50'
        }
      `}>
        <svg className={`w-3.5 h-3.5 text-white transform transition-all duration-300 ${checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <span className={`text-sm font-medium transition-colors duration-200 ${checked ? 'text-[#3D2817] font-semibold' : 'text-[#3D2817]/70'}`}>
      {label}
    </span>
  </label>
);

const CustomRadio = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group py-2.5 px-2 -mx-2 select-none transition-all duration-200 hover:bg-white/40 rounded-md">
    <div className="relative flex items-center flex-shrink-0">
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} />
      <div className={`
        w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center
        ${checked 
          ? 'border-[#8B4513] bg-white' 
          : 'border-[#3D2817]/30 bg-white group-hover:border-[#8B4513]/50'
        }
      `}>
        <div className={`w-2.5 h-2.5 rounded-full bg-[#8B4513] transform transition-all duration-300 ${checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
      </div>
    </div>
    <span className={`text-sm font-medium transition-colors duration-200 ${checked ? 'text-[#3D2817] font-semibold' : 'text-[#3D2817]/70'}`}>
      {label}
    </span>
  </label>
);

// --- Dual Range Slider Component ---
const DualRangeSlider = ({ min, max, value, onChange, minPrice = 0, maxPrice = 5000 }) => {
  const minVal = value?.min || minPrice;
  const maxVal = value?.max === Infinity ? maxPrice : (value?.max || maxPrice);
  
  const range = maxPrice - minPrice;
  const minPercent = ((minVal - minPrice) / range) * 100;
  const maxPercent = ((maxVal - minPrice) / range) * 100;

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), maxVal - 1);
    onChange({ min: newMin, max: maxVal });
  };

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), minVal + 1);
    onChange({ min: minVal, max: newMax });
  };

  return (
    <div className="relative py-6">
      {/* Track Background */}
      <div className="relative h-2 bg-[#3D2817]/10 rounded-full">
        {/* Active Range Fill */}
        <div
          className="absolute h-2 bg-[#8B4513] rounded-full transition-all duration-200"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
      </div>
      
      {/* Min Range Input */}
      <input
        type="range"
        min={minPrice}
        max={maxPrice}
        value={minVal}
        onChange={handleMinChange}
        className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
        style={{ zIndex: minVal > maxVal - (maxPrice - minPrice) / 100 ? 20 : 10 }}
      />
      
      {/* Max Range Input */}
      <input
        type="range"
        min={minPrice}
        max={maxPrice}
        value={maxVal}
        onChange={handleMaxChange}
        className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
        style={{ zIndex: maxVal < minVal + (maxPrice - minPrice) / 100 ? 20 : 10 }}
      />
      
      {/* Custom Thumb Styling via CSS */}
      <style>{`
        .dual-range-slider input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        .dual-range-slider input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #8B4513;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(61, 40, 23, 0.2);
          transition: transform 0.2s;
        }
        .dual-range-slider input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .dual-range-slider input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #8B4513;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(61, 40, 23, 0.2);
          transition: transform 0.2s;
        }
        .dual-range-slider input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.15);
        }
        .dual-range-slider input[type="range"]::-webkit-slider-runnable-track {
          height: 2px;
        }
        .dual-range-slider input[type="range"]::-moz-range-track {
          height: 2px;
          background: transparent;
        }
      `}</style>
      
      {/* Value Display */}
      <div className="flex justify-between mt-4 text-xs font-semibold text-[#3D2817]">
        <span className="bg-white px-2 py-1 rounded border border-[#3D2817]/20">₹{minVal.toLocaleString()}</span>
        <span className="bg-white px-2 py-1 rounded border border-[#3D2817]/20">₹{maxVal.toLocaleString()}</span>
      </div>
    </div>
  );
};

// --- Main Component ---

const FilterSidebar = ({ filters, onFilterChange, onClearFilters, brands = [], sizes = [], priceRange = { min: 0, max: 5000 } }) => {
  const [openSections, setOpenSections] = useState({ sort: true, price: true, brand: true, size: true });
  
  const toggle = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  
  // Handlers
  const update = (key, val) => onFilterChange({ ...filters, [key]: val });
  
  const handleToggleList = (key, item) => {
    const list = filters[key] || [];
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    update(key, newList);
  };

  const getActiveCount = () => {
    let count = 0;
    if (filters.priceRange) count++;
    if (filters.brands?.length) count += filters.brands.length;
    if (filters.sizes?.length) count += filters.sizes.length;
    if (filters.sortBy && filters.sortBy !== 'default') count++;
    return count;
  };

  return (
    <div className="w-full bg-white border border-[#3D2817]/20 overflow-hidden sticky top-[48px] mt-0 max-h-[calc(100vh-48px)] flex flex-col z-50 luxury-shadow-sm rounded-lg">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#3D2817]/20 bg-gradient-to-r from-[#FAF8F5] to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-[#3D2817] uppercase tracking-wide">Filters</h2>
          {getActiveCount() > 0 && (
            <span className="flex items-center justify-center min-w-[22px] h-5 px-2 text-[11px] font-bold text-white bg-[#8B4513] rounded-full luxury-shadow-sm">
              {getActiveCount()}
            </span>
          )}
        </div>
        
        {getActiveCount() > 0 && (
          <button 
            onClick={onClearFilters}
            className="text-xs font-semibold text-[#8B4513] hover:text-[#3D2817] px-3 py-1.5 border border-[#8B4513]/30 bg-white hover:bg-[#8B4513] hover:text-white transition-all duration-200 rounded-md luxury-shadow-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      <div className="py-1 overflow-y-auto flex-1 custom-scrollbar bg-[#FAF8F5]">
        
        {/* Sort Section */}
        <FilterSection 
          title="Sort By" 
          isOpen={openSections.sort} 
          onToggle={() => toggle('sort')}
          activeCount={filters.sortBy && filters.sortBy !== 'default' ? 1 : 0}
          icon={SortIcon}
        >
          <div className="space-y-1">
            {[
              { id: 'default', label: 'Recommended' },
              { id: 'newest', label: 'Newest Arrivals' },
              { id: 'price-low-high', label: 'Price: Low to High' },
              { id: 'price-high-low', label: 'Price: High to Low' },
            ].map((opt) => (
              <CustomRadio
                key={opt.id}
                label={opt.label}
                checked={filters.sortBy === opt.id || (!filters.sortBy && opt.id === 'default')}
                onChange={() => update('sortBy', opt.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Price Section */}
        <FilterSection 
          title="Price Range" 
          isOpen={openSections.price} 
          onToggle={() => toggle('price')}
          activeCount={filters.priceRange ? 1 : 0}
          icon={PriceIcon}
        >
          <div className="space-y-4">
            {/* Dual Range Slider */}
            <div className="bg-white p-4 border border-[#3D2817]/20 rounded-md luxury-shadow-sm dual-range-slider">
              <DualRangeSlider
                min={priceRange.min}
                max={priceRange.max}
                value={filters.priceRange || { min: priceRange.min, max: priceRange.max }}
                onChange={(range) => update('priceRange', range)}
                minPrice={priceRange.min}
                maxPrice={priceRange.max}
              />
            </div>
            
            {/* Manual Input Fields */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B4513] text-sm font-semibold">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => {
                    const newMin = Number(e.target.value) || priceRange.min;
                    update('priceRange', { 
                      ...filters.priceRange, 
                      min: newMin,
                      max: filters.priceRange?.max || priceRange.max
                    });
                  }}
                  className="w-full pl-7 pr-3 py-2.5 text-sm bg-white border border-[#3D2817]/20 focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 text-[#3D2817] font-medium rounded-md transition-all duration-200"
                />
              </div>
              <span className="text-[#3D2817] font-bold text-lg">-</span>
              <div className="relative flex-1 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B4513] text-sm font-semibold">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max === Infinity ? '' : filters.priceRange?.max || ''}
                  onChange={(e) => {
                    const newMax = Number(e.target.value) || priceRange.max;
                    update('priceRange', { 
                      ...filters.priceRange, 
                      max: newMax,
                      min: filters.priceRange?.min || priceRange.min
                    });
                  }}
                  className="w-full pl-7 pr-3 py-2.5 text-sm bg-white border border-[#3D2817]/20 focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/20 text-[#3D2817] font-medium rounded-md transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Brand Section */}
        {brands.length > 0 && (
          <FilterSection 
            title="Brands" 
            isOpen={openSections.brand} 
            onToggle={() => toggle('brand')}
            activeCount={filters.brands?.length || 0}
            icon={BrandIcon}
          >
            <div className="space-y-0.5 max-h-56 overflow-y-auto custom-scrollbar -mr-2 pr-2">
              {brands.map(brand => (
                <CustomCheckbox
                  key={brand}
                  label={brand}
                  checked={(filters.brands || []).includes(brand)}
                  onChange={() => handleToggleList('brands', brand)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Sizes Section */}
        <FilterSection 
          title="Size" 
          isOpen={openSections.size} 
          onToggle={() => toggle('size')}
          activeCount={filters.sizes?.length || 0}
          icon={SizeIcon}
        >
          {sizes.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {sizes.map(size => {
                const isActive = (filters.sizes || []).includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => handleToggleList('sizes', size)}
                    className={`
                      min-w-[44px] h-10 px-3 flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 rounded-md
                      ${isActive 
                        ? 'bg-[#8B4513] text-white border-[#8B4513] luxury-shadow-sm' 
                        : 'bg-white text-[#3D2817] border-[#3D2817]/20 hover:border-[#8B4513]/50 hover:bg-[#FAF8F5]'
                      }
                    `}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-[#3D2817]/70 py-2">
              No sizes available for these products
            </div>
          )}
        </FilterSection>
      </div>

      {/* Styled Scrollbar CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #FAF8F5;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8B4513;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3D2817;
        }
      `}</style>
    </div>
  );
};

export default FilterSidebar;