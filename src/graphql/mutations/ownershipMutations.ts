import { gql } from '@apollo/client';

// Mutation to create a new ownership record
export const CREATE_OWNERSHIP = gql`
  mutation createOwnership($input: CreateOwnershipInput!) {
    createOwnership(input: $input) {
      id
      startDate
      is_current
      dog {
        id
        name
      }
      owner {
        id
        name
      }
    }
  }
`;

// Input type for CreateOwnershipInput
export interface CreateOwnershipInput {
  dogId: string;
  ownerId: string;
  startDate: string;
  is_current: boolean; // Using is_current per schema
  transferDocumentUrl?: string;
}

// Mutation to transfer ownership of a dog from one owner to another
export const TRANSFER_OWNERSHIP = gql`
  mutation transferOwnership($input: TransferOwnershipInput!) {
    transferOwnership(input: $input) {
      previousOwnership {
        id
        owner {
          id
          name
        }
        endDate
        is_current
      }
      newOwnership {
        id
        owner {
          id
          name
        }
        startDate
        is_current
      }
      dog {
        id
        name
      }
    }
  }
`;

// Input type for TransferOwnershipInput
export interface TransferOwnershipInput {
  dogId: string;
  newOwnerId: string;
  transferDate: string;
  transferDocumentUrl?: string;
}

// Mutation to update an existing ownership record
export const UPDATE_OWNERSHIP = gql`
  mutation updateOwnership($id: ID!, $input: UpdateOwnershipInput!) {
    updateOwnership(id: $id, input: $input) {
      id
      startDate
      endDate
      is_current
      transferDocumentUrl
    }
  }
`;

// Input type for UpdateOwnershipInput
export interface UpdateOwnershipInput {
  startDate?: string;
  endDate?: string;
  is_current?: boolean; // Using is_current per schema
  transferDocumentUrl?: string;
}

// Mutation to delete an ownership record
export const DELETE_OWNERSHIP = gql`
  mutation deleteOwnership($id: ID!) {
    deleteOwnership(id: $id) {
      success
      message
    }
  }
`;
