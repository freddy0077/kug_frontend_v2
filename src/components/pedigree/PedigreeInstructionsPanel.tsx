import React from 'react';

const PedigreeInstructionsPanel: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg mb-6 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">How to Create a Pedigree</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
              1
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-900">Search for a Dog</h4>
            <p className="mt-1 text-sm text-gray-600">
              Enter a dog's name or registration number in the search box below to find dogs in the database.
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
              2
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-900">Select the Dog</h4>
            <p className="mt-1 text-sm text-gray-600">
              From the search results, click on "Select" next to the dog you want to create a pedigree for.
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
              3
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-900">Customize the Pedigree</h4>
            <p className="mt-1 text-sm text-gray-600">
              Use the control panel to adjust the number of generations, layout orientation, and display options.
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
              4
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-900">Add Missing Parents</h4>
            <p className="mt-1 text-sm text-gray-600">
              For dogs with missing sires or dams in the pedigree, you can add them if you have the proper permissions.
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
              5
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-900">Save or Export</h4>
            <p className="mt-1 text-sm text-gray-600">
              Once you're satisfied with the pedigree, you can save it to the database or export it as a PDF.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> The coefficient of inbreeding (COI) is automatically calculated when viewing a pedigree. Higher COI values may indicate increased risk for hereditary health issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedigreeInstructionsPanel;
