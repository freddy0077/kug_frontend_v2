'use client';

import React from 'react';
import { PedigreeChartOptions } from '@/types/pedigree';

interface ModernPedigreeControlsProps {
  options: PedigreeChartOptions;
  onChange: (newOptions: PedigreeChartOptions) => void;
  onExport: () => void;
}

const ModernPedigreeControls: React.FC<ModernPedigreeControlsProps> = ({
  options,
  onChange,
  onExport
}) => {
  // Handle individual option changes
  const handleChange = (field: keyof PedigreeChartOptions, value: any) => {
    onChange({
      ...options,
      [field]: value
    });
  };
  
  return (
    <div className="bg-gray-50 border-t border-b border-gray-200 px-4 py-3">
      <div className="flex flex-wrap -mx-2 items-center">
        {/* Layout Controls */}
        <div className="px-2 pb-2 w-full sm:w-auto">
          <label className="block text-xs font-medium text-gray-700 mb-1">Layout</label>
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => handleChange('orientation', 'horizontal')}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                options.orientation === 'horizontal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
              </svg>
              Horizontal
            </button>
            <button
              type="button"
              onClick={() => handleChange('orientation', 'vertical')}
              className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                options.orientation === 'vertical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
              </svg>
              Vertical
            </button>
          </div>
        </div>
        
        {/* Generations Control */}
        <div className="px-2 pb-2 w-full sm:w-auto">
          <label htmlFor="generations" className="block text-xs font-medium text-gray-700 mb-1">
            Generations
          </label>
          <div className="flex space-x-1">
            {[3, 4, 5, 6].map(gen => (
              <button
                key={`gen-${gen}`}
                type="button"
                onClick={() => handleChange('generations', gen)}
                className={`w-10 h-8 text-sm rounded-md flex items-center justify-center ${
                  options.generations === gen
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {gen}
              </button>
            ))}
          </div>
        </div>
        
        {/* Theme Selection */}
        <div className="px-2 pb-2 w-full sm:w-auto">
          <label htmlFor="theme" className="block text-xs font-medium text-gray-700 mb-1">
            Theme
          </label>
          <select
            id="theme"
            value={options.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="block w-full pl-3 pr-10 py-1.5 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        
        {/* Display Options */}
        <div className="px-2 pb-2 w-full sm:w-auto">
          <label className="block text-xs font-medium text-gray-700 mb-1">Display Options</label>
          <div className="flex flex-wrap -mx-1">
            <div className="px-1">
              <button
                type="button"
                onClick={() => handleChange('showChampions', !options.showChampions)}
                className={`px-2 py-1 text-xs rounded-md flex items-center ${
                  options.showChampions
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">★</span>
                Champions
              </button>
            </div>
            <div className="px-1">
              <button
                type="button"
                onClick={() => handleChange('showHealthTests', !options.showHealthTests)}
                className={`px-2 py-1 text-xs rounded-md flex items-center ${
                  options.showHealthTests
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">✓</span>
                Health Tests
              </button>
            </div>
            <div className="px-1">
              <button
                type="button"
                onClick={() => handleChange('showDates', !options.showDates)}
                className={`px-2 py-1 text-xs rounded-md flex items-center ${
                  options.showDates
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">📅</span>
                Dates
              </button>
            </div>
            <div className="px-1">
              <button
                type="button"
                onClick={() => handleChange('showOwners', !options.showOwners)}
                className={`px-2 py-1 text-xs rounded-md flex items-center ${
                  options.showOwners
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">👤</span>
                Owners
              </button>
            </div>
          </div>
        </div>
        
        {/* Export Button */}
        <div className="ml-auto px-2 pb-2">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

// Export the component
export default ModernPedigreeControls;
// Also export as a named export for TypeScript to better recognize it
export { ModernPedigreeControls };
