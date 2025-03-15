'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { HealthRecord, HealthRecordType } from '@/types/healthRecord';

interface HealthRecordListProps {
  records: (HealthRecord & {
    status?: string;
    dogName?: string;
    veterinarianName?: string;
  })[];
}

const HealthRecordList: React.FC<HealthRecordListProps> = ({ records }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusClass = (status: string = 'good') => {
    switch (status.toLowerCase()) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'stable':
        return 'bg-blue-100 text-blue-800';
      case 'serious':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDisplay = (type: HealthRecordType): string => {
    return type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ');
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No health records found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {records.map((record) => (
          <li key={record.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="mb-2 sm:mb-0 sm:mr-6">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(record.date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">{record.dogName}</p>
                </div>
                <div>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      record.status
                    )}`}
                  >
                    {getTypeDisplay(record.type as HealthRecordType)}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 text-right mr-3">
                  <div className="text-sm text-gray-900">{record.veterinarianName}</div>
                </div>
                <button
                  onClick={() => toggleExpand(record.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 transform transition-transform duration-200 ${
                      expandedId === record.id ? 'rotate-90' : ''
                    }`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </button>
              </div>
            </div>

            {expandedId === record.id && (
              <div className="mt-4 pl-4 border-l-2 border-green-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{record.description}</p>
                  </div>
                  {record.results && (
                    <div>
                      <h4 className="font-medium text-gray-900">Results</h4>
                      <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{record.results}</p>
                    </div>
                  )}
                </div>

                {record.attachmentUrl && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900">Attachments</h4>
                    <div className="mt-1 flex">
                      <a
                        href={record.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900 text-sm flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        View Document
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/health-records/${record.id}`}
                    className="text-sm text-green-600 hover:text-green-900"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthRecordList;
