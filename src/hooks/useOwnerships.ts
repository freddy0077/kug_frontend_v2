import { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import {
  GET_OWNERSHIP_RECORDS,
  GET_DOG_OWNERSHIP_HISTORY,
  GET_SINGLE_OWNERSHIP,
  CREATE_OWNERSHIP,
  TRANSFER_OWNERSHIP,
  UPDATE_OWNERSHIP,
  DELETE_OWNERSHIP
} from '@/graphql/ownerships';

// Types for input and return values
interface OwnershipRecord {
  id: string;
  dog: {
    id: string;
    name: string;
    registrationNumber: string;
    breed?: string;
    mainImageUrl?: string;
  };
  owner: {
    id: string;
    name: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  startDate: string;
  endDate?: string;
  is_current: boolean;
  transferDocumentUrl?: string;
}

interface OwnershipFilters {
  ownerId?: string;
  dogId?: string;
  includeFormer?: boolean;
  startDate?: string;
  endDate?: string;
  offset?: number;
  limit?: number;
}

export function useOwnerships() {
  // Fetch ownership records with optional filtering
  const fetchOwnershipRecords = (filters: OwnershipFilters = {}) => {
    const { data, loading, error, fetchMore } = useQuery(GET_OWNERSHIP_RECORDS, {
      variables: {
        ownerId: filters.ownerId,
        dogId: filters.dogId,
        includeFormer: filters.includeFormer ?? true,
        startDate: filters.startDate,
        endDate: filters.endDate,
        offset: filters.offset ?? 0,
        limit: filters.limit ?? 20
      }
    });

    return {
      records: data?.ownerDogs?.items ?? [],
      totalCount: data?.ownerDogs?.totalCount ?? 0,
      hasMore: data?.ownerDogs?.hasMore ?? false,
      loading,
      error,
      fetchMore
    };
  };

  // Fetch ownership history for a specific dog
  const fetchDogOwnershipHistory = (dogId: string) => {
    const { data, loading, error } = useQuery(GET_DOG_OWNERSHIP_HISTORY, {
      variables: { dogId }
    });

    return {
      ownershipHistory: data?.dogOwnerships ?? null,
      loading,
      error
    };
  };

  // Fetch a single ownership record
  const fetchSingleOwnership = (id: string) => {
    const { data, loading, error } = useQuery(GET_SINGLE_OWNERSHIP, {
      variables: { id }
    });

    return {
      ownership: data?.ownership ?? null,
      loading,
      error
    };
  };

  // Create a new ownership record
  const [createOwnership, createOwnershipMutation] = useMutation(CREATE_OWNERSHIP, {
    update(cache, { data }) {
      // Optionally update cache to include new ownership
      cache.modify({
        fields: {
          ownerDogs(existingRefs = [], { readField }) {
            const newOwnershipRef = cache.writeFragment({
              data: data.createOwnership,
              fragment: gql`
                fragment NewOwnership on Ownership {
                  id
                  dog {
                    id
                    name
                  }
                  owner {
                    id
                    name
                  }
                  startDate
                  is_current
                }
              `
            });

            return [...existingRefs, newOwnershipRef];
          }
        }
      });
    }
  });

  // Transfer ownership
  const [transferOwnership, transferOwnershipMutation] = useMutation(TRANSFER_OWNERSHIP, {
    update(cache, { data }) {
      // Update cache to reflect ownership transfer
      cache.modify({
        fields: {
          dogOwnerships(existingRefs = []) {
            // Logic to update ownership history
            return existingRefs;
          }
        }
      });
    }
  });

  // Update an existing ownership record
  const [updateOwnership, updateOwnershipMutation] = useMutation(UPDATE_OWNERSHIP);

  // Delete an ownership record
  const [deleteOwnership, deleteOwnershipMutation] = useMutation(DELETE_OWNERSHIP);

  return {
    fetchOwnershipRecords,
    fetchDogOwnershipHistory,
    fetchSingleOwnership,
    createOwnership,
    transferOwnership,
    updateOwnership,
    deleteOwnership,
    createOwnershipMutation,
    transferOwnershipMutation,
    updateOwnershipMutation,
    deleteOwnershipMutation
  };
}
