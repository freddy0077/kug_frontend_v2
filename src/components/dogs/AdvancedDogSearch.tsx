'use client';

import React, { useState, useEffect } from 'react';
import { DogSortField, SortDirection } from '@/graphql/queries/dogQueries';

// Interface for all possible search filters
interface DogSearchFilters {
  searchQuery: string;
  breed: string;
  breedGroup: string;
  gender: string;
  minAge: number | null;
  maxAge: number | null;
  titles: string[];
  hasOffspring: boolean | null;
  isNeutered: boolean | null;
  sortField: DogSortField;
  sortDirection: SortDirection;
}

interface AdvancedDogSearchProps {
  filters: DogSearchFilters;
  onFiltersChange: (filters: DogSearchFilters) => void;
  breeds: { id: string; name: string; group: string }[];
  breedGroups: string[];
  loading?: boolean;
}

const AdvancedDogSearch: React.FC<AdvancedDogSearchProps> = ({
  filters,
  onFiltersChange,
  breeds,
  breedGroups,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<DogSearchFilters>(filters);
  const [appliedFilterCount, setAppliedFilterCount] = useState(0);

  // Calculate the number of active filters (excluding search query and sort)
  useEffect(() => {
    let count = 0;
    if (filters.breed) count++;
    if (filters.breedGroup) count++;
    if (filters.gender) count++;
    if (filters.minAge !== null) count++;
    if (filters.maxAge !== null) count++;
    if (filters.titles && filters.titles.length > 0) count++;
    if (filters.hasOffspring !== null) count++;
    if (filters.isNeutered !== null) count++;
    
    setAppliedFilterCount(count);
  }, [filters]);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle search input change (only updates local state)
  const handleSearchInputChange = (value: string) => {
    const updatedFilters = { ...localFilters, searchQuery: value };
    setLocalFilters(updatedFilters);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof DogSearchFilters, value: any) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
  };

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const resetState: DogSearchFilters = {
      searchQuery: '',
      breed: '',
      breedGroup: '',
      gender: '',
      minAge: null,
      maxAge: null,
      titles: [],
      hasOffspring: null,
      isNeutered: null,
      sortField: DogSortField.NAME,
      sortDirection: SortDirection.ASC
    };
    setLocalFilters(resetState);
    onFiltersChange(resetState);
  };

  // Toggle sort direction
  const toggleSort = (field: DogSortField) => {
    const updatedFilters = { 
      ...localFilters,
      sortField: field,
      sortDirection: localFilters.sortField === field && localFilters.sortDirection === SortDirection.ASC 
        ? SortDirection.DESC 
        : SortDirection.ASC
    };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-8 transition-all duration-300">
      {/* Search bar with filter button */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
        <div className="relative flex-grow flex">
          <input
            type="text"
            placeholder="Search by name, registration number, microchip..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={localFilters.searchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilters();
              }
            }}
            disabled={loading}
          />
          <button
            onClick={applyFilters}
            className="px-4 py-3 bg-green-600 text-white font-medium rounded-r-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
            disabled={loading}
          >
            Search
          </button>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters {appliedFilterCount > 0 && <span className="ml-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">{appliedFilterCount}</span>}
        </button>
      </div>

      {/* Advanced filter panel */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {/* Breed Group Filter */}
            <div>
              <label htmlFor="breed-group" className="block text-sm font-medium text-gray-700 mb-1">Breed Group</label>
              <select
                id="breed-group"
                value={localFilters.breedGroup}
                onChange={(e) => handleFilterChange('breedGroup', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                disabled={loading}
              >
                <option value="">All Breed Groups</option>
                {breedGroups.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            {/* Breed Filter */}
            <div>
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <select
                id="breed"
                value={localFilters.breed}
                onChange={(e) => handleFilterChange('breed', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                disabled={loading}
              >
                <option value="">All Breeds</option>
                {breeds
                  .filter(breed => !localFilters.breedGroup || breed.group === localFilters.breedGroup)
                  .map(breed => (
                    <option key={breed.id} value={breed.id}>{breed.name}</option>
                  ))
                }
              </select>
            </div>
            
            {/* Gender Filter */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                id="gender"
                value={localFilters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                disabled={loading}
              >
                <option value="">Any Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            
            {/* Age Range */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <label htmlFor="min-age" className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
                <input
                  type="number"
                  id="min-age"
                  min="0"
                  value={localFilters.minAge !== null ? localFilters.minAge : ''}
                  onChange={(e) => handleFilterChange('minAge', e.target.value ? parseInt(e.target.value) : null)}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  placeholder="Min"
                  disabled={loading}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="max-age" className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
                <input
                  type="number"
                  id="max-age"
                  min="0"
                  value={localFilters.maxAge !== null ? localFilters.maxAge : ''}
                  onChange={(e) => handleFilterChange('maxAge', e.target.value ? parseInt(e.target.value) : null)}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  placeholder="Max"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {/* Neutered Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Neutered Status</label>
              <div className="flex space-x-4 mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-green-600"
                    checked={localFilters.isNeutered === null}
                    onChange={() => handleFilterChange('isNeutered', null)}
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Any</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-green-600"
                    checked={localFilters.isNeutered === true}
                    onChange={() => handleFilterChange('isNeutered', true)}
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-green-600"
                    checked={localFilters.isNeutered === false}
                    onChange={() => handleFilterChange('isNeutered', false)}
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            {/* Has Offspring */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Has Offspring</label>
              <div className="flex space-x-4 mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-green-600"
                    checked={localFilters.hasOffspring === null}
                    onChange={() => handleFilterChange('hasOffspring', null)}
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Any</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-green-600"
                    checked={localFilters.hasOffspring === true}
                    onChange={() => handleFilterChange('hasOffspring', true)}
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-green-600"
                    checked={localFilters.hasOffspring === false}
                    onChange={() => handleFilterChange('hasOffspring', false)}
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sort options */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toggleSort(DogSortField.NAME)}
                className={`px-4 py-2 text-sm rounded-md ${
                  localFilters.sortField === DogSortField.NAME 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
                disabled={loading}
              >
                Name {localFilters.sortField === DogSortField.NAME && (
                  localFilters.sortDirection === SortDirection.ASC ? '↑' : '↓'
                )}
              </button>
              <button
                type="button"
                onClick={() => toggleSort(DogSortField.BREED)}
                className={`px-4 py-2 text-sm rounded-md ${
                  localFilters.sortField === DogSortField.BREED
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
                disabled={loading}
              >
                Breed {localFilters.sortField === DogSortField.BREED && (
                  localFilters.sortDirection === SortDirection.ASC ? '↑' : '↓'
                )}
              </button>
              <button
                type="button"
                onClick={() => toggleSort(DogSortField.DATE_OF_BIRTH)}
                className={`px-4 py-2 text-sm rounded-md ${
                  localFilters.sortField === DogSortField.DATE_OF_BIRTH
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
                disabled={loading}
              >
                Age {localFilters.sortField === DogSortField.DATE_OF_BIRTH && (
                  localFilters.sortDirection === SortDirection.ASC ? '↑' : '↓'
                )}
              </button>
              <button
                type="button"
                onClick={() => toggleSort(DogSortField.REGISTRATION_NUMBER)}
                className={`px-4 py-2 text-sm rounded-md ${
                  localFilters.sortField === DogSortField.REGISTRATION_NUMBER
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
                disabled={loading}
              >
                Registration # {localFilters.sortField === DogSortField.REGISTRATION_NUMBER && (
                  localFilters.sortDirection === SortDirection.ASC ? '↑' : '↓'
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loading}
            >
              Reset All
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={loading}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDogSearch;
