import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { AuditLogItem, AuditAction } from '../../../../types/auditLogs';

interface AuditLogDetailsModalProps {
  log: AuditLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  if (!log) return null;

  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    return format(new Date(timestamp), 'MMMM d, yyyy h:mm:ss a');
  };

  // Format action for display
  const formatAction = (action: AuditAction): string => {
    return action.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format entity type for display
  const formatEntityType = (entityType: string): string => {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1).replace(/_/g, ' ').toLowerCase();
  };

  // Format JSON for display
  const formatJSON = (jsonString?: string): React.ReactNode => {
    if (!jsonString) return <span className="text-gray-500">None</span>;
    
    try {
      const data = JSON.parse(jsonString);
      return (
        <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-auto max-h-60">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    } catch (e) {
      return <span>{jsonString}</span>;
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    Audit Log Details
                  </Dialog.Title>
                  
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Action</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.action === AuditAction.CREATE ? 'bg-green-100 text-green-800' :
                            log.action === AuditAction.UPDATE ? 'bg-blue-100 text-blue-800' :
                            log.action === AuditAction.DELETE ? 'bg-red-100 text-red-800' :
                            log.action === AuditAction.LOGIN || log.action === AuditAction.LOGOUT ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formatAction(log.action)}
                          </span>
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Timestamp</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(log.timestamp)}</dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatEntityType(log.entityType)}</dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Entity ID</dt>
                        <dd className="mt-1 text-sm text-gray-900">{log.entityId}</dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">User</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {log.user ? (
                            <span>
                              {log.user.fullName} ({log.user.email})
                            </span>
                          ) : (
                            <span className="text-gray-500">System</span>
                          )}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {log.ipAddress || <span className="text-gray-500">Not available</span>}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Previous State</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatJSON(log.previousState)}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">New State</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatJSON(log.newState)}
                        </dd>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Additional Metadata</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatJSON(log.metadata)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AuditLogDetailsModal;
