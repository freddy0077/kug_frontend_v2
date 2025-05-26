'use client';

import React, { useEffect, useState } from 'react';
import { PedigreeImport } from '@/types/pedigreeImport';
import { PedigreeImportStatus } from '@/graphql/queries/pedigreeImportQueries';
import { formatDate } from '@/utils/formatters';

interface ExtractionStepProps {
  importData: PedigreeImport | null;
  onNextStep: () => void;
  onRefresh: () => void;
}

const ExtractionStep: React.FC<ExtractionStepProps> = ({ 
  importData, 
  onNextStep,
  onRefresh 
}) => {
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // Simulate processing progress when in PROCESSING state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (importData?.status === PedigreeImportStatus.PROCESSING) {
      // Reset progress to 0
      setProcessingProgress(0);
      
      // Simulate progress increase up to 95% (final 5% will happen when extraction completes)
      interval = setInterval(() => {
        setProcessingProgress(current => {
          if (current < 95) {
            return current + Math.random() * 5;
          }
          return current;
        });
      }, 1000);
    } else if (importData?.status === PedigreeImportStatus.EXTRACTION_COMPLETE) {
      // When extraction completes, set progress to 100%
      setProcessingProgress(100);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [importData?.status]);
  
  // If no import data is available, show error
  if (!importData) {
    return (
      <div className="bg-red-50 rounded-md p-4">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <div className="mt-2 text-sm text-red-700">
          <p>No pedigree import data found. Please go back and upload a PDF.</p>
        </div>
      </div>
    );
  }
  
  // Show status based on import status
  return (
    <div className="bg-white overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Extracting Information
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            The system is analyzing the PDF and extracting dog information.
            This process may take a few minutes depending on the complexity of the document.
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="mt-5">
          <div className="relative pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                  {importData.status === PedigreeImportStatus.PROCESSING 
                    ? 'Processing' 
                    : importData.status === PedigreeImportStatus.EXTRACTION_COMPLETE
                      ? 'Extraction Complete'
                      : importData.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-green-600">
                  {Math.round(processingProgress)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mt-2 text-xs flex rounded bg-green-200">
              <div
                style={{ width: `${processingProgress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>
        
        {/* Processing details */}
        <div className="mt-5 bg-gray-50 rounded-md p-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">File Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{importData.originalFileName}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(importData.createdAt)}</dd>
            </div>
            
            {importData.status === PedigreeImportStatus.EXTRACTION_COMPLETE && importData.extractedDogs && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Dogs Detected</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {importData.extractedDogs.length} dogs found in the document
                </dd>
              </div>
            )}
            
            {importData.processingErrors && importData.processingErrors.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Processing Warnings</dt>
                <dd className="mt-1 text-sm text-red-600">
                  <ul className="list-disc pl-5 space-y-1">
                    {importData.processingErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </div>
        
        {/* Actions */}
        <div className="mt-5 flex justify-between">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg 
              className="-ml-1 mr-2 h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
                clipRule="evenodd" 
              />
            </svg>
            Refresh Status
          </button>
          
          {importData.status === PedigreeImportStatus.EXTRACTION_COMPLETE && (
            <button
              type="button"
              onClick={onNextStep}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Continue to Validation
              <svg 
                className="ml-2 -mr-1 h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtractionStep;
