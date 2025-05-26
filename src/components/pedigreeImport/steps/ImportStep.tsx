'use client';

import React from 'react';
import { PedigreeImport, PedigreeExtractedDog, PEDIGREE_POSITION_LABELS } from '@/types/pedigreeImport';

interface ImportStepProps {
  importData: PedigreeImport | null;
  selectedDogs: Record<string, boolean>;
  onImport: () => void;
  onPreviousStep: () => void;
  loading: boolean;
}

const ImportStep: React.FC<ImportStepProps> = ({
  importData,
  selectedDogs,
  onImport,
  onPreviousStep,
  loading
}) => {
  // If no import data is available, show error
  if (!importData) {
    return (
      <div className="bg-red-50 rounded-md p-4">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <div className="mt-2 text-sm text-red-700">
          <p>No pedigree import data found. Please go back and upload a PDF.</p>
        </div>
      </div>
    );
  }
  
  // Get selected dogs
  const extractedDogs = importData.extractedDogs || [];
  const dogsToImport = extractedDogs.filter(dog => selectedDogs[dog.id]);
  
  // Group dogs by generation (based on position)
  const groupedDogs: Record<string, PedigreeExtractedDog[]> = {};
  dogsToImport.forEach(dog => {
    const generationKey = dog.position.startsWith('sire') || dog.position.startsWith('dam')
      ? dog.position.length <= 4 
        ? 'parents' // sire, dam
        : dog.position.length <= 7
          ? 'grandparents' // sireSire, sireDam, damSire, damDam
          : 'greatgrandparents' // sireSireSire, etc.
      : 'main'; // dog
      
    if (!groupedDogs[generationKey]) {
      groupedDogs[generationKey] = [];
    }
    groupedDogs[generationKey].push(dog);
  });
  
  // Count existing vs new dogs
  const existingDogCount = dogsToImport.filter(dog => dog.exists).length;
  const newDogCount = dogsToImport.length - existingDogCount;
  
  return (
    <div className="bg-white overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Import Selected Dogs
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Review the selected dogs that will be imported into the system. 
            This will register new dogs and establish their relationship in the pedigree.
          </p>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-5 bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-700">Import Summary</h4>
          <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Selected Dogs
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {dogsToImport.length}
                </dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  New Dogs to Register
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {newDogCount}
                </dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Existing Dogs
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {existingDogCount}
                </dd>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dogs by generation */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Selected Dogs by Generation</h4>
          
          {/* Main dog */}
          {groupedDogs['main'] && groupedDogs['main'].length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Main Dog</h5>
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {groupedDogs['main'].map(dog => (
                  <li key={dog.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">
                        {dog.name || 'Unnamed Dog'} ({PEDIGREE_POSITION_LABELS[dog.position]})
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {dog.exists ? (
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Already Exists
                        </span>
                      ) : (
                        <span className="font-medium text-green-600 hover:text-green-500">
                          New Registration
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Parents */}
          {groupedDogs['parents'] && groupedDogs['parents'].length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Parents</h5>
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {groupedDogs['parents'].map(dog => (
                  <li key={dog.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">
                        {dog.name || 'Unnamed Dog'} ({PEDIGREE_POSITION_LABELS[dog.position]})
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {dog.exists ? (
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Already Exists
                        </span>
                      ) : (
                        <span className="font-medium text-green-600 hover:text-green-500">
                          New Registration
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Grandparents */}
          {groupedDogs['grandparents'] && groupedDogs['grandparents'].length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Grandparents</h5>
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {groupedDogs['grandparents'].map(dog => (
                  <li key={dog.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">
                        {dog.name || 'Unnamed Dog'} ({PEDIGREE_POSITION_LABELS[dog.position]})
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {dog.exists ? (
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Already Exists
                        </span>
                      ) : (
                        <span className="font-medium text-green-600 hover:text-green-500">
                          New Registration
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Great grandparents */}
          {groupedDogs['greatgrandparents'] && groupedDogs['greatgrandparents'].length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Great Grandparents</h5>
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {groupedDogs['greatgrandparents'].map(dog => (
                  <li key={dog.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">
                        {dog.name || 'Unnamed Dog'} ({PEDIGREE_POSITION_LABELS[dog.position]})
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {dog.exists ? (
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Already Exists
                        </span>
                      ) : (
                        <span className="font-medium text-green-600 hover:text-green-500">
                          New Registration
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Warning message */}
        {dogsToImport.length === 0 ? (
          <div className="mt-4 bg-yellow-50 border border-yellow-400 text-yellow-700 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-yellow-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No dogs selected</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You haven't selected any dogs to import. Please go back and select at least one dog.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-yellow-50 border border-yellow-400 text-yellow-700 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg 
                  className="h-5 w-5 text-yellow-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This action will register {newDogCount} new dogs and establish relationships between all selected dogs.
                    This operation cannot be undone, but you can edit the registered dogs later if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-5 flex justify-between">
          <button
            type="button"
            onClick={onPreviousStep}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg 
              className="-ml-1 mr-2 h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back
          </button>
          
          <button
            type="button"
            onClick={onImport}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              dogsToImport.length > 0 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            disabled={dogsToImport.length === 0 || loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Importing...
              </>
            ) : (
              'Import Selected Dogs'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportStep;
