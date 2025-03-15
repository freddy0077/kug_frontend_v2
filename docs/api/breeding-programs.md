# Breeding Programs API

This document outlines the GraphQL API for breeding program management in the Dog Pedigree System.

## Types

### BreedingProgram

```graphql
type BreedingProgram {
  id: ID!
  name: String!
  description: String!
  breeder: Owner!
  breederId: ID!
  breed: String!
  goals: [String!]!
  startDate: DateTime!  # Always a valid Date object
  endDate: DateTime
  status: BreedingProgramStatus!
  foundationDogs: [Dog!]!
  breedingPairs: [BreedingPair!]!
  resultingLitters: [BreedingRecord!]!
  geneticTestingProtocol: String
  selectionCriteria: String
  notes: String
  isPublic: Boolean!
  imageUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type BreedingPair {
  id: ID!
  program: BreedingProgram!
  sire: Dog!
  dam: Dog!
  plannedBreedingDate: DateTime
  compatibilityNotes: String
  geneticCompatibilityScore: Float
  breedingRecords: [BreedingRecord!]
  status: BreedingPairStatus!
}

enum BreedingProgramStatus {
  PLANNING
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

enum BreedingPairStatus {
  PLANNED
  APPROVED
  PENDING_TESTING
  BREEDING_SCHEDULED
  BRED
  UNSUCCESSFUL
  CANCELLED
}
```

## Queries

### getBreedingPrograms

Fetches a paginated list of breeding programs with optional filtering.

```graphql
query getBreedingPrograms(
  $offset: Int = 0
  $limit: Int = 20
  $searchTerm: String
  $breederId: ID
  $breed: String
  $status: BreedingProgramStatus
  $includePrivate: Boolean = false
) {
  breedingPrograms(
    offset: $offset
    limit: $limit
    searchTerm: $searchTerm
    breederId: $breederId
    breed: $breed
    status: $status
    includePrivate: $includePrivate
  ) {
    totalCount
    hasMore
    items {
      id
      name
      breed
      breeder {
        id
        name
      }
      startDate
      status
      imageUrl
      isPublic
    }
  }
}
```

### getBreedingProgramById

Fetches detailed information about a specific breeding program.

```graphql
query getBreedingProgramById($id: ID!) {
  breedingProgram(id: $id) {
    id
    name
    description
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
    breeder {
      id
      name
      contactEmail
    }
    foundationDogs {
      id
      name
      gender
      registrationNumber
      dateOfBirth
      mainImageUrl
    }
    breedingPairs {
      id
      sire {
        id
        name
        registrationNumber
      }
      dam {
        id
        name
        registrationNumber
      }
      plannedBreedingDate
      status
    }
    resultingLitters {
      id
      breedingDate
      litterSize
    }
  }
}
```

### getBreedingPairById

Fetches detailed information about a specific breeding pair.

```graphql
query getBreedingPairById($id: ID!) {
  breedingPair(id: $id) {
    id
    status
    plannedBreedingDate
    compatibilityNotes
    geneticCompatibilityScore
    program {
      id
      name
    }
    sire {
      id
      name
      breed
      registrationNumber
      dateOfBirth
      color
      titles
      mainImageUrl
    }
    dam {
      id
      name
      breed
      registrationNumber
      dateOfBirth
      color
      titles
      mainImageUrl
    }
    breedingRecords {
      id
      breedingDate
      litterSize
      puppies {
        id
        name
        registrationNumber
      }
    }
  }
}
```

## Mutations

### createBreedingProgram

Creates a new breeding program.

```graphql
mutation createBreedingProgram($input: CreateBreedingProgramInput!) {
  createBreedingProgram(input: $input) {
    id
    name
    breed
    status
  }
}

input CreateBreedingProgramInput {
  name: String!
  description: String!
  breederId: ID!
  breed: String!
  goals: [String!]!
  startDate: DateTime!  # Must be a valid Date object
  endDate: DateTime
  geneticTestingProtocol: String
  selectionCriteria: String
  notes: String
  isPublic: Boolean!
  imageUrl: String
  foundationDogIds: [ID!]!
}
```

### updateBreedingProgram

Updates an existing breeding program.

```graphql
mutation updateBreedingProgram($id: ID!, $input: UpdateBreedingProgramInput!) {
  updateBreedingProgram(id: $id, input: $input) {
    id
    name
    description
    goals
    status
    # Other updated fields
  }
}

input UpdateBreedingProgramInput {
  name: String
  description: String
  breed: String
  goals: [String!]
  startDate: DateTime
  endDate: DateTime
  status: BreedingProgramStatus
  geneticTestingProtocol: String
  selectionCriteria: String
  notes: String
  isPublic: Boolean
  imageUrl: String
  foundationDogIds: [ID!]
}
```

### addBreedingPair

Adds a new breeding pair to a program.

```graphql
mutation addBreedingPair($input: CreateBreedingPairInput!) {
  addBreedingPair(input: $input) {
    id
    status
    sire {
      id
      name
    }
    dam {
      id
      name
    }
  }
}

input CreateBreedingPairInput {
  programId: ID!
  sireId: ID!
  damId: ID!
  plannedBreedingDate: DateTime
  compatibilityNotes: String
  status: BreedingPairStatus!
}
```

### updateBreedingPairStatus

Updates the status of a breeding pair.

```graphql
mutation updateBreedingPairStatus($id: ID!, $status: BreedingPairStatus!, $notes: String) {
  updateBreedingPairStatus(id: $id, status: $status, notes: $notes) {
    id
    status
    compatibilityNotes
  }
}
```

### linkLitterToBreedingPair

Links a resulting litter to a breeding pair.

```graphql
mutation linkLitterToBreedingPair($breedingPairId: ID!, $breedingRecordId: ID!) {
  linkLitterToBreedingPair(breedingPairId: $breedingPairId, breedingRecordId: $breedingRecordId) {
    id
    status
    breedingRecords {
      id
      breedingDate
      litterSize
    }
  }
}
```

## Error Handling

- `BREEDING_PROGRAM_NOT_FOUND`: When requested breeding program does not exist
- `BREEDING_PAIR_NOT_FOUND`: When requested breeding pair does not exist
- `INVALID_BREEDING_DATA`: When input data fails validation
- `OWNER_NOT_FOUND`: When referenced breeder does not exist
- `DOG_NOT_FOUND`: When referenced dog does not exist
- `INCOMPATIBLE_BREEDING`: When attempting to pair incompatible dogs
- `UNAUTHORIZED_BREEDING_ACCESS`: When user lacks permission to manage breeding programs
- `INVALID_DATE_FORMAT`: When date fields are not valid Date objects
- `INVALID_STATUS_TRANSITION`: When attempting an invalid status change

## Frontend Components Using This API

- Breeding Programs Listing Page (`/src/app/breeding-programs/page.tsx`)
- Breeding Program Detail Page (`/src/app/breeding-programs/[id]/page.tsx`) 
- Breeding Program Form (`/src/components/breeding/BreedingProgramForm.tsx`)
- Breeding Pair Component (`/src/components/breeding/BreedingPairCard.tsx`)
- Linebreeding Coefficient Calculator (`/src/components/breeding/LinebreedingAnalysisTool.tsx`)
