import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const SearchBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle clicks outside to collapse search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsExpanded(false);
    }
  };

  return (
    <div ref={searchContainerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex items-center">
        <div
          className={`flex items-center transition-all duration-300 rounded-full border ${
            isExpanded
              ? "w-64 border-indigo-200 bg-white shadow-sm"
              : "w-10 border-transparent"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label={isExpanded ? "Close search" : "Open search"}
          >
            <svg
              className="w-5 h-5 text-gray-500"
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
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            className={`outline-none text-sm text-gray-700 bg-transparent transition-all duration-300 ${
              isExpanded ? "w-full px-1 py-1" : "w-0 p-0"
            }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search input"
          />

          {isExpanded && searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear search"
            >
              <svg
                className="w-4 h-4"
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
      </form>
    </div>
  );
};

export default SearchBar;
