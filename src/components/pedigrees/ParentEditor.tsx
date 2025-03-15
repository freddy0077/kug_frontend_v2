'use client';

import React, { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_DOGS, LINK_DOG_TO_PARENTS } from '@/graphql/queries/dogQueries';
import { toast } from 'react-hot-toast';
import { DogNode } from '@/utils/pedigreeFormatters';

interface Dog {
  id: string;
  name: string;
  breed?: string;
  registrationNumber?: string;
  gender?: string;
}

interface GetDogsData {
  dogs: {
    items: Dog[];
    totalCount: number;
    hasMore: boolean;
  };
}

interface GetDogsVars {
  searchTerm?: string;
  gender?: string;
  limit?: number;
  offset?: number;
}

interface LinkDogToParentsData {
  linkDogToParents: {
    id: string;
    name: string;
    sire?: {
      id: string;
      name: string;
    };
    dam?: {
      id: string;
      name: string;
    };
  };
}

interface LinkDogToParentsVars {
  dogId: string;
  sireId?: string;
  damId?: string;
}

interface ParentEditorProps {
  dogId: string;
  dogName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentSire?: DogNode | null;
  currentDam?: DogNode | null;
  mode: 'add' | 'edit';
}

const ParentEditor: React.FC<ParentEditorProps> = ({
  dogId,
  dogName,
  isOpen,
  onClose,
  onSuccess,
  currentSire,
  currentDam,
  mode = 'edit',
}) => {
  const [searchTermSire, setSearchTermSire] = useState('');
  const [searchTermDam, setSearchTermDam] = useState('');
  const [selectedSire, setSelectedSire] = useState<Dog | null>(
    currentSire && currentSire.id ? { id: currentSire.id, name: currentSire.name, breed: currentSire.breed, registrationNumber: currentSire.registrationNumber } as Dog : null
  );
  const [selectedDam, setSelectedDam] = useState<Dog | null>(
    currentDam && currentDam.id ? { id: currentDam.id, name: currentDam.name, breed: currentDam.breed, registrationNumber: currentDam.registrationNumber } as Dog : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset the component state when the dog changes
  useEffect(() => {
    if (isOpen) {
      setSelectedSire(
        currentSire && currentSire.id ? { id: currentSire.id, name: currentSire.name, breed: currentSire.breed, registrationNumber: currentSire.registrationNumber } as Dog : null
      );
      setSelectedDam(
        currentDam && currentDam.id ? { id: currentDam.id, name: currentDam.name, breed: currentDam.breed, registrationNumber: currentDam.registrationNumber } as Dog : null
      );
      setSearchTermSire('');
      setSearchTermDam('');
    }
  }, [isOpen, currentSire, currentDam]);

  // Query for sires (male dogs)
  const [getSires, { 
    loading: loadingSires, 
    error: errorSires, 
    data: sireData 
  }] = useLazyQuery<GetDogsData, GetDogsVars>(GET_DOGS, {
    variables: { 
      searchTerm: searchTermSire,
      gender: 'male',
      limit: 20,
      offset: 0 // Add pagination params to ensure we get results
    },
    fetchPolicy: 'network-only',
  });

  // Query for dams (female dogs)
  const [getDams, { 
    loading: loadingDams, 
    error: errorDams, 
    data: damData 
  }] = useLazyQuery<GetDogsData, GetDogsVars>(GET_DOGS, {
    variables: { 
      searchTerm: searchTermDam,
      gender: 'female',
      limit: 20,
      offset: 0 // Add pagination params to ensure we get results
    },
    fetchPolicy: 'network-only',
  });

  // Mutation to update dog parents
  const [linkDogToParents] = useMutation<LinkDogToParentsData, LinkDogToParentsVars>(
    LINK_DOG_TO_PARENTS,
    {
      onCompleted: (data) => {
        setIsSubmitting(false);
        toast.success(`Parents ${mode === 'add' ? 'added' : 'updated'} successfully!`);
        // Call onSuccess with no parameters as defined in the interface
        onSuccess();
        onClose();
      },
      onError: (error) => {
        setIsSubmitting(false);
        
        console.error('Parent linking error details:', {
          dogId,
          sireId: selectedSire?.id, 
          damId: selectedDam?.id,
          errorMessage: error.message,
          graphQLError: error
        });
        
        // Handle specific error for ambiguous column name
        if (error.message.includes('ambiguous column name')) {
          toast.error('Database error: Column name conflict. Please contact support.');
        } else if (error.message.includes('Invalid dog ID')) {
          toast.error(
            'Error: The server could not find one or more of the dog IDs provided. ' +
            'This may be because the dog records don\'t exist in the database or an ID format issue.'
          );
        } else {
          toast.error(`Error ${mode === 'add' ? 'adding' : 'updating'} parents: ${error.message}`);
        }
      },
    }
  );

  // Automatically trigger search when search terms change
  useEffect(() => {
    if (searchTermSire.length > 0) {
      const debounceTimer = setTimeout(() => {
        getSires({
          variables: {
            searchTerm: searchTermSire,
            gender: 'male',
            limit: 20,
            offset: 0
          }
        });
      }, 300); // Debounce to prevent too many API calls
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTermSire]);

  useEffect(() => {
    if (searchTermDam.length > 0) {
      const debounceTimer = setTimeout(() => {
        getDams({
          variables: {
            searchTerm: searchTermDam,
            gender: 'female',
            limit: 20,
            offset: 0
          }
        });
      }, 300); // Debounce to prevent too many API calls
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTermDam]);

  // Keep these handlers for the search buttons
  const handleSearchSires = () => {
    if (searchTermSire.length > 0) {
      getSires({
        variables: {
          searchTerm: searchTermSire,
          gender: 'male',
          limit: 20,
          offset: 0
        }
      });
    }
  };

  const handleSearchDams = () => {
    if (searchTermDam.length > 0) {
      getDams({
        variables: {
          searchTerm: searchTermDam,
          gender: 'female',
          limit: 20,
          offset: 0
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null); // Clear any previous errors
    
    // Validate that dogId exists and is non-empty
    if (!dogId) {
      toast.error('Invalid dog ID');
      setIsSubmitting(false);
      return;
    }
    
    // Gender validation
    if (selectedSire && selectedSire.gender && selectedSire.gender !== 'male') {
      setApiError('Sire must be a male dog');
      toast.error('Sire must be a male dog');
      setIsSubmitting(false);
      return;
    }
    
    if (selectedDam && selectedDam.gender && selectedDam.gender !== 'female') {
      setApiError('Dam must be a female dog');
      toast.error('Dam must be a female dog');
      setIsSubmitting(false);
      return;
    }
    
    // Log key information for debugging
    console.log('Attempting to link dog to parents:', {
      dogId,
      selectedSireId: selectedSire?.id,
      selectedDamId: selectedDam?.id
    });
    
    // Verify IDs follow expected format (assuming UUID format)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidPattern.test(dogId)) {
      toast.error(`The dog ID ${dogId} doesn't appear to be in the correct UUID format`);
      setIsSubmitting(false);
      return;
    }
    
    // Only include sireId and damId if they are valid non-empty values
    const variables: LinkDogToParentsVars = { dogId };
    
    if (selectedSire?.id) {
      if (!uuidPattern.test(selectedSire.id)) {
        toast.error(`The sire ID ${selectedSire.id} doesn't appear to be in the correct UUID format`);
        setIsSubmitting(false);
        return;
      }
      variables.sireId = selectedSire.id;
    }
    
    if (selectedDam?.id) {
      if (!uuidPattern.test(selectedDam.id)) {
        toast.error(`The dam ID ${selectedDam.id} doesn't appear to be in the correct UUID format`);
        setIsSubmitting(false);
        return;
      }
      variables.damId = selectedDam.id;
    }
    
    // Make sure we have at least one parent selected
    if (!variables.sireId && !variables.damId) {
      toast.error('Please select at least one parent (sire or dam)');
      setIsSubmitting(false);
      return;
    }
    
    // Log the final variables we're sending to the server
    console.log('Submitting parent linking with variables:', variables);
    
    // Try to verify the dog exists by fetching it first
    try {
      // Store original error message to display to user if all attempts fail
      let errorMessage = '';
      
      linkDogToParents({
        variables,
        onError: (error) => {
          // Store the error message for later
          errorMessage = error.message;
          
          // Set API error for display in modal
          setApiError(error.message);
          
          // Log the error for debugging
          console.error('First attempt failed:', error.message);
          
          // Try with just the sire if both were provided
          if (variables.sireId && variables.damId) {
            console.log('Trying with just sire...');
            linkDogToParents({
              variables: {
                dogId: variables.dogId,
                sireId: variables.sireId
              },
              onError: (error2) => {
                console.error('Sire-only attempt failed:', error2.message);
                
                // Try with just the dam
                console.log('Trying with just dam...');
                linkDogToParents({
                  variables: {
                    dogId: variables.dogId,
                    damId: variables.damId
                  },
                  onError: (error3) => {
                    console.error('All attempts failed');
                    toast.error(`Unable to update parents: ${errorMessage}`);
                    setIsSubmitting(false);
                  }
                });
              }
            });
          } else {
            toast.error(`Error updating parents: ${error.message}`);
            setIsSubmitting(false);
          }
        }
      });
    } catch (error) {
      console.error('Exception during parent linking:', error);
      toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {mode === 'add' ? 'Add Parents' : 'Edit Parents'} for {dogName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Display API error message in a prominent position */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded-md flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">Error Processing Request</p>
                <p className="text-sm">{apiError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Sire (Male Parent) Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Sire (Male Parent)</label>
                {selectedSire && (
                  <button
                    type="button"
                    className="text-red-500 text-xs hover:text-red-700"
                    onClick={() => setSelectedSire(null)}
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {selectedSire ? (
                <div className="bg-blue-50 p-3 rounded-md mb-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedSire.name}</p>
                    {selectedSire.breed && (
                      <p className="text-sm text-gray-600">Breed: {selectedSire.breed.replace('-', ' ')}</p>
                    )}
                    {selectedSire.registrationNumber && (
                      <p className="text-xs text-gray-500">Reg: {selectedSire.registrationNumber}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search for sire by name or registration"
                      className="border rounded-md p-2 flex-1"
                      value={searchTermSire}
                      onChange={(e) => setSearchTermSire(e.target.value)}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-colors"
                      onClick={handleSearchSires}
                    >
                      Search
                    </button>
                  </div>

                  {loadingSires && <p className="text-sm text-gray-500">Searching...</p>}
                  {errorSires && (
                    <p className="text-sm text-red-500">
                      Error searching for sires: {errorSires.message}
                    </p>
                  )}

                  {sireData && sireData.dogs.items && sireData.dogs.items.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto border rounded-md">
                      {sireData.dogs.items.map((dog) => (
                        <div
                          key={dog.id}
                          className={`p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 
                            ${dog.gender && dog.gender !== 'male' ? 'bg-red-50' : ''}`}
                          onClick={() => {
                            if (dog.gender && dog.gender !== 'male') {
                              toast.custom(
                                <div className="px-6 py-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded shadow-md">
                                  <p className="font-medium">Warning</p>
                                  <p>{`${dog.name} is not male. Sires should be male dogs.`}</p>
                                </div>
                              );
                            }
                            setSelectedSire(dog);
                          }}
                        >
                          <p className="font-medium">{dog.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {dog.gender && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dog.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                                {dog.gender.charAt(0).toUpperCase() + dog.gender.slice(1)}
                              </span>
                            )}
                            {dog.breed && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {dog.breed.replace('-', ' ')}
                              </span>
                            )}
                          </div>
                          {dog.registrationNumber && (
                            <p className="text-xs text-gray-500 mt-1">Reg: {dog.registrationNumber}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : sireData && sireData.dogs.items && sireData.dogs.items.length === 0 ? (
                    <p className="text-sm text-gray-500">No sires found matching "{searchTermSire}"</p>
                  ) : searchTermSire.length > 0 ? (
                    <p className="text-sm text-gray-500">Enter a name and click Search to find sires</p>
                  ) : null}
                </div>
              )}
            </div>

            {/* Dam (Female Parent) Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Dam (Female Parent)</label>
                {selectedDam && (
                  <button
                    type="button"
                    className="text-red-500 text-xs hover:text-red-700"
                    onClick={() => setSelectedDam(null)}
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {selectedDam ? (
                <div className="bg-pink-50 p-3 rounded-md mb-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedDam.name}</p>
                    {selectedDam.breed && (
                      <p className="text-sm text-gray-600">Breed: {selectedDam.breed.replace('-', ' ')}</p>
                    )}
                    {selectedDam.registrationNumber && (
                      <p className="text-xs text-gray-500">Reg: {selectedDam.registrationNumber}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search for dam by name or registration"
                      className="border rounded-md p-2 flex-1"
                      value={searchTermDam}
                      onChange={(e) => setSearchTermDam(e.target.value)}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="bg-pink-500 text-white rounded-md px-4 py-2 hover:bg-pink-600 transition-colors"
                      onClick={handleSearchDams}
                    >
                      Search
                    </button>
                  </div>

                  {loadingDams && <p className="text-sm text-gray-500">Searching...</p>}
                  {errorDams && (
                    <p className="text-sm text-red-500">
                      Error searching for dams: {errorDams.message}
                    </p>
                  )}

                  {damData && damData.dogs.items && damData.dogs.items.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto border rounded-md">
                      {damData.dogs.items.map((dog) => (
                        <div
                          key={dog.id}
                          className={`p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 
                            ${dog.gender && dog.gender !== 'female' ? 'bg-red-50' : ''}`}
                          onClick={() => {
                            if (dog.gender && dog.gender !== 'female') {
                              toast.error('Warning: You selected a non-female dog as dam');
                            }
                            setSelectedDam(dog);
                          }}
                        >
                          <p className="font-medium">{dog.name}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {dog.gender && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dog.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                                {dog.gender.charAt(0).toUpperCase() + dog.gender.slice(1)}
                              </span>
                            )}
                            {dog.breed && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {dog.breed.replace('-', ' ')}
                              </span>
                            )}
                          </div>
                          {dog.registrationNumber && (
                            <p className="text-xs text-gray-500 mt-1">Reg: {dog.registrationNumber}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : damData && damData.dogs.items && damData.dogs.items.length === 0 ? (
                    <p className="text-sm text-gray-500">No dams found matching "{searchTermDam}"</p>
                  ) : searchTermDam.length > 0 ? (
                    <p className="text-sm text-gray-500">Enter a name and click Search to find dams</p>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>


              <button
                type="submit"
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : mode === 'add' ? 'Add Parents' : 'Update Parents'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParentEditor;
