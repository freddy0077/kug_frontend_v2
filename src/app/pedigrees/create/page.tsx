'use client';

import React from 'react';
import PedigreeCreateForm from '@/components/pedigree/PedigreeCreateForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';

export default function CreatePedigreePage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <div className="bg-gray-100 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Register New Pedigree</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a pedigree relationship by selecting a dog and its parents
            </p>
          </div>

          <PedigreeCreateForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
