import { gql } from '@apollo/client';
import { HEALTH_RECORD_FIELDS, HEALTH_RECORD_WITH_DOG } from '../queries/healthRecordQueries';

// =====================
// Health Record Mutations
// =====================

export const CREATE_HEALTH_RECORD = gql`
  mutation CreateHealthRecord($input: CreateHealthRecordInput!) {
    createHealthRecord(input: $input) {
      ...HealthRecordWithDog
    }
  }
  ${HEALTH_RECORD_WITH_DOG}
`;

export const UPDATE_HEALTH_RECORD = gql`
  mutation UpdateHealthRecord($id: ID!, $input: UpdateHealthRecordInput!) {
    updateHealthRecord(id: $id, input: $input) {
      ...HealthRecordWithDog
    }
  }
  ${HEALTH_RECORD_WITH_DOG}
`;

export const DELETE_HEALTH_RECORD = gql`
  mutation DeleteHealthRecord($id: ID!) {
    deleteHealthRecord(id: $id) {
      id
      success
      message
    }
  }
`;

export const UPLOAD_HEALTH_RECORD_ATTACHMENT = gql`
  mutation UploadHealthRecordAttachment($healthRecordId: ID!, $file: Upload!) {
    uploadHealthRecordAttachment(healthRecordId: $healthRecordId, file: $file) {
      success
      message
      url
      fileName
    }
  }
`;

export const REMOVE_HEALTH_RECORD_ATTACHMENT = gql`
  mutation RemoveHealthRecordAttachment($healthRecordId: ID!, $fileName: String!) {
    removeHealthRecordAttachment(healthRecordId: $healthRecordId, fileName: $fileName) {
      success
      message
    }
  }
`;
