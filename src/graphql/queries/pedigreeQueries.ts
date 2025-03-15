import { gql } from '@apollo/client';

// Query to get a dog's pedigree with specified number of generations
export const GET_DOG_PEDIGREE = gql`
  query getDogPedigree($dogId: ID!, $generations: Int = 3) {
    dogPedigree(dogId: $dogId, generations: $generations) {
      id
      name
      registrationNumber
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
          breed
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
          breed
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
          breed
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
          breed
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
export const GET_BREEDING_RECORDS = gql`
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
          mainImageUrl
        }
        dam {
          id
          name
          breed
          registrationNumber
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
export const GET_LINEBREEDING_ANALYSIS = gql`
  query getLinebreedingAnalysis($sireId: ID!, $damId: ID!, $generations: Int = 6) {
    linebreedingAnalysis(sireId: $sireId, damId: $damId, generations: $generations) {
      inbreedingCoefficient
      commonAncestors {
        dog {
          id
          name
          registrationNumber
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
export const CREATE_PEDIGREE = gql`
  mutation CreatePedigree($input: CreatePedigreeInput!) {
    createPedigree(input: $input) {
      id
      dog {
        id
        name
        registrationNumber
      }
      generation
      coefficient
      sire {
        id
        dog {
          id
          name
          registrationNumber
        }
        generation
      }
      dam {
        id
        dog {
          id
          name
          registrationNumber
        }
        generation
      }
    }
  }
`;

// Mutation to create a new breeding record
export const CREATE_BREEDING_RECORD = gql`
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
