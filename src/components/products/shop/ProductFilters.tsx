import { Search, ChevronDown } from "lucide-react";

interface ProductFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterBrand: string;
  setFilterBrand: (brand: string) => void;
  categories: string[];
  brands: string[];
  hasFilters: boolean;
  clearFilters: () => void;
}

const ProductFilters = ({
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterBrand,
  setFilterBrand,
  categories,
  brands,
  hasFilters,
  clearFilters,
}: ProductFiltersProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-5 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        {/* Search box */}
        <div className="relative flex-1">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              id="search"
              type="text"
              placeholder="Search by name, brand, or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto">
          {/* Category filter */}
          <div>
            <label
              htmlFor="category-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <div className="relative">
              <select
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Brand filter */}
          <div>
            <label
              htmlFor="brand-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Brand
            </label>
            <div className="relative">
              <select
                id="brand-filter"
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Clear filters button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
