'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { hasPermission } from '@/utils/permissionUtils';

// Define the health record type using correct field names as per memory
interface HealthRecord {
  id: string;
  dogId: string;
  date: Date;
  // Using 'description' instead of 'diagnosis' as per memory
  description: string;
  // Using 'results' instead of 'test_results' as per memory
  results: string;
  veterinarianId: string;
  attachments: string[];
  detailedResults?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function HealthRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  const recordId = params.recordId as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [dogOwnerId, setDogOwnerId] = useState('');
  const [dogName, setDogName] = useState('');
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEditRecord, setCanEditRecord] = useState(false);
  const [canDeleteRecord, setCanDeleteRecord] = useState(false);
  
  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    const uid = localStorage.getItem('userId') || '';
    
    setIsAuthenticated(authStatus);
    setUserRole(role);
    setUserId(uid);
    
    // Redirect if not authenticated
    if (!authStatus) {
      router.push('/auth/login');
      return;
    }
    
    // Fetch dog and health record information
    const fetchData = async () => {
      try {
        // In a real app, you would fetch this from an API
        // For now, mock the data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Mock dog data
        const mockDogData = {
          id: dogId,
          name: 'Champion Rocky',
          ownerId: 'user123'
        };
        
        setDogName(mockDogData.name);
        setDogOwnerId(mockDogData.ownerId);
        
        // Check if user has permission to view this dog's health records
        if (!hasPermission(role, 'health-record', 'view', mockDogData.ownerId, uid)) {
          setError('You do not have permission to view this dog\'s health records');
          setIsLoading(false);
          return;
        }
        
        // Check if user can edit or delete health records
        const canEdit = hasPermission(role, 'health-record', 'edit', mockDogData.ownerId, uid);
        const canDelete = hasPermission(role, 'health-record', 'delete', mockDogData.ownerId, uid);
        setCanEditRecord(canEdit);
        setCanDeleteRecord(canDelete);
        
        // Mock health record with correct field names
        const mockHealthRecord: HealthRecord = {
          id: recordId,
          dogId,
          date: new Date('2024-01-15'),
          // Using 'description' instead of 'diagnosis' as per memory
          description: 'Hip Dysplasia',
          // Using 'results' instead of 'test_results' as per memory
          results: 'Good',
          veterinarianId: 'vet1',
          attachments: ['https://example.com/attachments/health-record-1.pdf'],
          detailedResults: 'The hip joint shows well-formed acetabulum with good coverage of the femoral head. The Norberg angle is approximately 105 degrees, which is within the normal range. No signs of subluxation or degenerative joint disease.',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        };
        
        setHealthRecord(mockHealthRecord);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to load health record information');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dogId, recordId, router]);
  
  const formatDate = (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Unknown Date';
    }
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleDeleteRecord = async () => {
    if (!window.confirm('Are you sure you want to delete this health record? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would make an API call to delete the record
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      router.push(`/manage/dogs/${dogId}/health`);
    } catch (error) {
      setError('Failed to delete health record');
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <Link 
            href={`/manage/dogs/${dogId}/health`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Health Records
          </Link>
        </div>
      </div>
    );
  }
  
  if (!healthRecord) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-md">
          <p>Health record not found</p>
        </div>
        <div className="mt-4">
          <Link 
            href={`/manage/dogs/${dogId}/health`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Health Records
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Health Record: {healthRecord.description}
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  Dog: {dogName}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  Date: {formatDate(healthRecord.date)}
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4 space-x-4">
              <Link 
                href={`/manage/dogs/${dogId}/health`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Health Records
              </Link>
              
              {canEditRecord && (
                <Link 
                  href={`/manage/dogs/${dogId}/health/${recordId}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Record
                </Link>
              )}
              
              {canDeleteRecord && (
                <button 
                  onClick={handleDeleteRecord}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Record
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Health Record Details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Health Test Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detailed information about the health test and results
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Test Type
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {/* Using 'description' instead of 'diagnosis' as per memory */}
                  {healthRecord.description}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Test Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(healthRecord.date)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Results
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {/* Using 'results' instead of 'test_results' as per memory */}
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    healthRecord.results === 'Normal' || healthRecord.results === 'Good' || healthRecord.results === 'Excellent' 
                      ? 'bg-green-100 text-green-800' 
                      : healthRecord.results === 'At Risk' || healthRecord.results === 'Fair' || healthRecord.results === 'Borderline'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {healthRecord.results}
                  </span>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Veterinarian
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Dr. Smith (ID: {healthRecord.veterinarianId})
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Detailed Results
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {healthRecord.detailedResults || 'No detailed results provided'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Attachments
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {healthRecord.attachments.length === 0 ? (
                    <p>No attachments available</p>
                  ) : (
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {healthRecord.attachments.map((attachment, index) => (
                        <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                            <span className="ml-2 flex-1 w-0 truncate">
                              Health Record Document {index + 1}
                            </span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <a href={attachment} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500">
                              Download
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Related Health Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Related Health Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Genetic implications and related conditions
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <div className="prose max-w-none">
                <h4>Implications for Breeding</h4>
                <p>
                  This health test result indicates that {dogName} has a Good hip evaluation. 
                  Dogs with Good or Excellent hip scores are suitable for breeding programs 
                  aimed at reducing the incidence of hip dysplasia in future generations.
                </p>
                
                <h4>Genetic Information</h4>
                <p>
                  Hip dysplasia has a polygenic inheritance pattern (influenced by multiple genes) 
                  with environmental factors also playing a role. While this test shows favorable results,
                  it's still recommended to select breeding partners with similarly good or excellent hip evaluations.
                </p>
                
                <h4>Recommended Follow-up</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Maintain healthy weight to reduce stress on joints</li>
                  <li>Appropriate exercise on suitable surfaces</li>
                  <li>Consider re-evaluation in 2 years if used for breeding</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
