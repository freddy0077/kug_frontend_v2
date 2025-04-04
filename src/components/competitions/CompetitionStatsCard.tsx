'use client';

import React from 'react';
import { useDogCompetitionStats } from '@/hooks/useCompetitions';
import { format } from 'date-fns';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompetitionStatsCardProps {
  dogId: string;
}

export const CompetitionStatsCard: React.FC<CompetitionStatsCardProps> = ({ dogId }) => {
  const { stats, loading, error } = useDogCompetitionStats(dogId);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm h-60 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-center text-red-500">
        <p>Error loading competition stats: {error.message}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-center">
        <p className="text-gray-500">No competition stats available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Competition Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Total Competitions</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalCompetitions}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Total Wins</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalWins}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Win Percentage</p>
          <p className="text-3xl font-bold text-gray-800">
            {stats.totalCompetitions > 0 
              ? Math.round((stats.totalWins / stats.totalCompetitions) * 100) 
              : 0}%
          </p>
        </div>
      </div>

      {stats.pointsByCategory.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Points by Category</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.pointsByCategory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" fill="#4ade80" name="Points" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {stats.recentResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentResults.map((result) => (
                  <tr key={result.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(result.eventDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{result.eventName}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{result.category}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{result.rank}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{result.points}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <Link href={`/competitions/${result.id}`} className="text-green-600 hover:text-green-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionStatsCard;
