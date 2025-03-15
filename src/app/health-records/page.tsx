'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import HealthRecordListWithData from '@/components/health/HealthRecordListWithData';
import { useAuth } from '@/contexts/AuthContext';
import { GET_USER_DOGS } from '@/graphql/queries/dogQueries';
import { HealthRecordType } from '@/types/healthRecord';

interface DogOption {
  id: string;
  name: string;
}

interface HealthRecordFilterOptions {
  dogId?: string;
  type?: HealthRecordType;
  startDate?: string;
  endDate?: string;
}

export default function HealthRecordsPage() {
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState<HealthRecordFilterOptions>({});
  const [dogOptions, setDogOptions] = useState<DogOption[]>([]);
  
  // Fetch user's dogs
  const { data: dogsData, loading: dogsLoading, error: dogsError } = useQuery(GET_USER_DOGS, {
    skip: !user,
    fetchPolicy: 'network-only'
  });

  // Set up dog options once data is loaded
  useEffect(() => {
    if (dogsData?.userDogs) {
      const options = dogsData.userDogs.map((dog: any) => ({
        id: dog.id,
        name: dog.name
      }));
      
      setDogOptions(options);
      
      // Pre-select the first dog to show data by default
      if (options.length > 0 && !filters.dogId) {
        setFilters(prev => ({ ...prev, dogId: options[0].id }));
      }
    }
  }, [dogsData, filters.dogId]);

  // Handle filtering
  const handleFilterChange = (newFilters: HealthRecordFilterOptions) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle date range selection
  const handleDateRangeChange = (range: { startDate?: Date; endDate?: Date }) => {
    setFilters(prev => ({
      ...prev,
      startDate: range.startDate?.toISOString() || undefined,
      endDate: range.endDate?.toISOString() || undefined
    }));
  };

  if (authLoading || (dogsLoading && !dogOptions.length)) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Loading your dogs...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You need to be logged in to view health records.
                <Link href="/auth/login" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dogsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">
            Error loading your dogs: {dogsError.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Health Records
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {filters.dogId && (
            <Link 
              href={`/manage/dogs/${filters.dogId}/health/add`}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Health Record
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Filters
          </h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Dog Selection */}
            <div className="sm:col-span-2">
              <label htmlFor="dogId" className="block text-sm font-medium text-gray-700">
                Dog
              </label>
              <select
                id="dogId"
                name="dogId"
                value={filters.dogId || ''}
                onChange={(e) => handleFilterChange({ ...filters, dogId: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>Select a dog</option>
                {dogOptions.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Record Type */}
            <div className="sm:col-span-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Record Type
              </label>
              <select
                id="type"
                name="type"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange({ 
                  ...filters, 
                  type: e.target.value ? e.target.value as HealthRecordType : undefined 
                })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Types</option>
                {Object.values(HealthRecordType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Ranges */}
            <div className="sm:col-span-2">
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={filters.startDate ? new Date(filters.startDate).toISOString().substring(0, 10) : ''}
                  onChange={(e) => handleFilterChange({ 
                    ...filters, 
                    startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                  })}
                  className="block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={filters.endDate ? new Date(filters.endDate).toISOString().substring(0, 10) : ''}
                  onChange={(e) => handleFilterChange({ 
                    ...filters, 
                    endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                  })}
                  className="block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          {/* Filter Action Buttons */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setFilters({ dogId: filters.dogId })}
              className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Health Records List */}
      {filters.dogId ? (
        <HealthRecordListWithData
          dogId={filters.dogId}
          type={filters.type}
          startDate={filters.startDate}
          endDate={filters.endDate}
          limit={20}
        />
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Dog Selected</h3>
          <p className="mt-1 text-sm text-gray-500">Please select a dog to view their health records.</p>
        </div>
      )}
    </div>
  );
}
