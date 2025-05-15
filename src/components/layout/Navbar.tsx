import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import DesktopNav from "./Navigation/DesktopNav";
import MobileNav, { MobileMenuOverlay } from "./Navigation/MobileNav";

// Menu items constants
const MENU_ITEMS = [
  {
    path: "/",
    label: "Home",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    path: "/categories",
    label: "Categories",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  },
];

const USER_MENU_ITEMS = [
  {
    path: "/profile",
    label: "Profile",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    path: "/orders",
    label: "My Orders",
    icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  },
];

/**
 * Navbar component responsible for rendering the site navigation
 * Provides both desktop and mobile navigation interfaces
 * Handles user authentication status and cart display
 */
const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems, totalItems } = useCart();
  const location = useLocation();

  /**
   * Calculates the total number of items in the cart
   * Memoized to prevent unnecessary recalculations
   */
  const cartItemCount = useMemo(() => {
    return (
      totalItems ||
      cartItems?.reduce((total, item) => total + item.quantity, 0) ||
      0
    );
  }, [cartItems, totalItems]);

  /**
   * Monitors window scroll position and updates navbar appearance
   * Uses debounce for performance optimization
   */
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > 10);
      }, 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  /**
   * Controls body scroll when mobile menu is open
   * Prevents background scrolling when menu is active
   */
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  /**
   * Closes mobile menu automatically when route changes
   */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  /**
   * Toggles the mobile menu open/closed state
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Extract role from user
  const role = user?.role || null;

  return (
    <header
      className={`sticky top-0 w-full z-30 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm py-2"
          : "bg-white py-3"
      }`}
    >
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <DesktopNav
          user={user}
          role={role}
          cartItemCount={cartItemCount}
          menuItems={MENU_ITEMS}
          userMenuItems={USER_MENU_ITEMS}
          onLogout={logout}
        />

        {/* Mobile Navigation */}
        <MobileNav
          user={user}
          isOpen={isMenuOpen}
          onToggle={toggleMenu}
          cartItemCount={cartItemCount}
        />

        {/* Mobile Menu Overlay - Portal */}
        <MobileMenuOverlay
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          user={user}
          role={role}
          menuItems={MENU_ITEMS}
          userMenuItems={USER_MENU_ITEMS}
          onLogout={logout}
        />
      </div>
    </header>
  );
};

export default Navbar;
