'use client';

import React from 'react';
import Link from 'next/link';
import { DogPedigreeData } from '@/types/pedigree';
import { formatPedigreeDate } from '@/utils/pedigreeUtils';

interface PedigreeNodeProps {
  dog: DogPedigreeData | null;
  generation: number;
  theme: 'standard' | 'classic' | 'modern';
  showChampions: boolean;
  showHealthTests: boolean;
  showDates: boolean;
  showOwners: boolean;
}

const PedigreeNode: React.FC<PedigreeNodeProps> = ({
  dog,
  generation,
  theme,
  showChampions,
  showHealthTests,
  showDates,
  showOwners
}) => {
  if (!dog) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 m-1 text-center text-gray-400 w-40 h-24 flex items-center justify-center text-sm`}>
        Unknown
      </div>
    );
  }

  const cardThemeClasses = {
    standard: 'bg-white border border-gray-200',
    classic: 'bg-amber-50 border border-amber-200',
    modern: 'bg-gradient-to-br from-blue-50 to-white border border-blue-200'
  };
  
  const genderClasses = dog.gender === 'male' 
    ? 'text-blue-700 border-blue-500' 
    : 'text-pink-700 border-pink-500';

  return (
    <Link 
      href={`/dogs/${dog.id}`}
      className={`
        ${cardThemeClasses[theme]} 
        ${genderClasses} 
        rounded-lg shadow-sm p-3 m-1 hover:shadow-md 
        transition-shadow cursor-pointer text-sm
        w-40 h-auto flex flex-col
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold truncate text-base" title={dog.name}>
          {dog.name}
        </h3>
        <div className="flex space-x-1">
          {showChampions && dog.isChampion && (
            <span title="Champion" className="w-4 h-4 text-yellow-500">
              ★
            </span>
          )}
          {showHealthTests && dog.hasHealthTests && (
            <span title="Health Tested" className="w-4 h-4 text-green-500">
              ✓
            </span>
          )}
        </div>
      </div>
      
      <div className="text-gray-600 text-xs">
        <div>
          {dog.registrationNumber && (
            <div className="truncate" title={dog.registrationNumber}>
              {dog.registrationNumber}
            </div>
          )}
          
          <div className="truncate" title={dog.breedName}>
            {dog.breedName}
          </div>
          
          {showDates && dog.dateOfBirth && (
            <div>
              {formatPedigreeDate(dog.dateOfBirth)}
            </div>
          )}
          
          {showOwners && dog.ownerName && (
            <div className="truncate" title={dog.ownerName}>
              Owner: {dog.ownerName}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PedigreeNode;
