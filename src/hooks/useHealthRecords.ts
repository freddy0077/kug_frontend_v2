import { useState } from 'react';
import { useApolloClient, useQuery, useMutation } from '@apollo/client';
import { 
  GET_DOG_HEALTH_RECORDS, 
  GET_HEALTH_RECORD 
} from '@/graphql/queries/healthRecordQueries';
import {
  CREATE_HEALTH_RECORD,
  UPDATE_HEALTH_RECORD,
  DELETE_HEALTH_RECORD,
  UPLOAD_HEALTH_RECORD_ATTACHMENT
} from '@/graphql/mutations/healthRecordMutations';
import { HealthRecordType } from '@/types/healthRecord';

export interface HealthRecordInput {
  dogId: string;
  date: Date | string;
  type?: HealthRecordType;
  description: string;
  results?: string;
  veterinarian?: string;
  vetName?: string;
}

/**
 * Hook for fetching dog health records
 */
export function useDogHealthRecords(dogId: string, options: any = {}) {
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_DOG_HEALTH_RECORDS, {
    variables: {
      dogId,
      offset: options.offset || 0,
      limit: options.limit || 20,
      type: options.type || null,
      startDate: options.startDate || null,
      endDate: options.endDate || null,
      sortDirection: options.sortDirection || 'DESC'
    },
    skip: !dogId,
    fetchPolicy: 'cache-and-network'
  });

  const loadMore = () => {
    if (!data?.dogHealthRecords?.hasMore) return;
    
    fetchMore({
      variables: {
        offset: data.dogHealthRecords.items.length
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        
        return {
          dogHealthRecords: {
            ...fetchMoreResult.dogHealthRecords,
            items: [
              ...prev.dogHealthRecords.items,
              ...fetchMoreResult.dogHealthRecords.items
            ]
          }
        };
      }
    });
  };

  return {
    healthRecords: data?.dogHealthRecords?.items || [],
    totalCount: data?.dogHealthRecords?.totalCount || 0,
    hasMore: data?.dogHealthRecords?.hasMore || false,
    loading,
    error,
    loadMore,
    refetch
  };
}

/**
 * Hook for fetching a single health record
 */
export function useHealthRecord(id: string) {
  const { data, loading, error, refetch } = useQuery(GET_HEALTH_RECORD, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network'
  });

  return {
    healthRecord: data?.healthRecord || null,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for health record operations (create, update, delete)
 */
export function useHealthRecordOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const client = useApolloClient();
  
  // Create health record mutation
  const [createHealthRecordMutation] = useMutation(CREATE_HEALTH_RECORD);
  
  // Update health record mutation
  const [updateHealthRecordMutation] = useMutation(UPDATE_HEALTH_RECORD);
  
  // Delete health record mutation
  const [deleteHealthRecordMutation] = useMutation(DELETE_HEALTH_RECORD);
  
  // Upload attachment mutation
  const [uploadAttachmentMutation] = useMutation(UPLOAD_HEALTH_RECORD_ATTACHMENT);
  
  /**
   * Create a new health record
   */
  const createHealthRecord = async (input: HealthRecordInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await createHealthRecordMutation({
        variables: { input },
        refetchQueries: [
          { 
            query: GET_DOG_HEALTH_RECORDS, 
            variables: { 
              dogId: input.dogId,
              limit: 20,
              offset: 0
            } 
          }
        ]
      });
      
      return data.createHealthRecord;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Update an existing health record
   */
  const updateHealthRecord = async (id: string, input: Partial<HealthRecordInput>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await updateHealthRecordMutation({
        variables: { id, input },
        refetchQueries: [
          { 
            query: GET_HEALTH_RECORD, 
            variables: { id } 
          }
        ]
      });
      
      return data.updateHealthRecord;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Delete a health record
   */
  const deleteHealthRecord = async (id: string, dogId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await deleteHealthRecordMutation({
        variables: { id },
        refetchQueries: [
          { 
            query: GET_DOG_HEALTH_RECORDS, 
            variables: { 
              dogId,
              limit: 20,
              offset: 0
            } 
          }
        ],
        update: (cache) => {
          // Remove the deleted record from the cache
          cache.evict({ id: `HealthRecord:${id}` });
          cache.gc();
        }
      });
      
      return data.deleteHealthRecord;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Upload an attachment to a health record
   */
  const uploadAttachment = async (healthRecordId: string, file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await uploadAttachmentMutation({
        variables: { healthRecordId, file },
        refetchQueries: [
          { 
            query: GET_HEALTH_RECORD, 
            variables: { id: healthRecordId } 
          }
        ]
      });
      
      return data.uploadHealthRecordAttachment;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    uploadAttachment,
    loading,
    error
  };
}
