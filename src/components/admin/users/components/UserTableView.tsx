"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { Menu } from '@headlessui/react';
import Link from 'next/link';
import { 
  EllipsisVerticalIcon,
  EyeIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/solid';
import { User, UserAction } from '../types';

interface UserTableViewProps {
  users: User[];
  onUserSelect: (user: User) => void;
  onStatusChange: (userId: string, isCurrentlyActive: boolean) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

// Define type for Menu.Item render prop
type ItemRenderPropArg = {
  active: boolean;
  disabled: boolean;
  close: () => void;
};

const UserTableView: React.FC<UserTableViewProps> = ({
  users,
  onUserSelect,
  onStatusChange,
  sortField,
  sortDirection
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  const toggleSelectAll = () => {
    if (selectedRows.length === users.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(users.map(user => user.id));
    }
  };
  
  const toggleSelectRow = (userId: string) => {
    setSelectedRows(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };
  
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <span className="ml-1">↑</span> 
      : <span className="ml-1">↓</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="pl-6 pr-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input 
                type="checkbox" 
                checked={selectedRows.length === users.length && users.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="group inline-flex items-center">
                Name{renderSortIcon('fullName')}
              </span>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
              <span className="group inline-flex items-center">
                Email{renderSortIcon('email')}
              </span>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="group inline-flex items-center">
                Role{renderSortIcon('role')}
              </span>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="group inline-flex items-center">
                Status{renderSortIcon('isActive')}
              </span>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              <span className="group inline-flex items-center">
                Joined{renderSortIcon('createdAt')}
              </span>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              <span className="group inline-flex items-center">
                Last Login{renderSortIcon('lastLogin')}
              </span>
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr 
              key={user.id} 
              className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              onClick={() => onUserSelect(user)}
            >
              <td className="pl-6 pr-3 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  checked={selectedRows.includes(user.id)}
                  onChange={() => toggleSelectRow(user.id)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white uppercase font-medium shadow-sm">
                      {user.fullName 
                        ? user.fullName.charAt(0)
                        : user.email.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.fullName || 'Unnamed User'}
                    </div>
                    <div className="text-xs text-gray-500 md:hidden">
                      {user.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.location || '-'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap hidden md:table-cell">
                <div className="text-sm text-gray-900 truncate max-w-[200px]">{user.email}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                {user.role === 'ADMIN' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                    Admin
                  </span>
                ) : user.role === 'OWNER' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    Owner
                  </span>
                ) : user.role === 'HANDLER' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                    Handler
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    {user.role || 'User'}
                  </span>
                )}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                {user.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></span>
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                {user.createdAt 
                  ? format(new Date(user.createdAt), 'MMM d, yyyy')
                  : '-'
                }
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                {user.lastLogin 
                  ? format(new Date(user.lastLogin), 'MMM d, yyyy')
                  : '-'
                }
              </td>
              <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="inline-flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                      <span className="sr-only">Open options</span>
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Menu.Button>
                  </div>
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }: ItemRenderPropArg) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUserSelect(user);
                            }}
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } group flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors`}
                          >
                            <EyeIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-green-500" />
                            View Details
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }: ItemRenderPropArg) => (
                          <Link
                            href={`/admin/users/${user.id}`}
                            className={`${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } group flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <PencilIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-green-500" />
                            View & Edit
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }: ItemRenderPropArg) => (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(user.id, user.isActive);
                            }}
                            className={`${
                              active 
                                ? user.isActive 
                                  ? 'bg-red-50 text-red-700' 
                                  : 'bg-green-50 text-green-700'
                                : user.isActive 
                                  ? 'text-red-700' 
                                  : 'text-green-700'
                            } group flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors`}
                          >
                            {user.isActive ? (
                              <>
                                <TrashIcon className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <TrashIcon className="mr-3 h-5 w-5 text-green-400 group-hover:text-green-500" />
                                Activate
                              </>
                            )}
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Menu>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                No users found matching your criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTableView;
