import React from 'react';
import { FaUsers, FaUserPlus, FaUserClock, FaServer, FaChartBar } from 'react-icons/fa';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATISTICS } from '../../../graphql/queries/dashboardQueries';

import StatCard from '../shared/StatCard';
import ChartSection from '../shared/ChartSection';
import DataTable from '../shared/DataTable';
import AreaChart from '../shared/AreaChart';

// Safe accessor function
const safeAccess = (obj: any, path: string, defaultValue: any = undefined) => {
  try {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return value !== undefined ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const UserActivityTab: React.FC = () => {
  const { data, loading } = useQuery(GET_DASHBOARD_STATISTICS);
  
  // Statistics for user activity
  const statistics = [
    {
      title: 'Total Users',
      value: safeAccess(data, 'dashboardStatistics.users.totalUsers', 0),
      icon: <FaUsers />,
      description: 'Registered users',
      color: 'border-blue-500'
    },
    {
      title: 'New Users',
      value: safeAccess(data, 'dashboardStatistics.users.newUsersThisMonth', 0),
      icon: <FaUserPlus />,
      description: 'Last 30 days',
      color: 'border-green-500'
    },
    {
      title: 'Active Users',
      value: safeAccess(data, 'dashboardStatistics.users.activeUsers', 0),
      icon: <FaUserClock />,
      description: 'Currently active',
      color: 'border-purple-500'
    },
    {
      title: 'API Calls',
      value: safeAccess(data, 'dashboardStatistics.activity.totalApiCalls', 0),
      icon: <FaServer />,
      description: 'Total requests',
      color: 'border-teal-500'
    },
    {
      title: 'API Calls (Month)',
      value: safeAccess(data, 'dashboardStatistics.activity.apiCallsThisMonth', 0),
      icon: <FaChartBar />,
      description: 'Last 30 days',
      color: 'border-indigo-500'
    }
  ];

  // User activity log data
  const userActivityLog = safeAccess(data, 'userActivityLog', []) || [];

  return (
    <div role="tabpanel" id="users-panel" aria-labelledby="users-tab" className="transition-opacity duration-300 ease-in-out">
      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {statistics.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            color={stat.color}
          />
        ))}
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartSection title="User Growth" description="New user registrations over time">
          <AreaChart
            data={safeAccess(data, 'dashboardStatistics.users.registrationsTrend', [])}
            xKey="date"
            areaKey="count"
            color="#8B5CF6"
          />
        </ChartSection>

        <ChartSection title="API Activity" description="API calls over time">
          <AreaChart
            data={safeAccess(data, 'dashboardStatistics.activity.activityTrend', [])}
            xKey="date"
            areaKey="count"
            color="#10B981"
          />
        </ChartSection>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartSection title="User Role Distribution" description="Distribution of users by role">
          <div className="flex items-center justify-center h-full">
            <div className="grid grid-cols-1 gap-4 w-full max-w-md">
              {safeAccess(data, 'dashboardStatistics.users.byRole', []).map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.role}</span>
                      <span className="text-sm font-medium text-gray-700">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${index === 0 ? 'blue' : index === 1 ? 'purple' : 'indigo'}-500 h-2 rounded-full`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartSection>
        
        <ChartSection title="Login & API Activity" description="System usage statistics">
          <div className="flex flex-col h-full justify-center px-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">Total Logins</div>
                <div className="text-xl font-bold">{safeAccess(data, 'dashboardStatistics.activity.totalLogins', 0)}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">Monthly Logins</div>
                <div className="text-xl font-bold">{safeAccess(data, 'dashboardStatistics.activity.loginsThisMonth', 0)}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">API Calls Today</div>
                <div className="text-xl font-bold">
                  {safeAccess(data, 'dashboardStatistics.activity.apiCallsToday', 0)}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">Avg. API Calls/Day</div>
                <div className="text-xl font-bold">
                  {Math.round(safeAccess(data, 'dashboardStatistics.activity.apiCallsThisMonth', 0) / 30)}
                </div>
              </div>
            </div>
          </div>
        </ChartSection>
      </div>

      {/* User Activity Log */}
      <div className="mb-8">
        <DataTable
          title="User Activity Log"
          description="Recent user actions in the system"
          headers={['User', 'Action', 'Target', 'Timestamp', 'IP Address']}
          data={userActivityLog}
          loading={loading && userActivityLog.length === 0}
          emptyMessage="No recent user activity found"
          renderRow={(activity, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{activity.userName}</div>
                    <div className="text-sm text-gray-500">{activity.userEmail}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  activity.actionType === 'create' 
                    ? 'bg-green-100 text-green-800' 
                    : activity.actionType === 'update'
                      ? 'bg-blue-100 text-blue-800'
                      : activity.actionType === 'delete'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                }`}>
                  {activity.actionType.charAt(0).toUpperCase() + activity.actionType.slice(1)}
                </span>
                <div className="text-sm text-gray-500 mt-1">{activity.action}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{activity.targetType}</div>
                <div className="text-sm text-gray-500">{activity.targetId}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(activity.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {activity.ipAddress}
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default UserActivityTab;
