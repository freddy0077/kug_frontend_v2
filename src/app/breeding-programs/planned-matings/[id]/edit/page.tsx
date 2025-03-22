'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import { GET_PLANNED_MATING } from '@/graphql/queries/plannedMatingQueries';
import { UPDATE_PLANNED_MATING, CANCEL_PLANNED_MATING, RECORD_BREEDING_RESULT } from '@/graphql/mutations/plannedMatingMutations';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function EditPlannedMating() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const matingId = params.id as string;
  
  // Form state
  const [formData, setFormData] = useState({
    plannedBreedingDate: '',
    actualBreedingDate: '',
    expectedLitterSize: '',
    geneticGoals: [] as string[],
    status: '',
    notes: ''
  });
  
  // Error state
  const [errors, setErrors] = useState({
    plannedBreedingDate: ''
  });

  // Mutation state
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showBreedingResultForm, setShowBreedingResultForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [breedingSuccessful, setBreedingSuccessful] = useState(true);

  // Fetch planned mating details
  const { data, loading, error, refetch } = useQuery(GET_PLANNED_MATING, {
    variables: { id: matingId },
    skip: !matingId,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.plannedMating) {
        const mating = data.plannedMating;
        
        // Format dates for input fields
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          plannedBreedingDate: formatDateForInput(mating.plannedBreedingDate),
          actualBreedingDate: formatDateForInput(mating.actualBreedingDate),
          expectedLitterSize: mating.expectedLitterSize?.toString() || '',
          geneticGoals: mating.geneticGoals || [],
          status: mating.status,
          notes: mating.notes || ''
        });
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching planned mating:', error);
      setIsLoading(false);
    }
  });

  // Check if user has permission to edit this planned mating
  const canEdit = user && (
    user.role === UserRole.ADMIN || 
    (data?.plannedMating?.breedingProgram?.breederId === user.id && 
     data?.plannedMating?.status === 'PLANNED')
  );

  // Redirect if user doesn't have permission to edit
  useEffect(() => {
    if (!isLoading && !loading && data?.plannedMating && !canEdit) {
      router.push(`/breeding-programs/planned-matings/${matingId}`);
    }
  }, [isLoading, loading, data, canEdit, router, matingId]);

  // Update planned mating mutation
  const [updatePlannedMating] = useMutation(UPDATE_PLANNED_MATING, {
    onCompleted: () => {
      setIsSubmitting(false);
      router.push(`/breeding-programs/planned-matings/${matingId}`);
    },
    onError: (error) => {
      console.error('Error updating planned mating:', error);
      setIsSubmitting(false);
      alert('Failed to update planned mating. Please try again.');
    }
  });

  // Cancel planned mating mutation
  const [cancelPlannedMating] = useMutation(CANCEL_PLANNED_MATING, {
    onCompleted: () => {
      setIsSubmitting(false);
      router.push(`/breeding-programs/planned-matings/${matingId}`);
    },
    onError: (error) => {
      console.error('Error cancelling planned mating:', error);
      setIsSubmitting(false);
      alert('Failed to cancel planned mating. Please try again.');
    }
  });

  // Record breeding result mutation
  const [recordBreedingResult] = useMutation(RECORD_BREEDING_RESULT, {
    onCompleted: () => {
      setIsSubmitting(false);
      router.push(`/breeding-programs/planned-matings/${matingId}`);
    },
    onError: (error) => {
      console.error('Error recording breeding result:', error);
      setIsSubmitting(false);
      alert('Failed to record breeding result. Please try again.');
    }
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
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

  // Handle goals input as comma-separated list
  const handleGoalsChange = (e) => {
    const goalText = e.target.value;
    const goalsArray = goalText.split(',').map(goal => goal.trim()).filter(goal => goal);
    setFormData({ ...formData, geneticGoals: goalsArray });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      plannedBreedingDate: formData.plannedBreedingDate ? '' : 'Planned breeding date is required'
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
      await updatePlannedMating({
        variables: {
          id: matingId,
          plannedBreedingDate: formData.plannedBreedingDate,
          expectedLitterSize: formData.expectedLitterSize ? parseInt(formData.expectedLitterSize) : null,
          geneticGoals: formData.geneticGoals.length > 0 ? formData.geneticGoals : null,
          notes: formData.notes || null
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  // Handle cancel mating
  const handleCancelMating = async (e) => {
    e.preventDefault();
    
    if (!cancelReason) {
      alert('Please provide a reason for cancellation.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await cancelPlannedMating({
        variables: {
          id: matingId,
          reason: cancelReason
        }
      });
    } catch (error) {
      console.error('Error cancelling mating:', error);
      setIsSubmitting(false);
    }
  };

  // Handle recording breeding result
  const handleRecordBreedingResult = async (e) => {
    e.preventDefault();
    
    if (!formData.actualBreedingDate) {
      alert('Please specify the actual breeding date.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await recordBreedingResult({
        variables: {
          plannedMatingId: matingId,
          actualBreedingDate: formData.actualBreedingDate,
          successful: breedingSuccessful,
          notes: formData.notes || null
        }
      });
    } catch (error) {
      console.error('Error recording breeding result:', error);
      setIsSubmitting(false);
    }
  };

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
                    <Link 
                      href={`/breeding-programs/planned-matings/${matingId}`} 
                      className="ml-1 text-gray-600 hover:text-gray-900 md:ml-2"
                    >
                      Mating Details
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
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Planned Mating: {plannedMating.sire.name} × {plannedMating.dam.name}
            </h1>
            <p className="mt-1 text-gray-600">Update details for this planned mating</p>
          </div>

          {/* Action Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => {
                    setShowCancelForm(false);
                    setShowBreedingResultForm(false);
                  }}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    !showCancelForm && !showBreedingResultForm
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Update Details
                </button>
                <button
                  onClick={() => {
                    setShowCancelForm(false);
                    setShowBreedingResultForm(true);
                  }}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    showBreedingResultForm
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Record Breeding
                </button>
                <button
                  onClick={() => {
                    setShowCancelForm(true);
                    setShowBreedingResultForm(false);
                  }}
                  className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    showCancelForm
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Cancel Mating
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Update Mating Form */}
              {!showCancelForm && !showBreedingResultForm && (
                <form onSubmit={handleSubmit}>
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
                        rows={2}
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

                  {/* Submit Button */}
                  <div className="mt-6 flex justify-end">
                    <Link
                      href={`/breeding-programs/planned-matings/${matingId}`}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
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
              )}

              {/* Record Breeding Result Form */}
              {showBreedingResultForm && (
                <form onSubmit={handleRecordBreedingResult}>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          Record the actual breeding date and result. This will update the status of the planned mating.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="actualBreedingDate" className="block text-sm font-medium text-gray-700">
                        Actual Breeding Date*
                      </label>
                      <input
                        type="date"
                        id="actualBreedingDate"
                        name="actualBreedingDate"
                        value={formData.actualBreedingDate}
                        onChange={handleChange}
                        required
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <span className="block text-sm font-medium text-gray-700 mb-1">Breeding Result</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            id="breeding-successful"
                            name="breedingResult"
                            type="radio"
                            checked={breedingSuccessful}
                            onChange={() => setBreedingSuccessful(true)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="breeding-successful" className="ml-2 block text-sm text-gray-700">
                            Successful
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="breeding-unsuccessful"
                            name="breedingResult"
                            type="radio"
                            checked={!breedingSuccessful}
                            onChange={() => setBreedingSuccessful(false)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor="breeding-unsuccessful" className="ml-2 block text-sm text-gray-700">
                            Unsuccessful
                          </label>
                        </div>
                      </div>
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
                        placeholder="Any notes about the breeding process or result"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowBreedingResultForm(false)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'Saving...' : 'Record Breeding Result'}
                    </button>
                  </div>
                </form>
              )}

              {/* Cancel Mating Form */}
              {showCancelForm && (
                <form onSubmit={handleCancelMating}>
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          <strong>Warning:</strong> Cancelling this planned mating cannot be undone. Please provide a reason for cancellation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700">
                      Reason for Cancellation*
                    </label>
                    <textarea
                      id="cancelReason"
                      rows={3}
                      required
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="mt-1 focus:ring-red-500 focus:border-red-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Please provide a reason for cancelling this planned mating"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCancelForm(false)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'Processing...' : 'Cancel Mating'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
