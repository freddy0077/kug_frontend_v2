'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BREEDS, SortDirection } from '@/graphql/queries/breedQueries';
import { DELETE_BREED } from '@/graphql/mutations/breedMutations';
import BreedSearchFilters from '@/components/breeds/BreedSearchFilters';
import { useAuth } from '@/contexts/AuthContext';

export default function ManageBreedsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    sortDirection: SortDirection.ASC,
    offset: 0,
    limit: 20
  });
  
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const { loading, error, data, refetch } = useQuery(GET_BREEDS, {
    variables: searchParams,
    notifyOnNetworkStatusChange: true,
  });

  const [deleteBreed, { loading: deleteLoading }] = useMutation(DELETE_BREED, {
    onCompleted: () => {
      refetch();
      setConfirmDelete(null);
    },
    onError: (error) => {
      setDeleteError(
        error.graphQLErrors?.[0]?.message || 
        'Failed to delete breed. It may be associated with dogs in the database.'
      );
    }
  });

  const handleSearch = (filters: { searchTerm: string; sortDirection: SortDirection }) => {
    setSearchParams(prevParams => ({
      ...prevParams,
      ...filters,
      offset: 0 // Reset pagination when filters change
    }));
  };

  const handleDeleteClick = (breedId: string) => {
    setConfirmDelete(breedId);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      await deleteBreed({
        variables: { id: confirmDelete }
      });
    } catch (err) {
      // Error is handled in onError callback
    }
  };

  // Check if user has permission to manage breeds
  if (user && !['ADMIN', 'MODERATOR'].includes(user.role)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You don't have permission to access this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Breeds</h1>
        <Link 
          href="/manage/breeds/add" 
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add New Breed
        </Link>
      </div>

      <div className="mb-6">
        <BreedSearchFilters 
          onSearch={handleSearch} 
          initialSearchTerm={searchParams.searchTerm}
          initialSortDirection={searchParams.sortDirection}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          Error loading breeds: {error.message}
        </div>
      )}

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {deleteError}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this breed? This action cannot be undone.
              {data?.breeds?.items.find((b: any) => b.id === confirmDelete)?.dogs?.length > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This breed is associated with dogs in the database.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && !data ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Loading breeds...</p>
        </div>
      ) : (
        <>
          {data?.breeds?.items?.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No breeds found matching your criteria.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Breed
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Group
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Origin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dogs
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data?.breeds?.items.map((breed: any) => (
                      <tr key={breed.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {breed.imageUrl && (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={breed.imageUrl} 
                                  alt={breed.name} 
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{breed.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {breed.group || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {breed.origin || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {breed.dogs?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link 
                              href={`/breeds/${breed.id}`} 
                              className="text-green-600 hover:text-green-900"
                            >
                              View
                            </Link>
                            <Link 
                              href={`/manage/breeds/edit/${breed.id}`}
                              className="text-indigo-600 hover:text-indigo-900 ml-2"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(breed.id)}
                              className="text-red-600 hover:text-red-900 ml-2"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {data?.breeds?.hasMore && (
                <div className="px-6 py-3 border-t border-gray-200 text-center">
                  <button
                    onClick={() => {
                      setSearchParams({
                        ...searchParams,
                        offset: data.breeds.items.length
                      });
                    }}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
