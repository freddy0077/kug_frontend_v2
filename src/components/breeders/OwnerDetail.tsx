'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_BY_ID } from '@/graphql/queries/userQueries';
import Link from 'next/link';
import Image from 'next/image';
import { UserRole } from '@/utils/permissionUtils';
import { useAuth } from '@/contexts/AuthContext';

interface OwnerDetailProps {
  ownerId: string; // This is actually the user ID of an owner
}

const OwnerDetail: React.FC<OwnerDetailProps> = ({ ownerId }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: ownerId },
    fetchPolicy: 'network-only',
  });

  // The user with owner information
  const ownerUser = data?.user;
  const owner = ownerUser?.owner;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Owner</h2>
        <p className="text-gray-700 mb-6">{error.message || 'An unknown error occurred.'}</p>
        <Link href="/breeders" className="text-green-600 hover:text-green-800 font-medium">
          ← Back to Owners List
        </Link>
      </div>
    );
  }

  if (!ownerUser || !owner) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Owner Not Found</h2>
        <p className="text-gray-700 mb-6">The owner you're looking for may have been removed or does not exist.</p>
        <Link href="/breeders" className="text-green-600 hover:text-green-800 font-medium">
          ← Back to Owners List
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Owner header with banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile image */}
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              {ownerUser?.profileImageUrl ? (
                <Image
                  src={ownerUser.profileImageUrl}
                  alt={ownerUser.fullName || owner.name}
                  width={192}
                  height={192}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-green-100">
                  <svg className="h-24 w-24 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Owner information */}
            <div className="text-center md:text-left text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{owner.name || ownerUser?.fullName}</h1>
              
              {owner.address && (
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{owner.address}</span>
                </div>
              )}
              
              <div className="mt-4 space-x-2">
                {owner.contactEmail && (
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span>{owner.contactEmail}</span>
                  </div>
                )}
                
                {owner.contactPhone && (
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>{owner.contactPhone}</span>
                  </div>
                )}
              </div>
              
              {isAdmin && (
                <div className="mt-6">
                  <Link 
                    href={`/admin/manage-breeders/edit/${ownerId}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Edit Owner
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - About and contact */}
          <div className="lg:col-span-2">
            {/* About section */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Owner</h2>
              <div className="prose max-w-none text-gray-700">
                <div className="space-y-4">
                  <p>
                    {owner.name} is a registered dog owner with the Kennel Union of Georgia.
                  </p>
                  
                  {owner.address && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                      <p>{owner.address}</p>
                    </div>
                  )}
                  
                  {(owner.contactEmail || owner.contactPhone) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                      {owner.contactEmail && <p>Email: {owner.contactEmail}</p>}
                      {owner.contactPhone && <p>Phone: {owner.contactPhone}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Dogs section */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Owner's Dogs</h2>
                <Link 
                  href={`/breeders/${ownerId}/dogs`}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              
              {/* Dog list/grid would go here - simplified for this implementation */}
              {owner.dogs && owner.dogs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {owner.dogs.map((dog: any) => (
                    <Link key={dog.id} href={`/dogs/${dog.id}`}>
                      <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-100 transition">
                        {dog.mainImageUrl ? (
                          <Image
                            src={dog.mainImageUrl}
                            alt={dog.name}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover w-16 h-16"
                          />
                        ) : (
                          <div className="bg-gray-200 w-16 h-16 rounded-lg flex items-center justify-center">
                            <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M15 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                              <path d="M3 12c0-2.61 1.67-4.83 4-5.65V4.26C3.55 5.15 1 8.27 1 12c0 3.73 2.55 6.85 6 7.74v-2.09c-2.33-.82-4-3.04-4-5.65z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{dog.name}</h4>
                          <p className="text-sm text-gray-600">{dog.breed}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No dogs registered yet.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Contact and additional info */}
          <div className="space-y-6">
            {/* Contact card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
              <ul className="space-y-3">
                {owner.contactEmail && (
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Email</span>
                      <a href={`mailto:${owner.contactEmail}`} className="text-sm text-gray-600 hover:text-green-600">
                        {owner.contactEmail}
                      </a>
                    </div>
                  </li>
                )}
                
                {owner.contactPhone && (
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Phone</span>
                      <a href={`tel:${owner.contactPhone}`} className="text-sm text-gray-600 hover:text-green-600">
                        {owner.contactPhone}
                      </a>
                    </div>
                  </li>
                )}
                
                {owner.address && (
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">Location</span>
                      <span className="text-sm text-gray-600">{owner.address}</span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDetail;
