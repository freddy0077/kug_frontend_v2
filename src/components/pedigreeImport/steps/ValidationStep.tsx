'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { 
  PedigreeImport, 
  PedigreeExtractedDog, 
  PEDIGREE_POSITION_LABELS 
} from '@/types/pedigreeImport';
import { PedigreeImportStatus } from '@/graphql/queries/pedigreeImportQueries';
import { 
  UPDATE_EXTRACTED_DOG, 
  UPDATE_EXTRACTED_DOG_STATUS 
} from '@/graphql/mutations/pedigreeImportMutations';
import ExtractedDogCard from '../ExtractedDogCard';
import { UserRole } from '@/utils/permissionUtils';

interface ValidationStepProps {
  importData: PedigreeImport | null;
  selectedDogs: Record<string, boolean>;
  onToggleSelection: (dogId: string, selected: boolean) => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onRefresh: () => void;
}

const ValidationStep: React.FC<ValidationStepProps> = ({
  importData,
  selectedDogs,
  onToggleSelection,
  onNextStep,
  onPreviousStep,
  onRefresh
}) => {
  const [editingDogId, setEditingDogId] = useState<string | null>(null);
  const [dogFilter, setDogFilter] = useState<string>('all');
  
  // Update extracted dog mutation
  const [updateExtractedDog, { loading: updateLoading }] = useMutation(UPDATE_EXTRACTED_DOG, {
    onCompleted: () => {
      setEditingDogId(null);
      onRefresh(); // Refresh data after update
    }
  });
  
  // Update selection status mutation
  const [updateExtractedDogStatus, { loading: statusUpdateLoading }] = useMutation(UPDATE_EXTRACTED_DOG_STATUS);
  
  // Handle toggle selection with mutation
  const handleToggleSelection = (dogId: string, selected: boolean) => {
    updateExtractedDogStatus({
      variables: { extractedDogId: dogId, selected }
    });
    onToggleSelection(dogId, selected);
  };
  
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
  
  // Check if we have extracted dogs
  const extractedDogs = importData.extractedDogs || [];
  if (extractedDogs.length === 0) {
    return (
      <div className="bg-yellow-50 rounded-md p-4">
        <h3 className="text-lg font-medium text-yellow-800">No Dogs Found</h3>
        <div className="mt-2 text-sm text-yellow-700">
          <p>No dogs were extracted from the PDF. Please try a different document or adjust the PDF quality.</p>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={onPreviousStep}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // Filter dogs based on the current filter
  const filteredDogs = extractedDogs.filter(dog => {
    if (dogFilter === 'all') return true;
    if (dogFilter === 'selected') return selectedDogs[dog.id];
    if (dogFilter === 'unselected') return !selectedDogs[dog.id];
    if (dogFilter === 'existing') return dog.exists;
    if (dogFilter === 'new') return !dog.exists;
    return true;
  });
  
  // Count selected dogs
  const selectedCount = extractedDogs.filter(dog => selectedDogs[dog.id]).length;
  
  // Group dogs by generation (based on position)
  const groupedDogs: Record<string, PedigreeExtractedDog[]> = {};
  filteredDogs.forEach(dog => {
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
  
  return (
    <div className="bg-white overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Validate Extracted Dogs
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Review and edit the information extracted from the pedigree. Select which dogs you want to import.
          </p>
        </div>
        
        {/* Filter controls */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <label htmlFor="dog-filter" className="block text-sm font-medium text-gray-700">
              Filter:
            </label>
            <select
              id="dog-filter"
              name="dog-filter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              value={dogFilter}
              onChange={(e) => setDogFilter(e.target.value)}
            >
              <option value="all">All Dogs ({extractedDogs.length})</option>
              <option value="selected">Selected ({selectedCount})</option>
              <option value="unselected">Unselected ({extractedDogs.length - selectedCount})</option>
              <option value="existing">Existing in Database ({extractedDogs.filter(d => d.exists).length})</option>
              <option value="new">New Dogs ({extractedDogs.filter(d => !d.exists).length})</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                // Select all visible dogs
                filteredDogs.forEach(dog => {
                  if (!selectedDogs[dog.id]) {
                    handleToggleSelection(dog.id, true);
                  }
                });
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Select All Visible
            </button>
            <button
              type="button"
              onClick={() => {
                // Deselect all visible dogs
                filteredDogs.forEach(dog => {
                  if (selectedDogs[dog.id]) {
                    handleToggleSelection(dog.id, false);
                  }
                });
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Deselect All Visible
            </button>
          </div>
        </div>
        
        {/* Main dog */}
        {groupedDogs['main'] && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Main Dog</h4>
            <div className="grid grid-cols-1">
              {groupedDogs['main'].map(dog => (
                <ExtractedDogCard
                  key={dog.id}
                  dog={dog}
                  selected={selectedDogs[dog.id] || false}
                  positionLabel={PEDIGREE_POSITION_LABELS[dog.position] || 'Unknown Position'}
                  isEditing={editingDogId === dog.id}
                  onEdit={() => setEditingDogId(dog.id)}
                  onCancelEdit={() => setEditingDogId(null)}
                  onSaveEdit={(updatedDog) => {
                    updateExtractedDog({
                      variables: {
                        id: dog.id,
                        input: updatedDog
                      }
                    });
                  }}
                  onToggleSelection={(selected) => handleToggleSelection(dog.id, selected)}
                  saveLoading={updateLoading}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Parents */}
        {groupedDogs['parents'] && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Parents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedDogs['parents'].map(dog => (
                <ExtractedDogCard
                  key={dog.id}
                  dog={dog}
                  selected={selectedDogs[dog.id] || false}
                  positionLabel={PEDIGREE_POSITION_LABELS[dog.position] || 'Unknown Position'}
                  isEditing={editingDogId === dog.id}
                  onEdit={() => setEditingDogId(dog.id)}
                  onCancelEdit={() => setEditingDogId(null)}
                  onSaveEdit={(updatedDog) => {
                    updateExtractedDog({
                      variables: {
                        id: dog.id,
                        input: updatedDog
                      }
                    });
                  }}
                  onToggleSelection={(selected) => handleToggleSelection(dog.id, selected)}
                  saveLoading={updateLoading}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Grandparents */}
        {groupedDogs['grandparents'] && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Grandparents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {groupedDogs['grandparents'].map(dog => (
                <ExtractedDogCard
                  key={dog.id}
                  dog={dog}
                  selected={selectedDogs[dog.id] || false}
                  positionLabel={PEDIGREE_POSITION_LABELS[dog.position] || 'Unknown Position'}
                  isEditing={editingDogId === dog.id}
                  onEdit={() => setEditingDogId(dog.id)}
                  onCancelEdit={() => setEditingDogId(null)}
                  onSaveEdit={(updatedDog) => {
                    updateExtractedDog({
                      variables: {
                        id: dog.id,
                        input: updatedDog
                      }
                    });
                  }}
                  onToggleSelection={(selected) => handleToggleSelection(dog.id, selected)}
                  saveLoading={updateLoading}
                  isCompact
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Great Grandparents */}
        {groupedDogs['greatgrandparents'] && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Great Grandparents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {groupedDogs['greatgrandparents'].map(dog => (
                <ExtractedDogCard
                  key={dog.id}
                  dog={dog}
                  selected={selectedDogs[dog.id] || false}
                  positionLabel={PEDIGREE_POSITION_LABELS[dog.position] || 'Unknown Position'}
                  isEditing={editingDogId === dog.id}
                  onEdit={() => setEditingDogId(dog.id)}
                  onCancelEdit={() => setEditingDogId(null)}
                  onSaveEdit={(updatedDog) => {
                    updateExtractedDog({
                      variables: {
                        id: dog.id,
                        input: updatedDog
                      }
                    });
                  }}
                  onToggleSelection={(selected) => handleToggleSelection(dog.id, selected)}
                  saveLoading={updateLoading}
                  isCompact
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-8 flex justify-between">
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
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onRefresh}
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
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
                  clipRule="evenodd" 
                />
              </svg>
              Refresh
            </button>
            
            <button
              type="button"
              onClick={onNextStep}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                selectedCount > 0 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-300 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              disabled={selectedCount === 0}
            >
              Continue to Import
              <svg 
                className="ml-2 -mr-1 h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationStep;
