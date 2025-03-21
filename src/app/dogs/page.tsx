'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DOGS, DogSortField, SortDirection } from '@/graphql/queries/dogQueries';
import { GET_BREEDS } from '@/graphql/queries/breedQueries';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/enums';
import { ApprovalStatus } from '@/types/enums';

// Define breed interface based on the API response structure
interface Breed {
  id: string;
  name: string;
  group: string;
  origin?: string;
  temperament?: string;
  average_lifespan?: string;
  average_height?: string;
  average_weight?: string;
  description?: string;
}

import DogCard from '@/components/dogs/DogCard';
import AdvancedDogSearch from '@/components/dogs/AdvancedDogSearch';
import Pagination from '@/components/common/Pagination';
import Link from 'next/link';

// Define search filters interface
interface DogSearchFilters {
  searchQuery: string;
  breed: string;
  breedGroup: string;
  gender: string;
  minAge: number | null;
  maxAge: number | null;
  titles: string[];
  hasOffspring: boolean | null;
  isNeutered: boolean | null;
  sortField: DogSortField;
  sortDirection: SortDirection;
}

export default function Dogs() {
  const pageSize = 10;
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Initialize search filters
  const initialFilters: DogSearchFilters = {
    searchQuery: '',
    breed: '',
    breedGroup: '',
    gender: '',
    minAge: null,
    maxAge: null,
    titles: [],
    hasOffspring: null,
    isNeutered: null,
    sortField: DogSortField.CREATED_AT,
    sortDirection: SortDirection.DESC
  };
  
  // State for filtering and pagination
  const [searchFilters, setSearchFilters] = useState<DogSearchFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Fetch breeds
  const { loading: breedsLoading, error: breedsError, data: breedsData } = useQuery(GET_BREEDS, {
    variables: { 
      offset: 0, 
      limit: 500, // Fetch a good number of breeds
      searchTerm: '' // Empty search term to get all
    }
  });
  
  // Extract breed data and groups
  const breeds = breedsData?.breeds?.items?.map((breed: Breed) => ({ 
    id: breed.id, 
    name: breed.name, 
    group: breed.group 
  })) || [];
  
  // Extract unique breed groups
  const breedGroups: string[] = Array.from(
    new Set(
      breeds.map(breed => breed.group).filter(Boolean)
    )
  );

  // GraphQL query to fetch dogs with filters
  const { loading, error, data } = useQuery(GET_DOGS, {
    variables: {
      offset: currentPage * pageSize,
      limit: pageSize,
      searchTerm: searchFilters.searchQuery || undefined,
      breedId: searchFilters.breed || undefined,
      breedGroup: searchFilters.breedGroup || undefined,
      gender: searchFilters.gender || undefined,
      hasOffspring: searchFilters.hasOffspring,
      isNeutered: searchFilters.isNeutered,
      minAge: searchFilters.minAge,
      maxAge: searchFilters.maxAge,
      titles: searchFilters.titles.length > 0 ? searchFilters.titles as string[] : undefined,
      sortBy: searchFilters.sortField,
      sortDirection: searchFilters.sortDirection
    },
    fetchPolicy: 'network-only'
  });

  // Handle breed data loading state
  if (breedsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Handle breed data error state
  if (breedsError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error loading breeds: </strong>
          <span className="block sm:inline">{breedsError.message}</span>
        </div>
      </div>
    );
  }

  // Handle pagination
  const handleNextPage = () => {
    if (data?.dogs?.hasMore) {
      setCurrentPage(prev => prev + 1);
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: DogSearchFilters) => {
    setSearchFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-4xl font-bold mb-2">Dog Registry</h1>
              <p className="text-green-100 text-lg">Browse our comprehensive database of registered dogs</p>
            </div>
            <Link 
              href="/dogs/new" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-green-50 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Dog
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Advanced search component */}
        <AdvancedDogSearch
          filters={searchFilters}
          onFiltersChange={handleFiltersChange}
          breeds={breeds}
          breedGroups={breedGroups}
          loading={loading}
        />
        
        {/* Results count */}
        {!loading && !error && data?.dogs?.totalCount > 0 && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <span>Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, data.dogs.totalCount)} of {data.dogs.totalCount} dogs</span>
              {(Object.keys(searchFilters).some(key => {
                const v = searchFilters[key as keyof DogSearchFilters];
                // Skip specific default values
                if (key === 'sortField' && v === DogSortField.NAME) return false;
                if (key === 'sortDirection' && v === SortDirection.ASC) return false;
                
                // Check if value is non-empty
                if (v === '' || v === null) return false;
                if (Array.isArray(v) && v.length === 0) return false;
                
                // Value is not default, so it's an active filter
                return true;
              })) && (
                <button 
                  onClick={() => setSearchFilters(initialFilters)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <span className="ml-3 text-lg text-gray-600">Loading dogs...</span>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error loading dogs</h3>
                <p className="mt-1 text-red-600">{error.message}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Dogs grid */}
        {!loading && !error && (
          <>
            {data?.dogs?.items?.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z" />
                </svg>
                <p className="text-xl text-gray-500 font-medium">No dogs found matching your criteria</p>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                <button 
                  onClick={() => setSearchFilters(initialFilters)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.dogs?.items?.map((dog: any) => (
                  <div key={dog.id} className="transform transition-transform duration-200 hover:-translate-y-1">
                    <DogCard 
                      dog={dog} 
                      showApprovalStatus={isAdmin} 
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {data?.dogs?.items?.length > 0 && (
              <div className="mt-8">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={data?.dogs?.totalCount ? Math.ceil(data.dogs.totalCount / pageSize) : 0}
                  hasMore={data?.dogs?.hasMore}
                  onPrevPage={handlePrevPage}
                  onNextPage={handleNextPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
