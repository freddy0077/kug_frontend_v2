import React from 'react';
import { SortDirection } from '@/graphql/queries/breedQueries';

interface BreedSearchBoxProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortDirection: SortDirection;
  onSortChange: (value: SortDirection) => void;
}

const BreedSearchBox: React.FC<BreedSearchBoxProps> = ({
  searchTerm,
  onSearchChange,
  sortDirection,
  onSortChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-grow">
      <div className="flex-grow">
        <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-1">
          Search Breeds
        </label>
        <div className="relative">
          <input
            id="search-term"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, group, origin..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="sm:w-48">
        <label htmlFor="sort-direction" className="block text-sm font-medium text-gray-700 mb-1">
          Sort Order
        </label>
        <select
          id="sort-direction"
          value={sortDirection}
          onChange={(e) => onSortChange(e.target.value as SortDirection)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value={SortDirection.ASC}>A to Z</option>
          <option value={SortDirection.DESC}>Z to A</option>
        </select>
      </div>
    </div>
  );
};

export default BreedSearchBox;
