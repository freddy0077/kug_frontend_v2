'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import HealthRecordForm from '@/components/health/HealthRecordForm';
import { HealthRecordFormData, submitHealthRecordForm } from '@/utils/formHandlers';
import { hasPermission } from '@/utils/permissionUtils';

export default function EditHealthRecordPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  const recordId = params.recordId as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [dogOwnerId, setDogOwnerId] = useState('');
  const [dogName, setDogName] = useState('');
  const [healthRecord, setHealthRecord] = useState<HealthRecordFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    const uid = localStorage.getItem('userId') || '';
    
    setIsAuthenticated(authStatus);
    setUserRole(role);
    setUserId(uid);
    
    // Redirect if not authenticated
    if (!authStatus) {
      router.push('/auth/login');
      return;
    }
    
    // Fetch dog and health record information
    const fetchData = async () => {
      try {
        // In a real app, you would fetch this from an API
        // For now, mock the data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Mock dog data
        const mockDogData = {
          id: dogId,
          name: 'Champion Rocky',
          ownerId: 'user123'
        };
        
        setDogName(mockDogData.name);
        setDogOwnerId(mockDogData.ownerId);
        
        // Check if user has permission to edit this dog's health records
        if (!hasPermission(role, 'health-record', 'edit', mockDogData.ownerId, uid)) {
          setError('You do not have permission to edit this dog\'s health records');
          setIsLoading(false);
          return;
        }
        
        // Mock health record with the correct field names as per memory
        const mockHealthRecord: HealthRecordFormData = {
          id: recordId,
          dogId,
          date: new Date('2024-01-15'),
          // Using 'description' instead of 'diagnosis' as per memory
          description: 'Hip Dysplasia',
          // Using 'results' instead of 'test_results' as per memory
          results: 'Good',
          veterinarianId: 'vet1',
          attachments: ['https://example.com/attachments/health-record-1.pdf'],
          detailedResults: 'The hip joint shows well-formed acetabulum with good coverage of the femoral head. The Norberg angle is approximately 105 degrees, which is within the normal range. No signs of subluxation or degenerative joint disease.'
        };
        
        setHealthRecord(mockHealthRecord);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to load health record information');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dogId, recordId, router]);
  
  const handleSubmit = async (formData: HealthRecordFormData) => {
    try {
      // Ensure formData has the ID of the record
      formData.id = recordId;
      formData.dogId = dogId;
      
      // Submit form data using submitHealthRecordForm
      // This function validates and processes the form data
      // Ensures correct field names (description and results) are used
      const response = await submitHealthRecordForm(formData, userRole, userId, dogOwnerId);
      
      if (response.success) {
        setSuccessMessage(response.message);
        // Navigate to the health record details page after a short delay
        setTimeout(() => {
          router.push(`/manage/dogs/${dogId}/health/${recordId}`);
        }, 1500);
      } else {
        setError(response.message || 'Failed to update health record');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Link 
            href={`/manage/dogs/${dogId}/health/${recordId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Health Record
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Edit Health Record
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Editing health record for {dogName}
            </p>
          </div>
          <Link 
            href={`/manage/dogs/${dogId}/health/${recordId}`}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md">
            <p>{successMessage}</p>
          </div>
        )}
        
        {/* Health Record Form */}
        {healthRecord && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <HealthRecordForm 
                dogId={dogId}
                initialData={healthRecord}
                onSubmit={handleSubmit}
                userRole={userRole}
                userId={userId}
                dogOwnerId={dogOwnerId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
