'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_DOG_BY_ID } from '@/graphql/queries/dogQueries';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/enums';
import DogProfile from '@/components/dogs/DogProfile';
import HealthRecords from '@/components/dogs/HealthRecords';
import CompetitionResults from '@/components/dogs/CompetitionResults';
import OwnershipHistory from '@/components/dogs/OwnershipHistory';

export default function DogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const dogId = params.id as string;
  
  // Check if the route is for creating a new dog
  if (dogId === 'new') {
    return (
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <Link 
              href="/dogs"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back to Dogs
            </Link>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Dog</h1>
            <p className="text-gray-700">The dog creation form will be implemented here.</p>
            {/* TODO: Implement dog creation form */}
          </div>
        </div>
      </div>
    );
  }
  
  // Fetch dog details using GraphQL
  const { loading, error, data } = useQuery(GET_DOG_BY_ID, {
    variables: { id: dogId },
    fetchPolicy: 'network-only'
  });

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-green-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading dog details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !data?.dog) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          <p>{error ? `Error: ${error.message}` : 'Dog not found'}</p>
        </div>
        <div className="mt-4">
          <Link 
            href="/dogs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Back to Dogs
          </Link>
        </div>
      </div>
    );
  }

  const dog = data.dog;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button and actions */}
        <div className="mb-6 flex justify-between items-center">
          <Link 
            href="/dogs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Dogs
          </Link>
          
          {/* Admin actions - only visible to admins */}
          {isAdmin && (
            <div className="flex space-x-3">
              <Link
                href={`/manage/dogs/${dogId}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Edit Dog
              </Link>
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="space-y-8">
          {/* Dog profile */}
          <DogProfile dog={dog} />
          
          {/* Tab-like sections */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Health Records */}
            {dog.healthRecords && dog.healthRecords.length > 0 && (
              <HealthRecords records={dog.healthRecords} />
            )}
            
            {/* Competition Results */}
            {dog.competitionResults && dog.competitionResults.length > 0 && (
              <CompetitionResults results={dog.competitionResults} />
            )}
          </div>
          
          {/* Ownership History */}
          {dog.ownerships && dog.ownerships.length > 0 && (
            <OwnershipHistory ownerships={dog.ownerships} />
          )}
        </div>
      </div>
    </div>
  );
}
