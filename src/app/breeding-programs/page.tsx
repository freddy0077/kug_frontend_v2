'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GET_BREEDING_PROGRAMS } from '@/graphql/queries/breedingProgramQueries';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function BreedingPrograms() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [breedingPrograms, setBreedingPrograms] = useState<any[]>([]);

  // GraphQL query variables
  const [queryVars, setQueryVars] = useState({
    limit: 20,
    offset: 0,
    breederId: undefined as string | undefined,
    status: undefined as string | undefined
  });

  // Fetch breeding programs using GraphQL
  const { data, loading, error, refetch } = useQuery(GET_BREEDING_PROGRAMS, {
    variables: queryVars,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.breedingPrograms?.items) {
        setBreedingPrograms(data.breedingPrograms.items);
      } else {
        setBreedingPrograms([]);
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching breeding programs:', error);
      setIsLoading(false);
      setBreedingPrograms([]);
    }
  });

  // No need for useEffect with local auth check anymore
  // The ProtectedRoute component will handle authentication and role checking

  if (authLoading || isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" color="border-blue-500" />
      </div>
    );
  }
  
  // Filter breeding programs by status
  const filterByStatus = (status: string) => {
    setIsLoading(true);
    setQueryVars(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status
    }));
    
    refetch({
      ...queryVars,
      status: status === 'all' ? undefined : status
    }).then(() => {
      setIsLoading(false);
    });
  };

  return (
    <ProtectedRoute allowedRoles={['BREEDER', 'ADMIN']}>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Breeding Programs</h1>
                <p className="mt-1 text-gray-600">Manage your breeding programs, litters, and planned matings</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  href="/breeding-programs/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Breeding Program
                </Link>
              </div>
            </div>
          </div>

          {/* Breeding Program Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {breedingPrograms.length === 0 ? (
              <div className="col-span-3 p-6 bg-white rounded-lg shadow text-center">
                <p className="text-gray-600">No breeding programs found. Create your first breeding program to get started.</p>
              </div>
            ) : (
              breedingPrograms.map(program => (
                <div 
                  key={program.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-blue-500"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${program.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {program.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {program.breed}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Start Date</p>
                        <p className="font-semibold">{new Date(program.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Public Program</p>
                        <p className="font-semibold">{program.is_public ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between">
                      <Link
                        href={`/breeding-programs/${program.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/breeding-programs/${program.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit Program
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Planning Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Breeding Planning</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/breeding-programs/planned-matings"
                className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">Planned Matings</h3>
                <p className="text-gray-600">Schedule and track upcoming breeding plans</p>
              </Link>
              <Link
                href="/breeding-programs/litters"
                className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">Active Litters</h3>
                <p className="text-gray-600">Manage current litters and puppies</p>
              </Link>
              <Link
                href="/breeding-programs/health-testing"
                className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">Health Testing</h3>
                <p className="text-gray-600">Track health tests for breeding stock</p>
              </Link>
            </div>
          </div>

          {/* Resources Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Breeding Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Breeding Standards</h3>
                <p className="text-sm text-blue-700 mb-2">Access breed standards and guidelines for responsible breeding practices.</p>
                <Link 
                  href="/resources/breeding-standards"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View Standards →
                </Link>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Genetic Calculator</h3>
                <p className="text-sm text-green-700 mb-2">Calculate genetic probabilities for coat colors and inherited traits.</p>
                <Link 
                  href="/tools/genetic-calculator"
                  className="text-sm font-medium text-green-600 hover:text-green-800"
                >
                  Use Calculator →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
