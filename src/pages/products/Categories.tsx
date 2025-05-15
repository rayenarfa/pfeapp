import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import {
  fetchProductsByCategory,
  fetchProducts,
} from "../../utils/firestoreUtils";
import { useCart } from "../../context/CartContext";
import { Product, FilterState } from "../../types/product";
import {
  debounce,
  loadPriceRangeFromStorage,
  savePriceRangeToStorage,
  sortProducts,
} from "../../utils/filterUtils";
import FilterSidebar from "../../components/filters/FilterSidebar";
import MobileFilters from "../../components/filters/MobileFilters";
import ProductGrid from "../../components/products/shop/ProductGrid";

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, isItemInCart } = useCart();

  // Extract category from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");

  // Main states
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting and pagination
  const [sortBy, setSortBy] = useState<string>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Mobile UI state
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Static price range from 1 to 200 USD
  const defaultPriceRange: [number, number] = [1, 200];

  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    brands: [],
    regions: [],
    categories: [],
    priceRange: defaultPriceRange,
    inStock: false,
    hasDiscount: false,
    searchQuery: "",
  });

  // Load saved price range when component mounts
  const savedPriceRange = useMemo(
    () => loadPriceRangeFromStorage(categoryParam),
    [categoryParam]
  );

  // Derived filter data
  const uniqueBrands = React.useMemo(() => {
    const brands = [...new Set(products.map((product) => product.brand))];
    return brands.sort();
  }, [products]);

  const uniqueRegions = React.useMemo(() => {
    const regions = [...new Set(products.map((product) => product.region))];
    return regions.sort();
  }, [products]);

  const uniqueCategories = React.useMemo(() => {
    const categories = [
      ...new Set(products.map((product) => product.category)),
    ];
    return categories.sort();
  }, [products]);

  const priceRangeMemo = React.useMemo(() => {
    if (products.length === 0) return [0, 1000] as [number, number];

    // Calculate discounted prices
    const prices = products.map((product) => {
      // Apply discount if available
      const discountMultiplier = product.discount
        ? (100 - product.discount) / 100
        : 1;
      return product.price * discountMultiplier;
    });

    // Find minimum and maximum prices
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));

    // Add a small buffer to max for UI purposes
    return [min, max] as [number, number];
  }, [products]);

  // Track product counts for active filters
  const brandCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((product) => {
      counts[product.brand] = (counts[product.brand] || 0) + 1;
    });
    return counts;
  }, [products]);

  const regionCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((product) => {
      counts[product.region] = (counts[product.region] || 0) + 1;
    });
    return counts;
  }, [products]);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // When initializing filters, use the saved price range if available
  useEffect(() => {
    if (savedPriceRange) {
      setActiveFilters((prev) => ({
        ...prev,
        priceRange: savedPriceRange,
      }));
    }
  }, [categoryParam, savedPriceRange]);

  // Fetch products
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        let fetchedProducts: Product[];

        if (categoryParam && categoryParam !== "all") {
          fetchedProducts = await fetchProductsByCategory(categoryParam);
        } else {
          fetchedProducts = await fetchProducts();
        }

        setProducts(fetchedProducts);
        // Reset pagination when products change
        setCurrentPage(1);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    getProducts();
  }, [categoryParam]);

  // Update effect to automatically apply category filter when provided through URL
  useEffect(() => {
    if (categoryParam) {
      setActiveFilters((prev) => ({
        ...prev,
        categories: [categoryParam],
      }));
    }
  }, [categoryParam]);

  // Update the filter effect to handle price changes more efficiently
  useEffect(() => {
    // Create a debounced function for applying filters
    const applyFilters = debounce(() => {
      // Reset to page 1 when filters change
      setCurrentPage(1);

      // Apply filters
      let result = [...products];

      // Filter by brand
      if (activeFilters.brands.length > 0) {
        result = result.filter((product) =>
          activeFilters.brands.includes(product.brand)
        );
      }

      // Filter by region
      if (activeFilters.regions.length > 0) {
        result = result.filter((product) =>
          activeFilters.regions.includes(product.region)
        );
      }

      // Filter by category
      if (activeFilters.categories.length > 0) {
        result = result.filter((product) =>
          activeFilters.categories.includes(product.category)
        );
      }

      // Filter by price range
      result = result.filter((product) => {
        // Calculate the final price after discount
        const discountMultiplier = product.discount
          ? (100 - product.discount) / 100
          : 1;
        const finalPrice = product.price * discountMultiplier;

        return (
          finalPrice >= activeFilters.priceRange[0] &&
          finalPrice <= activeFilters.priceRange[1]
        );
      });

      // Filter by stock
      if (activeFilters.inStock) {
        result = result.filter((product) => product.stock > 0);
      }

      // Filter by discount
      if (activeFilters.hasDiscount) {
        result = result.filter(
          (product) => product.discount && product.discount > 0
        );
      }

      // Filter by search query
      if (activeFilters.searchQuery) {
        const query = activeFilters.searchQuery.toLowerCase();
        result = result.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
        );
      }

      // Apply sorting
      result = sortProducts(result, sortBy);

      setFilteredProducts(result);
    }, 100);

    // Call the debounced function
    applyFilters();

    // Clean up
    return () => {
      // This will be called when the component unmounts or when dependencies change
    };
  }, [products, activeFilters, sortBy]);

  // Toggle filter functions
  const toggleBrandFilter = (brand: string) => {
    setActiveFilters((prev) => {
      if (prev.brands.includes(brand)) {
        return { ...prev, brands: prev.brands.filter((b) => b !== brand) };
      } else {
        return { ...prev, brands: [...prev.brands, brand] };
      }
    });
  };

  const toggleRegionFilter = (region: string) => {
    setActiveFilters((prev) => {
      if (prev.regions.includes(region)) {
        return { ...prev, regions: prev.regions.filter((r) => r !== region) };
      } else {
        return { ...prev, regions: [...prev.regions, region] };
      }
    });
  };

  const toggleStockFilter = () => {
    setActiveFilters((prev) => ({ ...prev, inStock: !prev.inStock }));
  };

  const toggleDiscountFilter = () => {
    setActiveFilters((prev) => ({ ...prev, hasDiscount: !prev.hasDiscount }));
  };

  const toggleCategoryFilter = (category: string) => {
    setActiveFilters((prev) => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter((c) => c !== category),
        };
      } else {
        return { ...prev, categories: [...prev.categories, category] };
      }
    });
  };

  const updatePriceRange = (range: [number, number]) => {
    // Make sure min price is not greater than max price
    const validRange: [number, number] = [
      Math.min(range[0], range[1]),
      Math.max(range[0], range[1]),
    ];

    // Save to localStorage
    savePriceRangeToStorage(categoryParam, validRange);

    // Update active filters
    setActiveFilters((prev) => ({
      ...prev,
      priceRange: validRange,
    }));

    // Reset to page 1 when price range changes
    setCurrentPage(1);
  };

  const updateSearchQuery = (query: string) => {
    setActiveFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  // Clear all filters properly
  const clearAllFilters = () => {
    // Clear localStorage for this category
    try {
      localStorage.removeItem(`priceRange_${categoryParam || "all"}`);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }

    // Reset all filters
    setActiveFilters({
      brands: [],
      regions: [],
      categories: categoryParam ? [categoryParam] : [], // Keep current category if in category view
      priceRange: priceRangeMemo, // Reset to calculated min/max
      inStock: false,
      hasDiscount: false,
      searchQuery: "",
    });

    // Reset sorting to default
    setSortBy("featured");
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentPage(pageNumber);
  };

  // Handle adding product to cart
  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;

    addToCart({
      id: product.id,
      name: product.name,
      price:
        product.discount && product.discount > 0
          ? product.price * (1 - product.discount / 100)
          : product.price,
      imageUrl: product.imageUrl,
      brand: product.brand,
      category: product.category,
      region: product.region,
      currency: product.currency,
      stock: product.stock,
    });
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <motion.div
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-20 h-20 border-indigo-600 border-t-4 border-solid rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-gray-200 border-4 border-solid rounded-full opacity-20"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading gift cards...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <motion.div
            className="bg-white rounded-xl shadow-md p-10 text-center max-w-xl mx-auto mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
              >
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <AnimatePresence>
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Breadcrumb and Title */}
          <div className="mb-8">
            <nav className="flex mb-4 text-sm font-medium">
              <ol className="flex items-center space-x-1">
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                  >
                    Home
                  </button>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 text-gray-400 mx-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <button
                    onClick={() => navigate("/categories")}
                    className={
                      categoryParam
                        ? "text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                        : "text-gray-800 font-bold"
                    }
                  >
                    Categories
                  </button>
                </li>
                {categoryParam && (
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400 mx-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="text-gray-800 font-bold capitalize">
                      {categoryParam}
                    </span>
                  </li>
                )}
              </ol>
            </nav>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 capitalize">
              {categoryParam || "All Gift Cards"}
            </h1>
            <p className="text-gray-600">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "gift card" : "gift cards"}{" "}
              available
            </p>
          </div>

          {/* Main Content Area: Filters + Products */}
          <div className="lg:flex lg:gap-8">
            {/* Filter sidebar - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar
                activeFilters={activeFilters}
                uniqueBrands={uniqueBrands}
                uniqueRegions={uniqueRegions}
                uniqueCategories={uniqueCategories}
                brandCounts={brandCounts}
                regionCounts={regionCounts}
                categoryCounts={categoryCounts}
                priceRangeMemo={priceRangeMemo}
                toggleBrandFilter={toggleBrandFilter}
                toggleRegionFilter={toggleRegionFilter}
                toggleCategoryFilter={toggleCategoryFilter}
                toggleStockFilter={toggleStockFilter}
                toggleDiscountFilter={toggleDiscountFilter}
                updatePriceRange={updatePriceRange}
                updateSearchQuery={updateSearchQuery}
                clearAllFilters={clearAllFilters}
              />
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <motion.button
                onClick={() => setShowFiltersMobile(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Filters & Sort
              </motion.button>
            </div>

            {/* Product grid */}
            <ProductGrid
              products={currentProducts}
              handleAddToCart={handleAddToCart}
              isItemInCart={isItemInCart}
              sortBy={sortBy}
              setSortBy={setSortBy}
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
            />
          </div>

          {/* Mobile filters */}
          <MobileFilters
            showFiltersMobile={showFiltersMobile}
            setShowFiltersMobile={setShowFiltersMobile}
            activeFilters={activeFilters}
            uniqueBrands={uniqueBrands}
            uniqueRegions={uniqueRegions}
            uniqueCategories={uniqueCategories}
            brandCounts={brandCounts}
            regionCounts={regionCounts}
            categoryCounts={categoryCounts}
            priceRangeMemo={priceRangeMemo}
            sortBy={sortBy}
            setSortBy={setSortBy}
            toggleBrandFilter={toggleBrandFilter}
            toggleRegionFilter={toggleRegionFilter}
            toggleCategoryFilter={toggleCategoryFilter}
            toggleStockFilter={toggleStockFilter}
            toggleDiscountFilter={toggleDiscountFilter}
            updatePriceRange={updatePriceRange}
            updateSearchQuery={updateSearchQuery}
            clearAllFilters={clearAllFilters}
          />
        </motion.div>
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Categories;
