import React from "react";
import FilterItem from "./FilterItem";
import PriceRangeSlider from "./PriceRangeSlider";
import { FilterState } from "../../types/product";

interface FilterSidebarProps {
  activeFilters: FilterState;
  uniqueBrands: string[];
  uniqueRegions: string[];
  uniqueCategories: string[];
  brandCounts: Record<string, number>;
  regionCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  priceRangeMemo: [number, number];
  toggleBrandFilter: (brand: string) => void;
  toggleRegionFilter: (region: string) => void;
  toggleCategoryFilter: (category: string) => void;
  toggleStockFilter: () => void;
  toggleDiscountFilter: () => void;
  updatePriceRange: (range: [number, number]) => void;
  updateSearchQuery: (query: string) => void;
  clearAllFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  activeFilters,
  uniqueBrands,
  uniqueRegions,
  uniqueCategories,
  brandCounts,
  regionCounts,
  categoryCounts,
  priceRangeMemo,
  toggleBrandFilter,
  toggleRegionFilter,
  toggleCategoryFilter,
  toggleStockFilter,
  toggleDiscountFilter,
  updatePriceRange,
  updateSearchQuery,
  clearAllFilters,
}) => {
  // Check if any filters are active to show the clear all button
  const hasActiveFilters =
    activeFilters.brands.length > 0 ||
    activeFilters.regions.length > 0 ||
    activeFilters.inStock ||
    activeFilters.hasDiscount ||
    activeFilters.searchQuery !== "";

  return (
    <div className="sticky top-24 bg-white rounded-xl shadow-md p-5 divide-y divide-gray-200">
      <div className="pb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search gift cards..."
              value={activeFilters.searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {activeFilters.searchQuery && (
              <button
                onClick={() => updateSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-4 w-4 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="py-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Quick Filters
        </h4>
        <FilterItem
          label="In Stock Only"
          checked={activeFilters.inStock}
          onChange={toggleStockFilter}
        />
        <FilterItem
          label="On Sale / Discounted"
          checked={activeFilters.hasDiscount}
          onChange={toggleDiscountFilter}
        />
      </div>

      {/* Price Range Slider */}
      <div className="py-4">
        <PriceRangeSlider
          minPossible={priceRangeMemo[0]}
          maxPossible={priceRangeMemo[1]}
          currentMin={activeFilters.priceRange[0]}
          currentMax={activeFilters.priceRange[1]}
          onChange={(range) => updatePriceRange(range)}
        />
      </div>

      {/* Brand Filter */}
      <div className="py-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Brands</h4>
        <div className="max-h-48 overflow-y-auto pr-2 space-y-1">
          {uniqueBrands.map((brand) => (
            <FilterItem
              key={brand}
              label={brand}
              checked={activeFilters.brands.includes(brand)}
              onChange={() => toggleBrandFilter(brand)}
              count={brandCounts[brand]}
            />
          ))}
        </div>
      </div>

      {/* Region Filter */}
      <div className="py-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Regions</h4>
        <div className="max-h-48 overflow-y-auto pr-2 space-y-1">
          {uniqueRegions.map((region) => (
            <FilterItem
              key={region}
              label={region}
              checked={activeFilters.regions.includes(region)}
              onChange={() => toggleRegionFilter(region)}
              count={regionCounts[region]}
            />
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="py-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
        <div className="max-h-48 overflow-y-auto pr-2 space-y-1">
          {uniqueCategories.map((category) => (
            <FilterItem
              key={category}
              label={category}
              checked={activeFilters.categories.includes(category)}
              onChange={() => toggleCategoryFilter(category)}
              count={categoryCounts[category]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
