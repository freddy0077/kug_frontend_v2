import { ApolloClient } from '@apollo/client';
import { 
  CREATE_HEALTH_RECORD, 
  UPDATE_HEALTH_RECORD, 
  DELETE_HEALTH_RECORD,
  UPLOAD_HEALTH_RECORD_ATTACHMENT,
  REMOVE_HEALTH_RECORD_ATTACHMENT
} from '@/graphql/mutations/healthRecordMutations';

import { 
  GET_DOG_HEALTH_RECORDS, 
  GET_HEALTH_RECORD, 
  GET_HEALTH_SUMMARY 
} from '@/graphql/queries/healthRecordQueries';

/**
 * Service to handle health record operations
 */
export class HealthRecordService {
  private client: ApolloClient<any>;

  constructor(client: ApolloClient<any>) {
    this.client = client;
  }

  /**
   * Create a new health record
   */
  async createHealthRecord(input: any) {
    const { data } = await this.client.mutate({
      mutation: CREATE_HEALTH_RECORD,
      variables: { input },
      refetchQueries: [
        { query: GET_DOG_HEALTH_RECORDS, variables: { dogId: input.dogId } }
      ]
    });
    
    return data.createHealthRecord;
  }

  /**
   * Update an existing health record
   */
  async updateHealthRecord(id: string, input: any) {
    const { data } = await this.client.mutate({
      mutation: UPDATE_HEALTH_RECORD,
      variables: { id, input },
      refetchQueries: [
        { query: GET_HEALTH_RECORD, variables: { id } }
      ]
    });
    
    return data.updateHealthRecord;
  }

  /**
   * Delete a health record
   */
  async deleteHealthRecord(id: string) {
    const { data } = await this.client.mutate({
      mutation: DELETE_HEALTH_RECORD,
      variables: { id }
    });
    
    return data.deleteHealthRecord;
  }

  /**
   * Upload an attachment to a health record
   */
  async uploadAttachment(healthRecordId: string, file: File) {
    const { data } = await this.client.mutate({
      mutation: UPLOAD_HEALTH_RECORD_ATTACHMENT,
      variables: { healthRecordId, file }
    });
    
    return data.uploadHealthRecordAttachment;
  }

  /**
   * Remove an attachment from a health record
   */
  async removeAttachment(healthRecordId: string, fileName: string) {
    const { data } = await this.client.mutate({
      mutation: REMOVE_HEALTH_RECORD_ATTACHMENT,
      variables: { healthRecordId, fileName }
    });
    
    return data.removeHealthRecordAttachment;
  }

  /**
   * Get health records for a dog
   */
  async getDogHealthRecords(dogId: string, options: any = {}) {
    const { data } = await this.client.query({
      query: GET_DOG_HEALTH_RECORDS,
      variables: {
        dogId,
        offset: options.offset || 0,
        limit: options.limit || 20,
        type: options.type || null,
        startDate: options.startDate || null,
        endDate: options.endDate || null,
        sortDirection: options.sortDirection || 'DESC'
      },
      fetchPolicy: 'network-only'
    });
    
    return data.dogHealthRecords;
  }

  /**
   * Get a specific health record by ID
   */
  async getHealthRecord(id: string) {
    const { data } = await this.client.query({
      query: GET_HEALTH_RECORD,
      variables: { id },
      fetchPolicy: 'network-only'
    });
    
    return data.healthRecord;
  }

  /**
   * Get a health summary for a dog
   */
  async getHealthSummary(dogId: string) {
    const { data } = await this.client.query({
      query: GET_HEALTH_SUMMARY,
      variables: { dogId },
      fetchPolicy: 'network-only'
    });
    
    return data.healthSummary;
  }
}
