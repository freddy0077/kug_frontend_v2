// Types for pedigree related components

export interface DogPedigreeData {
  id: string;
  name: string;
  registrationNumber: string;
  breedName: string;
  color: string;
  gender: 'male' | 'female';
  dateOfBirth: Date;
  isChampion: boolean;
  hasHealthTests: boolean;
  ownerId: string;
  ownerName: string;
  sireId?: string;
  damId?: string;
  
  // Properties for parent dog information
  sireName?: string;
  sireRegistration?: string;
  damName?: string;
  damRegistration?: string;
  dateOfDeath?: Date;
}

export interface PedigreeNode {
  dog: DogPedigreeData;
  generation: number;
  position: number;
  children?: PedigreeNode[];
}

export interface PedigreeChartOptions {
  generations: number;
  orientation: 'vertical' | 'horizontal';
  showChampions: boolean;
  showHealthTests: boolean;
  showDates: boolean;
  showOwners: boolean;
  theme: 'standard' | 'classic' | 'modern' | 'minimal';
}

// Default options for pedigree chart
export const defaultPedigreeOptions: PedigreeChartOptions = {
  generations: 3,
  orientation: 'horizontal',
  showChampions: true,
  showHealthTests: true,
  showDates: true,
  showOwners: false,
  theme: 'modern'
};
