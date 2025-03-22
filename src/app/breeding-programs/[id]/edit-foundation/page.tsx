'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import { GET_BREEDING_PROGRAM } from '@/graphql/queries/breedingProgramQueries';
import { UPDATE_BREEDING_PROGRAM } from '@/graphql/mutations/breedingProgramMutations';
import { GET_DOGS } from '@/graphql/queries/dogQueries';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function EditFoundationDogs() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const programId = params.id as string;
  
  // State for foundation dogs
  const [foundationDogIds, setFoundationDogIds] = useState<string[]>([]);
  const [availableDogs, setAvailableDogs] = useState<any[]>([]);
  const [selectedDogs, setSelectedDogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [programDetails, setProgramDetails] = useState<any>(null);

  // Fetch breeding program details
  const { data: programData, loading: programLoading, error: programError } = useQuery(GET_BREEDING_PROGRAM, {
    variables: { id: programId },
    skip: !programId,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.breedingProgram) {
        const program = data.breedingProgram;
        setProgramDetails(program);
        
        if (program.foundationDogs) {
          const dogIds = program.foundationDogs.map(dog => dog.id);
          setFoundationDogIds(dogIds);
          setSelectedDogs(program.foundationDogs);
        }
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching breeding program:', error);
      setIsLoading(false);
    }
  });

  // Fetch available dogs
  const { data: dogsData, loading: dogsLoading } = useQuery(GET_DOGS, {
    variables: {
      limit: 50,
      offset: 0,
      searchTerm: searchTerm,
      breed: programDetails?.breed || undefined
    },
    fetchPolicy: 'network-only',
    skip: isLoading || !programDetails,
  });

  // Update foundation dogs in the breeding program
  const [updateBreedingProgram] = useMutation(UPDATE_BREEDING_PROGRAM, {
    onCompleted: () => {
      setIsSubmitting(false);
      router.push(`/breeding-programs/${programId}`);
    },
    onError: (error) => {
      console.error('Error updating foundation dogs:', error);
      setIsSubmitting(false);
      alert('Failed to update foundation dogs. Please try again.');
    }
  });

  // Filter available dogs based on search term
  useEffect(() => {
    if (dogsData?.dogs?.items) {
      // Filter out dogs that are already selected as foundation dogs
      const dogs = dogsData.dogs.items.filter(
        dog => !foundationDogIds.includes(dog.id)
      );
      setAvailableDogs(dogs);
    }
  }, [dogsData, foundationDogIds]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Add dog to foundation dogs
  const addDog = (dog) => {
    setFoundationDogIds([...foundationDogIds, dog.id]);
    setSelectedDogs([...selectedDogs, dog]);
    setAvailableDogs(availableDogs.filter(d => d.id !== dog.id));
  };

  // Remove dog from foundation dogs
  const removeDog = (dogId) => {
    setFoundationDogIds(foundationDogIds.filter(id => id !== dogId));
    const removedDog = selectedDogs.find(dog => dog.id === dogId);
    setSelectedDogs(selectedDogs.filter(dog => dog.id !== dogId));
    
    // Add the removed dog back to available dogs if it matches the search term
    if (removedDog && (removedDog.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        removedDog.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))) {
      setAvailableDogs([...availableDogs, removedDog]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (foundationDogIds.length === 0) {
      alert('Please select at least one foundation dog for the breeding program.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateBreedingProgram({
        variables: {
          id: programId,
          foundationDogIds: foundationDogIds
        }
      });
    } catch (error) {
      console.error('Error updating foundation dogs:', error);
      setIsSubmitting(false);
    }
  };

  if (isLoading || programLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" color="border-blue-500" />
      </div>
    );
  }

  if (programError || !programData?.breedingProgram) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Breeding program not found or you don't have permission to access it.</span>
      </div>
    );
  }

  // Check if user has permission to edit this breeding program
  const canEditProgram = user && (user.id === programData.breedingProgram.breederId || user.role === UserRole.ADMIN);
  
  if (!canEditProgram) {
    router.push(`/breeding-programs/${programId}`);
    return null;
  }

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
                    <Link href={`/breeding-programs/${programId}`} className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2">
                      {programData.breedingProgram.name}
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-gray-500 md:ml-2 font-medium">Manage Foundation Dogs</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Manage Foundation Dogs</h1>
            <p className="mt-1 text-gray-600">
              Select the dogs that form the foundation of your breeding program. These are the dogs that will be used as the genetic base.
            </p>
          </div>

          {/* Foundation Dogs Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Selected Foundation Dogs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Foundation Dogs</h2>
              {selectedDogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No foundation dogs selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Use the search to find and add dogs to your breeding program</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-96">
                  <ul className="divide-y divide-gray-200">
                    {selectedDogs.map((dog) => (
                      <li key={dog.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {dog.mainImageUrl && (
                              <img className="h-10 w-10 rounded-full object-cover mr-4" src={dog.mainImageUrl} alt={dog.name} />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{dog.name}</p>
                              <p className="text-sm text-gray-500">
                                {dog.breed} • {dog.gender} • {dog.registrationNumber}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDog(dog.id)}
                            className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Available Dogs Search */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Foundation Dogs</h2>
              
              <div className="mb-4">
                <label htmlFor="search" className="sr-only">Search dogs</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search by name or registration number"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-96">
                {dogsLoading ? (
                  <div className="text-center py-4">
                    <LoadingSpinner size="md" color="border-blue-500" />
                  </div>
                ) : availableDogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No dogs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? `No dogs matching "${searchTerm}" were found. Try a different search term.` 
                        : 'No dogs are available to add. You may need to register more dogs.'}
                    </p>
                    {!searchTerm && (
                      <div className="mt-6">
                        <Link
                          href="/dogs/new"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Register New Dog
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {availableDogs.map((dog) => (
                      <li key={dog.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {dog.mainImageUrl && (
                              <img className="h-10 w-10 rounded-full object-cover mr-4" src={dog.mainImageUrl} alt={dog.name} />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{dog.name}</p>
                              <p className="text-sm text-gray-500">
                                {dog.breed} • {dog.gender} • {dog.registrationNumber}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => addDog(dog)}
                            className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <Link
              href={`/breeding-programs/${programId}`}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Foundation Dogs'}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
