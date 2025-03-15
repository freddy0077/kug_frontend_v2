'use client';

import React from 'react';
import PedigreeNode from './PedigreeNode';
import { PedigreeNode as PedigreeNodeType, PedigreeChartOptions } from '@/types/pedigree';

interface HorizontalPedigreeProps {
  rootNode: PedigreeNodeType | null;
  maxGenerations: number;
  options: PedigreeChartOptions;
}

const HorizontalPedigree: React.FC<HorizontalPedigreeProps> = ({
  rootNode,
  maxGenerations,
  options
}) => {
  if (!rootNode) {
    return <div className="text-center p-4">No pedigree data available</div>;
  }

  // Generate columns for each generation
  const columns: (PedigreeNodeType | null)[][] = [];
  
  // Function to flatten the tree into columns
  const organizeByGeneration = (node: PedigreeNodeType | null, generation: number) => {
    if (!node || generation > maxGenerations) return;
    
    // Initialize the column if it doesn't exist
    if (!columns[generation]) {
      columns[generation] = [];
    }
    
    // Add the node to its generation column
    columns[generation].push(node);
    
    // Process children (sire and dam) if they exist
    if (node?.dog && node.dog.sireId) {
      const sireNode = findNodeById(rootNode, node.dog.sireId);
      organizeByGeneration(sireNode, generation + 1);
    } else {
      // Add null placeholder for missing sire
      if (!columns[generation + 1]) columns[generation + 1] = [];
      columns[generation + 1].push(null);
    }
    
    if (node?.dog && node.dog.damId) {
      const damNode = findNodeById(rootNode, node.dog.damId);
      organizeByGeneration(damNode, generation + 1);
    } else {
      // Add null placeholder for missing dam
      if (!columns[generation + 1]) columns[generation + 1] = [];
      columns[generation + 1].push(null);
    }
  };
  
  // Start organization with the root node
  organizeByGeneration(rootNode, 0);
  
  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 pedigree-horizontal">
        {columns.map((generationNodes, genIndex) => (
          <div key={`generation-${genIndex}`} className="flex flex-col space-y-4">
            {generationNodes.map((dog, nodeIndex) => (
              <div key={`node-${genIndex}-${nodeIndex}`} className="pedigree-node-container">
                <PedigreeNode 
                  dog={dog ? dog.dog : null} 
                  generation={genIndex}
                  theme={options.theme}
                  showChampions={options.showChampions}
                  showHealthTests={options.showHealthTests}
                  showDates={options.showDates}
                  showOwners={options.showOwners}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .pedigree-horizontal {
          min-width: ${Math.max(2, columns.length) * 180}px;
        }
        
        .pedigree-node-container {
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

// Helper function to find a node by ID in the pedigree tree
const findNodeById = (rootNode: PedigreeNodeType, id: string): PedigreeNodeType | null => {
  if (!rootNode || !rootNode.dog) return null;
  
  if (rootNode.dog.id === id) {
    return rootNode;
  }
  
  // Search in children
  if (rootNode.dog.sireId) {
    const sireNode = findNodeById(rootNode, rootNode.dog.sireId);
    if (sireNode && sireNode.dog && sireNode.dog.id === id) return sireNode;
  }
  
  if (rootNode.dog.damId) {
    const damNode = findNodeById(rootNode, rootNode.dog.damId);
    if (damNode && damNode.dog && damNode.dog.id === id) return damNode;
  }
  
  return null;
};

export default HorizontalPedigree;
