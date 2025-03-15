import { gql } from '@apollo/client';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      firstName
      lastName
      fullName
      role
      profileImageUrl
      isActive
      lastLogin
      owner {
        id
        name
        contactEmail
        contactPhone
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers(
    $offset: Int = 0
    $limit: Int = 20
    $searchTerm: String
    $role: UserRole
    $isActive: Boolean
  ) {
    users(
      offset: $offset
      limit: $limit
      searchTerm: $searchTerm
      role: $role
      isActive: $isActive
    ) {
      totalCount
      hasMore
      items {
        id
        email
        fullName
        role
        isActive
        createdAt
        owner {
          id
          name
        }
      }
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      id
      email
      firstName
      lastName
      fullName
      role
      profileImageUrl
      isActive
      lastLogin
      createdAt
      updatedAt
      owner {
        id
        name
        contactEmail
        contactPhone
        address
        dogs {
          id
          name
          breed
        }
      }
    }
  }
`;
