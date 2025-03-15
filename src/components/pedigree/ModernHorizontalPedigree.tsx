'use client';

import React from 'react';
import ModernPedigreeCard from './ModernPedigreeCard';
import { DogPedigreeData, PedigreeChartOptions } from '@/types/pedigree';

interface ModernHorizontalPedigreeProps {
  rootNode: DogPedigreeData | null;
  maxGenerations: number;
  options: PedigreeChartOptions;
  onAddParent?: (dogId: string, parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => Promise<void>;
  onEditParent?: (dogId: string, parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => Promise<void>;
}

const ModernHorizontalPedigree: React.FC<ModernHorizontalPedigreeProps> = ({
  rootNode,
  maxGenerations,
  options,
  onAddParent,
  onEditParent
}) => {
  if (!rootNode) {
    return <div className="text-center p-4">No pedigree data available</div>;
  }

  // Generate columns for each generation
  const columns: (DogPedigreeData | null)[][] = [];
  
  // Function to flatten the tree into columns
  const organizeByGeneration = (node: DogPedigreeData | null, generation: number) => {
    if (!node || generation > maxGenerations) return;
    
    // Initialize the column if it doesn't exist
    if (!columns[generation]) {
      columns[generation] = [];
    }
    
    // Add the node to its generation column
    columns[generation].push(node);
    
    // Process parent nodes (sire and dam) if they exist
    const sireId = node?.sireId;
    const damId = node?.damId;
    
    if (sireId) {
      // Fetch sire data from pedigree service
      // For now, we'll create a placeholder
      // Create a properly typed sire node with required fields
      const sireNode: DogPedigreeData = {
        id: sireId,
        name: node?.sireName || 'Unknown Sire',
        registrationNumber: node?.sireRegistration || '',
        gender: 'male' as 'male',
        breedName: node?.breedName || '',
        color: '',
        dateOfBirth: new Date(),
        isChampion: false,
        hasHealthTests: false,
        ownerId: '',
        ownerName: ''
      };
      
      organizeByGeneration(sireNode, generation + 1);
    } else {
      // Add null placeholder for missing sire
      if (!columns[generation + 1]) columns[generation + 1] = [];
      columns[generation + 1].push(null);
    }
    
    if (damId) {
      // Fetch dam data from pedigree service
      // For now, we'll create a placeholder
      // Create a properly typed dam node with required fields
      const damNode: DogPedigreeData = {
        id: damId,
        name: node?.damName || 'Unknown Dam',
        registrationNumber: node?.damRegistration || '',
        gender: 'female' as 'female',
        breedName: node?.breedName || '',
        color: '',
        dateOfBirth: new Date(),
        isChampion: false,
        hasHealthTests: false,
        ownerId: '',
        ownerName: ''
      };
      
      organizeByGeneration(damNode, generation + 1);
    } else {
      // Add null placeholder for missing dam
      if (!columns[generation + 1]) columns[generation + 1] = [];
      columns[generation + 1].push(null);
    }
  };
  
  // Start organization with the root node
  organizeByGeneration(rootNode, 0);
  
  // Calculate spacing based on the number of dogs in the last generation
  const lastGenIndex = columns.length - 1;
  const lastGenCount = lastGenIndex >= 0 ? columns[lastGenIndex].length : 0;
  const pedigreeHeight = Math.max(300, lastGenCount * 140); // Minimum height of 300px
  
  return (
    <div className="relative overflow-x-auto overflow-y-auto">
      <div className="flex pedigree-horizontal">
        {columns.map((generationNodes, genIndex) => {
          // Calculate the height of the container based on the number of nodes
          const nodeCount = generationNodes.length;
          const nodeHeight = pedigreeHeight / nodeCount;
          
          return (
            <div key={`generation-${genIndex}`} className="flex flex-col generation-column">
              {generationNodes.map((dog, nodeIndex) => (
                <div 
                  key={`node-${genIndex}-${nodeIndex}`} 
                  className="pedigree-node-container"
                  style={{ height: `${nodeHeight}px` }}
                >
                  <div className="pedigree-node-content">
                    {/* For non-root nodes, draw connecting lines */}
                    {genIndex > 0 && (
                      <div className="pedigree-connector">
                        <div className={`h-line ${nodeIndex % 2 === 0 ? 'top-line' : 'bottom-line'}`}></div>
                      </div>
                    )}
                    
                    <ModernPedigreeCard 
                      dog={dog} 
                      theme={options.theme}
                      showChampions={options.showChampions}
                      showHealthTests={options.showHealthTests}
                      showDates={options.showDates}
                      onAddParent={onAddParent}
                      onEditParent={onEditParent}
                      canEditPedigree={!!onAddParent && !!onEditParent}
                      showOwners={options.showOwners}
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .pedigree-horizontal {
          min-width: ${Math.max(2, columns.length) * 275}px;
          position: relative;
        }
        
        .generation-column {
          min-width: 250px;
          margin-right: 24px;
          position: relative;
        }
        
        .pedigree-node-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 10px 0;
        }
        
        .pedigree-node-content {
          position: relative;
          z-index: 2;
        }
        
        .pedigree-connector {
          position: absolute;
          left: -24px;
          top: 0;
          bottom: 0;
          width: 24px;
          display: flex;
          align-items: center;
          z-index: 1;
        }
        
        .h-line {
          height: 2px;
          width: 100%;
          background-color: #d1d5db;
          position: relative;
        }
        
        .h-line::before {
          content: '';
          position: absolute;
          left: 0;
          height: 100%;
          width: 100%;
          background-color: #d1d5db;
        }
        
        .top-line::before {
          top: 0;
          height: 50vh;
          border-bottom-left-radius: 8px;
          border-left: 2px solid #d1d5db;
        }
        
        .bottom-line::before {
          bottom: 0;
          height: 50vh;
          border-top-left-radius: 8px;
          border-left: 2px solid #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default ModernHorizontalPedigree;
