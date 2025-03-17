# Litter Registration API

This documentation provides a comprehensive overview of the GraphQL API endpoints for litter registration in the Dog Pedigree Database System.

## Queries

### Get Litters (`getLitters`)

Retrieves a paginated list of litters with various filtering options.

```graphql
query getLitters(
  $offset: Int = 0
  $limit: Int = 20
  $ownerId: ID
  $breedId: ID
  $fromDate: String
  $toDate: String
  $searchTerm: String
) {
  litters(
    offset: $offset
    limit: $limit
    ownerId: $ownerId
    breedId: $breedId
    fromDate: $fromDate
    toDate: $toDate
    searchTerm: $searchTerm
  ) {
    totalCount
    hasMore
    items {
      id
      litterName
      registrationNumber
      whelpingDate
      totalPuppies
      malePuppies
      femalePuppies
      sire { ... }
      dam { ... }
      puppies { ... }
      createdAt
      updatedAt
    }
  }
}
```

#### Parameters:
- `offset` (Int, Optional): Starting position in the results list. Default: 0
- `limit` (Int, Optional): Maximum number of results to return. Default: 20
- `ownerId` (ID, Optional): Filter litters by owner ID
- `breedId` (ID, Optional): Filter litters by breed ID
- `fromDate` (String, Optional): Filter litters with whelping date on or after this date
- `toDate` (String, Optional): Filter litters with whelping date on or before this date
- `searchTerm` (String, Optional): Search term to filter litters by name or registration number

#### Returns:
- `totalCount` (Int): Total number of litters matching the query
- `hasMore` (Boolean): Indicates if there are more results beyond the current page
- `items` (Array): List of litter objects matching the query

### Get Litter (`getLitter`)

Retrieves detailed information about a specific litter by ID.

```graphql
query getLitter($id: ID!) {
  litter(id: $id) {
    id
    litterName
    registrationNumber
    breedingRecordId
    whelpingDate
    totalPuppies
    malePuppies
    femalePuppies
    notes
    sire { ... }
    dam { ... }
    puppies { ... }
    createdAt
    updatedAt
  }
}
```

#### Parameters:
- `id` (ID, Required): The unique identifier of the litter to retrieve

#### Returns:
Detailed litter object including:
- Basic litter information (name, registration number, dates, etc.)
- Sire details including owner information
- Dam details including owner information
- Complete list of puppies with details
- Timestamps for creation and last update

### Get Dog Litters (`getDogLitters`)

Retrieves litters associated with a specific dog (as sire, dam, or both).

```graphql
query getDogLitters(
  $dogId: ID!
  $role: DogRole = BOTH
  $offset: Int = 0
  $limit: Int = 20
) {
  dogLitters(
    dogId: $dogId
    role: $role
    offset: $offset
    limit: $limit
  ) {
    totalCount
    hasMore
    items { ... }
  }
}
```

#### Parameters:
- `dogId` (ID, Required): ID of the dog to retrieve litters for
- `role` (DogRole, Optional): Filter by the dog's role in the litter. Enum: `SIRE`, `DAM`, or `BOTH`. Default: `BOTH`
- `offset` (Int, Optional): Starting position in the results list. Default: 0
- `limit` (Int, Optional): Maximum number of results to return. Default: 20

#### Returns:
- Paginated list of litters where the specified dog is either sire, dam, or both

## Mutations

### Create Litter (`createLitter`)

Creates a new litter record.

```graphql
mutation createLitter($input: LitterInput!) {
  createLitter(input: $input) {
    id
    litterName
    registrationNumber
    breedingRecordId
    whelpingDate
    totalPuppies
    malePuppies
    femalePuppies
    sire { ... }
    dam { ... }
    puppies { ... }
    notes
    createdAt
    updatedAt
  }
}
```

#### Parameters:
- `input` (LitterInput, Required): Object containing all required litter details

#### LitterInput Schema:
```typescript
interface LitterInput {
  breedingRecordId?: string;
  sireId: string;
  damId: string;
  litterName: string;
  registrationNumber?: string;
  whelpingDate: string; // ISO format date string
  totalPuppies: number;
  malePuppies?: number;
  femalePuppies?: number;
  puppyDetails?: PuppyDetailInput[];
  notes?: string;
}

interface PuppyDetailInput {
  name: string;
  gender: 'male' | 'female';
  color?: string;
  markings?: string;
  microchipNumber?: string;
  isCollapsed?: boolean;
}
```

