'use client';

import React from 'react';
import CompetitionForm from '@/components/competitions/CompetitionForm';
import PageHeader from '@/components/ui/PageHeader';

const AddCompetitionPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader 
        title="Add Competition Result" 
        description="Record a new competition result for your dog"
      />
      
      <div className="mt-8">
        <CompetitionForm />
      </div>
    </div>
  );
};

export default AddCompetitionPage;
