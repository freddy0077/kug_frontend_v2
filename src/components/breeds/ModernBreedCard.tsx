'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMapPin, FiClock, FiUsers, FiChevronRight, FiInfo } from 'react-icons/fi';

interface BreedCardProps {
  breed: {
    id: string;
    name: string;
    group?: string | null;
    origin?: string | null;
    imageUrl?: string | null;
    description?: string | null;
    temperament?: string | null;
    average_lifespan?: string | null;
    average_height?: number | null;
    average_weight?: number | null;
    dogs_count?: number | null;
  };
  viewMode: 'grid' | 'list';
}

const ModernBreedCard: React.FC<BreedCardProps> = ({ breed, viewMode }) => {
  // Choose a gradient based on the first letter of the breed name
  const getGradient = (name: string) => {
    const gradients = [
      'from-green-600 to-green-800',
      'from-green-500 to-teal-600',
      'from-emerald-500 to-green-700',
      'from-teal-500 to-green-600',
      'from-lime-500 to-green-600',
      'from-emerald-600 to-green-800',
      'from-green-500 to-emerald-700',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  // Extract first letter for the fallback image
  const firstLetter = breed.name.charAt(0).toUpperCase();
  const gradient = getGradient(breed.name);
  
  // Truncate description to prevent overly long cards
  const truncatedDescription = breed.description 
    ? breed.description.length > 120 
      ? `${breed.description.substring(0, 120)}...` 
      : breed.description
    : null;

  if (viewMode === 'grid') {
    return (
      <div className="transform transition-transform hover:-translate-y-1 duration-200">
        <Link 
          href={`/breeds/${breed.id}`} 
          className="block h-full rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="aspect-w-4 aspect-h-3 relative">
            {breed.imageUrl ? (
              <Image
                src={breed.imageUrl}
                alt={breed.name}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-5xl font-bold text-white">{firstLetter}</span>
              </div>
            )}
            
            {/* Group Badge */}
            {breed.group && (
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 shadow-sm">
                  {breed.group}
                </span>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{breed.name}</h3>
            
            <div className="space-y-2 mb-3">
              {breed.origin && (
                <div className="flex items-center text-sm text-gray-600">
                  <FiMapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span className="truncate">{breed.origin}</span>
                </div>
              )}
              
              {breed.average_lifespan && (
                <div className="flex items-center text-sm text-gray-600">
                  <FiClock className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>{breed.average_lifespan} years</span>
                </div>
              )}
              
              {breed.dogs_count !== undefined && breed.dogs_count !== null && (
                <div className="flex items-center text-sm text-gray-600">
                  <FiUsers className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>{breed.dogs_count} registered</span>
                </div>
              )}
            </div>
            
            {truncatedDescription && (
              <p className="text-sm text-gray-500 line-clamp-2">{truncatedDescription}</p>
            )}
            
            {/* Size indicators displayed as pill badges */}
            {(breed.average_height || breed.average_weight) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {breed.average_height && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    {breed.average_height} cm
                  </span>
                )}
                {breed.average_weight && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    {breed.average_weight} kg
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>
    );
  } else {
    // List view
    return (
      <div className="transform transition-transform hover:translate-x-1 duration-200">
        <Link 
          href={`/breeds/${breed.id}`} 
          className="block rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start p-1">
            {/* Breed image/avatar */}
            <div className="h-24 w-24 relative rounded-lg overflow-hidden flex-shrink-0">
              {breed.imageUrl ? (
                <Image
                  src={breed.imageUrl}
                  alt={breed.name}
                  className="object-cover"
                  fill
                  sizes="96px"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <span className="text-2xl font-bold text-white">{firstLetter}</span>
                </div>
              )}
            </div>
            
            <div className="flex-grow px-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{breed.name}</h3>
                
                {breed.group && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {breed.group}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                {breed.origin && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiMapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    <span className="truncate">{breed.origin}</span>
                  </div>
                )}
                
                {breed.average_lifespan && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiClock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    <span>{breed.average_lifespan} years</span>
                  </div>
                )}
                
                {(breed.average_height || breed.average_weight) && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiInfo className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    <span>
                      {breed.average_height && `${breed.average_height} cm`}
                      {breed.average_height && breed.average_weight && ' / '}
                      {breed.average_weight && `${breed.average_weight} kg`}
                    </span>
                  </div>
                )}
                
                {breed.dogs_count !== undefined && breed.dogs_count !== null && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUsers className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    <span>{breed.dogs_count} registered</span>
                  </div>
                )}
              </div>
              
              {truncatedDescription && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-1">{truncatedDescription}</p>
              )}
            </div>
            
            <div className="flex items-center px-2">
              <FiChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </Link>
      </div>
    );
  }
};

export default ModernBreedCard;
