import React, { useEffect, useState } from 'react';

// Define the health record type using correct field names as per memory
interface HealthRecord {
  id: string;
  dogId: string;
  date: Date;
  // Using 'description' instead of 'diagnosis' as per memory
  description: string;
  // Using 'results' instead of 'test_results' as per memory
  results: string;
  veterinarianId: string;
  attachments: string[];
  detailedResults?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface HealthStatisticsProps {
  healthRecords: HealthRecord[];
  dogName: string;
}

interface HealthScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface HealthMetric {
  label: string;
  value: string | number;
  status: 'good' | 'fair' | 'poor';
}

const HealthStatistics: React.FC<HealthStatisticsProps> = ({ healthRecords, dogName }) => {
  const [scores, setScores] = useState<HealthScore[]>([]);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [overallHealth, setOverallHealth] = useState<number>(0);
  const [testCoverage, setTestCoverage] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (healthRecords.length === 0) {
      return;
    }

    // Calculate health scores
    calculateHealthScores();
    // Calculate health metrics
    calculateHealthMetrics();
    // Generate recommendations
    generateRecommendations();
    // Calculate test coverage
    calculateTestCoverage();
  }, [healthRecords]);

  const calculateHealthScores = () => {
    // Group health records by category (description field)
    const recordsByCategory = healthRecords.reduce((acc, record) => {
      if (!acc[record.description]) {
        acc[record.description] = [];
      }
      acc[record.description].push(record);
      return acc;
    }, {} as Record<string, HealthRecord[]>);

    // Calculate score for each category
    const newScores = Object.entries(recordsByCategory).map(([category, records]) => {
      const scoreValues: Record<string, number> = {
        'Excellent': 5,
        'Good': 4,
        'Fair': 3,
        'Poor': 2,
        'Failed': 1,
        'Normal': 5,
        'At Risk': 3,
        'Affected': 1
      };

      // Get the most recent record for this category
      const sortedRecords = [...records].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const latestRecord = sortedRecords[0];
      const result = latestRecord.results;
      const score = scoreValues[result] || 3;
      
      return {
        category,
        score,
        maxScore: 5,
        percentage: (score / 5) * 100
      };
    });

    setScores(newScores);

    // Calculate overall health percentage
    if (newScores.length > 0) {
      const totalScore = newScores.reduce((sum, score) => sum + score.score, 0);
      const totalMaxScore = newScores.reduce((sum, score) => sum + score.maxScore, 0);
      setOverallHealth((totalScore / totalMaxScore) * 100);
    }
  };

  const calculateHealthMetrics = () => {
    // Calculate metrics like average test result, trend over time, etc.
    const newMetrics: HealthMetric[] = [];

    // Average health score metric
    const avgScore = overallHealth;
    newMetrics.push({
      label: 'Average Health Score',
      value: `${avgScore.toFixed(1)}%`,
      status: avgScore >= 80 ? 'good' : avgScore >= 60 ? 'fair' : 'poor'
    });

    // Most recent test date
    if (healthRecords.length > 0) {
      const sortedRecords = [...healthRecords].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const latestDate = new Date(sortedRecords[0].date);
      const daysSinceLastTest = Math.floor((new Date().getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      newMetrics.push({
        label: 'Days Since Last Test',
        value: daysSinceLastTest,
        status: daysSinceLastTest <= 180 ? 'good' : daysSinceLastTest <= 365 ? 'fair' : 'poor'
      });
    }

    // Test frequency metric
    if (healthRecords.length > 1) {
      const sortedDates = healthRecords
        .map(record => new Date(record.date).getTime())
        .sort((a, b) => b - a);
      
      const intervals = [];
      for (let i = 0; i < sortedDates.length - 1; i++) {
        intervals.push((sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24));
      }
      
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      
      newMetrics.push({
        label: 'Average Test Interval',
        value: `${Math.round(avgInterval)} days`,
        status: avgInterval <= 180 ? 'good' : avgInterval <= 365 ? 'fair' : 'poor'
      });
    }

    setMetrics(newMetrics);
  };

  const calculateTestCoverage = () => {
    // Define essential health tests for breeding dogs
    const essentialTests = ['Hip Dysplasia', 'Elbow Dysplasia', 'Eye Examination', 'Cardiac Examination', 'DNA Tests'];
    
    // Get unique test types from records
    const completedTests = [...new Set(healthRecords.map(r => r.description))];
    
    // Calculate percentage of essential tests covered
    const coverage = essentialTests.filter(test => 
      completedTests.some(completed => completed.includes(test))
    ).length / essentialTests.length * 100;
    
    setTestCoverage(coverage);
  };

  const generateRecommendations = () => {
    const newRecommendations: string[] = [];
    
    // Add recommendations based on health metrics
    if (overallHealth < 70) {
      newRecommendations.push('Consider additional health testing to improve overall health score.');
    }
    
    if (testCoverage < 80) {
      newRecommendations.push('Complete recommended health tests to ensure comprehensive genetic health profile.');
    }
    
    // Check if hip dysplasia tests are available
    const hipTests = healthRecords.filter(r => r.description.toLowerCase().includes('hip'));
    if (hipTests.length === 0) {
      newRecommendations.push('Hip dysplasia testing is recommended for breeding dogs.');
    } else {
      const latestHipTest = hipTests.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      if (latestHipTest.results.toLowerCase() === 'fair' || latestHipTest.results.toLowerCase() === 'poor') {
        newRecommendations.push('Consider pairing with a mate that has excellent hip scores to improve offspring health.');
      }
    }
    
    // Check date of most recent test
    const sortedRecords = [...healthRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (sortedRecords.length > 0) {
      const latestDate = new Date(sortedRecords[0].date);
      const daysSinceLastTest = Math.floor((new Date().getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastTest > 365) {
        newRecommendations.push('Annual health testing is recommended. Schedule new tests soon.');
      }
    }
    
    setRecommendations(newRecommendations);
  };

  const getHealthScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (healthRecords.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Health Statistics</h3>
        <p className="mt-2 text-sm text-gray-500">No health records available for statistics.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Health Statistics for {dogName}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Based on {healthRecords.length} health records
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          {/* Overall Health Score */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-2">Overall Health Score</h4>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    overallHealth >= 80 ? 'bg-green-600' : 
                    overallHealth >= 60 ? 'bg-yellow-500' : 'bg-red-600'
                  }`}
                  style={{ width: `${overallHealth}%` }}
                ></div>
              </div>
              <span className={`ml-2 font-semibold ${getHealthScoreColor(overallHealth)}`}>
                {overallHealth.toFixed(1)}%
              </span>
            </div>
          </div>
          
          {/* Test Coverage */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-2">Health Test Coverage</h4>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    testCoverage >= 80 ? 'bg-green-600' : 
                    testCoverage >= 50 ? 'bg-yellow-500' : 'bg-red-600'
                  }`}
                  style={{ width: `${testCoverage}%` }}
                ></div>
              </div>
              <span className={`ml-2 font-semibold ${getHealthScoreColor(testCoverage)}`}>
                {testCoverage.toFixed(1)}%
              </span>
            </div>
          </div>
          
          {/* Health Metrics */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3">Health Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-lg font-semibold">{metric.value}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                      {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Detailed Health Scores */}
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-3">Health Test Results</h4>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Test Type</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {scores.map((score, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{score.category}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{score.score}/{score.maxScore}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          score.percentage >= 80 ? 'bg-green-100 text-green-800' : 
                          score.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {score.percentage >= 80 ? 'Good' : score.percentage >= 60 ? 'Fair' : 'Poor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-3">Recommendations</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthStatistics;
