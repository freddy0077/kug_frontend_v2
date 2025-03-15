# Health Records API

This document outlines the GraphQL API for managing dog health records in the Dog Pedigree System.

## Types

### HealthRecord

```graphql
type HealthRecord {
  id: ID!
  dog: Dog!
  dogId: ID!
  date: DateTime!
  veterinarian: String
  description: String!  # Note: field is description (not diagnosis)
  results: String  # Note: field is results (not test_results)
  type: HealthRecordType!
  attachmentUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum HealthRecordType {
  VACCINATION
  EXAMINATION
  TREATMENT
  SURGERY
  TEST
  OTHER
}
```

## Queries

### getDogHealthRecords

Fetches a paginated list of health records for a specific dog.

```graphql
query getDogHealthRecords(
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
      id
      date
      veterinarian
      description
      results
      type
      attachmentUrl
    }
  }
}
```

### getHealthRecordById

Fetches detailed information about a specific health record.

```graphql
query getHealthRecordById($id: ID!) {
  healthRecord(id: $id) {
    id
    date
    veterinarian
    description
    results
    type
    attachmentUrl
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
    createdAt
    updatedAt
  }
}
```

### getHealthSummary

Fetches a summary of a dog's health history.

```graphql
query getHealthSummary($dogId: ID!) {
  healthSummary(dogId: $dogId) {
    recordCount
    latestExamDate
    recordsByType {
      type
      count
    }
    recentRecords {
      id
      date
      type
      description
    }
    vaccinationStatus {
      isUpToDate
      nextDueDate
      missingVaccinations
    }
  }
}
```

## Mutations

### createHealthRecord

Creates a new health record for a dog.

```graphql
mutation createHealthRecord($input: CreateHealthRecordInput!) {
  createHealthRecord(input: $input) {
    id
    date
    type
    description
    results
  }
}

input CreateHealthRecordInput {
  dogId: ID!
  date: DateTime!  # Must be a valid Date object
  veterinarian: String
  description: String!  # Note: field is description (not diagnosis)
  results: String  # Note: field is results (not test_results)
  type: HealthRecordType!
  attachmentUrl: String
}
```

### updateHealthRecord

Updates an existing health record.

```graphql
mutation updateHealthRecord($id: ID!, $input: UpdateHealthRecordInput!) {
  updateHealthRecord(id: $id, input: $input) {
    id
    date
    veterinarian
    description
    results
    type
    attachmentUrl
  }
}

input UpdateHealthRecordInput {
  date: DateTime
  veterinarian: String
  description: String
  results: String
  type: HealthRecordType
  attachmentUrl: String
}
```

### deleteHealthRecord

Deletes a health record (with authorization checks).

```graphql
mutation deleteHealthRecord($id: ID!) {
  deleteHealthRecord(id: $id) {
    success
    message
  }
}
```

### uploadHealthRecordAttachment

Uploads an attachment for a health record.

```graphql
mutation uploadHealthRecordAttachment($healthRecordId: ID!, $file: Upload!) {
  uploadHealthRecordAttachment(healthRecordId: $healthRecordId, file: $file) {
    attachmentUrl
  }
}
```

## Error Handling

- `HEALTH_RECORD_NOT_FOUND`: When requested health record does not exist
- `INVALID_HEALTH_RECORD_DATA`: When input data fails validation
- `UNAUTHORIZED_HEALTH_RECORD_ACCESS`: When user lacks permission to manage records
- `DOG_NOT_FOUND`: When referenced dog does not exist
- `INVALID_DATE_FORMAT`: When date fields are not valid Date objects
- `FILE_UPLOAD_ERROR`: When attachment upload fails

## Frontend Components Using This API

- Dog Health Records Page (`/src/app/manage/dogs/[id]/health/page.tsx`)
- Health Record Form (`/src/components/health/HealthRecordForm.tsx`)
- Health Summary Component (`/src/components/health/HealthSummary.tsx`)
- Vaccination Status Card (`/src/components/health/VaccinationStatus.tsx`)
