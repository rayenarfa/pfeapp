import React from "react";
import { Product } from "../../../types/product";
import Pagination from "../../../components/common/Pagination";
import GiftCard from "./GiftCard";

interface ProductGridProps {
  products: Product[];
  handleAddToCart: (product: Product, e: React.MouseEvent) => void;
  isItemInCart: (productId: string) => boolean;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  handleAddToCart,
  isItemInCart,
  sortBy,
  setSortBy,
  currentPage,
  totalPages,
  paginate,
}) => {
  // If there are no products, show empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-24 h-24 mb-6 text-gray-300">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No products found
        </h3>
        <p className="text-gray-500 mb-6 max-w-md">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Sort options */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-6 flex flex-wrap items-center justify-between">
        <div className="text-sm text-gray-700 font-medium">
          {products.length} {products.length === 1 ? "product" : "products"}{" "}
          found
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="featured">Featured</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-a-z">Name: A to Z</option>
            <option value="name-z-a">Name: Z to A</option>
            <option value="newest">Newest</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <GiftCard
            key={product.id}
            product={product}
            onAddToCart={(e) => handleAddToCart(product, e)}
            onCardClick={() =>
              (window.location.href = `/product/${product.id}`)
            }
            isInCart={isItemInCart(product.id)}
            size="medium"
            layout="grid"
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={paginate}
      />
    </div>
  );
};

export default ProductGrid;
