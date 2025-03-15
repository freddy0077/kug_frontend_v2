'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// This is a simple redirection page that will send users to the profile sub-route
export default function DogRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  
  useEffect(() => {
    // Check if we have a valid dog ID and redirect to the profile page
    if (dogId) {
      router.replace(`/manage/dogs/${dogId}/profile`);
    } else {
      // If somehow we don't have a dog ID, redirect to the dogs listing
      router.replace('/manage/dogs');
    }
  }, [dogId, router]);

  // While redirecting, show a simple loading state
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
