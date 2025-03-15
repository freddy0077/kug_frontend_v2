# Ownerships API

This document outlines the GraphQL API for managing dog ownerships in the Dog Pedigree System.

## Types

### Ownership

```graphql
type Ownership {
  id: ID!
  dog: Dog!
  owner: Owner!
  startDate: DateTime!
  endDate: DateTime
  is_current: Boolean!  # Note: field is is_current (not is_active)
  transferDocumentUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Owner {
  id: ID!
  user: User
  name: String!
  contactEmail: String
  contactPhone: String
  address: String
  ownerships: [Ownership]
  currentDogs: [Dog]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type OwnershipHistory {
  dog: Dog!
  ownerships: [Ownership!]!
}
```

## Queries

### getDogOwnerships

Fetches ownership history for a specific dog.

```graphql
query getDogOwnerships($dogId: ID!) {
  dogOwnerships(dogId: $dogId) {
    dog {
      id
      name
      breed
      registrationNumber
    }
    ownerships {
      id
      startDate
      endDate
      is_current
      owner {
        id
        name
        contactEmail
      }
      transferDocumentUrl
    }
  }
}
```

### getOwnerDogs

Fetches all dogs owned by a particular owner.

```graphql
query getOwnerDogs(
  $ownerId: ID!
  $includeFormer: Boolean = false
  $offset: Int = 0
  $limit: Int = 20
) {
  ownerDogs(
    ownerId: $ownerId
    includeFormer: $includeFormer
    offset: $offset
    limit: $limit
  ) {
    totalCount
    hasMore
    items {
      id
      dog {
        id
        name
        breed
        dateOfBirth
        registrationNumber
        mainImageUrl
      }
      startDate
      endDate
      is_current
    }
  }
}
```

### getOwnership

Fetches details about a specific ownership record.

```graphql
query getOwnership($id: ID!) {
  ownership(id: $id) {
    id
    startDate
    endDate
    is_current
    transferDocumentUrl
    dog {
      id
      name
      breed
      registrationNumber
      mainImageUrl
    }
    owner {
      id
      name
      contactEmail
      contactPhone
      address
      user {
        id
        email
      }
    }
  }
}
```

## Mutations

### createOwnership

Creates a new ownership record.

```graphql
mutation createOwnership($input: CreateOwnershipInput!) {
  createOwnership(input: $input) {
    id
    startDate
    is_current
    dog {
      id
      name
    }
    owner {
      id
      name
    }
  }
}

input CreateOwnershipInput {
  dogId: ID!
  ownerId: ID!
  startDate: DateTime!
  is_current: Boolean!
  transferDocumentUrl: String
}
```

### transferOwnership

Transfers ownership of a dog from one owner to another.

```graphql
mutation transferOwnership($input: TransferOwnershipInput!) {
  transferOwnership(input: $input) {
    previousOwnership {
      id
      owner {
        id
        name
      }
      endDate
      is_current
    }
    newOwnership {
      id
      owner {
        id
        name
      }
      startDate
      is_current
    }
    dog {
      id
      name
    }
  }
}

input TransferOwnershipInput {
  dogId: ID!
  newOwnerId: ID!
  transferDate: DateTime!
  transferDocumentUrl: String
}
```

### updateOwnership

Updates an existing ownership record.

```graphql
mutation updateOwnership($id: ID!, $input: UpdateOwnershipInput!) {
  updateOwnership(id: $id, input: $input) {
    id
    startDate
    endDate
    is_current
    transferDocumentUrl
  }
}

input UpdateOwnershipInput {
  startDate: DateTime
  endDate: DateTime
  is_current: Boolean
  transferDocumentUrl: String
}
```

### deleteOwnership

Deletes an ownership record (with authorization checks).

```graphql
mutation deleteOwnership($id: ID!) {
  deleteOwnership(id: $id) {
    success
    message
  }
}
```

## Error Handling

- `OWNERSHIP_NOT_FOUND`: When requested ownership record does not exist
- `DOG_NOT_FOUND`: When referenced dog does not exist
- `OWNER_NOT_FOUND`: When referenced owner does not exist
- `INVALID_OWNERSHIP_DATA`: When input data fails validation
- `OWNERSHIP_CONFLICT`: When attempting to create conflicting ownership records
- `UNAUTHORIZED_OWNERSHIP_ACCESS`: When user lacks permission to manage ownerships
- `INVALID_DATE_FORMAT`: When date fields are not valid Date objects

## Frontend Components Using This API

- Dog Ownership Page (`/src/app/manage/dogs/[id]/ownerships/page.tsx`)
- Ownership History Component (`/src/components/ownerships/OwnershipHistory.tsx`)
- Ownership Transfer Form (`/src/components/ownerships/OwnershipTransferForm.tsx`)
- Owner Dogs Listing Page (`/src/app/ownerships/page.tsx`)
