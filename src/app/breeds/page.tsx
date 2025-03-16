'use client';

import React from 'react';
import BreedList from '@/components/breeds/BreedList';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';

export default function BreedsPage() {
  return (
    <ProtectedRoute
      allowedRoles={[UserRole.ADMIN]}
      fallbackPath="/auth/login"
    >
      <BreedList />
    </ProtectedRoute>
  );
}
