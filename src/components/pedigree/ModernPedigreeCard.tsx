'use client';

import React, { useState } from 'react';
import { DogPedigreeData } from '@/types/pedigree';
import { formatPedigreeDate } from '@/utils/pedigreeUtils';
import Image from 'next/image';
import ParentAddEditModal from './ParentAddEditModal';

interface ModernPedigreeCardProps {
  dog: DogPedigreeData | null;
  showChampions: boolean;
  showHealthTests: boolean;
  showDates: boolean;
  showOwners: boolean;
  theme: 'standard' | 'classic' | 'modern' | 'minimal';
  onClick?: (dogId: string) => void;
  onAddParent?: (dogId: string, parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => void;
  onEditParent?: (dogId: string, parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => void;
  canEditPedigree?: boolean;
}

const ModernPedigreeCard: React.FC<ModernPedigreeCardProps> = ({
  dog,
  showChampions,
  showHealthTests,
  showDates,
  showOwners,
  theme,
  onClick,
  onAddParent,
  onEditParent,
  canEditPedigree = false
}) => {
  const [showSireModal, setShowSireModal] = useState(false);
  const [showDamModal, setShowDamModal] = useState(false);
  
  // Handle adding/editing a parent
  const handleSaveParent = (parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => {
    if (!dog) return;
    
    if ((parentType === 'sire' && dog.sireId) || (parentType === 'dam' && dog.damId)) {
      // Parent exists, edit it
      onEditParent && onEditParent(dog.id, parentType, parentData);
    } else {
      // Parent doesn't exist, add it
      onAddParent && onAddParent(dog.id, parentType, parentData);
    }
  };
  
  if (!dog) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 m-1 flex items-center justify-center h-32 w-56">
        <p className="text-gray-400 text-sm">Unknown</p>
      </div>
    );
  }
  
  // Determine if this dog has parents
  const hasSire = !!dog.sireId;
  const hasDam = !!dog.damId;
  
  const handleClick = () => {
    if (onClick) {
      onClick(dog.id);
    }
  };

  // Theme configurations
  const cardThemes = {
    standard: {
      container: 'bg-white border border-gray-200',
      header: 'bg-gray-50 border-b border-gray-200',
      body: ''
    },
    classic: {
      container: 'bg-amber-50 border border-amber-200',
      header: 'bg-amber-100 border-b border-amber-200',
      body: 'text-amber-900'
    },
    modern: {
      container: 'bg-gradient-to-br from-blue-50 to-white border border-blue-200',
      header: 'bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200',
      body: ''
    },
    minimal: {
      container: 'bg-white border border-gray-100 shadow-sm',
      header: 'border-b border-gray-100',
      body: 'text-gray-600'
    }
  };
  
  // Gender-specific styling
  const genderConfig = {
    male: {
      icon: '♂️',
      accent: 'bg-blue-100 text-blue-800 border-blue-300 ring-blue-200',
      headerBg: dog.isChampion ? 'bg-gradient-to-r from-blue-600 to-blue-500' : ''
    },
    female: {
      icon: '♀️',
      accent: 'bg-pink-100 text-pink-800 border-pink-300 ring-pink-200',
      headerBg: dog.isChampion ? 'bg-gradient-to-r from-pink-600 to-pink-500' : ''
    }
  };
  
  const genderStyles = genderConfig[dog.gender];
  const themeStyles = cardThemes[theme];
  
  // Special styling for champion dogs
  const championHeaderClass = dog.isChampion 
    ? `${genderStyles.headerBg} text-white` 
    : themeStyles.header;
  
  return (
    <>
      <div 
        className={`${themeStyles.container} rounded-lg shadow transition-all duration-200 hover:shadow-md m-1 overflow-hidden w-56 h-auto relative`}
        onClick={handleClick}
      >
        {/* Card Header */}
        <div className={`${championHeaderClass} px-3 py-2 flex items-center justify-between`}>
          <h3 className="font-semibold truncate text-sm flex-1" title={dog.name}>
            {dog.name}
          </h3>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <span className={`text-xs ${dog.gender === 'male' ? 'text-blue-600' : 'text-pink-600'} ${dog.isChampion ? 'text-white' : ''}`}>
              {genderStyles.icon}
            </span>
            
            {showChampions && dog.isChampion && (
              <span title="Champion" className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            )}
          </div>
        </div>
        
        {/* Card Body */}
        <div className={`p-3 ${themeStyles.body}`}>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div>
              <span className="text-gray-500">Reg:</span>
              <div className="font-medium truncate" title={dog.registrationNumber}>
                {dog.registrationNumber || 'N/A'}
              </div>
            </div>
            
            <div>
              <span className="text-gray-500">Breed:</span>
              <div className="font-medium truncate" title={dog.breedName}>
                {dog.breedName}
              </div>
            </div>
            
            {showDates && (
              <div className="col-span-2 mt-1">
                <span className="text-gray-500">DOB:</span>
                <div className="font-medium">
                  {formatPedigreeDate(dog.dateOfBirth)}
                </div>
              </div>
            )}
            
            {showOwners && (
              <div className="col-span-2 mt-1">
                <span className="text-gray-500">Owner:</span>
                <div className="font-medium truncate" title={dog.ownerName}>
                  {dog.ownerName}
                </div>
              </div>
            )}
          </div>
          
          {/* Health and Achievements Indicators */}
          <div className="mt-2 flex items-center space-x-1">
            {showHealthTests && dog.hasHealthTests && (
              <span 
                title="Health Tested" 
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${genderStyles.accent}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Health Tested
              </span>
            )}
            
            {showChampions && dog.isChampion && !championHeaderClass.includes('text-white') && (
              <span 
                title="Champion" 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Champion
              </span>
            )}
          </div>
        </div>
        
        {/* Add/Edit Parent Button */}
        {canEditPedigree && (
          <div className="absolute top-1 right-1">
            <div className="relative group">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                aria-label="Edit parents"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
              
              {/* Dropdown menu for parent actions */}
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
                <div className="bg-white shadow-lg rounded py-1 w-32 border border-gray-200 text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSireModal(true);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center"
                  >
                    <span className="w-4 h-4 mr-2 inline-block text-blue-600">
                      {hasSire ? '✏️' : '➕'}
                    </span>
                    {hasSire ? 'Edit Sire' : 'Add Sire'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDamModal(true);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center"
                  >
                    <span className="w-4 h-4 mr-2 inline-block text-pink-600">
                      {hasDam ? '✏️' : '➕'}
                    </span>
                    {hasDam ? 'Edit Dam' : 'Add Dam'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Parent Modals */}
      {showSireModal && (
        <ParentAddEditModal
          isOpen={showSireModal}
          onClose={() => setShowSireModal(false)}
          onSave={(parentData) => handleSaveParent('sire', parentData)}
          parentType="sire"
          currentData={hasSire ? {
            id: dog.sireId,
            name: dog.sireName || '',
            registrationNumber: dog.sireRegistration || '',
          } : undefined}
          dogName={dog.name}
        />
      )}
      
      {showDamModal && (
        <ParentAddEditModal
          isOpen={showDamModal}
          onClose={() => setShowDamModal(false)}
          onSave={(parentData) => handleSaveParent('dam', parentData)}
          parentType="dam"
          currentData={hasDam ? {
            id: dog.damId,
            name: dog.damName || '',
            registrationNumber: dog.damRegistration || '',
          } : undefined}
          dogName={dog.name}
        />
      )}
    </>
  );
};



export default ModernPedigreeCard;
