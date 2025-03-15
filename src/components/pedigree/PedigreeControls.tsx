'use client';

import React from 'react';
import { PedigreeChartOptions, defaultPedigreeOptions } from '@/types/pedigree';

interface PedigreeControlsProps {
  options: PedigreeChartOptions;
  onChange: (options: PedigreeChartOptions) => void;
  onPrint: () => void;
}

const PedigreeControls: React.FC<PedigreeControlsProps> = ({ 
  options, 
  onChange,
  onPrint
}) => {
  const handleGenerationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...options, generations: parseInt(e.target.value) });
  };

  const handleOrientationChange = (orientation: 'horizontal' | 'vertical') => {
    onChange({ ...options, orientation });
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...options, theme: e.target.value as PedigreeChartOptions['theme'] });
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onChange({ 
      ...options, 
      [name]: checked 
    });
  };

  const handleReset = () => {
    onChange(defaultPedigreeOptions);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Pedigree Chart Options</h3>
        <div className="flex space-x-2">
          <button
            onClick={onPrint}
            className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded-md text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-1 rounded-md text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Generations
          </label>
          <select
            value={options.generations}
            onChange={handleGenerationChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
          >
            <option value={2}>2 Generations</option>
            <option value={3}>3 Generations</option>
            <option value={4}>4 Generations</option>
            <option value={5}>5 Generations</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Layout
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleOrientationChange('horizontal')}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                options.orientation === 'horizontal'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              Horizontal
            </button>
            <button
              type="button"
              onClick={() => handleOrientationChange('vertical')}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                options.orientation === 'vertical'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}
            >
              Vertical
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Theme
          </label>
          <select
            value={options.theme}
            onChange={handleThemeChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
          >
            <option value="standard">Standard</option>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <div className="flex items-center">
          <input
            id="showChampions"
            name="showChampions"
            type="checkbox"
            checked={options.showChampions}
            onChange={handleToggleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="showChampions" className="ml-2 block text-sm text-gray-700">
            Show Champions
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="showHealthTests"
            name="showHealthTests"
            type="checkbox"
            checked={options.showHealthTests}
            onChange={handleToggleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="showHealthTests" className="ml-2 block text-sm text-gray-700">
            Show Health Tests
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="showDates"
            name="showDates"
            type="checkbox"
            checked={options.showDates}
            onChange={handleToggleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="showDates" className="ml-2 block text-sm text-gray-700">
            Show Dates
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="showOwners"
            name="showOwners"
            type="checkbox"
            checked={options.showOwners}
            onChange={handleToggleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="showOwners" className="ml-2 block text-sm text-gray-700">
            Show Owners
          </label>
        </div>
      </div>
    </div>
  );
};

export default PedigreeControls;
