import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Don't render pagination if there's just one page
  if (totalPages <= 1) return null;

  // Calculate the range of pages to show
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than the max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of pages to show
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the start
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, 4);
      }

      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }

      // Add ellipsis if needed at the beginning
      if (start > 2) {
        pageNumbers.push("...");
      }

      // Add the middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed at the end
      if (end < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <nav className="flex items-center justify-center mt-8">
      <ul className="flex items-center">
        {/* Previous button */}
        <li>
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`mx-1 flex items-center justify-center w-8 h-8 rounded-full ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            aria-label="Previous Page"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </li>

        {/* Page numbers */}
        {getPageNumbers().map((pageNumber, index) => (
          <li key={index}>
            {pageNumber === "..." ? (
              <span className="mx-1 w-8 text-center text-gray-500">...</span>
            ) : (
              <button
                onClick={() =>
                  typeof pageNumber === "number" && onPageChange(pageNumber)
                }
                className={`mx-1 flex items-center justify-center w-8 h-8 rounded-full ${
                  currentPage === pageNumber
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </button>
            )}
          </li>
        ))}

        {/* Next button */}
        <li>
          <button
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className={`mx-1 flex items-center justify-center w-8 h-8 rounded-full ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
            aria-label="Next Page"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
