import React from 'react';
import { FaDog, FaChartLine, FaCertificate, FaMars, FaVenus } from 'react-icons/fa';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATISTICS, GET_RECENT_DOGS } from '../../../graphql/queries/dashboardQueries';

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

const DogRegistrationTab: React.FC = () => {
  const { data: statsData, loading: statsLoading } = useQuery(GET_DASHBOARD_STATISTICS);
  const { data: recentDogsData, loading: recentDogsLoading } = useQuery(GET_RECENT_DOGS);
  
  // Statistics for dog registration
  const statistics = [
    {
      title: 'Total Dogs',
      value: safeAccess(statsData, 'dashboardStatistics.dogs.totalDogs', 0),
      icon: <FaDog />,
      description: 'All registered dogs',
      color: 'border-blue-500'
    },
    {
      title: 'New Registrations',
      value: safeAccess(statsData, 'dashboardStatistics.dogs.registeredThisMonth', 0),
      icon: <FaChartLine />,
      description: 'Last 30 days',
      change: '+15',
      color: 'border-green-500'
    },
    {
      title: 'Male Dogs',
      value: safeAccess(statsData, 'dashboardStatistics.dogs.maleCount', 0),
      icon: <FaMars />,
      description: safeAccess(statsData, 'dashboardStatistics.dogs.byGender[0].percentage', 0).toFixed(1) + '%',
      color: 'border-blue-400'
    },
    {
      title: 'Female Dogs',
      value: safeAccess(statsData, 'dashboardStatistics.dogs.femaleCount', 0),
      icon: <FaVenus />,
      description: safeAccess(statsData, 'dashboardStatistics.dogs.byGender[1].percentage', 0).toFixed(1) + '%',
      color: 'border-purple-400'
    },
    {
      title: 'Pending Approvals',
      value: safeAccess(statsData, 'dashboardStatistics.dogs.totalDogs', 0) - safeAccess(statsData, 'dashboardStatistics.dogs.registeredThisYear', 0),
      icon: <FaCertificate />,
      description: 'Awaiting verification',
      color: 'border-yellow-500'
    }
  ];

  // Registration trend data by breed - get top breeds (limit to top 10 for readability)
  const registrationsByBreed = safeAccess(statsData, 'dashboardStatistics.dogs.byBreed', [])
    ?.slice(0, 10).map(breed => ({
      breed: breed.breedName,
      count: breed.count,
      percentage: breed.percentage
    })) || [];

  // Recent registrations data
  const recentRegistrations = safeAccess(recentDogsData, 'dogs.items', []) || [];

  return (
    <div role="tabpanel" id="dogs-panel" aria-labelledby="dogs-tab" className="transition-opacity duration-300 ease-in-out">
      {/* Dog Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {statistics.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            change={stat.change}
            color={stat.color}
          />
        ))}
      </div>

      {/* Registration Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartSection title="Monthly Registrations" description="Dog registrations over time">
          <AreaChart
            data={safeAccess(statsData, 'dashboardStatistics.dogs.registrationsTrend', []) || [
              { month: 'Jan', count: 45 },
              { month: 'Feb', count: 52 },
              { month: 'Mar', count: 49 },
              { month: 'Apr', count: 63 },
              { month: 'May', count: 59 },
              { month: 'Jun', count: 82 },
              { month: 'Jul', count: 93 },
              { month: 'Aug', count: 101 }
            ]}
            xKey="month"
            areaKey="count"
            color="#3B82F6"
          />
        </ChartSection>

        <ChartSection title="Breed Distribution" description="Top 10 dog breeds by registration count">
          <div className="h-full flex flex-col justify-center">
            <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto px-2">
              {registrationsByBreed.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.breed}</span>
                      <span className="text-sm font-medium text-gray-700">{item.count} ({item.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-${index < 3 ? 'blue' : index < 6 ? 'indigo' : 'purple'}-${600 - (index * 50 > 300 ? 300 : index * 50)} h-2 rounded-full`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartSection>
      </div>

      {/* Gender Distribution and Litter Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartSection title="Gender Distribution" description="Distribution of dogs by gender">
          <div className="flex items-center justify-center h-64">
            <div className="flex w-full max-w-xs">
              {safeAccess(statsData, 'dashboardStatistics.dogs.byGender', [])?.map((item, index) => (
                <div key={index} className="flex-1 text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'} mb-4`}>
                    {index === 0 ? <FaMars size={32} /> : <FaVenus size={32} />}
                  </div>
                  <div className="text-xl font-bold">{item.count}</div>
                  <div className="text-sm text-gray-500">{item.gender}</div>
                  <div className="text-lg font-semibold mt-2">{item.percentage.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        </ChartSection>
        
        <ChartSection title="Litter Statistics" description="Litter registration information">
          <div className="flex flex-col h-full justify-center px-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">Total Litters</div>
                <div className="text-xl font-bold">{safeAccess(statsData, 'dashboardStatistics.litters.totalLitters', 0)}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">New This Month</div>
                <div className="text-xl font-bold">{safeAccess(statsData, 'dashboardStatistics.litters.registeredThisMonth', 0)}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">Avg. Litter Size</div>
                <div className="text-xl font-bold">{safeAccess(statsData, 'dashboardStatistics.litters.averageLitterSize', 0).toFixed(1)}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">Puppies Registered</div>
                <div className="text-xl font-bold">{safeAccess(statsData, 'dashboardStatistics.litters.puppiesRegisteredThisMonth', 0)}</div>
              </div>
            </div>
          </div>
        </ChartSection>
      </div>

      {/* Recent Registrations Table */}
      <div className="mb-8">
        <DataTable
          title="Recent Registrations"
          description="Latest dog registrations in the system"
          headers={['Name', 'Breed', 'Owner', 'Registered', 'Status', 'Actions']}
          data={recentRegistrations}
          loading={(statsLoading || recentDogsLoading) && recentRegistrations.length === 0}
          emptyMessage="No recent registrations found"
          renderRow={(registration, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{registration.dogName}</div>
                    <div className="text-sm text-gray-500">#{registration.registrationNumber}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{registration.breed}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{registration.ownerName}</div>
                <div className="text-sm text-gray-500">{registration.ownerEmail}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(registration.registrationDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  registration.status === 'Approved' 
                    ? 'bg-green-100 text-green-800' 
                    : registration.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {registration.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-3">View</a>
                {registration.status === 'Pending' && (
                  <>
                    <a href="#" className="text-green-600 hover:text-green-900 mr-3">Approve</a>
                    <a href="#" className="text-red-600 hover:text-red-900">Reject</a>
                  </>
                )}
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default DogRegistrationTab;
