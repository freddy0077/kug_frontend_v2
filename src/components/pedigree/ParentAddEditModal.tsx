'use client';

import React, { useState, useEffect } from 'react';
import { DogPedigreeData } from '@/types/pedigree';

interface ParentAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (parentData: Partial<DogPedigreeData>) => void;
  parentType: 'sire' | 'dam';
  currentData?: Partial<DogPedigreeData>;
  dogName: string;
}

const ParentAddEditModal: React.FC<ParentAddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  parentType,
  currentData,
  dogName
}) => {
  const [formData, setFormData] = useState<Partial<DogPedigreeData>>({
    id: '',
    name: '',
    registrationNumber: '',
    breedName: '',
    color: '',
    gender: parentType === 'sire' ? 'male' as const : 'female' as const,
    dateOfBirth: new Date(),
    isChampion: false,
    hasHealthTests: false,
  });

  // Initialize form with current data if available
  useEffect(() => {
    if (currentData) {
      setFormData({
        ...formData,
        ...currentData,
        // Ensure required fields have default values
        gender: parentType === 'sire' ? 'male' as const : 'female' as const,
        dateOfBirth: currentData.dateOfBirth || new Date(),
      });
    }
  }, [currentData, parentType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'dateOfBirth') {
      // Ensure we always have a valid date
      const date = new Date(value);
      const validDate = isNaN(date.getTime()) ? new Date() : date;
      setFormData({ ...formData, [name]: validDate });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a unique ID if not provided
    const dataToSave: Partial<DogPedigreeData> = {
      ...formData,
      id: formData.id || `${parentType}-${Date.now()}`,
      gender: parentType === 'sire' ? 'male' as const : 'female' as const,
    };
    
    onSave(dataToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {currentData?.id ? 'Edit' : 'Add'} {parentType === 'sire' ? 'Sire' : 'Dam'}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            for {dogName}
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Registration Number */}
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                  Registration Number
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Breed */}
              <div>
                <label htmlFor="breedName" className="block text-sm font-medium text-gray-700">
                  Breed *
                </label>
                <input
                  type="text"
                  id="breedName"
                  name="breedName"
                  value={formData.breedName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Color */}
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth instanceof Date 
                    ? formData.dateOfBirth.toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              {/* Champion Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isChampion"
                  name="isChampion"
                  checked={formData.isChampion}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isChampion" className="ml-2 block text-sm text-gray-700">
                  Champion Status
                </label>
              </div>
              
              {/* Health Tests */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasHealthTests"
                  name="hasHealthTests"
                  checked={formData.hasHealthTests}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hasHealthTests" className="ml-2 block text-sm text-gray-700">
                  Has Health Tests
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParentAddEditModal;
