'use client';

import React from 'react';

interface DogStatisticsCardProps {
  stats: {
    total: number;
    maleCount: number;
    femaleCount: number;
    breedCounts: { breed: string; count: number }[];
    recentRegistrations: number;
  };
}

export default function DogStatisticsCard({ stats }: DogStatisticsCardProps) {
  const getTopBreeds = () => {
    return [...stats.breedCounts]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Registry Statistics
        </h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-blue-800 truncate">
                  Total Dogs
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-900">
                  {stats.total}
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-green-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-green-800 truncate">
                  Male Dogs
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-900">
                  {stats.maleCount} <span className="text-sm">({((stats.maleCount / stats.total) * 100).toFixed(1)}%)</span>
                </dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-pink-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-pink-800 truncate">
                  Female Dogs
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-pink-900">
                  {stats.femaleCount} <span className="text-sm">({((stats.femaleCount / stats.total) * 100).toFixed(1)}%)</span>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="mt-5">
          <h4 className="text-sm font-medium text-gray-500">Top Breeds</h4>
          <div className="mt-2">
            {getTopBreeds().map((breed, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{breed.breed}</span>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {breed.count} dogs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-5">
          <h4 className="text-sm font-medium text-gray-500">Recent Activity</h4>
          <div className="mt-2">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">New Registrations (Past 30 Days)</span>
              </div>
              <div className="ml-3 flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {stats.recentRegistrations} dogs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
