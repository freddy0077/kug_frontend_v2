import { useMutation, useQuery, gql } from '@apollo/client';
import { 
  GET_COMPETITION_RESULTS, 
  GET_COMPETITION_RESULT, 
  GET_DOG_COMPETITION_STATS,
  GET_RELATED_COMPETITIONS
} from '../graphql/queries/competitionQueries';
import { 
  CREATE_COMPETITION_RESULT, 
  UPDATE_COMPETITION_RESULT, 
  DELETE_COMPETITION_RESULT 
} from '../graphql/mutations/competitionMutations';

// Type definitions
export type CompetitionResult = {
  id: string;
  dogId: string;
  dogName: string;
  eventName: string;
  eventDate: string;
  location: string;
  category: string;
  rank: number;
  title_earned?: string;
  judge: string;
  points: number;
  description?: string;
  totalParticipants?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type CompetitionStats = {
  totalCompetitions: number;
  totalWins: number;
  categoryCounts: Array<{ category: string; count: number }>;
  pointsByCategory: Array<{ category: string; points: number }>;
  recentResults: Array<CompetitionResult>;
};

export type PaginatedCompetitions = {
  items: CompetitionResult[];
  totalCount: number;
  hasMore: boolean;
};

export type CompetitionSortField = 'EVENT_DATE' | 'RANK' | 'POINTS' | 'EVENT_NAME';
export type SortDirection = 'ASC' | 'DESC';

export type CompetitionInput = {
  dogId: string;
  eventName: string;
  eventDate: string;
  location: string;
  category: string;
  rank: number;
  title_earned?: string;
  judge: string;
  points: number;
  description?: string;
  totalParticipants?: number;
  imageUrl?: string;
};

export type UpdateCompetitionInput = Partial<Omit<CompetitionInput, 'dogId'>>;

export type CompetitionFilters = {
  offset?: number;
  limit?: number;
  searchTerm?: string;
  category?: string;
  dogId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: CompetitionSortField;
  sortDirection?: SortDirection;
};

export type DeleteResponse = {
  success: boolean;
  message: string;
};

// Hook for fetching competition results with pagination and filtering
export const useCompetitionResults = (filters: CompetitionFilters = {}) => {
  const { 
    offset = 0, 
    limit = 20, 
    searchTerm, 
    category, 
    dogId, 
    startDate, 
    endDate,
    sortBy = 'EVENT_DATE',
    sortDirection = 'DESC'
  } = filters;

  const { loading, error, data, refetch, fetchMore } = useQuery(GET_COMPETITION_RESULTS, {
    variables: {
      offset,
      limit,
      searchTerm,
      category,
      dogId,
      startDate,
      endDate,
      sortBy,
      sortDirection
    },
    fetchPolicy: 'cache-and-network'
  });

  const loadMore = () => {
    if (!data?.competitions?.hasMore) return;

    return fetchMore({
      variables: { offset: data.competitions.items.length },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          competitions: {
            ...fetchMoreResult.competitions,
            items: [
              ...prev.competitions.items,
              ...fetchMoreResult.competitions.items
            ]
          }
        };
      }
    });
  };

  return {
    loading,
    error,
    competitions: data?.competitions as PaginatedCompetitions,
    refetch,
    loadMore
  };
};

// Hook for fetching a single competition result
export const useCompetitionResult = (id: string) => {
  const { loading, error, data, refetch } = useQuery(GET_COMPETITION_RESULT, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network'
  });

  return {
    loading,
    error,
    competition: data?.competition as CompetitionResult,
    refetch
  };
};

// Hook for fetching competition stats for a specific dog
export const useDogCompetitionStats = (dogId: string) => {
  const { loading, error, data, refetch } = useQuery(GET_DOG_COMPETITION_STATS, {
    variables: { dogId },
    skip: !dogId,
    fetchPolicy: 'cache-and-network'
  });

  return {
    loading,
    error,
    stats: data?.dogCompetitionStats as CompetitionStats,
    refetch
  };
};

// Hook for fetching related competitions
export const useRelatedCompetitions = (competitionId: string, dogId?: string, category?: string, limit: number = 3) => {
  const { loading, error, data } = useQuery(GET_RELATED_COMPETITIONS, {
    variables: { competitionId, dogId, category, limit },
    skip: !competitionId,
    fetchPolicy: 'cache-and-network'
  });

  return {
    loading,
    error,
    relatedCompetitions: data?.relatedCompetitions as CompetitionResult[]
  };
};

// Hook for creating a competition result
export const useCreateCompetitionResult = () => {
  const [createCompetition, { loading, error }] = useMutation(CREATE_COMPETITION_RESULT, {
    update(cache, { data: { createCompetitionResult } }) {
      cache.modify({
        fields: {
          competitions(existingCompetitions = { items: [], totalCount: 0, hasMore: false }) {
            const newCompetitionRef = cache.writeFragment({
              data: createCompetitionResult,
              fragment: gql`
                fragment NewCompetition on CompetitionResult {
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
              `
            });
            
            return {
              ...existingCompetitions,
              items: [newCompetitionRef, ...existingCompetitions.items],
              totalCount: existingCompetitions.totalCount + 1
            };
          }
        }
      });
    }
  });

  const create = async (input: CompetitionInput) => {
    try {
      const { data } = await createCompetition({ variables: input });
      return data.createCompetitionResult as CompetitionResult;
    } catch (err) {
      console.error('Error creating competition result:', err);
      throw err;
    }
  };

  return { create, loading, error };
};

// Hook for updating a competition result
export const useUpdateCompetitionResult = () => {
  const [updateCompetition, { loading, error }] = useMutation(UPDATE_COMPETITION_RESULT);

  const update = async (id: string, input: UpdateCompetitionInput) => {
    try {
      const { data } = await updateCompetition({ 
        variables: { id, ...input } 
      });
      return data.updateCompetitionResult as CompetitionResult;
    } catch (err) {
      console.error('Error updating competition result:', err);
      throw err;
    }
  };

  return { update, loading, error };
};

// Hook for deleting a competition result
export const useDeleteCompetitionResult = () => {
  const [deleteCompetition, { loading, error }] = useMutation(DELETE_COMPETITION_RESULT, {
    update(cache, { data: { deleteCompetitionResult } }, { variables }) {
      if (deleteCompetitionResult.success) {
        cache.modify({
          fields: {
            competitions(existingCompetitions = { items: [], totalCount: 0, hasMore: false }, { readField }) {
              const filteredItems = existingCompetitions.items.filter(
                itemRef => readField('id', itemRef) !== variables?.id
              );
              
              return {
                ...existingCompetitions,
                items: filteredItems,
                totalCount: existingCompetitions.totalCount - 1
              };
            }
          }
        });
      }
    }
  });

  const remove = async (id: string) => {
    try {
      const { data } = await deleteCompetition({ variables: { id } });
      return data.deleteCompetitionResult as DeleteResponse;
    } catch (err) {
      console.error('Error deleting competition result:', err);
      throw err;
    }
  };

  return { remove, loading, error };
};

// End of hooks
