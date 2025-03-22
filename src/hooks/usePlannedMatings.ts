import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { 
  GET_PLANNED_MATINGS, 
  GET_PLANNED_MATING, 
  GET_BREEDING_PROGRAM_MATINGS, 
  GET_DOG_PLANNED_MATINGS 
} from '@/graphql/queries/plannedMatingQueries';
import { 
  CREATE_PLANNED_MATING, 
  UPDATE_PLANNED_MATING, 
  DELETE_PLANNED_MATING, 
  CANCEL_PLANNED_MATING, 
  RECORD_BREEDING_RESULT, 
  RECORD_LITTER_RESULT 
} from '@/graphql/mutations/plannedMatingMutations';

/**
 * Custom hook for fetching a paginated list of planned matings
 */
export const usePlannedMatings = (options = {}) => {
  const [filters, setFilters] = useState({
    breedingProgramId: null,
    status: null,
    limit: 10,
    offset: 0,
  });

  const { loading, error, data, fetchMore, refetch } = useQuery(GET_PLANNED_MATINGS, {
    variables: {
      ...filters,
      ...options,
    },
    notifyOnNetworkStatusChange: true,
  });

  const handleFetchMore = () => {
    if (!data?.plannedMatings?.pageInfo?.hasNextPage) return;

    fetchMore({
      variables: {
        ...filters,
        ...options,
        offset: data.plannedMatings.items.length,
      },
    });
  };

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters, offset: 0 });
  };

  return {
    loading,
    error,
    plannedMatings: data?.plannedMatings?.items || [],
    pageInfo: data?.plannedMatings?.pageInfo || {},
    totalCount: data?.plannedMatings?.totalCount || 0,
    fetchMore: handleFetchMore,
    refetch,
    filters,
    updateFilters,
  };
};

/**
 * Custom hook for fetching a single planned mating by ID
 */
export const usePlannedMating = (plannedMatingId, options = {}) => {
  const { loading, error, data, refetch } = useQuery(GET_PLANNED_MATING, {
    variables: { id: plannedMatingId },
    skip: !plannedMatingId,
    ...options,
  });

  return {
    loading,
    error,
    plannedMating: data?.plannedMating || null,
    refetch,
  };
};

/**
 * Custom hook for fetching planned matings for a specific breeding program
 */
export const useBreedingProgramPlannedMatings = (breedingProgramId, options = {}) => {
  const [filters, setFilters] = useState({
    status: null,
    limit: 10,
    offset: 0,
  });

  const { loading, error, data, fetchMore, refetch } = useQuery(GET_BREEDING_PROGRAM_MATINGS, {
    variables: {
      breedingProgramId,
      ...filters,
      ...options,
    },
    skip: !breedingProgramId,
    notifyOnNetworkStatusChange: true,
  });

  const handleFetchMore = () => {
    if (!data?.breedingProgramPlannedMatings?.pageInfo?.hasNextPage) return;

    fetchMore({
      variables: {
        breedingProgramId,
        ...filters,
        ...options,
        offset: data.breedingProgramPlannedMatings.items.length,
      },
    });
  };

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters, offset: 0 });
  };

  return {
    loading,
    error,
    plannedMatings: data?.breedingProgramPlannedMatings?.items || [],
    pageInfo: data?.breedingProgramPlannedMatings?.pageInfo || {},
    totalCount: data?.breedingProgramPlannedMatings?.totalCount || 0,
    fetchMore: handleFetchMore,
    refetch,
    filters,
    updateFilters,
  };
};

/**
 * Custom hook for fetching planned matings for a specific dog (either as sire or dam)
 */
export const useDogPlannedMatings = (dogId, options = {}) => {
  const [filters, setFilters] = useState({
    role: null, // 'SIRE' or 'DAM'
    status: null,
    limit: 10,
    offset: 0,
  });

  const { loading, error, data, fetchMore, refetch } = useQuery(GET_DOG_PLANNED_MATINGS, {
    variables: {
      dogId,
      ...filters,
      ...options,
    },
    skip: !dogId,
    notifyOnNetworkStatusChange: true,
  });

  const handleFetchMore = () => {
    if (!data?.dogPlannedMatings?.pageInfo?.hasNextPage) return;

    fetchMore({
      variables: {
        dogId,
        ...filters,
        ...options,
        offset: data.dogPlannedMatings.items.length,
      },
    });
  };

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters, offset: 0 });
  };

  return {
    loading,
    error,
    plannedMatings: data?.dogPlannedMatings?.items || [],
    pageInfo: data?.dogPlannedMatings?.pageInfo || {},
    totalCount: data?.dogPlannedMatings?.totalCount || 0,
    fetchMore: handleFetchMore,
    refetch,
    filters,
    updateFilters,
  };
};

