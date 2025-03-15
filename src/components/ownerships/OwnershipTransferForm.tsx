'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { TRANSFER_OWNERSHIP, TransferOwnershipInput } from '@/graphql/mutations/ownershipMutations';
import { GET_DOG_OWNERSHIPS } from '@/graphql/queries/ownershipQueries';

interface OwnershipTransferFormProps {
  dogId: string;
}

const OwnershipTransferForm: React.FC<OwnershipTransferFormProps> = ({ dogId }) => {
  const router = useRouter();
  
  // Form state
  const [newOwnerId, setNewOwnerId] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [transferDocumentUrl, setTransferDocumentUrl] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing dog ownership data for validation and display
  const { loading: dogLoading, error: dogError, data: dogData } = useQuery(GET_DOG_OWNERSHIPS, {
    variables: { dogId },
    fetchPolicy: 'network-only'
  });

  // Transfer ownership mutation
  const [transferOwnership, { loading: transferLoading, error: transferError }] = useMutation(TRANSFER_OWNERSHIP, {
    onCompleted: () => {
      // On successful transfer, redirect to the dog ownerships page
      router.push(`/manage/dogs/${dogId}/ownerships`);
    }
  });

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!newOwnerId) {
      errors.newOwnerId = 'New owner is required';
    }

    if (!transferDate) {
      errors.transferDate = 'Transfer date is required';
    } else {
      try {
        // Validate date format
        const date = new Date(transferDate);
        if (isNaN(date.getTime())) {
          errors.transferDate = 'Invalid date format';
        }
      } catch (error) {
        errors.transferDate = 'Invalid date format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const input: TransferOwnershipInput = {
        dogId,
        newOwnerId,
        transferDate,
        transferDocumentUrl: transferDocumentUrl || undefined
      };

      await transferOwnership({
        variables: { input }
      });
    } catch (error) {
      console.error('Error transferring ownership:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock list of potential owners for demonstration
  // In a real app, this would come from a GraphQL query for all owners
  const potentialOwners = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Jane Doe' },
    { id: '3', name: 'Robert Johnson' },
    { id: '4', name: 'Lisa Anderson' }
  ];

  // Handle loading state
  if (dogLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Handle error state
  if (dogError) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        Error loading dog information: {dogError.message}
      </div>
    );
  }

  // Get current owner info
  const currentOwnership = dogData?.dogOwnerships?.ownerships.find(
    (o: any) => o.is_current === true // Using is_current as per schema
  );
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Transfer Dog Ownership</h2>
      
      {dogData?.dogOwnerships && (
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-500">Currently transferring ownership for:</p>
          <p className="font-medium text-lg">{dogData.dogOwnerships.dog.name}</p>
          <div className="mt-2">
            <span className="text-sm text-gray-500">Current Owner:</span>{' '}
            <span className="font-medium">
              {currentOwnership?.owner.name || 'No current owner'}
            </span>
          </div>
        </div>
      )}
      
      {transferError && (
        <div className="mb-6 bg-red-50 p-4 rounded-md text-red-700">
          Error: {transferError.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* New Owner Selection */}
          <div>
            <label htmlFor="newOwnerId" className="block text-sm font-medium text-gray-700">
              New Owner
            </label>
            <select
              id="newOwnerId"
              value={newOwnerId}
              onChange={(e) => setNewOwnerId(e.target.value)}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md ${
                formErrors.newOwnerId ? 'border-red-300' : ''
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select new owner</option>
              {potentialOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
            {formErrors.newOwnerId && (
              <p className="mt-2 text-sm text-red-600">{formErrors.newOwnerId}</p>
            )}
          </div>
          
          {/* Transfer Date */}
          <div>
            <label htmlFor="transferDate" className="block text-sm font-medium text-gray-700">
              Transfer Date
            </label>
            <input
              type="date"
              id="transferDate"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                formErrors.transferDate ? 'border-red-300' : ''
              }`}
              disabled={isSubmitting}
            />
            {formErrors.transferDate && (
              <p className="mt-2 text-sm text-red-600">{formErrors.transferDate}</p>
            )}
          </div>
          
          {/* Transfer Document URL */}
          <div>
            <label htmlFor="transferDocumentUrl" className="block text-sm font-medium text-gray-700">
              Transfer Document URL (Optional)
            </label>
            <input
              type="text"
              id="transferDocumentUrl"
              value={transferDocumentUrl}
              onChange={(e) => setTransferDocumentUrl(e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              Provide a link to the ownership transfer document (if available)
            </p>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Transfer Ownership'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OwnershipTransferForm;
