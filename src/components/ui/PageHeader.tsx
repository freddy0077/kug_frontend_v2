import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButton?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actionButton }) => {
  return (
    <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-xl p-6 md:p-8 mb-6 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>
          {description && (
            <p className="text-green-100 text-base md:text-lg">{description}</p>
          )}
        </div>
        
        {actionButton && (
          <div className="mt-2 sm:mt-0 sm:ml-4">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
