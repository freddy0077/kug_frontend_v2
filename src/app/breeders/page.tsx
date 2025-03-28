'use client';

import React from 'react';
import BreedersList from '@/components/breeders/BreedersList';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';

export default function BreedersPage() {
  return (
    <ProtectedRoute
      allowedRoles={[UserRole.ADMIN, UserRole.OWNER]}
      fallbackPath="/auth/login"
    >
      <BreedersList />
    </ProtectedRoute>
  );
}
