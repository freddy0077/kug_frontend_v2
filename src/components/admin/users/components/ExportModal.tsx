"use client";

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string, includeOptions: string[]) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport
}) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [includeOptions, setIncludeOptions] = useState<string[]>([
    'personal',
    'contact',
    'account',
    'activity'
  ]);
  
  const toggleIncludeOption = (option: string) => {
    if (includeOptions.includes(option)) {
      setIncludeOptions(prev => prev.filter(item => item !== option));
    } else {
      setIncludeOptions(prev => [...prev, option]);
    }
  };
  
  const handleExport = () => {
    onExport(exportFormat, includeOptions);
    onClose();
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Export User Data
              </Dialog.Title>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Select the format and content you want to export.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-blue-600"
                          checked={exportFormat === 'csv'}
                          onChange={() => setExportFormat('csv')}
                        />
                        <span className="ml-2 text-sm text-gray-700">CSV</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-blue-600"
                          checked={exportFormat === 'excel'}
                          onChange={() => setExportFormat('excel')}
                        />
                        <span className="ml-2 text-sm text-gray-700">Excel</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-blue-600"
                          checked={exportFormat === 'pdf'}
                          onChange={() => setExportFormat('pdf')}
                        />
                        <span className="ml-2 text-sm text-gray-700">PDF</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Include Data</label>
                    <div className="space-y-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600"
                          checked={includeOptions.includes('personal')}
                          onChange={() => toggleIncludeOption('personal')}
                        />
                        <span className="ml-2 text-sm text-gray-700">Personal Information</span>
                      </label>
                      <div className="block">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600"
                            checked={includeOptions.includes('contact')}
                            onChange={() => toggleIncludeOption('contact')}
                          />
                          <span className="ml-2 text-sm text-gray-700">Contact Information</span>
                        </label>
                      </div>
                      <div className="block">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600"
                            checked={includeOptions.includes('account')}
                            onChange={() => toggleIncludeOption('account')}
                          />
                          <span className="ml-2 text-sm text-gray-700">Account Details</span>
                        </label>
                      </div>
                      <div className="block">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600"
                            checked={includeOptions.includes('activity')}
                            onChange={() => toggleIncludeOption('activity')}
                          />
                          <span className="ml-2 text-sm text-gray-700">Activity History</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  onClick={handleExport}
                  disabled={includeOptions.length === 0}
                >
                  Export Data
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ExportModal;
