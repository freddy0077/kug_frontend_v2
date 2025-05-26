import { gql } from '@apollo/client';

// Create a new pedigree import by uploading a file
export const CREATE_PEDIGREE_IMPORT = gql`
  mutation CreatePedigreeImport($file: Upload!) {
    createPedigreeImport(file: $file) {
      id
      originalFileName
      status
      createdAt
    }
  }
`;

// Update an extracted dog's details
export const UPDATE_EXTRACTED_DOG = gql`
  mutation UpdateExtractedDog($id: ID!, $input: ExtractedDogUpdateInput!) {
    updateExtractedDog(id: $id, input: $input) {
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
      selectedForImport
    }
  }
`;

// Update the selection status of an extracted dog
export const UPDATE_EXTRACTED_DOG_STATUS = gql`
  mutation UpdateExtractedDogStatus($extractedDogId: ID!, $selected: Boolean!) {
    updateExtractedDogStatus(extractedDogId: $extractedDogId, selected: $selected) {
      id
      selectedForImport
    }
  }
`;

// Import selected dogs from a pedigree import
export const IMPORT_PEDIGREE = gql`
  mutation ImportPedigree($pedigreeImportId: ID!) {
    importPedigree(pedigreeImportId: $pedigreeImportId) {
      success
      message
      importedDogs {
        id
        name
        registrationNumber
      }
      errors
    }
  }
`;

// Input type for updating extracted dog details
export interface ExtractedDogUpdateInput {
  name?: string;
  registrationNumber?: string;
  otherRegistrationNumber?: string;
  breed?: string;
  gender?: string;
  dateOfBirth?: string;
  color?: string;
  selectedForImport?: boolean;
}
