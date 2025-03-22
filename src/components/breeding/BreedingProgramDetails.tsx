import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/utils/permissionUtils';
import PlannedMatingList from './PlannedMatingList';
import { useBreedingProgramPlannedMatings } from '@/hooks/usePlannedMatings';
import { formatDateStr } from '@/utils/dateUtils';

interface BreedingProgramDetailsProps {
  breedingProgram: {
    id: string;
    name: string;
    description: string;
    breed: string;
    status: string;
    breederId: string;
    breeder: {
      id: string;
      name: string;
    };
    foundationDogs?: {
      id: string;
      name: string;
      breed: string;
      gender: string;
      mainImageUrl?: string;
    }[];
    goals?: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export const BreedingProgramDetails: React.FC<BreedingProgramDetailsProps> = ({
  breedingProgram,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');

  // Fetch planned matings for this breeding program
  const {
    plannedMatings,
    loading: loadingMatings,
    error: matingError,
    totalCount,
    pageInfo,
    fetchMore,
    updateFilters,
  } = useBreedingProgramPlannedMatings(breedingProgram.id);

  // Check if user is the owner or an admin
  const isOwnerOrAdmin = user && (
    user.id === breedingProgram.breederId || 
    user.role === UserRole.ADMIN
  );

  // Get status badge color
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'PLANNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {/* Header with action buttons */}
      <div className="px-4 py-5 sm:px-6 flex flex-wrap justify-between items-center">
        <div>
          <h3 className="text-xl leading-6 font-medium text-gray-900">
            {breedingProgram.name}
          </h3>
          <div className="mt-1 flex items-center">
            <p className="text-sm text-gray-500 mr-3">
              {breedingProgram.breed}
            </p>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(breedingProgram.status)}`}>
              {breedingProgram.status}
            </span>
          </div>
        </div>
        
        {isOwnerOrAdmin && (
          <div className="flex flex-wrap mt-2 sm:mt-0 gap-2">
            <Link
              href={`/breeding-programs/${breedingProgram.id}/edit`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </Link>
            <Link
              href={`/breeding-programs/${breedingProgram.id}/edit-foundation`}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Foundation Dogs
            </Link>
            <Link
              href={`/breeding-programs/planned-matings/add?breedingProgramId=${breedingProgram.id}`}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Plan Mating
            </Link>
          </div>
        )}
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('details')}
            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('foundation')}
            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'foundation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Foundation Dogs
          </button>
          <button
            onClick={() => setActiveTab('matings')}
            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'matings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Planned Matings
          </button>
          <button
            onClick={() => setActiveTab('litters')}
            className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'litters'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Litters
          </button>
        </nav>
      </div>
      
      {/* Content based on active tab */}
      <div className="px-4 py-5 sm:p-6">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{breedingProgram.description || 'No description provided.'}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Breed</dt>
                <dd className="mt-1 text-sm text-gray-900">{breedingProgram.breed}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Breeder</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Link href={`/breeders/${breedingProgram.breeder.id}`} className="text-blue-600 hover:text-blue-900">
                    {breedingProgram.breeder.name}
                  </Link>
                </dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Started</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDateStr(breedingProgram.createdAt)}</dd>
              </div>
              
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDateStr(breedingProgram.updatedAt)}</dd>
              </div>
              
              {breedingProgram.goals && breedingProgram.goals.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Breeding Goals</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {breedingProgram.goals.map((goal, index) => (
                        <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate">{goal}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Foundation Dogs Tab */}
        {activeTab === 'foundation' && (
          <div>
            {(!breedingProgram.foundationDogs || breedingProgram.foundationDogs.length === 0) ? (
              <div className="text-center py-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No foundation dogs</h3>
                {isOwnerOrAdmin && (
                  <div className="mt-6">
                    <Link
                      href={`/breeding-programs/${breedingProgram.id}/edit-foundation`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                      </svg>
                      Add Foundation Dogs
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {breedingProgram.foundationDogs.map((dog) => (
                  <div key={dog.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        {dog.mainImageUrl && (
                          <img 
                            src={dog.mainImageUrl} 
                            alt={dog.name} 
                            className="h-12 w-12 rounded-full object-cover mr-4"
                          />
                        )}
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            <Link href={`/dogs/${dog.id}`} className="text-blue-600 hover:text-blue-900">
                              {dog.name}
                            </Link>
                          </h4>
                          <p className="text-sm text-gray-500">
                            {dog.breed} • {dog.gender}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Planned Matings Tab */}
        {activeTab === 'matings' && (
          <div>
            <PlannedMatingList
              plannedMatings={plannedMatings}
              loading={loadingMatings}
              error={matingError}
              totalCount={totalCount}
              hasMore={pageInfo?.hasNextPage}
              onLoadMore={fetchMore}
              onFilterChange={updateFilters}
              showFilters={false}
              emptyMessage={`No planned matings found for ${breedingProgram.name}`}
              compact={true}
            />
            
            {isOwnerOrAdmin && plannedMatings.length === 0 && !loadingMatings && (
              <div className="mt-6 text-center">
                <Link
                  href={`/breeding-programs/planned-matings/add?breedingProgramId=${breedingProgram.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Plan a New Mating
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Litters Tab - This will be implemented in the future */}
        {activeTab === 'litters' && (
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No litters found</h3>
            <p className="mt-1 text-sm text-gray-500">Litters will appear here once they are recorded from planned matings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreedingProgramDetails;
