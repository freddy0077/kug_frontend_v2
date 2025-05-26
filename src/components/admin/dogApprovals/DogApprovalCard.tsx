import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { ApprovalStatus } from '@/types/enums';

// Default placeholder for missing dog images
const DEFAULT_DOG_IMAGE = '/images/default-dog.svg';

interface DogApprovalCardProps {
  dog: any;
  isSelected: boolean;
  onToggleSelect: (dogId: string) => void;
  onApprove: (dog: any) => void;
  onDecline: (dog: any) => void;
}

const DogApprovalCard: React.FC<DogApprovalCardProps> = ({
  dog,
  isSelected,
  onToggleSelect,
  onApprove,
  onDecline,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`
        bg-white border rounded-xl shadow-sm transition-all duration-200 
        ${isSelected ? 'ring-2 ring-green-500 border-green-500' : 'hover:shadow-md border-gray-200'}
      `}
    >
      {/* Checkbox for selection */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(dog.id)}
          className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
      </div>
      
      {/* Main card content */}
      <div className="overflow-hidden">
        {/* Image section */}
        <div className="relative h-48 w-full bg-gray-100">
          {dog.mainImageUrl ? (
            <Image
              src={dog.mainImageUrl}
              alt={dog.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_DOG_IMAGE;
              }}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100">
              <PhotoIcon className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No image available</p>
            </div>
          )}
          
          {/* Gender badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              dog.gender.toLowerCase() === 'male' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-pink-100 text-pink-800'
            }`}>
              {dog.gender}
            </span>
          </div>
        </div>
        
        {/* Dog info */}
        <div className="p-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {dog.name}
            </h3>
            
            <span className="text-sm text-gray-500">
              {dog.dateOfBirth ? format(new Date(dog.dateOfBirth), 'MMM d, yyyy') : 'Unknown DOB'}
            </span>
          </div>
          
          <p className="mt-1 text-sm text-gray-600 capitalize">
            {dog.breed}
          </p>
          
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-500 mr-2">Owner:</span>
            {dog.currentOwner ? (
              <Link href={`/owners/${dog.currentOwner.id}`} className="text-sm text-blue-600 hover:underline">
                {dog.currentOwner.name}
              </Link>
            ) : (
              <span className="text-sm text-gray-500">No owner</span>
            )}
          </div>
        </div>
        
        {/* Expandable content */}
        {expanded && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-500">Registration:</span>
                <p className="text-gray-900">{dog.registrationNumber || 'N/A'}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-500">Microchip:</span>
                <p className="text-gray-900">{dog.microchipNumber || 'N/A'}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-500">Color:</span>
                <p className="text-gray-900 capitalize">{dog.color || 'N/A'}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-500">Submission Date:</span>
                <p className="text-gray-900">
                  {dog.createdAt ? format(new Date(dog.createdAt), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="mt-3">
              <Link 
                href={`/dogs/${dog.id}`} 
                className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
              >
                View Complete Profile
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        )}
        
        {/* Card actions */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            {expanded ? (
              <>
                <ChevronUpIcon className="w-5 h-5 mr-1" />
                Less Details
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-5 h-5 mr-1" />
                More Details
              </>
            )}
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onDecline(dog)}
              className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-red-600 transition-colors"
              title="Decline Registration"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onApprove(dog)}
              className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-green-600 transition-colors"
              title="Approve Registration"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DogApprovalCard;
