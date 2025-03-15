import { gql } from '@apollo/client';
import { HealthRecordType } from '@/types/healthRecord';

// =====================
// Health Record Fragments
// =====================

export const HEALTH_RECORD_FIELDS = gql`
  fragment HealthRecordFields on HealthRecord {
    id
    date
    veterinarian
    vetName
    description
    results
    type
    attachmentUrl
    attachments
    createdAt
    updatedAt
  }
`;

export const HEALTH_RECORD_WITH_DOG = gql`
  fragment HealthRecordWithDog on HealthRecord {
    ...HealthRecordFields
    dog {
      id
      name
      breed
      dateOfBirth
      currentOwner {
        id
        name
      }
    }
  }
  ${HEALTH_RECORD_FIELDS}
`;

// =====================
// Health Record Queries
// =====================

export const GET_DOG_HEALTH_RECORDS = gql`
  query GetDogHealthRecords(
    $dogId: ID!
    $offset: Int = 0
    $limit: Int = 20
    $type: HealthRecordType
    $startDate: DateTime
    $endDate: DateTime
    $sortDirection: SortDirection = DESC
  ) {
    dogHealthRecords(
      dogId: $dogId
      offset: $offset
      limit: $limit
      type: $type
      startDate: $startDate
      endDate: $endDate
      sortDirection: $sortDirection
    ) {
      totalCount
      hasMore
      items {
        ...HealthRecordFields
      }
    }
  }
  ${HEALTH_RECORD_FIELDS}
`;

export const GET_HEALTH_RECORD = gql`
  query GetHealthRecord($id: ID!) {
    healthRecord(id: $id) {
      ...HealthRecordWithDog
    }
  }
  ${HEALTH_RECORD_WITH_DOG}
`;

export const GET_HEALTH_SUMMARY = gql`
  query GetHealthSummary($dogId: ID!) {
    healthSummary(dogId: $dogId) {
      recordCount
      latestExamDate
      recordsByType {
        type
        count
      }
      recentRecords {
        ...HealthRecordFields
      }
      vaccinationStatus {
        isUpToDate
        nextDueDate
        missingVaccinations
      }
    }
  }
  ${HEALTH_RECORD_FIELDS}
`;

// =====================
// Health Record Mutations
// =====================

export const CREATE_HEALTH_RECORD = gql`
  mutation CreateHealthRecord($input: CreateHealthRecordInput!) {
    createHealthRecord(input: $input) {
      ...HealthRecordFields
    }
  }
  ${HEALTH_RECORD_FIELDS}
`;

export const UPDATE_HEALTH_RECORD = gql`
  mutation UpdateHealthRecord($id: ID!, $input: UpdateHealthRecordInput!) {
    updateHealthRecord(id: $id, input: $input) {
      ...HealthRecordFields
    }
  }
  ${HEALTH_RECORD_FIELDS}
`;

export const DELETE_HEALTH_RECORD = gql`
  mutation DeleteHealthRecord($id: ID!) {
    deleteHealthRecord(id: $id) {
      success
      message
    }
  }
`;

export const UPLOAD_HEALTH_RECORD_ATTACHMENT = gql`
  mutation UploadHealthRecordAttachment($healthRecordId: ID!, $fileUrl: String!) {
    uploadHealthRecordAttachment(healthRecordId: $healthRecordId, fileUrl: $fileUrl) {
      id
      attachmentUrl
      attachments
    }
  }
`;
