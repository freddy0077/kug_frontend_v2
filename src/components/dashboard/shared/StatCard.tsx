import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  change?: number | string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, change, color }) => {
  const isPositiveChange = 
    typeof change === 'number' 
      ? change > 0 
      : typeof change === 'string' && change.startsWith('+');

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
          <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="text-2xl text-gray-400">{icon}</div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
            {change}%
          </span>
          <span className="text-xs text-gray-500 ml-2">from previous period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
