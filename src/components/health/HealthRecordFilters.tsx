'use client';

import { useState } from 'react';
import { HealthRecordType, HealthRecordFilterOptions, DogOption } from '@/types/healthRecord';

interface FilterOptions {
  dogId?: string;
  type?: HealthRecordType;
  startDate?: string;
  endDate?: string;
}

interface HealthRecordFiltersProps {
  onFilterChange: (filters: HealthRecordFilterOptions) => void;
  dogOptions: DogOption[];
}

export const HealthRecordFilters: React.FC<HealthRecordFiltersProps> = ({ 
  onFilterChange,
  dogOptions
}) => {
  const [filters, setFilters] = useState<HealthRecordFilterOptions>({});

  const handleFilterChange = (key: keyof HealthRecordFilterOptions, value: string) => {
    const newFilters = { 
      ...filters, 
      [key]: value === '' ? undefined : value 
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
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
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Type
          </label>
          <select
            id="typeFilter"
            className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => handleFilterChange('type', e.target.value as HealthRecordType)}
          >
            <option value="">All Types</option>
            {Object.values(HealthRecordType).map(type => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              id="startDate"
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              id="endDate"
              className="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecordFilters;
