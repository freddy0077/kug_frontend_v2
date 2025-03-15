import React from 'react';
import { PedigreeChartOptions } from '@/types/pedigree';

interface ModernPedigreeControlsProps {
  options: PedigreeChartOptions;
  onChange: (newOptions: PedigreeChartOptions) => void;
  onExport: () => void;
}

declare const ModernPedigreeControls: React.FC<ModernPedigreeControlsProps>;

export default ModernPedigreeControls;
