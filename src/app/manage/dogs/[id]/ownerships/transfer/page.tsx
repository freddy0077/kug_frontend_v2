'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import OwnershipTransferForm from '@/components/ownerships/OwnershipTransferForm';

export default function TransferOwnershipPage() {
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with navigation */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link
            href={`/manage/dogs/${dogId}/ownerships`}
            className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
          >
            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Ownerships
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Transfer Dog Ownership</h1>
        <p className="mt-1 text-sm text-gray-500">
          Transfer ownership of this dog to a new owner
        </p>
      </div>
      
      {/* Ownership Transfer Form */}
      <OwnershipTransferForm dogId={dogId} />
      
      {/* Help Information */}
      <div className="mt-8 bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800">About Ownership Transfers</h3>
        <div className="mt-2 text-sm text-blue-700">
          <p>
            When you transfer ownership, the current owner's record will be marked as inactive,
            and a new ownership record will be created for the selected owner.
          </p>
          <p className="mt-2">
            Please ensure you have appropriate documentation for this transfer. The transfer
            date should be the date when ownership legally changed hands.
          </p>
        </div>
      </div>
    </div>
  );
}
