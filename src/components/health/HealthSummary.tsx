'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_HEALTH_SUMMARY } from '@/graphql/queries/healthRecordQueries';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatDate } from '@/utils/dateUtils';

interface HealthSummaryProps {
  dogId: string;
}

export default function HealthSummary({ dogId }: HealthSummaryProps) {
  const { data, loading, error } = useQuery(GET_HEALTH_SUMMARY, {
    variables: { dogId },
    skip: !dogId,
    fetchPolicy: 'network-only' // Always fetch fresh data
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <LoadingSpinner size="medium" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-sm text-red-700">Error loading health summary: {error.message}</p>
      </div>
    );
  }
  
  const summary = data?.healthSummary;
  
  if (!summary) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Health Summary</h3>
        <p className="text-gray-500">No health records available.</p>
        <div className="mt-4">
          <Link 
            href={`/manage/dogs/${dogId}/health/add`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Add first health record
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Health Summary</h3>
        <Link 
          href={`/manage/dogs/${dogId}/health`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View all records ({summary.recordCount})
        </Link>
      </div>
      
      {/* Vaccination Status */}
      {summary.vaccinationStatus && (
        <div className="mb-6 p-4 rounded-md border" style={{
          backgroundColor: summary.vaccinationStatus.isUpToDate ? '#f0fdf4' : '#fff9f9',
          borderColor: summary.vaccinationStatus.isUpToDate ? '#86efac' : '#fecaca'
        }}>
          <div className="flex items-center">
            <div>
              {summary.vaccinationStatus.isUpToDate ? (
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium" style={{
                color: summary.vaccinationStatus.isUpToDate ? '#16a34a' : '#ef4444'
              }}>
                {summary.vaccinationStatus.isUpToDate 
                  ? 'Vaccinations Up to Date' 
                  : 'Vaccinations Need Attention'}
              </h3>
              <div className="mt-1 text-sm" style={{
                color: summary.vaccinationStatus.isUpToDate ? '#22c55e' : '#f87171'
              }}>
                {summary.vaccinationStatus.isUpToDate 
                  ? `Next due: ${formatDate(summary.vaccinationStatus.nextDueDate)}` 
                  : summary.vaccinationStatus.missingVaccinations
                    ? `Missing: ${summary.vaccinationStatus.missingVaccinations.join(', ')}`
                    : 'Vaccination records need to be updated'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Records by Type */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Records by Type</h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {summary.recordsByType?.map((item) => (
            <div key={item.type} className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm font-medium text-gray-700">
                {item.type.replace(/_/g, ' ')}
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Records */}
      {summary.recentRecords && summary.recentRecords.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Records</h4>
          <ul className="divide-y divide-gray-200">
            {summary.recentRecords.map((record) => (
              <li key={record.id} className="py-3">
                <Link href={`/manage/health-records/${record.id}`} className="block hover:bg-gray-50 -m-3 p-3 rounded-md">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-sm font-medium text-blue-600">{record.description}</span>
                      <span className="ml-2 text-xs font-medium text-gray-500">
                        {record.type?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
                  </div>
                  {record.results && (
                    <p className="mt-1 text-sm text-gray-600 truncate">{record.results}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 text-center">
            <Link 
              href={`/manage/dogs/${dogId}/health/add`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
            >
              Add New Record
            </Link>
          </div>
        </div>
      )}
      
      {/* Last Exam Date */}
      {summary.latestExamDate && (
        <div className="mt-4 text-sm text-gray-500">
          Last examination: {formatDate(summary.latestExamDate)}
        </div>
      )}
    </div>
  );
}
