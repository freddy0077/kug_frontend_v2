import { gql } from '@apollo/client';

// Mutation to create a new breeding record
export const CREATE_BREEDING_RECORD = gql`
  mutation createBreedingRecord($input: BreedingRecordInput!) {
    createBreedingRecord(input: $input) {
      id
      breedingDate
      litterSize
      comments
      sire {
        id
        name
        breed
      }
      dam {
        id
        name
        breed
      }
      puppies {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

// Mutation to update an existing breeding record
export const UPDATE_BREEDING_RECORD = gql`
  mutation updateBreedingRecord($id: ID!, $input: UpdateBreedingRecordInput!) {
    updateBreedingRecord(id: $id, input: $input) {
      id
      breedingDate
      litterSize
      comments
      sire {
        id
        name
        breed
      }
      dam {
        id
        name
        breed
      }
      puppies {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

// Mutation to link a dog to its parents in the pedigree
export const LINK_DOG_TO_PARENTS = gql`
  mutation linkDogToParents($dogId: ID!, $sireId: ID, $damId: ID) {
    linkDogToParents(dogId: $dogId, sireId: $sireId, damId: $damId) {
      id
      name
      breed
      sire {
        id
        name
        breed
      }
      dam {
        id
        name
        breed
      }
    }
  }
`;

// Input types for TypeScript type safety
export interface BreedingRecordInput {
  sireId: string;
  damId: string;
  breedingDate: string; // ISO format date string
  litterSize?: number;
  comments?: string;
  puppyIds?: string[];
}

export interface UpdateBreedingRecordInput {
  breedingDate?: string; // ISO format date string
  litterSize?: number;
  comments?: string;
  puppyIds?: string[];
}
