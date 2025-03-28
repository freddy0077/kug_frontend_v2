'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_OWNERS } from '@/graphql/queries/userQueries';
import { GET_USERS } from '@/graphql/queries/userQueries';
// Note: We'll need to use a different mutation for deleting owners/users
import Link from 'next/link';
import toast from 'react-hot-toast';
import { UserRole } from '@/utils/permissionUtils';
import { useAuth } from '@/contexts/AuthContext';
import SearchIcon from '../icons/SearchIcon';

interface Owner {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  dogs?: { id: string }[];
  profileImageUrl?: string;
}

const BreederManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Fetch owner data - these are users with OWNER role
  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    variables: { 
      limit: 100,
      role: UserRole.OWNER  // Using UserRole.OWNER instead of UserRole.BREEDER
    },
    fetchPolicy: 'network-only',
  });
  
  // For now, we'll comment out the delete functionality as it needs to be updated
  // with the appropriate mutation for users/owners
  /*
  const [deleteBreeder, { loading: deleteLoading }] = useMutation(DELETE_BREEDER, {
    onCompleted: () => {
      toast.success('Breeder deleted successfully');
      setShowDeleteModal(false);
      setSelectedOwner(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting breeder: ${error.message}`);
    }
  });
  */
  const deleteLoading = false; // Temporary placeholder
  
  // Filter breeders based on search query
  useEffect(() => {
    if (data?.users?.items) {
      if (searchQuery.trim() === '') {
        setFilteredOwners(data.users.items.map(user => user.owner).filter(Boolean));
      } else {
        const lowercaseQuery = searchQuery.toLowerCase();
        const filtered = data.users.items
          .map(user => user.owner)
          .filter(Boolean)
          .filter((owner: Owner) => 
            owner.name?.toLowerCase().includes(lowercaseQuery) ||
            owner.address?.toLowerCase().includes(lowercaseQuery) ||
            owner.contactEmail?.toLowerCase().includes(lowercaseQuery) ||
            owner.contactPhone?.toLowerCase().includes(lowercaseQuery)
          );
        setFilteredOwners(filtered);
      }
    }
  }, [data, searchQuery]);

  // Handle delete confirmation
  const handleDelete = () => {
    if (!selectedOwner) return;
    
    // Note: deleteBreeder functionality has been commented out
    // This is just a placeholder until we implement the proper deletion for users/owners
    toast.error('User deletion not implemented yet');
    setShowDeleteModal(false);
  };
  
  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700 mb-6">You do not have permission to access this page.</p>
        <Link href="/breeders" className="text-green-600 hover:text-green-800 font-medium">
          ← Back to Breeders List
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Manage Breeders</h1>
          <p className="text-white text-opacity-90">
            Add, edit, and remove breeder profiles from the system.
          </p>
        </div>
      </div>
      
      {/* Action bar */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search breeders..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Link 
              href="/admin/manage-breeders/add" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Breeder
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading breeders. Please try again later.</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow px-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No breeders found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding a new breeder.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-sm text-green-600 hover:text-green-800"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Breeder
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
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
                  {filteredOwners.map((owner: Owner) => (
                    <tr key={owner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                            {owner.profileImageUrl ? (
                              <img src={owner.profileImageUrl} alt={owner.name} className="h-10 w-10 object-cover" />
                            ) : (
                              <svg className="h-10 w-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{owner.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {owner.address || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {owner.contactEmail || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500">N/A</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {owner.dogs ? owner.dogs.length : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link
                            href={`/breeders/${owner.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/manage-breeders/edit/${owner.id}`}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedOwner(owner);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="flex items-center justify-center bg-red-100 mx-auto flex-shrink-0 rounded-full p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Breeder
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete <span className="font-medium">{selectedOwner?.name}</span>? This action cannot be undone, and will remove all owner information from the system.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedOwner(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreederManagement;
