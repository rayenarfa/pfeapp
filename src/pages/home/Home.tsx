import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../utils/firestoreUtils";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import Hero from "./Hero";
import FeaturedProducts from "./FeaturedProducts";

// Product interface
export interface Product {
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

const Home: React.FC = () => {
  const navigate = useNavigate();
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "featured" | "trending" | "new"
  >("all");

  // Slider state
  const [, setCurrentSlide] = useState(0);
  const sliderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cart integration
  const { addToCart, isItemInCart } = useCart();

  // Initialize and clean up slider interval
  useEffect(() => {
    // Start the auto-sliding
    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }, 5000); // Change slide every 5 seconds

    // Clean up the interval on component unmount
    return () => {
      if (sliderIntervalRef.current) {
        clearInterval(sliderIntervalRef.current);
      }
    };
  }, [featuredProducts.length]);

  // Handle manual slide change

  // Fetch products and organize them
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProducts();

        // Set main products
        setProducts(fetchedProducts);

        // Featured products (with discount)
        const featured = fetchedProducts
          .filter((p) => p.discount && p.discount > 0)
          .sort((a, b) => (b.discount || 0) - (a.discount || 0))
          .slice(0, 8);
        setFeaturedProducts(featured);

        // Trending products (based on brand popularity)
        const trending = [...fetchedProducts]
          .sort(() => 0.5 - Math.random())
          .slice(0, 8);
        setTrendingProducts(trending);

        // New arrivals (based on creation date)
        const newProducts = [...fetchedProducts]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 8);
        setNewArrivals(newProducts);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // Calculate discounted price properly without showing 0

  // Handle add to cart with animation
  const handleAddToCart = useCallback(
    (product: Product, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent navigation when clicking add to cart

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

      setShowCart(true);
      setTimeout(() => setShowCart(false), 3000);
    },
    [addToCart]
  );

  // Navigate to product detail
  const navigateToProductDetail = useCallback(
    (productId: string) => {
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  // Get visible products based on active tab
  const getVisibleProducts = () => {
    switch (activeTab) {
      case "featured":
        return featuredProducts;
      case "trending":
        return trendingProducts;
      case "new":
        return newArrivals;
      default:
        return products.slice(0, 12); // Limit all products to 12 on homepage
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* Cart Success Notification */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Added to cart!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <Hero navigate={navigate} />

      {/* Products Section */}
      <FeaturedProducts
        loading={loading}
        error={error}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        visibleProducts={getVisibleProducts()}
        handleAddToCart={handleAddToCart}
        navigateToProductDetail={navigateToProductDetail}
        isItemInCart={isItemInCart}
        navigate={navigate}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
