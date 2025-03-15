'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DogProfileHeader from '@/components/dogs/DogProfileHeader';
import PhotoManager from '@/components/dogs/PhotoManager';
import { hasPermission } from '@/utils/permissionUtils';

export default function DogProfilePage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
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
    setUserRole(role);
    setUserId(uid);
    
    // Redirect if not authenticated
    if (!authStatus) {
      router.push('/auth/login');
      return;
    }
    
    // Fetch dog data
    fetchDogProfile();
  }, [dogId, router]);

  const fetchDogProfile = async () => {
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
        registrationNumber: 'AKC123456789',
        microchipNumber: '985112345678903',
        ownerId: 'user123',
        ownerName: 'John Smith',
        profileImageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
        parents: {
          sire: { id: 'sire1', name: 'Max Power' },
          dam: { id: 'dam1', name: 'Lady Grace' }
        },
        offspring: [
          { id: 'pup1', name: 'Junior', gender: 'male' as 'male' | 'female' },
          { id: 'pup2', name: 'Princess', gender: 'female' as 'male' | 'female' }
        ],
        titles: ['CH', 'GRCH'],
        healthRecords: 3,
        competitionResults: 5
      };
      
      setDog(mockDog);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching dog profile:', err);
      setError('Failed to load dog profile');
      setIsLoading(false);
    }
  };

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
          <p>{error || 'Failed to load dog profile'}</p>
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

  const canViewHealth = hasPermission(userRole, 'health-record', 'view', dog.ownerId, userId);
  const canViewCompetitions = hasPermission(userRole, 'competition', 'view', dog.ownerId, userId);
  const canViewBreeding = hasPermission(userRole, 'dog', 'view', dog.ownerId, userId);

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumbs */}
        <nav className="flex mb-5" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <div>
                <Link href="/manage/dogs" className="text-gray-400 hover:text-gray-500">
                  <span className="text-sm font-medium">Dogs</span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="flex-shrink-0 h-5 w-5 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span className="ml-4 text-sm font-medium text-gray-500">{dog.name}</span>
              </div>
            </li>
          </ol>
        </nav>
        
        {/* Dog Profile Header */}
        <DogProfileHeader 
          dog={dog}
          userRole={userRole}
          userId={userId}
        />
        
        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/manage/dogs/${dogId}/pedigree`}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pedigree
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-semibold text-gray-900">
                      View Family Tree
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </Link>
          
          {canViewHealth && (
            <Link
              href={`/manage/dogs/${dogId}/health`}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Health Records
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-lg font-semibold text-gray-900">
                        {dog.healthRecords} records
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </Link>
          )}
          
          {canViewCompetitions && (
            <Link
              href={`/manage/dogs/${dogId}/competitions`}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Competition Results
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-lg font-semibold text-gray-900">
                        {dog.competitionResults} results
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </Link>
          )}
          
          {canViewBreeding && (
            <Link
              href={`/manage/dogs/${dogId}/breeding`}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Breeding Records
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-lg font-semibold text-gray-900">
                        {dog.offspring?.length || 0} offspring
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
        
        {/* Ancestry Section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Ancestry
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Parents and offspring information
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Sire</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {dog.parents?.sire ? (
                    <Link 
                      href={`/manage/dogs/${dog.parents.sire.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {dog.parents.sire.name}
                    </Link>
                  ) : (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Dam</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {dog.parents?.dam ? (
                    <Link 
                      href={`/manage/dogs/${dog.parents.dam.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {dog.parents.dam.name}
                    </Link>
                  ) : (
                    <span className="text-gray-500">Not specified</span>
                  )}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Offspring</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {dog.offspring && dog.offspring.length > 0 ? (
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {dog.offspring.map((puppy: any) => (
                        <li key={puppy.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            {puppy.gender === 'male' 
                              ? <span className="text-blue-500 mr-2">♂</span> 
                              : <span className="text-pink-500 mr-2">♀</span>}
                            <span className="ml-2 flex-1 w-0 truncate">{puppy.name}</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <Link
                              href={`/manage/dogs/${puppy.id}`}
                              className="font-medium text-blue-600 hover:text-blue-500"
                            >
                              View
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500">No offspring recorded</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Titles Section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Titles
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {dog.titles && dog.titles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dog.titles.map((title: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                  >
                    {title}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No titles earned yet</p>
            )}
          </div>
        </div>
        
        {/* Photos Section */}
        <div className="mt-8">
          <PhotoManager
            dogId={dogId}
            userRole={userRole}
            userId={userId}
            ownerId={dog.ownerId}
          />
        </div>
      </div>
    </div>
  );
}
