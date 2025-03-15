'use client';

import Link from 'next/link';
import Image from 'next/image';
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
      
      // Display years and months for young dogs
      if (age === 0) {
        const months = today.getMonth() - birthDate.getMonth();
        return months <= 0 ? '< 1 month' : `${months} months`;
      }
      
      return `${age} ${age === 1 ? 'year' : 'years'}`;
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
  
  // Determine card accent color based on gender
  const genderColor = dog.gender.toLowerCase() === 'male' ? 'blue' : 'pink';
  
  // Generate a coat color class (just for visual variety, in real app would come from dog data)
  const getCoatDisplay = () => {
    // This would normally come from dog data
    return { 
      color: 'Brown & White',
      icon: '🐾'
    };
  };
  
  const coatInfo = getCoatDisplay();

  return (
    <Link 
      href={`/dogs/${dog.id}`} 
      className="group w-full h-full"
    >
      {/* Simplified card with clean design */}
      <div className={`relative rounded-lg overflow-hidden bg-white border-l-4 border-${genderColor}-500 shadow hover:shadow-md transition-all duration-300 h-full`}>
        {/* Header section */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">{dog.name}</h3>
          <p className="text-sm text-gray-500">{dog.breedObj?.name || dog.breed}</p>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left side - Image */}
          <div className="md:w-2/5 p-3">
            <div className="relative h-44 w-full rounded overflow-hidden">
              {dog.mainImageUrl ? (
                <Image 
                  src={dog.mainImageUrl} 
                  alt={dog.name} 
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 group-hover:scale-105" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 text-${genderColor}-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              )}
              
              {/* Gender badge over image */}
              <div className="absolute top-0 right-0 m-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${dog.gender.toLowerCase() === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                  {dog.gender}
                </span>
              </div>

              {/* Age badge */}
              <div className="absolute bottom-0 left-0 m-2">
                <span className="px-2 py-0.5 text-xs bg-black bg-opacity-50 text-white rounded-sm">
                  {calculateAge(dog.dateOfBirth)}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Details */}
          <div className="md:w-3/5 p-3 flex flex-col">
            {/* Key details - clean display */}
            <div className="flex-1 space-y-2 text-sm">
              {dog.registrationNumber && (
                <div>
                  <p className="text-gray-500 text-xs">Registration</p>
                  <p className="text-gray-800">{dog.registrationNumber}</p>
                </div>
              )}
              
              <div>
                <p className="text-gray-500 text-xs">Date of Birth</p>
                <p className="text-gray-800">{formatDogDate(dog.dateOfBirth)}</p>
              </div>
              
              {dog.currentOwner?.name && (
                <div>
                  <p className="text-gray-500 text-xs">Owner</p>
                  <p className="text-gray-800 truncate">{dog.currentOwner.name}</p>
                </div>
              )}
            </div>

            {/* View details link */}
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="inline-flex items-center text-sm font-medium text-green-600 group-hover:text-green-800 transition-colors">
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DogCard;
