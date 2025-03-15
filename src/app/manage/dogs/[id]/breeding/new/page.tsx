'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import BreedingRecordForm from '@/components/pedigree/BreedingRecordForm';
import { GET_DOG } from '@/graphql/queries/dogQueries';
import { hasPermission } from '@/utils/permissionUtils';

export default function NewBreedingRecordPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch dog information
  const { loading: dogLoading, error: dogError, data: dogData } = useQuery(GET_DOG, {
    variables: { id: dogId },
    skip: !isAuthenticated,
  });
  
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
    
    setIsLoading(false);
  }, [router]);

  // Check if user has permission to create breeding records
  const canCreateBreedingRecord = hasPermission(userRole, 'breeding-program', 'create');

  if (isLoading || dogLoading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || dogError) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Error</h1>
          <p>{error || dogError?.message || 'An unknown error occurred'}</p>
          <Link 
            href="/manage/dogs" 
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Return to Dogs
          </Link>
        </div>
      </div>
    );
  }

  if (!canCreateBreedingRecord) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have permission to create breeding records.</p>
          <Link 
            href={`/manage/dogs/${dogId}/breeding`} 
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Return to Breeding Records
          </Link>
        </div>
      </div>
    );
  }

  const dog = dogData?.dog;
  
  // Determine if the current dog should be the sire or dam based on gender
  const initialSireId = dog?.gender === 'male' ? dogId : undefined;
  const initialDamId = dog?.gender === 'female' ? dogId : undefined;

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link 
            href={`/manage/dogs/${dogId}/breeding`} 
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Breeding Records
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-semibold mb-2">
            New Breeding Record
          </h1>
          <p className="text-gray-600">
            {dog?.name ? `Creating a breeding record for ${dog.name}` : 'Loading...'}
          </p>
        </div>
        
        <BreedingRecordForm
          mode="create"
          initialSireId={initialSireId}
          initialDamId={initialDamId}
        />
      </div>
    </div>
  );
}
