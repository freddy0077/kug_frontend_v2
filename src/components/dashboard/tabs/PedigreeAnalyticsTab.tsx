import React from 'react';
import { FaSitemap, FaDna, FaChartPie, FaPercentage, FaChartLine } from 'react-icons/fa';
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

const PedigreeAnalyticsTab: React.FC = () => {
  const { data, loading } = useQuery(GET_DASHBOARD_STATISTICS);
  
  // Statistics for pedigree analytics
  const statistics = [
    {
      title: 'Complete Pedigrees',
      value: safeAccess(data, 'dashboardStatistics.pedigree.pedigreeCompleteness.complete', 0),
      icon: <FaSitemap />,
      description: safeAccess(data, 'dashboardStatistics.pedigree.pedigreeCompleteness.completePercentage', 0).toFixed(1) + '%',
      color: 'border-indigo-500'
    },
    {
      title: 'Avg. Generation Depth',
      value: safeAccess(data, 'dashboardStatistics.pedigree.averageGenerations', 0).toFixed(1),
      icon: <FaChartPie />,
      description: 'Max: ' + safeAccess(data, 'dashboardStatistics.pedigree.maxGenerations', 0),
      color: 'border-blue-500'
    },
    {
      title: 'Inbreeding Coefficient',
      value: safeAccess(data, 'dashboardStatistics.pedigree.averageInbreedingCoefficient', 0).toFixed(1) + '%',
      icon: <FaPercentage />,
      description: 'Average across breed',
      color: 'border-red-500'
    }
  ];

  // Top breed lines
  const topBreedLines = safeAccess(data, 'topBreedLines', []) || [];

  // Genetic health data
  const geneticHealthData = safeAccess(data, 'geneticHealthData', []) || [];

  return (
    <div role="tabpanel" id="pedigree-panel" aria-labelledby="pedigree-tab" className="transition-opacity duration-300 ease-in-out">
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

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ChartSection title="Pedigree Completeness" description="Distribution of pedigree completeness">
          <div className="flex items-center justify-center h-full">
            <div className="grid grid-cols-1 gap-4 w-full max-w-md">
              {[
                { 
                  label: 'Complete', 
                  value: safeAccess(data, 'dashboardStatistics.pedigree.pedigreeCompleteness.completePercentage', 0).toFixed(1) + '%', 
                  count: safeAccess(data, 'dashboardStatistics.pedigree.pedigreeCompleteness.complete', 0), 
                  color: 'bg-green-500' 
                },
                { 
                  label: 'Partial', 
                  value: safeAccess(data, 'dashboardStatistics.pedigree.pedigreeCompleteness.partialPercentage', 0).toFixed(1) + '%', 
                  count: safeAccess(data, 'dashboardStatistics.pedigree.pedigreeCompleteness.partial', 0), 
                  color: 'bg-blue-500' 
                },
                { 
                  label: 'Missing', 
                  value: safeAccess(data, 'dashboardStatistics.pedigree.pedigreeCompleteness.missingPercentage', 0).toFixed(1) + '%', 
                  count: safeAccess(data, 'dashboardStatistics.pedigree.pedigreeCompleteness.missing', 0), 
                  color: 'bg-yellow-500' 
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-medium text-gray-700">{item.count} ({item.value})</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full`} 
                        style={{ width: item.value }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartSection>

        <ChartSection title="Genetic Health Trends" description="Genetic health markers over time">
          <AreaChart
            data={safeAccess(data, 'geneticHealthTrends', []) || [
              { year: '2016', healthIndex: 72 },
              { year: '2017', healthIndex: 75 },
              { year: '2018', healthIndex: 79 },
              { year: '2019', healthIndex: 82 },
              { year: '2020', healthIndex: 85 },
              { year: '2021', healthIndex: 87 },
              { year: '2022', healthIndex: 89 },
              { year: '2023', healthIndex: 92 }
            ]}
            xKey="year"
            areaKey="healthIndex"
            color="#8B5CF6"
          />
        </ChartSection>
      </div>

      {/* Top Breed Lines Table */}
      <div className="mb-8">
        <DataTable
          title="Top Breed Lines"
          description="Most prominent breeding lines in the registry"
          headers={['Line Name', 'Origin', 'Dogs', 'Avg. Health Index', 'Genetic Diversity']}
          data={topBreedLines}
          loading={loading && topBreedLines.length === 0}
          emptyMessage="No breed line data available"
          renderRow={(line, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{line.name}</div>
                <div className="text-sm text-gray-500">Est. {line.established}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{line.origin}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {line.dogCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`${
                        line.healthIndex > 85 
                          ? 'bg-green-500' 
                          : line.healthIndex > 70 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      } h-2 rounded-full`} 
                      style={{ width: `${line.healthIndex}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900">{line.healthIndex}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  line.geneticDiversity === 'High' 
                    ? 'bg-green-100 text-green-800' 
                    : line.geneticDiversity === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {line.geneticDiversity}
                </span>
              </td>
            </tr>
          )}
        />
      </div>

      {/* Genetic Health Issues */}
      <div className="mb-8">
        <DataTable
          title="Genetic Health Monitoring"
          description="Tracked genetic health issues in the breed"
          headers={['Condition', 'Affected %', 'Carrier %', 'Trend', 'Severity', 'Screening']}
          data={geneticHealthData}
          loading={loading && geneticHealthData.length === 0}
          emptyMessage="No genetic health data available"
          renderRow={(condition, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{condition.name}</div>
                <div className="text-sm text-gray-500">{condition.geneticMarker}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {condition.affectedPercentage}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {condition.carrierPercentage}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  condition.trend === 'Decreasing' 
                    ? 'bg-green-100 text-green-800' 
                    : condition.trend === 'Stable'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {condition.trend}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  condition.severity === 'Low' 
                    ? 'bg-green-100 text-green-800' 
                    : condition.severity === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {condition.severity}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {condition.screeningAvailable ? 'Available' : 'Not Available'}
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
};

export default PedigreeAnalyticsTab;
