import { gql } from '@apollo/client';

// Direct query for owners
export const GET_OWNERS = gql`
  query GetOwners($limit: Int = 100, $offset: Int = 0, $searchTerm: String) {
    owners(limit: $limit, offset: $offset, searchTerm: $searchTerm) {
      totalCount
      hasMore
      items {
        id
        name
        contactEmail
        contactPhone
        address
      }
    }
  }
`;

// Get owners from the users endpoint
export const GET_USERS_WITH_OWNERS = gql`
  query GetUsersWithOwners(
    $offset: Int = 0
    $limit: Int = 100
    $searchTerm: String
  ) {
    users(
      offset: $offset
      limit: $limit
      searchTerm: $searchTerm
    ) {
      totalCount
      hasMore
      items {
        id
        email
        fullName
        owner {
          id
          name
          contactEmail
          contactPhone
          address
        }
      }
    }
  }
`;

// Get all active ownerships to extract owners
export const GET_ALL_OWNERS = gql`
  query GetAllOwners($limit: Int = 100) {
    dogOwnerships {
      ownerships {
        owner {
          id
          name
          contactEmail
          contactPhone
        }
        is_current
      }
    }
  }
`;

// Get owner by ID via ownership query
export const GET_OWNER_BY_ID = gql`
  query GetOwnerById($id: ID!) {
    ownership(id: $id) {
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
