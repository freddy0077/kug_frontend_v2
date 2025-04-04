"use client";

import { 
  UserIcon, 
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { UserStats as UserStatsType } from '../../users/types';

interface UserStatsProps {
  stats: UserStatsType;
}

const UserStats: React.FC<UserStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {/* Total Users Card */}
      <div className="bg-white shadow rounded-xl p-6 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
            
      {/* Active Users Card */}
      <div className="bg-white shadow rounded-xl p-6 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Users</p>
            <div className="flex items-baseline mt-1">
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="ml-2 text-sm text-green-600">{stats.percentActive}%</p>
            </div>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <UserCircleIcon className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
            
      {/* Admin Users Card */}
      <div className="bg-white shadow rounded-xl p-6 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Administrators</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.adminUsers}</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
            
      {/* Inactive Users Card */}
      <div className="bg-white shadow rounded-xl p-6 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Inactive Accounts</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactiveUsers}</p>
          </div>
          <div className="p-3 bg-amber-100 rounded-full">
            <ExclamationCircleIcon className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>
            
      {/* Recently Active Users Card */}
      <div className="bg-white shadow rounded-xl p-6 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Recently Active (7 days)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.recentlyActive}</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-full">
            <ClockIcon className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
