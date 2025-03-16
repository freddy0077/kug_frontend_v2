import { gql } from '@apollo/client';

// Get all planned matings with pagination and filtering
export const GET_PLANNED_MATINGS = gql`
  query GetPlannedMatings($breedingProgramId: ID, $status: PlannedMatingStatus, $limit: Int, $offset: Int) {
    plannedMatings(breedingProgramId: $breedingProgramId, status: $status, limit: $limit, offset: $offset) {
      items {
        id
        breedingProgram {
          id
          name
        }
        breedingProgramId
        sireId
        sire {
          id
          name
          breed
          registrationNumber
        }
        damId
        dam {
          id
          name
          breed
          registrationNumber
        }
        plannedBreedingDate
        actualBreedingDate
        status
        expectedLitterSize
        geneticGoals
        notes
        createdAt
        updatedAt
      }
      totalCount
      hasMore
    }
  }
`;

// Get a single planned mating by ID
export const GET_PLANNED_MATING = gql`
  query GetPlannedMating($id: ID!) {
    plannedMating(id: $id) {
      id
      breedingProgram {
        id
        name
        breed
      }
      breedingProgramId
      sireId
      sire {
        id
        name
        breed
        registrationNumber
        dateOfBirth
        mainImageUrl
        healthRecords {
          id
          description
          testDate
          results
        }
      }
      damId
      dam {
        id
        name
        breed
        registrationNumber
        dateOfBirth
        mainImageUrl
        healthRecords {
          id
          description
          testDate
          results
        }
      }
      plannedBreedingDate
      actualBreedingDate
      status
      expectedLitterSize
      geneticGoals
      notes
      litter {
        id
        whelppingDate
        totalPuppies
        malePuppies
        femalePuppies
      }
      createdAt
      updatedAt
    }
  }
`;

// Get planned matings for a specific breeding program
export const GET_BREEDING_PROGRAM_MATINGS = gql`
  query GetBreedingProgramMatings($breedingProgramId: ID!, $status: PlannedMatingStatus) {
    plannedMatings(breedingProgramId: $breedingProgramId, status: $status) {
      items {
        id
        sire {
          id
          name
          breed
        }
        dam {
          id
          name
          breed
        }
        plannedBreedingDate
        actualBreedingDate
        status
        expectedLitterSize
        geneticGoals
        createdAt
      }
      totalCount
    }
  }
`;

// Get planned matings for a specific dog (as sire or dam)
export const GET_DOG_PLANNED_MATINGS = gql`
  query GetDogPlannedMatings($dogId: ID!, $status: PlannedMatingStatus) {
    plannedMatings(dogId: $dogId, status: $status) {
      items {
        id
        breedingProgram {
          id
          name
        }
        sire {
          id
          name
          breed
        }
        dam {
          id
          name
          breed
        }
        plannedBreedingDate
        actualBreedingDate
        status
        expectedLitterSize
        createdAt
      }
      totalCount
    }
  }
`;
