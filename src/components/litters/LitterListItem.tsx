'use client';

import React from 'react';
import Link from 'next/link';
import { Litter } from '@/hooks/useLitters';
import { UserRole } from '@/utils/permissionUtils';
import { formatDate } from '@/utils/dateUtils';

interface LitterListItemProps {
  litter: Litter;
  userRole: UserRole;
  userId: string;
}

/**
 * Component for displaying a single litter item in a list
 * Uses the Litter type from our custom hooks for type safety
 */
const LitterListItem: React.FC<LitterListItemProps> = ({
  litter,
  userRole,
  userId
}) => {
  // Check if user has edit permissions
  const canEdit = userRole === UserRole.ADMIN || 
                 (userRole === UserRole.OWNER && (
                   litter.sire.currentOwner?.id === userId || 
                   litter.dam.currentOwner?.id === userId
                 ));
  
  // Calculate puppy stats
  const puppiesRegistered = litter.puppies?.length || 0;
  const registrationPercentage = litter.totalPuppies > 0 
    ? Math.round((puppiesRegistered / litter.totalPuppies) * 100) 
    : 0;
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      {/* Basic litter information */}
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              <Link href={`/litters/${litter.id}`} className="hover:underline">
                {litter.litterName}
              </Link>
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Whelped on {formatDate(litter.whelpingDate)}
            </p>
          </div>
          
          {canEdit && (
            <div className="flex space-x-2">
              <Link
                href={`/litters/${litter.id}/edit`}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit
              </Link>
              {puppiesRegistered < litter.totalPuppies && (
                <Link
                  href={`/litters/${litter.id}/register-puppies`}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register Puppies
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Parents and puppies information */}
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Parents</h4>
            <div className="mt-2 flex items-center text-sm text-gray-700">
              <div className="flex-1">
                <span className="font-medium">Sire:</span>{' '}
                <Link href={`/dogs/${litter.sire.id}`} className="text-indigo-600 hover:text-indigo-900">
                  {litter.sire.name}
                </Link>
              </div>
              <div className="flex-1">
                <span className="font-medium">Dam:</span>{' '}
                <Link href={`/dogs/${litter.dam.id}`} className="text-indigo-600 hover:text-indigo-900">
                  {litter.dam.name}
                </Link>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Puppies</h4>
            <div className="mt-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">
                  {puppiesRegistered} of {litter.totalPuppies} registered ({registrationPercentage}%)
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${registrationPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {litter.malePuppies || 0} males, {litter.femalePuppies || 0} females
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional information and registration status */}
      <div className="px-4 py-4 sm:px-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Registration: {litter.registrationNumber || 'Not registered'}
          </div>
          <div>
            {litter.registrationNumber ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Registered
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending Registration
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LitterListItem;
