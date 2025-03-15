'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  hasMore, 
  onPrevPage, 
  onNextPage 
}) => {
  return (
    <div className="mt-8 flex justify-between items-center">
      <button 
        onClick={onPrevPage}
        disabled={currentPage === 0}
        className={`px-4 py-2 border border-gray-300 rounded-md ${
          currentPage === 0 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        Previous
      </button>
      <span className="text-sm text-gray-700">
        Page {currentPage + 1} {totalPages > 0 ? ` of ${totalPages}` : ''}
      </span>
      <button 
        onClick={onNextPage}
        disabled={!hasMore}
        className={`px-4 py-2 border border-gray-300 rounded-md ${
          !hasMore 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
