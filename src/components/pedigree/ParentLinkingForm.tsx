'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LINK_DOG_TO_PARENTS } from '@/graphql/mutations/pedigreeMutations';
import { GET_DOG } from '@/graphql/queries/dogQueries';
import { GET_DOGS } from '@/graphql/queries/dogQueries';

interface ParentLinkingFormProps {
  dogId: string;
}

const ParentLinkingForm: React.FC<ParentLinkingFormProps> = ({ dogId }) => {
  const router = useRouter();
  
  // Form state
  const [sireId, setSireId] = useState<string | undefined>(undefined);
  const [damId, setDamId] = useState<string | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current dog details
  const { loading: dogLoading, error: dogError, data: dogData } = useQuery(GET_DOG, {
    variables: { id: dogId },
    fetchPolicy: 'network-only',
  });

  // Fetch potential parents
  const { loading: dogsLoading, data: dogsData } = useQuery(GET_DOGS, {
    variables: { limit: 100 },  // Adjust limit as needed
  });

  // Link parents mutation
  const [linkDogToParents, { loading: linkLoading, error: linkError }] = useMutation(
    LINK_DOG_TO_PARENTS,
    {
      onCompleted: () => {
        // On successful linking, redirect to the dog's pedigree page
        router.push(`/manage/dogs/${dogId}/pedigree`);
      }
    }
  );

  // Initialize form with existing parents if any
  useEffect(() => {
    if (dogData?.dog) {
      if (dogData.dog.sire) {
        setSireId(dogData.dog.sire.id);
      }
      if (dogData.dog.dam) {
        setDamId(dogData.dog.dam.id);
      }
    }
  }, [dogData]);

  // Filter dogs by gender
  const maleDogs = dogsData?.dogs?.items.filter((dog: any) => 
    dog.gender === 'male' && dog.id !== dogId
  ) || [];
  
  const femaleDogs = dogsData?.dogs?.items.filter((dog: any) => 
    dog.gender === 'female' && dog.id !== dogId
  ) || [];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await linkDogToParents({
        variables: {
          dogId,
          sireId: sireId || null,
          damId: damId || null,
        },
      });
    } catch (error) {
      console.error('Error linking parents:', error);
      setFormErrors({ 
        submit: 'Failed to link parents. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dogLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dogError) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Link Parents</h2>
        <p className="text-red-500">Error loading dog information: {dogError.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Link Parents to {dogData?.dog?.name}</h2>
      
      {dogData?.dog && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700">Dog Information</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500">Name:</span> {dogData.dog.name}
            </div>
            <div>
              <span className="text-gray-500">Breed:</span> {dogData.dog.breed}
            </div>
            <div>
              <span className="text-gray-500">Gender:</span> {dogData.dog.gender}
            </div>
            {dogData.dog.dateOfBirth && (
              <div>
                <span className="text-gray-500">Date of Birth:</span> {new Date(dogData.dog.dateOfBirth).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
      
      {linkError && (
        <div className="mb-6 bg-red-50 p-4 rounded-md text-red-700">
          Error: {linkError.message}
        </div>
      )}
      
      {formErrors.submit && (
        <div className="mb-6 bg-red-50 p-4 rounded-md text-red-700">
          {formErrors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Sire Selection */}
          <div>
            <label htmlFor="sireId" className="block text-sm font-medium text-gray-700">
              Sire (Father)
            </label>
            <select
              id="sireId"
              value={sireId || ''}
              onChange={(e) => setSireId(e.target.value || undefined)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={isSubmitting}
            >
              <option value="">No sire selected</option>
              {maleDogs.map((dog: any) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name} - {dog.breed}
                </option>
              ))}
            </select>
            {dogData?.dog?.sire && (
              <p className="mt-1 text-sm text-gray-500">
                Current sire: {dogData.dog.sire.name}
              </p>
            )}
          </div>
          
          {/* Dam Selection */}
          <div>
            <label htmlFor="damId" className="block text-sm font-medium text-gray-700">
              Dam (Mother)
            </label>
            <select
              id="damId"
              value={damId || ''}
              onChange={(e) => setDamId(e.target.value || undefined)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={isSubmitting}
            >
              <option value="">No dam selected</option>
              {femaleDogs.map((dog: any) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name} - {dog.breed}
                </option>
              ))}
            </select>
            {dogData?.dog?.dam && (
              <p className="mt-1 text-sm text-gray-500">
                Current dam: {dogData.dog.dam.name}
              </p>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Note: Updating parents will change the pedigree tree and may affect linebreeding analysis.</p>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end pt-4">
            <Link
              href={`/manage/dogs/${dogId}/pedigree`}
              className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={(e) => {
                if (isSubmitting) {
                  e.preventDefault();
                }
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Parents'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ParentLinkingForm;
