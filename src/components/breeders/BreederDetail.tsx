'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_BY_ID } from '@/graphql/queries/userQueries';
import Link from 'next/link';
import Image from 'next/image';
import { UserRole } from '@/utils/permissionUtils';
import { useAuth } from '@/contexts/AuthContext';

interface BreederDetailProps {
  breederId: string; // This is actually the user ID of an owner acting as a breeder
}

const BreederDetail: React.FC<BreederDetailProps> = ({ breederId }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: breederId },
    fetchPolicy: 'network-only',
  });

  // The user with owner information (a breeder in UI terms)
  const breederUser = data?.user;
  const breeder = breederUser?.owner;

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
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Breeder</h2>
        <p className="text-gray-700 mb-6">{error.message || 'An unknown error occurred.'}</p>
        <Link href="/breeders" className="text-green-600 hover:text-green-800 font-medium">
          ← Back to Breeders List
        </Link>
      </div>
    );
  }

  if (!breederUser || !breeder) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Breeder Not Found</h2>
        <p className="text-gray-700 mb-6">The breeder you're looking for may have been removed or does not exist.</p>
        <Link href="/breeders" className="text-green-600 hover:text-green-800 font-medium">
          ← Back to Breeders List
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breeder header with banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Profile image */}
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              {breederUser?.profileImageUrl ? (
                <Image
                  src={breederUser.profileImageUrl}
                  alt={breederUser.fullName || breeder.name}
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
            
            {/* Breeder information */}
            <div className="text-center md:text-left text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{breeder.name || breederUser?.fullName}</h1>
              
              {breeder.address && (
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{breeder.address}</span>
                </div>
              )}
              
              <div className="mt-4 space-x-2">
                {breeder.contactEmail && (
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span>{breeder.contactEmail}</span>
                  </div>
                )}
                
                {breeder.contactPhone && (
                  <div className="flex items-center justify-center md:justify-start mt-2">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>{breeder.contactPhone}</span>
                  </div>
                )}
              </div>
              
              {isAdmin && (
                <div className="mt-6">
                  <Link 
                    href={`/admin/manage-breeders/edit/${breederId}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Edit Breeder
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Breeder</h2>
              <div className="prose max-w-none text-gray-700">
                <div className="space-y-4">
                  <p>
                    {breeder.name} is a registered dog owner and breeder with the Kennel Union of Georgia.
                  </p>
                  
                  {breeder.address && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                      <p>{breeder.address}</p>
                    </div>
                  )}
                  
                  {(breeder.contactEmail || breeder.contactPhone) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                      {breeder.contactEmail && <p>Email: {breeder.contactEmail}</p>}
                      {breeder.contactPhone && <p>Phone: {breeder.contactPhone}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Dogs section */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Breeder's Dogs</h2>
                <Link 
                  href={`/breeders/${breederId}/dogs`}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              
              {/* Dog list/grid would go here - simplified for this implementation */}
              {breeder.dogs && breeder.dogs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {breeder.dogs.map((dog: any) => (
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
                <p className="text-gray-500 italic">No dogs listed for this breeder.</p>
              )}
            </div>
          </div>
          
          {/* Right column - Contact info and stats */}
          <div>
            {/* Contact card */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              {breeder.email && (
                <div className="flex items-start space-x-3 mb-3">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <a href={`mailto:${breeder.email}`} className="text-green-600 hover:text-green-800">
                      {breeder.email}
                    </a>
                  </div>
                </div>
              )}
              
              {breeder.phone && (
                <div className="flex items-start space-x-3 mb-3">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <a href={`tel:${breeder.phone}`} className="text-green-600 hover:text-green-800">
                      {breeder.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {breeder.website && (
                <div className="flex items-start space-x-3">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Website</p>
                    <a href={breeder.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                      {breeder.website.replace(/(^\w+:|^)\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Stats card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              
              <div className="space-y-4">
                {breeder.dogCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Dogs</span>
                    <span className="font-medium text-gray-900">{breeder.dogCount}</span>
                  </div>
                )}
                
                {breeder.litterCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Litters</span>
                    <span className="font-medium text-gray-900">{breeder.litterCount}</span>
                  </div>
                )}
                
                {breeder.averageRating !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-medium text-gray-900">{breeder.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                
                {breeder.memberSince && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium text-gray-900">{new Date(breeder.memberSince).getFullYear()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreederDetail;
