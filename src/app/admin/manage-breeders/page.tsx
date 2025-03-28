'use client';

import React from 'react';
import BreederManagement from '@/components/breeders/BreederManagement';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';

export default function ManageBreedersPage() {
  return (
    <ProtectedRoute
      allowedRoles={[UserRole.ADMIN]}
      fallbackPath="/auth/login"
    >
      <BreederManagement />
    </ProtectedRoute>
  );
}
