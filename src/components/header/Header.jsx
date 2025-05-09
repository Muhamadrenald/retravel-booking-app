import React from "react";

const Header = ({
  title,
  searchTerm,
  onSearchChange,
  onAddClick,
  addButtonText,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
        {title}
      </h1>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full text-sm sm:text-base transition-all duration-200"
            value={searchTerm}
            onChange={onSearchChange}
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <button
          onClick={onAddClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2 rounded-lg shadow-md flex items-center w-full sm:w-auto justify-center text-sm sm:text-base transition-all duration-200"
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          {addButtonText}
        </button>
      </div>
    </div>
  );
};

export default Header;
