import React from 'react';
import OwnerForm from '@/components/breeders/OwnerForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Owner Profile',
  description: 'Edit an existing owner profile in the system.'
};

export default function EditOwnerPage({ params }: any) {
  return (
    <ProtectedRoute
      allowedRoles={[UserRole.ADMIN]}
      fallbackPath="/auth/login"
    >
      <OwnerForm mode="edit" ownerId={params.id} />
    </ProtectedRoute>
  );
}
