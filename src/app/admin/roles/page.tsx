'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Role permissions configuration
const rolePermissions = {
  ADMIN: {
    name: 'Administrator',
    description: 'Full system access with all permissions',
    color: 'purple',
    permissions: [
      { id: 'manage_users', name: 'Manage Users', description: 'Can create, update, and deactivate users' },
      { id: 'manage_roles', name: 'Manage Roles', description: 'Can assign roles to users' },
      { id: 'manage_dogs', name: 'Manage Dogs', description: 'Full access to create and manage all dog records' },
      { id: 'manage_events', name: 'Manage Events', description: 'Can create and manage all events' },
      { id: 'manage_clubs', name: 'Manage Clubs', description: 'Can create and manage club information' },
      { id: 'view_logs', name: 'View System Logs', description: 'Can access system and audit logs' },
      { id: 'manage_breeds', name: 'Manage Breeds', description: 'Can create and update breed information' },
      { id: 'approve_registrations', name: 'Approve Registrations', description: 'Can approve dog registrations' }
    ]
  },
  OWNER: {
    name: 'Owner',
    description: 'Dog owners who can manage their own dogs',
    color: 'green',
    permissions: [
      { id: 'view_dogs', name: 'View Dogs', description: 'Can view all dog records' },
      { id: 'manage_own_dogs', name: 'Manage Own Dogs', description: 'Can manage their own dog records' },
      { id: 'register_events', name: 'Register for Events', description: 'Can register dogs for events' },
      { id: 'transfer_ownership', name: 'Transfer Ownership', description: 'Can transfer ownership of their dogs' }
    ]
  },
  HANDLER: {
    name: 'Handler',
    description: 'Dog handlers who manage competitions and training',
    color: 'blue',
    permissions: [
      { id: 'view_dogs', name: 'View Dogs', description: 'Can view all dog records' },
      { id: 'manage_competitions', name: 'Manage Competitions', description: 'Can record competition results' },
      { id: 'register_events', name: 'Register for Events', description: 'Can register dogs for events' }
    ]
  },
  CLUB: {
    name: 'Club',
    description: 'Kennel clubs that organize events and maintain standards',
    color: 'yellow',
    permissions: [
      { id: 'view_dogs', name: 'View Dogs', description: 'Can view all dog records' },
      { id: 'manage_events', name: 'Manage Events', description: 'Can create and manage events' },
      { id: 'verify_registrations', name: 'Verify Registrations', description: 'Can verify dog registration information' }
    ]
  },
  VIEWER: {
    name: 'Viewer',
    description: 'Limited read-only access to the system',
    color: 'gray',
    permissions: [
      { id: 'view_dogs', name: 'View Dogs', description: 'Can view all dog records' },
      { id: 'view_events', name: 'View Events', description: 'Can view event information' }
    ]
  }
};

export default function RoleManagement() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedRole, setSelectedRole] = useState('ADMIN');

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (!authLoading && isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null; // We already redirect in the useEffect, this is just a safeguard
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Role Management
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  Manage user roles and permissions
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              <Link 
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Users
              </Link>
            </div>
          </div>
        </div>

        {/* Role Overview */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Roles</h3>
          <p className="text-gray-600 mb-6">
            The Kennel Union of Ghana Database uses a role-based access control system to manage permissions. 
            Each user is assigned one role that determines their access level within the system.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {Object.entries(rolePermissions).map(([roleKey, roleData]) => (
              <button
                key={roleKey}
                onClick={() => setSelectedRole(roleKey)}
                className={`p-4 rounded-lg text-left transition-all ${
                  selectedRole === roleKey
                    ? `bg-${roleData.color}-100 border-2 border-${roleData.color}-500`
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${roleData.color}-100 text-${roleData.color}-800 mb-2`}>
                  {roleData.name}
                </div>
                <p className="text-sm text-gray-600">{roleData.description}</p>
                <p className="text-xs text-gray-500 mt-2">{roleData.permissions.length} permissions</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Role Details */}
        {selectedRole && rolePermissions[selectedRole as keyof typeof rolePermissions] && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {rolePermissions[selectedRole as keyof typeof rolePermissions].name} Permissions
                </h3>
                <div 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${rolePermissions[selectedRole as keyof typeof rolePermissions].color}-100 text-${rolePermissions[selectedRole as keyof typeof rolePermissions].color}-800`}
                >
                  {selectedRole}
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {rolePermissions[selectedRole as keyof typeof rolePermissions].description}
              </p>
            </div>
            
            <div className="px-6 py-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Permissions</h4>
              <div className="space-y-4">
                {rolePermissions[selectedRole as keyof typeof rolePermissions].permissions.map((permission) => (
                  <div key={permission.id} className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                      <p className="text-sm text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Role Assignment Section */}
        <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">User Role Assignment</h3>
            <p className="mt-1 text-sm text-gray-500">
              Assign or change roles for users through the User Management section
            </p>
          </div>
          
          <div className="px-6 py-4">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    To change a user's role, navigate to the user's detail page from the User Management section.
                  </p>
                  <p className="mt-3 text-sm md:mt-0 md:ml-6">
                    <Link href="/admin/users" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                      Go to Users <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
