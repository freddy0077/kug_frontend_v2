import { gql } from '@apollo/client';

// Mutation to create a new competition result
export const CREATE_COMPETITION_RESULT = gql`
  mutation CreateCompetitionResult(
    $dogId: ID!, 
    $eventName: String!, 
    $eventDate: DateTime!, 
    $location: String!, 
    $category: String!, 
    $rank: Int!, 
    $title_earned: String, 
    $judge: String!, 
    $points: Float!,
    $description: String,
    $totalParticipants: Int,
    $imageUrl: String
  ) {
    createCompetitionResult(input: {
      dogId: $dogId,
      eventName: $eventName,
      eventDate: $eventDate,
      location: $location,
      category: $category,
      rank: $rank,
      title_earned: $title_earned,
      judge: $judge,
      points: $points,
      description: $description,
      totalParticipants: $totalParticipants,
      imageUrl: $imageUrl
    }) {
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

// Mutation to update an existing competition result
export const UPDATE_COMPETITION_RESULT = gql`
  mutation UpdateCompetitionResult(
    $id: ID!,
    $eventName: String, 
    $eventDate: DateTime, 
    $location: String, 
    $category: String, 
    $rank: Int, 
    $title_earned: String, 
    $judge: String, 
    $points: Float,
    $description: String,
    $totalParticipants: Int,
    $imageUrl: String
  ) {
    updateCompetitionResult(
      id: $id,
      input: {
        eventName: $eventName,
        eventDate: $eventDate,
        location: $location,
        category: $category,
        rank: $rank,
        title_earned: $title_earned,
        judge: $judge,
        points: $points,
        description: $description,
        totalParticipants: $totalParticipants,
        imageUrl: $imageUrl
      }
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
      description
      totalParticipants
      imageUrl
      createdAt
      updatedAt
    }
  }
`;

// Mutation to delete a competition result
export const DELETE_COMPETITION_RESULT = gql`
  mutation DeleteCompetitionResult($id: ID!) {
    deleteCompetitionResult(id: $id) {
      success
      message
    }
  }
`;
