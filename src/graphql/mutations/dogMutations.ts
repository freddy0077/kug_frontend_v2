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
  dateOfBirth: Date;
  dateOfDeath?: Date;
  height?: number;
  weight?: number;
  registrationNumber?: string;
  microchipNumber?: string;
  isNeutered?: boolean;
  ownerId?: string | number;  
  sireId?: number;
  damId?: number;
  titles?: string[];
  biography?: string;
  mainImageUrl?: string;
}

export interface UpdateDogInput extends Partial<CreateDogInput> {
  breedId?: number;  
}

export interface DogImageInput {
  imageUrl: string;  
  url?: string;      
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
