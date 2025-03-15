'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useOwnerships } from '@/hooks/useOwnerships';
import { useAuth } from '@/contexts/AuthContext';

// Define interface for filter options
interface FilterOptions {
  dogId?: string;
  statusFilter?: 'all' | 'current' | 'previous';
  dateRange?: 'all' | 'last30' | 'last90' | 'last6months' | 'lastYear';
  searchQuery?: string;
}

export default function OwnershipRecordsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterOptions>({
    statusFilter: 'all',
    dateRange: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Use the custom ownership hook
  const { fetchOwnershipRecords } = useOwnerships();
  const { 
    records, 
    loading, 
    error, 
    totalCount, 
    hasMore 
  } = fetchOwnershipRecords({
    // Apply filters from state
    is_current: filters.statusFilter === 'current' 
      ? true 
      : filters.statusFilter === 'previous' 
        ? false 
        : undefined
  });

  // Apply client-side filtering for search and additional criteria
  const filteredRecords = records.filter(record => {
    // Search query filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = 
        record.dog.name.toLowerCase().includes(lowerQuery) ||
        record.owner.name.toLowerCase().includes(lowerQuery) ||
        record.dog.registrationNumber.toLowerCase().includes(lowerQuery);
      
      if (!matchesSearch) return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const recordDate = new Date(record.startDate);
      const now = new Date();
      let dateLimit: Date;

      switch (filters.dateRange) {
        case 'last30':
          dateLimit = new Date(now.setDate(now.getDate() - 30));
          break;
        case 'last90':
          dateLimit = new Date(now.setDate(now.getDate() - 90));
          break;
        case 'last6months':
          dateLimit = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case 'lastYear':
          dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          return true;
      }

      if (recordDate < dateLimit) return false;
    }

    return true;
  });

  // Handlers for filters and search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Extract unique dogs for filter dropdown
  const dogOptions = Array.from(
    new Set(records.map(record => record.dog.id))
  ).map(dogId => {
    const dog = records.find(r => r.dog.id === dogId)?.dog;
    return {
      id: dogId,
      name: dog?.name || `Dog ${dogId}`
    };
  });

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'OWNER', 'BREEDER']}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Ownership Records</h1>

        {/* Filters and Search */}
        <div className="mb-4 flex space-x-4">
          {/* Search Input */}
          <input 
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />

          {/* Status Filter */}
          <select 
            value={filters.statusFilter}
            onChange={(e) => handleFilterChange({ 
              statusFilter: e.target.value as FilterOptions['statusFilter'] 
            })}
            className="select select-bordered w-full max-w-xs"
          >
            <option value="all">All Ownerships</option>
            <option value="current">Current Ownerships</option>
            <option value="previous">Previous Ownerships</option>
          </select>

          {/* Date Range Filter */}
          <select 
            value={filters.dateRange}
            onChange={(e) => handleFilterChange({ 
              dateRange: e.target.value as FilterOptions['dateRange'] 
            })}
            className="select select-bordered w-full max-w-xs"
          >
            <option value="all">All Dates</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="last6months">Last 6 Months</option>
            <option value="lastYear">Last Year</option>
          </select>
        </div>

        {/* Loading and Error States */}
        {loading && <p>Loading ownership records...</p>}
        {error && <p className="text-red-500">Error loading records: {error.message}</p>}

        {/* Ownership Records Table */}
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Dog</th>
                <th>Previous Owner</th>
                <th>New Owner</th>
                <th>Transfer Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      {record.dog.mainImageUrl && (
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img 
                              src={record.dog.mainImageUrl} 
                              alt={record.dog.name} 
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{record.dog.name}</div>
                        <div className="text-sm opacity-50">
                          {record.dog.registrationNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{record.owner.name}</td>
                  <td>{record.owner.contactEmail}</td>
                  <td>{format(new Date(record.startDate), 'PP')}</td>
                  <td>
                    <span className={`badge ${record.is_current ? 'badge-success' : 'badge-ghost'}`}>
                      {record.is_current ? 'Current' : 'Previous'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button className="btn btn-xs btn-info">View</button>
                      <button className="btn btn-xs btn-warning">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <button className="btn btn-primary">
              Load More
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
