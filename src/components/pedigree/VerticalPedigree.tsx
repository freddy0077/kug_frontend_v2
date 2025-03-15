'use client';

import React from 'react';
import PedigreeNode from './PedigreeNode';
import { PedigreeNode as PedigreeNodeType, PedigreeChartOptions } from '@/types/pedigree';

interface VerticalPedigreeProps {
  rootNode: PedigreeNodeType | null;
  maxGenerations: number;
  options: PedigreeChartOptions;
}

const VerticalPedigree: React.FC<VerticalPedigreeProps> = ({
  rootNode,
  maxGenerations,
  options
}) => {
  if (!rootNode) {
    return <div className="text-center p-4">No pedigree data available</div>;
  }

  // Generate rows for each generation
  const rows: (PedigreeNodeType | null)[][] = [];
  
  // Function to flatten the tree into rows
  const organizeByGeneration = (node: PedigreeNodeType | null, generation: number) => {
    if (!node || generation > maxGenerations) return;
    
    // Initialize the row if it doesn't exist
    if (!rows[generation]) {
      rows[generation] = [];
    }
    
    // Add the node to its generation row
    rows[generation].push(node);
    
    // Process children (sire and dam) if they exist
    if (node?.dog && node.dog.sireId) {
      const sireNode = findNodeById(rootNode, node.dog.sireId);
      organizeByGeneration(sireNode, generation + 1);
    } else if (generation < maxGenerations) {
      // Add null placeholder for missing sire
      if (!rows[generation + 1]) rows[generation + 1] = [];
      rows[generation + 1].push(null);
    }
    
    if (node?.dog && node.dog.damId) {
      const damNode = findNodeById(rootNode, node.dog.damId);
      organizeByGeneration(damNode, generation + 1);
    } else if (generation < maxGenerations) {
      // Add null placeholder for missing dam
      if (!rows[generation + 1]) rows[generation + 1] = [];
      rows[generation + 1].push(null);
    }
  };
  
  // Start organization with the root node
  organizeByGeneration(rootNode, 0);
  
  return (
    <div className="overflow-y-auto">
      <div className="flex flex-col space-y-4 pedigree-vertical">
        {rows.map((generationNodes, genIndex) => (
          <div key={`generation-${genIndex}`} className="pedigree-row">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Generation {genIndex}
            </div>
            <div className="flex flex-wrap">
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
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .pedigree-vertical {
          min-height: ${Math.max(2, rows.length) * 160}px;
        }
        
        .pedigree-row {
          padding: 10px 0;
        }
        
        .pedigree-node-container {
          margin: 5px;
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
  
  // Check sire branch
  if (rootNode.dog.sireId) {
    const sireNode = findNodeById(rootNode, rootNode.dog.sireId);
    if (sireNode && sireNode.dog && sireNode.dog.id === id) return sireNode;
  }
  
  // Check dam branch
  if (rootNode.dog.damId) {
    const damNode = findNodeById(rootNode, rootNode.dog.damId);
    if (damNode && damNode.dog && damNode.dog.id === id) return damNode;
  }
  
  return null;
};

export default VerticalPedigree;
