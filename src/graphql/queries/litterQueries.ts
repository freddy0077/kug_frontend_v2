import { gql } from '@apollo/client';

// Query to get a paginated list of litters
export const GET_LITTERS = gql`
  query getLitters(
    $offset: Int = 0
    $limit: Int = 20
    $ownerId: ID
    $breedId: ID
    $fromDate: DateTime
    $toDate: DateTime
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
          gender
        }
        createdAt
        updatedAt
      }
    }
  }
`;

// Query to get a single litter by ID
export const GET_LITTER = gql`
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
      sire {
        id
        name
        breed
        registrationNumber
        mainImageUrl
        color
        titles
        user {
          id
          firstName
          lastName
          email
          __typename
        }
      }
      dam {
        id
        name
        breed
        registrationNumber
        mainImageUrl
        color
        titles
        user {
          id
          firstName
          lastName
          email
          __typename
        }
      }
      puppies {
        id
        name
        gender
        dateOfBirth
        color
        microchipNumber
        mainImageUrl
        user {
          id
          firstName
          lastName
          email
          __typename
        }
      }
      createdAt
      updatedAt
    }
  }
`;

// Query to get litters for a specific dog (as sire or dam)
export const GET_DOG_LITTERS = gql`
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
      items {
        id
        litterName
        registrationNumber
        whelpingDate
        totalPuppies
        sire {
          id
          name
          breed
        }
        dam {
          id
          name
          breed
        }
        createdAt
      }
    }
  }
`;

// For client-side type safety
export enum DogRole {
  SIRE = 'SIRE',
  DAM = 'DAM',
  BOTH = 'BOTH'
}
