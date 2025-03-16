'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PhotoManager from '@/components/dogs/PhotoManager';
import { hasPermission, UserRole } from '@/utils/permissionUtils';

export default function DogPhotosPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.VIEWER);
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dog, setDog] = useState<any>(null);

  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    const uid = localStorage.getItem('userId') || '';
    
    setIsAuthenticated(authStatus);
    setUserRole(role as UserRole);
    setUserId(uid);
    
    // Redirect if not authenticated
    if (!authStatus) {
      router.push('/auth/login');
      return;
    }
    
    // Fetch dog data
    fetchDogInfo();
  }, [dogId, router]);

  const fetchDogInfo = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      // For now, simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock dog data - ensuring dateOfBirth is always a Date
      const mockDog = {
        id: dogId,
        name: 'Champion Rocky',
        breedName: 'Labrador Retriever',
        gender: 'male' as 'male' | 'female',
        color: 'Black',
        dateOfBirth: new Date('2020-05-15'), // Ensuring this is a Date object
        ownerId: 'user123',
        ownerName: 'John Smith',
        photos: [
          {
            id: '1',
            url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
            caption: 'Profile photo',
            isPrimary: true,
            uploadDate: new Date('2024-01-15')
          },
          {
            id: '2',
            url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6',
            caption: 'At the park',
            isPrimary: false,
            uploadDate: new Date('2024-02-20')
          },
          {
            id: '3',
            url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
            caption: 'Show stance',
            isPrimary: false,
            uploadDate: new Date('2024-03-01')
          }
        ]
      };
      
      setDog(mockDog);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching dog info:', err);
      setError('Failed to load dog information');
      setIsLoading(false);
    }
  };

  // Check user permissions
  const hasViewPermission = dog && hasPermission(userRole, 'dog', 'view', dog.ownerId, userId);
  const hasEditPermission = dog && hasPermission(userRole, 'dog', 'edit', dog.ownerId, userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !dog) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          <p>{error || 'Failed to load dog information'}</p>
        </div>
        <div className="mt-4">
          <Link 
            href="/manage/dogs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dogs
          </Link>
        </div>
      </div>
    );
  }

  if (!hasViewPermission) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          <p>You do not have permission to view this dog's photos</p>
        </div>
        <div className="mt-4">
          <Link 
            href="/manage/dogs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dogs
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
                {dog.name} - Photo Gallery
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  {dog.breedName} • {dog.gender === 'male' ? 'Male' : 'Female'} • {dog.color}
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              <Link 
                href={`/manage/dogs/${dogId}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dog Profile
              </Link>
            </div>
          </div>
        </div>
        
        {/* Photo Manager Component */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <PhotoManager
            dogId={dogId}
            userRole={userRole}
            userId={userId}
            ownerId={dog.ownerId}
            initialPhotos={dog.photos}
          />
        </div>
        
        {/* Usage Instructions */}
        <div className="mt-8 bg-blue-50 shadow overflow-hidden sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Photo Management Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>The <strong>primary photo</strong> will be used as the main display image across the platform.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Add <strong>detailed captions</strong> to help identify images in search results.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>For <strong>show dogs</strong>, include photos of stance and movement for reference.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Maximum file size is <strong>5MB</strong> per photo, and supported formats are JPEG, PNG, and WebP.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
