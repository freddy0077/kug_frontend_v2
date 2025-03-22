'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import { GET_BREEDING_PROGRAM } from '@/graphql/queries/breedingProgramQueries';
import { UPDATE_BREEDING_PROGRAM } from '@/graphql/mutations/breedingProgramMutations';
import Link from 'next/link';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function EditBreedingProgram() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const programId = params.id as string;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    breed: '',
    goals: [] as string[],
    startDate: '',
    endDate: '',
    status: '',
    geneticTestingProtocol: '',
    selectionCriteria: '',
    notes: '',
    isPublic: false,
    imageUrl: '',
    foundationDogIds: [] as string[]
  });
  
  // Error state
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    breed: '',
    goals: '',
    startDate: '',
  });

  // Fetch breeding program details
  const { data: programData, loading: programLoading, error: programError } = useQuery(GET_BREEDING_PROGRAM, {
    variables: { id: programId },
    skip: !programId,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.breedingProgram) {
        const program = data.breedingProgram;
        
        // Convert dates to YYYY-MM-DD format for input fields
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          name: program.name || '',
          description: program.description || '',
          breed: program.breed || '',
          goals: program.goals || [],
          startDate: formatDateForInput(program.startDate),
          endDate: formatDateForInput(program.endDate),
          status: program.status || 'PLANNING',
          geneticTestingProtocol: program.geneticTestingProtocol || '',
          selectionCriteria: program.selectionCriteria || '',
          notes: program.notes || '',
          isPublic: program.is_public || false,
          imageUrl: program.imageUrl || '',
          foundationDogIds: program.foundationDogs?.map(dog => dog.id) || []
        });
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching breeding program:', error);
      setIsLoading(false);
    }
  });

  // Update breeding program mutation
  const [updateBreedingProgram] = useMutation(UPDATE_BREEDING_PROGRAM, {
    onCompleted: () => {
      setIsSubmitting(false);
      router.push(`/breeding-programs/${programId}`);
    },
    onError: (error) => {
      console.error('Error updating breeding program:', error);
      setIsSubmitting(false);
      alert('Failed to update breeding program. Please try again.');
    }
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle goals input as comma-separated list
  const handleGoalsChange = (e) => {
    const goalText = e.target.value;
    const goalsArray = goalText.split(',').map(goal => goal.trim()).filter(goal => goal);
    setFormData({ ...formData, goals: goalsArray });
    
    if (errors.goals) {
      setErrors({ ...errors, goals: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: formData.name ? '' : 'Program name is required',
      description: formData.description ? '' : 'Description is required',
      breed: formData.breed ? '' : 'Breed is required',
      goals: formData.goals.length > 0 ? '' : 'At least one goal is required',
      startDate: formData.startDate ? '' : 'Start date is required'
    };
    
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
      await updateBreedingProgram({
        variables: {
          id: programId,
          name: formData.name,
          description: formData.description,
          breed: formData.breed,
          goals: formData.goals,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          status: formData.status,
          geneticTestingProtocol: formData.geneticTestingProtocol,
          selectionCriteria: formData.selectionCriteria,
          notes: formData.notes,
          isPublic: formData.isPublic,
          imageUrl: formData.imageUrl,
          foundationDogIds: formData.foundationDogIds
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
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
                    <span className="ml-1 text-gray-500 md:ml-2 font-medium">Edit</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Edit Breeding Program</h1>
            <p className="mt-1 text-gray-600">Update details for your breeding program.</p>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Program Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="e.g., Champion Bloodline Program"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="Describe the purpose and focus of your breeding program"
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>

                  <div>
                    <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                      Breed*
                    </label>
                    <input
                      type="text"
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md ${errors.breed ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="e.g., Labrador Retriever"
                    />
                    {errors.breed && <p className="mt-1 text-sm text-red-600">{errors.breed}</p>}
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Program Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="ACTIVE">Active</option>
                      <option value="PAUSED">Paused</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date*
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md ${errors.startDate ? 'border-red-300' : 'border-gray-300'}`}
                    />
                    {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="goals" className="block text-sm font-medium text-gray-700">
                      Breeding Goals* (comma-separated)
                    </label>
                    <textarea
                      id="goals"
                      name="goals"
                      rows={2}
                      value={formData.goals.join(', ')}
                      onChange={handleGoalsChange}
                      className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md ${errors.goals ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="e.g., Improve temperament, Reduce hip dysplasia, Maintain breed standard"
                    />
                    {errors.goals && <p className="mt-1 text-sm text-red-600">{errors.goals}</p>}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="geneticTestingProtocol" className="block text-sm font-medium text-gray-700">
                      Genetic Testing Protocol
                    </label>
                    <textarea
                      id="geneticTestingProtocol"
                      name="geneticTestingProtocol"
                      rows={3}
                      value={formData.geneticTestingProtocol}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe genetic testing requirements for dogs in this program"
                    />
                  </div>

                  <div>
                    <label htmlFor="selectionCriteria" className="block text-sm font-medium text-gray-700">
                      Selection Criteria
                    </label>
                    <textarea
                      id="selectionCriteria"
                      name="selectionCriteria"
                      rows={3}
                      value={formData.selectionCriteria}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe how you select dogs for this breeding program"
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Any additional information about the breeding program"
                    />
                  </div>
                </div>
              </div>

              {/* Visibility Settings */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Visibility Settings</h2>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isPublic"
                      name="isPublic"
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isPublic" className="font-medium text-gray-700">Make this breeding program public</label>
                    <p className="text-gray-500">Public breeding programs can be viewed by all users. Private programs are only visible to you and admins.</p>
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Program Image</h2>
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-sm text-gray-500">Enter a URL for an image representing this breeding program</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <Link
                  href={`/breeding-programs/${programId}`}
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
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
