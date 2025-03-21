'use client';

import { useEffect } from 'react';
import DogApprovalList from '@/components/admin/DogApprovalList';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/enums';
import { useRouter } from 'next/navigation';

export default function DogApprovalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Check if user is admin, redirect otherwise
  useEffect(() => {
    if (!loading && user && user.role !== UserRole.ADMIN) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null; // Will redirect, don't show anything
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dog Approval Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          Review and approve or decline dog registrations submitted by users.
        </p>
        <DogApprovalList />
      </div>
    </div>
  );
}
