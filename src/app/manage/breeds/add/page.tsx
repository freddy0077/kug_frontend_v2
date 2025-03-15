'use client';

import React from 'react';
import Link from 'next/link';
import BreedForm from '@/components/breeds/BreedForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AddBreedPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Check if user has permission to add breeds
  if (user && !['ADMIN', 'MODERATOR'].includes(user.role)) {
    // Redirect unauthorized users
    router.push('/manage');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link 
          href="/manage/breeds" 
          className="text-green-600 hover:text-green-800 inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Breeds Management
        </Link>
      </div>
      
      <BreedForm />
    </div>
  );
}
