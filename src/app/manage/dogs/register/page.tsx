'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { hasPermission, UserRole } from '@/utils/permissionUtils';
import { submitDogForm, DogFormData } from '@/utils/formHandlers';
import DogRegistrationForm from '@/components/dogs/DogRegistrationForm';

export default function RegisterDog() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.VIEWER);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState({ type: '', message: '' });
  
  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    const uid = localStorage.getItem('userId') || '';
    
    setIsAuthenticated(authStatus);
    setUserRole(role as UserRole);
    setUserId(uid);
    setIsLoading(false);
    
    // Redirect if not authenticated or doesn't have permission
    if (!authStatus) {
      router.push('/auth/login');
    } else if (!hasPermission(role as UserRole, 'dog', 'create')) {
      router.push('/user/dashboard');
    }
  }, [router]);

  const handleSubmit = async (formData: DogFormData) => {
    try {
      // Make sure dateOfBirth is always a Date
      if (!(formData.dateOfBirth instanceof Date) || isNaN(formData.dateOfBirth.getTime())) {
        formData.dateOfBirth = new Date(); // Default to current date if invalid
      }
      
      // Process dateOfDeath if present
      if (formData.dateOfDeath && 
          (!(formData.dateOfDeath instanceof Date) || isNaN(formData.dateOfDeath.getTime()))) {
        delete formData.dateOfDeath; // Remove invalid date
      }

      const response = await submitDogForm(formData, userRole, userId);
      
      if (response.success) {
        setSubmitMessage({
          type: 'success',
          message: 'Dog registered successfully!'
        });
        
        // Redirect to dog profile after successful registration
        setTimeout(() => {
          router.push(`/manage/dogs/${response.data.id}`);
        }, 2000);
      } else {
        setSubmitMessage({
          type: 'error',
          message: response.message || 'Error registering dog'
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || !hasPermission(userRole, 'dog', 'create')) {
    return null; // We already redirect in the useEffect, this is just a safeguard
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Register New Dog
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  Add a new dog to the registry
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              <Link 
                href="/manage/dogs"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dogs
              </Link>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {submitMessage.message && (
            <div className={`p-4 ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {submitMessage.message}
            </div>
          )}
          
          <DogRegistrationForm onSubmit={handleSubmit} userRole={userRole} userId={userId} />
        </div>
      </div>
    </div>
  );
}
