'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { useQuery } from '@apollo/client';
import { GET_DOG_BY_ID } from '@/graphql/queries/dogQueries';

// Components
import DogHeroSection from '@/components/dogs/DogHeroSection';
import DogDetailsTabs from '@/components/dogs/DogDetailsTabs';
import ProfileTab from '@/components/dogs/tabs/ProfileTab';
import PedigreeTab from '@/components/dogs/tabs/PedigreeTab';
import HealthTab from '@/components/dogs/tabs/HealthTab';
import CompetitionsTab from '@/components/dogs/tabs/CompetitionsTab';
import GalleryTab from '@/components/dogs/tabs/GalleryTab';

export default function DogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dogId = params.id as string;
  
  // Get the tab from URL query parameters if present
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabParam || 'profile');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Handle tab change - update URL without full navigation
  const handleTabChange = (tabIndex: number) => {
    const tabNames = ['profile', 'pedigree', 'health', 'competitions', 'gallery'];
    const newTab = tabNames[tabIndex];
    setActiveTab(newTab);
    
    // Update URL without refreshing the page
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    window.history.pushState({}, '', url);
  };
  
  // Check if the route is for creating a new dog
  if (dogId === 'new') {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 sm:p-10">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Dog</h1>
              <p className="text-gray-700">The dog creation form will be implemented here.</p>
              {/* TODO: Implement dog creation form */}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Fetch dog details using GraphQL
  const { loading, error, data } = useQuery(GET_DOG_BY_ID, {
    variables: { id: dogId },
    fetchPolicy: 'network-only'
  });

  // Update loading state when data changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-4 border-green-600 border-opacity-50 animate-spin"></div>
            <div className="h-16 w-16 rounded-full border-l-4 border-green-600 border-opacity-50 animate-spin absolute top-0 animate-spin-slow"></div>
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading dog details...</p>
          <p className="text-sm text-gray-500 mt-2">Retrieving the latest information</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !data?.dog) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center">
                <svg className="h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
                {error ? 'Error Loading Dog' : 'Dog Not Found'}
              </h2>
              <p className="mt-2 text-center text-gray-600">
                {error ? `${error.message}` : 'The dog you are looking for could not be found.'}
              </p>
              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/dogs')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Back to Dogs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dog = data.dog;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero section with dog image and basic info */}
      <DogHeroSection dog={dog} />
      
      {/* Tab-based navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <DogDetailsTabs dogId={dogId} activeTab={activeTab} onTabChange={handleTabChange}>
          <Tab.Panel>
            <ProfileTab dog={dog} />
          </Tab.Panel>
          <Tab.Panel>
            <PedigreeTab 
              dogId={dogId}
              dogName={dog.name}
              sire={dog.sire}
              dam={dog.dam}
            />
          </Tab.Panel>
          <Tab.Panel>
            <HealthTab 
              dogId={dogId} 
              healthRecords={dog.healthRecords || []}
            />
          </Tab.Panel>
          <Tab.Panel>
            <CompetitionsTab 
              dogId={dogId} 
              results={dog.competitionResults || []}
            />
          </Tab.Panel>
          <Tab.Panel>
            <GalleryTab 
              dogName={dog.name} 
              images={dog.images || []}
            />
          </Tab.Panel>
        </DogDetailsTabs>
      </div>
    </div>
  );
}
