'use client';

import { useState } from 'react';

interface FilterOptions {
  dogId?: number;
  category?: string;
  dateRange?: string;
}

// Define the category options available - matching enum CompetitionCategory from the schema
export const competitionCategories = [
  { id: "CONFORMATION", name: "Conformation" },
  { id: "OBEDIENCE", name: "Obedience" },
  { id: "AGILITY", name: "Agility" },
  { id: "FIELD_TRIALS", name: "Field Trials" },
  { id: "HERDING", name: "Herding" },
  { id: "TRACKING", name: "Tracking" },
  { id: "RALLY", name: "Rally" },
  { id: "SCENT_WORK", name: "Scent Work" }
];

interface CompetitionFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  dogOptions: { value: string; label: string }[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const CompetitionFilters: React.FC<CompetitionFiltersProps> = ({ 
  onFilterChange,
  dogOptions,
  searchQuery,
  onSearchChange
}) => {
  const [filters, setFilters] = useState<FilterOptions>({});

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { 
      ...filters, 
      [key]: value === '' ? undefined : key === 'dogId' ? parseInt(value) : value 
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by dog name, event, title, location..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* Filter controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="dogFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Dog
            </label>
            <select
              id="dogFilter"
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleFilterChange('dogId', e.target.value)}
            >
              <option value="">All Dogs</option>
              {dogOptions.map(dog => (
                <option key={dog.value} value={dog.value}>
                  {dog.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="categoryFilter"
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {competitionCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date
            </label>
            <select
              id="dateFilter"
              className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="">All Dates</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="last6months">Last 6 Months</option>
              <option value="lastYear">Last Year</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionFilters;
