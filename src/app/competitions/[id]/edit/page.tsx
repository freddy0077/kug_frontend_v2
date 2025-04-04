'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CompetitionForm from '@/components/competitions/CompetitionForm';
import PageHeader from '@/components/ui/PageHeader';
import { useCompetitionResult } from '@/hooks/useCompetitions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';

const EditCompetitionPage = () => {
  const { id } = useParams();
  const competitionId = Array.isArray(id) ? id[0] : id;
  
  const { competition, loading, error } = useCompetitionResult(competitionId);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorAlert message={`Error loading competition: ${error.message}`} />;
  }
  
  if (!competition) {
    return <ErrorAlert message="Competition not found" />;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader 
        title="Edit Competition Result" 
        description={`Edit details for ${competition.eventName}`}
      />
      
      <div className="mt-8">
        <CompetitionForm initialData={competition} isEdit={true} />
      </div>
    </div>
  );
};

export default EditCompetitionPage;
