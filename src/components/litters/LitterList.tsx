'use client';

import React, { useState, useEffect } from 'react';
import { useLitters } from '@/hooks/useLitters';
import LitterListItem from './LitterListItem';
import { UserRole } from '@/utils/permissionUtils';

interface LitterListProps {
  userId: string;
  userRole: UserRole;
  initialLimit?: number;
  ownerId?: string;
  breedId?: string;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
}

/**
 * Component for displaying a paginated list of litters
 * Uses the useLitters custom hook for data fetching
 */
const LitterList: React.FC<LitterListProps> = ({
  userId,
  userRole,
  initialLimit = 10,
  ownerId,
  breedId,
  fromDate,
  toDate,
  searchTerm
}) => {
  // State for pagination
  const [limit, setLimit] = useState(initialLimit);
  const [offset, setOffset] = useState(0);
  
  // Use our custom hook to fetch litters with filtering
  const { data, loading, error, refetch } = useLitters({
    limit,
    offset,
    ownerId,
    breedId,
    fromDate,
    toDate,
    searchTerm
  });
  
  // Reset pagination when filters change
  useEffect(() => {
    setOffset(0);
    refetch();
  }, [ownerId, breedId, fromDate, toDate, searchTerm, refetch]);
  
  // Handle loading state
  if (loading && !data) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white shadow rounded-lg p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          </div>
        ))}
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading litters: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle empty state or no results
  if (!data?.litters?.items || data.litters.items.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No litters found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm 
            ? "No litters match your search criteria. Try adjusting your filters."
            : "No litters have been registered yet."}
        </p>
      </div>
    );
  }
  
  // Handle successful data fetch
  return (
    <div className="space-y-6">
      {/* List of litters */}
      <div className="space-y-4">
        {data.litters.items.map(litter => (
          <LitterListItem 
            key={litter.id}
            litter={litter}
            userRole={userRole}
            userId={userId}
          />
        ))}
      </div>
      
      {/* Pagination controls */}
      {data.litters.totalCount > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                offset === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={!data.litters.hasMore}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                !data.litters.hasMore 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{offset + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(offset + data.litters.items.length, data.litters.totalCount)}
                </span>{" "}
                of <span className="font-medium">{data.litters.totalCount}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    offset === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={!data.litters.hasMore}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    !data.litters.hasMore 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LitterList;
