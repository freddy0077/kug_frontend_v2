import { gql } from '@apollo/client';

// Enum definitions to match backend
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

// Get breeds for filtering
export const GET_BREEDS = gql`
  query GetBreeds($offset: Int, $limit: Int, $searchTerm: String) {
    breeds(offset: $offset, limit: $limit, searchTerm: $searchTerm) {
      items {
        id
        name
        group
        origin
      }
      totalCount
      hasMore
    }
  }
`;

// Get a single breed by ID
export const GET_BREED_BY_ID = gql`
  query GetBreedById($id: ID!) {
    breed(id: $id) {
      id
      name
      group
      origin
      description
      temperament
      average_lifespan
      average_height
      average_weight
      dogs {
        id
        name
        gender
        dateOfBirth
      }
    }
  }
`;

// Get a single breed by name
export const GET_BREED_BY_NAME = gql`
  query GetBreedByName($name: String!) {
    breedByName(name: $name) {
      id
      name
      group
      origin
      description
      temperament
      average_lifespan
      average_height
      average_weight
    }
  }
`;

// Get breed groups for filtering
export const GET_BREED_GROUPS = gql`
  query GetBreeds($offset: Int, $limit: Int) {
    breeds(offset: $offset, limit: $limit) {
      items {
        group
      }
      totalCount
      hasMore
    }
  }
`;

// Search and autocomplete for breeds
export const SEARCH_BREEDS = gql`
  query SearchBreeds($searchTerm: String!, $limit: Int = 10) {
    breeds(searchTerm: $searchTerm, limit: $limit) {
      items {
        id
        name
        group
        origin
      }
      totalCount
    }
  }
`;
