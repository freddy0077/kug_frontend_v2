'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { hasPermission, UserRole } from '@/utils/permissionUtils';
import HealthStatistics from '@/components/health/HealthStatistics';

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
  createdAt: Date;
  updatedAt: Date;
}

export default function DogHealthRecordsPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.VIEWER);
  const [userId, setUserId] = useState('');
  const [dogOwnerId, setDogOwnerId] = useState('');
  const [dogName, setDogName] = useState('');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canAddRecord, setCanAddRecord] = useState(false);
  
  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    const uid = localStorage.getItem('userId') || '';
    
    setIsAuthenticated(authStatus);
    setUserRole(role as UserRole);
    setUserId(uid);
    
    // Redirect if not authenticated
    if (!authStatus) {
      router.push('/auth/login');
      return;
    }
    
    // Fetch dog information and health records
    const fetchDogAndHealthRecords = async () => {
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
        if (!hasPermission(userRole, 'health-record', 'view', mockDogData.ownerId, uid)) {
          setError('You do not have permission to view this dog\'s health records');
          setIsLoading(false);
          return;
        }
        
        // Check if user can add health records
        const canAdd = hasPermission(userRole, 'health-record', 'create', mockDogData.ownerId, uid);
        setCanAddRecord(canAdd);
        
        // Mock health records with correct field names
        const mockHealthRecords: HealthRecord[] = [
          {
            id: 'hr1',
            dogId,
            date: new Date('2024-01-15'),
            // Using 'description' instead of 'diagnosis' as per memory
            description: 'Hip Dysplasia',
            // Using 'results' instead of 'test_results' as per memory
            results: 'Good',
            veterinarianId: 'vet1',
            attachments: ['https://example.com/attachments/health-record-1.pdf'],
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
          },
          {
            id: 'hr2',
            dogId,
            date: new Date('2024-02-20'),
            // Using 'description' instead of 'diagnosis' as per memory
            description: 'DNA Test',
            // Using 'results' instead of 'test_results' as per memory
            results: 'Normal',
            veterinarianId: 'vet2',
            attachments: [],
            createdAt: new Date('2024-02-20'),
            updatedAt: new Date('2024-02-20')
          },
          {
            id: 'hr3',
            dogId,
            date: new Date('2024-03-01'),
            // Using 'description' instead of 'diagnosis' as per memory
            description: 'Eye Examination',
            // Using 'results' instead of 'test_results' as per memory
            results: 'Normal',
            veterinarianId: 'vet1',
            attachments: ['https://example.com/attachments/health-record-3.pdf'],
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-03-01')
          }
        ];
        
        setHealthRecords(mockHealthRecords);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to load dog information or health records');
        setIsLoading(false);
      }
    };
    
    fetchDogAndHealthRecords();
  }, [dogId, router]);
  
  const formatDate = (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Unknown Date';
    }
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            href={`/manage/dogs/${dogId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dog Profile
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
                {dogName} - Health Records
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  View and manage health tests, examinations, and genetic screening results
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4 space-x-4">
              <Link 
                href={`/manage/dogs/${dogId}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dog Profile
              </Link>
              
              {canAddRecord && (
                <Link 
                  href={`/manage/dogs/${dogId}/health/add`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Health Record
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Health Records Summary */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <ul className="divide-y divide-gray-200">
            {healthRecords.length === 0 ? (
              <li className="px-6 py-4">
                <p className="text-center text-gray-500">No health records found for this dog.</p>
              </li>
            ) : (
              healthRecords.map((record) => (
                <li key={record.id}>
                  <Link href={`/manage/dogs/${dogId}/health/${record.id}`}>
                    <div className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-blue-600 truncate">
                            {/* Using 'description' instead of 'diagnosis' as per memory */}
                            {record.description}
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.results === 'Normal' || record.results === 'Good' || record.results === 'Excellent' 
                                ? 'bg-green-100 text-green-800' 
                                : record.results === 'At Risk' || record.results === 'Fair' || record.results === 'Borderline'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {/* Using 'results' instead of 'test_results' as per memory */}
                              {record.results}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <span className="truncate">
                                Date: {formatDate(record.date)}
                              </span>
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              {record.attachments.length > 0 
                                ? `${record.attachments.length} attachment${record.attachments.length > 1 ? 's' : ''}` 
                                : 'No attachments'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        
        {/* Health Statistics Component - Dynamic statistics and recommendations */}
        <HealthStatistics 
          healthRecords={healthRecords}
          dogName={dogName}
        />
      </div>
    </div>
  );
}
