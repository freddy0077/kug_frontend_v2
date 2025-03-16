import { gql } from '@apollo/client';

// Query to get all competition results with pagination and filtering
export const GET_COMPETITION_RESULTS = gql`
  query GetCompetitionResults(
    $offset: Int = 0,
    $limit: Int = 20,
    $searchTerm: String,
    $category: String,
    $dogId: ID,
    $startDate: DateTime,
    $endDate: DateTime,
    $sortBy: CompetitionSortField = EVENT_DATE,
    $sortDirection: SortDirection = DESC
  ) {
    competitions(
      offset: $offset,
      limit: $limit,
      searchTerm: $searchTerm,
      category: $category,
      dogId: $dogId,
      startDate: $startDate,
      endDate: $endDate,
      sortBy: $sortBy,
      sortDirection: $sortDirection
    ) {
      items {
        id
        dogId
        dogName
        eventName
        eventDate
        location
        category
        rank
        title_earned
        judge
        points
        description
        totalParticipants
        imageUrl
        createdAt
        updatedAt
      }
      totalCount
      hasMore
    }
  }
`;

// Query to get a single competition result by ID
export const GET_COMPETITION_RESULT = gql`
  query GetCompetitionResult($id: ID!) {
    competition(id: $id) {
      id
      dogId
      dogName
      eventName
      eventDate
      location
      category
      rank
      title_earned
      judge
      points
      description
      totalParticipants
      imageUrl
      createdAt
      updatedAt
    }
  }
`;

// Query to get competition stats for a specific dog
export const GET_DOG_COMPETITION_STATS = gql`
  query GetDogCompetitionStats($dogId: ID!) {
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
        location
        category
        rank
        title_earned
        points
      }
    }
  }
`;

// Query to get related competitions
export const GET_RELATED_COMPETITIONS = gql`
  query GetRelatedCompetitions(
    $competitionId: ID!,
    $dogId: ID,
    $category: String,
    $limit: Int = 3
  ) {
    relatedCompetitions(
      competitionId: $competitionId,
      dogId: $dogId,
      category: $category,
      limit: $limit
    ) {
      id
      dogId
      dogName
      eventName
      eventDate
      location
      category
      rank
      title_earned
      judge
      points
    }
  }
`;
