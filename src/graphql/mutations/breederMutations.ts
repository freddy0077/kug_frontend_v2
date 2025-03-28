import { gql } from '@apollo/client';

// Mutation to create a new breeder profile
export const CREATE_BREEDER = gql`
  mutation CreateBreeder($input: BreederInput!) {
    createBreeder(input: $input) {
      id
      name
      location
      specialization
      yearsOfExperience
      bio
      profileImageUrl
    }
  }
`;

// Mutation to update an existing breeder profile
export const UPDATE_BREEDER = gql`
  mutation UpdateBreeder($id: ID!, $input: BreederInput!) {
    updateBreeder(id: $id, input: $input) {
      id
      name
      location
      specialization
      yearsOfExperience
      bio
      breedingPhilosophy
      email
      phone
      website
      specialties
      profileImageUrl
    }
  }
`;

// Mutation to delete a breeder profile (admin only)
export const DELETE_BREEDER = gql`
  mutation DeleteBreeder($id: ID!) {
    deleteBreeder(id: $id) {
      success
      message
    }
  }
`;
