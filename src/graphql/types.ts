// GraphQL type definitions
// These types represent the shape of data in the GraphQL schema

export interface Litter {
  id: string;
  breedingRecordId?: string;
  sire: {
    id: string;
    name: string;
    breed?: string;
    registrationNumber?: string;
    gender: string;
    dateOfBirth?: string;
    mainImageUrl?: string;
    currentOwner?: { id: string };
    owner?: { id: string };
  };
  dam: {
    id: string;
    name: string;
    breed?: string;
    registrationNumber?: string;
    gender: string;
    dateOfBirth?: string;
    mainImageUrl?: string;
    currentOwner?: { id: string };
    owner?: { id: string };
  };
  litterName: string;
  registrationNumber?: string;
  whelpingDate: string;
  totalPuppies: number;
  malePuppies?: number;
  femalePuppies?: number;
  notes?: string;
  puppies?: string[]; // Array of dog IDs
  createdAt: string;
  updatedAt: string;
}

export interface LitterInput {
  breedingRecordId?: string;
  sireId: string;
  damId: string;
  litterName: string;
  registrationNumber?: string;
  whelpingDate: string;
  totalPuppies: number;
  malePuppies?: number;
  femalePuppies?: number;
  puppyDetails?: PuppyDetailInput[];
  notes?: string;
}

export interface UpdateLitterInput {
  litterName?: string;
  registrationNumber?: string;
  whelpingDate?: string;
  totalPuppies?: number;
  malePuppies?: number;
  femalePuppies?: number;
  notes?: string;
  puppyIds?: string[];
}

export interface RegisterLitterPuppiesInput {
  litterId: string;
  puppies: {
    name: string;
    gender: string;
    color: string;
    microchipNumber?: string;
    isNeutered?: boolean;
  }[];
}

export interface RegisterLitterPuppiesResponse {
  litterId?: string;
  puppyIds?: string[];
  puppies?: any[];
  success: boolean;
  message?: string;
}

export interface PuppyDetailInput {
  name: string;
  gender: string;
  color?: string;
  markings?: string;
  microchipNumber?: string;
  isCollapsed?: boolean;
}

export interface Dog {
  id: string;
  name: string;
  breed?: string;
  breedId?: string;
  breedObj?: { id: string; name: string; group?: string; origin?: string };
  gender: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  color?: string;
  markings?: string;
  registrationNumber?: string;
  microchipNumber?: string;
  isNeutered?: boolean;
  height?: number;
  weight?: number;
  titles?: string[];
  biography?: string;
  sireId?: string;
  damId?: string;
  mainImageUrl?: string;
  ownerId?: string;
  currentOwner?: { id: string; name?: string };
  createdAt: string;
  updatedAt: string;
}

export enum DogRole {
  SIRE = 'SIRE',
  DAM = 'DAM',
  BOTH = 'BOTH'
}

// Add types for context and any other necessary GraphQL types
export interface Context {
  user?: {
    id: string;
    role: string;
  };
}
