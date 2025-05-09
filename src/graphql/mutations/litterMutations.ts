import { gql } from '@apollo/client';

// Mutation to create a new litter
export const CREATE_LITTER = gql`
  mutation createLitter($input: LitterInput!) {
    createLitter(input: $input) {
      id
      litterName
      registrationNumber
      breedingRecordId
      whelpingDate
      totalPuppies
      malePuppies
      femalePuppies
      sire {
        id
        name
        breed
        registrationNumber
      }
      dam {
        id
        name
        breed
        registrationNumber
      }
      puppies {
        id
        name
        gender
        color
        microchipNumber
        user {
          id
          fullName
          email
        }
      }
      notes
      createdAt
      updatedAt
    }
  }
`;

// Mutation to update an existing litter
export const UPDATE_LITTER = gql`
  mutation updateLitter($id: ID!, $input: UpdateLitterInput!) {
    updateLitter(id: $id, input: $input) {
      id
      litterName
      registrationNumber
      whelpingDate
      totalPuppies
      malePuppies
      femalePuppies
      notes
      puppies {
        id
        name
        gender
      }
      updatedAt
    }
  }
`;

// Mutation to register multiple puppies from a litter
export const REGISTER_LITTER_PUPPIES = gql`
  mutation registerLitterPuppies($input: RegisterLitterPuppiesInput!) {
    registerLitterPuppies(input: $input) {
      success
      message
      puppies {
        id
        name
        gender
        dateOfBirth
        breed
        color
        litterId
        user {
          id
          fullName
          email
        }
      }
    }
  }
`;

// TypeScript interfaces for type safety
// Puppy detail interface for individual puppy registration
export interface PuppyDetailInput {
  name: string;
  gender: 'male' | 'female';
  color?: string;
  markings?: string;
  microchipNumber?: string;
  isCollapsed?: boolean;
}

export interface LitterInput {
  breedingRecordId?: string;
  sireId: string;
  damId: string;
  litterName: string;
  registrationNumber?: string;
  whelpingDate: Date; // Must be a valid Date object
  totalPuppies: number;
  malePuppies?: number;
  femalePuppies?: number;
  puppyDetails?: PuppyDetailInput[];
  notes?: string;
  userId?: string; // Added to specify the owner of the litter and puppies
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
  puppies: PuppyRegistrationInput[];
}

export interface PuppyRegistrationInput {
  name: string;
  gender: string;
  color: string;
  microchipNumber?: string;
  isNeutered?: boolean;
  userId?: string;  // Changed from ownerId to userId to match schema
  ownerId?: string;  // Kept for backward compatibility
}