#### Returns:
- The newly created litter object with all details including an assigned ID

### Update Litter (`updateLitter`)

Updates an existing litter's details.

```graphql
mutation updateLitter($id: ID!, $input: UpdateLitterInput!) {
  updateLitter(id: $id, input: $input) {
    id
    litterName
    registrationNumber
    whelpingDate
    totalPuppies
    malePuppies
    femalePuppies
    notes
    puppies { ... }
    updatedAt
  }
}
```

#### Parameters:
- `id` (ID, Required): ID of the litter to update
- `input` (UpdateLitterInput, Required): Object containing fields to update

#### UpdateLitterInput Schema:
```typescript
interface UpdateLitterInput {
  litterName?: string;
  registrationNumber?: string;
  whelpingDate?: string;
  totalPuppies?: number;
  malePuppies?: number;
  femalePuppies?: number;
  notes?: string;
  puppyIds?: string[];
}
```

#### Returns:
- The updated litter object with the modified fields

### Register Litter Puppies (`registerLitterPuppies`)

Registers multiple puppies from a litter at once.

```graphql
mutation registerLitterPuppies($input: RegisterLitterPuppiesInput!) {
  registerLitterPuppies(input: $input) {
    success
    message
    puppies {
      id
      name
      gender
      dateOfBirth
      breed
      color
      litterId
    }
  }
}
```

#### Parameters:
- `input` (RegisterLitterPuppiesInput, Required): Object containing litter ID and puppy details

#### RegisterLitterPuppiesInput Schema:
```typescript
interface RegisterLitterPuppiesInput {
  litterId: string;
  puppies: {
    name: string;
    gender: string;
    color: string;
    microchipNumber?: string;
    isNeutered?: boolean;
  }[];
}
```

#### Returns:
- `success` (Boolean): Indicates if the operation was successful
- `message` (String): Success or error message
- `puppies` (Array): List of newly registered puppy objects with assigned IDs

## Common Object Types

### Litter Object
```typescript
interface Litter {
  id: string;
  litterName: string;
  registrationNumber?: string;
  breedingRecordId?: string;
  whelpingDate: string;
  totalPuppies: number;
  malePuppies?: number;
  femalePuppies?: number;
  notes?: string;
  sire: Dog;
  dam: Dog;
  puppies: Puppy[];
  createdAt: string;
  updatedAt: string;
}
```

### Dog Object (Sire/Dam)
```typescript
interface Dog {
  id: string;
  name: string;
  breed: string;
  registrationNumber?: string;
  mainImageUrl?: string;
  color?: string;
  titles?: string[];
  owner?: Owner;
}
```

### Puppy Object
```typescript
interface Puppy {
  id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  color?: string;
  markings?: string;
  microchipNumber?: string;
  mainImageUrl?: string;
  litterId: string;
  owner?: Owner;
}
```

### Owner Object
```typescript
interface Owner {
  id: string;
  name: string;
  email: string;
}
```

## Access Control

Access to litter registration features is role-based:

| Operation | Admin | Owner | Breeder | Regular User |
|-----------|-------|-------|---------|--------------|
| Query Litters | ✅ | ✅ | ✅ | ✅ |
| Query Litter Details | ✅ | ✅ | ✅ | ✅ |
| Create Litter | ✅ | ✅ | ✅ | ❌ |
| Update Litter | ✅ | ✅ (own) | ✅ (own) | ❌ |
| Register Puppies | ✅ | ✅ (own) | ✅ (own) | ❌ |

## Error Handling

All API operations may return errors in the standard GraphQL error format. Common error scenarios include:

- Invalid input data (missing required fields, invalid formats)
- Authorization errors (insufficient permissions)
- Resource not found errors (invalid IDs)
- Validation errors (e.g., whelping date in the future)

Error responses include descriptive messages to help diagnose and resolve issues.

## Date Format Considerations

When working with dates in the litter registration system:

- All date fields should be provided in ISO 8601 format (`YYYY-MM-DD`)
- The `whelpingDate` field is required and must be a valid date in the past
- The system automatically validates date formats and provides descriptive error messages
- When registering puppies, the `dateOfBirth` is automatically set to the litter's `whelpingDate`
