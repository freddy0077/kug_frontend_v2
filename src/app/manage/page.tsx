'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/utils/permissionUtils';

// Define management card interfaces
interface ManagementCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

export default function ManageDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.VIEWER);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  React.useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      setUserRole(user.role as UserRole);
      setUserName(user.fullName);
      setUserEmail(user.email);
    }
  }, [user]);

  // Management cards configuration
  const managementCards: ManagementCard[] = [
    {
      title: 'Dogs',
      description: 'Add new dogs, edit existing profiles, or manage dog details',
      href: '/manage/dogs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      ),
      color: 'bg-green-100 text-green-800',
    },
    {
      title: 'Health Records',
      description: 'Track medical history, veterinary visits, and health tests',
      href: '/manage/health-records',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Competition Results',
      description: 'Record show results, titles earned, and competition history',
      href: '/manage/competitions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a7.454 7.454 0 01-3.172.981m0-3.132c.852 1.464 2.061 2.679 3.522 3.522" />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'Ownership Records',
      description: 'Manage dog ownership transfers and changes in ownership',
      href: '/manage/ownerships',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: 'bg-amber-100 text-amber-800',
    }
  ];

  // Statistics for quick view
  const statistics = [
    { label: 'Total Dogs', value: '158' },
    { label: 'Health Records', value: '512' },
    { label: 'Competition Results', value: '324' },
    { label: 'Active Breeders', value: '43' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; 
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {user && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
            <div className="bg-green-700 px-6 py-12 sm:px-10 sm:py-16">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                  Welcome, {userName}
                </h1>
                <p className="mt-4 text-lg text-green-100">
                  {userRole === UserRole.OWNER && 'Manage your dog profiles and records'}
                  {userRole === UserRole.HANDLER && 'Track competition results and training records'}
                  {userRole === UserRole.CLUB && 'Manage club events and member registrations'}
                  {userRole === UserRole.ADMIN && 'Administrate the entire system'}
                  {userRole === UserRole.VIEWER && 'View dog profiles, health records, competition results, and ownership information'}
                </p>
                <div className="mt-4 inline-block bg-green-800 px-3 py-1 rounded-full text-sm text-white">
                  {userRole} Account
                </div>
              </div>
            </div>
          
            {/* Statistics */}
            <div className="bg-green-50 px-6 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statistics.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-green-800">{stat.value}</p>
                    <p className="text-sm md:text-base text-green-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Management Cards - Filtered based on user role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {managementCards
            .filter(card => {
              // Show all cards for admin
              if (userRole === UserRole.ADMIN) return true;
              
              // Role-based filtering
              switch (card.title) {
                case 'Dogs':
                  // All roles can access Dogs
                  return true;
                case 'Health Records':
                  // Owners, breeders, and handlers can access health records
                  return ['owner', 'breeder', 'handler'].includes(userRole);
                case 'Competition Results':
                  // Owners, handlers, and clubs can access competition results
                  return ['owner', 'handler', 'club'].includes(userRole);
                case 'Ownership Records':
                  // Owners, breeders, and clubs can access ownership records
                  return ['owner', 'breeder', 'club'].includes(userRole);
                default:
                  return true;
              }
            })
            .map((card, index) => (
              <Link 
                href={card.href}
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105 hover:shadow-lg border-b-4 border-green-500"
              >
                <div className="p-6 flex items-start">
                  <div className={`${card.color} p-3 rounded-lg mr-5 flex-shrink-0`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{card.title}</h3>
                    <p className="text-gray-600">{card.description}</p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
        
        {/* Recent Activity (Placeholder) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="px-6 py-4">
            <ul className="divide-y divide-gray-200">
              <li className="py-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 text-blue-800 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New dog added: Champion Riverrun's Golden Star</p>
                    <p className="text-xs text-gray-500">Today at 10:45 AM</p>
                  </div>
                </div>
              </li>
              <li className="py-3">
                <div className="flex items-center">
                  <div className="bg-purple-100 text-purple-800 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Competition result added: Luna won Best of Breed</p>
                    <p className="text-xs text-gray-500">Yesterday at 4:30 PM</p>
                  </div>
                </div>
              </li>
              <li className="py-3">
                <div className="flex items-center">
                  <div className="bg-green-100 text-green-800 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Health record updated: Charlie's annual checkup</p>
                    <p className="text-xs text-gray-500">Oct 15, 2023</p>
                  </div>
                </div>
              </li>
            </ul>
            <div className="mt-4 text-center">
              <Link href="/user/activity" className="text-green-600 font-medium text-sm hover:text-green-800">
                View all activity
              </Link>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/manage/dogs')}
                className="flex flex-col items-center py-3 px-2 border border-gray-200 rounded-md hover:bg-green-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Add Dog</span>
              </button>
              <button
                onClick={() => router.push('/manage/health-records')}
                className="flex flex-col items-center py-3 px-2 border border-gray-200 rounded-md hover:bg-green-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Add Health Record</span>
              </button>
              <button
                onClick={() => router.push('/manage/competitions')}
                className="flex flex-col items-center py-3 px-2 border border-gray-200 rounded-md hover:bg-green-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Add Competition</span>
              </button>
              <button
                onClick={() => router.push('/dogs')}
                className="flex flex-col items-center py-3 px-2 border border-gray-200 rounded-md hover:bg-green-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-900">View Dogs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
