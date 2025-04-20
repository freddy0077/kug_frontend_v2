'use client';

import { useState, useEffect } from 'react';
import { DogFormData } from '@/utils/formHandlers';
import { UserRole } from '@/utils/permissionUtils';

// Mock data for breeds
const BREEDS = [
  { id: '1', name: 'Labrador Retriever' },
  { id: '2', name: 'German Shepherd' },
  { id: '3', name: 'Golden Retriever' },
  { id: '4', name: 'French Bulldog' },
  { id: '5', name: 'Bulldog' },
  { id: '6', name: 'Poodle' },
  { id: '7', name: 'Beagle' },
  { id: '8', name: 'Rottweiler' },
  { id: '9', name: 'Yorkshire Terrier' },
  { id: '10', name: 'Boxer' },
  { id: '11', name: 'Dachshund' },
  { id: '12', name: 'Siberian Husky' },
];

// Common dog colors
const DOG_COLORS = [
  'Black', 'White', 'Brown', 'Cream', 'Red', 'Blue', 'Grey', 'Fawn',
  'Brindle', 'Spotted', 'Merle', 'Sable', 'Tan', 'Tricolor', 'Bicolor'
];

type DogRegistrationFormProps = {
  onSubmit?: (formData: DogFormData) => void;
  userRole: UserRole;
  userId: string;
  initialData?: Partial<DogFormData>;
  onSuccess?: (dogId: string) => void;
};

