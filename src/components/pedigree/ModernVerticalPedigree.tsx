'use client';

import React from 'react';
import ModernPedigreeCard from './ModernPedigreeCard';
import { DogPedigreeData, PedigreeChartOptions } from '@/types/pedigree';

interface ModernVerticalPedigreeProps {
  rootNode: DogPedigreeData | null;
  maxGenerations: number;
  options: PedigreeChartOptions;
  onAddParent?: (dogId: string, parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => Promise<void>;
  onEditParent?: (dogId: string, parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => Promise<void>;
}

const ModernVerticalPedigree: React.FC<ModernVerticalPedigreeProps> = ({
  rootNode,
  maxGenerations,
  options,
  onAddParent,
  onEditParent
}) => {
  if (!rootNode) {
    return <div className="text-center p-4">No pedigree data available</div>;
  }

  // Function to build the pedigree tree recursively
  const renderPedigreeTree = (node: DogPedigreeData | null, generation: number = 0): React.ReactNode => {
    if (!node || generation > maxGenerations) {
      return (
        <div className="pedigree-node placeholder">
          <ModernPedigreeCard
            dog={null}
            theme={options.theme}
            showChampions={options.showChampions}
            showHealthTests={options.showHealthTests}
            onAddParent={onAddParent}
            onEditParent={onEditParent}
            canEditPedigree={false}
            showDates={options.showDates}
            showOwners={options.showOwners}
          />
        </div>
      );
    }

    if (generation === maxGenerations) {
      return (
        <div className="pedigree-node">
          <ModernPedigreeCard
            dog={node}
            theme={options.theme}
            showChampions={options.showChampions}
            showHealthTests={options.showHealthTests}
            showDates={options.showDates}
            showOwners={options.showOwners}
            onAddParent={onAddParent}
            onEditParent={onEditParent}
            canEditPedigree={!!onAddParent && !!onEditParent}
          />
        </div>
      );
    }

    // Create placeholders for sire and dam if they don't exist
    // Create properly typed sire node with all required fields
    const sireNode = node.sireId ? {
      id: node.sireId,
      name: node.sireName || 'Unknown Sire',
      registrationNumber: node.sireRegistration || '',
      gender: 'male' as 'male',
      breedName: node.breedName || '',
      color: '',
      dateOfBirth: new Date(),
      isChampion: false,
      hasHealthTests: false,
      ownerId: '',
      ownerName: ''
    } : null;

    // Create properly typed dam node with all required fields
    const damNode = node.damId ? {
      id: node.damId,
      name: node.damName || 'Unknown Dam',
      registrationNumber: node.damRegistration || '',
      gender: 'female' as 'female',
      breedName: node.breedName || '',
      color: '',
      dateOfBirth: new Date(),
      isChampion: false,
      hasHealthTests: false,
      ownerId: '',
      ownerName: ''
    } : null;

    return (
      <div className="vertical-tree-node">
        <div className="pedigree-node">
          <ModernPedigreeCard
            dog={node}
            theme={options.theme}
            showChampions={options.showChampions}
            showHealthTests={options.showHealthTests}
            showDates={options.showDates}
            showOwners={options.showOwners}
            onAddParent={onAddParent}
            onEditParent={onEditParent}
            canEditPedigree={!!onAddParent && !!onEditParent}
          />
        </div>
        
        {generation < maxGenerations && (
          <div className="pedigree-children">
            <div className="pedigree-parent sire">
              <div className="connector-line"></div>
              {renderPedigreeTree(sireNode, generation + 1)}
            </div>
            <div className="pedigree-parent dam">
              <div className="connector-line"></div>
              {renderPedigreeTree(damNode, generation + 1)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="vertical-pedigree-container">
      {renderPedigreeTree(rootNode)}
      
      <style jsx>{`
        .vertical-pedigree-container {
          display: flex;
          justify-content: center;
          padding: 20px 0;
          overflow-x: auto;
        }
        
        .vertical-tree-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
        }
        
        .pedigree-node {
          position: relative;
          z-index: 2;
          min-width: 200px;
        }
        
        .pedigree-children {
          display: flex;
          gap: 30px;
        }
        
        .pedigree-parent {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          padding-top: 20px;
        }
        
        .connector-line {
          position: absolute;
          top: 0;
          width: 2px;
          height: 20px;
          background-color: #d1d5db;
        }
        
        .sire:before,
        .dam:before {
          content: '';
          position: absolute;
          top: 0;
          height: 2px;
          background-color: #d1d5db;
        }
        
        .sire:before {
          right: 50%;
          width: calc(30px + 50%);
        }
        
        .dam:before {
          left: 50%;
          width: calc(30px + 50%);
        }
        
        .placeholder {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default ModernVerticalPedigree;
