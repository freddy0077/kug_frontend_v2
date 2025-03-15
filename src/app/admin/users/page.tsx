'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS } from '@/graphql/queries/userQueries';
import { DEACTIVATE_USER_MUTATION } from '@/graphql/mutations/userMutations';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function UserManagement() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | null | ''>('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const { loading, error, data, refetch } = useQuery(GET_USERS, {
    variables: {
      offset: currentPage * pageSize,
      limit: pageSize,
      searchTerm: searchTerm || undefined,
      role: roleFilter || undefined,
      isActive: statusFilter === '' ? undefined : statusFilter === null ? undefined : statusFilter
    },
    skip: !isAuthenticated || user?.role !== 'ADMIN',
    fetchPolicy: 'network-only'
  });

  const [deactivateUser, { loading: deactivateLoading }] = useMutation(DEACTIVATE_USER_MUTATION, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      alert(`Failed to update user status: ${error.message}`);
    }
  });

  const handleUserStatusChange = async (userId: string, isCurrentlyActive: boolean) => {
    if (confirm(`Are you sure you want to ${isCurrentlyActive ? 'deactivate' : 'activate'} this user?`)) {
      try {
        await deactivateUser({
          variables: { userId }
        });
      } catch (err) {
        console.error('Error updating user status:', err);
      }
    }
  };

  // Calculate role counts for the stats section
  const roleCounts = {
    OWNER: data?.users?.items?.filter((user: any) => user.role === 'OWNER').length || 0,
    BREEDER: data?.users?.items?.filter((user: any) => user.role === 'BREEDER').length || 0,
    HANDLER: data?.users?.items?.filter((user: any) => user.role === 'HANDLER').length || 0,
    CLUB: data?.users?.items?.filter((user: any) => user.role === 'CLUB').length || 0,
  };

  // Handle filter changes
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [searchTerm, roleFilter, statusFilter, currentPage, pageSize, isAuthenticated, refetch]);

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (!authLoading && isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/user/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null; // We already redirect in the useEffect, this is just a safeguard
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Failed to load users. Please try again later.</span>
      </div>
    );
  }

  const users = data?.users?.items || [];
  const totalCount = data?.users?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                User Management
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="mr-1">Total Users:</span>
                  <span className="font-medium">{totalCount}</span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              <Link 
                href="/admin/users/add"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add User
              </Link>
            </div>
          </div>
        </div>

        {/* Role Statistics */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Role Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{roleCounts.OWNER}</p>
              <p className="text-sm text-green-600">Owners</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{roleCounts.BREEDER}</p>
              <p className="text-sm text-blue-600">Breeders</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">{roleCounts.HANDLER}</p>
              <p className="text-sm text-purple-600">Handlers</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">{roleCounts.CLUB}</p>
              <p className="text-sm text-yellow-600">Clubs</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="roleFilter"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="OWNER">Owner</option>
                <option value="BREEDER">Breeder</option>
                <option value="HANDLER">Handler</option>
                <option value="CLUB">Club</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={statusFilter === '' ? '' : statusFilter === null ? 'null' : statusFilter ? 'active' : 'inactive'}
                onChange={(e) => {
                  if (e.target.value === '') setStatusFilter('');
                  else if (e.target.value === 'null') setStatusFilter(null);
                  else setStatusFilter(e.target.value === 'active');
                }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="null">Null</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.profileImageUrl ? (
                              <img className="h-10 w-10 rounded-full" src={user.profileImageUrl} alt="" />
                            ) : (
                              <span className="text-gray-500 font-medium">{user.fullName.charAt(0)}</span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 
                           user.role === 'OWNER' ? 'bg-green-100 text-green-800' :
                           user.role === 'BREEDER' ? 'bg-blue-100 text-blue-800' :
                           user.role === 'HANDLER' ? 'bg-purple-100 text-purple-800' :
                           'bg-yellow-100 text-yellow-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          Edit
                        </Link>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleUserStatusChange(user.id, user.isActive)}
                          disabled={deactivateLoading}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{currentPage * pageSize + 1}</span> to <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalCount)}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      // Logic to show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 2) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 3) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          aria-current={currentPage === pageNum ? "page" : undefined}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum 
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
