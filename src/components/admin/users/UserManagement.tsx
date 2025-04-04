"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { XCircleIcon } from '@heroicons/react/24/outline';

// Import GraphQL queries and mutations
import { GET_USERS } from '../../../graphql/queries/userQueries';
import { 
  ACTIVATE_USER_MUTATION, 
  DEACTIVATE_USER_MUTATION,
  UPDATE_USER_MUTATION
} from '../../../graphql/mutations/userMutations';

// Import components


import FilterPanel from './components/FilterPanel';
import UserTableView from './components/UserTableView';
import UserDetailsModal from './components/UserDetailsModal';
import Pagination from './components/Pagination';
import ExportModal from './components/ExportModal';
import ConfirmationDialog from './components/ConfirmationDialog';

// Import types
import { User, FilterOptions, UserAction } from './types';
import { useAuth } from '../../../contexts/AuthContext';

const UserManagement: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  // State for user data management
  
  // State for user data
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // State for modals
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<UserAction | null>(null);
  
  // State for filters
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    roleFilter: '',
    statusFilter: '',
    sortField: 'createdAt',
    sortDirection: 'desc'
  });
  
  // Initialize component
  
  // GraphQL query for fetching users
  const { loading, error, data, refetch } = useQuery(GET_USERS, {
    variables: {
      offset: Math.max(0, currentPage * pageSize), // Ensure offset is never negative
      limit: pageSize,
      searchTerm: filterOptions.searchTerm || undefined,
      role: filterOptions.roleFilter || undefined,
      isActive: filterOptions.statusFilter === '' ? undefined : filterOptions.statusFilter,
      sortField: filterOptions.sortField,
      sortDirection: filterOptions.sortDirection
    },
    skip: !isAuthenticated || user?.role !== 'ADMIN',
    fetchPolicy: 'network-only',
    onCompleted: () => {
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    }
  });
  
  // Mutations for user actions
  const [activateUser] = useMutation(ACTIVATE_USER_MUTATION, {
    onCompleted: () => {
      refetch();
    }
  });
  
  const [deactivateUser] = useMutation(DEACTIVATE_USER_MUTATION, {
    onCompleted: () => {
      refetch();
    }
  });
  
  const [updateUser] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: () => {
      refetch();
    }
  });
  

  
  // Handle user selection
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(0); // Reset to first page when filters change
  };
  
  // Handle user status change (activate/deactivate)
  const handleStatusChange = (userId: string, isCurrentlyActive: boolean) => {
    setPendingAction({
      id: userId,
      action: isCurrentlyActive ? 'deactivate' : 'activate'
    });
    setIsConfirmationOpen(true);
  };
  
  // Confirm user status change
  const confirmStatusChange = async () => {
    if (!pendingAction) return;
    
    try {
      if (pendingAction.action === 'activate') {
        await activateUser({
          variables: { userId: pendingAction.id }
        });
      } else {
        await deactivateUser({
          variables: { userId: pendingAction.id }
        });
      }
      
      // Refresh the selected user if it's the one we just modified
      if (selectedUser && selectedUser.id === pendingAction.id) {
        setSelectedUser(prev => 
          prev ? { ...prev, isActive: pendingAction.action === 'activate' } : null
        );
      }
    } catch (error) {
      console.error('Error changing user status:', error);
    }
  };
  
  // Handle data export
  const handleExport = (format: string, includeOptions: string[]) => {
    console.log(`Exporting data in ${format} format`, includeOptions);
    // Implementation for actual export would go here
    // This could involve a GraphQL mutation or an API call to generate the export
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle access control
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You do not have permission to access this page. Please contact an administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all user accounts in the system
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => router.push('/admin/users/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            Add New User
          </button>
          <button
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            Export Data
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mt-6 bg-white shadow rounded-xl p-6">
        {/* Filter Panel */}
        <FilterPanel
          filterOptions={filterOptions}
          onFilterChange={handleFilterChange}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
        />
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error loading user data. Please try again.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <UserTableView
                users={data?.users?.items || []}
                onUserSelect={handleUserSelect}
                onStatusChange={handleStatusChange}
                sortField={filterOptions.sortField}
                sortDirection={filterOptions.sortDirection}
              />
            </div>
            
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={data?.users?.totalCount || 0}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Modals */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isUserDetailsOpen}
        onClose={() => setIsUserDetailsOpen(false)}
        onStatusChange={handleStatusChange}
      />
      
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
      />
      
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={confirmStatusChange}
        title={`${pendingAction?.action === 'activate' ? 'Activate' : 'Deactivate'} User`}
        message={`Are you sure you want to ${pendingAction?.action === 'activate' ? 'activate' : 'deactivate'} this user? ${
          pendingAction?.action === 'deactivate' 
            ? 'The user will no longer be able to access the system.' 
            : 'The user will regain access to the system.'
        }`}
        confirmButtonText={pendingAction?.action === 'activate' ? 'Activate' : 'Deactivate'}
        cancelButtonText="Cancel"
        confirmButtonClass={pendingAction?.action === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
      />
    </div>
  );
};

export default UserManagement;
