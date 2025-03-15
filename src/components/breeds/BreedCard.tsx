import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    dogs?: any[];
  };
}

const BreedCard: React.FC<BreedCardProps> = ({ breed }) => {
  // Choose a badge color based on the first letter of the breed name
  const getBadgeColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-red-100 text-red-800',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Extract first letter for the fallback image
  const firstLetter = breed.name.charAt(0).toUpperCase();
  const badgeColor = getBadgeColor(breed.name);

  return (
    <Link href={`/breeds/${breed.id}`} className="block h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
        {/* Card Image Section */}
        <div className="h-52 relative overflow-hidden">
          {breed.imageUrl ? (
            <Image
              src={breed.imageUrl}
              alt={breed.name}
              className="w-full h-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className={`w-24 h-24 rounded-full ${badgeColor} flex items-center justify-center`}>
                <span className="text-4xl font-bold">{firstLetter}</span>
              </div>
            </div>
          )}
          
          {/* Group Badge */}
          {breed.group && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-800 shadow-sm">
                {breed.group}
              </span>
            </div>
          )}
        </div>
        
        {/* Card Content Section */}
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{breed.name}</h3>
          
          {/* Breed Attributes */}
          <div className="mb-4 space-y-2 flex-grow">
            {breed.origin && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-1.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {breed.origin}
              </div>
            )}
            
            {breed.average_lifespan && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="h-4 w-4 mr-1.5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lifespan: {breed.average_lifespan}
              </div>
            )}
            
            {breed.temperament && (
              <div className="flex items-start text-sm text-gray-600">
                <svg className="h-4 w-4 mr-1.5 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="line-clamp-1">{breed.temperament}</span>
              </div>
            )}
            
            {/* Description */}
            {breed.description && (
              <p className="text-gray-700 line-clamp-2 text-sm mt-2">
                {breed.description}
              </p>
            )}
          </div>
          
          {/* Card Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              {breed.dogs && breed.dogs.length > 0 ? (
                <span className="flex items-center">
                  <svg className="h-4 w-4 mr-1 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {breed.dogs.length} {breed.dogs.length === 1 ? 'dog' : 'dogs'}
                </span>
              ) : null}
            </div>
            
            <span className="inline-flex items-center text-green-600 font-medium text-sm">
              View details
              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BreedCard;
