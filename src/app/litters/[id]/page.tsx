'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { GET_LITTER } from '@/graphql/queries/litterQueries';
import { UserRole } from '@/utils/permissionUtils';
import { formatDate } from '@/utils/dateUtils';

export default function LitterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const litterId = params?.id;
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  
  // Fetch litter details
  const { loading, error, data, refetch } = useQuery(GET_LITTER, {
    variables: { id: litterId },
    skip: !litterId || !user,
    fetchPolicy: 'network-only',
  });
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/litters/${litterId}`);
    }
  }, [user, authLoading, router, litterId]);
  
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Error loading litter details: {error.message}
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/litters"
                      className="text-sm font-medium text-red-700 hover:text-red-600"
                    >
                      Go back to Litters
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const litter = data?.litter;
  
  if (!litter) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Litter not found</h3>
              <p className="mt-1 text-sm text-gray-500">
                The litter you are looking for does not exist or you don't have permission to view it.
              </p>
              <div className="mt-6">
                <Link
                  href="/litters"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Litters
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Format dates for display
  const whelpingDate = litter.whelpingDate ? formatDate(litter.whelpingDate) : 'Not specified';
  const registrationDate = litter.registrationDate ? formatDate(litter.registrationDate) : 'Not specified';
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div>
                  <Link href="/" className="text-gray-400 hover:text-gray-500">
                    <svg className="flex-shrink-0 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="sr-only">Home</span>
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <Link href="/litters" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Litters
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500">
                    {litter.litterName}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {litter.litterName}
            </h1>
            {litter.registrationNumber && (
              <p className="mt-1 text-sm text-gray-500">
                Registration: {litter.registrationNumber}
              </p>
            )}
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            {(user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER) && (
              <>
                <Link
                  href={`/litters/${litter.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Litter
                </Link>
                <Link
                  href={`/litters/${litter.id}/register-puppies`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Register Puppies
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('details')}
                className={`${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Litter Details
              </button>
              <button
                onClick={() => setActiveTab('puppies')}
                className={`${
                  activeTab === 'puppies'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Puppies ({litter.puppies?.length || 0})
              </button>
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {activeTab === 'details' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Litter Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Litter Information</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Litter Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{litter.litterName}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{litter.registrationNumber || 'Not registered'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Whelping Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{whelpingDate}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Total Puppies</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {litter.totalPuppies || 0}
                        {litter.malePuppies !== undefined && litter.femalePuppies !== undefined && (
                          <span className="text-gray-500 ml-1">
                            ({litter.malePuppies}M / {litter.femalePuppies}F)
                          </span>
                        )}
                      </dd>
                    </div>
                    {litter.notes && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{litter.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                {/* Parent Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sire Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        {litter.sire.mainImageUrl ? (
                          <img 
                            src={litter.sire.mainImageUrl} 
                            alt={litter.sire.name}
                            className="h-12 w-12 rounded-full object-cover mr-3" 
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Sire (Father)</h4>
                          <Link 
                            href={`/dogs/${litter.sire.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {litter.sire.name}
                          </Link>
                        </div>
                      </div>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Breed</dt>
                          <dd className="text-sm text-gray-900">{litter.sire.breed}</dd>
                        </div>
                        {litter.sire.color && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Color</dt>
                            <dd className="text-sm text-gray-900">{litter.sire.color}</dd>
                          </div>
                        )}
                        {litter.sire.registrationNumber && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Registration</dt>
                            <dd className="text-sm text-gray-900">{litter.sire.registrationNumber}</dd>
                          </div>
                        )}
                        {litter.sire.titles && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Titles</dt>
                            <dd className="text-sm text-gray-900">{litter.sire.titles}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    
                    {/* Dam Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        {litter.dam.mainImageUrl ? (
                          <img 
                            src={litter.dam.mainImageUrl} 
                            alt={litter.dam.name}
                            className="h-12 w-12 rounded-full object-cover mr-3" 
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Dam (Mother)</h4>
                          <Link 
                            href={`/dogs/${litter.dam.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {litter.dam.name}
                          </Link>
                        </div>
                      </div>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Breed</dt>
                          <dd className="text-sm text-gray-900">{litter.dam.breed}</dd>
                        </div>
                        {litter.dam.color && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Color</dt>
                            <dd className="text-sm text-gray-900">{litter.dam.color}</dd>
                          </div>
                        )}
                        {litter.dam.registrationNumber && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Registration</dt>
                            <dd className="text-sm text-gray-900">{litter.dam.registrationNumber}</dd>
                          </div>
                        )}
                        {litter.dam.titles && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Titles</dt>
                            <dd className="text-sm text-gray-900">{litter.dam.titles}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'puppies' && (
            <div className="p-6">
              {litter.puppies?.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Puppies in this Litter</h3>
                    {(user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER) && (
                      <Link
                        href={`/litters/${litter.id}/register-puppies`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Register More Puppies
                      </Link>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {litter.puppies.map((puppy: any) => (
                      <div key={puppy.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="p-4">
                          <div className="flex items-center mb-3">
                            {puppy.mainImageUrl ? (
                              <img 
                                src={puppy.mainImageUrl} 
                                alt={puppy.name}
                                className="h-12 w-12 rounded-full object-cover mr-3" 
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <Link 
                                href={`/dogs/${puppy.id}`} 
                                className="text-sm font-medium text-gray-900 hover:text-blue-600"
                              >
                                {puppy.name}
                              </Link>
                              <p className="text-xs text-gray-500">
                                {puppy.gender === 'male' ? '♂ Male' : '♀ Female'}
                              </p>
                            </div>
                          </div>
                          
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 mt-2">
                            {litter.whelpingDate && (
                              <div>
                                <dt className="text-xs font-medium text-gray-500">Date of Birth</dt>
                                <dd className="text-sm text-gray-900">{formatDate(litter.whelpingDate)}</dd>
                              </div>
                            )}
                            {puppy.color && (
                              <div>
                                <dt className="text-xs font-medium text-gray-500">Color</dt>
                                <dd className="text-sm text-gray-900">{puppy.color}</dd>
                              </div>
                            )}
                            {puppy.microchipNumber && (
                              <div>
                                <dt className="text-xs font-medium text-gray-500">Microchip</dt>
                                <dd className="text-sm text-gray-900">{puppy.microchipNumber}</dd>
                              </div>
                            )}
                            {puppy.owner && (
                              <div>
                                <dt className="text-xs font-medium text-gray-500">Owner</dt>
                                <dd className="text-sm text-gray-900">{puppy.owner.name}</dd>
                              </div>
                            )}
                          </dl>
                          
                          <div className="mt-4">
                            <Link
                              href={`/dogs/${puppy.id}`}
                              className="text-xs text-blue-600 hover:text-blue-900"
                            >
                              View Full Profile →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No puppies registered</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No puppies have been registered for this litter yet.
                  </p>
                  {(user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER) && (
                    <div className="mt-6">
                      <Link
                        href={`/litters/${litter.id}/register-puppies`}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Register Puppies
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
