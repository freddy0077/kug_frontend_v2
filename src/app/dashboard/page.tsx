'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { SITE_NAME } from '@/config/site';
import { 
  GET_DASHBOARD_SUMMARY, 
  GET_RECENT_DOGS, 
  GET_RECENT_COMPETITIONS,
  GET_BREEDING_RECORDS,
  GET_FEATURED_PEDIGREES 
} from '@/graphql/queries/dashboardQueries';
import Image from 'next/image';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import DogApprovalWidget from '@/components/admin/DogApprovalWidget';

// Helper function to format dates
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (e) {
    return 'Invalid date';
  }
};

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Redirect non-admin users to user dashboard
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'ADMIN') {
      router.push('/user-dashboard');
    }
  }, [isAuthenticated, user, router]);
  
  // Fetch dashboard summary data for admins only
  const { data: summaryData, loading: summaryLoading, error: summaryError } = useQuery(GET_DASHBOARD_SUMMARY);

  // Fetch recent dogs - removed authentication skip
  const { data: recentDogsData, loading: dogsLoading, error: dogsError } = useQuery(GET_RECENT_DOGS, {
    variables: { limit: 5 }
  });

  // Fetch recent competitions - removed authentication skip
  const { data: competitionsData, loading: competitionsLoading, error: competitionsError } = useQuery(GET_RECENT_COMPETITIONS, {
    variables: { limit: 5 }
  });
  
  // We need to fetch dogs first, then use their IDs for breeding records
  // For now, we'll skip the breeding records query since it requires a dog ID
  const breedingLoading = false;
  const breedingData = null;
  const breedingError = null;
  
  // Fetch featured pedigrees - removed authentication skip
  const { data: pedigreesData, loading: pedigreesLoading, error: pedigreesError } = useQuery(GET_FEATURED_PEDIGREES, {
    variables: { limit: 3 }
  });
  
  // Additional debugging for all queries
  useEffect(() => {
    console.log('Recent Dogs Data:', recentDogsData);
    console.log('Recent Dogs Error:', dogsError);
    console.log('Competitions Data:', competitionsData);
    console.log('Competitions Error:', competitionsError);
    console.log('Breeding Data:', breedingData);
    console.log('Breeding Error:', breedingError);
    console.log('Pedigrees Data:', pedigreesData);
    console.log('Pedigrees Error:', pedigreesError);
  }, [recentDogsData, dogsError, competitionsData, competitionsError, breedingData, breedingError, pedigreesData, pedigreesError]);

  useEffect(() => {
    if (!summaryLoading && !dogsLoading && !competitionsLoading && !breedingLoading && !pedigreesLoading) {
      setLoading(false);
    }
  }, [summaryLoading, dogsLoading, competitionsLoading, breedingLoading, pedigreesLoading]);
  
  // Gender distribution data for the pie chart
  const genderData = recentDogsData?.dogs?.items ? [
    { 
      name: 'Male', 
      value: recentDogsData.dogs.items.filter((dog: any) => dog.gender === 'MALE').length 
    },
    { 
      name: 'Female', 
      value: recentDogsData.dogs.items.filter((dog: any) => dog.gender === 'FEMALE').length 
    }
  ] : [];

  const GENDER_COLORS = ['#0088FE', '#FF8042'];

  // Upcoming events from the summary data
  const upcomingEvents = summaryData?.upcomingEvents || [];

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{SITE_NAME} Dashboard</h1>
        
        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Database Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Dogs</p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? 'Loading...' : summaryData?.dogs?.totalCount || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Breeds</p>
              <p className="text-2xl font-bold text-blue-600">
                {loading ? 'Loading...' : summaryData?.breeds?.totalCount || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Upcoming Events</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? 'Loading...' : upcomingEvents.length || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">User Role</p>
              <p className="text-2xl font-bold text-orange-600">
                {user?.role || 'Guest'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">User Role</p>
              <p className="text-2xl font-bold text-green-600">
                {user?.role || 'Guest'}
              </p>
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            <Link 
              href="/dogs" 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
              View All Dogs
            </Link>
            <Link 
              href="/breeds" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
              View All Breeds
            </Link>
          </div>
        </div>
        
        {/* Dog Approval Widget - Only visible to admins */}
        {user?.role === 'ADMIN' && (
          <DogApprovalWidget />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gender Distribution Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Gender Distribution</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} dogs`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Recent Dogs */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recently Added Dogs</h2>
              <Link 
                href="/dogs" 
                className="text-green-600 hover:text-green-800 text-sm font-medium">
                View All Dogs
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading recent dogs...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Born</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentDogsData?.dogs?.items.map((dog: any) => (
                      <tr key={dog.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative overflow-hidden rounded-full bg-gray-100">
                              {dog.mainImageUrl ? (
                                <Image 
                                  src={dog.mainImageUrl} 
                                  alt={dog.name}
                                  layout="fill"
                                  objectFit="cover"
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="h-10 w-10 flex items-center justify-center bg-green-100 text-green-800 rounded-full">
                                  {dog.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{dog.name}</div>
                              <div className="text-sm text-gray-500">#{dog.registrationNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dog.breedObj?.name || dog.breed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dog.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(dog.dateOfBirth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dog.currentOwner?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            href={`/dogs/${dog.id}`}
                            className="text-green-600 hover:text-green-900">
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Link 
              href="/events" 
              className="text-green-600 hover:text-green-800 text-sm font-medium">
              View All Events
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading events...</p>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event: any) => (
                <div key={event.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-200 relative">
                    {event.imageUrl ? (
                      <Image 
                        src={event.imageUrl} 
                        alt={event.title}
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100">
                        <span className="text-lg font-medium text-gray-800">{event.eventType}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{formatDate(event.startDate)}</p>
                    <p className="text-sm text-gray-500 mb-3 truncate">{event.location}</p>
                    <Link 
                      href={`/events/${event.id}`}
                      className="text-sm text-green-600 hover:text-green-800 font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No upcoming events found</p>
            </div>
          )}
        </div>

        {/* Recent Competition Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Competition Results</h2>
            <Link 
              href="/competitions" 
              className="text-green-600 hover:text-green-800 text-sm font-medium">
              View All Results
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading competition results...</p>
            </div>
          ) : competitionsData?.competitions?.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {competitionsData.competitions.items.map((comp: any) => (
                    <tr key={comp.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comp.eventName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comp.dogName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(comp.eventDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comp.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comp.rank || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comp.title_earned || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {comp.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No competition results found</p>
            </div>
          )}
        </div>
        
        {/* Recent Breeding Records */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Breeding Records</h2>
            <Link 
              href="/breeding-records" 
              className="text-green-600 hover:text-green-800 text-sm font-medium">
              View All Breeding Records
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading breeding records...</p>
            </div>
          ) : breedingData?.breedingRecords?.items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {breedingData.breedingRecords.items.map((record: any) => (
                <div key={record.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 border-b bg-gray-50">
                    <p className="text-sm text-gray-500">Breeding Date: {formatDate(record.breedingDate)}</p>
                    <p className="text-sm text-gray-500 mt-1">Litter Size: {record.litterSize || 'Unknown'}</p>
                  </div>
                  <div className="p-4">
                    <div className="flex space-x-4 mb-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Sire</h3>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative overflow-hidden rounded-full bg-gray-100 mr-2">
                            {record.sire?.mainImageUrl ? (
                              <Image 
                                src={record.sire.mainImageUrl} 
                                alt={record.sire.name}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full">
                                {record.sire?.name?.charAt(0) || 'S'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{record.sire?.name}</p>
                            <p className="text-xs text-gray-500">#{record.sire?.registrationNumber}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Dam</h3>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative overflow-hidden rounded-full bg-gray-100 mr-2">
                            {record.dam?.mainImageUrl ? (
                              <Image 
                                src={record.dam.mainImageUrl} 
                                alt={record.dam.name}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center bg-pink-100 text-pink-800 rounded-full">
                                {record.dam?.name?.charAt(0) || 'D'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{record.dam?.name}</p>
                            <p className="text-xs text-gray-500">#{record.dam?.registrationNumber}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Puppies</h4>
                      <div className="text-sm">
                        {record.puppies && record.puppies.length > 0 ? (
                          <ul className="space-y-1">
                            {record.puppies.slice(0, 3).map((puppy: any) => (
                              <li key={puppy.id} className="text-gray-700">
                                {puppy.name} <span className="text-gray-500 text-xs">#{puppy.registrationNumber}</span>
                              </li>
                            ))}
                            {record.puppies.length > 3 && (
                              <li className="text-gray-500 text-sm">+{record.puppies.length - 3} more</li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No puppies recorded yet</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <Link 
                        href={`/breeding-records/${record.id}`}
                        className="text-sm text-green-600 hover:text-green-800 font-medium">
                        View Full Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No breeding records found</p>
            </div>
          )}
        </div>

        {/* Featured Pedigrees */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Featured Pedigrees</h2>
            <Link 
              href="/dogs" 
              className="text-green-600 hover:text-green-800 text-sm font-medium">
              View All Dogs
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading pedigrees...</p>
            </div>
          ) : pedigreesData?.dogs?.items?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pedigreesData.dogs.items.map((dog: any) => (
                <div key={dog.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-200 relative">
                    {dog.mainImageUrl ? (
                      <Image 
                        src={dog.mainImageUrl} 
                        alt={dog.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-green-50 to-blue-50">
                        <span className="text-2xl font-medium text-gray-800">{dog.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{dog.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{dog.breed}</p>
                    <p className="text-sm text-gray-500 mb-3">#{dog.registrationNumber}</p>
                    
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Pedigree</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border p-2 rounded bg-gray-50">
                          <p className="text-xs text-gray-500">Sire</p>
                          <p className="text-sm font-medium">{dog.sire?.name || 'Not recorded'}</p>
                          {dog.sire?.registrationNumber && (
                            <p className="text-xs text-gray-500">#{dog.sire.registrationNumber}</p>
                          )}
                        </div>
                        <div className="border p-2 rounded bg-gray-50">
                          <p className="text-xs text-gray-500">Dam</p>
                          <p className="text-sm font-medium">{dog.dam?.name || 'Not recorded'}</p>
                          {dog.dam?.registrationNumber && (
                            <p className="text-xs text-gray-500">#{dog.dam.registrationNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/dogs/${dog.id}/pedigree`}
                      className="text-sm text-green-600 hover:text-green-800 font-medium inline-flex items-center">
                      View Full Pedigree Tree
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No featured pedigrees found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
