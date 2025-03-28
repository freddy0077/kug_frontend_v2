import React from 'react';
import { FaCalendarAlt, FaHeartbeat, FaTrophy, FaUserMd, FaSyringe } from 'react-icons/fa';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATISTICS, GET_RECENT_HEALTH_RECORDS } from '../../../graphql/queries/dashboardQueries';

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

const EventsHealthTab: React.FC = () => {
  const { data: statsData, loading: statsLoading } = useQuery(GET_DASHBOARD_STATISTICS);
  const { data: healthData, loading: healthLoading } = useQuery(GET_RECENT_HEALTH_RECORDS);
  
  // Statistics for events and health
  const statistics = [
    {
      title: 'Upcoming Events',
      value: safeAccess(statsData, 'dashboardStatistics.events.upcomingEvents', 0),
      icon: <FaCalendarAlt />,
      description: 'Next 30 days',
      color: 'border-purple-500'
    },
    {
      title: 'Health Records',
      value: safeAccess(statsData, 'dashboardStatistics.health.totalRecords', 0),
      icon: <FaHeartbeat />,
      description: 'Total records',
      color: 'border-red-500'
    },
    {
      title: 'Competitions',
      value: safeAccess(statsData, 'dashboardStatistics.events.totalEvents', 0),
      icon: <FaTrophy />,
      description: 'Total events',
      color: 'border-yellow-500'
    },
    {
      title: 'Vaccinations',
      value: safeAccess(statsData, 'dashboardStatistics.health.vaccinationsCount', 0),
      icon: <FaSyringe />,
      description: 'Total administered',
      color: 'border-green-500'
    },
    {
      title: 'Veterinarians',
      value: safeAccess(statsData, 'dashboardStatistics.health.uniqueVets', 0),
      icon: <FaUserMd />,
      description: 'Registered vets',
      color: 'border-blue-500'
    }
  ];

  // Recent health records
  const recentHealthRecords = safeAccess(healthData, 'recentHealthRecords', []) || [];
  
  // Upcoming events
  const upcomingEvents = safeAccess(statsData, 'dashboardStatistics.events.upcomingEvents', []) || [];

  return (
    <div role="tabpanel" id="events-panel" aria-labelledby="events-tab" className="transition-opacity duration-300 ease-in-out">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {/* Charts and Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartSection title="Health Record Types" description="Distribution of health records by type">
          <div className="flex items-center justify-center h-full">
            <div className="grid grid-cols-1 gap-4 w-full max-w-md">
              {safeAccess(statsData, 'dashboardStatistics.health.byType', []).map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-medium text-gray-700">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${['blue', 'green', 'yellow', 'red', 'purple'][index % 5]}-500 h-2 rounded-full`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartSection>

        <ChartSection title="Event Participation" description="Competition and event participation">
          <AreaChart
            data={safeAccess(statsData, 'dashboardStatistics.events.participationTrend', [])}
            xKey="date"
            areaKey="count"
            color="#8B5CF6"
          />
        </ChartSection>
      </div>

      {/* Recent Health Records Table */}
      <div className="mb-8">
        <DataTable
          title="Recent Health Records"
          description="Latest health records in the system"
          headers={['Dog', 'Type', 'Date', 'Veterinarian', 'Status']}
          data={recentHealthRecords}
          loading={healthLoading && recentHealthRecords.length === 0}
          emptyMessage="No recent health records found"
          renderRow={(record, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{record.dogName}</div>
                    <div className="text-sm text-gray-500">#{record.dogId}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{record.type}</div>
                <div className="text-sm text-gray-500">{record.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{record.veterinarian}</div>
                <div className="text-sm text-gray-500">{record.clinic}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  record.status === 'Completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.status}
                </span>
              </td>
            </tr>
          )}
        />
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <DataTable
          title="Upcoming Events"
          description="Scheduled events and competitions"
          headers={['Event', 'Type', 'Date', 'Location', 'Participants', 'Status']}
          data={upcomingEvents}
          loading={statsLoading && upcomingEvents.length === 0}
          emptyMessage="No upcoming events found"
          renderRow={(event, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{event.name}</div>
                <div className="text-sm text-gray-500">#{event.id}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  event.type === 'Competition' 
                    ? 'bg-purple-100 text-purple-800' 
                    : event.type === 'Exhibition'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                }`}>
                  {event.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(event.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{event.location}</div>
                <div className="text-sm text-gray-500">{event.address}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {event.participants}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  event.status === 'Open' 
                    ? 'bg-green-100 text-green-800' 
                    : event.status === 'Full'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {event.status}
                </span>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default EventsHealthTab;
