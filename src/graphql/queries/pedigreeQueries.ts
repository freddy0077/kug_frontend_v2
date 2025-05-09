import { gql, DocumentNode } from '@apollo/client';

// Query to get a dog's pedigree with specified number of generations
export const GET_DOG_PEDIGREE: DocumentNode = gql`
  query getDogPedigree($dogId: ID!, $generations: Int = 3) {
    dogPedigree(dogId: $dogId, generations: $generations) {
      id
      name
      registrationNumber
      otherRegistrationNumber
      breed
      breedObj {
        id
        name
        group
        origin
        temperament
      }
      gender
      dateOfBirth
      color
      titles
      mainImageUrl
      coefficient
      sire {
        id
        name
        registrationNumber
        otherRegistrationNumber
        breed
        breedObj {
          id
          name
          group
          origin
          temperament
        }
        gender
        dateOfBirth
        color
        titles
        mainImageUrl
        coefficient
        sire {
          id
          name
          registrationNumber
          otherRegistrationNumber
          breed
          breedObj {
            id
            name
            group
            origin
          }
          gender
          dateOfBirth
          color
          titles
          mainImageUrl
          coefficient
        }
        dam {
          id
          name
          registrationNumber
          otherRegistrationNumber
          breed
          breedObj {
            id
            name
            group
            origin
          }
          gender
          dateOfBirth
          color
          titles
          mainImageUrl
          coefficient
        }
      }
      dam {
        id
        name
        registrationNumber
        otherRegistrationNumber
        breed
        breedObj {
          id
          name
          group
          origin
          temperament
        }
        gender
        dateOfBirth
        color
        titles
        mainImageUrl
        coefficient
        sire {
          id
          name
          registrationNumber
          otherRegistrationNumber
          breed
          breedObj {
            id
            name
            group
            origin
          }
          gender
          dateOfBirth
          color
          titles
          mainImageUrl
          coefficient
        }
        dam {
          id
          name
          registrationNumber
          otherRegistrationNumber
          breed
          breedObj {
            id
            name
            group
            origin
          }
          gender
          dateOfBirth
          color
          titles
          mainImageUrl
          coefficient
        }
      }
    }
  }
`;

// Query to get breeding records for a dog (as sire, dam, or both)
export const GET_BREEDING_RECORDS: DocumentNode = gql`
  query getBreedingRecords(
    $dogId: ID!
    $role: BreedingRole = BOTH
    $offset: Int = 0
    $limit: Int = 20
  ) {
    breedingRecords(
      dogId: $dogId
      role: $role
      offset: $offset
      limit: $limit
    ) {
      totalCount
      hasMore
      items {
        id
        breedingDate
        litterSize
        comments
        sire {
          id
          name
          breed
          registrationNumber
          otherRegistrationNumber
          mainImageUrl
        }
        dam {
          id
          name
          breed
          registrationNumber
          otherRegistrationNumber
          mainImageUrl
        }
        puppies {
          id
          name
          breed
          gender
          dateOfBirth
          mainImageUrl
        }
        createdAt
        updatedAt
      }
    }
  }
`;

// For client-side type safety
export enum BreedingRole {
  SIRE = 'SIRE',
  DAM = 'DAM',
  BOTH = 'BOTH'
}

// Query to analyze linebreeding for a potential breeding pair
export const GET_LINEBREEDING_ANALYSIS: DocumentNode = gql`
  query getLinebreedingAnalysis($sireId: ID!, $damId: ID!, $generations: Int = 6) {
    linebreedingAnalysis(sireId: $sireId, damId: $damId, generations: $generations) {
      inbreedingCoefficient
      commonAncestors {
        dog {
          id
          name
          registrationNumber
          otherRegistrationNumber
        }
        occurrences
        contribution
      }
      recommendations
      geneticDiversity
    }
  }
`;

// Mutation to create a pedigree
export const CREATE_PEDIGREE: DocumentNode = gql`
  mutation CreatePedigree($input: CreatePedigreeInput!) {
    createPedigree(input: $input) {
      id
      dog {
        id
        name
        registrationNumber
        otherRegistrationNumber
      }
      generation
      coefficient
      sire {
        id
        dog {
          id
          name
          registrationNumber
          otherRegistrationNumber
        }
        generation
      }
      dam {
        id
        dog {
          id
          name
          registrationNumber
          otherRegistrationNumber
        }
        generation
      }
    }
  }
`;

// Mutation to create a new breeding record
export const CREATE_BREEDING_RECORD: DocumentNode = gql`
  mutation CreateBreedingRecord($input: CreateBreedingRecordInput!) {
    createBreedingRecord(input: $input) {
      id
      breedingDate
      litterSize
      comments
      sire {
        id
        name
      }
      dam {
        id
        name
      }
      puppies {
        id
        name
      }
    }
  }
`;
