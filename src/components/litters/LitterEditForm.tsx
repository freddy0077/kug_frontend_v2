'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useLitter, useUpdateLitter } from '@/hooks/useLitters';
import { UPDATE_LITTER, UpdateLitterInput } from '@/graphql/mutations/litterMutations';
import { useMutation } from '@apollo/client';
import { UserRole } from '@/utils/permissionUtils';

// Props interface for the LitterEditForm component
interface LitterEditFormProps {
  litterId: string;
  userRole: UserRole;
  userId: string;
  onSuccess?: () => void;
}

// LitterEditForm component for editing litter details
export default function LitterEditForm({ litterId, userRole, userId, onSuccess }: LitterEditFormProps) {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<Omit<UpdateLitterInput, 'id'>>({
    litterName: '',
    registrationNumber: '',
    whelpingDate: '',
    totalPuppies: 0,
    malePuppies: 0,
    femalePuppies: 0,
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get litter details using custom hook
  const { data, loading: litterLoading, error: litterError } = useLitter(litterId);
  
  // Set form data when litter data is loaded
  useEffect(() => {
    if (data?.litter) {
      // Format date for form input (YYYY-MM-DD)
      const whelpingDate = data.litter.whelpingDate 
        ? new Date(data.litter.whelpingDate).toISOString().split('T')[0]
        : '';
          
      setFormData({
        litterName: data.litter.litterName || '',
        registrationNumber: data.litter.registrationNumber || '',
        whelpingDate,
        totalPuppies: data.litter.totalPuppies || 0,
        malePuppies: data.litter.malePuppies || 0,
        femalePuppies: data.litter.femalePuppies || 0,
        notes: data.litter.notes || ''
      });
    }
  }, [data]);
  
  // Update litter mutation using the imported UPDATE_LITTER query
  const [updateLitter, { loading: updateLoading }] = useMutation(UPDATE_LITTER, {
    onCompleted: (data) => {
      if (data?.updateLitter?.id) {
        toast.success('Litter updated successfully!');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/litters/${data.updateLitter.id}`);
        }
      }
    },
    onError: (error) => {
      toast.error(`Error updating litter: ${error.message}`);
      setIsSubmitting(false);
    }
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseInt(value, 10)
      }));
      return;
    }
    
    // Handle all other inputs
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-calculate total puppies when male or female puppies change
    if (name === 'malePuppies' || name === 'femalePuppies') {
      const males = name === 'malePuppies' 
        ? (value === '' ? 0 : parseInt(value, 10)) 
        : formData.malePuppies;
      
      const females = name === 'femalePuppies' 
        ? (value === '' ? 0 : parseInt(value, 10)) 
        : formData.femalePuppies;
      
      setFormData(prev => ({
        ...prev,
        totalPuppies: males + females
      }));
    }
    
    // If total puppies is changed directly, try to distribute between male/female
    if (name === 'totalPuppies') {
      const total = value === '' ? 0 : parseInt(value, 10);
      // Keep current gender distribution ratio if possible
      const currentTotal = formData.malePuppies + formData.femalePuppies;
      
      if (currentTotal > 0) {
        const maleRatio = formData.malePuppies / currentTotal;
        const newMales = Math.round(total * maleRatio);
        
        setFormData(prev => ({
          ...prev,
          malePuppies: newMales,
          femalePuppies: total - newMales
        }));
      } else {
        // Default to even split if no current distribution
        const half = Math.floor(total / 2);
        setFormData(prev => ({
          ...prev,
          malePuppies: half,
          femalePuppies: total - half
        }));
      }
    }
    
    // Clear any existing error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.litterName.trim()) {
      errors.litterName = 'Litter name is required';
    }
    
    if (!formData.whelpingDate) {
      errors.whelpingDate = 'Whelping date is required';
    } else {
      // Ensure whelping date is not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const whelpingDate = new Date(formData.whelpingDate);
      
      if (whelpingDate > today) {
        errors.whelpingDate = 'Whelping date cannot be in the future';
      }
    }
    
    if (formData.totalPuppies < 0) {
      errors.totalPuppies = 'Number of puppies cannot be negative';
    }
    
    if (formData.malePuppies < 0) {
      errors.malePuppies = 'Number of male puppies cannot be negative';
    }
    
    if (formData.femalePuppies < 0) {
      errors.femalePuppies = 'Number of female puppies cannot be negative';
    }
    
    if (formData.malePuppies + formData.femalePuppies !== formData.totalPuppies) {
      errors.totalPuppies = 'Male + female puppies must equal total puppies';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const input = {
        id: litterId,
        ...formData,
        // Ensure whelping date is a valid date
        whelpingDate: new Date(formData.whelpingDate).toISOString(),
      };
      
      await updateLitter({
        variables: { input }
      });
    } catch (error: any) {
      toast.error(`An error occurred: ${error.message}`);
      setIsSubmitting(false);
    }
  };
  
  // If user doesn't have appropriate role, show error
  // Check user permissions to edit litters - only ADMIN and OWNER can edit litters
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.OWNER) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You don't have permission to edit litters. Please contact an administrator or owner.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading indicator while fetching litter data
  if (litterLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Show error if litter data couldn't be fetched
  if (litterError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading litter details: {litterError.message}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const litter = data?.litter;
  
  if (!litter) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Litter not found or you don't have permission to edit it.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Edit Litter: {litter.litterName}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Update the information for this litter.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Parent Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sire Information (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sire (Father)
              </label>
              <div className="mt-1 flex items-center">
                {litter.sire.mainImageUrl ? (
                  <img 
                    src={litter.sire.mainImageUrl} 
                    alt={litter.sire.name}
                    className="h-8 w-8 rounded-full object-cover mr-2" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <Link 
                  href={`/dogs/${litter.sire.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  {litter.sire.name}
                </Link>
                <span className="ml-2 text-gray-500">({litter.sire.breed})</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Parent information cannot be changed
              </p>
            </div>
            
            {/* Dam Information (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dam (Mother)
              </label>
              <div className="mt-1 flex items-center">
                {litter.dam.mainImageUrl ? (
                  <img 
                    src={litter.dam.mainImageUrl} 
                    alt={litter.dam.name}
                    className="h-8 w-8 rounded-full object-cover mr-2" 
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <Link 
                  href={`/dogs/${litter.dam.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  {litter.dam.name}
                </Link>
                <span className="ml-2 text-gray-500">({litter.dam.breed})</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Parent information cannot be changed
              </p>
            </div>
          </div>
        </div>
        
        {/* Litter Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Litter Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Litter Name */}
            <div>
              <label htmlFor="litterName" className="block text-sm font-medium text-gray-700 mb-1">
                Litter Name/Identifier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="litterName"
                name="litterName"
                value={formData.litterName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.litterName 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="e.g. Litter A or Spring 2025"
              />
              {formErrors.litterName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.litterName}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                A unique identifier for this litter, such as a letter or seasonal reference
              </p>
            </div>
            
            {/* Registration Number (Optional) */}
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Official litter registration number"
              />
              <p className="mt-1 text-xs text-gray-500">
                If registered with a kennel club (optional)
              </p>
            </div>
            
            {/* Whelping Date */}
            <div>
              <label htmlFor="whelpingDate" className="block text-sm font-medium text-gray-700 mb-1">
                Whelping Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="whelpingDate"
                name="whelpingDate"
                value={formData.whelpingDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.whelpingDate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formErrors.whelpingDate && (
                <p className="mt-1 text-sm text-red-600">{formErrors.whelpingDate}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Date when the puppies were born
              </p>
            </div>
          </div>
        </div>
        
        {/* Puppy Count Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Puppy Count</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Puppies */}
            <div>
              <label htmlFor="totalPuppies" className="block text-sm font-medium text-gray-700 mb-1">
                Total Puppies
              </label>
              <input
                type="number"
                id="totalPuppies"
                name="totalPuppies"
                value={formData.totalPuppies}
                onChange={handleChange}
                min="0"
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.totalPuppies 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formErrors.totalPuppies && (
                <p className="mt-1 text-sm text-red-600">{formErrors.totalPuppies}</p>
              )}
            </div>
            
            {/* Male Puppies */}
            <div>
              <label htmlFor="malePuppies" className="block text-sm font-medium text-gray-700 mb-1">
                Male Puppies
              </label>
              <input
                type="number"
                id="malePuppies"
                name="malePuppies"
                value={formData.malePuppies}
                onChange={handleChange}
                min="0"
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.malePuppies 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formErrors.malePuppies && (
                <p className="mt-1 text-sm text-red-600">{formErrors.malePuppies}</p>
              )}
            </div>
            
            {/* Female Puppies */}
            <div>
              <label htmlFor="femalePuppies" className="block text-sm font-medium text-gray-700 mb-1">
                Female Puppies
              </label>
              <input
                type="number"
                id="femalePuppies"
                name="femalePuppies"
                value={formData.femalePuppies}
                onChange={handleChange}
                min="0"
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.femalePuppies 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formErrors.femalePuppies && (
                <p className="mt-1 text-sm text-red-600">{formErrors.femalePuppies}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Any additional information about this litter..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional notes about the litter, birth conditions, special care requirements, etc.
          </p>
        </div>
        
        {/* Puppies Information (read-only display) */}
        {litter.puppies && litter.puppies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Registered Puppies ({litter.puppies.length})
              </h3>
              <Link
                href={`/litters/${litterId}/register-puppies`}
                className="text-sm text-blue-600 hover:text-blue-900"
              >
                Register More Puppies
              </Link>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="divide-y divide-gray-200">
                {litter.puppies.map((puppy: any) => (
                  <li key={puppy.id} className="py-2">
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/dogs/${puppy.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900"
                        >
                          {puppy.name}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {puppy.gender === 'male' ? '♂ Male' : '♀ Female'}
                          {puppy.color && ` • ${puppy.color}`}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              To edit puppy information, please go to each individual puppy's profile.
            </p>
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Link 
            href={`/litters/${litterId}`}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
