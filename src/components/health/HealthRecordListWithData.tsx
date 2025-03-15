'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDogHealthRecords } from '@/hooks/useHealthRecords';
import { HealthRecordType } from '@/types/healthRecord';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatDate } from '@/utils/dateUtils';

interface HealthRecordListWithDataProps {
  dogId: string;
  type?: HealthRecordType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export default function HealthRecordListWithData({
  dogId,
  type,
  startDate,
  endDate,
  limit = 20
}: HealthRecordListWithDataProps) {
  const [filterOptions, setFilterOptions] = useState({
    type,
    startDate,
    endDate
  });
  
  const { healthRecords, totalCount, hasMore, loading, error, loadMore } = useDogHealthRecords(
    dogId,
    {
      limit,
      type: filterOptions.type,
      startDate: filterOptions.startDate,
      endDate: filterOptions.endDate
    }
  );
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }));
  };
  
  // Get badge color based on health record type
  const getBadgeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      [HealthRecordType.VACCINATION]: 'bg-green-100 text-green-800',
      [HealthRecordType.EXAMINATION]: 'bg-blue-100 text-blue-800',
      [HealthRecordType.SURGERY]: 'bg-red-100 text-red-800',
      [HealthRecordType.TEST]: 'bg-purple-100 text-purple-800',
      [HealthRecordType.MEDICATION]: 'bg-yellow-100 text-yellow-800',
      [HealthRecordType.GENERAL]: 'bg-gray-100 text-gray-800'
    };
    
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };
  
  if (loading && healthRecords.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading health records: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (healthRecords.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No health records</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new health record.</p>
        <div className="mt-6">
          <Link href={`/manage/dogs/${dogId}/health/add`} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Health Record
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {healthRecords.map((record) => (
            <li key={record.id}>
              <Link href={`/manage/health-records/${record.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {record.description}
                      </p>
                      <div className={`ml-2 flex-shrink-0 flex`}>
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(record.type)}`}>
                          {record.type?.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="text-sm text-gray-500">
                        {formatDate(record.date)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {record.results || "No results recorded"}
                      </p>
                    </div>
                    {record.veterinarian && (
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <p>
                          {record.vetName || record.veterinarian}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
      
      <div className="mt-4 text-center text-sm text-gray-500">
        Showing {healthRecords.length} of {totalCount} records
      </div>
    </div>
  );
}
