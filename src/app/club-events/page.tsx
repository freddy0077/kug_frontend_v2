'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ClubEvents() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Sample club events data
  const clubEvents = [
    {
      id: 1,
      name: "Annual Championship Show",
      date: new Date("2025-05-15"),
      location: "Central Exhibition Center, New York",
      description: "Our flagship championship show featuring all recognized breeds with international judges.",
      registrationOpen: true,
      registeredDogs: 142,
      eventType: "show"
    },
    {
      id: 2,
      name: "Spring Obedience Trial",
      date: new Date("2025-04-22"),
      location: "Bayfront Dog Training Center, San Francisco",
      description: "Obedience competition for all levels from beginners to advanced competitors.",
      registrationOpen: true,
      registeredDogs: 87,
      eventType: "obedience"
    },
    {
      id: 3,
      name: "Agility Competition Weekend",
      date: new Date("2025-06-05"),
      location: "Meadowlands Sports Complex, New Jersey",
      description: "Two-day agility competition featuring standard and jumpers courses for all skill levels.",
      registrationOpen: false,
      registeredDogs: 0,
      eventType: "agility"
    },
    {
      id: 4,
      name: "Health Clinic & Seminar",
      date: new Date("2025-04-10"),
      location: "University Veterinary Center, Boston",
      description: "Educational seminar on canine health issues with discounted health screenings available.",
      registrationOpen: true,
      registeredDogs: 35,
      eventType: "health"
    }
  ];

  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    
    setIsAuthenticated(authStatus);
    setUserRole(role);
    setIsLoading(false);
    
    // Redirect if not authenticated or not a club/admin
    if (!authStatus) {
      router.push('/auth/login');
    } else if (role !== 'club' && role !== 'admin') {
      router.push('/user/dashboard');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || (userRole !== 'club' && userRole !== 'admin')) {
    return null; // We already redirect in the useEffect, this is just a safeguard
  }

  const formatEventDate = (date) => {
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Club Events</h1>
              <p className="mt-1 text-gray-600">Manage your kennel club events, shows, and registrations</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/club-events/add"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Event
              </Link>
            </div>
          </div>
        </div>

        {/* Events Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Events Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-amber-700">{clubEvents.length}</p>
              <p className="text-sm text-amber-600">Upcoming Events</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{clubEvents.filter(e => e.registrationOpen).length}</p>
              <p className="text-sm text-green-600">Open for Registration</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">264</p>
              <p className="text-sm text-blue-600">Total Registrations</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">12</p>
              <p className="text-sm text-purple-600">Judges Confirmed</p>
            </div>
          </div>
        </div>

        {/* Event Listing */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
            <div>
              <select 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                <option value="all">All Event Types</option>
                <option value="show">Shows</option>
                <option value="obedience">Obedience Trials</option>
                <option value="agility">Agility Competitions</option>
                <option value="health">Health Clinics</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-hidden">
            {clubEvents.map(event => (
              <div 
                key={event.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className={`
                          p-3 rounded-md mr-4 flex-shrink-0
                          ${event.eventType === 'show' ? 'bg-amber-100 text-amber-700' : 
                            event.eventType === 'obedience' ? 'bg-blue-100 text-blue-700' : 
                            event.eventType === 'agility' ? 'bg-green-100 text-green-700' : 
                            'bg-purple-100 text-purple-700'}
                        `}>
                          {event.eventType === 'show' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a7.454 7.454 0 01-3.172.981m0-3.132c.852 1.464 2.061 2.679 3.522 3.522" />
                            </svg>
                          ) : event.eventType === 'obedience' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                            </svg>
                          ) : event.eventType === 'agility' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{formatEventDate(event.date)} • {event.location}</p>
                          <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${event.registrationOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {event.registrationOpen ? 'Registration Open' : 'Registration Closed'}
                            </span>
                            {event.registrationOpen && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {event.registeredDogs} Dogs Registered
                              </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                              {event.eventType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3 items-start">
                      <Link
                        href={`/club-events/${event.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Manage Event
                      </Link>
                      <Link
                        href={`/club-events/${event.id}/registrations`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        View Entries
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/club-events/judges"
            className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500 hover:bg-gray-50"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Judge Management</h3>
            <p className="text-gray-600 mb-4">Invite, schedule and manage judges for your events</p>
            <span className="text-purple-600 font-medium">Manage Judges →</span>
          </Link>
          <Link
            href="/club-events/results"
            className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500 hover:bg-gray-50"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Event Results</h3>
            <p className="text-gray-600 mb-4">Record and publish results from completed events</p>
            <span className="text-green-600 font-medium">Manage Results →</span>
          </Link>
          <Link
            href="/club-events/certificates"
            className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 hover:bg-gray-50"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Title Certificates</h3>
            <p className="text-gray-600 mb-4">Generate and send certificates for title earners</p>
            <span className="text-blue-600 font-medium">Manage Certificates →</span>
          </Link>
        </div>

        {/* Calendar View Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Event Calendar</h2>
            <Link 
              href="/club-events/calendar"
              className="text-amber-600 hover:text-amber-800 text-sm font-medium"
            >
              View Full Calendar
            </Link>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-500">Calendar view will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
