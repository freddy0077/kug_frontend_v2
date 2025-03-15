'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_DOG, GET_DOGS } from '@/graphql/queries/dogQueries';
import LinebreedingAnalysis from '@/components/pedigree/LinebreedingAnalysis';
import { hasPermission } from '@/utils/permissionUtils';

export default function LinebreedingAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDogId, setSelectedDogId] = useState('');
  const [generations, setGenerations] = useState(6);
  
  // Fetch dog information
  const { loading: dogLoading, error: dogError, data: dogData } = useQuery(GET_DOG, {
    variables: { id: dogId },
    skip: !isAuthenticated,
  });
  
  // Fetch potential mates
  const { loading: dogsLoading, data: dogsData } = useQuery(GET_DOGS, {
    variables: { limit: 100 },
    skip: !isAuthenticated || !dogData?.dog?.gender,
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

  // Check if user has permission to view linebreeding analysis
  const canView = hasPermission(['admin', 'breeder', 'vet'], userRole);

  // Get potential mates based on dog gender
  const potentialMates = dogsData?.dogs?.items
    .filter((dog: any) => {
      if (!dogData?.dog?.gender) return false;
      return dog.gender !== dogData.dog.gender && dog.id !== dogId;
    }) || [];

  // Handle dog selection change
  const handleDogChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDogId(e.target.value);
  };

  // Handle generations change
  const handleGenerationsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenerations(parseInt(e.target.value));
  };

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

  if (!canView) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have permission to view linebreeding analysis.</p>
          <Link 
            href={`/manage/dogs/${dogId}`} 
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Return to Dog Profile
          </Link>
        </div>
      </div>
    );
  }

  const dog = dogData?.dog;

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
          <h1 className="text-2xl font-semibold mb-4">
            Linebreeding Analysis
          </h1>
          
          <div>
            <p className="text-gray-600 mb-4">
              Analyzing potential linebreeding for {dog?.name} ({dog?.gender || 'unknown'})
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="mateDog" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Potential Mate
                </label>
                <select
                  id="mateDog"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  onChange={handleDogChange}
                  value={selectedDogId}
                >
                  <option value="">Select a dog</option>
                  {potentialMates.map((mate: any) => (
                    <option key={mate.id} value={mate.id}>
                      {mate.name} - {mate.breed}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="generations" className="block text-sm font-medium text-gray-700 mb-1">
                  Generations to Analyze
                </label>
                <select
                  id="generations"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  onChange={handleGenerationsChange}
                  value={generations}
                >
                  <option value="3">3 Generations</option>
                  <option value="4">4 Generations</option>
                  <option value="5">5 Generations</option>
                  <option value="6">6 Generations</option>
                  <option value="8">8 Generations</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {selectedDogId ? (
          <LinebreedingAnalysis 
            sireId={dog?.gender === 'male' ? dogId : selectedDogId}
            damId={dog?.gender === 'female' ? dogId : selectedDogId}
            generations={generations}
          />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-500 text-center py-8">
              Please select a potential mate to view linebreeding analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
