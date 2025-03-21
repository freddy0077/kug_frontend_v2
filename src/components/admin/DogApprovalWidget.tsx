'use client';

import { useQuery } from '@apollo/client';
import { GET_DOGS } from '@/graphql/queries/dogQueries';
import { ApprovalStatus } from '@/types/enums';
import Link from 'next/link';

const DogApprovalWidget = () => {
  const { data, loading, error } = useQuery(GET_DOGS, {
    variables: {
      limit: 5,
      approvalStatus: ApprovalStatus.PENDING,
    },
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-12 bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-end">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
        Error loading approval data: {error.message}
      </div>
    );
  }

  const pendingCount = data?.dogs?.totalCount || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Dog Approvals</h3>
      
      {pendingCount > 0 ? (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Dogs Pending Approval:</span>
              <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-sm">
                {pendingCount}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              {pendingCount === 1 
                ? "There is 1 dog registration waiting for your approval." 
                : `There are ${pendingCount} dog registrations waiting for your approval.`
              }
            </p>
          </div>
          
          <div className="flex justify-end">
            <Link 
              href="/admin/dog-approvals" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
              Review Approvals
              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <svg 
            className="mx-auto h-12 w-12 text-green-400" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-gray-600">All caught up! No dogs awaiting approval.</p>
        </div>
      )}
    </div>
  );
};

export default DogApprovalWidget;