export default function DogRegistrationForm({
  onSubmit,
  userRole,
  userId,
  initialData,
  onSuccess
}: DogRegistrationFormProps) {
  const [formData, setFormData] = useState<DogFormData>({
    name: '',
    breedId: '',
    breed: '',
    breedObj: undefined,
    gender: 'male',
    dateOfBirth: new Date(), // Always initialize with a valid Date object
    color: '',
    microchipNumber: '',
    registrationNumber: '',
    otherRegistrationNumber: '',
    userId: userId, // Using userId instead of ownerId to match schema
    ownerId: userId, // Keep for backward compatibility
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeceased, setShowDeceased] = useState(false);

  useEffect(() => {
    // Set default user ID and owner ID if not provided in initial data
    if (!formData.userId || !formData.ownerId) {
      setFormData(prev => ({
        ...prev, 
        userId: userId,
        ownerId: userId
      }));
    }

    // Check if dog has a death date to show the deceased section
    if (initialData?.dateOfDeath) {
      setShowDeceased(true);
    }
  }, [initialData, userId, formData.userId, formData.ownerId]);

  const validateForm = () => {
    let tempErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = 'Dog name is required';
      isValid = false;
    }

    if (!formData.breedId) {
      tempErrors.breedId = 'Breed is required';
      isValid = false;
    }

    if (!formData.gender) {
      tempErrors.gender = 'Gender is required';
      isValid = false;
    } else if (!['male', 'female'].includes(formData.gender.toLowerCase())) {
      tempErrors.gender = 'Gender must be either male or female';
      isValid = false;
    }

    // Validate date of birth
    if (!formData.dateOfBirth) {
      tempErrors.dateOfBirth = 'Date of birth is required';
      isValid = false;
    } else if (!(formData.dateOfBirth instanceof Date) || isNaN(formData.dateOfBirth.getTime())) {
      tempErrors.dateOfBirth = 'Invalid date of birth';
      isValid = false;
    } else if (formData.dateOfBirth > new Date()) {
      tempErrors.dateOfBirth = 'Date of birth cannot be in the future';
      isValid = false;
    }

    // Validate date of death if provided
    if (showDeceased && formData.dateOfDeath) {
      if (!(formData.dateOfDeath instanceof Date) || isNaN(formData.dateOfDeath.getTime())) {
        tempErrors.dateOfDeath = 'Invalid date of death';
        isValid = false;
      } else if (formData.dateOfDeath > new Date()) {
        tempErrors.dateOfDeath = 'Date of death cannot be in the future';
        isValid = false;
      } else if (formData.dateOfBirth && formData.dateOfDeath < formData.dateOfBirth) {
        tempErrors.dateOfDeath = 'Date of death cannot be before date of birth';
        isValid = false;
      }
    }

    if (!formData.color) {
      tempErrors.color = 'Color is required';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for breed selection to set both breedId, breed and breedObj
    if (name === 'breedId' && value) {
      const selectedBreed = BREEDS.find(breed => breed.id === value);
      setFormData(prev => ({
        ...prev,
        breedId: value,
        breed: selectedBreed ? selectedBreed.name : '',
        breedObj: selectedBreed ? { id: selectedBreed.id, name: selectedBreed.name } : undefined
      }));
    } else {
      setFormData(prev => ({...prev, [name]: value}));
    }
  };

  const handleDateChange = (name: string, value: string) => {
    // Convert string date to Date object
    const dateValue = value ? new Date(value) : null;
    setFormData(prev => ({...prev, [name]: dateValue}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Extra validation to ensure dateOfBirth is always a valid Date object
      if (!formData.dateOfBirth || !(formData.dateOfBirth instanceof Date) || isNaN(formData.dateOfBirth.getTime())) {
        setErrors(prev => ({ ...prev, dateOfBirth: 'Date of birth must be a valid date' }));
        return;
      }
      
      // Extra validation for dateOfDeath if present
      if (formData.dateOfDeath && (!(formData.dateOfDeath instanceof Date) || isNaN(formData.dateOfDeath.getTime()))) {
        setErrors(prev => ({ ...prev, dateOfDeath: 'Date of death must be a valid date' }));
        return;
      }
      
      setIsSubmitting(true);
      
      // Create the dog data object for submission
      const dogData: DogFormData = {
        ...formData,
        // Ensure both userId and ownerId are set for compatibility
        userId: formData.userId || userId,
        ownerId: formData.ownerId || userId
      };
      
      // If not deceased, remove the death date
      if (!showDeceased) {
        delete dogData.dateOfDeath;
      }
      
      // Submit the form data
      if (onSubmit) {
        onSubmit(dogData);
      }
      
      // Call onSuccess with a mock dog ID (this would normally come from the API)
      if (onSuccess) {
        onSuccess('mock-dog-id-12345');
      }
      
      setIsSubmitting(false);
    }
  };

  // Format date as YYYY-MM-DD for input[type="date"]
  const formatDateForInput = (date: Date | undefined | null): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="space-y-6">
        {/* Basic Information Section */}
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Dog Name */}
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Dog Name <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.name ? 'border-red-300' : ''}`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Breed */}
            <div className="sm:col-span-3">
              <label htmlFor="breedId" className="block text-sm font-medium text-gray-700">
                Breed <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="breedId"
                  name="breedId"
                  value={formData.breedId}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.breedId ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Breed</option>
                  {BREEDS.map(breed => (
                    <option key={breed.id} value={breed.id}>{breed.name}</option>
                  ))}
                </select>
              </div>
              {errors.breedId && <p className="mt-1 text-sm text-red-600">{errors.breedId}</p>}
            </div>

            {/* Gender */}
            <div className="sm:col-span-3">
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.gender ? 'border-red-300' : ''}`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>

            {/* Color */}
            <div className="sm:col-span-3">
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                Color <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.color ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Color</option>
                  {DOG_COLORS.map(color => (
                    <option key={color} value={color.toLowerCase()}>{color}</option>
                  ))}
                </select>
              </div>
              {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
            </div>

            {/* Date of Birth */}
            <div className="sm:col-span-3">
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth <span className="text-red-600">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formatDateForInput(formData.dateOfBirth)}
                  onChange={(e) => handleDateChange('dateOfBirth', e.target.value)}
                  max={formatDateForInput(new Date())}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.dateOfBirth ? 'border-red-300' : ''}`}
                />
              </div>
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
            </div>

            {/* Deceased Checkbox */}
            <div className="sm:col-span-3">
              <div className="flex items-center h-full mt-6">
                <input
                  id="showDeceased"
                  name="showDeceased"
                  type="checkbox"
                  checked={showDeceased}
                  onChange={() => setShowDeceased(!showDeceased)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showDeceased" className="ml-2 block text-sm text-gray-700">
                  Dog is deceased
                </label>
              </div>
            </div>

            {/* Date of Death - Only show if deceased is checked */}
            {showDeceased && (
              <div className="sm:col-span-3">
                <label htmlFor="dateOfDeath" className="block text-sm font-medium text-gray-700">
                  Date of Death
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="dateOfDeath"
                    name="dateOfDeath"
                    value={formatDateForInput(formData.dateOfDeath)}
                    onChange={(e) => handleDateChange('dateOfDeath', e.target.value)}
                    max={formatDateForInput(new Date())}
                    min={formatDateForInput(formData.dateOfBirth)}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.dateOfDeath ? 'border-red-300' : ''}`}
                  />
                </div>
                {errors.dateOfDeath && <p className="mt-1 text-sm text-red-600">{errors.dateOfDeath}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Registration Information */}
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Registration Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Registration Number */}
            <div className="sm:col-span-1">
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Official registration number from kennel club
              </p>
            </div>

            {/* Other Registration Number */}
            <div className="sm:col-span-1">
              <label htmlFor="otherRegistrationNumber" className="block text-sm font-medium text-gray-700">
                Other Registration Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="otherRegistrationNumber"
                  name="otherRegistrationNumber"
                  value={formData.otherRegistrationNumber || ''}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Alternative registration number (if available)
              </p>
            </div>

            {/* Microchip Number */}
            <div className="sm:col-span-2">
              <label htmlFor="microchipNumber" className="block text-sm font-medium text-gray-700">
                Microchip Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="microchipNumber"
                  name="microchipNumber"
                  value={formData.microchipNumber}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Dog's microchip identification number if available
              </p>
            </div>
          </div>
        </div>

        {/* Photo Upload - Will be implemented in the future */}
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Photos</h3>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  Upload photos
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Add photos of your dog. The first photo will be used as the profile picture.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-5 mt-8 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : (
              'Register Dog'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
