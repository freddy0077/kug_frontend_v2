'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GET_LITTERS } from '@/graphql/queries/litterQueries';
import { GET_BREEDS } from '@/graphql/queries/breedQueries';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/utils/permissionUtils';
import { formatDate } from '@/utils/dateUtils';

// Pagination defaults
const DEFAULT_PAGE_SIZE = 10;

// Define filter state interface
interface FilterState {
  searchTerm: string;
  breedId: string;
  fromDate: string;
  toDate: string;
}

export default function LittersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    breedId: '',
    fromDate: '',
    toDate: '',
  });
  
  // Temporary filter state (for form inputs before submission)
  const [tempFilters, setTempFilters] = useState<FilterState>({
    searchTerm: '',
    breedId: '',
    fromDate: '',
    toDate: '',
  });
  
  // Calculate offset for pagination
  const offset = (currentPage - 1) * pageSize;
  
  // Fetch litters data
  const { loading, error, data, refetch } = useQuery(GET_LITTERS, {
    variables: {
      offset,
      limit: pageSize,
      searchTerm: filters.searchTerm || undefined,
      breedId: filters.breedId || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
    },
    // Skip this query if user isn't authenticated
    skip: !user,
    fetchPolicy: 'network-only',
  });
  
  // Fetch breeds for the dropdown
  const { data: breedsData } = useQuery(GET_BREEDS, {
    variables: {
      limit: 100 // Fetch up to 100 breeds
    },
    skip: !user
  });
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Apply filters
  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(tempFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Reset filters
  const resetFilters = () => {
    setTempFilters({
      searchTerm: '',
      breedId: '',
      fromDate: '',
      toDate: '',
    });
    setFilters({
      searchTerm: '',
      breedId: '',
      fromDate: '',
      toDate: '',
    });
    setCurrentPage(1);
  };
  
  // Determine total pages
  const totalLitters = data?.litters?.totalCount || 0;
  const totalPages = Math.ceil(totalLitters / pageSize);
  
  // Change page handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // If still loading auth, show loading spinner
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/auth/login?redirect=/litters');
    }
    return null;
  }
  
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Page Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Litters</h1>
              <p className="mt-1 text-sm text-gray-500">Manage and track all your litters in one place</p>
            </div>
            
            {/* Only show register button for appropriate roles */}
            {(user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER) && (
              <Link
                href="/litters/new"
                className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Register New Litter
              </Link>
            )}
          </div>
          
          {/* Stats Cards */}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Litters</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalLitters || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Puppies</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.litters?.items?.reduce((sum: number, litter: any) => sum + (litter.puppyCount || 0), 0) || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Recent Litters</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {data.litters?.items?.filter((litter: any) => {
                        if (!litter.dateOfBirth) return false;
                        const threeMonthsAgo = new Date();
                        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                        return new Date(litter.dateOfBirth) >= threeMonthsAgo;
                      }).length || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Breeds</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {new Set(data.litters?.items?.map((litter: any) => litter.breed?.id).filter(Boolean)).size || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Filter Litters</h3>
            
            <form onSubmit={applyFilters} className="mt-5 sm:flex sm:items-center">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                {/* Search Term */}
                <div>
                  <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    name="searchTerm"
                    id="searchTerm"
                    value={tempFilters.searchTerm}
                    onChange={handleFilterChange}
                    placeholder="Search litters..."
                    className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                {/* Start Date */}
                <div>
                  <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      name="fromDate"
                      id="fromDate"
                      value={tempFilters.fromDate}
                      onChange={handleFilterChange}
                      className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                {/* End Date */}
                <div>
                  <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      name="toDate"
                      id="toDate"
                      value={tempFilters.toDate}
                      onChange={handleFilterChange}
                      className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                {/* Breed Selector */}
                <div>
                  <label htmlFor="breedId" className="block text-sm font-medium text-gray-700 mb-1">
                    Breed
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <select
                      id="breedId"
                      name="breedId"
                      value={tempFilters.breedId}
                      onChange={handleFilterChange}
                      className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">All Breeds</option>
                      {breedsData?.breeds?.items?.map((breed: any) => (
                        <option key={breed.id} value={breed.id}>
                          {breed.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Filter Actions */}
                <div className="flex items-end space-x-2">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Litters List */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="px-4 py-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading litters...</p>
              </div>
            </div>
          ) : error ? (
            <div className="px-4 py-5 sm:p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
                    <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading litters</h3>
                    <p className="mt-1 text-sm text-red-700">
                      There was a problem loading the litters. Please try again later or contact support if the issue persists.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : data?.litters?.items?.length === 0 ? (
            <div className="px-4 py-12 sm:p-10 text-center">
              <div className="inline-block bg-gray-100 rounded-full p-6 mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No litters found</h3>
              <p className="text-base text-gray-500 max-w-md mx-auto">
                {Object.values(filters).some(Boolean)
                  ? 'No litters match your current filters. Try adjusting your search criteria or create a new litter.'
                  : 'There are no litters in the system yet. Get started by registering your first litter.'}
              </p>
              {(user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER) && (
                <div className="mt-8">
                  <Link
                    href="/litters/new"
                    className="inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Register New Litter
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.litters.items.map((litter: any) => (
                    <div key={litter.id} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="px-4 py-5 sm:p-6">
                        {/* Litter Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {litter.litterIdentifier || `Litter #${litter.id.substring(0, 8)}`}
                            </h3>
                            <div className="mt-1 flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {litter.breed ? litter.breed.name : 'Unknown Breed'}
                              </span>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {litter.puppyCount || 0} Puppies
                          </span>
                        </div>
                        
                        {/* Parents */}
                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sire</h4>
                            <p className="mt-1 text-sm font-medium text-gray-900">{litter.sire ? litter.sire.name : 'Unknown'}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dam</h4>
                            <p className="mt-1 text-sm font-medium text-gray-900">{litter.dam ? litter.dam.name : 'Unknown'}</p>
                          </div>
                        </div>
                        
                        {/* Date of Birth */}
                        <div className="mt-4 flex items-center border-t border-gray-100 pt-4">
                          <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-500">
                            {litter.dateOfBirth ? formatDate(litter.dateOfBirth) : 'Date of Birth Not Recorded'}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="mt-5 border-t border-gray-100 pt-4 flex justify-between">
                          <Link
                            href={`/litters/${litter.id}`}
                            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                          >
                            <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            View Details
                          </Link>
                          
                          {(user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER) && (
                            <Link
                              href={`/litters/${litter.id}/register-puppies`}
                              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
                            >
                              <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                              </svg>
                              Register Puppies
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* No results state */}
              {data?.litters?.items?.length === 0 && (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No litters found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your filters or create a new litter.
                  </p>
                  {(user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER) && (
                    <div className="mt-6">
                      <Link
                        href="/litters/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Register New Litter
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {/* Enhanced Pagination */}
              {data?.litters?.items?.length > 0 && (
                <div className="bg-white px-5 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <p className="text-sm text-gray-700 flex items-center">
                        <span className="bg-indigo-100 text-indigo-700 inline-flex items-center justify-center w-8 h-8 rounded-full mr-2 font-semibold">{totalLitters}</span>
                        Showing <span className="font-medium mx-1">{offset + 1}</span> to{' '}
                        <span className="font-medium mx-1">
                          {Math.min(offset + pageSize, totalLitters)}
                        </span>{' '}
                        of <span className="font-medium">{totalLitters}</span> litters
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
                        {/* First page button */}
                        <button
                          onClick={() => goToPage(1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium transition-colors duration-150 ${
                            currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        >
                          <span className="sr-only">First Page</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Previous page button */}
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium transition-colors duration-150 ${
                            currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page selector with modern styling */}
                        <div className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium">
                          <select 
                            value={currentPage}
                            onChange={(e) => goToPage(Number(e.target.value))}
                            className="appearance-none bg-transparent border-none focus:outline-none focus:ring-0 text-indigo-600 pr-8 pl-2 font-medium"
                            aria-label="Select page"
                          >
                            {[...Array(totalPages)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Page {i + 1}
                              </option>
                            ))}
                          </select>
                          <span className="text-gray-500 mx-1">of</span>
                          <span className="text-indigo-600 font-medium">{totalPages || 1}</span>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500">
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Next page button */}
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className={`relative inline-flex items-center px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium transition-colors duration-150 ${
                            currentPage >= totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Last page button */}
                        <button
                          onClick={() => goToPage(totalPages)}
                          disabled={currentPage >= totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium transition-colors duration-150 ${
                            currentPage >= totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        >
                          <span className="sr-only">Last Page</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
