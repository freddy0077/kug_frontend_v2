"use client";

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Function to generate pagination range
  const getPaginationRange = () => {
    const range = [];
    const maxPagesToShow = 5;
    
    // If total pages is less than or equal to max pages to show
    if (totalPages <= maxPagesToShow) {
      for (let i = 0; i < totalPages; i++) {
        range.push(i);
      }
    } else {
      // Start with the current page in the middle
      let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      // Adjust if we're near the end
      if (endPage >= totalPages) {
        endPage = totalPages - 1;
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        range.push(i);
      }
    }
    
    return range;
  };
  
  const paginationRange = getPaginationRange();
  
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{currentPage * pageSize + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min((currentPage + 1) * pageSize, totalItems)}
            </span>{' '}
            of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(0)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <span className="sr-only">First</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.707 5.293a1 1 0 010 1.414L9.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M6.707 5.293a1 1 0 010 1.414L4.414 10l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-2 py-2 border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {paginationRange.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-150
                  ${currentPage === page
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {page + 1}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => onPageChange(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <span className="sr-only">Last</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.293 5.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L10.586 10 8.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M13.293 5.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L15.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
      
      {/* Mobile pagination */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <p className="text-sm text-gray-700">
          Page <span className="font-medium">{currentPage + 1}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
