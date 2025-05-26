import React from 'react';
import { ApprovalStatus } from '@/types/enums';
import { useQuery } from '@apollo/client';
import { GET_DOGS } from '@/graphql/queries/dogQueries';

interface StatusTabsProps {
  activeTab: ApprovalStatus;
  setActiveTab: (status: ApprovalStatus) => void;
}

const StatusTabs: React.FC<StatusTabsProps> = ({ activeTab, setActiveTab }) => {
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

  const pendingCount = pendingCountData?.dogs?.totalCount || 0;
  const approvedCount = approvedCountData?.dogs?.totalCount || 0;
  const declinedCount = declinedCountData?.dogs?.totalCount || 0;

  const tabs = [
    {
      name: 'Pending',
      count: pendingCount,
      status: ApprovalStatus.PENDING,
      color: 'text-yellow-500',
      bgActive: 'bg-yellow-50 border-yellow-500',
      bgHover: 'hover:bg-yellow-50',
    },
    {
      name: 'Approved',
      count: approvedCount,
      status: ApprovalStatus.APPROVED,
      color: 'text-green-500',
      bgActive: 'bg-green-50 border-green-500',
      bgHover: 'hover:bg-green-50',
    },
    {
      name: 'Declined',
      count: declinedCount,
      status: ApprovalStatus.DECLINED,
      color: 'text-red-500',
      bgActive: 'bg-red-50 border-red-500',
      bgHover: 'hover:bg-red-50',
    },
  ];

  return (
    <div className="flex border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.status}
          onClick={() => setActiveTab(tab.status)}
          className={`
            flex items-center py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap
            ${
              activeTab === tab.status
                ? `border-${tab.bgActive} ${tab.color}`
                : `border-transparent text-gray-500 ${tab.bgHover} hover:text-gray-700`
            }
            focus:outline-none transition-colors
          `}
          aria-current={activeTab === tab.status ? 'page' : undefined}
        >
          {tab.name}
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${tab.color} bg-opacity-10`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default StatusTabs;
