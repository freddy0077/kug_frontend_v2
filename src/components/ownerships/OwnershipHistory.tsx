'use client';

import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { GET_DOG_OWNERSHIPS } from '@/graphql/queries/ownershipQueries';

interface OwnershipHistoryProps {
  dogId: string;
}

const OwnershipHistory: React.FC<OwnershipHistoryProps> = ({ dogId }) => {
  // Fetch ownership data using GraphQL
  const { loading, error, data, refetch } = useQuery(GET_DOG_OWNERSHIPS, {
    variables: { dogId },
    fetchPolicy: 'network-only'
  });

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error('Invalid date format:', error);
      return 'Invalid date';
    }
  };

  // Sorting ownerships by startDate (most recent first)
  const sortedOwnerships = data?.dogOwnerships?.ownerships
    ? [...data.dogOwnerships.ownerships].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
    : [];

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ownership History</h2>
        <p className="text-red-500">Error loading ownership history: {error.message}</p>
      </div>
    );
  }

  if (!data?.dogOwnerships || sortedOwnerships.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ownership History</h2>
        <p className="text-gray-500">No ownership records available for this dog.</p>
      </div>
    );
  }

  const dogInfo = data.dogOwnerships.dog;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Ownership History</h2>
        <Link
          href={`/manage/dogs/${dogId}/ownerships/transfer`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Transfer Ownership
        </Link>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700">Dog Information</h3>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <span className="text-gray-500">Name:</span> {dogInfo.name}
          </div>
          <div>
            <span className="text-gray-500">Breed:</span> {dogInfo.breed}
          </div>
          {dogInfo.registrationNumber && (
            <div className="md:col-span-2">
              <span className="text-gray-500">Registration:</span> {dogInfo.registrationNumber}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {sortedOwnerships.map((ownership) => (
          <div
            key={ownership.id}
            className={`p-4 rounded-lg border ${
              ownership.is_current ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 className="font-medium text-lg">{ownership.owner.name}</h3>
                {ownership.owner.contactEmail && (
                  <p className="text-sm text-gray-600">{ownership.owner.contactEmail}</p>
                )}
              </div>
              <div className="mt-2 md:mt-0 flex items-center">
                <span className="text-gray-600 text-sm">
                  {formatDate(ownership.startDate)} - {ownership.endDate ? formatDate(ownership.endDate) : 'Present'}
                </span>
                {ownership.is_current && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Current
                  </span>
                )}
              </div>
            </div>
            {ownership.transferDocumentUrl && (
              <div className="mt-2">
                <a
                  href={ownership.transferDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Transfer Document
                </a>
              </div>
            )}
            <div className="mt-2 text-right">
              <Link
                href={`/manage/dogs/${dogId}/ownerships/${ownership.id}`}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnershipHistory;
