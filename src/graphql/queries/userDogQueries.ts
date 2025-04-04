import { gql } from '@apollo/client';

export const GET_USER_DOGS = gql`
  query GetUserDogs {
    dogs(limit: 50) {
      items {
        id
        name
        breed
        gender
        dateOfBirth
        mainImageUrl
        registrationNumber
        microchipNumber
        currentOwner {
          id
          name
        }
      }
    }
  }
`;
