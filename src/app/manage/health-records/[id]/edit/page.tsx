'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_HEALTH_RECORD } from '@/graphql/queries/healthRecordQueries';
import HealthRecordFormSimple from '@/components/health/HealthRecordFormSimple';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { useAuth } from '@/contexts/AuthContext';

export default function EditHealthRecordPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  
  // Get health record data
  const { data, loading, error } = useQuery(GET_HEALTH_RECORD, {
    variables: { id: recordId },
    skip: !recordId || !user,
    fetchPolicy: 'network-only'
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  if (error) {
    return <ErrorAlert message={`Error loading health record: ${error.message}`} />;
  }

  if (!data?.healthRecord) {
    return <ErrorAlert message="Health record not found" />;
  }

  const healthRecord = data.healthRecord;
  const dogId = healthRecord.dog?.id || '';
  const dogName = healthRecord.dog?.name || 'Unknown Dog';
  const ownerId = healthRecord.dog?.currentOwner?.id || '';
  
  // Map the API response to the form data structure, using correct field names from memory
  const initialData = {
    id: healthRecord.id,
    dogId,
    date: healthRecord.date ? new Date(healthRecord.date) : new Date(),
    type: healthRecord.type,
    description: healthRecord.description || '', // Using description instead of diagnosis
    results: healthRecord.results || '', // Using results instead of test_results
    veterinarian: healthRecord.veterinarian || '',
    vetName: healthRecord.vetName || ''
  };
  
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <Link href={`/manage/dogs/${dogId}/health`} className="text-blue-600 hover:text-blue-800">
          &larr; Back to {dogName}'s Health Records
        </Link>
        <h1 className="text-2xl font-bold mt-4">Edit Health Record</h1>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <HealthRecordFormSimple
          dogId={dogId}
          recordId={recordId}
          initialData={initialData}
          onSuccess={() => router.push(`/manage/dogs/${dogId}/health`)}
        />
      </div>
    </div>
  );
}
