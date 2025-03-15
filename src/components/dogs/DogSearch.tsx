'use client';

import React, { useState } from 'react';

interface DogSearchProps {
  onSearch: (filters: DogSearchFilters) => void;
  breedOptions: { id: string; name: string }[];
}

export interface DogSearchFilters {
  name?: string;
  breed?: string;
  gender?: 'male' | 'female' | '';
  color?: string;
  ageMin?: number;
  ageMax?: number;
  registrationNumber?: string;
}

export default function DogSearch({ onSearch, breedOptions }: DogSearchProps) {
  const [filters, setFilters] = useState<DogSearchFilters>({
    name: '',
    breed: '',
    gender: '',
    color: '',
    ageMin: undefined,
    ageMax: undefined,
    registrationNumber: ''
  });

  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      name: '',
      breed: '',
      gender: '',
      color: '',
      ageMin: undefined,
      ageMax: undefined,
      registrationNumber: ''
    });
    onSearch({});
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Search Dogs
        </h3>
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
            {/* Basic Search */}
            <div className="sm:col-span-6">
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={filters.name}
                  onChange={handleChange}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by dog name"
                />
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Search
                </button>
                <button
                  type="button"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Toggle Advanced Search */}
            <div className="sm:col-span-6">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none"
                onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
              >
                {isAdvancedSearch ? 'Hide Advanced Search' : 'Show Advanced Search'}
              </button>
            </div>

            {/* Advanced Search Options */}
            {isAdvancedSearch && (
              <>
                <div className="sm:col-span-2">
                  <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                    Breed
                  </label>
                  <div className="mt-1">
                    <select
                      id="breed"
                      name="breed"
                      value={filters.breed}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Any Breed</option>
                      {breedOptions.map(breed => (
                        <option key={breed.id} value={breed.id}>
                          {breed.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <div className="mt-1">
                    <select
                      id="gender"
                      name="gender"
                      value={filters.gender}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Any Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="color"
                      id="color"
                      value={filters.color}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Any color"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="ageMin" className="block text-sm font-medium text-gray-700">
                    Min Age (years)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="ageMin"
                      id="ageMin"
                      min={0}
                      value={filters.ageMin || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="ageMax" className="block text-sm font-medium text-gray-700">
                    Max Age (years)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="ageMax"
                      id="ageMax"
                      min={0}
                      value={filters.ageMax || ''}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                    Registration Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="registrationNumber"
                      id="registrationNumber"
                      value={filters.registrationNumber}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g. AKC12345"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