/**
 * Custom hook for creating a new planned mating
 */
export const useCreatePlannedMating = () => {
  const [createPlannedMating, { loading, error, data }] = useMutation(CREATE_PLANNED_MATING, {
    refetchQueries: [{ query: GET_PLANNED_MATINGS }],
  });

  const handleCreatePlannedMating = async (input) => {
    try {
      const response = await createPlannedMating({
        variables: { input },
      });
      return response.data.createPlannedMating;
    } catch (error) {
      console.error('Error creating planned mating:', error);
      throw error;
    }
  };

  return {
    createPlannedMating: handleCreatePlannedMating,
    loading,
    error,
    createdPlannedMating: data?.createPlannedMating || null,
  };
};

/**
 * Custom hook for updating an existing planned mating
 */
export const useUpdatePlannedMating = () => {
  const [updatePlannedMating, { loading, error, data }] = useMutation(UPDATE_PLANNED_MATING);

  const handleUpdatePlannedMating = async (id, updates) => {
    try {
      const response = await updatePlannedMating({
        variables: { id, ...updates },
      });
      return response.data.updatePlannedMating;
    } catch (error) {
      console.error('Error updating planned mating:', error);
      throw error;
    }
  };

  return {
    updatePlannedMating: handleUpdatePlannedMating,
    loading,
    error,
    updatedPlannedMating: data?.updatePlannedMating || null,
  };
};

/**
 * Custom hook for deleting a planned mating
 */
export const useDeletePlannedMating = () => {
  const [deletePlannedMating, { loading, error, data }] = useMutation(DELETE_PLANNED_MATING, {
    refetchQueries: [{ query: GET_PLANNED_MATINGS }],
  });

  const handleDeletePlannedMating = async (id) => {
    try {
      const response = await deletePlannedMating({
        variables: { id },
      });
      return response.data.deletePlannedMating;
    } catch (error) {
      console.error('Error deleting planned mating:', error);
      throw error;
    }
  };

  return {
    deletePlannedMating: handleDeletePlannedMating,
    loading,
    error,
    success: data?.deletePlannedMating || false,
  };
};

/**
 * Custom hook for cancelling a planned mating
 */
export const useCancelPlannedMating = () => {
  const [cancelPlannedMating, { loading, error, data }] = useMutation(CANCEL_PLANNED_MATING);

  const handleCancelPlannedMating = async (id, reason) => {
    try {
      const response = await cancelPlannedMating({
        variables: { id, reason },
      });
      return response.data.cancelPlannedMating;
    } catch (error) {
      console.error('Error cancelling planned mating:', error);
      throw error;
    }
  };

  return {
    cancelPlannedMating: handleCancelPlannedMating,
    loading,
    error,
    cancelledPlannedMating: data?.cancelPlannedMating || null,
  };
};

/**
 * Custom hook for recording breeding result
 */
export const useRecordBreedingResult = () => {
  const [recordBreedingResult, { loading, error, data }] = useMutation(RECORD_BREEDING_RESULT);

  const handleRecordBreedingResult = async (plannedMatingId, input) => {
    try {
      const response = await recordBreedingResult({
        variables: { plannedMatingId, ...input },
      });
      return response.data.recordBreedingResult;
    } catch (error) {
      console.error('Error recording breeding result:', error);
      throw error;
    }
  };

  return {
    recordBreedingResult: handleRecordBreedingResult,
    loading,
    error,
    updatedPlannedMating: data?.recordBreedingResult || null,
  };
};

/**
 * Custom hook for recording litter result
 */
export const useRecordLitterResult = () => {
  const [recordLitterResult, { loading, error, data }] = useMutation(RECORD_LITTER_RESULT);

  const handleRecordLitterResult = async (plannedMatingId, input) => {
    try {
      const response = await recordLitterResult({
        variables: { plannedMatingId, ...input },
      });
      return response.data.recordLitterResult;
    } catch (error) {
      console.error('Error recording litter result:', error);
      throw error;
    }
  };

  return {
    recordLitterResult: handleRecordLitterResult,
    loading,
    error,
    recordedLitter: data?.recordLitterResult || null,
  };
};
