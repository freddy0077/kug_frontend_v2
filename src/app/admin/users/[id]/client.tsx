'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_BY_ID } from '@/graphql/queries/userQueries';
import { UPDATE_USER_MUTATION, UPDATE_USER_ROLE_MUTATION } from '@/graphql/mutations/userMutations';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/utils/permissionUtils';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function UserDetailsClient({ userId }: { userId: string }) {
  const router = useRouter();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    profileImageUrl: ''
  });
  
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    form?: string;
    password?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user data
  const { loading, error, data, refetch } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !isAuthenticated || (currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.SUPER_ADMIN),
    fetchPolicy: 'network-only'
  });

  // Mutations
  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: () => {
      setSuccessMessage('User details updated successfully');
      setIsEditing(false);
      refetch();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrors({ form: error.message });
    }
  });

  const [updateUserRole, { loading: roleUpdateLoading }] = useMutation(UPDATE_USER_ROLE_MUTATION, {
    onCompleted: () => {
      setSuccessMessage('User role updated successfully');
      refetch();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrors({ role: error.message });
    }
  });
  
  // Initialize form data when user data is loaded
  useEffect(() => {
    if (data?.user) {
      const { firstName, lastName, email, role, profileImageUrl } = data.user;
      setFormData({
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        role: role || '',
        profileImageUrl: profileImageUrl || ''
      });
    }
  }, [data]);

  // Redirect if not authenticated or not admin/super admin
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/auth/login');
    } else if (currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.SUPER_ADMIN && !loading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, currentUser, loading, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Function to generate a secure random password
  const generateSecurePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };
  
  const handleGenerateTemporaryPassword = () => {
    // Generate a secure random password
    const tempPassword = generateSecurePassword();
    setGeneratedPassword(tempPassword);
    
    // Set success message
    setSuccessMessage('Temporary password generated successfully');
    setTimeout(() => setSuccessMessage(''), 10000); // Keep message visible longer
  };
  
  // Function to copy password to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Password copied to clipboard', {
      duration: 2000,
      style: {
        background: '#10B981',
        color: '#fff',
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await updateUser({
        variables: {
          id: userId,
          input: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            profileImageUrl: formData.profileImageUrl
          }
        }
      });
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (newRole === formData.role) return;
    
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        await updateUserRole({
          variables: {
            userId: userId,
            role: newRole
          }
        });
        setFormData(prev => ({ ...prev, role: newRole }));
      } catch (err) {
        console.error('Error updating user role:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Failed to load user details. {error.message}</span>
      </div>
    );
  }

  const user = data?.user;
  if (!user) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Not Found!</strong>
        <span className="block sm:inline"> User not found or you don't have permission to view this user.</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                User Details
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  {user.firstName} {user.lastName}
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4 space-x-3">
              <Link 
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Users
              </Link>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isEditing ? 'Cancel' : 'Edit User'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {/* User Detail Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          {!isEditing ? (
            // View Mode
            <div>
              {/* Profile Header */}
              <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-24 w-24 relative">
                    <Image
                      className="rounded-full"
                      src={user.profileImageUrl || '/default-avatar.png'}
                      alt={`${user.firstName} ${user.lastName}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-medium text-gray-900">{user.firstName} {user.lastName}</h3>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' :
                        user.role === UserRole.OWNER ? 'bg-green-100 text-green-800' :
                        user.role === UserRole.HANDLER ? 'bg-blue-100 text-blue-800' :
                        user.role === UserRole.CLUB ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">First Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.firstName}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.lastName}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' :
                          user.role === UserRole.OWNER ? 'bg-green-100 text-green-800' :
                          user.role === UserRole.HANDLER ? 'bg-blue-100 text-blue-800' :
                          user.role === UserRole.CLUB ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                        <div className="ml-4">
                          <select
                            id="role"
                            name="role"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={user.role}
                            onChange={(e) => handleRoleChange(e.target.value)}
                          >
                            <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                            <option value={UserRole.OWNER}>Owner</option>
                            <option value={UserRole.HANDLER}>Handler</option>
                            <option value={UserRole.CLUB}>Club</option>
                            <option value={UserRole.VIEWER}>Viewer</option>
                          </select>
                        </div>
                      </div>
                    </dd>
                  </div>
                  
                  {/* Password Management Section */}
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                    <dt className="text-sm font-medium text-gray-500">Password Management</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {!isResettingPassword ? (
                        <button
                          type="button"
                          onClick={() => setIsResettingPassword(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Generate Temporary Password
                        </button>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Generate Temporary Password</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            This will generate a secure temporary password for the user. The user will need to change this password upon login.
                          </p>
                          
                          {generatedPassword ? (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                              <div className="flex items-center">
                                <div className="flex-grow p-2 bg-gray-100 border border-gray-300 rounded-md font-mono text-sm">
                                  {generatedPassword}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(generatedPassword)}
                                  className="ml-2 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                  title="Copy to clipboard"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                </button>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">
                                Make sure to copy this password and provide it to the user securely.
                              </p>
                            </div>
                          ) : null}
                          
                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setIsResettingPassword(false);
                                setGeneratedPassword('');
                              }}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Close
                            </button>
                            {!generatedPassword && (
                              <button
                                type="button"
                                onClick={handleGenerateTemporaryPassword}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Generate Password
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.firstName ? 'border-red-300' : ''}`}
                    />
                    {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.lastName ? 'border-red-300' : ''}`}
                    />
                    {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.email ? 'border-red-300' : ''}`}
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700">Profile Image URL</label>
                    <input
                      type="text"
                      name="profileImageUrl"
                      id="profileImageUrl"
                      value={formData.profileImageUrl}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {errors.form && (
                  <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{errors.form}</span>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {updateLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
