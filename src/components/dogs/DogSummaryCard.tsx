'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

interface DogSummaryCardProps {
  dog: {
    id: string;
    name: string;
    breed: string;
    gender: 'male' | 'female';
    color: string;
    dateOfBirth: Date;
    registrationNumber?: string;
    profileImageUrl?: string;
  };
}

export default function DogSummaryCard({ dog }: DogSummaryCardProps) {
  // Calculate age in years
  const calculateAge = () => {
    const birthDate = new Date(dog.dateOfBirth);
    const today = new Date();
    const ageInYears = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (ageInYears < 1) {
      const ageInMonths = Math.floor(ageInYears * 12);
      return `${ageInMonths} months`;
    }
    return `${Math.floor(ageInYears)} years`;
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="relative h-48 w-full">
        {dog.profileImageUrl ? (
          <Image
            src={dog.profileImageUrl}
            alt={dog.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <svg className="h-24 w-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14.26l-3.44 1.81c-.42.22-.96-.13-.85-.61l.66-3.81-2.77-2.7c-.34-.33-.16-.84.28-.91l3.83-.56 1.71-3.46c.2-.42.85-.42 1.05 0l1.71 3.46 3.83.56c.43.07.62.58.28.91l-2.77 2.7.66 3.81c.1.48-.43.83-.85.61L12 14.26z" />
            </svg>
          </div>
        )}
        <div className="absolute top-0 right-0 m-2">
          {dog.gender === 'male' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Male ♂
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
              Female ♀
            </span>
          )}
        </div>
      </div>
      <div className="px-4 py-4">
        <h3 className="text-lg font-medium text-gray-900 truncate">{dog.name}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {dog.breed} • {dog.color} • {calculateAge()}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {dog.registrationNumber ? `Reg: ${dog.registrationNumber}` : 'Not registered'}
        </p>
        <div className="mt-4">
          <Link
            href={`/manage/dogs/${dog.id}/profile`}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
