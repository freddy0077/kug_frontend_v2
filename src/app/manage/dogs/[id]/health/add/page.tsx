'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import HealthRecordForm from '@/components/health/HealthRecordForm';
import { HealthRecordFormData, submitHealthRecordForm } from '@/utils/formHandlers';

export default function AddHealthRecordPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [dogOwnerId, setDogOwnerId] = useState('');
  const [dogName, setDogName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    
    // Fetch dog information
    const fetchDogInfo = async () => {
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
        setIsLoading(false);
      } catch (error) {
        setError('Failed to load dog information');
        setIsLoading(false);
      }
    };
    
    fetchDogInfo();
  }, [dogId, router]);
  
  const handleSubmit = async (formData: HealthRecordFormData) => {
    try {
      // Ensure description and results fields are used correctly as per memory
      const response = await submitHealthRecordForm(formData, userRole, userId, dogOwnerId);
      
      if (response.success) {
        router.push(`/manage/dogs/${dogId}/health`);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
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
            href={`/manage/dogs/${dogId}/health`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Health Records
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Add Health Record for {dogName}
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  Record health tests, examinations, and genetic screening results
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              <Link 
                href={`/manage/dogs/${dogId}/health`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Health Records
              </Link>
            </div>
          </div>
        </div>
        
        {/* Form Container */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <HealthRecordForm
            dogId={dogId}
            onSubmit={handleSubmit}
            userRole={userRole}
            userId={userId}
            dogOwnerId={dogOwnerId}
          />
        </div>
      </div>
    </div>
  );
}
