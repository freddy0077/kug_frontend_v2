# Events and Club Events API

This document outlines the GraphQL API for events and club event management in the Dog Pedigree System.

## Types

### Event

```graphql
type Event {
  id: ID!
  title: String!
  description: String!
  eventType: EventType!
  startDate: DateTime!  # Always a valid Date object
  endDate: DateTime!
  location: String!
  address: String
  organizer: String!
  organizerId: ID
  contactEmail: String
  contactPhone: String
  website: String
  registrationUrl: String
  registrationDeadline: DateTime
  imageUrl: String
  registeredDogs: [Dog]
  isPublished: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum EventType {
  SHOW
  COMPETITION
  SEMINAR
  TRAINING
  MEETING
  SOCIAL
  OTHER
}

type ClubEvent {
  id: ID!
  clubId: ID!
  club: Club!
  event: Event!
  membersOnly: Boolean!
  memberRegistrationFee: Float
  nonMemberRegistrationFee: Float
  maxParticipants: Int
  currentParticipants: Int
}
```

## Queries

### getEvents

Fetches a paginated list of events with optional filtering.

```graphql
query getEvents(
  $offset: Int = 0
  $limit: Int = 20
  $searchTerm: String
  $eventType: EventType
  $startDate: DateTime
  $endDate: DateTime
  $location: String
  $organizerId: ID
  $sortDirection: SortDirection = ASC
) {
  events(
    offset: $offset
    limit: $limit
    searchTerm: $searchTerm
    eventType: $eventType
    startDate: $startDate
    endDate: $endDate
    location: $location
    organizerId: $organizerId
    sortDirection: $sortDirection
  ) {
    totalCount
    hasMore
    items {
      id
      title
      eventType
      startDate
      endDate
      location
      organizer
      imageUrl
      isPublished
    }
  }
}
```

### getEventById

Fetches detailed information about a specific event.

```graphql
query getEventById($id: ID!) {
  event(id: $id) {
    id
    title
    description
    eventType
    startDate
    endDate
    location
    address
    organizer
    organizerId
    contactEmail
    contactPhone
    website
    registrationUrl
    registrationDeadline
    imageUrl
    isPublished
    registeredDogs {
      id
      name
      breed
      owner {
        id
        name
      }
    }
    createdAt
    updatedAt
  }
}
```

### getUpcomingEvents

Fetches upcoming events within a time range.

```graphql
query getUpcomingEvents(
  $days: Int = 30
  $limit: Int = 5
  $eventType: EventType
) {
  upcomingEvents(
    days: $days
    limit: $limit
    eventType: $eventType
  ) {
    id
    title
    eventType
    startDate
    location
    imageUrl
    registrationDeadline
  }
}
```

### getClubEvents

Fetches club events for a specific club.

```graphql
query getClubEvents(
  $clubId: ID!
  $offset: Int = 0
  $limit: Int = 20
  $includeNonMemberEvents: Boolean = true
) {
  clubEvents(
    clubId: $clubId
    offset: $offset
    limit: $limit
    includeNonMemberEvents: $includeNonMemberEvents
  ) {
    totalCount
    hasMore
    items {
      id
      event {
        id
        title
        eventType
        startDate
        endDate
        location
        imageUrl
      }
      membersOnly
      memberRegistrationFee
      nonMemberRegistrationFee
      maxParticipants
      currentParticipants
    }
  }
}
```

## Mutations

### createEvent

Creates a new event.

```graphql
mutation createEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    id
    title
    eventType
    startDate
    endDate
    location
  }
}

input CreateEventInput {
  title: String!
  description: String!
  eventType: EventType!
  startDate: DateTime!  # Must be valid Date object
  endDate: DateTime!
  location: String!
  address: String
  organizer: String!
  organizerId: ID
  contactEmail: String
  contactPhone: String
  website: String
  registrationUrl: String
  registrationDeadline: DateTime
  imageUrl: String
  isPublished: Boolean = false
}
```

### updateEvent

Updates an existing event.

```graphql
mutation updateEvent($id: ID!, $input: UpdateEventInput!) {
  updateEvent(id: $id, input: $input) {
    id
    title
    eventType
    startDate
    endDate
    # Other updated fields
  }
}

input UpdateEventInput {
  title: String
  description: String
  eventType: EventType
  startDate: DateTime
  endDate: DateTime
  location: String
  address: String
  organizer: String
  contactEmail: String
  contactPhone: String
  website: String
  registrationUrl: String
  registrationDeadline: DateTime
  imageUrl: String
  isPublished: Boolean
}
```

### createClubEvent

Creates a club-specific event.

```graphql
mutation createClubEvent($input: CreateClubEventInput!) {
  createClubEvent(input: $input) {
    id
    clubId
    event {
      id
      title
    }
    membersOnly
  }
}

input CreateClubEventInput {
  clubId: ID!
  eventInput: CreateEventInput!
  membersOnly: Boolean!
  memberRegistrationFee: Float
  nonMemberRegistrationFee: Float
  maxParticipants: Int
}
```

### registerDogForEvent

Registers a dog for an event.

```graphql
mutation registerDogForEvent($eventId: ID!, $dogId: ID!) {
  registerDogForEvent(eventId: $eventId, dogId: $dogId) {
    event {
      id
      title
    }
    dog {
      id
      name
    }
    registrationDate: DateTime!
  }
}
```

### publishEvent

Publishes an event, making it visible to all users.

```graphql
mutation publishEvent($id: ID!) {
  publishEvent(id: $id) {
    id
    title
    isPublished
  }
}
```

## Error Handling

- `EVENT_NOT_FOUND`: When requested event does not exist
- `INVALID_EVENT_DATA`: When input data fails validation
- `CLUB_NOT_FOUND`: When referenced club does not exist
- `EVENT_DATE_CONFLICT`: When event dates are invalid or conflicting
- `REGISTRATION_CLOSED`: When registration deadline has passed
- `EVENT_CAPACITY_REACHED`: When event has reached maximum participants
- `UNAUTHORIZED_EVENT_ACCESS`: When user lacks permission to manage events
- `INVALID_DATE_FORMAT`: When date fields are not valid Date objects

## Frontend Components Using This API

- Events Listing Page (`/src/app/events/page.tsx`)
- Event Detail Page (`/src/app/events/[id]/page.tsx`)
- Club Events Page (`/src/app/club-events/page.tsx`)
- Create/Edit Event Form (`/src/components/events/EventForm.tsx`)
- Upcoming Events Widget (`/src/components/events/UpcomingEventsWidget.tsx`)
