import React from 'react';
import Link from 'next/link';
import { formatDateStr } from '@/utils/dateUtils';
import { UserRole } from '@/utils/permissionUtils';

interface PlannedMatingCardProps {
  plannedMating: {
    id: string;
    sire: {
      id: string;
      name: string;
      breed: string;
      mainImageUrl?: string;
    };
    dam: {
      id: string;
      name: string;
      breed: string;
      mainImageUrl?: string;
    };
    plannedBreedingDate: string;
    actualBreedingDate?: string;
    status: string;
    breedingProgram?: {
      id: string;
      name: string;
      breederId: string;
    };
    litter?: {
      id: string;
      whelppingDate: string;
      totalPuppies: number;
    };
  };
  userRole?: string;
  userId?: string;
  compact?: boolean;
}

export const PlannedMatingCard: React.FC<PlannedMatingCardProps> = ({
  plannedMating,
  userRole,
  userId,
  compact = false,
}) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return formatDateStr(dateString);
  };

  // Check if user has edit permissions
  const canEdit = userRole === UserRole.ADMIN || 
                 (plannedMating.breedingProgram?.breederId === userId &&
                  plannedMating.status === 'PLANNED');

  // Get status badge color
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-yellow-100 text-yellow-800';
      case 'BRED':
        return 'bg-blue-100 text-blue-800';
      case 'PREGNANT':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Determine which actions are available based on status
  const renderActions = () => {
    if (!canEdit) return null;

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <Link 
          href={`/breeding-programs/planned-matings/${plannedMating.id}/edit`}
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit
        </Link>
        
        {plannedMating.status === 'BRED' && (
          <Link 
            href={`/breeding-programs/planned-matings/${plannedMating.id}/record-litter`}
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Record Litter
          </Link>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <Link 
        href={`/breeding-programs/planned-matings/${plannedMating.id}`}
        className="block hover:bg-gray-50"
      >
        <div className="px-4 py-4 flex items-center sm:px-6">
          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex text-sm">
                <p className="font-medium text-blue-600 truncate">
                  {plannedMating.sire.name} × {plannedMating.dam.name}
                </p>
                <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                  ({plannedMating.sire.breed})
                </p>
              </div>
              <div className="mt-2 flex">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {plannedMating.status === 'PLANNED' 
                      ? `Planned for ${formatDate(plannedMating.plannedBreedingDate)}` 
                      : plannedMating.status === 'BRED' 
                        ? `Bred on ${formatDate(plannedMating.actualBreedingDate)}`
                        : plannedMating.status === 'COMPLETED' && plannedMating.litter
                          ? `Litter born ${formatDate(plannedMating.litter.whelppingDate)}`
                          : `Updated on ${formatDate(plannedMating.actualBreedingDate || plannedMating.plannedBreedingDate)}`
                    }
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(plannedMating.status)}`}>
                {plannedMating.status}
              </span>
            </div>
          </div>
          <div className="ml-5 flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              <Link 
                href={`/breeding-programs/planned-matings/${plannedMating.id}`}
                className="hover:text-blue-600"
              >
                {plannedMating.sire.name} × {plannedMating.dam.name}
              </Link>
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {plannedMating.sire.breed}
            </p>
          </div>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(plannedMating.status)}`}>
            {plannedMating.status}
          </span>
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Sire</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <Link href={`/dogs/${plannedMating.sire.id}`} className="text-blue-600 hover:text-blue-900">
                {plannedMating.sire.name}
              </Link>
            </dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Dam</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <Link href={`/dogs/${plannedMating.dam.id}`} className="text-blue-600 hover:text-blue-900">
                {plannedMating.dam.name}
              </Link>
            </dd>
          </div>
          
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Planned Breeding Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(plannedMating.plannedBreedingDate)}</dd>
          </div>
          
          {plannedMating.actualBreedingDate && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Actual Breeding Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(plannedMating.actualBreedingDate)}</dd>
            </div>
          )}
          
          {plannedMating.breedingProgram && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Breeding Program</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <Link 
                  href={`/breeding-programs/${plannedMating.breedingProgram.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  {plannedMating.breedingProgram.name}
                </Link>
              </dd>
            </div>
          )}
          
          {plannedMating.litter && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Litter</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <Link 
                  href={`/litters/${plannedMating.litter.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  {`Born ${formatDate(plannedMating.litter.whelppingDate)} • ${plannedMating.litter.totalPuppies} puppies`}
                </Link>
              </dd>
            </div>
          )}
        </div>
        
        {renderActions()}
      </div>
    </div>
  );
};

export default PlannedMatingCard;
