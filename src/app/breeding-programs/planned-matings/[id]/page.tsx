'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import { GET_PLANNED_MATING } from '@/graphql/queries/plannedMatingQueries';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PlannedMatingDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const matingId = params.id as string;
  
  // Fetch planned mating details
  const { data, loading, error } = useQuery(GET_PLANNED_MATING, {
    variables: { id: matingId },
    skip: !matingId,
    fetchPolicy: 'network-only',
    onCompleted: () => {
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching planned mating:', error);
      setIsLoading(false);
    }
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if user has permission to view this planned mating
  const canEdit = user && (
    user.role === UserRole.ADMIN || 
    (data?.plannedMating?.breedingProgram?.breederId === user.id && 
     data?.plannedMating?.status === 'PLANNED')
  );

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" color="border-blue-500" />
      </div>
    );
  }

  if (error || !data?.plannedMating) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Planned mating not found or you don't have permission to access it.</span>
      </div>
    );
  }

  const { plannedMating } = data;

  return (
    <ProtectedRoute allowedRoles={[UserRole.OWNER, UserRole.ADMIN]}>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link href="/breeding-programs" className="text-gray-600 hover:text-gray-900">
                    Breeding Programs
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <Link href="/breeding-programs/planned-matings" className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2">
                      Planned Matings
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-gray-500 md:ml-2 font-medium">Mating Details</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Planned Mating: {plannedMating.sire.name} × {plannedMating.dam.name}
                </h1>
                <p className="mt-1 text-gray-600">
                  {plannedMating.breed || plannedMating.sire.breed} • Planned for {formatDate(plannedMating.plannedBreedingDate)}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-3">
                {canEdit && (
                  <Link
                    href={`/breeding-programs/planned-matings/${matingId}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </Link>
                )}
                
                <Link
                  href="/breeding-programs/planned-matings"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Planned Matings
                </Link>
              </div>
            </div>
          </div>

          {/* Mating Status */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Status</h2>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                ${plannedMating.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-800' : 
                  plannedMating.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                  plannedMating.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'}`}
              >
                {plannedMating.status}
              </span>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Planned Breeding Date</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(plannedMating.plannedBreedingDate)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Actual Breeding Date</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(plannedMating.actualBreedingDate)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Expected Litter Size</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {plannedMating.expectedLitterSize ? `${plannedMating.expectedLitterSize} puppies` : 'Not specified'}
                </p>
              </div>
            </div>
            
            {plannedMating.litter && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-base font-medium text-green-600">Litter Result</h3>
                <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Whelpping Date</h4>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(plannedMating.litter.whelppingDate)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Total Puppies</h4>
                    <p className="mt-1 text-sm text-gray-900">{plannedMating.litter.totalPuppies}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Male Puppies</h4>
                    <p className="mt-1 text-sm text-gray-900">{plannedMating.litter.malePuppies}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Female Puppies</h4>
                    <p className="mt-1 text-sm text-gray-900">{plannedMating.litter.femalePuppies}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link
                    href={`/litters/${plannedMating.litter.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Litter Details
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Dogs Information */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mb-8">
            {/* Sire Information */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <h2 className="text-lg font-semibold text-gray-900">Sire</h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {plannedMating.sire.mainImageUrl && (
                    <img 
                      src={plannedMating.sire.mainImageUrl} 
                      alt={plannedMating.sire.name}
                      className="h-16 w-16 rounded-full object-cover mr-4"
                    />
                  )}
                  
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">
                      <Link href={`/dogs/${plannedMating.sireId}`} className="text-blue-600 hover:text-blue-900">
                        {plannedMating.sire.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">
                      {plannedMating.sire.breed} • {plannedMating.sire.registrationNumber}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                    <p className="text-sm text-gray-900">{formatDate(plannedMating.sire.dateOfBirth)}</p>
                  </div>
                  
                  {plannedMating.sire.healthRecords && plannedMating.sire.healthRecords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Health Records</h4>
                      <ul className="mt-1 space-y-1">
                        {plannedMating.sire.healthRecords.slice(0, 3).map((record) => (
                          <li key={record.id} className="text-sm text-gray-900">
                            {record.description}: {record.results} ({formatDate(record.testDate)})
                          </li>
                        ))}
                        {plannedMating.sire.healthRecords.length > 3 && (
                          <li className="text-sm text-blue-600">
                            <Link href={`/dogs/${plannedMating.sireId}/health`}>
                              View all health records...
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dam Information */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-pink-50 p-4 border-b border-pink-100">
                <h2 className="text-lg font-semibold text-gray-900">Dam</h2>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {plannedMating.dam.mainImageUrl && (
                    <img 
                      src={plannedMating.dam.mainImageUrl} 
                      alt={plannedMating.dam.name}
                      className="h-16 w-16 rounded-full object-cover mr-4"
                    />
                  )}
                  
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">
                      <Link href={`/dogs/${plannedMating.damId}`} className="text-blue-600 hover:text-blue-900">
                        {plannedMating.dam.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">
                      {plannedMating.dam.breed} • {plannedMating.dam.registrationNumber}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                    <p className="text-sm text-gray-900">{formatDate(plannedMating.dam.dateOfBirth)}</p>
                  </div>
                  
                  {plannedMating.dam.healthRecords && plannedMating.dam.healthRecords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Health Records</h4>
                      <ul className="mt-1 space-y-1">
                        {plannedMating.dam.healthRecords.slice(0, 3).map((record) => (
                          <li key={record.id} className="text-sm text-gray-900">
                            {record.description}: {record.results} ({formatDate(record.testDate)})
                          </li>
                        ))}
                        {plannedMating.dam.healthRecords.length > 3 && (
                          <li className="text-sm text-blue-600">
                            <Link href={`/dogs/${plannedMating.damId}/health`}>
                              View all health records...
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Breeding Program Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Breeding Program</h2>
            
            {plannedMating.breedingProgram ? (
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  <Link 
                    href={`/breeding-programs/${plannedMating.breedingProgramId}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {plannedMating.breedingProgram.name}
                  </Link>
                </h3>
                
                {plannedMating.geneticGoals && plannedMating.geneticGoals.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Genetic Goals for this Mating</h4>
                    <div className="flex flex-wrap gap-2">
                      {plannedMating.geneticGoals.map((goal, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">This planned mating is not associated with any breeding program.</p>
            )}
          </div>

          {/* Notes */}
          {plannedMating.notes && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <div className="prose max-w-none">
                <p>{plannedMating.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
