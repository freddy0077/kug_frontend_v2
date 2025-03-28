'use client';

import React from 'react';
import OwnerDetail from '@/components/breeders/OwnerDetail';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';

export default function OwnerDetailPage({ params }: any) {
  return (
    <ProtectedRoute
      allowedRoles={[UserRole.ADMIN, UserRole.OWNER]}
      fallbackPath="/auth/login"
    >
      <OwnerDetail ownerId={params.id} />
    </ProtectedRoute>
  );
}
