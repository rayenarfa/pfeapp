import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { fetchProductById } from "../../utils/firestoreUtils";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brand: string;
  category: string;
  region: string;
  currency: string;
  stock: number;
  discount?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (!id) {
          throw new Error("Product ID is missing");
        }
        const product = await fetchProductById(id);
        if (!product) {
          setError("Product not found");
        } else {
          setProduct(product);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product details.");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;

    // Add to cart with selected quantity
    for (let i = 0; i < quantity; i++) {
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
        stock: 0,
      });
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity > 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <svg
              className="animate-spin h-12 w-12 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col justify-center items-center h-96">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16"
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
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {error || "Product not found"}
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              We couldn't find the product you're looking for.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate final price if discount exists
  const finalPrice =
    product.discount && product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* Cart added notification */}
      <AnimatePresence>
        {addedToCart && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {quantity > 1 ? `${quantity} items` : "Item"} added to cart
            successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
        {/* Breadcrumb navigation */}
        <nav className="flex mb-6 text-sm">
          <ol className="flex items-center space-x-2">
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
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="ml-2 text-gray-700">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {/* Product Image */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative aspect-square overflow-hidden rounded-xl shadow-md"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Discount badge */}
                {product.discount && product.discount > 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white shadow-lg">
                      {product.discount}% OFF
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Product Details */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    {/* Product name and badges */}
                    <div className="flex items-start justify-between">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {product.name}
                      </h1>
                      <div className="flex flex-col items-end">
                        <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                          TND{" "}
                          {finalPrice % 1 === 0
                            ? finalPrice.toFixed(0)
                            : finalPrice.toFixed(2)}
                        </div>
                        {product.discount && product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            TND{" "}
                            {product.price % 1 === 0
                              ? product.price.toFixed(0)
                              : product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Brand and tags */}
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-800">
                        {product.brand}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {product.region}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Sold out"}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="prose prose-indigo max-w-none mb-6">
                      <p className="text-gray-700">{product.description}</p>
                    </div>

                    {/* Additional details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Gift Card Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-indigo-500 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          <span className="text-gray-700">
                            Valid for 12 months
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-indigo-500 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          <span className="text-gray-700">
                            Secure digital delivery
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-indigo-500 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"></path>
                          </svg>
                          <span className="text-gray-700">
                            No additional fees
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-indigo-500 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          <span className="text-gray-700">
                            Redeemable online only
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add to cart section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Quantity selector */}
                      <div className="flex items-center">
                        <span className="mr-4 text-gray-700">Quantity:</span>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={quantity <= 1}
                            className={`px-3 py-1 text-lg ${
                              quantity <= 1
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            -
                          </button>
                          <span className="px-4 py-1 text-center w-12 text-gray-800 font-medium">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            disabled={product.stock <= quantity}
                            className={`px-3 py-1 text-lg ${
                              product.stock <= quantity
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Add to cart button */}
                      <motion.button
                        onClick={handleAddToCart}
                        whileTap={{ scale: 0.95 }}
                        disabled={product.stock <= 0}
                        className={`w-full sm:w-auto py-3 px-8 rounded-lg text-base font-medium text-white shadow-md flex items-center justify-center gap-2 ${
                          product.stock <= 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Related products section could go here */}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductDetail;
