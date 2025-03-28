import { gql } from '@apollo/client';

// Query to fetch all breeders with optional pagination
export const GET_BREEDERS = gql`
  query GetBreeders($limit: Int, $offset: Int) {
    breeders(limit: $limit, offset: $offset) {
      items {
        id
        name
        location
        specialization
        profileImageUrl
        yearsOfExperience
        bio
        averageRating
        activeDogs
      }
      total
    }
  }
`;

// Query to get a specific breeder by ID
export const GET_BREEDER_BY_ID = gql`
  query GetBreederById($id: ID!) {
    breeder(id: $id) {
      id
      name
      location
      specialization
      profileImageUrl
      yearsOfExperience
      bio
      breedingPhilosophy
      email
      phone
      website
      specialties
      memberSince
      averageRating
      dogCount
      litterCount
      dogs {
        id
        name
        breed
        mainImageUrl
      }
    }
  }
`;

// Query to search for breeders
export const SEARCH_BREEDERS = gql`
  query SearchBreeders($query: String!, $limit: Int) {
    searchBreeders(query: $query, limit: $limit) {
      items {
        id
        name
        location
        specialization
        profileImageUrl
        yearsOfExperience
      }
      total
    }
  }
`;

// Query to get breeders by breed specialization
export const GET_BREEDERS_BY_BREED = gql`
  query GetBreedersByBreed($breedId: ID!, $limit: Int, $offset: Int) {
    breedersByBreed(breedId: $breedId, limit: $limit, offset: $offset) {
      items {
        id
        name
        location
        specialization
        profileImageUrl
        yearsOfExperience
        averageRating
      }
      total
    }
  }
`;
