import { PedigreeImportStatus } from '@/graphql/queries/pedigreeImportQueries';

// User type (simplified for reference)
export interface User {
  id: string;
  fullName: string;
  email: string;
}

// Dog type (simplified for reference)
export interface Dog {
  id: string;
  name: string;
  registrationNumber?: string;
  otherRegistrationNumber?: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  color?: string;
  mainImageUrl?: string;
}

// Main import record
export interface PedigreeImport {
  id: string;
  userId: string;
  user?: User;
  originalFileName: string;
  status: PedigreeImportStatus;
  processingErrors?: string[];
  extractedText?: string;
  extractedDogs?: PedigreeExtractedDog[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Each extracted dog from the pedigree
export interface PedigreeExtractedDog {
  id: string;
  pedigreeImportId: string;
  pedigreeImport?: PedigreeImport;
  position: string; // Corresponds to position in the pedigree (e.g., "sire", "damSire", etc.)
  name?: string;
  registrationNumber?: string;
  otherRegistrationNumber?: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  color?: string;
  confidence: number; // Confidence score of the extraction (0-1)
  exists: boolean; // Whether this dog already exists in the system
  existingDogId?: string;
  existingDog?: Dog;
  selectedForImport: boolean;
  dogId?: string;
  createdDog?: Dog;
  createdAt: string;
  updatedAt: string;
}

// Paginated results for pedigree imports
export interface PaginatedPedigreeImports {
  totalCount: number;
  hasMore: boolean;
  items: PedigreeImport[];
}

// Result of batch import operation
export interface BatchImportResult {
  success: boolean;
  message?: string;
  importedDogs?: Dog[];
  errors?: string[];
}

// Pedigree position mapping - maps position strings to their meaning in the UI
export const PEDIGREE_POSITION_LABELS: Record<string, string> = {
  'dog': 'Main Dog',
  'sire': 'Father',
  'dam': 'Mother',
  'sireSire': 'Paternal Grandfather',
  'sireDam': 'Paternal Grandmother',
  'damSire': 'Maternal Grandfather',
  'damDam': 'Maternal Grandmother',
  'sireSireSire': 'Paternal Great-Grandfather (Sire Side)',
  'sireSireDam': 'Paternal Great-Grandmother (Sire Side)',
  'sireDamSire': 'Paternal Great-Grandfather (Dam Side)',
  'sireDamDam': 'Paternal Great-Grandmother (Dam Side)',
  'damSireSire': 'Maternal Great-Grandfather (Sire Side)',
  'damSireDam': 'Maternal Great-Grandmother (Sire Side)',
  'damDamSire': 'Maternal Great-Grandfather (Dam Side)',
  'damDamDam': 'Maternal Great-Grandmother (Dam Side)',
};
