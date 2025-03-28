'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_BY_ID } from '@/graphql/queries/userQueries';
// Note: We'll need to create or update appropriate mutations for user/owner management
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserRole } from '@/utils/permissionUtils';

interface BreederFormProps {
  mode: 'add' | 'edit';
  ownerId?: string;
}

// Form input types - updated to match owner data structure
type FormInputs = {
  // User fields
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // Required for new users
  confirmPassword?: string; // For validation
  
  // Owner fields
  name: string; // Business/kennel name
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  profileImageUrl?: string;
};

const BreederForm: React.FC<BreederFormProps> = ({ mode, ownerId }) => {
  const router = useRouter();
  const isEditMode = mode === 'edit';
  
  // Initial empty form state
  const initialFormState: FormInputs = {
    // User fields
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    
    // Owner fields
    name: '', // Business/kennel name
    contactEmail: '',
    contactPhone: '',
    address: '',
    profileImageUrl: '',
  };
  
  // Form state
  const [formData, setFormData] = useState<FormInputs>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormInputs, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Query for fetching user data when in edit mode
  const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_ID, {
    variables: { id: ownerId },
    skip: !isEditMode || !ownerId,
    onCompleted: (data) => {
      if (data?.user && data.user.owner) {
        // Populate form data with existing user and owner information
        setFormData({
          // User fields
          email: data.user.email || '',
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          // Don't populate password fields for security
          password: '',
          confirmPassword: '',
          
          // Owner fields
          name: data.user.owner.name || '',
          contactEmail: data.user.owner.contactEmail || '',
          contactPhone: data.user.owner.contactPhone || '',
          address: data.user.owner.address || '',
          profileImageUrl: data.user.profileImageUrl || '',
        });
      }
    }
  });
  
  // Note: The actual mutations for creating/updating users with owner role would
  // need to be implemented. For now, we'll use placeholder functions.
  
  // Create user with owner role mutation - this would need to be implemented
  const createUserWithOwner = async (userData: any) => {
    // This would be replaced with an actual Apollo mutation
    try {
      toast.success('Owner created successfully');
      router.push('/admin/manage-breeders');
    } catch (error: any) {
      toast.error(`Error creating owner: ${error.message}`);
      setIsSubmitting(false);
    }
  };
  
  // Update user with owner role mutation - this would need to be implemented
  const updateUserWithOwner = async (userData: any) => {
    // This would be replaced with an actual Apollo mutation
    try {
      toast.success('Owner updated successfully');
      router.push('/admin/manage-breeders');
    } catch (error: any) {
      toast.error(`Error updating owner: ${error.message}`);
      setIsSubmitting(false);
    }
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseInt(value) }));
      return;
    }
    
    // Handle all other inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle file selection for profile image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, profileImageUrl: event.target?.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  // Owner data structure doesn't need specialty-related functionality
  
  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormInputs, string>> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      errors.contactEmail = 'Invalid contact email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Prepare user input
    const userInput = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: !isEditMode ? formData.password : undefined,
      role: UserRole.OWNER,
      profileImageUrl: formData.profileImageUrl || undefined
    };
    
    // Prepare owner input
    const ownerInput = {
      name: formData.name,
      contactEmail: formData.contactEmail || undefined,
      contactPhone: formData.contactPhone || undefined,
      address: formData.address || undefined
    };
    
    try {
      if (isEditMode && ownerId) {
        await updateUserWithOwner({
          userId: ownerId,
          userInput,
          ownerInput
        });
      } else {
        await createUserWithOwner({
          userInput,
          ownerInput
        });
      }
    } catch (error) {
      // Error handling is done in the mutation callbacks
      console.error('Form submission error:', error);
    }
  };
  
  if (isEditMode && userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isEditMode ? 'Edit Owner Profile' : 'Add New Owner'}
          </h1>
          <p className="text-white text-opacity-90">
            {isEditMode 
              ? 'Update the owner\'s information in the system.' 
              : 'Create a new owner profile in the system.'}
          </p>
        </div>
      </div>
      
      {/* Form container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* User Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="owner@example.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="First name"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>
                
                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Last name"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </div>

                {/* Password - only show for new users */}
                {!isEditMode && (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                          formErrors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                          formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Owner information section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Owner Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kennel/Business Name */}
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Kennel/Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter kennel or business name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                
                {/* Address */}
                <div className="col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="Full address"
                  />
                </div>
                
                {/* Contact Email */}
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="contact@example.com"
                  />
                </div>
                
                {/* Contact Phone */}
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="+1 123-456-7890"
                  />
                </div>
              </div>
            </div>
            
            {/* Profile Image */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h2>
              <div className="mt-1 flex items-center space-x-5">
                <div className="flex-shrink-0 h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {formData.profileImageUrl ? (
                    <img
                      src={formData.profileImageUrl}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg className="h-12 w-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <div>
                  <label htmlFor="profileImage" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer">
                    <input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    {formData.profileImageUrl ? 'Change Image' : 'Upload Image'}
                  </label>
                  {formData.profileImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, profileImageUrl: '' }))}
                      className="ml-3 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Recommended: Square image at least 300x300 pixels. JPG or PNG format.
              </p>
            </div>
            
            {/* Profile details section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Details</h2>
              
            </div>
            
            {/* Form submission */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href="/admin/manage-owners"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : (isEditMode ? 'Update Owner' : 'Create Owner')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BreederForm;
