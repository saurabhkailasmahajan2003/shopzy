import { useState } from 'react';

// --- Polished Icons ---
const ChevronIcon = ({ isOpen }) => (
  <svg 
    className={`w-4 h-4 text-[#120e0f] transition-all duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} 
    fill="none" viewBox="0 0 24 24" stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);


const SortIcon = () => (
  <svg className="w-4 h-4 text-[#120e0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
  </svg>
);

const PriceIcon = () => (
  <svg className="w-4 h-4 text-[#120e0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BrandIcon = () => (
  <svg className="w-4 h-4 text-[#120e0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const SizeIcon = () => (
  <svg className="w-4 h-4 text-[#120e0f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
  </svg>
);

// --- Custom UI Elements ---

const FilterSection = ({ title, isOpen, onToggle, activeCount, children, icon: Icon }) => (
  <div className="border-b-2 border-[#120e0f] last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 px-4 group focus:outline-none transition-opacity hover:opacity-70"
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <div className={`transition-colors duration-200 ${isOpen ? 'text-[#120e0f]' : 'text-[#120e0f]/60'}`}>
            <Icon />
          </div>
        )}
        <h3 className={`text-sm font-bold text-[#120e0f] uppercase tracking-tight`}>
          {title}
        </h3>
        {activeCount > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-4 px-1.5 text-[10px] font-bold text-[#fefcfb] bg-[#120e0f]">
            {activeCount}
          </span>
        )}
      </div>
      <ChevronIcon isOpen={isOpen} />
    </button>
    
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[600px] opacity-100 pb-3' : 'max-h-0 opacity-0 pb-0'
        }`}
      >
        <div className="px-4 pt-2">
          {children}
        </div>
      </div>
  </div>
);

const CustomCheckbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group py-2 px-2 -mx-2 select-none transition-opacity hover:opacity-70">
    <div className="relative flex-shrink-0">
      <input 
        type="checkbox" 
        className="peer sr-only" 
        checked={checked} 
        onChange={onChange} 
      />
      <div className={`
        w-5 h-5 border-2 border-[#120e0f] transition-all duration-300 ease-out flex items-center justify-center
        ${checked 
          ? 'bg-[#120e0f]' 
          : 'bg-[#fefcfb]'
        }
      `}>
        <svg className={`w-3.5 h-3.5 text-[#fefcfb] transform transition-all duration-300 ${checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <span className={`text-sm font-medium ${checked ? 'text-[#120e0f]' : 'text-[#120e0f]/70'}`}>
      {label}
    </span>
  </label>
);

const CustomRadio = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group py-2 px-2 -mx-2 select-none transition-opacity hover:opacity-70">
    <div className="relative flex items-center flex-shrink-0">
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} />
      <div className={`
        w-5 h-5 rounded-full border-2 border-[#120e0f] transition-all duration-300 flex items-center justify-center
        ${checked ? 'bg-[#fefcfb]' : 'bg-[#fefcfb]'}
      `}>
        <div className={`w-2.5 h-2.5 rounded-full bg-[#120e0f] transform transition-all duration-300 ${checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
      </div>
    </div>
    <span className={`text-sm font-medium ${checked ? 'text-[#120e0f]' : 'text-[#120e0f]/70'}`}>
      {label}
    </span>
  </label>
);

// --- Main Component ---

const FilterSidebar = ({ filters, onFilterChange, onClearFilters, brands = [], sizes = [] }) => {
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
    <div className="w-full bg-[#fefcfb] border-2 border-[#120e0f] overflow-hidden sticky top-[48px] mt-0 max-h-[calc(100vh-48px)] flex flex-col z-50">
      
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-[#120e0f] bg-[#fefcfb] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-[#120e0f]">Filters</h2>
          {getActiveCount() > 0 && (
            <span className="text-xs text-[#120e0f]/70">({getActiveCount()})</span>
          )}
        </div>
        
        {getActiveCount() > 0 && (
          <button 
            onClick={onClearFilters}
            className="text-xs font-medium text-[#120e0f] hover:opacity-70 px-2 py-1 border-2 border-[#120e0f] bg-transparent transition-opacity"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      <div className="py-2 overflow-y-auto flex-1 custom-scrollbar">
        
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
          {/* Custom Range Inputs */}
          <div className="bg-[#fefcfb] p-4 border-2 border-[#120e0f]">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#120e0f] text-sm font-medium">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => update('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                  className="w-full pl-7 pr-3 py-2 text-sm bg-[#fefcfb] border-2 border-[#120e0f] focus:outline-none text-[#120e0f] font-medium"
                />
              </div>
              <span className="text-[#120e0f] font-bold text-lg">-</span>
              <div className="relative flex-1 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#120e0f] text-sm font-medium">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max === Infinity ? '' : filters.priceRange?.max || ''}
                  onChange={(e) => update('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                  className="w-full pl-7 pr-3 py-2 text-sm bg-[#fefcfb] border-2 border-[#120e0f] focus:outline-none text-[#120e0f] font-medium"
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
                      min-w-[44px] h-10 px-3 flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                      ${isActive 
                        ? 'bg-[#120e0f] text-[#fefcfb] border-[#120e0f]' 
                        : 'bg-[#fefcfb] text-[#120e0f] border-[#120e0f] hover:opacity-70'
                      }
                    `}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-[#120e0f]/70 py-2">
              No sizes available for these products
            </div>
          )}
        </FilterSection>
      </div>

      {/* Styled Scrollbar CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fefcfb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #120e0f;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #120e0f;
        }
      `}</style>
    </div>
  );
};

export default FilterSidebar;