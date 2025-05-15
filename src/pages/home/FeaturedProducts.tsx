import React from "react";
import { motion } from "framer-motion";
import { NavigateFunction } from "react-router-dom";
import GiftCard, {
  GiftCardSkeleton,
} from "../../components/products/shop/GiftCard";
import { Product } from "./Home";

interface FeaturedProductsProps {
  loading: boolean;
  error: string | null;
  activeTab: "all" | "featured" | "trending" | "new";
  setActiveTab: (tab: "all" | "featured" | "trending" | "new") => void;
  visibleProducts: Product[];
  handleAddToCart: (product: Product, e: React.MouseEvent) => void;
  navigateToProductDetail: (productId: string) => void;
  isItemInCart: (productId: string) => boolean;
  navigate: NavigateFunction;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  loading,
  error,
  activeTab,
  setActiveTab,
  visibleProducts,
  handleAddToCart,
  navigateToProductDetail,
  isItemInCart,
  navigate,
}) => {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Popular Gift Cards
          </h2>

          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === "all"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Cards
            </button>
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === "featured"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === "trending"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === "new"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <GiftCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-gray-900 font-medium text-lg mb-2">
              No gift cards found
            </h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any gift cards for this category. Please try
              another category.
            </p>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
              onClick={() => navigate("/categories")}
            >
              Browse All Categories
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {visibleProducts.map((product) => (
                <GiftCard
                  key={product.id}
                  product={product}
                  onAddToCart={(e) => handleAddToCart(product, e)}
                  onCardClick={() => navigateToProductDetail(product.id)}
                  isInCart={isItemInCart(product.id)}
                />
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <motion.button
                onClick={() => navigate("/categories")}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>View All Gift Cards</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </motion.button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
