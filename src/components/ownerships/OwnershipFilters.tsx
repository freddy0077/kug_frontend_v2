'use client';

import { useState } from 'react';

// Define dog option interface for dropdown
interface DogOption {
  id: number;
  name: string;
}

// Define ownership filter options
export interface OwnershipFilterOptions {
  statusFilter?: string;
  dogId?: number;
  searchQuery?: string;
  dateRange?: string;
}

interface OwnershipFiltersProps {
  onFilterChange: (filters: OwnershipFilterOptions) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  dogOptions: DogOption[];
}

export const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'last6months', label: 'Last 6 Months' },
  { value: 'lastYear', label: 'Last Year' }
];

export const statusOptions = [
  { value: 'all', label: 'All Records' },
  { value: 'current', label: 'Current Ownerships' },
  { value: 'previous', label: 'Previous Ownerships' }
];

const OwnershipFilters: React.FC<OwnershipFiltersProps> = ({
  onFilterChange,
  onSearchChange,
  searchQuery,
  dogOptions
}) => {
  // Filter states
  const [selectedDogId, setSelectedDogId] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  // Apply all filters
  const applyFilters = () => {
    onFilterChange({
      dogId: selectedDogId,
      statusFilter: selectedStatus,
      dateRange: selectedDateRange
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedDogId(undefined);
    setSelectedStatus('all');
    setSelectedDateRange('all');
    onFilterChange({
      dogId: undefined,
      statusFilter: 'all',
      dateRange: 'all'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Ownership Records</h2>
      
      {/* Search field */}
      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          type="text"
          id="search"
          className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Search by dog name, owner name, or registration number"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Dog filter */}
        <div>
          <label htmlFor="dog" className="block text-sm font-medium text-gray-700 mb-1">
            Dog
          </label>
          <select
            id="dog"
            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={selectedDogId || ''}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedDogId(value ? parseInt(value) : undefined);
            }}
          >
            <option value="">All Dogs</option>
            {dogOptions.map((dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Status filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Date range filter */}
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            id="dateRange"
            className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Filter buttons */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default OwnershipFilters;
