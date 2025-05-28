"use client";

import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { FilterOptions } from '../types';

interface FilterPanelProps {
  filterOptions: FilterOptions;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filterOptions,
  onFilterChange,
  isFilterOpen,
  setIsFilterOpen
}) => {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filterOptions);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchTerm: e.target.value });
  };
  
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempFilters({ ...tempFilters, roleFilter: e.target.value });
  };
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTempFilters({ 
      ...tempFilters, 
      statusFilter: value === 'true' ? true : value === 'false' ? false : '' 
    });
  };
  
  const handleSortChange = (field: string) => {
    if (tempFilters.sortField === field) {
      setTempFilters({ 
        ...tempFilters, 
        sortDirection: tempFilters.sortDirection === 'asc' ? 'desc' : 'asc' 
      });
    } else {
      setTempFilters({ ...tempFilters, sortField: field, sortDirection: 'asc' });
    }
  };
  
  const applyFilters = () => {
    onFilterChange(tempFilters);
    setIsFilterOpen(false);
  };
  
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={filterOptions.searchTerm}
            onChange={handleSearchChange}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-lg"
          />
        </div>
        
        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>
      
      {/* Filter Panel - Only visible when isFilterOpen is true */}
      {isFilterOpen && (
        <div className="mt-4 bg-white shadow rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filter Options</h3>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Role Filter */}
            <div>
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role-filter"
                value={tempFilters.roleFilter}
                onChange={handleRoleFilterChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg"
              >
                <option value="">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Administrator</option>
                <option value="OWNER">Owner</option>
                <option value="HANDLER">Handler</option>
                <option value="CLUB">Club</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={String(tempFilters.statusFilter)}
                onChange={handleStatusFilterChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            
            {/* Sort Options */}
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort-by"
                value={tempFilters.sortField}
                onChange={(e) => handleSortChange(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg"
              >
                <option value="fullName">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
                <option value="createdAt">Date Joined</option>
                <option value="lastLogin">Last Active</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setTempFilters({
                  searchTerm: '',
                  roleFilter: '',
                  statusFilter: '',
                  sortField: 'createdAt',
                  sortDirection: 'desc'
                });
              }}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
