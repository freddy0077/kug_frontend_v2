'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PedigreeChartOptions, defaultPedigreeOptions, DogPedigreeData } from '@/types/pedigree';
import { fetchAncestors, calculateInbreedingCoefficient } from '@/services/pedigreeService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';

// Import our components directly to ensure TypeScript can resolve them properly
import ModernPedigreeControls from './ModernPedigreeControls';
import ModernHorizontalPedigree from './ModernHorizontalPedigree';
import ModernVerticalPedigree from './ModernVerticalPedigree';
import ModernPedigreeCard from './ModernPedigreeCard';

interface ModernPedigreeChartProps {
  dogId: string;
  initialOptions?: Partial<PedigreeChartOptions>;
  readOnly?: boolean;
}

const ModernPedigreeChart: React.FC<ModernPedigreeChartProps> = ({ 
  dogId,
  initialOptions = {},
  readOnly = false
}) => {
  // Merge default options with any provided initial options
  const [options, setOptions] = useState<PedigreeChartOptions>({
    ...defaultPedigreeOptions,
    ...initialOptions,
    theme: initialOptions.theme || 'modern' // Default to modern theme
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ancestorsMap, setAncestorsMap] = useState<Map<string, DogPedigreeData>>(new Map());
  const [rootDog, setRootDog] = useState<DogPedigreeData | null>(null);
  const [coi, setCoi] = useState<number | null>(null);
  const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
  
  const pedigreeRef = useRef<HTMLDivElement>(null);
  
  // Fetch pedigree data when dogId or generations change
  useEffect(() => {
    const loadPedigreeData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all ancestors for the dog
        const ancestors = await fetchAncestors(dogId, options.generations);
        setAncestorsMap(ancestors);
        
        // Set the root dog
        const root = ancestors.get(dogId) || null;
        setRootDog(root);
        
        // Calculate coefficient of inbreeding
        if (root) {
          const coefficient = calculateInbreedingCoefficient(dogId, ancestors);
          setCoi(coefficient);
        }
      } catch (error) {
        console.error('Error loading pedigree data:', error);
        setError('Failed to load pedigree data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPedigreeData();
  }, [dogId, options.generations]);
  
  // Handle options change
  const handleOptionsChange = (newOptions: PedigreeChartOptions) => {
    setOptions(newOptions);
  };
  
  // Handler for adding a new parent to a dog in the pedigree
  const handleAddParent = useCallback(async (dogId: string, parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => {
    try {
      // In a real implementation, this would be an API call
      // For now, we'll update our local data
      
      // Create a copy of the current ancestors map
      const updatedAncestorsMap = new Map(ancestorsMap);
      
      // Find the dog to update
      const dogToUpdate = updatedAncestorsMap.get(dogId);
      
      if (!dogToUpdate) {
        throw new Error(`Dog with ID ${dogId} not found`);
      }
      
      // Add the parent to our map
      if (parentData.id) {
        // Create a complete DogPedigreeData object by filling in required fields
        const completeParentData: DogPedigreeData = {
          id: parentData.id,
          name: parentData.name || 'Unknown',
          breedName: parentData.breedName || dogToUpdate.breedName || 'Unknown',
          gender: parentType === 'sire' ? 'male' : 'female',
          dateOfBirth: parentData.dateOfBirth || new Date(),
          color: parentData.color || '',
          isChampion: parentData.isChampion || false,
          hasHealthTests: parentData.hasHealthTests || false,
          registrationNumber: parentData.registrationNumber || '',
          // Required fields
          ownerId: parentData.ownerId || dogToUpdate.ownerId || '',
          ownerName: parentData.ownerName || dogToUpdate.ownerName || '',
          // Optional fields
          sireId: undefined,
          damId: undefined,
          sireName: undefined,
          damName: undefined,
          sireRegistration: undefined,
          damRegistration: undefined,
          dateOfDeath: parentData.dateOfDeath
        };
        
        updatedAncestorsMap.set(parentData.id, completeParentData);
        
        // Update the dog with the parent reference
        if (parentType === 'sire') {
          dogToUpdate.sireId = parentData.id;
          dogToUpdate.sireName = parentData.name || 'Unknown';
          dogToUpdate.sireRegistration = parentData.registrationNumber || '';
        } else {
          dogToUpdate.damId = parentData.id;
          dogToUpdate.damName = parentData.name || 'Unknown';
          dogToUpdate.damRegistration = parentData.registrationNumber || '';
        }
        
        // Update the ancestors map
        updatedAncestorsMap.set(dogId, dogToUpdate);
        setAncestorsMap(updatedAncestorsMap);
        
        // Recalculate COI if needed
        if (dogId === rootDog?.id) {
          const newCoi = calculateInbreedingCoefficient(dogId, updatedAncestorsMap);
          setCoi(newCoi);
        }
        
        toast.success(`${parentType === 'sire' ? 'Sire' : 'Dam'} added successfully`);
      }
    } catch (error) {
      console.error(`Error adding ${parentType}:`, error);
      toast.error(`Failed to add ${parentType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [ancestorsMap, rootDog]);
  
  // Handler for editing an existing parent
  const handleEditParent = useCallback(async (dogId: string, parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => {
    try {
      // In a real implementation, this would be an API call
      // For now, we'll update our local data
      
      // Create a copy of the current ancestors map
      const updatedAncestorsMap = new Map(ancestorsMap);
      
      // Find the dog to update
      const dogToUpdate = updatedAncestorsMap.get(dogId);
      
      if (!dogToUpdate) {
        throw new Error(`Dog with ID ${dogId} not found`);
      }
      
      // Get the parent ID
      const parentId = parentType === 'sire' ? dogToUpdate.sireId : dogToUpdate.damId;
      
      if (!parentId) {
        throw new Error(`${parentType === 'sire' ? 'Sire' : 'Dam'} ID not found for dog ${dogId}`);
      }
      
      // Get the existing parent
      const existingParent = updatedAncestorsMap.get(parentId);
      
      if (!existingParent) {
        throw new Error(`${parentType === 'sire' ? 'Sire' : 'Dam'} with ID ${parentId} not found`);
      }
      
      // Update the parent with new data
      const updatedParent: DogPedigreeData = {
        ...existingParent,
        // Only copy over properties that exist in DogPedigreeData
        name: parentData.name || existingParent.name,
        breedName: parentData.breedName || existingParent.breedName,
        color: parentData.color || existingParent.color,
        registrationNumber: parentData.registrationNumber || existingParent.registrationNumber,
        isChampion: parentData.isChampion ?? existingParent.isChampion,
        hasHealthTests: parentData.hasHealthTests ?? existingParent.hasHealthTests,
        ownerName: parentData.ownerName || existingParent.ownerName,
        dateOfBirth: parentData.dateOfBirth || existingParent.dateOfBirth,
        dateOfDeath: parentData.dateOfDeath || existingParent.dateOfDeath,
        // Keep these fields the same
        id: parentId, // Ensure ID doesn't change
        gender: parentType === 'sire' ? 'male' : 'female', // Ensure gender remains consistent
        ownerId: existingParent.ownerId,
      };
      
      // Update our map
      updatedAncestorsMap.set(parentId, updatedParent);
      
      // Update reference fields in the dog
      if (parentType === 'sire') {
        dogToUpdate.sireName = updatedParent.name || 'Unknown';
        dogToUpdate.sireRegistration = updatedParent.registrationNumber || '';
      } else {
        dogToUpdate.damName = updatedParent.name || 'Unknown';
        dogToUpdate.damRegistration = updatedParent.registrationNumber || '';
      }
      
      // Update the dog in the map
      updatedAncestorsMap.set(dogId, dogToUpdate);
      setAncestorsMap(updatedAncestorsMap);
      
      // Recalculate COI if needed
      if (dogId === rootDog?.id) {
        const newCoi = calculateInbreedingCoefficient(dogId, updatedAncestorsMap);
        setCoi(newCoi);
      }
      
      toast.success(`${parentType === 'sire' ? 'Sire' : 'Dam'} updated successfully`);
    } catch (error) {
      console.error(`Error editing ${parentType}:`, error);
      toast.error(`Failed to edit ${parentType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [ancestorsMap, rootDog]);
  
  // Export as PDF or PNG
  const handleExport = async (type: 'pdf' | 'png') => {
    if (!pedigreeRef.current) return;
    
    try {
      setIsLoading(true);
      
      // Use html2canvas to capture the pedigree chart
      const canvas = await html2canvas(pedigreeRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      if (type === 'png') {
        // Download as PNG
        const link = document.createElement('a');
        link.download = `${rootDog?.name || 'Dog'}_Pedigree_${new Date().toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        // Create PDF with appropriate dimensions
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: options.orientation === 'horizontal' ? 'landscape' : 'portrait',
          unit: 'mm'
        });
        
        // Add the image to the PDF
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${rootDog?.name || 'Dog'}_Pedigree_${new Date().toISOString().slice(0,10)}.pdf`);
      }
    } catch (error) {
      console.error('Error exporting pedigree:', error);
      setError('Failed to export. Please try again.');
    } finally {
      setIsLoading(false);
      setShowExportOptions(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 transition-all">
      {/* Header with title and COI info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4">
        <h2 className="text-xl font-semibold">
          {rootDog ? `${rootDog.name}'s Pedigree` : 'Pedigree Chart'}
        </h2>
        {coi !== null && (
          <div className="mt-1 flex items-center">
            <div 
              className={`mr-2 text-xs rounded-full px-3 py-1 font-medium ${
                coi < 0.1 
                  ? 'bg-green-400 text-green-900' 
                  : coi < 0.25 
                    ? 'bg-yellow-400 text-yellow-900' 
                    : 'bg-red-400 text-red-900'
              }`}
            >
              COI: {(coi * 100).toFixed(2)}%
            </div>
            <span className="text-xs text-blue-100">
              {coi < 0.1 
                ? 'Low inbreeding coefficient' 
                : coi < 0.25 
                  ? 'Moderate inbreeding coefficient' 
                  : 'High inbreeding coefficient'}
            </span>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <ModernPedigreeControls 
        options={options} 
        onChange={handleOptionsChange}
        onExport={() => setShowExportOptions(!showExportOptions)}
      />
      
      {/* Export Options Dropdown */}
      {showExportOptions && (
        <div className="bg-gray-50 border-t border-b border-gray-200 px-6 py-3 flex space-x-3">
          <button
            onClick={() => handleExport('pdf')}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            Export as PDF
          </button>
          <button
            onClick={() => handleExport('png')}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            Export as Image
          </button>
        </div>
      )}
      
      {/* Pedigree Chart */}
      <div 
        ref={pedigreeRef} 
        className="print-container p-6 bg-white"
      >
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                <span className="text-blue-500 text-xs">Loading</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        ) : rootDog ? (
          options.orientation === 'horizontal' ? (
            <div className="overflow-x-auto">
              <div className="flex space-x-8 pedigree-horizontal">
                <ModernHorizontalPedigree 
                  rootNode={rootDog} 
                  maxGenerations={options.generations}
                  options={options}
                  onAddParent={!readOnly ? handleAddParent : undefined}
                  onEditParent={!readOnly ? handleEditParent : undefined}
                />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <ModernVerticalPedigree 
                rootNode={rootDog} 
                maxGenerations={options.generations}
                options={options}
                onAddParent={!readOnly ? handleAddParent : undefined}
                onEditParent={!readOnly ? handleEditParent : undefined}
              />
            </div>
          )
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-gray-600">No pedigree data available</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center">
            <span className="h-4 w-4 bg-blue-100 border border-blue-500 rounded-full mr-2"></span>
            <span className="text-gray-700">Male</span>
          </div>
          <div className="flex items-center">
            <span className="h-4 w-4 bg-pink-100 border border-pink-500 rounded-full mr-2"></span>
            <span className="text-gray-700">Female</span>
          </div>
          {options.showChampions && (
            <div className="flex items-center">
              <span className="flex items-center justify-center w-4 h-4 text-yellow-500 mr-2">★</span>
              <span className="text-gray-700">Champion</span>
            </div>
          )}
          {options.showHealthTests && (
            <div className="flex items-center">
              <span className="flex items-center justify-center w-4 h-4 bg-green-100 text-green-700 rounded-full mr-2">✓</span>
              <span className="text-gray-700">Health Tested</span>
            </div>
          )}
          <div className="flex items-center">
            <span className="flex items-center justify-center h-4 px-2 bg-yellow-100 text-yellow-800 text-xs rounded mr-2">COI</span>
            <span className="text-gray-700">Coefficient of Inbreeding</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @media print {
          .print-container {
            width: 100%;
            height: 100%;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernPedigreeChart;
