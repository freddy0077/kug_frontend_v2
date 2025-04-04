import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AuditLogFilters, AuditAction } from '../../../../types/auditLogs';

interface FilterPanelProps {
  filters: AuditLogFilters;
  onFilterChange: (filters: Partial<AuditLogFilters>) => void;
  onReset: () => void;
}

// Define common entity types - this would ideally come from backend schema or configuration
const ENTITY_TYPES = [
  { value: 'user', label: 'User' },
  { value: 'dog', label: 'Dog' },
  { value: 'event', label: 'Event' },
  { value: 'health_record', label: 'Health Record' },
  { value: 'breeding_program', label: 'Breeding Program' },
  { value: 'pedigree', label: 'Pedigree' },
  { value: 'litter', label: 'Litter' },
  { value: 'breed', label: 'Breed' }
];

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState<AuditLogFilters>(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Apply filters
  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  // Handle input changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value ? (name === 'action' ? value as AuditAction : value) : undefined
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filter Logs</h3>
        <button onClick={onReset} className="text-sm text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Entity Type Filter */}
        <div>
          <label htmlFor="entityType" className="block text-sm font-medium text-gray-700">
            Entity Type
          </label>
          <select
            id="entityType"
            name="entityType"
            value={localFilters.entityType || ''}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">All Entity Types</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Filter */}
        <div>
          <label htmlFor="action" className="block text-sm font-medium text-gray-700">
            Action
          </label>
          <select
            id="action"
            name="action"
            value={localFilters.action || ''}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">All Actions</option>
            {Object.values(AuditAction).map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ').toLowerCase()
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onReset}
          className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset
        </button>
        <button
          onClick={handleApplyFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
