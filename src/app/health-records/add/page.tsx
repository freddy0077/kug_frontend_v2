'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { CREATE_HEALTH_RECORD } from '@/graphql/queries/healthRecordQueries';
import { HealthRecordType, DogOption, CreateHealthRecordInput } from '@/types/healthRecord';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function AddHealthRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const preselectedDogId = searchParams?.get('dogId');
  
  const [dogOptions, setDogOptions] = useState<DogOption[]>([]);
  const [formData, setFormData] = useState<CreateHealthRecordInput>({
    dogId: preselectedDogId || '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: HealthRecordType.EXAMINATION,
    veterinarian: '',
    results: '',
    attachmentUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [createHealthRecord, { loading, error }] = useMutation(CREATE_HEALTH_RECORD);

  // Fetch dogs for dropdown - in a real app, this would be a GraphQL query
  useEffect(() => {
    // Mock data - replace with actual API call
    const mockDogOptions = [
      { id: "1", name: "Max" },
      { id: "2", name: "Bella" },
      { id: "3", name: "Charlie" },
      { id: "4", name: "Luna" }
    ];
    setDogOptions(mockDogOptions);
    
    // If there's a dogId in the URL and it matches one of our options, preselect it
    if (preselectedDogId) {
      setFormData(prev => ({
        ...prev,
        dogId: preselectedDogId
      }));
    }
  }, [preselectedDogId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.dogId) {
      newErrors.dogId = 'Please select a dog';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please enter a date';
    }
    
    if (!formData.description) {
      newErrors.description = 'Please enter a description';
    }
    
    if (!formData.type) {
      newErrors.type = 'Please select a record type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const result = await createHealthRecord({
        variables: {
          input: {
            ...formData,
            // Ensure date is in the correct format as a string, not a Date object
            date: formData.date
          }
        }
      });
      
      if (result.data?.createHealthRecord) {
        // Navigate back to health records list
        router.push('/health-records');
      }
    } catch (err) {
      console.error('Error creating health record:', err);
      setErrors({
        submit: err instanceof Error ? err.message : 'An error occurred while saving the health record'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'BREEDER', 'VET']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Health Record</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new health record for a dog in your care
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Dog Selection */}
              <div className="sm:col-span-3">
                <label htmlFor="dogId" className="block text-sm font-medium text-gray-700">
                  Dog
                </label>
                <div className="mt-1">
                  <select
                    id="dogId"
                    name="dogId"
                    value={formData.dogId}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.dogId ? 'border-red-300' : ''
                    }`}
                    disabled={!!preselectedDogId}
                  >
                    <option value="">Select a dog</option>
                    {dogOptions.map(dog => (
                      <option key={dog.id} value={dog.id}>
                        {dog.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.dogId && (
                  <p className="mt-2 text-sm text-red-600">{errors.dogId}</p>
                )}
              </div>

              {/* Record Date */}
              <div className="sm:col-span-3">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.date ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                {errors.date && (
                  <p className="mt-2 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              {/* Record Type */}
              <div className="sm:col-span-3">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Record Type
                </label>
                <div className="mt-1">
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.type ? 'border-red-300' : ''
                    }`}
                  >
                    {Object.values(HealthRecordType).map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.type && (
                  <p className="mt-2 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Veterinarian */}
              <div className="sm:col-span-3">
                <label htmlFor="veterinarian" className="block text-sm font-medium text-gray-700">
                  Veterinarian
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="veterinarian"
                    name="veterinarian"
                    value={formData.veterinarian || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Dr. John Smith"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.description ? 'border-red-300' : ''
                    }`}
                    placeholder="Detailed description of the health record"
                  ></textarea>
                </div>
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Results */}
              <div className="sm:col-span-6">
                <label htmlFor="results" className="block text-sm font-medium text-gray-700">
                  Results
                </label>
                <div className="mt-1">
                  <textarea
                    id="results"
                    name="results"
                    rows={3}
                    value={formData.results || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Test results or treatment outcomes (if applicable)"
                  ></textarea>
                </div>
              </div>

              {/* Attachment URL */}
              <div className="sm:col-span-6">
                <label htmlFor="attachmentUrl" className="block text-sm font-medium text-gray-700">
                  Attachment URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="attachmentUrl"
                    name="attachmentUrl"
                    value={formData.attachmentUrl || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Enter a URL to an attachment or document related to this health record
                </p>
              </div>
            </div>

            {/* Error message */}
            {errors.submit && (
              <div className="mt-6">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Form actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
