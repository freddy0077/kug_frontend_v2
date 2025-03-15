'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_DOG_OWNERSHIPS } from '@/graphql/queries/ownershipQueries';
import OwnershipHistory from '@/components/ownerships/OwnershipHistory';

export default function DogOwnershipsPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with navigation */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dog Ownership Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage ownership records for this dog
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            href={`/manage/dogs/${dogId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Dog Profile
          </Link>
          
          <Link
            href={`/manage/dogs/${dogId}/ownerships/transfer`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Transfer Ownership
          </Link>
        </div>
      </div>
      
      {/* Ownership History Component */}
      <OwnershipHistory dogId={dogId} />
      
      {/* Additional Actions */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Create New Owner</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a new owner to the system before transferring ownership
              </p>
              <div className="mt-4">
                <Link
                  href="/manage/owners/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Owner
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">View All Owners</h3>
              <p className="mt-1 text-sm text-gray-500">
                View and manage all owners in the system
              </p>
              <div className="mt-4">
                <Link
                  href="/manage/owners"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Manage Owners
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Generate Ownership Certificate</h3>
              <p className="mt-1 text-sm text-gray-500">
                Generate an official ownership certificate for this dog
              </p>
              <div className="mt-4">
                <button
                  onClick={() => alert('Certificate generation would happen here')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Generate Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
