import { gql } from '@apollo/client';

// Fetch paginated list of pedigree imports
export const GET_PEDIGREE_IMPORTS = gql`
  query GetPedigreeImports(
    $offset: Int = 0
    $limit: Int = 20
    $searchTerm: String
    $status: PedigreeImportStatus
  ) {
    pedigreeImports(
      offset: $offset
      limit: $limit
      searchTerm: $searchTerm
      status: $status
    ) {
      totalCount
      hasMore
      items {
        id
        originalFileName
        status
        createdAt
        updatedAt
        completedAt
        user {
          id
          fullName
          email
        }
      }
    }
  }
`;

// Fetch a single pedigree import by ID with extracted dogs
export const GET_PEDIGREE_IMPORT = gql`
  query GetPedigreeImport($id: ID!) {
    pedigreeImport(id: $id) {
      id
      originalFileName
      status
      processingErrors
      extractedText
      createdAt
      updatedAt
      completedAt
      user {
        id
        fullName
        email
      }
      extractedDogs {
        id
        position
        name
        registrationNumber
        otherRegistrationNumber
        breed
        gender
        dateOfBirth
        color
        confidence
        exists
        existingDogId
        selectedForImport
        dogId
      }
    }
  }
`;

// Fetch extracted dogs for a specific pedigree import
export const GET_EXTRACTED_DOGS = gql`
  query GetExtractedDogs(
    $pedigreeImportId: ID!
    $offset: Int = 0
    $limit: Int = 20
  ) {
    extractedDogs(
      pedigreeImportId: $pedigreeImportId
      offset: $offset
      limit: $limit
    ) {
      id
      position
      name
      registrationNumber
      otherRegistrationNumber
      breed
      gender
      dateOfBirth
      color
      confidence
      exists
      existingDogId
      existingDog {
        id
        name
        registrationNumber
        otherRegistrationNumber
        breed
        gender
        mainImageUrl
      }
      selectedForImport
      dogId
      createdDog {
        id
        name
        registrationNumber
      }
    }
  }
`;

// Fetch a single extracted dog
export const GET_EXTRACTED_DOG = gql`
  query GetExtractedDog($id: ID!) {
    extractedDog(id: $id) {
      id
      position
      name
      registrationNumber
      otherRegistrationNumber
      breed
      gender
      dateOfBirth
      color
      confidence
      exists
      existingDogId
      existingDog {
        id
        name
        registrationNumber
        otherRegistrationNumber
        breed
        gender
        color
        dateOfBirth
        mainImageUrl
      }
      selectedForImport
      dogId
      createdDog {
        id
        name
        registrationNumber
      }
    }
  }
`;

// Define PedigreeImportStatus enum to match backend
export enum PedigreeImportStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  EXTRACTION_COMPLETE = 'EXTRACTION_COMPLETE',
  VALIDATION_COMPLETE = 'VALIDATION_COMPLETE',
  IMPORT_COMPLETE = 'IMPORT_COMPLETE',
  FAILED = 'FAILED'
}
