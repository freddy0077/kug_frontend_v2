import { gql } from '@apollo/client';

// Queries
export const GET_OWNERSHIP_RECORDS = gql`
  query GetOwnershipRecords(
    $ownerId: ID, 
    $dogId: ID, 
    $includeFormer: Boolean = true,
    $startDate: DateTime,
    $endDate: DateTime,
    $offset: Int = 0,
    $limit: Int = 20
  ) {
    ownerDogs(
      ownerId: $ownerId, 
      includeFormer: $includeFormer,
      offset: $offset,
      limit: $limit
    ) {
      totalCount
      hasMore
      items {
        id
        dog {
          id
          name
          registrationNumber
          breed
          mainImageUrl
        }
        owner {
          id
          name
          contactEmail
          contactPhone
        }
        startDate
        endDate
        is_current
        transferDocumentUrl
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_DOG_OWNERSHIP_HISTORY = gql`
  query GetDogOwnershipHistory($dogId: ID!) {
    dogOwnerships(dogId: $dogId) {
      dog {
        id
        name
        registrationNumber
      }
      ownerships {
        id
        owner {
          id
          name
          contactEmail
        }
        startDate
        endDate
        is_current
        transferDocumentUrl
      }
    }
  }
`;

export const GET_SINGLE_OWNERSHIP = gql`
  query GetOwnership($id: ID!) {
    ownership(id: $id) {
      id
      dog {
        id
        name
        registrationNumber
      }
      owner {
        id
        name
        contactEmail
        contactPhone
      }
      startDate
      endDate
      is_current
      transferDocumentUrl
    }
  }
`;

// Mutations
export const CREATE_OWNERSHIP = gql`
  mutation CreateOwnership($input: CreateOwnershipInput!) {
    createOwnership(input: $input) {
      id
      dog {
        id
        name
      }
      owner {
        id
        name
      }
      startDate
      is_current
      transferDocumentUrl
    }
  }
`;

export const TRANSFER_OWNERSHIP = gql`
  mutation TransferOwnership($input: TransferOwnershipInput!) {
    transferOwnership(input: $input) {
      previousOwnership {
        id
        is_current
        endDate
      }
      newOwnership {
        id
        is_current
        startDate
      }
      dog {
        id
        name
        currentOwner {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_OWNERSHIP = gql`
  mutation UpdateOwnership($id: ID!, $input: UpdateOwnershipInput!) {
    updateOwnership(id: $id, input: $input) {
      id
      startDate
      endDate
      is_current
      transferDocumentUrl
    }
  }
`;

export const DELETE_OWNERSHIP = gql`
  mutation DeleteOwnership($id: ID!) {
    deleteOwnership(id: $id) {
      success
      message
      count
    }
  }
`;
