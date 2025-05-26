'use client';

import { format } from 'date-fns';
import Link from 'next/link';

interface ProfileTabProps {
  dog: any;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ dog }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left column - Basic Information */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Date of Birth</span>
              <span className="font-medium">{formatDate(dog.dateOfBirth)}</span>
            </div>
            
            {dog.dateOfDeath && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Date of Death</span>
                <span className="font-medium">{formatDate(dog.dateOfDeath)}</span>
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Gender</span>
              <span className="font-medium capitalize">{dog.gender}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Color</span>
              <span className="font-medium">{dog.color || 'Not specified'}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Registration Number</span>
              <span className="font-medium">{dog.registrationNumber || 'Not registered'}</span>
            </div>
            
            {dog.microchipNumber && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Microchip Number</span>
                <span className="font-medium">{dog.microchipNumber}</span>
              </div>
            )}
            
            {dog.otherRegistrationNumber && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Other Registration</span>
                <span className="font-medium">{dog.otherRegistrationNumber}</span>
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Neutered/Spayed</span>
              <span className="font-medium">{dog.isNeutered ? 'Yes' : 'No'}</span>
            </div>
            
            {dog.height && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Height</span>
                <span className="font-medium">{dog.height} cm</span>
              </div>
            )}
            
            {dog.weight && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Weight</span>
                <span className="font-medium">{dog.weight} kg</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Biography section */}
        {dog.biography && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Biography
            </h3>
            <div className="prose max-w-none text-gray-700">
              <p className="whitespace-pre-line">{dog.biography}</p>
            </div>
          </div>
        )}
        
        {/* Parents section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Parentage
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sire (Father)
              </h4>
              {dog.sire ? (
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{dog.sire.name}</p>
                  <p className="text-sm text-gray-600">{dog.sire.breed}</p>
                  {dog.sire.registrationNumber && (
                    <p className="text-sm text-gray-600">Reg: {dog.sire.registrationNumber}</p>
                  )}
                  <div className="pt-2">
                    <Link 
                      href={`/dogs/${dog.sire.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                    >
                      View Profile
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Not recorded</p>
              )}
            </div>
            
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
              <h4 className="font-medium text-pink-800 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Dam (Mother)
              </h4>
              {dog.dam ? (
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{dog.dam.name}</p>
                  <p className="text-sm text-gray-600">{dog.dam.breed}</p>
                  {dog.dam.registrationNumber && (
                    <p className="text-sm text-gray-600">Reg: {dog.dam.registrationNumber}</p>
                  )}
                  <div className="pt-2">
                    <Link 
                      href={`/dogs/${dog.dam.id}`}
                      className="text-sm text-pink-600 hover:text-pink-800 inline-flex items-center"
                    >
                      View Profile
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Not recorded</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right column - Owner information + actions */}
      <div className="space-y-6">
        {/* Owner information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Current Owner
          </h3>
          
          {dog.currentOwner ? (
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Name</span>
                <span className="font-medium">{dog.currentOwner.name}</span>
              </div>
              
              {dog.currentOwner.contactEmail && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="font-medium">{dog.currentOwner.contactEmail}</span>
                </div>
              )}
              
              {dog.currentOwner.contactPhone && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Phone</span>
                  <span className="font-medium">{dog.currentOwner.contactPhone}</span>
                </div>
              )}
              
              {dog.user && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Registered By</span>
                  <span className="font-medium">{dog.user.fullName || dog.user.email}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No owner information available</p>
          )}
        </div>
        
        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          
          <div className="space-y-2">
            <Link 
              href={`/pedigrees?dogId=${dog.id}`}
              className="flex items-center justify-between w-full p-3 bg-green-50 hover:bg-green-100 transition-colors rounded-md group"
            >
              <span className="font-medium text-green-800 group-hover:text-green-900">View Full Pedigree</span>
              <svg className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link 
              href={`/pedigrees?dogId=${dog.id}`}
              className="flex items-center justify-between w-full p-3 bg-blue-50 hover:bg-blue-100 transition-colors rounded-md group"
            >
              <span className="font-medium text-blue-800 group-hover:text-blue-900">Analyze Lineage</span>
              <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link 
              href={`/dogs?breed=${encodeURIComponent(dog.breed)}`}
              className="flex items-center justify-between w-full p-3 bg-purple-50 hover:bg-purple-100 transition-colors rounded-md group"
            >
              <span className="font-medium text-purple-800 group-hover:text-purple-900">Similar Dogs</span>
              <svg className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
