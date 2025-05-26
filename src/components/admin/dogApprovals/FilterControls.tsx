import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useDebounce } from '@/hooks/useDebounce';
import { GET_BREEDS } from '@/graphql/queries/breedQueries';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { DogSortField, SortDirection } from '@/graphql/queries/dogQueries';

interface FilterControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  breedFilter: string | null;
  setBreedFilter: (breedId: string | null) => void;
  sortField: DogSortField;
  setSortField: (field: DogSortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchQuery,
  setSearchQuery,
  breedFilter,
  setBreedFilter,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Debounce search input to avoid too many queries
  const debouncedSearch = useDebounce(searchInput, 500);
  
  // Fetch all breeds for the breed filter
  const { data: breedsData } = useQuery(GET_BREEDS, {
    variables: { 
      offset: 0,
      limit: 100,
    },
  });
  
  // Update the search query when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);
  
  // Sort options
  const sortOptions = [
    { label: 'Name', value: DogSortField.NAME },
    { label: 'Date Added', value: DogSortField.CREATED_AT },
    { label: 'Birth Date', value: DogSortField.DATE_OF_BIRTH },
    { label: 'Breed', value: DogSortField.BREED },
  ];
  
  // Handle toggling sort direction
  const toggleSortDirection = () => {
    setSortDirection(
      sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
    );
  };
  
  // Get current sort option label
  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortField);
    return option ? option.label : 'Sort By';
  };
  
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
      {/* Search box */}
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search dogs by name, registration number, or owner"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
      </div>
      
      {/* Breed filter dropdown */}
      <div className="relative inline-block text-left">
        <div>
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              setIsSortOpen(false);
            }}
          >
            {breedFilter ? 
              breedsData?.breeds?.items.find((b: any) => b.id === breedFilter)?.name || 'Breed Filter' 
              : 'All Breeds'}
            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        
        {isFilterOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
              <button
                onClick={() => {
                  setBreedFilter(null);
                  setIsFilterOpen(false);
                }}
                className={`block px-4 py-2 text-sm w-full text-left ${
                  breedFilter === null ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                }`}
                role="menuitem"
              >
                All Breeds
              </button>
              
              {breedsData?.breeds?.items.map((breed: any) => (
                <button
                  key={breed.id}
                  onClick={() => {
                    setBreedFilter(breed.id);
                    setIsFilterOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    breedFilter === breed.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  role="menuitem"
                >
                  {breed.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Sort dropdown */}
      <div className="relative inline-block text-left">
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsFilterOpen(false);
            }}
          >
            {getCurrentSortLabel()}
            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
          </button>
          
          <button
            type="button"
            onClick={toggleSortDirection}
            className="ml-2 p-2 rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            title={sortDirection === SortDirection.ASC ? 'Ascending' : 'Descending'}
          >
            {sortDirection === SortDirection.ASC ? (
              <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        {isSortOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortField(option.value);
                    setIsSortOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    sortField === option.value ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  role="menuitem"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Clear filters button */}
      {(searchQuery || breedFilter) && (
        <button
          type="button"
          onClick={() => {
            setSearchInput('');
            setSearchQuery('');
            setBreedFilter(null);
          }}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 hover:text-green-800"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterControls;
