'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/utils/permissionUtils';
import { PedigreeChartOptions } from '@/types/pedigree';
import PedigreePageHeader from './PedigreePageHeader';
import DogSearchPanel from './DogSearchPanel';
import SamplePedigreePanel from './SamplePedigreePanel';
import PedigreeInstructionsPanel from './PedigreeInstructionsPanel';
import { createSamplePedigreeData } from '@/utils/samplePedigreeData';
import { calculateInbreedingCoefficient } from '@/services/pedigreeService';

// Import the PedigreeChart component - lazy loaded to improve performance
const ModernPedigreeChart = React.lazy(() => import('./ModernPedigreeChart'));

const PedigreeCreateContainer: React.FC = () => {
  const router = useRouter();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDogId, setSelectedDogId] = useState<string>('');
  
  const [pedigreeOptions, setPedigreeOptions] = useState<PedigreeChartOptions>({
    generations: 3,
    orientation: 'horizontal',
    showChampions: true,
    showHealthTests: true,
    showDates: true,
    showOwners: false,
    theme: 'standard'
  });

  // Sample pedigree data
  const [samplePedigreeData, setSamplePedigreeData] = useState<Map<string, any>>(new Map());
  const [showSamplePedigree, setShowSamplePedigree] = useState(true);
  const [sampleCOI, setSampleCOI] = useState<number | null>(null);
  
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
    
    // Check if user has permission to create pedigrees
    if (!hasPermission(role, 'pedigree', 'create', '', uid)) {
      setError('You do not have permission to create pedigrees');
      setIsLoading(false);
      return;
    }
    
    // Load sample pedigree data
    const sampleData = createSamplePedigreeData();
    setSamplePedigreeData(sampleData);
    
    // Calculate sample COI (Coefficient of Inbreeding)
    const sampleCoefficient = calculateInbreedingCoefficient('dog-root', sampleData);
    setSampleCOI(sampleCoefficient);
    
    setIsLoading(false);
  }, [router]);
  
  const handleDogSelect = (dogId: string) => {
    setSelectedDogId(dogId);
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
          <PedigreePageHeader 
            title="Error"
            subtitle="Permission Denied"
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PedigreePageHeader 
          title="Create New Pedigree"
          subtitle="Select a dog to create or view its pedigree"
        />
        
        <PedigreeInstructionsPanel />
        
        <DogSearchPanel 
          onDogSelect={handleDogSelect}
          selectedDogId={selectedDogId}
        />
        
        {selectedDogId && (
          <div className="mb-8">
            <React.Suspense fallback={
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading pedigree chart...</p>
              </div>
            }>
              <ModernPedigreeChart 
                dogId={selectedDogId}
                initialOptions={pedigreeOptions}
              />
            </React.Suspense>
          </div>
        )}
        
        {!selectedDogId && showSamplePedigree && (
          <div className="mb-8 bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sample Pedigree Chart</h3>
                  <p className="text-sm text-gray-600">
                    This is a sample pedigree to demonstrate how your dog's pedigree will appear. 
                    Search for and select your dog above to view their actual pedigree.
                  </p>
                </div>
                <button 
                  onClick={() => setShowSamplePedigree(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-3 flex items-center bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-3 rounded">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">
                  Sample COI (Coefficient of Inbreeding): <span className="font-semibold">{sampleCOI !== null ? (sampleCOI * 100).toFixed(2) + '%' : 'N/A'}</span>
                </p>
              </div>
            </div>
            
            <React.Suspense fallback={
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading sample pedigree...</p>
              </div>
            }>
              <ModernPedigreeChart 
                dogId="dog-root"
                initialOptions={{
                  ...pedigreeOptions,
                  theme: 'modern'
                }}
              />
            </React.Suspense>
          </div>
        )}
        
        {!selectedDogId && !showSamplePedigree && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowSamplePedigree(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Show Sample Pedigree
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PedigreeCreateContainer;
