import React from 'react';
import Link from 'next/link';

interface PedigreePageHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  backLabel?: string;
}

const PedigreePageHeader: React.FC<PedigreePageHeaderProps> = ({
  title,
  subtitle = '',
  backUrl = '/pedigrees',
  backLabel = 'Back to Pedigrees'
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {title}
          </h2>
          {subtitle && (
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                {subtitle}
              </div>
            </div>
          )}
        </div>
        <div className="mt-5 flex lg:mt-0 lg:ml-4">
          <Link 
            href={backUrl}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PedigreePageHeader;
