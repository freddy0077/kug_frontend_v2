'use client';

import { useState, useEffect } from 'react';
import { UserRole } from '@/utils/permissionUtils';
import Link from 'next/link';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, loading, user, router]);
  const [dogData, setDogData] = useState([
    { id: 1, name: 'Max', breed: 'Golden Retriever', age: 3, registrationNumber: 'PD-12345' },
    { id: 2, name: 'Luna', breed: 'German Shepherd', age: 2, registrationNumber: 'PD-67890' },
    { id: 3, name: 'Charlie', breed: 'Labrador Retriever', age: 5, registrationNumber: 'PD-54321' },
  ]);

  const healthRecords = [
    { id: 1, dogName: 'Max', description: 'Annual checkup', date: new Date(2024, 9, 10), status: 'excellent' },
    { id: 2, dogName: 'Luna', description: 'Vaccinations', date: new Date(2024, 10, 5), status: 'good' },
  ];

  const competitionResults = [
    { id: 1, dogName: 'Luna', eventName: 'Regional Championship', date: new Date(2024, 8, 15), rank: 1, title_earned: 'Best in Show' },
    { id: 2, dogName: 'Charlie', eventName: 'Agility Contest', date: new Date(2024, 7, 22), rank: 3, title_earned: 'Agility Champion' },
  ];
  
  const breedingPrograms = [
    { id: 1, maleDog: 'Charlie', femaleDog: 'Luna', expectedBreedDate: new Date(2025, 0, 15), status: 'planned' },
    { id: 2, maleDog: 'Max', femaleDog: 'Bella', expectedBreedDate: new Date(2024, 11, 10), status: 'confirmed' },
  ];

  const kennelClubEvents = [
    { id: 1, name: 'Spring Dog Show', date: new Date(2025, 3, 15), location: 'Central Park', registrations: 45 },
    { id: 2, name: 'Summer Agility Competition', date: new Date(2025, 6, 8), location: 'Riverside Field', registrations: 32 },
  ];

  const formatDate = (date: Date) => {
    return format(date, 'MMMM d, yyyy');
  };

  // Role-based greeting messages
  const getRoleBasedGreeting = () => {
    if (!user) return 'Manage your PedigreeTrack account';
    
    switch(user.role.toLowerCase()) {
      case 'owner':
        return 'View and manage your registered dogs';
      case 'breeder':
        return 'Manage your breeding programs and dog records';
      case 'handler':
        return 'Track competition results and upcoming events';
      case 'club':
        return 'Manage kennel club events and registrations';
      default:
        return 'Manage your PedigreeTrack account';
    }
  };

  // Role-based panels to display
  const shouldShowPanel = (panel: string) => {
    if (!user) return false;
    
    const userRole = user.role.toLowerCase();
    switch(panel) {
      case 'dogs':
        return true; // All roles can see dogs
      case 'health':
        return ['owner', 'breeder', 'handler'].includes(userRole);
      case 'competitions':
        return ['owner', 'handler', 'club'].includes(userRole);
      case 'breeding':
        return ['breeder'].includes(userRole);
      case 'club':
        return ['club'].includes(userRole);
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.HANDLER, UserRole.CLUB]}>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.fullName || 'User'}</h1>
                <p className="mt-1 text-gray-600">{getRoleBasedGreeting()}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'User'}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Link
                  href="/manage"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Management Dashboard
                </Link>
                <Link
                  href="/user/profile"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Profile Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Registered Dogs - Visible to all roles */}
          {shouldShowPanel('dogs') && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Registered Dogs</h2>
                <Link 
                  href="/manage/dogs" 
                  className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Manage Dogs
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dogData.map(dog => (
                      <tr key={dog.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dog.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dog.breed}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dog.age} years</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dog.registrationNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            href={`/dogs/${dog.id}`}
                            className="text-green-600 hover:text-green-900 mr-3">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Health Records - For owners, breeders, handlers */}
          {shouldShowPanel('health') && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Health Records</h2>
                <Link 
                  href="/health-records" 
                  className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View All Records
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {healthRecords.map(record => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.dogName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'excellent' ? 'bg-green-100 text-green-800' : 
                            record.status === 'good' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Competition Results - For owners, handlers, clubs */}
          {shouldShowPanel('competitions') && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Competition Results</h2>
                <Link 
                  href="/competitions" 
                  className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View All Results
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title Earned</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {competitionResults.map(result => (
                      <tr key={result.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.dogName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.eventName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(result.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{result.rank}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.title_earned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Breeding Programs - For breeders only */}
          {shouldShowPanel('breeding') && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Breeding Programs</h2>
                <Link 
                  href="/breeding-programs" 
                  className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Manage Breeding
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Male Dog</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Female Dog</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {breedingPrograms.map(program => (
                      <tr key={program.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{program.maleDog}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.femaleDog}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(program.expectedBreedDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            program.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            program.status === 'planned' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Kennel Club Events - For clubs only */}
          {shouldShowPanel('club') && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Kennel Club Events</h2>
                <Link 
                  href="/club-events" 
                  className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Manage Events
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {kennelClubEvents.map(event => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.registrations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
