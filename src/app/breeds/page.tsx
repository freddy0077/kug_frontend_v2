'use client';

import React from 'react';
import ModernBreedList from '@/components/breeds/ModernBreedList';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';

export default function BreedsPage() {
  return (
    <ProtectedRoute
      allowedRoles={[UserRole.ADMIN, UserRole.OWNER]}
      fallbackPath="/auth/login"
    >
      <ModernBreedList />
    </ProtectedRoute>
  );
}
