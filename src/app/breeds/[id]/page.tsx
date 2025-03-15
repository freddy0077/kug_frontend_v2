'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import BreedDetail from '@/components/breeds/BreedDetail';
import { useAuth } from '@/contexts/AuthContext';

export default function BreedDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  // Check if user has admin or moderator role to show edit button
  const canEdit = user && ['ADMIN', 'MODERATOR'].includes(user.role);
  
  return (
    <>
      {canEdit && (
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-0 sm:px-6 lg:px-8 flex justify-end">
          <Link 
            href={`/manage/breeds/edit/${id}`} 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Breed
          </Link>
        </div>
      )}
      
      <BreedDetail breedId={id as string} />
    </>
  );
}
