import React, { useState } from 'react';
import Link from 'next/link';
import { PlannedMatingCard } from './PlannedMatingCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

interface PlannedMatingListProps {
  plannedMatings: any[];
  loading: boolean;
  error: any;
  totalCount: number;
  hasMore: boolean;
  onLoadMore: () => void;
  onFilterChange?: (filters: any) => void;
  showFilters?: boolean;
  emptyMessage?: string;
  compact?: boolean;
}

export const PlannedMatingList: React.FC<PlannedMatingListProps> = ({
  plannedMatings,
  loading,
  error,
  totalCount,
  hasMore,
  onLoadMore,
  onFilterChange,
  showFilters = true,
  emptyMessage = 'No planned matings found',
  compact = false,
}) => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    
    if (onFilterChange) {
      onFilterChange({
        status: newStatus === 'ALL' ? null : newStatus,
      });
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading planned matings. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter controls */}
      {showFilters && (
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-medium leading-6 text-gray-900">Filters</h2>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <Link
                href="/breeding-programs/planned-matings/add"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Planned Mating
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNED">Planned</option>
              <option value="BRED">Bred</option>
              <option value="PREGNANT">Pregnant</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="pb-5 border-b border-gray-200 mb-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {loading && !plannedMatings.length ? 'Loading matings...' : `${totalCount} planned matings found`}
        </h3>
      </div>

      {/* Loading indicator for initial load */}
      {loading && !plannedMatings.length && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" color="border-blue-500" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !plannedMatings.length && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md py-10">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
            <div className="mt-6">
              <Link
                href="/breeding-programs/planned-matings/add"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Planned Mating
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Planned matings list */}
      {plannedMatings.length > 0 && (
        <>
          {compact ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {plannedMatings.map((mating) => (
                  <li key={mating.id}>
                    <PlannedMatingCard 
                      plannedMating={mating} 
                      userRole={user?.role} 
                      userId={user?.id} 
                      compact={true} 
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plannedMatings.map((mating) => (
                <PlannedMatingCard 
                  key={mating.id} 
                  plannedMating={mating} 
                  userRole={user?.role} 
                  userId={user?.id} 
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Load more button */}
      {hasMore && plannedMatings.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="border-gray-600" />
                <span className="ml-2">Loading more...</span>
              </>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PlannedMatingList;
