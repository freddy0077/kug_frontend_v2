import React from 'react';
import { DogPedigreeData, PedigreeChartOptions } from '@/types/pedigree';

interface ModernHorizontalPedigreeProps {
  rootNode: DogPedigreeData | null;
  maxGenerations: number;
  options: PedigreeChartOptions;
}

declare const ModernHorizontalPedigree: React.FC<ModernHorizontalPedigreeProps>;

export default ModernHorizontalPedigree;
