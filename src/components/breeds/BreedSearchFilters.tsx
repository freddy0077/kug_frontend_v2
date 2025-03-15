import React, { useState, useEffect } from 'react';
import { SortDirection } from '@/graphql/queries/breedQueries';

interface BreedSearchFiltersProps {
  onSearch: (filters: { searchTerm: string; sortDirection: SortDirection }) => void;
  initialSearchTerm?: string;
  initialSortDirection?: SortDirection;
}

const BreedSearchFilters: React.FC<BreedSearchFiltersProps> = ({
  onSearch,
  initialSearchTerm = '',
  initialSortDirection = SortDirection.ASC
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);

  // Initialize with initial values
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    setSortDirection(initialSortDirection);
  }, [initialSearchTerm, initialSortDirection]);

  // Debounce search term and trigger search
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch({
        searchTerm,
        sortDirection
      });
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, sortDirection, onSearch]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortDirection(e.target.value as SortDirection);
  };

  return (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
      <div className="flex-grow">
        <div className="relative">
          <input
            type="text"
            placeholder="Search breeds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="md:w-48">
        <select
          value={sortDirection}
          onChange={handleSortChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value={SortDirection.ASC}>A-Z</option>
          <option value={SortDirection.DESC}>Z-A</option>
        </select>
      </div>
    </div>
  );
};

export default BreedSearchFilters;
