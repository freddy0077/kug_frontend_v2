'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/enums';

interface HealthRecord {
  id: string;
  date: string;
  type: string;
  description?: string;
  veterinarian?: string;
  facility?: string;
  results?: string;
  attachmentUrl?: string;
}

interface HealthTabProps {
  dogId: string;
  healthRecords: HealthRecord[];
}

const HealthTab: React.FC<HealthTabProps> = ({ dogId, healthRecords }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER;
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  
  // Sort health records by date, newest first
  const sortedRecords = [...healthRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error("Invalid date format:", error);
      return "N/A";
    }
  };
  
  // Group records by year for timeline display
  const recordsByYear = sortedRecords.reduce((acc, record) => {
    try {
      const year = new Date(record.date).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(record);
      return acc;
    } catch (error) {
      const year = 'Unknown';
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(record);
      return acc;
    }
  }, {} as Record<string, HealthRecord[]>);
  
  // Get years in descending order
  const years = Object.keys(recordsByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left column - Timeline */}
      <div className="md:col-span-2">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Health Timeline
            </h3>
            
            {isAdmin && (
              <Link
                href={`/manage/dogs/${dogId}/health/add`}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Record
              </Link>
            )}
          </div>
          
          {sortedRecords.length > 0 ? (
            <div className="space-y-10">
              {years.map(year => (
                <div key={year} className="relative">
                  {/* Year marker */}
                  <div className="sticky top-16 z-10 bg-gray-100 rounded-full px-4 py-1 inline-block text-gray-700 font-semibold mb-4 shadow-sm">
                    {year}
                  </div>
                  
                  {/* Timeline entries */}
                  <div className="border-l-2 border-green-200 ml-3 pl-8 space-y-6">
                    {recordsByYear[year].map((record, index) => (
                      <div 
                        key={record.id} 
                        className={`relative cursor-pointer ${
                          selectedRecord?.id === record.id 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-white hover:bg-gray-50'
                        } border rounded-lg p-4 shadow-sm transition-all duration-200`}
                        onClick={() => setSelectedRecord(record)}
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-11 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow"></div>
                        
                        {/* Record content */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {record.type}
                            </h4>
                            <div className="text-sm text-gray-500 mt-1">
                              {formatDate(record.date)}
                            </div>
                            {record.veterinarian && (
                              <div className="text-sm text-gray-600 mt-1">
                                Dr. {record.veterinarian}
                                {record.facility && ` · ${record.facility}`}
                              </div>
                            )}
                          </div>
                          
                          <div className="sm:text-right">
                            <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record)}`}>
                              {getRecordStatus(record)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Preview of description */}
                        {record.description && (
                          <div className="mt-2 text-sm text-gray-700 line-clamp-2">
                            {record.description}
                          </div>
                        )}
                        
                        {/* View details link */}
                        <div className="mt-2 text-right">
                          <Link 
                            href={`/manage/dogs/${dogId}/health/${record.id}`}
                            className="text-xs text-green-600 hover:text-green-800 inline-flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Details
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mt-4 text-gray-500">No health records found</p>
              {isAdmin && (
                <Link
                  href={`/manage/dogs/${dogId}/health/add`}
                  className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Add First Record
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Right column - Selected record details */}
      <div>
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Record Details
          </h3>
          
          {selectedRecord ? (
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Type</span>
                <span className="font-medium">{selectedRecord.type}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Date</span>
                <span className="font-medium">{formatDate(selectedRecord.date)}</span>
              </div>
              
              {selectedRecord.veterinarian && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Veterinarian</span>
                  <span className="font-medium">Dr. {selectedRecord.veterinarian}</span>
                </div>
              )}
              
              {selectedRecord.facility && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Facility</span>
                  <span className="font-medium">{selectedRecord.facility}</span>
                </div>
              )}
              
              {selectedRecord.description && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Description</span>
                  <span className="font-medium whitespace-pre-line">{selectedRecord.description}</span>
                </div>
              )}
              
              {selectedRecord.results && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Results</span>
                  <span className="font-medium">{selectedRecord.results}</span>
                </div>
              )}
              
              {selectedRecord.attachmentUrl && (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Attachment</span>
                  <a 
                    href={selectedRecord.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    View Attachment
                  </a>
                </div>
              )}
              
              <div className="pt-4 flex justify-end space-x-2">
                {isAdmin && (
                  <Link
                    href={`/manage/dogs/${dogId}/health/${selectedRecord.id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                )}
                
                <Link
                  href={`/manage/dogs/${dogId}/health/${selectedRecord.id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Full View
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <svg className="w-12 h-12 text-gray-200 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-500">Select a record to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions for determining record status and colors
function getRecordStatus(record: HealthRecord): string {
  if (record.type.toLowerCase().includes('vaccination')) {
    return 'Vaccination';
  }
  if (record.type.toLowerCase().includes('surgery')) {
    return 'Surgery';
  }
  if (record.type.toLowerCase().includes('check') || record.type.toLowerCase().includes('exam')) {
    return 'Checkup';
  }
  if (record.type.toLowerCase().includes('test')) {
    return 'Test';
  }
  return 'Medical';
}

function getStatusColor(record: HealthRecord): string {
  const status = getRecordStatus(record).toLowerCase();
  
  if (status === 'vaccination') {
    return 'bg-blue-100 text-blue-800';
  }
  if (status === 'surgery') {
    return 'bg-red-100 text-red-800';
  }
  if (status === 'checkup') {
    return 'bg-green-100 text-green-800';
  }
  if (status === 'test') {
    return 'bg-indigo-100 text-indigo-800';
  }
  return 'bg-gray-100 text-gray-800';
}

export default HealthTab;
