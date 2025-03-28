import React from 'react';

interface ChartSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const ChartSection: React.FC<ChartSectionProps> = ({ title, description, children }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default ChartSection;
