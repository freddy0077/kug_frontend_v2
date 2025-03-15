'use client';

import Link from 'next/link';
import { format } from 'date-fns';

export interface DogCardProps {
  dog: {
    id: string;
    name: string;
    breed: string;
    breedObj?: {
      id?: string;
      name: string;
      group?: string;
      origin?: string;
    };
    breedId?: string;
    gender: string;
    dateOfBirth: string;
    registrationNumber?: string;
    mainImageUrl?: string;
    currentOwner?: {
      id?: string;
      name?: string;
    };
  };
}

const DogCard: React.FC<DogCardProps> = ({ dog }) => {
  // Calculate age
  const calculateAge = (dateOfBirth: string) => {
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error("Invalid date format:", error);
      return "?";
    }
  };

  // Safely format date
  const formatDogDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error("Invalid date format:", error);
      return "N/A";
    }
  };

  return (
    <Link 
      href={`/dogs/${dog.id}`} 
      className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full border border-gray-100"
    >
      {/* Image container with gradient overlay and gender badge */}
      <div className="relative h-56 overflow-hidden">
        {dog.mainImageUrl ? (
          <img 
            src={dog.mainImageUrl} 
            alt={dog.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        )}
        
        {/* Gender badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            dog.gender.toLowerCase() === 'male' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-pink-100 text-pink-800'
          }`}>
            {dog.gender.charAt(0).toUpperCase() + dog.gender.slice(1)}
          </span>
        </div>
        
        {/* Age badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-900 bg-opacity-70 text-white">
            {calculateAge(dog.dateOfBirth)} years old
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200">{dog.name}</h3>
        </div>
        
        <div className="mt-1">
          <span className="text-sm text-gray-600 inline-block">{dog.breedObj?.name || dog.breed}</span>
          {dog.registrationNumber && (
            <div className="mt-1 text-xs text-gray-500 inline-block bg-gray-100 px-2 py-0.5 rounded">
              Reg: {dog.registrationNumber}
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex-1">
          <div className="flex items-center text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Born: {formatDogDate(dog.dateOfBirth)}</span>
          </div>
          
          {dog.currentOwner?.name && (
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Owner: {dog.currentOwner.name}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="inline-flex items-center text-xs font-medium text-green-700 group-hover:text-green-800 transition-colors">
            View Details
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DogCard;
