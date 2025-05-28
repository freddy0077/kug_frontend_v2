"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { 
  XCircleIcon, 
  UserPlusIcon, 
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/solid';

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
import Link from 'next/link';

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
    skip: !isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN'),
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
  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
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
  
  // Calculate user statistics
  const totalUsers = data?.users?.totalCount || 0;
  const activeUsers = data?.users?.items?.filter(user => user.isActive)?.length || 0;
  const inactiveUsers = totalUsers - activeUsers;
  const adminUsers = data?.users?.items?.filter(user => user.role === 'ADMIN')?.length || 0;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and monitor all user accounts in the system
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/users/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
          >
            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add New User
          </Link>
          <button
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
          >
            <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
            Export Data
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <UserIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 mr-4">
                <UserIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={filterOptions.searchTerm}
                onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Filters
              </button>
              
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                title="Refresh data"
              >
                <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          {/* Expanded Filter Panel */}
          {isFilterOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <FilterPanel
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-500">Loading user data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 flex items-start">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading user data</h3>
              <p className="mt-2 text-sm text-red-700">
                Please try refreshing the page or contact support if the problem persists.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <ArrowPathIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Try Again
              </button>
            </div>
          </div>
        ) : data?.users?.items?.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <UserTableView
                users={data?.users?.items || []}
                onUserSelect={handleUserSelect}
                onStatusChange={handleStatusChange}
                sortField={filterOptions.sortField}
                sortDirection={filterOptions.sortDirection}
              />
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
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
