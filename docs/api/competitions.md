# Competitions API

This document outlines the GraphQL API for competition management in the Dog Pedigree System.

## Types

### CompetitionResult

```graphql
type CompetitionResult {
  id: ID!
  dog: Dog!
  dogId: ID!
  dogName: String!
  eventName: String!
  eventDate: DateTime!
  location: String!
  rank: Int!
  title_earned: String  # Note the field name is title_earned (not certificate)
  judge: String!
  points: Float!
  category: String!
  description: String
  totalParticipants: Int
  imageUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum CompetitionCategory {
  CONFORMATION
  OBEDIENCE
  AGILITY
  FIELD_TRIALS
  HERDING
  TRACKING
  RALLY
  SCENT_WORK
}

type CompetitionStats {
  totalCompetitions: Int!
  totalWins: Int!
  categoryCounts: [CategoryCount!]!
  pointsByCategory: [PointsByCategory!]!
  recentResults: [CompetitionResult!]!
}

type CategoryCount {
  category: String!
  count: Int!
}

type PointsByCategory {
  category: String!
  points: Float!
}
```

## Queries

### getCompetitions

Fetches a paginated list of competitions with optional filtering.

```graphql
query getCompetitions(
  $offset: Int = 0
  $limit: Int = 20
  $searchTerm: String
  $category: String
  $dogId: ID
  $startDate: DateTime
  $endDate: DateTime
  $sortBy: CompetitionSortField = EVENT_DATE
  $sortDirection: SortDirection = DESC
) {
  competitions(
    offset: $offset
    limit: $limit
    searchTerm: $searchTerm
    category: $category
    dogId: $dogId
    startDate: $startDate
    endDate: $endDate
    sortBy: $sortBy
    sortDirection: $sortDirection
  ) {
    totalCount
    hasMore
    items {
      id
      dogId
      dogName
      eventName
      eventDate
      location
      rank
      title_earned
      category
      imageUrl
    }
  }
}
```

### getCompetitionById

Fetches detailed information about a specific competition.

```graphql
query getCompetitionById($id: ID!) {
  competition(id: $id) {
    id
    eventName
    eventDate
    location
    rank
    title_earned
    judge
    points
    category
    description
    totalParticipants
    imageUrl
    dog {
      id
      name
      breed
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

### getDogCompetitionStats

Fetches competition statistics for a specific dog.

```graphql
query getDogCompetitionStats($dogId: ID!) {
  dogCompetitionStats(dogId: $dogId) {
    totalCompetitions
    totalWins
    categoryCounts {
      category
      count
    }
    pointsByCategory {
      category
      points
    }
    recentResults {
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

### getRelatedCompetitions

Fetches competitions related to a specific competition by dog or category.

```graphql
query getRelatedCompetitions(
  $competitionId: ID!
  $dogId: ID
  $category: String
  $limit: Int = 3
) {
  relatedCompetitions(
    competitionId: $competitionId
    dogId: $dogId
    category: $category
    limit: $limit
  ) {
    id
    dogId
    dogName
    eventName
    eventDate
    location
    rank
    category
    imageUrl
  }
}
```

## Mutations

### createCompetitionResult

Creates a new competition result record.

```graphql
mutation createCompetitionResult($input: CreateCompetitionInput!) {
  createCompetitionResult(input: $input) {
    id
    eventName
    eventDate
    rank
    title_earned
    points
  }
}

input CreateCompetitionInput {
  dogId: ID!
  eventName: String!
  eventDate: DateTime!
  location: String!
  rank: Int!
  title_earned: String  # Note: field is title_earned (not certificate)
  judge: String!
  points: Float!
  category: String!
  description: String
  totalParticipants: Int
  imageUrl: String
}
```

### updateCompetitionResult

Updates an existing competition result record.

```graphql
mutation updateCompetitionResult($id: ID!, $input: UpdateCompetitionInput!) {
  updateCompetitionResult(id: $id, input: $input) {
    id
    eventName
    eventDate
    rank
    title_earned
    points
    # Other updated fields
  }
}

input UpdateCompetitionInput {
  eventName: String
  eventDate: DateTime
  location: String
  rank: Int
  title_earned: String
  judge: String
  points: Float
  category: String
  description: String
  totalParticipants: Int
  imageUrl: String
}
```

### deleteCompetitionResult

Deletes a competition result record (with authorization checks).

```graphql
mutation deleteCompetitionResult($id: ID!) {
  deleteCompetitionResult(id: $id) {
    success
    message
  }
}
```

## Error Handling

- `COMPETITION_NOT_FOUND`: When requested competition does not exist
- `INVALID_COMPETITION_DATA`: When input data fails validation
- `UNAUTHORIZED_COMPETITION_ACCESS`: When user lacks permission to edit/delete competition
- `DOG_NOT_FOUND`: When referenced dog does not exist
- `INVALID_DATE_FORMAT`: When date fields are invalid

## Frontend Components Using This API

- Competition Listing Page (`/src/app/competitions/page.tsx`)
- Competition Detail Page (`/src/app/competitions/[id]/page.tsx`)
- Competition Form (`/src/components/competitions/CompetitionForm.tsx`)
- Dog Statistics Card (`/src/components/dogs/DogStatisticsCard.tsx`)
- Related Competitions Component (`/src/components/competitions/RelatedCompetitions.tsx`)
