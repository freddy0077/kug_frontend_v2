'use client';

import { useEffect } from 'react';
import DogApprovalDashboard from '@/components/admin/dogApprovals/DogApprovalDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/enums';
import { useRouter } from 'next/navigation';

export default function DogApprovalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Check if user is admin or super admin, redirect otherwise
  useEffect(() => {
    if (!loading && user && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
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

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    return null; // Will redirect, don't show anything
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dog Approval Dashboard</h1>
      </div>
      
      <DogApprovalDashboard />
    </div>
  );
}
