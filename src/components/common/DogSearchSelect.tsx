'use client';

import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_DOGS } from '@/graphql/queries/dogQueries';

// Simple debounce implementation for search
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface Dog {
  id: string;
  name: string;
  registrationNumber?: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  mainImageUrl?: string;
}

interface DogSearchSelectProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (dogId: string) => void;
  excludeIds?: string[];
  required?: boolean;
  error?: string;
  className?: string;
  filterGender?: 'MALE' | 'FEMALE';
}

const DogSearchSelect = ({
  label,
  placeholder = 'Search for a dog...',
  value,
  onChange,
  excludeIds = [],
  required = false,
  error,
  className = '',
  filterGender
}: DogSearchSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Query to search dogs with pagination
  const [searchDogs, { data, loading, fetchMore }] = useLazyQuery(SEARCH_DOGS, {
    variables: {
      searchTerm: debouncedSearchTerm,
      limit: 10,
      offset: 0,
      gender: filterGender,
      sortBy: "NAME",
      sortDirection: "ASC"
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only'
  });

  // Load selected dog details when value changes
  useEffect(() => {
    if (value && !selectedDog) {
      // If we have a dog ID but no details, search with empty criteria
      // and filter on the client side since the API doesn't have a direct
      // way to query by ID
      searchDogs({
        variables: {
          searchTerm: '',
          limit: 50, // Fetch enough dogs to hopefully include the one we need
          offset: 0,
          sortBy: "NAME",
          sortDirection: "ASC"
        }
      });
    } else if (!value) {
      setSelectedDog(null);
    }
  }, [value, selectedDog, searchDogs]);

  // Update search results when search term changes
  useEffect(() => {
    if (debouncedSearchTerm.length > 1 || debouncedSearchTerm === '') {
      searchDogs({
        variables: {
          searchTerm: debouncedSearchTerm,
          limit: 10,
          offset: 0,
          gender: filterGender,
          sortBy: "NAME",
          sortDirection: "ASC"
        }
      });
    }
  }, [debouncedSearchTerm, filterGender, searchDogs]);

  // Set selected dog when data changes and there's a match for the value
  useEffect(() => {
    if (data?.dogs?.items && value) {
      const matchingDog = data.dogs.items.find((dog: Dog) => dog.id === value);
      if (matchingDog) {
        setSelectedDog(matchingDog);
      }
    }
  }, [data, value]);

  // Filter out excluded dogs from results
  const filteredResults = data?.dogs?.items?.filter(
    (dog: Dog) => !excludeIds.includes(dog.id)
  ) || [];

  // Handle selection of a dog
  const handleSelectDog = (dog: Dog) => {
    setSelectedDog(dog);
    onChange(dog.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Format dog details for display
  const formatDogDisplay = (dog: Dog) => {
    const details = [];
    if (dog.registrationNumber) details.push(dog.registrationNumber);
    if (dog.breed) details.push(dog.breed.replace('-', ' '));
    if (dog.gender) details.push(dog.gender);
    
    // Format date of birth if available
    if (dog.dateOfBirth) {
      try {
        const date = new Date(dog.dateOfBirth);
        if (!isNaN(date.getTime())) {
          const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          details.push(`Born: ${formattedDate}`);
        }
      } catch (e) {
        // Ignore date formatting errors
      }
    }

    return (
      <div>
        <div className="font-medium">{dog.name}</div>
        {details.length > 0 && (
          <div className="text-xs text-gray-500">{details.join(' • ')}</div>
        )}
        {dog.mainImageUrl && (
          <div className="mt-1 flex items-center">
            <img 
              src={dog.mainImageUrl} 
              alt={dog.name}
              className="h-6 w-6 rounded-full object-cover mr-2"
            />
            <span className="text-xs text-green-600">Photo available</span>
          </div>
        )}
      </div>
    );
  };

  // Load more results when scrolling to the bottom
  const handleLoadMore = () => {
    if (data?.dogs?.hasMore) {
      fetchMore({
        variables: {
          offset: data.dogs.items.length,
          limit: 10,
          searchTerm: debouncedSearchTerm,
          gender: filterGender,
          sortBy: "NAME",
          sortDirection: "ASC"
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            dogs: {
              ...fetchMoreResult.dogs,
              items: [...prev.dogs.items, ...fetchMoreResult.dogs.items]
            }
          };
        }
      });
    }
  };

  // Detect when scroll is near bottom to trigger load more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 100;
    if (bottom && !loading && data?.dogs?.hasMore) {
      handleLoadMore();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={`dog-search-${label}`} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {/* Selected dog display or search input */}
        {selectedDog ? (
          <div
            className="flex items-center justify-between p-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer hover:bg-gray-50"
            onClick={() => setIsOpen(true)}
          >
            <div className="flex-1">{formatDogDisplay(selectedDog)}</div>
            <button
              type="button"
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDog(null);
                onChange('');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              id={`dog-search-${label}`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                error ? 'border-red-300' : ''
              }`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Error message */}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {/* Dropdown for search results */}
        {isOpen && (
          <div
            className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm max-h-60"
            onBlur={() => setIsOpen(false)}
            onScroll={handleScroll}
          >
            {loading && searchTerm.length > 1 && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
                <span className="ml-2 text-sm text-gray-600">Searching...</span>
              </div>
            )}

            {!loading && filteredResults.length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                {searchTerm.length > 1 ? 'No dogs found' : 'Type at least 2 characters to search'}
              </div>
            )}

            {filteredResults.map((dog: Dog) => (
              <div
                key={dog.id}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => handleSelectDog(dog)}
              >
                {formatDogDisplay(dog)}
              </div>
            ))}

            {!loading && data?.dogs?.hasMore && (
              <div className="text-center py-2 text-sm text-gray-500 border-t border-gray-100">
                Scroll for more results
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DogSearchSelect;
