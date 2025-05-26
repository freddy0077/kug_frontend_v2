import React, { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useDogApproval } from '@/hooks/useDogApproval';

interface BatchActionBarProps {
  selectedIds: string[];
  clearSelection: () => void;
  onCompletedActions: () => void;
}

const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedIds,
  clearSelection,
  onCompletedActions,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'decline'>('approve');
  const [notes, setNotes] = useState('');

  const { approveDog, declineDog } = useDogApproval({
    onSuccess: () => {
      // Individual approval/decline operation completed
    },
  });

  // Open modal for batch action
  const openBatchModal = (action: 'approve' | 'decline') => {
    setModalAction(action);
    setNotes('');
    setIsModalOpen(true);
  };

  // Process batch action
  const processBatchAction = async () => {
    if (selectedIds.length === 0) return;
    
    setIsProcessing(true);
    setCurrentProgress(0);
    
    // Process each dog sequentially to avoid rate limits
    for (let i = 0; i < selectedIds.length; i++) {
      const dogId = selectedIds[i];
      try {
        if (modalAction === 'approve') {
          await approveDog(dogId, notes);
        } else {
          await declineDog(dogId, notes);
        }
      } catch (error) {
        console.error(`Error processing dog ${dogId}:`, error);
      }
      
      // Update progress
      setCurrentProgress(i + 1);
    }
    
    // All operations completed
    setIsProcessing(false);
    setIsModalOpen(false);
    clearSelection();
    onCompletedActions();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700">{selectedIds.length} dogs selected</span>
        <button
          onClick={clearSelection}
          className="ml-3 text-sm text-gray-500 hover:text-gray-700"
        >
          Clear selection
        </button>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={() => openBatchModal('decline')}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <XMarkIcon className="w-4 h-4 mr-1.5" />
          Decline Selected
        </button>
        <button
          onClick={() => openBatchModal('approve')}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <CheckIcon className="w-4 h-4 mr-1.5" />
          Approve Selected
        </button>
      </div>
      
      {/* Modal for batch approve/decline */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {modalAction === 'approve' ? 'Batch Approve Dogs' : 'Batch Decline Dogs'}
            </h2>
            
            <p className="mb-4 text-gray-600">
              You are about to {modalAction === 'approve' ? 'approve' : 'decline'} {selectedIds.length} dog registrations. 
              {modalAction === 'approve' 
                ? ' Approved dogs will appear in public listings.' 
                : ' Declined dogs will not appear in public listings.'}
            </p>
            
            <div className="mb-4">
              <label htmlFor="batchNotes" className="block text-sm font-medium text-gray-700 mb-1">
                {modalAction === 'approve' ? 'Approval Notes' : 'Reason for Declining'}
              </label>
              <textarea
                id="batchNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                rows={3}
                placeholder={modalAction === 'approve' ? 'Enter any approval notes...' : 'Enter reason for declining...'}
              />
              <p className="mt-1 text-xs text-gray-500">
                This {modalAction === 'approve' ? 'note' : 'reason'} will be applied to all selected dogs.
              </p>
            </div>
            
            {isProcessing && (
              <div className="mb-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-green-600">
                        Progress: {Math.round((currentProgress / selectedIds.length) * 100)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {currentProgress} / {selectedIds.length}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                    <div
                      style={{ width: `${(currentProgress / selectedIds.length) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={processBatchAction}
                className={`px-4 py-2 rounded-md text-white ${
                  modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  modalAction === 'approve' ? 'Approve All Selected' : 'Decline All Selected'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchActionBar;
