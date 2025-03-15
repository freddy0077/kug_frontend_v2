'use client';

import React from 'react';
import PedigreeChartV2 from '@/components/pedigree/PedigreeChartV2';
import { PedigreeChartOptions } from '@/types/pedigree';

interface SamplePedigreePanelProps {
  options: PedigreeChartOptions;
  sampleCOI: number | null;
  onHideSample: () => void;
}

const SamplePedigreePanel: React.FC<SamplePedigreePanelProps> = ({
  options,
  sampleCOI,
  onHideSample,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Sample Pedigree Chart</h3>
        <div>
          <button 
            onClick={onHideSample}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            Hide Sample
          </button>
        </div>
      </div>
      
      <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              This is a sample pedigree to demonstrate how the visualization works. You can customize the display using the controls, and export the pedigree as a PDF.
            </p>
          </div>
        </div>
      </div>
      
      <div className="sample-pedigree-container">
        <PedigreeChartV2 
          dogId="dog-root"
          initialOptions={options}
        />
      </div>
      
      {sampleCOI !== null && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-md font-medium text-gray-700">Coefficient of Inbreeding</h4>
          <p className="text-sm text-gray-600">
            The COI for this sample pedigree is {(sampleCOI * 100).toFixed(2)}%. This measures the probability that two alleles at any given gene locus are identical by descent.
          </p>
        </div>
      )}
    </div>
  );
};

export default SamplePedigreePanel;
