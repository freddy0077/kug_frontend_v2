"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { XCircleIcon, FunnelIcon, ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

// Import GraphQL queries
import { GET_AUDIT_LOGS } from '../../../graphql/queries/auditLogQueries';

// Import types
import { AuditLogItem, AuditAction, AuditLogFilters } from '../../../types/auditLogs';
import { useAuth } from '../../../contexts/AuthContext';

// Import components
import AuditLogsPagination from '../auditLogs/components/AuditLogsPagination';
import FilterPanel from '../auditLogs/components/FilterPanel';
import AuditLogDetailsModal from '../auditLogs/components/AuditLogDetailsModal';

const AuditLogsManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  // State for data
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  
  // State for modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: currentPage,
    limit: pageSize,
    entityType: undefined,
    action: undefined
  });
  
  // GraphQL query for fetching audit logs
  const { loading, error, data, refetch } = useQuery(GET_AUDIT_LOGS, {
    onError: (error) => {
      console.error('GraphQL error:', error);
    },
    variables: {
      page: Math.max(1, currentPage), // Ensure page is never less than 1
      limit: pageSize,
      entityType: filters.entityType,
      action: filters.action
    },
    skip: !isAuthenticated || user?.role !== 'ADMIN',
    fetchPolicy: 'no-cache', // Use no-cache to ensure fresh data
    nextFetchPolicy: 'no-cache' // Ensure subsequent fetches also bypass cache
  });
  
  // Update variables when page or filters change
  useEffect(() => {
    // Force a new fetch with cache-busting
    refetch({
      page: Math.max(1, currentPage), // Ensure page is never less than 1
      limit: pageSize,
      entityType: filters.entityType,
      action: filters.action
    });
  }, [currentPage, pageSize, filters, refetch]);
  
  // Handle log selection
  const handleLogSelect = (log: AuditLogItem) => {
    setSelectedLog(log);
    setIsDetailsModalOpen(true);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<AuditLogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle filter reset
  const handleFilterReset = () => {
    setFilters({
      page: 1,
      limit: pageSize,
      entityType: undefined,
      action: undefined
    });
    setCurrentPage(1);
  };
  
  // Format action for display
  const formatAction = (action: AuditAction): string => {
    return action.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Format entity type for display
  const formatEntityType = (entityType: string): string => {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1).replace(/_/g, ' ').toLowerCase();
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
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
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and track all system activities and user actions
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            <FunnelIcon className="mr-2 h-5 w-5 text-gray-500" />
            Filter
          </button>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            <ArrowPathIcon className="mr-2 h-5 w-5 text-gray-500" />
            Refresh
          </button>
          <button
            onClick={() => {/* Implement export functionality */}}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            <DocumentTextIcon className="mr-2 h-5 w-5 text-gray-500" />
            Export
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mt-6 bg-white shadow rounded-xl p-6">
        {/* Filter Panel */}
        {isFilterOpen && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleFilterReset}
          />
        )}
        
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
                  Error loading audit log data. Please try again.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Logs Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.auditLogs?.items.map((log: AuditLogItem) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.action === AuditAction.CREATE ? 'bg-green-100 text-green-800' :
                          log.action === AuditAction.UPDATE ? 'bg-blue-100 text-blue-800' :
                          log.action === AuditAction.DELETE ? 'bg-red-100 text-red-800' :
                          log.action === AuditAction.LOGIN || log.action === AuditAction.LOGOUT ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatEntityType(log.entityType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.user ? log.user.fullName : 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleLogSelect(log)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {data?.auditLogs?.items.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No audit logs found. Try changing your filters.
              </div>
            )}
            
            {/* Pagination */}
            <div className="mt-6">
              <AuditLogsPagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={data?.auditLogs?.totalCount || 0}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
      
      {/* Modals */}
      <AuditLogDetailsModal
        log={selectedLog}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default AuditLogsManagement;
