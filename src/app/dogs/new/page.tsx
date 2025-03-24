'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DogFormWithOwner from '@/components/dogs/DogFormWithOwner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';

export default function AddNewDogPage() {
  const router = useRouter();
  
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]} fallbackPath="/auth/login">
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <Link 
            href="/dogs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Dogs
          </Link>
        </div>
        
        {/* Page content */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Add New Dog</h1>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the form below to add a new dog to the registry. Be sure to select an owner as this is required for all dog registrations.
            </p>
          </div>
          
          <div className="p-6">
            <DogFormWithOwner onSuccess={(dogId) => router.push(`/dogs/${dogId}`)} />
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
