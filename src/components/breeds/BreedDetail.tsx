import React from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { GET_BREED_BY_ID } from '@/graphql/queries/breedQueries';
import BreedHero from './BreedHero';
import BreedSection from './BreedSection';
import BreedAttributeCard from './BreedAttributeCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';

interface BreedDetailProps {
  breedId: string;
}

const BreedDetail: React.FC<BreedDetailProps> = ({ breedId }) => {
  const { loading, error, data } = useQuery(GET_BREED_BY_ID, {
    variables: { id: breedId },
    skip: !breedId,
  });

  if (loading) {
    return <LoadingSpinner size="large" message="Loading breed details..." />;
  }

  if (error) {
    return <ErrorMessage message={`Error loading breed details: ${error.message}`} />;
  }

  if (!data?.breed) {
    return (
      <EmptyState
        title="Breed Not Found"
        message="This breed may have been deleted or does not exist."
        icon={
          <svg className="h-16 w-16 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        }
      />
    );
  }

  const { breed } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <BreedHero 
        name={breed.name} 
        imageUrl={breed.imageUrl} 
        description={breed.description}
      />

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <BreedSection title="Overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {breed.origin && (
              <BreedAttributeCard
                title="Origin"
                value={breed.origin}
                icon={
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                }
              />
            )}
            
            {breed.group && (
              <BreedAttributeCard
                title="Group"
                value={breed.group}
                icon={
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                }
              />
            )}
            
            {breed.average_height && (
              <BreedAttributeCard
                title="Height"
                value={breed.average_height}
                icon={
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                }
              />
            )}
            
            {breed.average_weight && (
              <BreedAttributeCard
                title="Weight"
                value={breed.average_weight}
                icon={
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                }
              />
            )}
            
            {breed.average_lifespan && (
              <BreedAttributeCard
                title="Lifespan"
                value={breed.average_lifespan}
                icon={
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                }
              />
            )}
          </div>
        </BreedSection>

        {breed.temperament && (
          <BreedSection title="Temperament">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{breed.temperament}</p>
            </div>
          </BreedSection>
        )}

        {breed.dogs?.length > 0 && (
          <BreedSection title={`Dogs of this Breed (${breed.dogs.length})`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {breed.dogs.map((dog: any) => (
                <Link href={`/dogs/${dog.id}`} key={dog.id} className="block transition transform hover:scale-105">
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition">
                    <div className="flex items-center">
                      {dog.imageUrl ? (
                        <div className="flex-shrink-0 h-12 w-12 mr-4">
                          <Image 
                            className="h-12 w-12 rounded-full object-cover" 
                            src={dog.imageUrl}
                            alt={dog.name}
                            width={48}
                            height={48}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-12 w-12 mr-4 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{dog.name}</h3>
                        <p className="text-xs text-gray-500">
                          {dog.gender} • {new Date(dog.dateOfBirth).getFullYear()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </BreedSection>
        )}
      </div>
    </div>
  );
};

export default BreedDetail;
