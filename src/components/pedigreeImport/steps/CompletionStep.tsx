'use client';

import React from 'react';
import Link from 'next/link';
import { PedigreeImport } from '@/types/pedigreeImport';
import { formatDate } from '@/utils/formatters';

interface CompletionStepProps {
  importData: PedigreeImport | null;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ importData }) => {
  // If no import data is available, show error
  if (!importData) {
    return (
      <div className="bg-red-50 rounded-md p-4">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <div className="mt-2 text-sm text-red-700">
          <p>No pedigree import data found. Please go back and upload a PDF.</p>
        </div>
      </div>
    );
  }
  
  // Get all dogs from import
  const extractedDogs = importData.extractedDogs || [];
  const createdDogs = extractedDogs.filter(dog => dog.dogId);
  
  return (
    <div className="bg-white overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Import Complete</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500 mx-auto">
            <p>
              The pedigree import process has been completed successfully. 
              {createdDogs.length > 0 
                ? ` ${createdDogs.length} dogs have been registered in the system.`
                : ' No new dogs were registered.'}
            </p>
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-5 bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700">Import Results</h4>
          <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Import ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{importData.id}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Original File</dt>
              <dd className="mt-1 text-sm text-gray-900">{importData.originalFileName}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Import Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(importData.createdAt)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Completion Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {importData.completedAt ? formatDate(importData.completedAt) : 'N/A'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Dogs Found</dt>
              <dd className="mt-1 text-sm text-gray-900">{extractedDogs.length}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Dogs Registered</dt>
              <dd className="mt-1 text-sm text-gray-900">{createdDogs.length}</dd>
            </div>
          </dl>
        </div>
        
        {/* Imported Dogs List */}
        {createdDogs.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Registered Dogs</h4>
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Registration Number
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Breed
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {createdDogs.map((dog) => (
                    <tr key={dog.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dog.name || 'Unnamed Dog'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {dog.registrationNumber || dog.otherRegistrationNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dog.breed || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dog.dogId && (
                          <Link href={`/dogs/${dog.dogId}`} passHref>
                            <span className="text-green-600 hover:text-green-900 cursor-pointer">
                              View Dog
                            </span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-8 sm:flex sm:justify-center space-y-3 sm:space-y-0 sm:space-x-3">
          <Link href="/pedigrees/import" passHref>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto"
            >
              Start New Import
            </button>
          </Link>
          
          <Link href="/dogs" passHref>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto"
            >
              View All Dogs
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompletionStep;
