'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PedigreeForm from './PedigreeForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const PedigreeCreateForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [initialDogId, setInitialDogId] = useState<string>('');

  // Check if there's an initialDogId in the URL params
  useEffect(() => {
    if (searchParams) {
      const dogId = searchParams.get('dogId');
      if (dogId) {
        setInitialDogId(dogId);
      }
    }
    setIsLoading(false);
  }, [searchParams]);

  // If a user is not authenticated, they'll be redirected by ProtectedRoute
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  // While checking params, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return <PedigreeForm initialDogId={initialDogId} />;
};

export default PedigreeCreateForm;
