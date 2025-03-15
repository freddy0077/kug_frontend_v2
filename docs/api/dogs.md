# Dogs API

This document outlines the GraphQL API for dog management in the Dog Pedigree System.

## Types

### Dog

```graphql
type Dog {
  id: ID!
  name: String!
  breed: String!
  gender: String!
  dateOfBirth: DateTime!  # Always required as Date, never undefined
  dateOfDeath: DateTime
  color: String
  registrationNumber: String!
  microchipNumber: String
  titles: [String]
  isNeutered: Boolean
  height: Float
  weight: Float
  biography: String
  mainImageUrl: String
  images: [DogImage]
  ownerships: [Ownership]
  currentOwner: Owner
  healthRecords: [HealthRecord]
  competitionResults: [CompetitionResult]
  sire: Dog
  dam: Dog
  offspring: [Dog]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type DogImage {
  id: ID!
  url: String!
  caption: String
  isPrimary: Boolean!
  createdAt: DateTime!
}

type Ownership {
  id: ID!
  owner: Owner!
  dog: Dog!
  startDate: DateTime!
  endDate: DateTime
  is_current: Boolean!  # Note field name is_current (not is_active)
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Owner {
  id: ID!
  userId: ID
  name: String!
  contactEmail: String
  contactPhone: String
  address: String
  dogs: [Dog]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type HealthRecord {
  id: ID!
  dog: Dog!
  date: DateTime!
  veterinarian: String
  description: String!  # Note: field is description (not diagnosis)
  results: String  # Note: field is results (not test_results)
  attachmentUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

## Queries

### getDogs

Fetches a paginated list of dogs with optional filtering.

```graphql
query getDogs(
  $offset: Int = 0
  $limit: Int = 20
  $searchTerm: String
  $breed: String
  $gender: String
  $ownerId: ID
  $sortBy: DogSortField = NAME
  $sortDirection: SortDirection = ASC
) {
  dogs(
    offset: $offset
    limit: $limit
    searchTerm: $searchTerm
    breed: $breed
    gender: $gender
    ownerId: $ownerId
    sortBy: $sortBy
    sortDirection: $sortDirection
  ) {
    totalCount
    hasMore
    items {
      id
      name
      breed
      gender
      dateOfBirth
      registrationNumber
      mainImageUrl
      currentOwner {
        id
        name
      }
    }
  }
}
```

### getDog

Fetches detailed information about a specific dog.

```graphql
query getDog($id: ID!) {
  dog(id: $id) {
    id
    name
    breed
    gender
    dateOfBirth
    dateOfDeath
    color
    registrationNumber
    microchipNumber
    titles
    isNeutered
    height
    weight
    biography
    mainImageUrl
    images {
      id
      url
      caption
      isPrimary
    }
    sire {
      id
      name
      registrationNumber
      mainImageUrl
    }
    dam {
      id
      name
      registrationNumber
      mainImageUrl
    }
    currentOwner {
      id
      name
      contactEmail
      contactPhone
    }
    healthRecords {
      id
      date
      veterinarian
      description
      results
    }
    competitionResults {
      id
      eventName
      eventDate
      category
      rank
      title_earned
      points
    }
  }
}
```

### getDogPedigree

Fetches the pedigree tree for a dog (3-4 generations).

```graphql
query getDogPedigree($dogId: ID!, $generations: Int = 3) {
  dogPedigree(dogId: $dogId, generations: $generations) {
    id
    name
    registrationNumber
    mainImageUrl
    sire {
      id
      name
      registrationNumber
      mainImageUrl
      sire {
        # Repeat structure for desired generations
      }
      dam {
        # Repeat structure for desired generations
      }
    }
    dam {
      id
      name
      registrationNumber
      mainImageUrl
      sire {
        # Repeat structure for desired generations
      }
      dam {
        # Repeat structure for desired generations
      }
    }
  }
}
```

## Mutations

### createDog

Creates a new dog record with owner association.

```graphql
mutation createDog($input: CreateDogInput!) {
  createDog(input: $input) {
    id
    name
    breed
    dateOfBirth
    registrationNumber
  }
}

input CreateDogInput {
  name: String!
  breed: String!
  gender: String!
  dateOfBirth: DateTime!  # Must be a valid Date, never undefined
  dateOfDeath: DateTime
  color: String
  registrationNumber: String!
  microchipNumber: String
  titles: [String]
  isNeutered: Boolean
  height: Float
  weight: Float
  biography: String
  mainImageUrl: String
  sireId: ID
  damId: ID
  ownerId: ID!
}
```

### updateDog

Updates an existing dog record.

```graphql
mutation updateDog($id: ID!, $input: UpdateDogInput!) {
  updateDog(id: $id, input: $input) {
    id
    name
    # ... other updated fields
  }
}

input UpdateDogInput {
  name: String
  breed: String
  gender: String
  dateOfBirth: DateTime
  dateOfDeath: DateTime
  color: String
  registrationNumber: String
  microchipNumber: String
  titles: [String]
  isNeutered: Boolean
  height: Float
  weight: Float
  biography: String
  mainImageUrl: String
  sireId: ID
  damId: ID
}
```

### addDogImage

Adds a new image to a dog's gallery.

```graphql
mutation addDogImage($dogId: ID!, $input: DogImageInput!) {
  addDogImage(dogId: $dogId, input: $input) {
    id
    url
    caption
    isPrimary
  }
}

input DogImageInput {
  url: String!
  caption: String
  isPrimary: Boolean
}
```

### deleteDog

Deletes a dog record (with authorization checks).

```graphql
mutation deleteDog($id: ID!) {
  deleteDog(id: $id) {
    success
    message
  }
}
```

## Error Handling

- `DOG_NOT_FOUND`: When requested dog does not exist
- `INVALID_DOG_DATA`: When input data fails validation
- `UNAUTHORIZED_DOG_ACCESS`: When user lacks permission to edit/delete dog
- `REGISTRATION_NUMBER_EXISTS`: When attempting to create a dog with existing registration number
- `INVALID_DATE_FORMAT`: When date fields are not proper Date objects

## Frontend Components Using This API

- Dog Search Page (`/src/app/dogs/page.tsx`)
- Dog Detail Page (`/src/app/dogs/[id]/page.tsx`)
- Dog Health Records Page (`/src/app/manage/dogs/[id]/health/page.tsx`)
- Dog Pedigree View (`/src/components/dogs/DogPedigreeTree.tsx`)
- Dog Profile Edit Form (`/src/components/dogs/DogForm.tsx`)
