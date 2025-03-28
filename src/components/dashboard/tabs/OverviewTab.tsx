import React from 'react';
import { FaDog, FaUsers, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATISTICS } from '../../../graphql/queries/dashboardQueries';

import StatCard from '../shared/StatCard';
import ChartSection from '../shared/ChartSection';
import DataTable from '../shared/DataTable';
import AreaChart from '../shared/AreaChart';

// Safe accessor function to prevent undefined errors
const safeAccess = (obj: any, path: string, defaultValue: any = undefined) => {
  try {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return value !== undefined ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const OverviewTab: React.FC = () => {
  const { data, loading } = useQuery(GET_DASHBOARD_STATISTICS);
  
  // Stats for the overview tab
  const statistics = [
    {
      title: 'Total Dogs Registered',
      value: safeAccess(data, 'dashboardStatistics.dogs.totalDogs', 0),
      icon: <FaDog />,
      change: '+12',
      color: 'border-blue-500'
    },
    {
      title: 'Active Users',
      value: safeAccess(data, 'dashboardStatistics.users.activeUsers', 0),
      icon: <FaUsers />,
      change: '+7',
      color: 'border-green-500'
    },
    {
      title: 'Events This Month',
      value: safeAccess(data, 'dashboardStatistics.events.eventsThisMonth', 0),
      icon: <FaCalendarAlt />,
      change: '-3',
      color: 'border-purple-500'
    },
    {
      title: 'Pedigree Verifications',
      value: safeAccess(data, 'dashboardStatistics.pedigree.completeThreeGenPedigreePercentage', 0),
      icon: <FaChartLine />,
      change: '+25',
      color: 'border-yellow-500'
    }
  ];

  // Registration trend data
  const registrationTrend = safeAccess(data, 'registrationTrend', []) || [
    { month: 'Jan', count: 65 },
    { month: 'Feb', count: 59 },
    { month: 'Mar', count: 80 },
    { month: 'Apr', count: 81 },
    { month: 'May', count: 56 },
    { month: 'Jun', count: 72 },
    { month: 'Jul', count: 90 },
    { month: 'Aug', count: 110 }
  ];

  // Recent dogs data
  const recentDogs = safeAccess(data, 'recentDogs', []) || [];

  return (
    <div role="tabpanel" id="overview-panel" aria-labelledby="overview-tab" className="transition-opacity duration-300 ease-in-out">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statistics.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            color={stat.color}
          />
        ))}
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartSection title="Registration Trends" description="Dog registrations over time">
          <AreaChart
            data={registrationTrend}
            xKey="month"
            areaKey="count"
            color="#3B82F6"
          />
        </ChartSection>

        <ChartSection title="User Activity" description="Daily active users">
          <AreaChart
            data={[
              { day: 'Mon', users: 32 },
              { day: 'Tue', users: 45 },
              { day: 'Wed', users: 55 },
              { day: 'Thu', users: 43 },
              { day: 'Fri', users: 64 },
              { day: 'Sat', users: 38 },
              { day: 'Sun', users: 28 }
            ]}
            xKey="day"
            areaKey="users"
            color="#10B981"
          />
        </ChartSection>
      </div>

      {/* Recent Dogs Table */}
      <div className="mb-8">
        <DataTable
          title="Recently Registered Dogs"
          description="Latest dog registrations in the system"
          headers={['Name', 'Breed', 'Owner', 'Registration Date', 'Status']}
          data={recentDogs}
          loading={loading && recentDogs.length === 0}
          emptyMessage="No recent dog registrations found"
          renderRow={(dog, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{dog.name}</div>
                    <div className="text-sm text-gray-500">#{dog.registrationNumber}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{dog.breed}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{dog.owner.name}</div>
                <div className="text-sm text-gray-500">{dog.owner.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(dog.registrationDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  dog.status === 'Verified' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {dog.status}
                </span>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default OverviewTab;
