"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { User } from '../types';

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (userId: string, isCurrentlyActive: boolean) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onStatusChange
}) => {
  if (!user) return null;
  
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
            <div className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/3 flex flex-col items-center sm:border-r sm:border-gray-200 sm:pr-6">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-700 font-bold text-6xl">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="mt-4 text-2xl font-bold text-gray-900 text-center">
                    {user.fullName}
                  </h2>
                  
                  <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.role === 'MODERATOR'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'ADMIN' ? 'Administrator' : user.role === 'MODERATOR' ? 'Moderator' : 'User'}
                  </span>
                  
                  <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="mt-6 w-full">
                    <button
                      onClick={() => onStatusChange(user.id, user.isActive)}
                      className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        user.isActive
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      }`}
                    >
                      {user.isActive ? 'Deactivate Account' : 'Activate Account'}
                    </button>
                  </div>
                </div>
                
                <div className="sm:w-2/3 sm:pl-6 mt-6 sm:mt-0">
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  </div>
                  
                  <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.location || 'Not provided'}</dd>
                    </div>
                  </dl>
                  
                  <div className="border-b border-gray-200 pb-4 mt-8">
                    <h3 className="text-lg font-medium text-gray-900">Account Details</h3>
                  </div>
                  
                  <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Date Joined</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {format(new Date(user.createdAt), 'PPP')}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.lastLogin 
                          ? format(new Date(user.lastLogin), 'PPP') 
                          : 'Never'
                        }
                      </dd>
                    </div>
                  </dl>
                  
                  <div className="mt-8 flex space-x-3">
                    <a
                      href={`/admin/users/edit/${user.id}`}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
                    >
                      Edit User
                    </a>
                    <a
                      href={`/admin/users/activity/${user.id}`}
                      className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center"
                    >
                      View Activity
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UserDetailsModal;
