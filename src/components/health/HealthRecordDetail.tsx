'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useHealthRecord, useHealthRecordOperations } from '@/hooks/useHealthRecords';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatDate } from '@/utils/dateUtils';

interface HealthRecordDetailProps {
  recordId: string;
  canEdit?: boolean;
}

export default function HealthRecordDetail({ recordId, canEdit = false }: HealthRecordDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { healthRecord, loading, error } = useHealthRecord(recordId);
  const { deleteHealthRecord } = useHealthRecordOperations();
  
  // Handle record deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this health record? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deleteHealthRecord(recordId, healthRecord?.dog?.id);
      toast.success('Health record deleted successfully');
      router.push(`/manage/dogs/${healthRecord?.dog?.id}/health`);
    } catch (err) {
      console.error('Error deleting health record:', err);
      toast.error('Failed to delete health record');
      setIsDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading health record: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!healthRecord) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Health record not found</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {/* Header with Record Type and Actions */}
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {healthRecord.type?.replace(/_/g, ' ')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {formatDate(healthRecord.date)} • {healthRecord.dog?.name}
          </p>
        </div>
        
        {canEdit && (
          <div className="flex space-x-3">
            <Link href={`/manage/health-records/${recordId}/edit`} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Edit
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
      
      {/* Record Details */}
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          {/* Dog Information */}
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Dog</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <Link href={`/manage/dogs/${healthRecord.dog?.id}`} className="text-blue-600 hover:text-blue-800">
                {healthRecord.dog?.name}
              </Link>
              <div className="text-xs text-gray-500 mt-1">
                {healthRecord.dog?.breed} • Born: {formatDate(healthRecord.dog?.dateOfBirth)}
              </div>
            </dd>
          </div>
          
          {/* Description */}
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {healthRecord.description || "No description provided"}
            </dd>
          </div>
          
          {/* Results */}
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Results</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {healthRecord.results || "No results recorded"}
            </dd>
          </div>
          
          {/* Veterinarian */}
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Veterinarian</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {healthRecord.vetName ? (
                <>
                  {healthRecord.vetName}
                  {healthRecord.veterinarian && (
                    <span className="text-xs text-gray-500 ml-2">
                      (ID: {healthRecord.veterinarian})
                    </span>
                  )}
                </>
              ) : "Not specified"}
            </dd>
          </div>
          
          {/* Created/Updated */}
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Record Information</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div>Created: {formatDate(healthRecord.createdAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              {healthRecord.updatedAt && healthRecord.updatedAt !== healthRecord.createdAt && (
                <div>Updated: {formatDate(healthRecord.updatedAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              )}
            </dd>
          </div>
          
          {/* Attachments */}
          {healthRecord.attachments && healthRecord.attachments.length > 0 && (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Attachments</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {healthRecord.attachments.map((attachment: { name: string; url: string; type?: string; size?: number }, index: number) => (
                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 flex-1 w-0 truncate">
                          {attachment.name || 'File attachment'}
                        </span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          View
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
