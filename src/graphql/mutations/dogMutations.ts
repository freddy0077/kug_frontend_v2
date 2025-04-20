import { gql } from '@apollo/client';
import { ApprovalStatus } from '@/types/enums';

// Create a new dog
export const CREATE_DOG_MUTATION = gql`
  mutation CreateDog($input: CreateDogInput!) {
    createDog(input: $input) {
      id
      name
      breed
      gender
      color
      dateOfBirth
      dateOfDeath
      registrationNumber
      otherRegistrationNumber
      microchipNumber
      isNeutered
      height
      weight
      titles
      biography
      mainImageUrl
      breedObj {
        id
        name
      }
      user {
        id
        fullName
        email
      }
    }
  }
`;

// Update an existing dog
export const UPDATE_DOG_MUTATION = gql`
  mutation UpdateDog($id: ID!, $input: UpdateDogInput!) {
    updateDog(id: $id, input: $input) {
      id
      name
      breed
      gender
      color
      dateOfBirth
      dateOfDeath
      registrationNumber
      otherRegistrationNumber
      microchipNumber
      isNeutered
      height
      weight
      titles
      biography
      mainImageUrl
      breedObj {
        id
        name
      }
      user {
        id
        fullName
        email
      }
    }
  }
`;

// Delete a dog
export const DELETE_DOG_MUTATION = gql`
  mutation DeleteDog($id: ID!) {
    deleteDog(id: $id) {
      success
      message
    }
  }
`;

// Add an image to a dog
export const ADD_DOG_IMAGE_MUTATION = gql`
  mutation AddDogImage($dogId: ID!, $input: DogImageInput!) {
    addDogImage(dogId: $dogId, input: $input) {
      id
      url
      caption
      isPrimary
    }
  }
`;

// Input type definitions for TypeScript
export interface CreateDogInput {
  name: string;
  breed: string;
  breedId?: number;  
  gender: string;
  color: string;
  dateOfBirth: Date;  // Must be a valid Date, never undefined
  dateOfDeath?: Date;
  height?: number;
  weight?: number;
  registrationNumber?: string;
  otherRegistrationNumber?: string;
  microchipNumber?: string;
  isNeutered?: boolean;
  userId: string;  // Changed from ownerId to userId to match the schema
  sireId?: string | number;
  damId?: string | number;
  titles?: string[];
  biography?: string;
  mainImageUrl?: string;
}

export interface UpdateDogInput extends Partial<Omit<CreateDogInput, 'userId'>> {
  breedId?: number;
  userId?: string;  // Added userId to allow owner updates
  otherRegistrationNumber?: string; // Explicitly adding to ensure it's included in updates
}

export interface DogImageInput {
  url: string;  // Changed from imageUrl to url to match the schema
  caption?: string;
  isPrimary?: boolean;
}

// Approve a dog
export const APPROVE_DOG_MUTATION = gql`
  mutation ApproveDog($id: ID!, $notes: String) {
    approveDog(id: $id, notes: $notes) {
      id
      name
      approvalStatus
      approvalDate
      approvalNotes
      approvedBy {
        id
        fullName
      }
    }
  }
`;

// Decline a dog
export const DECLINE_DOG_MUTATION = gql`
  mutation DeclineDog($id: ID!, $notes: String) {
    declineDog(id: $id, notes: $notes) {
      id
      name
      approvalStatus
      approvalDate
      approvalNotes
      approvedBy {
        id
        fullName
      }
    }
  }
`;

// Transfer dog ownership
export const TRANSFER_DOG_OWNERSHIP_MUTATION = gql`
  mutation TransferDogOwnership($dogId: ID!, $newUserId: ID!) {
    transferDogOwnership(dogId: $dogId, newUserId: $newUserId) {
      id
      name
      user {
        id
        fullName
        email
      }
    }
  }
`;
