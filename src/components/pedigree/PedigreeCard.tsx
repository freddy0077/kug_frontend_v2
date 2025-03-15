'use client';

import React from 'react';
import { DogPedigreeData } from '@/types/pedigree';
import { formatPedigreeDate } from '@/utils/pedigreeUtils';

interface PedigreeCardProps {
  dog: DogPedigreeData;
  showChampions: boolean;
  showHealthTests: boolean;
  showDates: boolean;
  showOwners: boolean;
  theme: 'standard' | 'classic' | 'modern';
  onClick?: (dogId: string) => void;
}

export const PedigreeCard: React.FC<PedigreeCardProps> = ({
  dog,
  showChampions,
  showHealthTests,
  showDates,
  showOwners,
  theme,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(dog.id);
    }
  };

  const cardThemeClasses = {
    standard: 'bg-white border border-gray-200',
    classic: 'bg-amber-50 border border-amber-200',
    modern: 'bg-gradient-to-br from-blue-50 to-white border border-blue-200'
  };
  
  const maleClasses = 'text-blue-700 border-blue-300';
  const femaleClasses = 'text-pink-700 border-pink-300';
  const genderClasses = dog.gender === 'male' ? maleClasses : femaleClasses;
  
  return (
    <div 
      className={`${cardThemeClasses[theme]} ${genderClasses} rounded-lg shadow-sm p-3 m-1 hover:shadow-md transition-shadow cursor-pointer text-sm w-48`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold truncate text-base pr-1" title={dog.name}>
          {dog.name}
        </h3>
        <div className="flex space-x-1">
          {showChampions && dog.isChampion && (
            <span title="Champion" className="w-5 h-5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </span>
          )}
          {showHealthTests && dog.hasHealthTests && (
            <span title="Health Tested" className="w-5 h-5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>
      </div>
      
      <div className="text-gray-600 text-xs">
        <div className="flex justify-between">
          <span>Reg: {dog.registrationNumber || 'N/A'}</span>
          <span>{dog.breedName}</span>
        </div>
        
        {showDates && (
          <div className="mt-1">
            <span>DOB: {formatPedigreeDate(dog.dateOfBirth)}</span>
          </div>
        )}
        
        {showOwners && (
          <div className="mt-1 truncate" title={dog.ownerName}>
            <span>Owner: {dog.ownerName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PedigreeCard;
