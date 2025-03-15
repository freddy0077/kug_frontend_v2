'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UPDATE_USER_MUTATION, 
  CHANGE_PASSWORD_MUTATION 
} from '@/graphql/mutations/userMutations';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';

export default function ProfileSettings() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Error and success states
  const [profileErrors, setProfileErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  
  // Apollo mutations
  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER_MUTATION);
  const [changePassword, { loading: passwordLoading }] = useMutation(CHANGE_PASSWORD_MUTATION);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/auth/login');
    } else if (user) {
      // Initialize form data with user data
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
      setLoading(false);
    }
  }, [isAuthenticated, loading, router, user]);
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Submit profile update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors([]);
    
    // Validate
    const errors = [];
    if (!profileData.firstName.trim()) errors.push('First name is required');
    if (!profileData.lastName.trim()) errors.push('Last name is required');
    if (!profileData.email.trim()) errors.push('Email is required');
    
    if (errors.length > 0) {
      setProfileErrors(errors);
      return;
    }
    
    try {
      const { data } = await updateUser({
        variables: {
          id: user?.id,
          input: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
          }
        }
      });
      
      if (data?.updateUser) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        refreshUser(); // Refresh user data in context
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      setProfileErrors([error.message || 'Failed to update profile']);
    }
  };
  
  // Submit password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors([]);
    
    // Validate
    const errors = [];
    if (!passwordData.currentPassword) errors.push('Current password is required');
    if (!passwordData.newPassword) errors.push('New password is required');
    if (passwordData.newPassword.length < 8) errors.push('Password must be at least 8 characters');
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.push('Passwords do not match');
    
    if (errors.length > 0) {
      setPasswordErrors(errors);
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
        toast.success('Password changed successfully');
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordErrors([data?.changePassword?.message || 'Failed to change password']);
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      setPasswordErrors([error.message || 'Failed to change password']);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form to current user data
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
    setIsEditing(false);
    setProfileErrors([]);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0">
              <div className="flex-shrink-0 h-24 w-24 relative overflow-hidden rounded-full bg-white border-4 border-white mr-0 md:mr-6">
                {user?.profileImageUrl ? (
                  <Image 
                    src={user.profileImageUrl} 
                    alt={user.fullName || 'User profile'}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-24 w-24 flex items-center justify-center bg-gray-100 text-gray-800 rounded-full text-xl font-semibold">
                    {user?.firstName?.charAt(0) || ''}
                    {user?.lastName?.charAt(0) || ''}
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                <p className="text-green-100">{user?.email}</p>
                <p className="text-green-100 mt-1">Role: {user?.role}</p>
              </div>
            </div>
          </div>
          
          {/* Profile Image Upload */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Profile Image</h3>
            <ProfileImageUpload 
              currentImageUrl={user?.profileImageUrl} 
              userId={user?.id || ''} 
              onSuccess={refreshUser}
            />
          </div>
          
          {/* Basic Information */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                >
                  Edit Profile
                </button>
              ) : null}
            </div>
            
            {profileErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                <ul className="list-disc pl-5">
                  {profileErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full p-2 border rounded ${
                      isEditing ? 'bg-white' : 'bg-gray-50'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full p-2 border rounded ${
                      isEditing ? 'bg-white' : 'bg-gray-50'
                    }`}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  className={`w-full p-2 border rounded ${
                    isEditing ? 'bg-white' : 'bg-gray-50'
                  }`}
                />
              </div>
              
              {isEditing && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
          
          {/* Password Change */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            
            {passwordErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                <ul className="list-disc pl-5">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 characters
                  </p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Account Preferences */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Account Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive email updates about your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button className="text-sm text-green-600 hover:text-green-800">
                  Set up
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Language</h4>
                  <p className="text-sm text-gray-500">Choose your preferred language</p>
                </div>
                <select className="p-2 text-sm border rounded bg-white">
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Privacy & Data */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Privacy & Data</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Data Privacy</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Your data is important to us. Review how we use and protect your information.
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View Privacy Policy
                </button>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Export Your Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Download a copy of all your data from our system.
                </p>
                <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  Request Data Export
                </button>
              </div>
              
              <div>
                <h4 className="font-medium text-red-600 mb-2">Delete Account</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Once you delete your account, all your data will be permanently removed from our system.
                </p>
                <button className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
