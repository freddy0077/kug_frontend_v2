'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_DOG_BY_ID } from '@/graphql/queries/dogQueries';
import { UPDATE_DOG_MUTATION } from '@/graphql/mutations/dogMutations';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import toast from 'react-hot-toast';
import DogEditForm from '@/components/dogs/DogEditForm';

export default function EditDogPage() {
  const router = useRouter();
  const params = useParams();
  const dogId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch dog data
  const { data, loading: queryLoading, error: queryError } = useQuery(GET_DOG_BY_ID, {
    variables: { id: dogId },
    fetchPolicy: 'no-cache', // Ensure we get the latest data
    onCompleted: () => setLoading(false),
    onError: (err) => {
      setError(`Error loading dog data: ${err.message}`);
      setLoading(false);
    }
  });

  // Handler for successful update
  const handleSuccess = () => {
    toast.success('Dog updated successfully!');
    // Redirect back to the dog profile page
    router.push(`/manage/dogs/${dogId}/profile`);
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.OWNER]} fallbackPath="/auth/login">
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-6">
            <Link 
              href={`/manage/dogs/${dogId}/profile`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>  
              Back to Dog Profile
            </Link>
          </div>
          
          {/* Page content */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Edit Dog</h1>
              <p className="mt-1 text-sm text-gray-500">
                Update the information for this dog in the registry.
              </p>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-300 p-4 rounded-md">
                  <p className="text-red-700">{error}</p>
                </div>
              ) : (
                <DogEditForm 
                  dogData={data?.dog} 
                  dogId={dogId} 
                  onSuccess={handleSuccess} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
