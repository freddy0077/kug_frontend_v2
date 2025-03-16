'use client';

import React from 'react';
import Link from 'next/link';
import { useLitter } from '@/hooks/useLitters';
import { UserRole } from '@/utils/permissionUtils';
import { formatDate } from '@/utils/dateUtils';

interface LitterDetailsCardProps {
  litterId: string;
  userRole: UserRole;
  userId: string;
  showActions?: boolean;
}

/**
 * Component for displaying a litter's details using the custom useLitter hook
 */
const LitterDetailsCard: React.FC<LitterDetailsCardProps> = ({
  litterId,
  userRole,
  userId,
  showActions = true
}) => {
  // Use our custom hook to get litter data
  const { data: { litter } = { litter: undefined }, loading, error } = useLitter(litterId);
  
  // Handle loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading litter details: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle case where litter is not found
  if (!litter) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Litter not found. It may have been deleted or you do not have permission to view it.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user has edit permissions
  const canEdit = userRole === UserRole.ADMIN || 
                 (userRole === UserRole.OWNER && (
                   litter.sire.currentOwner?.id === userId || 
                   litter.dam.currentOwner?.id === userId
                 ));
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          {litter.litterName}
        </h2>
        
        {/* Show actions if requested */}
        {showActions && canEdit && (
          <div className="flex space-x-2">
            <Link
              href={`/litters/${litter.id}/edit`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Litter
            </Link>
            <Link
              href={`/litters/${litter.id}/register-puppies`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register Puppies
            </Link>
          </div>
        )}
      </div>
      
      {/* Litter details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Registration Number</h3>
          <p className="mt-1 text-sm text-gray-900">{litter.registrationNumber || 'Not registered'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Whelping Date</h3>
          <p className="mt-1 text-sm text-gray-900">{formatDate(litter.whelpingDate)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Puppies</h3>
          <p className="mt-1 text-sm text-gray-900">{litter.totalPuppies}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Gender Distribution</h3>
          <p className="mt-1 text-sm text-gray-900">
            {litter.malePuppies || 0} male, {litter.femalePuppies || 0} female
          </p>
        </div>
      </div>
      
      {/* Parents */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Parents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700">Sire</h4>
            <Link 
              href={`/dogs/${litter.sire.id}`}
              className="text-indigo-600 hover:text-indigo-900"
            >
              {litter.sire.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">Breed: {litter.sire.breed}</p>
            <p className="text-sm text-gray-500">Reg: {litter.sire.registrationNumber || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700">Dam</h4>
            <Link 
              href={`/dogs/${litter.dam.id}`}
              className="text-indigo-600 hover:text-indigo-900"
            >
              {litter.dam.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">Breed: {litter.dam.breed}</p>
            <p className="text-sm text-gray-500">Reg: {litter.dam.registrationNumber || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      {litter.notes && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Notes</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-line">{litter.notes}</p>
          </div>
        </div>
      )}
      
      {/* Puppies section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-700">Puppies</h3>
          {litter.puppies && litter.puppies.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {litter.puppies.length} registered
            </span>
          )}
        </div>
        
        {litter.puppies && litter.puppies.length > 0 ? (
          <div className="bg-gray-50 overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {litter.puppies.map(puppy => (
                <li key={puppy.id}>
                  <Link 
                    href={`/dogs/${puppy.id}`}
                    className="block hover:bg-gray-100"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">{puppy.name}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {puppy.gender === 'male' ? 'Male' : 'Female'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="truncate">{puppy.color || 'No color specified'}</span>
                          </p>
                        </div>
                        {puppy.currentOwner && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>Owner: {puppy.currentOwner.name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">No puppies have been registered for this litter yet.</p>
            {canEdit && (
              <Link
                href={`/litters/${litter.id}/register-puppies`}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register Puppies
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LitterDetailsCard;
