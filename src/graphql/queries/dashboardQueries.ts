import { gql } from '@apollo/client';

// Query to get dashboard summary data
export const GET_DASHBOARD_SUMMARY = gql`
  query GetDashboardSummary {
    # Get dogs count with minimal fields
    dogs(limit: 0) {
      totalCount
    }
    
    # Get breeds count with minimal fields
    breeds(limit: 0) {
      totalCount
    }
    
    # Get upcoming events
    upcomingEvents(days: 30, limit: 5) {
      id
      title
      eventType
      startDate
      location
      imageUrl
    }
  }
`;

// Query to get recent dogs
export const GET_RECENT_DOGS = gql`
  query GetRecentDogs($limit: Int = 5) {
    dogs(
      limit: $limit
      sortBy: REGISTRATION_NUMBER
      sortDirection: DESC
    ) {
      items {
        id
        name
        breed
        gender
        dateOfBirth
        registrationNumber
        mainImageUrl
        breedObj {
          name
        }
        currentOwner {
          name
        }
      }
    }
  }
`;

// Query to get recent health records
export const GET_RECENT_HEALTH_RECORDS = gql`
  query GetRecentHealthRecords($limit: Int = 5) {
    # This is a simplified version since we don't have a direct way to get all health records
    # We're getting the first few dogs and their most recent health records
    dogs(limit: $limit) {
      items {
        id
        name
        healthRecords(limit: 1, sortDirection: DESC) {
          id
          date
          type
          description
          results
        }
      }
    }
  }
`;

// Query to get recent competition results
export const GET_RECENT_COMPETITIONS = gql`
  query GetRecentCompetitions($limit: Int = 5) {
    competitions(
      limit: $limit
      sortBy: EVENT_DATE
      sortDirection: DESC
    ) {
      items {
        id
        dogId
        dogName
        eventName
        eventDate
        category
        rank
        title_earned
        points
      }
    }
  }
`;

// Query to get recent breeding records for pedigree information
// Note: Changed to fetch breeding records for a specific dog.
// In a real implementation, we would need to choose a dog ID
export const GET_BREEDING_RECORDS = gql`
  query GetBreedingRecords($limit: Int = 5, $dogId: ID!) {
    breedingRecords(
      limit: $limit
      dogId: $dogId
    ) {
      items {
        id
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
        breedingDate
        litterSize
        puppies {
          id
          name
          registrationNumber
        }
        createdAt
      }
    }
  }
`;

// Query to get featured pedigrees with complete family trees
export const GET_FEATURED_PEDIGREES = gql`
  query GetFeaturedPedigrees($limit: Int = 3) {
    dogs(
      limit: $limit
      sortBy: REGISTRATION_NUMBER
      sortDirection: DESC
    ) {
      items {
        id
        name
        breed
        registrationNumber
        mainImageUrl
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
      }
    }
  }
`;
