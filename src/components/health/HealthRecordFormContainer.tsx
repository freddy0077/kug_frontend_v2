'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import HealthRecordForm from './HealthRecordForm';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  CREATE_HEALTH_RECORD, 
  UPDATE_HEALTH_RECORD,
  UPLOAD_HEALTH_RECORD_ATTACHMENT
} from '@/graphql/mutations/healthRecordMutations';
import { GET_DOG_HEALTH_RECORDS, GET_HEALTH_RECORD } from '@/graphql/queries/healthRecordQueries';
import { HealthRecordFormData } from '@/utils/formHandlers';
import { HealthRecordType } from '@/types/healthRecord';
import { UserRole } from '@/utils/permissionUtils';

interface HealthRecordFormContainerProps {
  dogId: string;
  recordId?: string;
  initialData?: any;
  userRole: UserRole;
  userId: string;
  dogOwnerId: string;
}

export default function HealthRecordFormContainer({
  dogId,
  recordId,
  initialData,
  userRole,
  userId,
  dogOwnerId
}: HealthRecordFormContainerProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  
  // Create Health Record Mutation
  const [createHealthRecord, { loading: createLoading }] = useMutation(CREATE_HEALTH_RECORD, {
    onCompleted: (data) => {
      toast.success('Health record created successfully');
      router.push(`/manage/dogs/${dogId}/health`);
    },
    onError: (error) => {
      toast.error(`Error creating health record: ${error.message}`);
      console.error('Create health record error:', error);
    },
    // Update cache to include the new record
    update: (cache, { data: { createHealthRecord } }) => {
      try {
        // Read the current query data
        const existingData = cache.readQuery<{
          dogHealthRecords: {
            totalCount: number;
            items: any[];
          } 
        }>({
          query: GET_DOG_HEALTH_RECORDS,
          variables: { dogId, limit: 20, offset: 0 }
        }) || { dogHealthRecords: null };
        
        if (existingData.dogHealthRecords) {
          // Write back with the new item
          cache.writeQuery({
            query: GET_DOG_HEALTH_RECORDS,
            variables: { dogId, limit: 20, offset: 0 },
            data: {
              dogHealthRecords: {
                ...existingData.dogHealthRecords,
                totalCount: existingData.dogHealthRecords.totalCount + 1,
                items: [createHealthRecord, ...existingData.dogHealthRecords.items]
              }
            }
          });
        }
      } catch (error) {
        console.error('Cache update error:', error);
      }
    }
  });
  
  // Update Health Record Mutation
  const [updateHealthRecord, { loading: updateLoading }] = useMutation(UPDATE_HEALTH_RECORD, {
    onCompleted: (data) => {
      toast.success('Health record updated successfully');
      router.push(`/manage/dogs/${dogId}/health`);
    },
    onError: (error) => {
      toast.error(`Error updating health record: ${error.message}`);
      console.error('Update health record error:', error);
    }
  });
  
  // Upload Attachment Mutation
  const [uploadAttachment, { loading: uploadLoading }] = useMutation(UPLOAD_HEALTH_RECORD_ATTACHMENT, {
    onError: (error) => {
      toast.error(`Error uploading attachment: ${error.message}`);
      console.error('Upload attachment error:', error);
    }
  });

  // Handle form submission - create or update record
  const handleSubmit = async (formData: HealthRecordFormData) => {
    const { attachments, ...recordData } = formData;
    const fileList = attachments as unknown as File[];
    
    try {
      // Determine if we're creating or updating
      const isUpdate = !!recordId;
      
      // Prepare the input object
      const input = {
        dogId: recordData.dogId,
        // Use recordData properties that actually exist in HealthRecordFormData
        date: recordData.date,
        description: recordData.description,
        results: recordData.results,
        // Map to fields that exist in the GraphQL mutation variables
        veterinarianId: recordData.veterinarianId
        // Remove properties not in the interface: type, vetName
      };
      
      // Create or update the health record
      const response = isUpdate
        ? await updateHealthRecord({ 
            variables: { 
              id: recordId, 
              input 
            }
          })
        : await createHealthRecord({ 
            variables: { 
              input 
            }
          });
      
      // Get the record ID
      const healthRecordId = isUpdate 
        ? recordId 
        : response.data.createHealthRecord.id;
      
      // Upload attachments if any
      if (fileList && fileList.length > 0) {
        setIsUploading(true);
        
        // Upload each file
        for (const file of fileList) {
          await uploadAttachment({
            variables: {
              healthRecordId,
              file
            }
          });
        }
        
        setIsUploading(false);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error submitting health record:', error);
      throw error;
    }
  };
  
  // Determine if any loading state is active
  const isLoading = createLoading || updateLoading || uploadLoading || isUploading;
  
  // Show loading spinner if loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
        <p className="ml-4 text-gray-600">
          {isUploading ? 'Uploading attachments...' : 'Processing health record...'}
        </p>
      </div>
    );
  }
  
  // Convert API data format to form format if editing
  const formattedInitialData = initialData 
    ? {
        ...initialData,
        date: initialData.date ? new Date(initialData.date) : new Date(),
        veterinarianId: initialData.veterinarian || '',
        attachments: initialData.attachments || []
      } 
    : undefined;
  
  return (
    <HealthRecordForm
      dogId={dogId}
      initialData={formattedInitialData}
      onSubmit={handleSubmit}
      userRole={userRole}
      userId={userId}
      dogOwnerId={dogOwnerId}
    />
  );
}
