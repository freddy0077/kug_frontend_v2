'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_DOG_MUTATION } from '@/graphql/mutations/dogMutations';
import { GET_BREEDS } from '@/graphql/queries/breedQueries';
import Link from 'next/link';

// Form input types
type FormInputs = {
  name: string;
  breed: string;
  gender: string;
  color: string;
  dateOfBirth: string;
  dateOfDeath?: string;
  registrationNumber?: string;
  microchipNumber?: string;
  isNeutered: boolean;
  height?: number;
  weight?: number;
  titles?: string;
  biography?: string;
  mainImageUrl?: string;
};

// Initial form state
const initialFormState: FormInputs = {
  name: '',
  breed: '',
  gender: 'Male',
  color: '',
  dateOfBirth: '',
  isNeutered: false,
};

// Valid gender options
const VALID_GENDERS = ['Male', 'Female'];

interface DogFormProps {
  onSuccess: (dogId: string) => void;
}

const DogForm: React.FC<DogFormProps> = ({ onSuccess }) => {
  // Form state
  const [formData, setFormData] = useState<FormInputs>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormInputs, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch breeds for dropdown
  const { data: breedsData, loading: breedsLoading } = useQuery(GET_BREEDS, {
    variables: { limit: 100 }
  });

  // Create dog mutation
  const [createDog] = useMutation(CREATE_DOG_MUTATION);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
      return;
    }
    
    // Handle all other inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate date format
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: Partial<Record<keyof FormInputs, string>> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.breed) {
      errors.breed = 'Breed is required';
    }
    
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    } else if (!VALID_GENDERS.includes(formData.gender)) {
      errors.gender = 'Gender must be either Male or Female';
    }
    
    if (!formData.color.trim()) {
      errors.color = 'Color is required';
    }
    
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else if (!isValidDate(formData.dateOfBirth)) {
      errors.dateOfBirth = 'Date of birth must be a valid date';
    }
    
    if (formData.dateOfDeath && !isValidDate(formData.dateOfDeath)) {
      errors.dateOfDeath = 'Date of death must be a valid date';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Clear errors and set submitting state
    setFormErrors({});
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Convert titles string to array if provided
      const titles = formData.titles ? formData.titles.split(',').map(t => t.trim()) : undefined;
      
      // Ensure dateOfBirth is always a valid Date (default to current date if undefined)
      let dateOfBirth: Date;
      try {
        dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date();
        if (isNaN(dateOfBirth.getTime())) {
          throw new Error('Invalid date of birth');
        }
      } catch (error) {
        setFormErrors({ dateOfBirth: 'Invalid date format for date of birth' });
        setIsSubmitting(false);
        return;
      }
      
      // Properly convert dateOfDeath if provided
      let dateOfDeath: Date | undefined;
      if (formData.dateOfDeath) {
        try {
          dateOfDeath = new Date(formData.dateOfDeath);
          if (isNaN(dateOfDeath.getTime())) {
            throw new Error('Invalid date of death');
          }
        } catch (error) {
          setFormErrors({ dateOfDeath: 'Invalid date format for date of death' });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Get breed ID if available
      const selectedBreed = breedsData?.breeds?.items?.find(
        (b: any) => b.name === formData.breed
      );
      const breedId = selectedBreed?.id;
      
      // Create input for mutation
      const input = {
        ...formData,
        dateOfBirth: dateOfBirth.toISOString(),
        dateOfDeath: dateOfDeath?.toISOString(),
        titles,
        breedId: breedId ?? undefined
      };
      
      // Submit mutation
      const result = await createDog({
        variables: { input }
      });
      
      // Handle success
      if (result.data?.createDog?.id) {
        onSuccess(result.data.createDog.id);
      } else {
        setSubmitError('Failed to create dog. Please try again.');
      }
    } catch (error: any) {
      // Provide more descriptive error messages
      if (error.message.includes('dateOfBirth')) {
        setFormErrors(prev => ({ ...prev, dateOfBirth: 'Invalid date of birth format' }));
      } else if (error.message.includes('dateOfDeath')) {
        setFormErrors(prev => ({ ...prev, dateOfDeath: 'Invalid date of death format' }));
      } else if (error.message.includes('gender')) {
        setFormErrors(prev => ({ ...prev, gender: 'Invalid gender value. Must be Male or Female' }));
      } else {
        setSubmitError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
              placeholder="Dog's registered name"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>
          
          {/* Breed */}
          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
              Breed <span className="text-red-500">*</span>
            </label>
            <select
              name="breed"
              id="breed"
              value={formData.breed}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${formErrors.breed ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
            >
              <option value="">Select Breed</option>
              {breedsLoading ? (
                <option value="" disabled>Loading breeds...</option>
              ) : (
                breedsData?.breeds?.items?.map((breed: any) => (
                  <option key={breed.id} value={breed.name}>
                    {breed.name}
                  </option>
                ))
              )}
            </select>
            {formErrors.breed && (
              <p className="mt-1 text-sm text-red-600">{formErrors.breed}</p>
            )}
          </div>
          
          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              id="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${formErrors.gender ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {formErrors.gender && (
              <p className="mt-1 text-sm text-red-600">{formErrors.gender}</p>
            )}
          </div>
          
          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Color <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="color"
              id="color"
              value={formData.color}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${formErrors.color ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
              placeholder="e.g. Black, Brown, Tan..."
            />
            {formErrors.color && (
              <p className="mt-1 text-sm text-red-600">{formErrors.color}</p>
            )}
          </div>
          
          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              id="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${formErrors.dateOfBirth ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
            />
            {formErrors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
            )}
          </div>
          
          {/* Date of Death (optional) */}
          <div>
            <label htmlFor="dateOfDeath" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Death (if applicable)
            </label>
            <input
              type="date"
              name="dateOfDeath"
              id="dateOfDeath"
              value={formData.dateOfDeath || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${formErrors.dateOfDeath ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
            />
            {formErrors.dateOfDeath && (
              <p className="mt-1 text-sm text-red-600">{formErrors.dateOfDeath}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Registration Details Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Registration Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registration Number */}
          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              name="registrationNumber"
              id="registrationNumber"
              value={formData.registrationNumber || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Official registration number"
            />
          </div>
          
          {/* Microchip Number */}
          <div>
            <label htmlFor="microchipNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Microchip Number
            </label>
            <input
              type="text"
              name="microchipNumber"
              id="microchipNumber"
              value={formData.microchipNumber || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Microchip identification number"
            />
          </div>
          
          {/* Neutered Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isNeutered"
              id="isNeutered"
              checked={formData.isNeutered}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="isNeutered" className="ml-2 block text-sm text-gray-700">
              Dog is neutered/spayed
            </label>
          </div>
        </div>
      </div>
      
      {/* Physical Attributes Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Physical Attributes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Height */}
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              id="height"
              value={formData.height || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Height in centimeters"
              step="0.1"
              min="0"
            />
          </div>
          
          {/* Weight */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              id="weight"
              value={formData.weight || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Weight in kilograms"
              step="0.1"
              min="0"
            />
          </div>
        </div>
      </div>
      
      {/* Additional Information Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
        <div className="space-y-6">
          {/* Titles */}
          <div>
            <label htmlFor="titles" className="block text-sm font-medium text-gray-700 mb-1">
              Titles/Awards
            </label>
            <input
              type="text"
              name="titles"
              id="titles"
              value={formData.titles || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Comma-separated list of titles (e.g. CH, GCH, BISS)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter titles or awards separated by commas
            </p>
          </div>
          
          {/* Biography */}
          <div>
            <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
              Biography
            </label>
            <textarea
              name="biography"
              id="biography"
              rows={4}
              value={formData.biography || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Brief biography or description of the dog"
            />
          </div>
          
          {/* Main Image URL */}
          <div>
            <label htmlFor="mainImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Main Image URL
            </label>
            <input
              type="url"
              name="mainImageUrl"
              id="mainImageUrl"
              value={formData.mainImageUrl || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a URL for the main profile image
            </p>
          </div>
        </div>
      </div>
      
      {/* Form Error Message */}
      {submitError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Form Actions */}
      <div className="pt-5 border-t border-gray-200">
        <div className="flex justify-end">
          <Link
            href="/dogs"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Dog'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DogForm;
