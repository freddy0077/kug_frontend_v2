'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import { GET_PLANNED_MATING } from '@/graphql/queries/plannedMatingQueries';
import { RECORD_LITTER_RESULT } from '@/graphql/mutations/plannedMatingMutations';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function RecordLitterResults() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const matingId = params.id as string;
  
  // Form state
  const [formData, setFormData] = useState({
    whelppingDate: '',
    totalPuppies: '',
    malePuppies: '',
    femalePuppies: '',
    stillborn: '',
    notes: ''
  });
  
  // Error state
  const [errors, setErrors] = useState({
    whelppingDate: '',
    totalPuppies: '',
    malePuppies: '',
    femalePuppies: ''
  });

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

  // Check if user has permission and if the mating status allows recording a litter
  const canRecordLitter = user && (
    user.role === UserRole.ADMIN || 
    (data?.plannedMating?.breedingProgram?.breederId === user.id && 
     data?.plannedMating?.status === 'BRED' && 
     !data?.plannedMating?.litter)
  );

  // Redirect if user doesn't have permission to record litter
  useEffect(() => {
    if (!isLoading && !loading && data?.plannedMating) {
      if (!canRecordLitter) {
        router.push(`/breeding-programs/planned-matings/${matingId}`);
      }
    }
  }, [isLoading, loading, data, canRecordLitter, router, matingId]);

  // Record litter result mutation
  const [recordLitterResult] = useMutation(RECORD_LITTER_RESULT, {
    onCompleted: (data) => {
      setIsSubmitting(false);
      
      // Navigate to the litter page if created successfully
      if (data?.recordLitterResult?.litter?.id) {
        router.push(`/litters/${data.recordLitterResult.litter.id}`);
      } else {
        router.push(`/breeding-programs/planned-matings/${matingId}`);
      }
    },
    onError: (error) => {
      console.error('Error recording litter result:', error);
      setIsSubmitting(false);
      alert('Failed to record litter result. Please try again.');
    }
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (['totalPuppies', 'malePuppies', 'femalePuppies', 'stillborn'].includes(name)) {
      // Ensure input is a number or empty string
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

  // Validate form
  const validateForm = () => {
    const newErrors = {
      whelppingDate: formData.whelppingDate ? '' : 'Whelpping date is required',
      totalPuppies: formData.totalPuppies ? '' : 'Total number of puppies is required',
      malePuppies: formData.malePuppies ? '' : 'Number of male puppies is required',
      femalePuppies: formData.femalePuppies ? '' : 'Number of female puppies is required'
    };
    
    // Validate that male + female puppies equals total puppies
    const totalPuppies = parseInt(formData.totalPuppies) || 0;
    const malePuppies = parseInt(formData.malePuppies) || 0;
    const femalePuppies = parseInt(formData.femalePuppies) || 0;
    const stillborn = parseInt(formData.stillborn) || 0;
    
    if (malePuppies + femalePuppies + stillborn !== totalPuppies) {
      newErrors.totalPuppies = 'Male + female + stillborn puppies must equal total puppies';
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
      await recordLitterResult({
        variables: {
          plannedMatingId: matingId,
          whelppingDate: formData.whelppingDate,
          totalPuppies: parseInt(formData.totalPuppies),
          malePuppies: parseInt(formData.malePuppies),
          femalePuppies: parseInt(formData.femalePuppies),
          stillborn: formData.stillborn ? parseInt(formData.stillborn) : 0,
          notes: formData.notes || null
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
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
                    <span className="ml-1 text-gray-500 md:ml-2 font-medium">Record Litter</span>
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
                  Record Litter: {plannedMating.sire.name} × {plannedMating.dam.name}
                </h1>
                <p className="mt-1 text-gray-600">
                  Record the results of this breeding
                </p>
              </div>
            </div>
          </div>

          {/* Dogs Information */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
            {/* Sire Information */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <h2 className="text-lg font-semibold text-gray-900">Sire</h2>
              </div>
              
              <div className="p-4">
                <div className="flex items-center">
                  {plannedMating.sire.mainImageUrl && (
                    <img 
                      src={plannedMating.sire.mainImageUrl} 
                      alt={plannedMating.sire.name}
                      className="h-12 w-12 rounded-full object-cover mr-3"
                    />
                  )}
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {plannedMating.sire.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {plannedMating.sire.breed} • {plannedMating.sire.registrationNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dam Information */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-pink-50 p-4 border-b border-pink-100">
                <h2 className="text-lg font-semibold text-gray-900">Dam</h2>
              </div>
              
              <div className="p-4">
                <div className="flex items-center">
                  {plannedMating.dam.mainImageUrl && (
                    <img 
                      src={plannedMating.dam.mainImageUrl} 
                      alt={plannedMating.dam.name}
                      className="h-12 w-12 rounded-full object-cover mr-3"
                    />
                  )}
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {plannedMating.dam.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {plannedMating.dam.breed} • {plannedMating.dam.registrationNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Litter Details Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Litter Details</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="whelppingDate" className="block text-sm font-medium text-gray-700">
                    Whelpping Date*
                  </label>
                  <input
                    type="date"
                    id="whelppingDate"
                    name="whelppingDate"
                    value={formData.whelppingDate}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md ${errors.whelppingDate ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.whelppingDate && <p className="mt-1 text-sm text-red-600">{errors.whelppingDate}</p>}
                </div>

                <div>
                  <label htmlFor="totalPuppies" className="block text-sm font-medium text-gray-700">
                    Total Puppies*
                  </label>
                  <input
                    type="number"
                    id="totalPuppies"
                    name="totalPuppies"
                    min="0"
                    max="30"
                    value={formData.totalPuppies}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md ${errors.totalPuppies ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.totalPuppies && <p className="mt-1 text-sm text-red-600">{errors.totalPuppies}</p>}
                </div>

                <div>
                  <label htmlFor="malePuppies" className="block text-sm font-medium text-gray-700">
                    Male Puppies*
                  </label>
                  <input
                    type="number"
                    id="malePuppies"
                    name="malePuppies"
                    min="0"
                    max="30"
                    value={formData.malePuppies}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md ${errors.malePuppies ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.malePuppies && <p className="mt-1 text-sm text-red-600">{errors.malePuppies}</p>}
                </div>

                <div>
                  <label htmlFor="femalePuppies" className="block text-sm font-medium text-gray-700">
                    Female Puppies*
                  </label>
                  <input
                    type="number"
                    id="femalePuppies"
                    name="femalePuppies"
                    min="0"
                    max="30"
                    value={formData.femalePuppies}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md ${errors.femalePuppies ? 'border-red-300' : 'border-gray-300'}`}
                  />
                  {errors.femalePuppies && <p className="mt-1 text-sm text-red-600">{errors.femalePuppies}</p>}
                </div>

                <div>
                  <label htmlFor="stillborn" className="block text-sm font-medium text-gray-700">
                    Stillborn Puppies
                  </label>
                  <input
                    type="number"
                    id="stillborn"
                    name="stillborn"
                    min="0"
                    max="30"
                    value={formData.stillborn}
                    onChange={handleChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="md:col-span-2">
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
                    placeholder="Additional notes about the litter, health observations, etc."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Link
                  href={`/breeding-programs/planned-matings/${matingId}`}
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
                      Recording...
                    </>
                  ) : 'Record Litter Results'}
                </button>
              </div>
            </form>
          </div>

          {/* Information Note */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  After recording the litter, you'll be able to register individual puppies and keep track of their development. The breeding status will be updated to "COMPLETED".
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
