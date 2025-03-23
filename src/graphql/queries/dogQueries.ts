import { gql } from '@apollo/client';
import { ApprovalStatus } from '@/types/enums';

// Query to get minimal dog information for selectors and dropdowns
export const GET_DOGS_MINIMAL = gql`
  query GetDogsMinimal {
    dogs: userDogs {
      id
      name
      breed
      registrationNumber
      mainImageUrl
    }
  }
`;

// Query to get paginated list of dogs with filtering options
export const GET_DOGS = gql`
  query GetDogs(
    $offset: Int
    $limit: Int
    $searchTerm: String
    $breed: String
    $breedId: ID
    $gender: String
    $ownerId: ID
    $approvalStatus: ApprovalStatus
    $sortBy: DogSortField
    $sortDirection: SortDirection
  ) {
    dogs(
      offset: $offset
      limit: $limit
      searchTerm: $searchTerm
      breed: $breed
      breedId: $breedId
      gender: $gender
      ownerId: $ownerId
      approvalStatus: $approvalStatus
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
        color
        dateOfDeath
        registrationNumber
        microchipNumber
        isNeutered
        height
        weight
        titles
        biography
        mainImageUrl
        approvalStatus
        approvalDate
        approvalNotes
        approvedBy {
          id
          fullName
        }
        breedObj {
          id
          name
          group
          origin
          temperament
        }
        currentOwner {
          id
          name
          contactEmail
          contactPhone
        }
        images {
          id
          url
          caption
          isPrimary
        }
      }
    }
  }
`;



// Query to get a single dog by ID
export const GET_DOG_BY_ID = gql`
  query GetDogById($id: ID!) {
    dog(id: $id) {
      id
      name
      breed
      breedObj {
        id
        name
        group
        origin
        temperament
        average_lifespan
        average_height
        average_weight
        description
      }
      gender
      dateOfBirth
      dateOfDeath
      registrationNumber
      microchipNumber
      isNeutered
      height
      weight
      titles
      biography
      mainImageUrl
      sire {
        id
        name
        breed
        registrationNumber
      }
      dam {
        id
        name
        breed
        registrationNumber
      }
      offspring {
        id
        name
        breed
        gender
        dateOfBirth
        registrationNumber
      }
      images {
        id
        url
        caption
        isPrimary
      }
      ownerships {
        id
        startDate
        endDate
        isCurrent
        owner {
          id
          name
          contactEmail
          contactPhone
        }
      }
      currentOwner {
        id
        name
        contactEmail
        contactPhone
      }
      approvalStatus
      approvalDate
      approvalNotes
      approvedBy {
        id
        fullName
      }
      healthRecords {
        id
        date
        description
        vetName
        results
        attachments
      }
      competitionResults {
        id
        eventName
        eventDate
        place
        score
        title_earned
      }
    }
  }
`;



// Alias GET_DOG_BY_ID as GET_DOG for backward compatibility
export const GET_DOG = GET_DOG_BY_ID;

// Query to get a dog's pedigree
export const GET_DOG_PEDIGREE = gql`
  query GetDogPedigree($dogId: ID!, $generations: Int = 4) {
    dogPedigree(dogId: $dogId, generations: $generations) {
      id
      name
      breed
      breedObj {
        id
        name
        group
        origin
        temperament
      }
      gender
      dateOfBirth
      registrationNumber
      color
      mainImageUrl
      sire {
        id
        name
        breed
        breedObj {
          id
          name
          group
          origin
          temperament
        }
        gender
        dateOfBirth
        registrationNumber
        color
        mainImageUrl
        sire {
          id
          name
          breed
          breedObj {
            id
            name
            group
            origin
            temperament
          }
          gender
          dateOfBirth
          registrationNumber
          color
          mainImageUrl
          sire {
            id
            name
            breed
            breedObj {
              id
              name
              group
            }
            gender
            dateOfBirth
            registrationNumber
            color
            mainImageUrl
          }
          dam {
            id
            name
            breed
            breedObj {
              id
              name
              group
            }
            gender
            dateOfBirth
            registrationNumber
            color
            mainImageUrl
          }
        }
        dam {
          id
          name
          breed
          breedObj {
            id
            name
            group
            origin
            temperament
          }
          gender
          dateOfBirth
          registrationNumber
          color
          mainImageUrl
          sire {
            id
            name
            breed
            breedObj {
              id
              name
              group
            }
            gender
            dateOfBirth
            registrationNumber
            color
            mainImageUrl
          }
          dam {
            id
            name
            breed
            breedObj {
              id
              name
              group
            }
            gender
            dateOfBirth
            registrationNumber
            color
            mainImageUrl
          }
        }
      }
      dam {
        id
        name
        breed
        breedObj {
          id
          name
          group
          origin
          temperament
        }
        gender
        dateOfBirth
        registrationNumber
        color
        mainImageUrl
        sire {
          id
          name
          breed
          breedObj {
            id
            name
            group
            origin
            temperament
          }
          gender
          dateOfBirth
          registrationNumber
          color
          mainImageUrl
          sire {
            id
            name
            breed
            breedObj {
              id
              name
              group
            }
            gender
            dateOfBirth
            registrationNumber
            color
            mainImageUrl
          }
          dam {
            id
            name
            breed
            breedObj {
              id
              name
              group
            }
            gender
            dateOfBirth
            registrationNumber
            color
            mainImageUrl
          }
        }
        dam {
          id
          name
          breed
          breedObj {
            id
            name
            group
            origin
            temperament
          }
          gender
          dateOfBirth
          registrationNumber
          color
          mainImageUrl
          sire {
            id
            name
            breed
            breedObj {
              id
              name
              group
            }
            gender
            dateOfBirth
            registrationNumber
            color
            mainImageUrl
          }
          dam {
            id
            name
            breed
            breedObj {
              id
              name
              group
            }
            gender
            dateOfBirth
            registrationNumber
            color
            mainImageUrl
          }
        }
      }
    }
  }
`;



// Query to get dogs owned by the current user
export const GET_USER_DOGS = gql`
  query GetUserDogs {
    userDogs {
      id
      name
      breed
      gender
      dateOfBirth
      mainImageUrl
      registrationNumber
      microchipNumber
      currentOwner {
        id
        name
      }
    }
  }
`;



// Define enums to match GraphQL schema
export enum DogSortField {
  NAME = 'NAME',
  BREED = 'BREED',
  DATE_OF_BIRTH = 'DATE_OF_BIRTH',
  REGISTRATION_NUMBER = 'REGISTRATION_NUMBER',
  CREATED_AT = 'CREATED_AT'
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

// Define search query with simplified response
export const SEARCH_DOGS = gql`
  query SearchDogs(
    $offset: Int = 0
    $limit: Int = 20
    $searchTerm: String
    $breed: String
    $breedId: ID
    $gender: String
  ) {
    dogs(
      offset: $offset
      limit: $limit
      searchTerm: $searchTerm
      breed: $breed
      breedId: $breedId
      gender: $gender
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
        approvalStatus
        approvalDate
        approvalNotes
        approvedBy {
          id
          fullName
        }
        breedObj {
          id
          name
        }
      }
    }
  }
`;



// Mutation to link a dog to its parents
export const LINK_DOG_TO_PARENTS = gql`
  mutation linkDogToParents($dogId: ID!, $sireId: ID, $damId: ID) {
    linkDogToParents(dogId: $dogId, sireId: $sireId, damId: $damId) {
      id
      name
      sire {
        id
        name
        registrationNumber
        gender
        breed
      }
      dam {
        id
        name
        registrationNumber
        gender
        breed
      }
    }
  }
`;


