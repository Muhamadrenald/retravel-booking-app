import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  visiblePagesCount = 5,
}) => {
  const startPageGroup =
    Math.floor((currentPage - 1) / visiblePagesCount) * visiblePagesCount;
  const visiblePageNumbers = Array.from(
    { length: Math.min(visiblePagesCount, totalPages - startPageGroup) },
    (_, i) => startPageGroup + i + 1
  );

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 sm:mt-6 flex flex-wrap justify-center items-center gap-1 sm:gap-2 bg-white px-4 sm:px-6 py-3 rounded-lg shadow-sm border border-gray-100">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-200"
        disabled={currentPage === 1}
      >
        ‹
      </button>

      {startPageGroup > 0 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            1
          </button>
          <span className="px-1 sm:px-2 text-gray-500 text-xs sm:text-sm">
            ...
          </span>
        </>
      )}

      {visiblePageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
            currentPage === page
              ? "bg-indigo-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      {startPageGroup + visiblePagesCount < totalPages && (
        <>
          <span className="px-1 sm:px-2 text-gray-500 text-xs sm:text-sm">
            ...
          </span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-all duration-200"
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
