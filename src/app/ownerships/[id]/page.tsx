'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { GET_SINGLE_OWNERSHIP } from '@/graphql/ownerships';
import { UserRole } from '@/utils/permissionUtils';
import { useOwnerships } from '@/hooks/useOwnerships';

export default function OwnershipDetailsPage() {
  const params = useParams();
  const ownershipId = params.id as string;

  // Fetch single ownership details
  const { fetchSingleOwnership } = useOwnerships();
  const { ownership, loading, error } = fetchSingleOwnership(ownershipId);

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      </div>
    );
  }

  // If no ownership found
  if (!ownership) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Not Found: </strong>
          <span className="block sm:inline">No ownership record found for this ID.</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.CLUB]}>
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Ownership Details</h1>
          </div>

          {/* Dog Information */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dog Details */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Dog Information</h2>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>{' '}
                    <Link 
                      href={`/dogs/${ownership.dog.id}`} 
                      className="text-green-600 hover:underline"
                    >
                      {ownership.dog.name}
                    </Link>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Registration Number:</span>{' '}
                    {ownership.dog.registrationNumber}
                  </div>
                </div>
              </div>

              {/* Owner Details */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Owner Information</h2>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>{' '}
                    <Link 
                      href={`/owners/${ownership.owner.id}`} 
                      className="text-green-600 hover:underline"
                    >
                      {ownership.owner.name}
                    </Link>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Contact Email:</span>{' '}
                    {ownership.owner.contactEmail || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Ownership Details */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Ownership Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600">Start Date:</span>{' '}
                  {format(new Date(ownership.startDate), 'PP')}
                </div>
                <div>
                  <span className="font-medium text-gray-600">End Date:</span>{' '}
                  {ownership.endDate 
                    ? format(new Date(ownership.endDate), 'PP') 
                    : 'Current Ownership'}
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>{' '}
                  <span className={`badge ${ownership.is_current ? 'badge-success' : 'badge-ghost'}`}>
                    {ownership.is_current ? 'Current' : 'Previous'}
                  </span>
                </div>
                {ownership.transferDocumentUrl && (
                  <div>
                    <span className="font-medium text-gray-600">Transfer Document:</span>{' '}
                    <a 
                      href={ownership.transferDocumentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
            <Link 
              href={`/ownerships/transfer/${ownership.dog.id}`}
              className="btn btn-primary"
            >
              Transfer Ownership
            </Link>
            <Link 
              href="/ownerships"
              className="btn btn-ghost"
            >
              Back to Ownerships
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
