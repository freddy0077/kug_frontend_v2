'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BreederCardProps {
  owner: {
    id: string;
    name: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    dogs?: { id: string }[];
    profileImageUrl?: string;
  };
}

const BreederCard: React.FC<BreederCardProps> = ({ owner }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <Link href={`/breeders/${owner.id}`} className="block">
        <div className="h-48 bg-gradient-to-r from-green-100 to-green-200 relative overflow-hidden">
          {owner.profileImageUrl ? (
            <Image
              src={owner.profileImageUrl}
              alt={owner.name}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="h-24 w-24 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
          
          {/* Dogs count badge */}
          {owner.dogs && owner.dogs.length > 0 && (
            <div className="absolute top-3 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              {owner.dogs.length} {owner.dogs.length === 1 ? 'dog' : 'dogs'}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{owner.name}</h3>
          
          {owner.address && (
            <div className="flex items-center text-gray-600 mb-2">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{owner.address}</span>
            </div>
          )}
          
          {owner.contactEmail && (
            <div className="flex items-center text-gray-600 mb-2">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-sm">{owner.contactEmail}</span>
            </div>
          )}
          
          {owner.contactPhone && (
            <div className="mb-3">
              <div className="flex items-center text-gray-600">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-sm">{owner.contactPhone}</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            {owner.dogs ? (
              <div className="flex items-center">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700 ml-1">
                  {owner.dogs.length} {owner.dogs.length === 1 ? 'dog' : 'dogs'} registered
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-500">No dogs registered yet</span>
            )}
            
            <span className="text-xs text-green-600 font-medium">View Profile</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BreederCard;
