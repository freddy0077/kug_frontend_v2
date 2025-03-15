'use client';

import React from 'react';
import BreedList from '@/components/breeds/BreedList';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function BreedsPage() {
  return (
    <ProtectedRoute
      allowedRoles={['ADMIN', 'OWNER', 'BREEDER', 'HANDLER', 'CLUB']}
      fallbackPath="/auth/login"
    >
      <BreedList />
    </ProtectedRoute>
  );
}
