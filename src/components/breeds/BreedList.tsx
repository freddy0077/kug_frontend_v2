import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_BREEDS, SortDirection } from '@/graphql/queries/breedQueries';
import BreedCard from './BreedCard';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';
import BreedSearchBox from './BreedSearchBox';
import { useAuth } from '@/contexts/AuthContext';

interface BreedListProps {
  initialSearchTerm?: string;
}

const BreedList: React.FC<BreedListProps> = ({ initialSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm);
  const { user } = useAuth();
  
  // For testing: show button to all users
  const canCreateBreed = true;
  
  // Pagination state
  const [offset, setOffset] = useState(0);
  const limit = 12;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Reset pagination when search term or sort direction changes
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearchTerm, sortDirection]);

  const { loading, error, data, fetchMore } = useQuery(GET_BREEDS, {
    variables: {
      searchTerm: debouncedSearchTerm,
      sortDirection,
      offset,
      limit
    },
    notifyOnNetworkStatusChange: true,
  });

  const handleLoadMore = useCallback(() => {
    if (data?.breeds?.hasMore) {
      fetchMore({
        variables: {
          searchTerm: debouncedSearchTerm,
          sortDirection,
          offset: data.breeds.items.length,
          limit
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            breeds: {
              ...fetchMoreResult.breeds,
              items: [...prev.breeds.items, ...fetchMoreResult.breeds.items]
            }
          };
        }
      });
    }
  }, [data?.breeds?.hasMore, data?.breeds?.items.length, debouncedSearchTerm, fetchMore, limit, sortDirection]);

  // Create a more prominent button
  const createBreedButton = (
    <Link 
      href="/manage/breeds/add" 
      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
    >
      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Create New Breed
    </Link>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader 
        title="Dog Breed Directory" 
        description="Explore our comprehensive database of dog breeds. Learn about their characteristics, origins, temperaments, and find the perfect match for your lifestyle."
        actionButton={createBreedButton}
      />
      
      {/* Create an additional button section for better visibility */}
      <div className="flex justify-between items-center mb-6">
        <BreedSearchBox
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortDirection={sortDirection}
          onSortChange={setSortDirection}
        />
        
        <Link 
          href="/manage/breeds/add"
          className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors ml-4"
        >
          <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Breed
        </Link>
      </div>

      {error && <ErrorMessage message={`Error loading breeds: ${error.message}`} />}

      {loading && !data ? (
        <LoadingSpinner size="large" message="Loading breeds..." />
      ) : (
        <>
          {!data?.breeds?.items?.length ? (
            <EmptyState 
              title="No breeds found" 
              message="Try adjusting your search criteria or check back later."
            />
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-medium text-gray-900">{data.breeds.items.length}</span> of <span className="font-medium text-gray-900">{data.breeds.totalCount}</span> breeds
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.breeds.items.map((breed: any) => (
                  <BreedCard key={breed.id} breed={breed} />
                ))}
              </div>
              
              {data.breeds.hasMore && (
                <div className="mt-10 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading more...
                      </>
                    ) : (
                      <>
                        Load More Breeds
                        <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BreedList;
