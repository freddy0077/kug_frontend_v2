import { gql } from '@apollo/client';

// Create a new planned mating
export const CREATE_PLANNED_MATING = gql`
  mutation CreatePlannedMating(
    $breedingProgramId: ID!,
    $sireId: ID!,
    $damId: ID!,
    $plannedBreedingDate: DateTime!,
    $notes: String,
    $expectedLitterSize: Int,
    $geneticGoals: [String!],
    $status: PlannedMatingStatus!
  ) {
    createPlannedMating(input: {
      breedingProgramId: $breedingProgramId,
      sireId: $sireId,
      damId: $damId,
      plannedBreedingDate: $plannedBreedingDate,
      notes: $notes,
      expectedLitterSize: $expectedLitterSize,
      geneticGoals: $geneticGoals,
      status: $status
    }) {
      id
      breedingProgram {
        id
        name
      }
      breedingProgramId
      sire {
        id
        name
        breed
        registrationNumber
      }
      sireId
      dam {
        id
        name
        breed
        registrationNumber
      }
      damId
      plannedBreedingDate
      actualBreedingDate
      expectedLitterSize
      geneticGoals
      status
      notes
      createdAt
      updatedAt
    }
  }
`;

// Update an existing planned mating
export const UPDATE_PLANNED_MATING = gql`
  mutation UpdatePlannedMating(
    $id: ID!,
    $plannedBreedingDate: DateTime,
    $actualBreedingDate: DateTime,
    $expectedLitterSize: Int,
    $geneticGoals: [String!],
    $status: PlannedMatingStatus,
    $notes: String
  ) {
    updatePlannedMating(id: $id, input: {
      plannedBreedingDate: $plannedBreedingDate,
      actualBreedingDate: $actualBreedingDate,
      expectedLitterSize: $expectedLitterSize,
      geneticGoals: $geneticGoals,
      status: $status,
      notes: $notes
    }) {
      id
      breedingProgram {
        id
        name
      }
      breedingProgramId
      sire {
        id
        name
        breed
      }
      sireId
      dam {
        id
        name
        breed
      }
      damId
      plannedBreedingDate
      actualBreedingDate
      expectedLitterSize
      geneticGoals
      status
      notes
      updatedAt
    }
  }
`;

// Delete a planned mating
export const DELETE_PLANNED_MATING = gql`
  mutation DeletePlannedMating($id: ID!) {
    deletePlannedMating(id: $id) {
      success
      message
    }
  }
`;

// Record litter result
export const RECORD_LITTER_RESULT = gql`
  mutation RecordLitterResult(
    $plannedMatingId: ID!,
    $whelppingDate: DateTime!,
    $totalPuppies: Int!,
    $malePuppies: Int!,
    $femalePuppies: Int!,
    $notes: String
  ) {
    recordLitterResult(
      plannedMatingId: $plannedMatingId,
      whelppingDate: $whelppingDate,
      totalPuppies: $totalPuppies,
      malePuppies: $malePuppies,
      femalePuppies: $femalePuppies,
      notes: $notes
    ) {
      id
      status
      litter {
        id
        whelppingDate
        totalPuppies
        malePuppies
        femalePuppies
      }
      notes
      updatedAt
    }
  }
`;

// Cancel a planned mating
export const CANCEL_PLANNED_MATING = gql`
  mutation CancelPlannedMating($id: ID!, $reason: String!) {
    cancelPlannedMating(id: $id, reason: $reason) {
      id
      status
      notes
      updatedAt
    }
  }
`;

// Record breeding result
export const RECORD_BREEDING_RESULT = gql`
  mutation RecordBreedingResult(
    $plannedMatingId: ID!,
    $actualBreedingDate: DateTime!,
    $successful: Boolean!,
    $notes: String
  ) {
    recordBreedingResult(
      plannedMatingId: $plannedMatingId,
      actualBreedingDate: $actualBreedingDate,
      successful: $successful,
      notes: $notes
    ) {
      id
      status
      actualBreedingDate
      notes
      updatedAt
    }
  }
`;
