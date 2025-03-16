import { gql } from '@apollo/client';

// Get all breeding programs with pagination and filtering
export const GET_BREEDING_PROGRAMS = gql`
  query GetBreedingPrograms($breederId: ID, $breed: String, $status: BreedingProgramStatus, $limit: Int, $offset: Int, $includePrivate: Boolean) {
    breedingPrograms(breederId: $breederId, breed: $breed, status: $status, limit: $limit, offset: $offset, includePrivate: $includePrivate) {
      items {
        id
        name
        description
        breed
        breederId
        goals
        startDate
        endDate
        status
        is_public
        geneticTestingProtocol
        selectionCriteria
        notes
        imageUrl
        createdAt
        updatedAt
      }
      totalCount
      hasMore
    }
  }
`;

// Get a single breeding program by ID
export const GET_BREEDING_PROGRAM = gql`
  query GetBreedingProgram($id: ID!) {
    breedingProgram(id: $id) {
      id
      name
      description
      breeder {
        id
        name
      }
      breederId
      breed
      goals
      startDate
      endDate
      status
      geneticTestingProtocol
      selectionCriteria
      notes
      is_public
      imageUrl
      foundationDogs {
        id
        name
        registrationNumber
        breed
        gender
        dateOfBirth
        mainImageUrl
      }
      breedingPairs {
        id
        sire {
          id
          name
        }
        dam {
          id
          name
        }
        status
        plannedBreedingDate
      }
      resultingLitters {
        id
        litterSize
        breedingDate
      }
      createdAt
      updatedAt
    }
  }
`;

// Get breeding programs for a specific breeder
export const GET_BREEDER_BREEDING_PROGRAMS = gql`
  query GetBreederBreedingPrograms($breederId: ID!) {
    breedingPrograms(breederId: $breederId) {
      items {
        id
        name
        description
        breed
        status
        startDate
        endDate
        isPublic
        imageUrl
        createdAt
      }
      totalCount
    }
  }
`;
