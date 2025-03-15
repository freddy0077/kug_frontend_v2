'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PedigreeChartOptions, defaultPedigreeOptions, DogPedigreeData } from '@/types/pedigree';
import { buildPedigreeTree, calculateNodePositions } from '@/utils/pedigreeUtils';
import { fetchAncestors, calculateInbreedingCoefficient } from '@/services/pedigreeService';
import PedigreeControls from './PedigreeControls';
import HorizontalPedigree from './HorizontalPedigree';
import VerticalPedigree from './VerticalPedigree';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PedigreeChartProps {
  dogId: string;
  initialOptions?: Partial<PedigreeChartOptions>;
}

const PedigreeChartV2: React.FC<PedigreeChartProps> = ({ 
  dogId,
  initialOptions = {}
}) => {
  // Merge default options with any provided initial options
  const [options, setOptions] = useState<PedigreeChartOptions>({
    ...defaultPedigreeOptions,
    ...initialOptions
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ancestorsMap, setAncestorsMap] = useState<Map<string, DogPedigreeData>>(new Map());
  const [rootDog, setRootDog] = useState<DogPedigreeData | null>(null);
  const [coi, setCoi] = useState<number | null>(null);
  
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
  
  // Print or export as PDF
  const handlePrint = async () => {
    if (!pedigreeRef.current) return;
    
    try {
      // Show a loading indicator
      setIsLoading(true);
      
      // Use html2canvas to capture the pedigree chart
      const canvas = await html2canvas(pedigreeRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Create a PDF with appropriate dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: options.orientation === 'horizontal' ? 'landscape' : 'portrait',
        unit: 'mm'
      });
      
      // Add the image to the PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Download the PDF
      pdf.save(`${rootDog?.name || 'Dog'}_Pedigree_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      {/* Controls */}
      <PedigreeControls 
        options={options} 
        onChange={handleOptionsChange}
        onPrint={handlePrint}
      />
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {rootDog ? `${rootDog.name}'s Pedigree` : 'Pedigree Chart'}
        </h2>
        {coi !== null && (
          <p className="text-sm text-gray-600 mt-1">
            Coefficient of Inbreeding: {(coi * 100).toFixed(2)}%
          </p>
        )}
      </div>
      
      {/* Pedigree Chart */}
      <div 
        ref={pedigreeRef} 
        className="print-container p-4 bg-white"
      >
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        ) : rootDog ? (
          options.orientation === 'horizontal' ? (
            <HorizontalPedigree 
              rootNode={rootDog} 
              maxGenerations={options.generations}
              options={options}
            />
          ) : (
            <VerticalPedigree 
              rootNode={rootDog} 
              maxGenerations={options.generations}
              options={options}
            />
          )
        ) : (
          <div className="text-center p-4">No pedigree data available</div>
        )}
      </div>
      
      {/* Legend */}
      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="h-3 w-3 bg-blue-100 border border-blue-500 rounded-full mr-1"></span>
            <span>Male</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 bg-pink-100 border border-pink-500 rounded-full mr-1"></span>
            <span>Female</span>
          </div>
          {options.showChampions && (
            <div className="flex items-center">
              <span className="inline-block text-yellow-500 mr-1">★</span>
              <span>Champion</span>
            </div>
          )}
          {options.showHealthTests && (
            <div className="flex items-center">
              <span className="inline-block text-green-500 mr-1">✓</span>
              <span>Health Tested</span>
            </div>
          )}
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

export default PedigreeChartV2;
