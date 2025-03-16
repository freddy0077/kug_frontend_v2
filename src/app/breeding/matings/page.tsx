'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GET_PLANNED_MATINGS } from '@/graphql/queries/plannedMatingQueries';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PlannedMatings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [plannedMatings, setPlannedMatings] = useState<any[]>([]);
  
  // GraphQL query variables
  const [queryVars, setQueryVars] = useState({
    limit: 20,
    offset: 0,
    breederId: undefined as string | undefined,
    status: undefined as string | undefined
  });

  // Fetch planned matings using GraphQL
  const { data, loading, error, refetch } = useQuery(GET_PLANNED_MATINGS, {
    variables: queryVars,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.plannedMatings?.items) {
        setPlannedMatings(data.plannedMatings.items.map((item: any) => ({
          ...item,
          plannedDate: new Date(item.plannedDate)
        })));
      } else {
        setPlannedMatings([]);
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching planned matings:', error);
      setIsLoading(false);
      // Fall back to sample data if the API fails
      setPlannedMatings([
    {
      id: 1,
      sire: {
        id: 101,
        name: "Champion Max",
        breed: "German Shepherd",
        registrationNumber: "GSD-123-XYZ",
        breederId: 201
      },
      dam: {
        id: 102,
        name: "Princess Luna",
        breed: "German Shepherd",
        registrationNumber: "GSD-456-ABC",
        breederId: 201
      },
      plannedDate: new Date(2025, 5, 15), // June 15, 2025
      status: "SCHEDULED",
      expectedLitterSize: "6-8",
      notes: "Both parents have excellent hip scores and temperament",
      breederId: 201
    },
    {
      id: 2,
      sire: {
        id: 103,
        name: "King Apollo",
        breed: "Golden Retriever",
        registrationNumber: "GR-789-DEF",
        breederId: 202
      },
      dam: {
        id: 104,
        name: "Queen Bella",
        breed: "Golden Retriever",
        registrationNumber: "GR-012-GHI",
        breederId: 201
      },
      plannedDate: new Date(2025, 7, 10), // August 10, 2025
      status: "PENDING_APPROVAL",
      expectedLitterSize: "5-7",
      notes: "Waiting for final health clearances",
      breederId: 201
    },
    {
      id: 3,
      sire: {
        id: 105,
        name: "Duke Charlie",
        breed: "Labrador Retriever",
        registrationNumber: "LR-345-JKL",
        breederId: 203
      },
      dam: {
        id: 106,
        name: "Duchess Daisy",
        breed: "Labrador Retriever",
        registrationNumber: "LR-678-MNO",
        breederId: 201
      },
      plannedDate: new Date(2025, 6, 25), // July 25, 2025
      status: "APPROVED",
      expectedLitterSize: "7-9",
      notes: "Both parents are champion show dogs with excellent health records",
      breederId: 201
    }
      ]);
    }
  });
  
  // Function to filter matings by status
  const filterByStatus = (status: string) => {
    setIsLoading(true);
    setQueryVars(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status
    }));
    
    refetch({
      ...queryVars,
      status: status === 'all' ? undefined : status
    }).then(() => {
      setIsLoading(false);
    });
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMMM d, yyyy');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-green-100 text-green-800';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'PENDING_APPROVAL':
        return 'Pending Approval';
      case 'APPROVED':
        return 'Approved';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" color="border-blue-500" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['BREEDER', 'ADMIN']}>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Planned Matings</h1>
                <p className="mt-1 text-gray-600">Manage your planned breeding pairs and matings</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  href="/breeding/matings/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Planned Mating
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Total Planned Matings</h3>
                  <div className="mt-1">
                    <p className="text-3xl font-semibold text-gray-900">{plannedMatings.length}</p>
                    <p className="text-sm text-gray-500">{data?.plannedMatings?.totalCount ? `of ${data.plannedMatings.totalCount} total` : ''}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Approved</h3>
                  <div className="mt-1">
                    <p className="text-3xl font-semibold text-gray-900">
                      {plannedMatings.filter(m => m.status === 'APPROVED').length}
                    </p>
                    <button 
                      onClick={() => filterByStatus('APPROVED')} 
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      View all
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Pending</h3>
                  <div className="mt-1">
                    <p className="text-3xl font-semibold text-gray-900">
                      {plannedMatings.filter(m => m.status === 'PENDING_APPROVAL').length}
                    </p>
                    <button 
                      onClick={() => filterByStatus('PENDING_APPROVAL')} 
                      className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                    >
                      View all
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="font-medium text-gray-700">Filter by:</div>
              <button 
                onClick={() => filterByStatus('all')} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${queryVars.status === undefined ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                All
              </button>
              <button 
                onClick={() => filterByStatus('SCHEDULED')} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${queryVars.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                Scheduled
              </button>
              <button 
                onClick={() => filterByStatus('PENDING_APPROVAL')} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${queryVars.status === 'PENDING_APPROVAL' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                Pending Approval
              </button>
              <button 
                onClick={() => filterByStatus('APPROVED')} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${queryVars.status === 'APPROVED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                Approved
              </button>
              <button 
                onClick={() => filterByStatus('COMPLETED')} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${queryVars.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                Completed
              </button>
              <button 
                onClick={() => filterByStatus('CANCELLED')} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${queryVars.status === 'CANCELLED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Planned Matings Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Planned Matings</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">A list of all your planned breeding pairs and matings</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pair
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Planned Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Litter Size
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plannedMatings.map((mating) => (
                    <tr key={mating.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {mating.sire.name} x {mating.dam.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {mating.sire.breed}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(mating.plannedDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(mating.status)}`}>
                          {getStatusDisplayName(mating.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mating.expectedLitterSize}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/breeding/matings/${mating.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          View
                        </Link>
                        <Link href={`/breeding/matings/${mating.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          Edit
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
