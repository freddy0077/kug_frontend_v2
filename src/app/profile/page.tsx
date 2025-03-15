'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_MUTATION, CHANGE_PASSWORD_MUTATION } from '@/graphql/mutations/userMutations';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [changePassword] = useMutation(CHANGE_PASSWORD_MUTATION);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        variables: {
          id: user?.id,
          input: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
          }
        }
      });
      
      await refreshUser();
      setMessage({ text: 'Profile updated successfully', type: 'success' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ 
        text: error.message || 'An error occurred while updating profile', 
        type: 'error' 
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    
    try {
      const { data } = await changePassword({
        variables: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }
      });
      
      if (data?.changePassword?.success) {
        setMessage({ text: 'Password changed successfully', type: 'success' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
      } else {
        setMessage({ 
          text: data?.changePassword?.message || 'Failed to change password', 
          type: 'error' 
        });
      }
    } catch (error: any) {
      setMessage({ 
        text: error.message || 'An error occurred while changing password', 
        type: 'error' 
      });
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      {message.text && (
        <div 
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
            'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200 px-6 py-5 flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-900">Personal Information</h2>
          {!isEditing ? (
            <button
              type="button"
              className="text-green-600 hover:text-green-800 font-medium"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              className="text-gray-600 hover:text-gray-800 font-medium"
              onClick={() => {
                setIsEditing(false);
                // Reset form data
                setProfileData({
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="px-6 py-5">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">First Name</p>
                  <p className="mt-1 text-gray-900">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Name</p>
                  <p className="mt-1 text-gray-900">{user.lastName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="mt-1 text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="mt-1 text-gray-900">{user.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Login</p>
                <p className="mt-1 text-gray-900">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed. Please contact support if you need to update your email.</p>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-900">Security</h2>
          {!isChangingPassword ? (
            <button
              type="button"
              className="text-green-600 hover:text-green-800 font-medium"
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </button>
          ) : (
            <button
              type="button"
              className="text-gray-600 hover:text-gray-800 font-medium"
              onClick={() => {
                setIsChangingPassword(false);
                // Reset password data
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="px-6 py-5">
          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters with a mix of letters, numbers, and symbols.
                  </p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <p className="text-gray-600">
              Your password can be changed at any time. We recommend using a strong, unique password that you don't use for other accounts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
