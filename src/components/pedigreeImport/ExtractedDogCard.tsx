'use client';

import React, { useState } from 'react';
import { PedigreeExtractedDog } from '@/types/pedigreeImport';
import { formatDate } from '@/utils/formatters';

interface ExtractedDogUpdateData {
  name?: string;
  registrationNumber?: string;
  otherRegistrationNumber?: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  color?: string;
  selectedForImport?: boolean;
}

interface ExtractedDogCardProps {
  dog: PedigreeExtractedDog;
  selected: boolean;
  positionLabel: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (data: ExtractedDogUpdateData) => void;
  onToggleSelection: (selected: boolean) => void;
  saveLoading?: boolean;
  isCompact?: boolean;
}

const ExtractedDogCard: React.FC<ExtractedDogCardProps> = ({
  dog,
  selected,
  positionLabel,
  isEditing,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleSelection,
  saveLoading = false,
  isCompact = false
}) => {
  // Form state
  const [formData, setFormData] = useState<ExtractedDogUpdateData>({
    name: dog.name || '',
    registrationNumber: dog.registrationNumber || '',
    otherRegistrationNumber: dog.otherRegistrationNumber || '',
    breed: dog.breed || '',
    gender: dog.gender || '',
    dateOfBirth: dog.dateOfBirth || '',
    color: dog.color || '',
  });
  
  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle save click
  const handleSave = () => {
    onSaveEdit(formData);
  };
  
  // Calculate confidence level label and color
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'High', color: 'green' };
    if (confidence >= 0.5) return { label: 'Medium', color: 'yellow' };
    return { label: 'Low', color: 'red' };
  };
  
  const confidenceInfo = getConfidenceLevel(dog.confidence);
  
  // Show compact view for grandparents and great-grandparents
  if (isCompact) {
    return (
      <div className={`border rounded-lg overflow-hidden ${
        selected ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'
      }`}>
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id={`select-dog-${dog.id}`}
                name={`select-dog-${dog.id}`}
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                checked={selected}
                onChange={(e) => onToggleSelection(e.target.checked)}
              />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {dog.name || 'Unnamed Dog'}
                </h3>
                <p className="text-xs text-gray-500">{positionLabel}</p>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Edit
              </button>
            </div>
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div>
              <span className="text-gray-500">Reg #:</span>{' '}
              <span className="font-medium">
                {dog.registrationNumber || dog.otherRegistrationNumber || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Breed:</span>{' '}
              <span className="font-medium">{dog.breed || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-gray-500">Gender:</span>{' '}
              <span className="font-medium">{dog.gender || 'Unknown'}</span>
            </div>
            
            {dog.exists && (
              <div className="col-span-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Already in database
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Full view with edit capability
  return (
    <div className={`border rounded-lg overflow-hidden ${
      selected ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'
    }`}>
      <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <input
            id={`select-dog-${dog.id}`}
            name={`select-dog-${dog.id}`}
            type="checkbox"
            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            checked={selected}
            onChange={(e) => onToggleSelection(e.target.checked)}
          />
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              {dog.name || 'Unnamed Dog'}
            </h3>
            <p className="text-sm text-gray-500">{positionLabel}</p>
          </div>
        </div>
        
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${confidenceInfo.color}-100 text-${confidenceInfo.color}-800`}
          >
            {confidenceInfo.label} Confidence
          </span>
          
          {dog.exists && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Already in database
            </span>
          )}
        </div>
      </div>
      
      {isEditing ? (
        // Edit mode
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                Breed
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="breed"
                  id="breed"
                  className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.breed}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="registrationNumber"
                  id="registrationNumber"
                  className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="otherRegistrationNumber" className="block text-sm font-medium text-gray-700">
                Other Registration Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="otherRegistrationNumber"
                  id="otherRegistrationNumber"
                  className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.otherRegistrationNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="mt-1">
                <select
                  id="gender"
                  name="gender"
                  className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.dateOfBirth ? formData.dateOfBirth.substring(0, 10) : ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="color"
                  id="color"
                  className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={saveLoading}
            >
              {saveLoading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        // View mode
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Registration</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {dog.registrationNumber ? (
                  dog.registrationNumber
                ) : dog.otherRegistrationNumber ? (
                  <span>{dog.otherRegistrationNumber} (Other Country)</span>
                ) : (
                  'Unknown'
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Breed</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {dog.breed || 'Unknown'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {dog.gender || 'Unknown'}
              </dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {dog.dateOfBirth ? formatDate(dog.dateOfBirth) : 'Unknown'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Color</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {dog.color || 'Unknown'}
              </dd>
            </div>
          </dl>
          
          <div className="px-4 py-3 bg-white text-right sm:px-6">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Edit Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractedDogCard;
