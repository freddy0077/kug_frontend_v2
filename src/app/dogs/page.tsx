'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DOGS, DogSortField, SortDirection } from '@/graphql/queries/dogQueries';
import { GET_BREEDS, GET_BREED_GROUPS } from '@/graphql/queries/breedQueries';
import DogCard from '@/components/dogs/DogCard';
import BreedFilter from '@/components/dogs/BreedFilter';
import SearchInput from '@/components/common/SearchInput';
import Pagination from '@/components/common/Pagination';
import Link from 'next/link';

export default function Dogs() {
  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("");
  const [selectedBreedGroup, setSelectedBreedGroup] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [sortField, setSortField] = useState<DogSortField>(DogSortField.NAME);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);
  const pageSize = 10;
  
  // Fetch breeds
  const { loading: breedsLoading, error: breedsError, data: breedsData } = useQuery(GET_BREEDS, {
    variables: { 
      offset: 0, 
      limit: 100, // Fetch all breeds
      searchTerm: '' // Empty search term to get all
    }
  });
  
  // Extract unique breed groups
  const breedGroups = Array.from(
    new Set(
      breedsData?.breeds?.items
        ?.map(breed => breed.group)
        .filter(Boolean) || []
    )
  );

  // Breed categories from fetched data
  const breedCategories = breedsData?.breeds?.items?.map(breed => ({ 
    id: breed.id, 
    name: breed.name, 
    group: breed.group 
  })) || [];

  // GraphQL query to fetch dogs with filters
  const { loading, error, data } = useQuery(GET_DOGS, {
    variables: {
      offset: currentPage * pageSize,
      limit: pageSize,
      searchTerm: searchQuery || undefined,
      breedId: selectedBreed || undefined,
      breedGroup: selectedBreedGroup || undefined,
      sortBy: sortField,
      sortDirection: sortDirection
    },
    fetchPolicy: 'network-only'
  });

  // Handle breed group and breed loading state
  if (breedsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Handle breed group and breed error state
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

  // Handle sort changes
  const toggleSort = (field: DogSortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC);
    } else {
      setSortField(field);
      setSortDirection(SortDirection.ASC);
    }
  };

  // Get sort icon
  const getSortIcon = (field: DogSortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === SortDirection.ASC ? '↑' : '↓';
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
        {/* Search and filter panel */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Dogs</label>
              <SearchInput 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, registration number..."
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="breed-group" className="block text-sm font-medium text-gray-700 mb-1">Filter by Breed Group</label>
              <select
                id="breed-group"
                value={selectedBreedGroup}
                onChange={(e) => {
                  setSelectedBreedGroup(e.target.value);
                  setSelectedBreed(''); // Reset breed when changing group
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="">All Breed Groups</option>
                {breedsData?.breeds?.items?.map(breed => (
                  <option key={breed.id} value={breed.id}>{breed.name}</option>
                ))}
              </select>
            </div>
            
            {selectedBreedGroup && (
              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">Filter by Breed</label>
                <select
                  id="breed"
                  value={selectedBreed}
                  onChange={(e) => setSelectedBreed(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="">All Breeds in {selectedBreedGroup}</option>
                  {breedCategories
                    .filter(breed => breed.group === selectedBreedGroup)
                    .map(breed => (
                      <option key={breed.id} value={breed.id}>{breed.name}</option>
                    ))
                  }
                </select>
              </div>
            )}
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <div className="mt-1 flex flex-wrap gap-2">
                <button
                  onClick={() => toggleSort(DogSortField.NAME)}
                  className={`px-3 py-1 text-sm rounded-md ${sortField === DogSortField.NAME ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  Name {sortField === DogSortField.NAME && (sortDirection === SortDirection.ASC ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => toggleSort(DogSortField.DATE_OF_BIRTH)}
                  className={`px-3 py-1 text-sm rounded-md ${sortField === DogSortField.DATE_OF_BIRTH ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  Age {sortField === DogSortField.DATE_OF_BIRTH && (sortDirection === SortDirection.ASC ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>
          
          {data?.dogs?.totalCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
              Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, data.dogs.totalCount)} of {data.dogs.totalCount} dogs
            </div>
          )}
        </div>
        
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
                {selectedBreedGroup && (
                  <button 
                    onClick={() => setSelectedBreedGroup('')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear breed group filter
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data?.dogs?.items?.map((dog: any) => (
                  <div key={dog.id} className="transform transition-transform duration-200 hover:-translate-y-1">
                    <DogCard dog={dog} />
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
