import { gql } from '@apollo/client';

// Query to get ownership history for a specific dog
export const GET_DOG_OWNERSHIPS = gql`
  query getDogOwnerships($dogId: ID!) {
    dogOwnerships(dogId: $dogId) {
      dog {
        id
        name
        breed
        registrationNumber
      }
      ownerships {
        id
        startDate
        endDate
        is_current
        owner {
          id
          name
          contactEmail
        }
        transferDocumentUrl
      }
    }
  }
`;

// Query to get all dogs owned by a particular owner
export const GET_OWNER_DOGS = gql`
  query getOwnerDogs(
    $ownerId: ID!
    $includeFormer: Boolean = false
    $offset: Int = 0
    $limit: Int = 20
  ) {
    ownerDogs(
      ownerId: $ownerId
      includeFormer: $includeFormer
      offset: $offset
      limit: $limit
    ) {
      totalCount
      hasMore
      items {
        id
        dog {
          id
          name
          breed
          dateOfBirth
          registrationNumber
          mainImageUrl
        }
        startDate
        endDate
        is_current
      }
    }
  }
`;

// Query to get details about a specific ownership record
export const GET_OWNERSHIP = gql`
  query getOwnership($id: ID!) {
    ownership(id: $id) {
      id
      startDate
      endDate
      is_current
      transferDocumentUrl
      dog {
        id
        name
        breed
        registrationNumber
        mainImageUrl
      }
      owner {
        id
        name
        contactEmail
        contactPhone
        address
        user {
          id
          email
        }
      }
    }
  }
`;
