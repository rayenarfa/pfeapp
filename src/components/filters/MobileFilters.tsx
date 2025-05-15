import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import FilterItem from "./FilterItem";
import PriceRangeSlider from "./PriceRangeSlider";
import { FilterState } from "../../types/product";

interface MobileFiltersProps {
  showFiltersMobile: boolean;
  setShowFiltersMobile: (show: boolean) => void;
  activeFilters: FilterState;
  uniqueBrands: string[];
  uniqueRegions: string[];
  uniqueCategories: string[];
  brandCounts: Record<string, number>;
  regionCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  priceRangeMemo: [number, number];
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  toggleBrandFilter: (brand: string) => void;
  toggleRegionFilter: (region: string) => void;
  toggleCategoryFilter: (category: string) => void;
  toggleStockFilter: () => void;
  toggleDiscountFilter: () => void;
  updatePriceRange: (range: [number, number]) => void;
  updateSearchQuery: (query: string) => void;
  clearAllFilters: () => void;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  showFiltersMobile,
  setShowFiltersMobile,
  activeFilters,
  uniqueBrands,
  uniqueRegions,
  uniqueCategories,
  brandCounts,
  regionCounts,
  categoryCounts,
  priceRangeMemo,
  sortBy,
  setSortBy,
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
    <AnimatePresence>
      {showFiltersMobile && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
            onClick={() => setShowFiltersMobile(false)}
          />

          {/* Slide-in panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-y-0 right-0 max-w-full flex z-50"
          >
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
                    Filters & Sort
                  </h2>
                  <button
                    onClick={() => setShowFiltersMobile(false)}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg
                      className="h-6 w-6"
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
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-gray-200">
                  {/* Search box */}
                  <div className="py-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">
                      Search
                    </h3>
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

                  {/* Sort options */}
                  <div className="py-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">
                      Sort By
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "featured", label: "Featured" },
                        { id: "price-low-high", label: "Price: Low to High" },
                        { id: "price-high-low", label: "Price: High to Low" },
                        { id: "name-a-z", label: "Name: A to Z" },
                        { id: "name-z-a", label: "Name: Z to A" },
                        { id: "newest", label: "Newest" },
                        { id: "discount", label: "Biggest Discount" },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSortBy(option.id)}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            sortBy === option.id
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick filters */}
                  <div className="py-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">
                      Quick Filters
                    </h3>
                    <div className="space-y-2">
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
                  </div>

                  {/* Price range */}
                  <div className="py-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">
                      Price Range
                    </h3>
                    <PriceRangeSlider
                      minPossible={priceRangeMemo[0]}
                      maxPossible={priceRangeMemo[1]}
                      currentMin={activeFilters.priceRange[0]}
                      currentMax={activeFilters.priceRange[1]}
                      onChange={(range) => updatePriceRange(range)}
                    />
                  </div>

                  {/* Brand filters */}
                  <div className="py-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">
                      Brands
                    </h3>
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
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

                  {/* Region filters */}
                  <div className="py-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">
                      Regions
                    </h3>
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
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

                  {/* Category filters */}
                  <div className="py-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">
                      Categories
                    </h3>
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
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

                <div className="flex border-t border-gray-200 p-4 space-x-3">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    type="button"
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    onClick={() => setShowFiltersMobile(false)}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileFilters;
