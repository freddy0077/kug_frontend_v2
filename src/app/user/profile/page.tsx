'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserProfile() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    notification: true,
  });

  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    const name = localStorage.getItem('userName') || 'User';
    const email = localStorage.getItem('userEmail') || '';
    
    setIsAuthenticated(authStatus);
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    setIsLoading(false);
    
    // Set form data from stored user info
    setFormData({
      name: name,
      email: email,
      role: role,
      password: '',
      confirmPassword: '',
      phoneNumber: localStorage.getItem('userPhone') || '',
      notification: localStorage.getItem('userNotifications') === 'true',
    });
    
    // Redirect to login if not authenticated
    if (!authStatus) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Update localStorage
    localStorage.setItem('userName', formData.name);
    localStorage.setItem('userEmail', formData.email);
    localStorage.setItem('userPhone', formData.phoneNumber);
    localStorage.setItem('userNotifications', formData.notification.toString());
    
    // If password was updated, hash would happen here in a real app
    
    // Update state
    setUserName(formData.name);
    setUserEmail(formData.email);
    
    // Exit edit mode
    setIsEditing(false);
    
    // Show success message
    alert('Profile updated successfully');
  };

  // Different permission sets based on user role
  const getRolePermissions = () => {
    switch(userRole) {
      case 'owner':
        return [
          'View and manage owned dogs',
          'Access dog health records',
          'View competition results',
          'Request ownership transfers',
          'Communicate with breeders'
        ];
      case 'breeder':
        return [
          'Register new litters',
          'Manage breeding programs',
          'Transfer dog ownership',
          'View health records',
          'Access lineage and pedigree data'
        ];
      case 'handler':
        return [
          'Register for competitions',
          'Record competition results',
          'View dog health records',
          'Access training records',
          'Communicate with owners'
        ];
      case 'club':
        return [
          'Manage kennel club events',
          'Issue registration certificates',
          'Validate pedigrees',
          'Approve ownership transfers',
          'Access club member records'
        ];
      default:
        return [
          'Basic access permissions',
          'View public dog information',
          'Contact support team'
        ];
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // We already redirect in the useEffect, this is just a safeguard
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-700 px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Account Profile</h1>
                <p className="mt-1 text-green-100">Manage your personal information and preferences</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-800 text-white">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account
                </div>
                <Link
                  href="/user/dashboard"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Profile Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${
                          isEditing 
                            ? 'border-gray-300 focus:border-green-500 focus:ring-green-500' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        } shadow-sm focus:outline-none sm:text-sm`}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        disabled={!isEditing}
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${
                          isEditing 
                            ? 'border-gray-300 focus:border-green-500 focus:ring-green-500' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        } shadow-sm focus:outline-none sm:text-sm`}
                      />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        disabled={!isEditing}
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md ${
                          isEditing 
                            ? 'border-gray-300 focus:border-green-500 focus:ring-green-500' 
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        } shadow-sm focus:outline-none sm:text-sm`}
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        id="role"
                        disabled={true}
                        value={formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                        className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-600 shadow-sm focus:outline-none sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Role cannot be changed. Contact support if needed.</p>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Leave blank if you don't want to change your password
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="notification"
                        name="notification"
                        type="checkbox"
                        disabled={!isEditing}
                        checked={formData.notification}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="notification" className="font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <p className="text-gray-500">
                        Receive email updates about your dogs, health records, competition results, and system notifications.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Account Permissions</h2>
                  <p className="text-sm text-gray-600 mb-3">
                    Based on your role as a <span className="font-semibold">{userRole}</span>, you have the following permissions:
                  </p>
                  <ul className="space-y-2">
                    {getRolePermissions().map((permission, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
