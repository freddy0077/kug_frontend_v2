import { gql } from '@apollo/client';

// Create a new breeding program
export const CREATE_BREEDING_PROGRAM = gql`
  mutation CreateBreedingProgram(
    $name: String!,
    $description: String!,
    $breederId: ID!,
    $breed: String!,
    $goals: [String!]!,
    $startDate: DateTime!,
    $endDate: DateTime,
    $geneticTestingProtocol: String,
    $selectionCriteria: String,
    $notes: String,
    $isPublic: Boolean!,
    $imageUrl: String,
    $foundationDogIds: [ID!]!
  ) {
    createBreedingProgram(input: {
      name: $name,
      description: $description,
      breederId: $breederId,
      breed: $breed,
      goals: $goals,
      startDate: $startDate,
      endDate: $endDate,
      geneticTestingProtocol: $geneticTestingProtocol,
      selectionCriteria: $selectionCriteria,
      notes: $notes,
      isPublic: $isPublic,
      imageUrl: $imageUrl,
      foundationDogIds: $foundationDogIds
    }) {
      id
      name
      description
      breederId
      breed
      goals
      startDate
      endDate
      status
      geneticTestingProtocol
      selectionCriteria
      notes
      isPublic
      imageUrl
      createdAt
      updatedAt
    }
  }
`;

// Update an existing breeding program
export const UPDATE_BREEDING_PROGRAM = gql`
  mutation UpdateBreedingProgram(
    $id: ID!,
    $name: String,
    $description: String,
    $breed: String,
    $goals: [String!],
    $startDate: DateTime,
    $endDate: DateTime,
    $status: BreedingProgramStatus,
    $geneticTestingProtocol: String,
    $selectionCriteria: String,
    $notes: String,
    $isPublic: Boolean,
    $imageUrl: String,
    $foundationDogIds: [ID!]
  ) {
    updateBreedingProgram(id: $id, input: {
      name: $name,
      description: $description,
      breed: $breed,
      goals: $goals,
      startDate: $startDate,
      endDate: $endDate,
      status: $status,
      geneticTestingProtocol: $geneticTestingProtocol,
      selectionCriteria: $selectionCriteria,
      notes: $notes,
      isPublic: $isPublic,
      imageUrl: $imageUrl,
      foundationDogIds: $foundationDogIds
    }) {
      id
      name
      description
      breederId
      breed
      goals
      startDate
      endDate
      status
      geneticTestingProtocol
      selectionCriteria
      notes
      isPublic
      imageUrl
      updatedAt
    }
  }
`;

// Delete a breeding program
export const DELETE_BREEDING_PROGRAM = gql`
  mutation DeleteBreedingProgram($id: ID!) {
    deleteBreedingProgram(id: $id) {
      success
      message
    }
  }
`;

// Add a breeding pair to a program
export const ADD_BREEDING_PAIR = gql`
  mutation AddBreedingPair(
    $programId: ID!,
    $sireId: ID!,
    $damId: ID!,
    $plannedBreedingDate: DateTime,
    $compatibilityNotes: String,
    $status: BreedingPairStatus!
  ) {
    addBreedingPair(input: {
      programId: $programId,
      sireId: $sireId,
      damId: $damId,
      plannedBreedingDate: $plannedBreedingDate,
      compatibilityNotes: $compatibilityNotes,
      status: $status
    }) {
      id
      program {
        id
        name
      }
      programId
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
      compatibilityNotes
      status
      createdAt
      updatedAt
    }
  }
`;

// Update a breeding pair status
export const UPDATE_BREEDING_PAIR_STATUS = gql`
  mutation UpdateBreedingPairStatus(
    $id: ID!,
    $status: BreedingPairStatus!,
    $notes: String
  ) {
    updateBreedingPairStatus(
      id: $id,
      status: $status,
      notes: $notes
    ) {
      id
      status
      compatibilityNotes
      updatedAt
    }
  }
`;

// Link a litter to a breeding pair
export const LINK_LITTER_TO_BREEDING_PAIR = gql`
  mutation LinkLitterToBreedingPair(
    $breedingPairId: ID!,
    $breedingRecordId: ID!
  ) {
    linkLitterToBreedingPair(
      breedingPairId: $breedingPairId,
      breedingRecordId: $breedingRecordId
    ) {
      id
      status
      breedingRecords {
        id
        breedingDate
        litterSize
      }
      updatedAt
    }
  }
`;
