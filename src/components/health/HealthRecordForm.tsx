'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/utils/permissionUtils';
import { HealthRecordFormData } from '@/utils/formHandlers';

type HealthRecordFormProps = {
  dogId: string;
  initialData?: Partial<HealthRecordFormData>;
  onSubmit: (formData: HealthRecordFormData) => Promise<void>;
  userRole: string;
  userId: string;
  dogOwnerId: string;
};

export default function HealthRecordForm({
  dogId,
  initialData,
  onSubmit,
  userRole,
  userId,
  dogOwnerId
}: HealthRecordFormProps) {
  const router = useRouter();
  
  // Form state with default values
  const [formData, setFormData] = useState<HealthRecordFormData>({
    dogId,
    date: new Date(),
    // Using 'description' instead of 'diagnosis' for consistency as per memory
    description: '',
    // Using 'results' instead of 'test_results' for consistency as per memory
    results: '',
    veterinarianId: '',
    attachments: [],
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Check if user has permission to add/edit health records for this dog
  const [hasPermissionToEdit, setHasPermissionToEdit] = useState(false);
  
  useEffect(() => {
    const canEdit = hasPermission(userRole, 'health-record', 'edit', dogOwnerId, userId);
    setHasPermissionToEdit(canEdit);
    
    if (!canEdit) {
      router.push(`/manage/dogs/${dogId}`);
    }
  }, [userRole, userId, dogOwnerId, dogId, router]);
  
  // Common health tests for dogs
  const healthTestTypes = [
    { id: 'hip', name: 'Hip Dysplasia' },
    { id: 'elbow', name: 'Elbow Dysplasia' },
    { id: 'eye', name: 'Eye Examination' },
    { id: 'heart', name: 'Cardiac Evaluation' },
    { id: 'patella', name: 'Patellar Luxation' },
    { id: 'dna', name: 'DNA Test' },
    { id: 'thyroid', name: 'Thyroid' },
    { id: 'other', name: 'Other' }
  ];
  
  // Common health test results
  const resultOptions = [
    { id: 'normal', name: 'Normal' },
    { id: 'carrier', name: 'Carrier' },
    { id: 'affected', name: 'Affected' },
    { id: 'at-risk', name: 'At Risk' },
    { id: 'excellent', name: 'Excellent' },
    { id: 'good', name: 'Good' },
    { id: 'fair', name: 'Fair' },
    { id: 'poor', name: 'Poor' },
    { id: 'borderline', name: 'Borderline' },
    { id: 'other', name: 'Other (Specify)' }
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    
    // Clear any errors for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : new Date();
    setFormData(prev => ({...prev, date: dateValue}));
    
    // Clear date error if exists
    if (errors.date) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.date;
        return newErrors;
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...fileArray]);
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!formData.description.trim()) {
      newErrors.description = 'Health test description is required';
    }
    
    if (!formData.results.trim()) {
      newErrors.results = 'Results are required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (formData.date > new Date()) {
      newErrors.date = 'Date cannot be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would handle file uploads here
      // and add the resulting URLs to the attachments array
      const mockAttachmentUrls = selectedFiles.map((_, index) => 
        `https://example.com/attachments/health-record-${formData.dogId}-${index}.pdf`
      );
      
      // Submit the form with the attachments
      await onSubmit({
        ...formData,
        attachments: mockAttachmentUrls
      });
      
      // Navigate back to the dog's health records page
      router.push(`/manage/dogs/${dogId}/health`);
    } catch (error) {
      console.error('Error submitting health record:', error);
      setErrors({
        submit: 'Failed to submit health record. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date for input type="date"
  const formatDateForInput = (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  if (!hasPermissionToEdit) {
    return <div className="p-4">Checking permissions...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {initialData?.id ? 'Edit Health Record' : 'Add New Health Record'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {initialData?.id 
                ? 'Update information about this health test or examination'
                : 'Record a new health test, examination, or genetic screening'
              }
            </p>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Test Type / Description - Using 'description' as per memory */}
            <div className="sm:col-span-3">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Test Type / Description <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.description ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Test Type</option>
                  {healthTestTypes.map(type => (
                    <option key={type.id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            
            {/* Test Date */}
            <div className="sm:col-span-3">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Test Date <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formatDateForInput(formData.date)}
                  onChange={handleDateChange}
                  max={formatDateForInput(new Date())}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.date ? 'border-red-300' : ''}`}
                />
              </div>
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
            
            {/* Results - Using 'results' as per memory */}
            <div className="sm:col-span-3">
              <label htmlFor="results" className="block text-sm font-medium text-gray-700">
                Results <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="results"
                  name="results"
                  value={formData.results}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.results ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Result</option>
                  {resultOptions.map(option => (
                    <option key={option.id} value={option.name}>{option.name}</option>
                  ))}
                </select>
              </div>
              {errors.results && <p className="mt-1 text-sm text-red-600">{errors.results}</p>}
            </div>
            
            {/* Veterinarian */}
            <div className="sm:col-span-3">
              <label htmlFor="veterinarianId" className="block text-sm font-medium text-gray-700">
                Veterinarian
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="veterinarianId"
                  name="veterinarianId"
                  value={formData.veterinarianId}
                  onChange={handleChange}
                  placeholder="Veterinarian name or ID"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Detailed Results / Notes */}
            <div className="sm:col-span-6">
              <label htmlFor="detailedResults" className="block text-sm font-medium text-gray-700">
                Detailed Results / Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="detailedResults"
                  name="detailedResults"
                  rows={4}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Additional details about the test results..."
                ></textarea>
              </div>
            </div>
            
            {/* Attachments */}
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload test results, X-rays, or other documents (PDF, JPG, PNG)
                  </p>
                </div>
              </div>
              
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <ul className="mt-3 divide-y divide-gray-100 rounded-md border border-gray-200">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                      <div className="flex w-0 flex-1 items-center">
                        <svg className="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 w-0 flex-1 truncate">{file.name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          className="font-medium text-blue-600 hover:text-blue-500"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Form submission error */}
      {errors.submit && (
        <div className="mt-4 sm:col-span-6">
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
            {errors.submit}
          </div>
        </div>
      )}
      
      {/* Form actions */}
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : initialData?.id ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </div>
    </form>
  );
}
