'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import { GET_BREEDING_PROGRAM } from '@/graphql/queries/breedingProgramQueries';
import { GET_BREEDING_PROGRAM_MATINGS } from '@/graphql/queries/plannedMatingQueries';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function BreedingProgramDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const programId = params.id as string;

  // Fetch breeding program details
  const { data: programData, loading: programLoading, error: programError } = useQuery(GET_BREEDING_PROGRAM, {
    variables: { id: programId },
    skip: !programId,
    fetchPolicy: 'network-only',
    onCompleted: () => {
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching breeding program:', error);
      setIsLoading(false);
    }
  });

  // Fetch planned matings for this breeding program
  const { data: matingsData, loading: matingsLoading } = useQuery(GET_BREEDING_PROGRAM_MATINGS, {
    variables: { breedingProgramId: programId },
    skip: !programId,
    fetchPolicy: 'network-only'
  });

  const breedingProgram = programData?.breedingProgram;
  const plannedMatings = matingsData?.plannedMatings || [];

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || programLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" color="border-blue-500" />
      </div>
    );
  }

  if (programError || !breedingProgram) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Breeding program not found or you don't have permission to access it.</span>
      </div>
    );
  }

  // Only owner of the breeding program or admins should see this page
  const canEditProgram = user && (user.id === breedingProgram.breederId || user.role === UserRole.ADMIN);

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
                    <span className="ml-1 text-gray-500 md:ml-2 font-medium">{breedingProgram.name}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Program Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">{breedingProgram.name}</h1>
                  <span className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${breedingProgram.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {breedingProgram.status}
                  </span>
                </div>
                <p className="mt-1 text-gray-600">{breedingProgram.description}</p>
              </div>
              {canEditProgram && (
                <div className="mt-4 md:mt-0 space-x-4">
                  <Link
                    href={`/breeding-programs/${breedingProgram.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Program
                  </Link>
                  <Link
                    href={`/breeding-programs/${breedingProgram.id}/planned-matings/add`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Add Planned Mating
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Program Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Program Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Breed</h3>
                    <p className="mt-1 text-base text-gray-900">{breedingProgram.breed}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Program Status</h3>
                    <p className="mt-1 text-base text-gray-900">{breedingProgram.status}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                    <p className="mt-1 text-base text-gray-900">{formatDate(breedingProgram.startDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                    <p className="mt-1 text-base text-gray-900">{formatDate(breedingProgram.endDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Visibility</h3>
                    <p className="mt-1 text-base text-gray-900">{breedingProgram.is_public ? 'Public' : 'Private'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created</h3>
                    <p className="mt-1 text-base text-gray-900">{formatDate(breedingProgram.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Breeding Goals</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {breedingProgram.goals && breedingProgram.goals.map((goal, index) => (
                    <li key={index} className="text-gray-700">{goal}</li>
                  ))}
                  {(!breedingProgram.goals || breedingProgram.goals.length === 0) && (
                    <li className="text-gray-500">No goals specified</li>
                  )}
                </ul>
              </div>

              {/* Foundation Dogs */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Foundation Dogs</h2>
                  {canEditProgram && (
                    <Link
                      href={`/breeding-programs/${breedingProgram.id}/edit-foundation`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Manage Dogs
                    </Link>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  {breedingProgram.foundationDogs && breedingProgram.foundationDogs.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Registration #
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Breed
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Gender
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date of Birth
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {breedingProgram.foundationDogs.map((dog) => (
                          <tr key={dog.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link href={`/dogs/${dog.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                                {dog.name}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dog.registrationNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dog.breed}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dog.gender}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(dog.dateOfBirth)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">No foundation dogs added yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar Information */}
            <div>
              {/* Breeder Information */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Breeder Information</h2>
                {breedingProgram.breeder ? (
                  <div>
                    <h3 className="font-medium text-gray-900">{breedingProgram.breeder.name}</h3>
                    <Link 
                      href={`/breeders/${breedingProgram.breederId}`}
                      className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      View Breeder Profile
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">Breeder information not available</p>
                )}
              </div>

              {/* Additional Program Details */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Testing</h2>
                <div className="prose prose-sm">
                  {breedingProgram.geneticTestingProtocol ? (
                    <div dangerouslySetInnerHTML={{ __html: breedingProgram.geneticTestingProtocol }} />
                  ) : (
                    <p className="text-gray-500">No genetic testing protocol specified</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Selection Criteria</h2>
                <div className="prose prose-sm">
                  {breedingProgram.selectionCriteria ? (
                    <div dangerouslySetInnerHTML={{ __html: breedingProgram.selectionCriteria }} />
                  ) : (
                    <p className="text-gray-500">No selection criteria specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Planned Matings */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Planned Matings</h2>
              {canEditProgram && (
                <Link
                  href={`/breeding-programs/${breedingProgram.id}/planned-matings/add`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Add Planned Mating
                </Link>
              )}
            </div>
            
            {plannedMatings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sire
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dam
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Planned Breeding Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plannedMatings.map((mating) => (
                      <tr key={mating.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/dogs/${mating.sire.id}`} className="text-blue-600 hover:text-blue-900">
                            {mating.sire.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/dogs/${mating.dam.id}`} className="text-blue-600 hover:text-blue-900">
                            {mating.dam.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              mating.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-800' : 
                              mating.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                              mating.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {mating.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(mating.plannedBreedingDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link href={`/breeding-programs/${breedingProgram.id}/planned-matings/${mating.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                            View
                          </Link>
                          {canEditProgram && mating.status === 'PLANNED' && (
                            <Link href={`/breeding-programs/${breedingProgram.id}/planned-matings/${mating.id}/edit`} className="text-blue-600 hover:text-blue-900">
                              Edit
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No planned matings yet. Add your first mating to get started.</p>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Program Results</h2>
            
            {breedingProgram.resultingLitters && breedingProgram.resultingLitters.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Litter ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Breeding Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Litter Size
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {breedingProgram.resultingLitters.map((litter) => (
                      <tr key={litter.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {litter.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(litter.breedingDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {litter.litterSize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link href={`/litters/${litter.id}`} className="text-blue-600 hover:text-blue-900">
                            View Litter
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No litters recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
