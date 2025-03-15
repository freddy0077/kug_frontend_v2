import { gql } from '@apollo/client';

export const CREATE_BREED = gql`
  mutation CreateBreed($input: CreateBreedInput!) {
    createBreed(input: $input) {
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

export const UPDATE_BREED = gql`
  mutation UpdateBreed($id: ID!, $input: UpdateBreedInput!) {
    updateBreed(id: $id, input: $input) {
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

export const DELETE_BREED = gql`
  mutation DeleteBreed($id: ID!) {
    deleteBreed(id: $id) {
      id
    }
  }
`;
