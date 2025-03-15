'use client';

import { format } from 'date-fns';
import Link from 'next/link';

// Define interfaces
interface DogProfileProps {
  dog: {
    id: string;
    name: string;
    breed: string;
    breedId?: string;
    gender: string;
    color: string;
    dateOfBirth: string;
    dateOfDeath?: string | null;
    registrationNumber?: string;
    microchipNumber?: string;
    isNeutered?: boolean;
    height?: number;
    weight?: number;
    titles?: string[];
    biography?: string;
    mainImageUrl?: string;
    images?: {
      id: string;
      url: string;
      caption?: string;
      isPrimary: boolean;
    }[];
    currentOwner?: {
      id: string;
      name: string;
      contactEmail?: string;
      contactPhone?: string;
    };
    sire?: {
      id: string;
      name: string;
      breed: string;
      breedId?: string;
      registrationNumber?: string;
    } | null;
    dam?: {
      id: string;
      name: string;
      breed: string;
      breedId?: string;
      registrationNumber?: string;
    } | null;
  };
}

const DogProfile: React.FC<DogProfileProps> = ({ dog }) => {
  // Safely format date strings
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error("Invalid date format:", error);
      return "N/A";
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Header with image */}
      <div className="relative h-64 bg-green-50">
        {dog.mainImageUrl ? (
          <img 
            src={dog.mainImageUrl} 
            alt={dog.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-50">
            <svg className="w-24 h-24 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        )}
        
        {/* Gender badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
            dog.gender.toLowerCase() === 'male' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-pink-100 text-pink-800'
          }`}>
            {dog.gender}
          </span>
        </div>
      </div>

      {/* Dog details */}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">{dog.name}</h1>
          {dog.titles && dog.titles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dog.titles.map((title, index) => (
                <span key={index} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  {title}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <p className="mt-2 text-lg text-gray-700">{dog.breed} {dog.breedId && `(${dog.breedId})`}</p>
        
        {/* Basic information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">Basic Information</h2>
            <dl className="space-y-2">
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500">Date of Birth:</dt>
                <dd>{formatDate(dog.dateOfBirth)}</dd>
              </div>
              {dog.dateOfDeath && (
                <div className="flex">
                  <dt className="w-32 font-medium text-gray-500">Date of Death:</dt>
                  <dd>{formatDate(dog.dateOfDeath)}</dd>
                </div>
              )}
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500">Registration #:</dt>
                <dd>{dog.registrationNumber || 'N/A'}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500">Microchip #:</dt>
                <dd>{dog.microchipNumber || 'N/A'}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500">Color:</dt>
                <dd>{dog.color || 'N/A'}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 font-medium text-gray-500">Neutered:</dt>
                <dd>{dog.isNeutered ? 'Yes' : 'No'}</dd>
              </div>
              {dog.height && (
                <div className="flex">
                  <dt className="w-32 font-medium text-gray-500">Height:</dt>
                  <dd>{dog.height} cm</dd>
                </div>
              )}
              {dog.weight && (
                <div className="flex">
                  <dt className="w-32 font-medium text-gray-500">Weight:</dt>
                  <dd>{dog.weight} kg</dd>
                </div>
              )}
            </dl>
          </div>
          
          {/* Owner information */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Current Owner</h2>
            {dog.currentOwner ? (
              <dl className="space-y-2">
                <div className="flex">
                  <dt className="w-32 font-medium text-gray-500">Name:</dt>
                  <dd>{dog.currentOwner.name}</dd>
                </div>
                {dog.currentOwner.contactEmail && (
                  <div className="flex">
                    <dt className="w-32 font-medium text-gray-500">Email:</dt>
                    <dd>{dog.currentOwner.contactEmail}</dd>
                  </div>
                )}
                {dog.currentOwner.contactPhone && (
                  <div className="flex">
                    <dt className="w-32 font-medium text-gray-500">Phone:</dt>
                    <dd>{dog.currentOwner.contactPhone}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-gray-500">No owner information available</p>
            )}
          </div>
        </div>
        
        {/* Parents */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Parentage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium text-blue-800 mb-2">Sire (Father)</h3>
              {dog.sire ? (
                <div>
                  <p className="font-semibold">{dog.sire.name}</p>
                  <p className="text-sm text-gray-600">{dog.sire.breed} {dog.sire.breedId && `(${dog.sire.breedId})`}</p>
                  {dog.sire.registrationNumber && (
                    <p className="text-sm text-gray-600">Reg: {dog.sire.registrationNumber}</p>
                  )}
                  <Link 
                    href={`/dogs/${dog.sire.id}`}
                    className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                  >
                    View Sire Profile
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No sire information available</p>
              )}
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-pink-50">
              <h3 className="font-medium text-pink-800 mb-2">Dam (Mother)</h3>
              {dog.dam ? (
                <div>
                  <p className="font-semibold">{dog.dam.name}</p>
                  <p className="text-sm text-gray-600">{dog.dam.breed} {dog.dam.breedId && `(${dog.dam.breedId})`}</p>
                  {dog.dam.registrationNumber && (
                    <p className="text-sm text-gray-600">Reg: {dog.dam.registrationNumber}</p>
                  )}
                  <Link 
                    href={`/dogs/${dog.dam.id}`}
                    className="mt-2 inline-block text-sm text-pink-600 hover:underline"
                  >
                    View Dam Profile
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No dam information available</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Biography */}
        {dog.biography && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Biography</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-line">{dog.biography}</p>
            </div>
          </div>
        )}
        
        {/* Additional photos */}
        {dog.images && dog.images.length > 1 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Photo Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {dog.images
                .filter(img => !img.isPrimary) // Exclude the primary image
                .map((image) => (
                  <div key={image.id} className="relative h-32 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.caption || `${dog.name} photo`}
                      className="h-full w-full object-cover"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DogProfile;
