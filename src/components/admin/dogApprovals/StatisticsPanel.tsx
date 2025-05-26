import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_DOGS } from '@/graphql/queries/dogQueries';
import { ApprovalStatus } from '@/types/enums';

const StatisticsPanel: React.FC = () => {
  // Query to get counts for each approval status
  const { data: pendingCountData } = useQuery(GET_DOGS, {
    variables: { 
      approvalStatus: ApprovalStatus.PENDING,
      limit: 0 // We only need the count
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: approvedCountData } = useQuery(GET_DOGS, {
    variables: { 
      approvalStatus: ApprovalStatus.APPROVED,
      limit: 0 // We only need the count
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: declinedCountData } = useQuery(GET_DOGS, {
    variables: { 
      approvalStatus: ApprovalStatus.DECLINED,
      limit: 0 // We only need the count
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: totalCountData } = useQuery(GET_DOGS, {
    variables: {
      limit: 0 // We only need the count
    },
    fetchPolicy: 'cache-and-network',
  });

  const pendingCount = pendingCountData?.dogs?.totalCount || 0;
  const approvedCount = approvedCountData?.dogs?.totalCount || 0;
  const declinedCount = declinedCountData?.dogs?.totalCount || 0;
  const totalCount = totalCountData?.dogs?.totalCount || 0;

  // Calculate percentages for the pie chart
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  const declineRate = totalCount > 0 ? Math.round((declinedCount / totalCount) * 100) : 0;

  // Cards to display
  const cards = [
    {
      name: 'Pending Approvals',
      value: pendingCount,
      color: 'bg-yellow-100 text-yellow-800',
      icon: (
        <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Approved Dogs',
      value: approvedCount,
      color: 'bg-green-100 text-green-800',
      icon: (
        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Declined Dogs',
      value: declinedCount,
      color: 'bg-red-100 text-red-800',
      icon: (
        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Total Dogs',
      value: totalCount,
      color: 'bg-blue-100 text-blue-800',
      icon: (
        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Dog Registration Overview</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.name} className={`overflow-hidden rounded-lg shadow-sm ${card.color.split(' ')[0]}`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">{card.icon}</div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium truncate ${card.color.split(' ')[1]}`}>{card.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{card.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Approval rate visualization */}
      {totalCount > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Approval Rate</h3>
          <div className="mt-2">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-green-600">
                    Approval Rate: {approvalRate}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-red-600">
                    Decline Rate: {declineRate}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${approvalRate}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                ></div>
                <div
                  style={{ width: `${declineRate}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                ></div>
                <div
                  style={{ width: `${100 - approvalRate - declineRate}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                ></div>
              </div>
              <div className="flex mt-1 text-xs justify-between">
                <span>{approvedCount} approved</span>
                <span>{pendingCount} pending</span>
                <span>{declinedCount} declined</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPanel;
