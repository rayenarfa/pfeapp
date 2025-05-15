import React from "react";
import { Link } from "react-router-dom";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`bg-white border-t border-gray-200 pt-10 pb-6 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold text-indigo-600 mb-3">SharePay</h3>
            <p className="text-gray-600 max-w-xs">
              The best place to find perfect gift cards for any occasion.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} SharePay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
