'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';
import PlannedMatingList from '@/components/breeding/PlannedMatingList';
import { usePlannedMatings } from '@/hooks/usePlannedMatings';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function PlannedMatings() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Use the custom hook to manage planned matings
  const {
    plannedMatings,
    loading,
    error,
    totalCount,
    pageInfo,
    fetchMore,
    updateFilters
  } = usePlannedMatings();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <LoadingSpinner size="lg" color="border-blue-500" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.OWNER, UserRole.ADMIN]}>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Planned Matings</h1>
                <p className="mt-1 text-gray-600">Manage and track your planned breeding pairs</p>
              </div>
            </div>
          </div>

          {/* Planned Matings List Component */}
          <PlannedMatingList
            plannedMatings={plannedMatings}
            loading={loading}
            error={error}
            totalCount={totalCount}
            hasMore={pageInfo?.hasNextPage}
            onLoadMore={fetchMore}
            onFilterChange={updateFilters}
            showFilters={true}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
