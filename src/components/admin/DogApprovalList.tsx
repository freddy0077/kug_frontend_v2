'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DOGS } from '@/graphql/queries/dogQueries';
import { useDogApproval } from '@/hooks/useDogApproval';
import { ApprovalStatus, SortDirection, DogSortField } from '@/types/enums';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

// Default placeholder image when dog has no image
const DEFAULT_DOG_IMAGE = '/assets/images/dog-placeholder.png';

const DogApprovalList = () => {
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [selectedDog, setSelectedDog] = useState<any>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'decline'>('approve');

  // Fetch pending dogs
  const { data, loading, error, refetch } = useQuery(GET_DOGS, {
    variables: {
      offset: page * limit,
      limit,
      approvalStatus: ApprovalStatus.PENDING,
      sortBy: DogSortField.CREATED_AT,
      sortDirection: SortDirection.DESC,
    },
    fetchPolicy: 'network-only', // Don't use cache for this query
  });

  // Use the approval hook
  const { approveDog, declineDog, loading: mutationLoading } = useDogApproval({
    onSuccess: () => {
      // Close modal and refetch data
      setIsModalOpen(false);
      setSelectedDog(null);
      setApprovalNotes('');
      refetch();
    },
  });

  // Handle opening the approval modal
  const openApprovalModal = (dog: any) => {
    setSelectedDog(dog);
    setModalAction('approve');
    setApprovalNotes('');
    setIsModalOpen(true);
  };

  // Handle opening the decline modal
  const openDeclineModal = (dog: any) => {
    setSelectedDog(dog);
    setModalAction('decline');
    setApprovalNotes('');
    setIsModalOpen(true);
  };

  // Handle modal submission
  const handleSubmitModal = async () => {
    if (!selectedDog) return;

    if (modalAction === 'approve') {
      await approveDog(selectedDog.id, approvalNotes);
    } else {
      await declineDog(selectedDog.id, approvalNotes);
    }
  };

  // Pagination controls
  const handleNextPage = () => {
    if (data?.dogs?.hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(prevPage => prevPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <p>Error loading dogs for approval: {error.message}</p>
      </div>
    );
  }

  const dogs = data?.dogs?.items || [];
  const totalCount = data?.dogs?.totalCount || 0;

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Dogs Pending Approval ({totalCount})</h2>
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={page === 0}
            className={`px-4 py-2 rounded ${
              page === 0 ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={!data?.dogs?.hasMore}
            className={`px-4 py-2 rounded ${
              !data?.dogs?.hasMore ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {dogs.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-lg text-gray-500">No dogs pending approval</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Image</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Breed</th>
                <th className="py-3 px-4 text-left">Gender</th>
                <th className="py-3 px-4 text-left">Date of Birth</th>
                <th className="py-3 px-4 text-left">Registration #</th>
                <th className="py-3 px-4 text-left">Owner</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dogs.map((dog: any) => (
                <tr key={dog.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="w-16 h-16 relative rounded-md overflow-hidden">
                      <Image
                        src={dog.mainImageUrl || DEFAULT_DOG_IMAGE}
                        alt={dog.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/dogs/${dog.id}`} className="text-blue-600 hover:underline">
                      {dog.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{dog.breed}</td>
                  <td className="py-3 px-4">{dog.gender}</td>
                  <td className="py-3 px-4">
                    {dog.dateOfBirth ? format(new Date(dog.dateOfBirth), 'MMM d, yyyy') : 'N/A'}
                  </td>
                  <td className="py-3 px-4">{dog.registrationNumber || 'N/A'}</td>
                  <td className="py-3 px-4">
                    {dog.currentOwner ? (
                      <Link href={`/owners/${dog.currentOwner.id}`} className="text-blue-600 hover:underline">
                        {dog.currentOwner.name}
                      </Link>
                    ) : (
                      'No owner'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openApprovalModal(dog)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openDeclineModal(dog)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approval/Decline Modal */}
      {isModalOpen && selectedDog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {modalAction === 'approve' ? 'Approve Dog' : 'Decline Dog'}
            </h2>
            <p className="mb-4">
              {modalAction === 'approve'
                ? `Are you sure you want to approve "${selectedDog.name}"?`
                : `Are you sure you want to decline "${selectedDog.name}"?`}
            </p>
            <div className="mb-4">
              <label htmlFor="approvalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="approvalNotes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder={modalAction === 'approve' ? 'Enter any approval notes...' : 'Enter reason for declining...'}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                disabled={mutationLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitModal}
                className={`px-4 py-2 rounded text-white ${
                  modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={mutationLoading}
              >
                {mutationLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    {modalAction === 'approve' ? 'Approving...' : 'Declining...'}
                  </span>
                ) : (
                  modalAction === 'approve' ? 'Approve' : 'Decline'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DogApprovalList;
