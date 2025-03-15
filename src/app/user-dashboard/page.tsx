'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { GET_RECENT_DOGS } from '@/graphql/queries/dashboardQueries';

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export default function UserDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);
  
  // Fetch recent dogs for the user dashboard
  const { data: recentDogsData, loading: dogsLoading } = useQuery(GET_RECENT_DOGS, {
    variables: { limit: 5 }
  });
  
  useEffect(() => {
    if (!dogsLoading) {
      setLoading(false);
    }
  }, [dogsLoading]);
  
  // If the user is an admin, redirect to the admin dashboard
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {user?.firstName || 'User'}</h1>
        
        {/* User Profile Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 h-20 w-20 relative overflow-hidden rounded-full bg-gray-100">
              {user?.profileImageUrl ? (
                <Image 
                  src={user.profileImageUrl} 
                  alt={user.fullName}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full">
                  {user?.firstName?.charAt(0) || ''}
                  {user?.lastName?.charAt(0) || ''}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.fullName}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">Last login: {user?.lastLogin ? formatDate(user.lastLogin.toString()) : 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link href="/dogs/search" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-medium">Search Dogs</span>
              </div>
            </Link>
            <Link href="/pedigree" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-medium">View Pedigrees</span>
              </div>
            </Link>
            <Link href="/competitions" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Competition Results</span>
              </div>
            </Link>
            <Link href="/profile/settings" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Account Settings</span>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Recent Dogs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Dogs</h2>
            <Link 
              href="/dogs" 
              className="text-green-600 hover:text-green-800 text-sm font-medium">
              View All Dogs
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading dogs...</p>
            </div>
          ) : recentDogsData?.dogs?.items?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recentDogsData.dogs.items.map((dog: any) => (
                <Link 
                  href={`/dogs/${dog.id}`}
                  key={dog.id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    {dog.mainImageUrl ? (
                      <Image 
                        src={dog.mainImageUrl} 
                        alt={dog.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100">
                        <span className="text-xl font-medium text-gray-800">{dog.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{dog.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {dog.breedObj?.name || dog.breed || 'Unknown Breed'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">#{dog.registrationNumber}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {dog.gender}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No dogs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
