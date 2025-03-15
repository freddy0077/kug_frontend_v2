'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_DOG_PEDIGREE } from '@/graphql/queries/pedigreeQueries';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

interface Dog {
  id: string;
  name: string;
  breed: string;
  breedId?: string;
  gender: string;
  dateOfBirth: string;
  registrationNumber: string;
  color: string;
  titles?: string[];
  mainImageUrl?: string;
  coefficient?: number;
  sire?: Dog | null;
  dam?: Dog | null;
}

interface PedigreeData {
  dogPedigree: Dog;
}

export default function DogPedigreePage() {
  const params = useParams();
  const dogId = params?.id as string;
  const [generations, setGenerations] = useState(3);

  // Fetch pedigree data with Apollo Client
  const { data, loading, error, refetch } = useQuery<PedigreeData>(GET_DOG_PEDIGREE, {
    variables: {
      dogId,
      generations
    },
    skip: !dogId
  });

  // Refetch when generations change
  useEffect(() => {
    if (dogId && generations > 0) {
      refetch({ dogId, generations });
    }
  }, [generations, dogId, refetch]);

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Create a pedigree box component for reuse
  const PedigreeBox = ({ dog, level = 0 }: { dog: Dog | null | undefined, level?: number }) => {
    if (!dog) return <div className="pedigree-box empty"></div>;
    
    const borderColors = [
      'border-green-500', // Primary dog
      'border-blue-500',  // Level 1 (parents)
      'border-purple-500', // Level 2 (grandparents)
      'border-orange-500', // Level 3 (great grandparents)
      'border-red-500',   // Level 4+
    ];
    
    const borderColor = borderColors[Math.min(level, borderColors.length - 1)];
    
    return (
      <div className={`pedigree-box p-3 border-2 ${borderColor} rounded-lg bg-white shadow-sm m-1`}>
        <h3 className="font-medium text-gray-900">{dog.name}</h3>
        <div className="text-xs text-gray-500 mb-1">{dog.registrationNumber || 'No Reg.'}</div>
        <div className="text-xs">
          <span className="text-gray-600">Breed:</span> {dog.breed}
        </div>
        <div className="text-xs">
          <span className="text-gray-600">Born:</span> {formatDate(dog.dateOfBirth)}
        </div>
        {dog.coefficient !== undefined && (
          <div className="text-xs">
            <span className="text-gray-600">IC:</span> {(dog.coefficient * 100).toFixed(1)}%
          </div>
        )}
      </div>
    );
  };

  // Render pedigree chart recursively
  const renderPedigreeChart = (dog: Dog | null | undefined, level = 0, maxLevel = 3) => {
    if (!dog || level > maxLevel) return null;
    
    if (level === 0) {
      return (
        <div className="pedigree-chart">
          <div className="pedigree-level flex">
            <div className="w-1/2">
              <PedigreeBox dog={dog} level={level} />
            </div>
            <div className="w-1/2">
              <div className="flex flex-col h-full">
                <div className="h-1/2">
                  {renderPedigreeChart(dog.sire, level + 1, maxLevel)}
                </div>
                <div className="h-1/2">
                  {renderPedigreeChart(dog.dam, level + 1, maxLevel)}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="pedigree-level flex">
        <div className="w-1/2">
          <PedigreeBox dog={dog} level={level} />
        </div>
        <div className="w-1/2">
          <div className="flex flex-col h-full">
            <div className="h-1/2">
              {dog.sire && level < maxLevel && renderPedigreeChart(dog.sire, level + 1, maxLevel)}
            </div>
            <div className="h-1/2">
              {dog.dam && level < maxLevel && renderPedigreeChart(dog.dam, level + 1, maxLevel)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'BREEDER', 'HANDLER']}>
      <div className="bg-gray-100 min-h-screen py-6 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <Link 
                  href={`/dogs/${dogId}`}
                  className="inline-flex items-center text-green-600 hover:text-green-800 mb-2"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dog Profile
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  {loading ? 'Loading...' : error ? 'Error' : data?.dogPedigree.name} Pedigree
                </h1>
                <p className="text-gray-600 mt-1">
                  {data?.dogPedigree.breed && `${data.dogPedigree.breed.replace('-', ' ')} · `}
                  {data?.dogPedigree.registrationNumber || 'No Registration'}
                </p>
              </div>
              
              {/* Generations selector */}
              <div className="mt-4 md:mt-0">
                <label htmlFor="generations" className="block text-sm font-medium text-gray-700 mb-1">
                  Generations
                </label>
                <select
                  id="generations"
                  className="w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={generations}
                  onChange={(e) => setGenerations(Number(e.target.value))}
                >
                  <option value="1">1 Generation</option>
                  <option value="2">2 Generations</option>
                  <option value="3">3 Generations</option>
                  <option value="4">4 Generations</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Loading and error states */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">Error loading pedigree</p>
              <p className="text-sm">{error.message}</p>
            </div>
          ) : !data?.dogPedigree ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700">
              <p className="font-medium">No pedigree information found</p>
              <p className="text-sm">The requested dog may not exist or has no pedigree information.</p>
            </div>
          ) : (
            /* Pedigree chart container */
            <div className="bg-white p-4 rounded-lg shadow-md overflow-auto">
              {/* Main pedigree visualization */}
              <div className="pedigree-container min-w-[900px]">
                {renderPedigreeChart(data.dogPedigree, 0, generations - 1)}
              </div>
              
              {/* Inbreeding information if available */}
              {data.dogPedigree.coefficient !== undefined && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Inbreeding Analysis</h3>
                  <p className="mt-2">
                    <span className="font-medium">Inbreeding Coefficient:</span>{' '}
                    <span className={`${data.dogPedigree.coefficient > 0.125 ? 'text-red-600' : 'text-green-600'} font-medium`}>
                      {(data.dogPedigree.coefficient * 100).toFixed(2)}%
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.dogPedigree.coefficient > 0.125
                      ? 'This coefficient is relatively high, which may increase the risk of genetic disorders.'
                      : 'This coefficient is within acceptable range for breed standards.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
