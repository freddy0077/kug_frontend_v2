import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DOGS, DogSortField, SortDirection } from '@/graphql/queries/dogQueries';
import { ApprovalStatus } from '@/types/enums';
import { toast } from 'react-hot-toast';
import { CheckIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/solid';
import DogApprovalCard from './DogApprovalCard';
import { useDogApproval } from '@/hooks/useDogApproval';

interface DogApprovalGridProps {
  activeTab: ApprovalStatus;
  searchQuery: string;
  breedFilter: string | null;
  sortField: DogSortField;
  sortDirection: SortDirection;
  onApprovalStatusChange: () => void;
  onSelectAll: (dogs: any[]) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}

const DogApprovalGrid: React.FC<DogApprovalGridProps> = ({
  activeTab,
  searchQuery,
  breedFilter,
  sortField,
  sortDirection,
  onApprovalStatusChange,
  onSelectAll,
  selectedIds,
  setSelectedIds,
}) => {
  const [page, setPage] = useState(0);
  const [limit] = useState(12); // Increased limit for grid view
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDog, setSelectedDog] = useState<any>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [modalAction, setModalAction] = useState<'approve' | 'decline'>('approve');

  // Fetch dogs based on approval status and filters
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_DOGS, {
    variables: {
      offset: page * limit,
      limit,
      approvalStatus: activeTab,
      searchQuery: searchQuery || undefined,
      breedId: breedFilter || undefined,
      sortBy: sortField,
      sortDirection,
    },
    fetchPolicy: 'network-only', // Don't use cache for this query
    notifyOnNetworkStatusChange: true,
  });

  // Use the approval hook
  const { approveDog, declineDog, loading: mutationLoading } = useDogApproval({
    onSuccess: () => {
      // Close modal and refetch data
      setIsModalOpen(false);
      setSelectedDog(null);
      setApprovalNotes('');
      onApprovalStatusChange();
      refetch();
    },
  });

  // Handle opening the approval modal with ID validation
  const openApprovalModal = (dog: any) => {
    // Validate that dog and dog.id exist and are valid
    if (!dog || !dog.id || dog.id === 'NaN' || dog.id === 'undefined') {
      toast.error('Cannot approve: Invalid dog ID');
      console.error('Invalid dog object or ID:', dog);
      return;
    }
    
    // Set the selected dog for the modal
    setSelectedDog(dog);
    setModalAction('approve');
    setApprovalNotes('');
    setIsModalOpen(true);
  };

  // Handle opening the decline modal with ID validation
  const openDeclineModal = (dog: any) => {
    // Validate that dog and dog.id exist and are valid
    if (!dog || !dog.id || dog.id === 'NaN' || dog.id === 'undefined') {
      toast.error('Cannot decline: Invalid dog ID');
      console.error('Invalid dog object or ID:', dog);
      return;
    }
    
    // Set the selected dog for the modal
    setSelectedDog(dog);
    setModalAction('decline');
    setApprovalNotes('');
    setIsModalOpen(true);
  };

  // Handle modal submission with improved error handling and validation
  const handleSubmitModal = async () => {
    if (!selectedDog) {
      toast.error('No dog selected');
      return;
    }
    
    // Double-check ID validity before submission
    if (!selectedDog.id || selectedDog.id === 'NaN' || selectedDog.id === 'undefined') {
      toast.error('Invalid dog ID. Cannot process this request.');
      console.error('Invalid dog ID detected at submission:', selectedDog);
      return;
    }
    
    try {
      if (modalAction === 'approve') {
        await approveDog(selectedDog.id, approvalNotes);
        // Toast is handled in the useDogApproval hook
      } else {
        await declineDog(selectedDog.id, approvalNotes);
        // Toast is handled in the useDogApproval hook
      }
      
      // Only close modal on successful completion
      setIsModalOpen(false);
      
      // Refresh data
      refetch();
      onApprovalStatusChange();
    } catch (error) {
      // Error toast is already handled in the useDogApproval hook
      console.error('Error processing dog approval/decline:', error);
      // Keep modal open on error so user can try again
      return;
    }
  };

  // Handle toggling selection of a dog
  const handleToggleSelect = (dogId: string) => {
    if (selectedIds.includes(dogId)) {
      setSelectedIds(selectedIds.filter(id => id !== dogId));
    } else {
      setSelectedIds([...selectedIds, dogId]);
    }
  };

  // Handle loading more items
  const handleLoadMore = () => {
    if (data?.dogs?.hasMore) {
      fetchMore({
        variables: {
          offset: (page + 1) * limit,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          return {
            dogs: {
              ...fetchMoreResult.dogs,
              items: [
                ...prev.dogs.items,
                ...fetchMoreResult.dogs.items,
              ],
            },
          };
        },
      });
      setPage(page + 1);
    }
  };

  if (loading && page === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm h-80 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-xl"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 my-4">
        <p>Error loading dogs: {error.message}</p>
      </div>
    );
  }

  const dogs = data?.dogs?.items || [];
  const totalCount = data?.dogs?.totalCount || 0;

  if (dogs.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 text-gray-400">
          <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No Dogs Found</h3>
        <p className="mt-1 text-sm text-gray-500">
          No dogs were found matching your criteria
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Dog count indicator */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {dogs.length} of {totalCount} dogs
      </p>
      
      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dogs.map(dog => (
          <DogApprovalCard
            key={dog.id}
            dog={dog}
            isSelected={selectedIds.includes(dog.id)}
            onToggleSelect={handleToggleSelect}
            onApprove={openApprovalModal}
            onDecline={openDeclineModal}
          />
        ))}
      </div>
      
      {/* Load more button */}
      {data?.dogs?.hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-green-50 text-green-700 rounded-md border border-green-200 hover:bg-green-100 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Loading more...
              </span>
            ) : (
              'Load More Dogs'
            )}
          </button>
        </div>
      )}
      
      {/* Approval/Decline Modal */}
      {isModalOpen && selectedDog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {modalAction === 'approve' ? 'Approve Dog Registration' : 'Decline Dog Registration'}
            </h2>
            
            <div className="mb-4 flex items-center">
              <div className="w-12 h-12 relative rounded-md overflow-hidden mr-3">
                {selectedDog.mainImageUrl ? (
                  <img
                    src={selectedDog.mainImageUrl}
                    alt={selectedDog.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/default-dog.svg';
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <PhotoIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedDog.name}</p>
                <p className="text-sm text-gray-500">{selectedDog.breed}</p>
              </div>
            </div>
            
            <p className="mb-4 text-gray-600">
              {modalAction === 'approve'
                ? `The dog will be approved and will appear in public listings.`
                : `The dog registration will be declined and won't appear in public listings.`}
            </p>
            
            <div className="mb-4">
              <label htmlFor="approvalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                {modalAction === 'approve' ? 'Approval Notes' : 'Reason for Declining'}
              </label>
              <textarea
                id="approvalNotes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                rows={3}
                placeholder={modalAction === 'approve' ? 'Enter any approval notes...' : 'Enter reason for declining...'}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                disabled={mutationLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitModal}
                className={`px-4 py-2 rounded-md text-white flex items-center justify-center min-w-[120px] ${
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
                  <>
                    {modalAction === 'approve' ? <CheckIcon className="w-4 h-4 mr-1.5" /> : <XMarkIcon className="w-4 h-4 mr-1.5" />}
                    {modalAction === 'approve' ? 'Approve Dog' : 'Decline Dog'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DogApprovalGrid;
