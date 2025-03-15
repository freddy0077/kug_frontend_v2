'use client';

import React from 'react';
import { DogNode } from '@/utils/pedigreeFormatters';

interface PedigreeChartProps {
  generations: number;
  rootDog: DogNode;
  sire?: DogNode;
  dam?: DogNode;
  sireSire?: DogNode;
  sireDam?: DogNode;
  damSire?: DogNode;
  damDam?: DogNode;
  generation4Dogs?: Record<string, DogNode | null>;
  onEditParents?: (dogId: string) => void;
  onAddParents?: (dogId: string) => void;
}

const PedigreeChart: React.FC<PedigreeChartProps> = ({
  generations,
  rootDog,
  sire,
  dam,
  sireSire,
  sireDam,
  damSire,
  damDam,
  generation4Dogs,
  onEditParents,
  onAddParents,
}) => {
  // Function to render a dog card with proper styling
  const renderDogCard = (
    dog: DogNode | undefined | null,
    type: 'root' | 'sire' | 'dam',
    isMiniCard: boolean = false,
    parentDogId?: string
  ) => {
    // If no dog data, render an empty placeholder with add button
    if (!dog) {
      return (
        <div className={`
          ${isMiniCard ? 'h-20 text-xs p-2' : 'p-3'}
          ${type === 'root' 
            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
            : type === 'sire' 
              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
              : 'bg-pink-50 border-pink-200 hover:bg-pink-100'
          }
          border rounded-md flex flex-col justify-center items-center text-center transition-colors
          ${onAddParents && parentDogId ? 'cursor-pointer' : ''}
        `}
        onClick={() => {
          if (onAddParents && parentDogId) {
            onAddParents(parentDogId);
          }
        }}
        >
          <p className="font-medium text-gray-400">Unknown</p>
          <p className="text-xs text-gray-400">No data available</p>
          {onAddParents && parentDogId && !isMiniCard && (
            <button 
              className="mt-2 text-xs text-green-600 hover:text-green-800 flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                onAddParents(parentDogId);
              }}
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Parents
            </button>
          )}
        </div>
      );
    }

    return (
      <div 
        className={`
          ${isMiniCard ? 'h-20 text-xs p-2' : 'p-3'}
          ${type === 'root' 
            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
            : type === 'sire' 
              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
              : 'bg-pink-50 border-pink-200 hover:bg-pink-100'
          }
          border rounded-md flex flex-col justify-between transition-colors
          ${onEditParents ? 'cursor-pointer' : ''}
        `}
        onClick={() => onEditParents && dog.id && onEditParents(dog.id)}
      >
        <div>
          <div className="flex justify-between items-start">
            <h4 className={`font-medium ${isMiniCard ? 'text-xs' : 'text-sm'} truncate`}>
              {dog.name}
            </h4>
            {onEditParents && !isMiniCard && dog.id && (
              <button 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditParents(dog.id!);
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
          </div>
          {(dog.breedObj?.name || dog.breed) && !isMiniCard && (
            <p className="text-xs text-gray-600 capitalize truncate">{(dog.breedObj?.name || dog.breed).replace('-', ' ')}</p>
          )}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {dog.registrationNumber || 'No registration'}
        </div>
      </div>
    );
  };

  return (
    <div className="pedigree-chart overflow-auto">
      <div className="min-w-[550px]">
        {/* Generation 1 (Root Dog) */}
        {generations >= 1 && (
          <div className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-12">
              {renderDogCard(rootDog, 'root')}
            </div>
          </div>
        )}

        {/* Generation 2 (Parents) */}
        {generations >= 2 && (
          <div className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-6">
              {renderDogCard(sire, 'sire', false, rootDog.id)}
            </div>
            <div className="col-span-6">
              {renderDogCard(dam, 'dam', false, rootDog.id)}
            </div>
          </div>
        )}

        {/* Generation 3 (Grandparents) */}
        {generations >= 3 && (
          <div className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-3">
              {renderDogCard(sireSire, 'sire', false, sire?.id)}
            </div>
            <div className="col-span-3">
              {renderDogCard(sireDam, 'dam', false, sire?.id)}
            </div>
            <div className="col-span-3">
              {renderDogCard(damSire, 'sire', false, dam?.id)}
            </div>
            <div className="col-span-3">
              {renderDogCard(damDam, 'dam', false, dam?.id)}
            </div>
          </div>
        )}

        {/* Generation 4 (Great Grandparents) */}
        {generations >= 4 && generation4Dogs && (
          <div className="grid grid-cols-12 gap-1 mb-2">
            <div className="col-span-1.5">
              {renderDogCard(generation4Dogs.sireSireSire, 'sire', true, sireSire?.id)}
            </div>
            <div className="col-span-1.5">
              {renderDogCard(generation4Dogs.sireSireDam, 'dam', true, sireSire?.id)}
            </div>
            <div className="col-span-1.5">
              {renderDogCard(generation4Dogs.sireDamSire, 'sire', true, sireDam?.id)}
            </div>
            <div className="col-span-1.5">
              {renderDogCard(generation4Dogs.sireDamDam, 'dam', true, sireDam?.id)}
            </div>
            <div className="col-span-1.5">
              {renderDogCard(generation4Dogs.damSireSire, 'sire', true, damSire?.id)}
            </div>
            <div className="col-span-1.5">
              {renderDogCard(generation4Dogs.damSireDam, 'dam', true, damSire?.id)}
            </div>
            <div className="col-span-1.5">
              {renderDogCard(generation4Dogs.damDamSire, 'sire', true, damDam?.id)}
            </div>
            <div className="col-span-1.5">
              {renderDogCard(generation4Dogs.damDamDam, 'dam', true, damDam?.id)}
            </div>
          </div>
        )}

        {/* Pedigree Chart Legend */}
        <div className="flex flex-wrap justify-end gap-3 mt-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-200 mr-1"></div>
            <span>Root Dog</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-200 mr-1"></div>
            <span>Sire (Male)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-pink-200 mr-1"></div>
            <span>Dam (Female)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedigreeChart;
