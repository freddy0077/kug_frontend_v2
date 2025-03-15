# Pedigree API

This document outlines the GraphQL API for managing dog pedigree and breeding information in the Dog Pedigree System.

## Types

### PedigreeNode

```graphql
type PedigreeNode {
  id: ID!
  name: String!
  registrationNumber: String!
  breed: String!
  gender: String!
  dateOfBirth: DateTime!  # Always a valid Date, never undefined
  color: String
  titles: [String]
  mainImageUrl: String
  coefficient: Float  # Inbreeding coefficient if calculated
  sire: PedigreeNode
  dam: PedigreeNode
}

type BreedingRecord {
  id: ID!
  sire: Dog!
  dam: Dog!
  breedingDate: DateTime!
  litterSize: Int
  comments: String
  puppies: [Dog]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type LinebreakingAnalysis {
  dog: Dog!
  inbreedingCoefficient: Float!
  commonAncestors: [CommonAncestor!]!
  geneticDiversity: Float!
  recommendations: [String!]!
}

type CommonAncestor {
  dog: PedigreeNode!
  occurrences: Int!
  pathways: [String!]!
  contribution: Float!
}
```

## Queries

### getDogPedigree

Fetches the pedigree tree for a dog up to a specified number of generations.

```graphql
query getDogPedigree($dogId: ID!, $generations: Int = 3) {
  dogPedigree(dogId: $dogId, generations: $generations) {
    id
    name
    registrationNumber
    breed
    gender
    dateOfBirth
    color
    titles
    mainImageUrl
    coefficient
    sire {
      id
      name
      registrationNumber
      breed
      gender
      dateOfBirth
      mainImageUrl
      sire {
        # Recursive structure continues based on generations parameter
      }
      dam {
        # Recursive structure continues based on generations parameter
      }
    }
    dam {
      id
      name
      registrationNumber
      breed
      gender
      dateOfBirth
      mainImageUrl
      sire {
        # Recursive structure continues based on generations parameter
      }
      dam {
        # Recursive structure continues based on generations parameter
      }
    }
  }
}
```

### getBreedingRecords

Fetches breeding records for a specific dog, either as sire or dam.

```graphql
query getBreedingRecords(
  $dogId: ID!
  $role: BreedingRole  # SIRE, DAM, or BOTH
  $offset: Int = 0
  $limit: Int = 20
) {
  breedingRecords(
    dogId: $dogId
    role: $role
    offset: $offset
    limit: $limit
  ) {
    totalCount
    hasMore
    items {
      id
      breedingDate
      litterSize
      comments
      sire {
        id
        name
        breed
        registrationNumber
        mainImageUrl
      }
      dam {
        id
        name
        breed
        registrationNumber
        mainImageUrl
      }
      puppies {
        id
        name
        registrationNumber
      }
    }
  }
}
```

### analyzeLinebreeding

Analyzes linebreeding for a potential breeding pair.

```graphql
query analyzeLinebreeding($sireId: ID!, $damId: ID!, $generations: Int = 6) {
  linebreedingAnalysis(sireId: $sireId, damId: $damId, generations: $generations) {
    inbreedingCoefficient
    commonAncestors {
      dog {
        id
        name
        registrationNumber
      }
      occurrences
      pathways
      contribution
    }
    geneticDiversity
    recommendations
  }
}
```

## Mutations

### createBreedingRecord

Creates a new breeding record.

```graphql
mutation createBreedingRecord($input: BreedingRecordInput!) {
  createBreedingRecord(input: $input) {
    id
    breedingDate
    litterSize
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

input BreedingRecordInput {
  sireId: ID!
  damId: ID!
  breedingDate: DateTime!  # Must be a valid Date
  litterSize: Int
  comments: String
  puppyIds: [ID]
}
```

### updateBreedingRecord

Updates an existing breeding record.

```graphql
mutation updateBreedingRecord($id: ID!, $input: UpdateBreedingRecordInput!) {
  updateBreedingRecord(id: $id, input: $input) {
    id
    breedingDate
    litterSize
    comments
    puppies {
      id
      name
    }
  }
}

input UpdateBreedingRecordInput {
  breedingDate: DateTime
  litterSize: Int
  comments: String
  puppyIds: [ID]
}
```

### linkDogToParents

Links a dog to its parents in the pedigree.

```graphql
mutation linkDogToParents($dogId: ID!, $sireId: ID, $damId: ID) {
  linkDogToParents(dogId: $dogId, sireId: $sireId, damId: $damId) {
    id
    name
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
```

## Error Handling

- `DOG_NOT_FOUND`: When requested dog does not exist
- `INVALID_PEDIGREE_DATA`: When input data fails validation
- `INCOMPATIBLE_BREEDING_PAIR`: When sire and dam are incompatible (same gender, etc.)
- `CIRCULAR_PEDIGREE_REFERENCE`: When attempting to create circular references in pedigree
- `UNAUTHORIZED_BREEDING_RECORD_ACCESS`: When user lacks permission to manage breeding records
- `INVALID_DATE_FORMAT`: When date fields are not valid Date objects

## Frontend Components Using This API

- Dog Pedigree View Page (`/src/app/dogs/[id]/pedigree/page.tsx`)
- Pedigree Tree Component (`/src/components/pedigree/PedigreeTree.tsx`)
- Breeding Records Page (`/src/app/manage/dogs/[id]/breeding/page.tsx`)
- Linebreeding Analysis Tool (`/src/components/breeding/LinebreedingAnalysisTool.tsx`)
