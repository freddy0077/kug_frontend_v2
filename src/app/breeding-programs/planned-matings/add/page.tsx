'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import { GET_BREEDING_PROGRAMS } from '@/graphql/queries/breedingProgramQueries';
import { GET_DOGS } from '@/graphql/queries/dogQueries';
import { CREATE_PLANNED_MATING } from '@/graphql/mutations/plannedMatingMutations';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AddPlannedMating() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    breedingProgramId: '',
    sireId: '',
    damId: '',
    plannedBreedingDate: '',
    expectedLitterSize: '',
    geneticGoals: [] as string[],
    status: 'PLANNED',
    notes: ''
  });
  
  // Error state
  const [errors, setErrors] = useState({
    breedingProgramId: '',
    sireId: '',
    damId: '',
    plannedBreedingDate: '',
  });

  // State for filtered dogs
  const [availableSires, setAvailableSires] = useState<any[]>([]);
  const [availableDams, setAvailableDams] = useState<any[]>([]);
  const [searchSireTerm, setSearchSireTerm] = useState('');
  const [searchDamTerm, setSearchDamTerm] = useState('');
  const [selectedBreedProgram, setSelectedBreedProgram] = useState<any>(null);

  // Fetch breeding programs
  const { data: programsData, loading: programsLoading } = useQuery(GET_BREEDING_PROGRAMS, {
    variables: {
      limit: 100,
      offset: 0
    },
    onCompleted: () => {
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching breeding programs:', error);
      setIsLoading(false);
    }
  });

  // Fetch available sires
  const { data: siresData, loading: siresLoading, refetch: refetchSires } = useQuery(GET_DOGS, {
    variables: {
      limit: 20,
      offset: 0,
      gender: 'MALE',
      searchTerm: searchSireTerm,
      breed: selectedBreedProgram?.breed || undefined
    },
    fetchPolicy: 'network-only',
    skip: !selectedBreedProgram
  });

  // Fetch available dams
  const { data: damsData, loading: damsLoading, refetch: refetchDams } = useQuery(GET_DOGS, {
    variables: {
      limit: 20,
      offset: 0,
      gender: 'FEMALE',
      searchTerm: searchDamTerm,
      breed: selectedBreedProgram?.breed || undefined
    },
    fetchPolicy: 'network-only',
    skip: !selectedBreedProgram
  });

  // Update available dogs when data changes
  useEffect(() => {
    if (siresData?.dogs?.items) {
      setAvailableSires(siresData.dogs.items);
    }
  }, [siresData]);

  useEffect(() => {
    if (damsData?.dogs?.items) {
      setAvailableDams(damsData.dogs.items);
    }
  }, [damsData]);

  // Update selected breeding program when it changes
  useEffect(() => {
    if (formData.breedingProgramId && programsData?.breedingPrograms?.items) {
      const program = programsData.breedingPrograms.items.find(
        p => p.id === formData.breedingProgramId
      );
      
      if (program) {
        setSelectedBreedProgram(program);
        
        // Reset dog selections when breeding program changes as they may not be of the right breed
        setFormData(prev => ({
          ...prev,
          sireId: '',
          damId: ''
        }));
        
        // Refetch dogs when breeding program changes
        if (program.breed) {
          refetchSires({
            breed: program.breed,
            searchTerm: searchSireTerm
          });
          
          refetchDams({
            breed: program.breed,
            searchTerm: searchDamTerm
          });
        }
      }
    }
  }, [formData.breedingProgramId, programsData]);

  // Create planned mating mutation
  const [createPlannedMating] = useMutation(CREATE_PLANNED_MATING, {
    onCompleted: (data) => {
      setIsSubmitting(false);
      router.push(`/breeding-programs/planned-matings/${data.createPlannedMating.id}`);
    },
    onError: (error) => {
      console.error('Error creating planned mating:', error);
      setIsSubmitting(false);
      alert('Failed to create planned mating. Please try again.');
    }
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle different input types
    if (name === 'expectedLitterSize') {
      // Ensure expected litter size is a number
      if (value === '' || !isNaN(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle search for sires
  const handleSireSearch = (e) => {
    setSearchSireTerm(e.target.value);
    
    if (selectedBreedProgram?.breed) {
      refetchSires({
        breed: selectedBreedProgram.breed,
        searchTerm: e.target.value
      });
    }
  };

  // Handle search for dams
  const handleDamSearch = (e) => {
    setSearchDamTerm(e.target.value);
    
    if (selectedBreedProgram?.breed) {
      refetchDams({
        breed: selectedBreedProgram.breed,
        searchTerm: e.target.value
      });
    }
  };

  // Handle goals input as comma-separated list
  const handleGoalsChange = (e) => {
    const goalText = e.target.value;
    const goalsArray = goalText.split(',').map(goal => goal.trim()).filter(goal => goal);
    setFormData({ ...formData, geneticGoals: goalsArray });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      breedingProgramId: formData.breedingProgramId ? '' : 'Breeding program is required',
      sireId: formData.sireId ? '' : 'Sire is required',
      damId: formData.damId ? '' : 'Dam is required',
      plannedBreedingDate: formData.plannedBreedingDate ? '' : 'Planned breeding date is required'
    };
    
    if (formData.sireId === formData.damId && formData.sireId !== '') {
      newErrors.damId = 'Sire and dam cannot be the same dog';
      newErrors.sireId = 'Sire and dam cannot be the same dog';
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createPlannedMating({
        variables: {
          breedingProgramId: formData.breedingProgramId,
          sireId: formData.sireId,
          damId: formData.damId,
          plannedBreedingDate: formData.plannedBreedingDate,
          expectedLitterSize: formData.expectedLitterSize ? parseInt(formData.expectedLitterSize) : null,
          geneticGoals: formData.geneticGoals.length > 0 ? formData.geneticGoals : null,
          status: formData.status,
          notes: formData.notes || null
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  if (isLoading || programsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" color="border-blue-500" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.OWNER, UserRole.ADMIN]}>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <span className="ml-1 text-gray-500 md:ml-2 font-medium">Add Planned Mating</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Add Planned Mating</h1>
            <p className="mt-1 text-gray-600">Plan a new breeding between two dogs.</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit}>
              {/* Breeding Program Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Breeding Program</h2>
                <div>
                  <label htmlFor="breedingProgramId" className="block text-sm font-medium text-gray-700">
                    Breeding Program*
                  </label>
                  <select
                    id="breedingProgramId"
                    name="breedingProgramId"
                    value={formData.breedingProgramId}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${errors.breedingProgramId ? 'border-red-300' : 'border-gray-300'}`}
                  >
                    <option value="">Select a breeding program</option>
                    {programsData?.breedingPrograms?.items?.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name} ({program.breed})
                      </option>
                    ))}
                  </select>
                  {errors.breedingProgramId && <p className="mt-1 text-sm text-red-600">{errors.breedingProgramId}</p>}
                </div>
              </div>

              {/* Dog Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Dogs</h2>
                
                {!selectedBreedProgram && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Please select a breeding program first to view available dogs.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedBreedProgram && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sire Selection */}
                    <div>
                      <label htmlFor="sireSearch" className="block text-sm font-medium text-gray-700">
                        Search Sire*
                      </label>
                      <div className="mt-1 mb-2">
                        <input
                          type="text"
                          id="sireSearch"
                          placeholder="Search sires by name or registration number"
                          value={searchSireTerm}
                          onChange={handleSireSearch}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className={`mt-1 block w-full rounded-md border ${errors.sireId ? 'border-red-300' : 'border-gray-300'} bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}>
                        <div className="max-h-60 overflow-y-auto">
                          {siresLoading ? (
                            <div className="text-center py-4">
                              <LoadingSpinner size="sm" color="border-blue-500" />
                            </div>
                          ) : availableSires.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              No matching sires found
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {availableSires.map(sire => (
                                <div key={sire.id} className="relative flex items-start py-2 px-1">
                                  <div className="min-w-0 flex-1">
                                    <label
                                      htmlFor={`sire-${sire.id}`}
                                      className="font-medium text-gray-700 cursor-pointer flex items-center"
                                    >
                                      <input
                                        id={`sire-${sire.id}`}
                                        name="sireId"
                                        type="radio"
                                        value={sire.id}
                                        checked={formData.sireId === sire.id}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
                                      />
                                      <div>
                                        <span className="block text-sm font-medium">{sire.name}</span>
                                        <span className="block text-xs text-gray-500">
                                          {sire.breed} • {sire.registrationNumber} • {new Date(sire.dateOfBirth).getFullYear()}
                                        </span>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {errors.sireId && <p className="mt-1 text-sm text-red-600">{errors.sireId}</p>}
                    </div>

                    {/* Dam Selection */}
                    <div>
                      <label htmlFor="damSearch" className="block text-sm font-medium text-gray-700">
                        Search Dam*
                      </label>
                      <div className="mt-1 mb-2">
                        <input
                          type="text"
                          id="damSearch"
                          placeholder="Search dams by name or registration number"
                          value={searchDamTerm}
                          onChange={handleDamSearch}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className={`mt-1 block w-full rounded-md border ${errors.damId ? 'border-red-300' : 'border-gray-300'} bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}>
                        <div className="max-h-60 overflow-y-auto">
                          {damsLoading ? (
                            <div className="text-center py-4">
                              <LoadingSpinner size="sm" color="border-blue-500" />
                            </div>
                          ) : availableDams.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              No matching dams found
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {availableDams.map(dam => (
                                <div key={dam.id} className="relative flex items-start py-2 px-1">
                                  <div className="min-w-0 flex-1">
                                    <label
                                      htmlFor={`dam-${dam.id}`}
                                      className="font-medium text-gray-700 cursor-pointer flex items-center"
                                    >
                                      <input
                                        id={`dam-${dam.id}`}
                                        name="damId"
                                        type="radio"
                                        value={dam.id}
                                        checked={formData.damId === dam.id}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-2"
                                      />
                                      <div>
                                        <span className="block text-sm font-medium">{dam.name}</span>
                                        <span className="block text-xs text-gray-500">
                                          {dam.breed} • {dam.registrationNumber} • {new Date(dam.dateOfBirth).getFullYear()}
                                        </span>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {errors.damId && <p className="mt-1 text-sm text-red-600">{errors.damId}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Breeding Details */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Breeding Details</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="plannedBreedingDate" className="block text-sm font-medium text-gray-700">
                      Planned Breeding Date*
                    </label>
                    <input
                      type="date"
                      id="plannedBreedingDate"
                      name="plannedBreedingDate"
                      value={formData.plannedBreedingDate}
                      onChange={handleChange}
                      className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md ${errors.plannedBreedingDate ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.plannedBreedingDate && <p className="mt-1 text-sm text-red-600">{errors.plannedBreedingDate}</p>}
                  </div>

                  <div>
                    <label htmlFor="expectedLitterSize" className="block text-sm font-medium text-gray-700">
                      Expected Litter Size (Optional)
                    </label>
                    <input
                      type="number"
                      id="expectedLitterSize"
                      name="expectedLitterSize"
                      min="1"
                      max="30"
                      value={formData.expectedLitterSize}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., 6"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="geneticGoals" className="block text-sm font-medium text-gray-700">
                      Genetic Goals (Optional, comma-separated)
                    </label>
                    <textarea
                      id="geneticGoals"
                      name="geneticGoals"
                      rows={3}
                      value={formData.geneticGoals.join(', ')}
                      onChange={handleGoalsChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., Improve hip scores, Fix coat color, Enhance temperament"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Any additional notes about this planned mating"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/breeding-programs/planned-matings"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : 'Create Planned Mating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
