'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_DOG_MUTATION, TRANSFER_DOG_OWNERSHIP_MUTATION } from '@/graphql/mutations/dogMutations';
import { GET_BREEDS, GET_BREED_BY_NAME, SortDirection } from '@/graphql/queries/breedQueries';
import { ApprovalStatus } from '@/types/enums';
import ApprovalStatusBadge from '../common/ApprovalStatusBadge';
import UserSearchSelect from '../common/UserSearchSelect';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { UserRole } from '@/utils/permissionUtils';
import { useAuth } from '@/contexts/AuthContext';

// Form input types
type FormInputs = {
  name: string;
  breed: string;
  breedId?: string;
  gender: string;
  color: string;
  dateOfBirth: string;
  dateOfDeath?: string;
  microchipNumber?: string;
  isNeutered: boolean;
  height?: number;
  weight?: number;
  titles?: string;
  biography?: string;
  mainImageUrl?: string;
  userId: string; // Required field for dog ownership
  registrationNumber?: string;
  otherRegistrationNumber?: string; // Added other registration number field
};

// Valid gender options
const VALID_GENDERS = ['male', 'female'];

interface DogEditFormProps {
  dogData: any; // Dog data from API
  dogId: string;
  onSuccess: () => void;
}

const DogEditForm: React.FC<DogEditFormProps> = ({ dogData, dogId, onSuccess }) => {
  const { user } = useAuth();
  const userRole = user?.role as UserRole;
  const isAdmin = userRole === UserRole.ADMIN;
  
  // Initialize form data from dog data
  const getDogFormData = (): FormInputs => {
    if (!dogData) return {
      name: '',
      breed: '',
      gender: 'male',
      color: '',
      dateOfBirth: '',
      isNeutered: false,
      userId: '',
    };

    // Prioritize breedObj.name over the breed string when it's available
    // This is important because the breed string might be "Unknown Breed" or inaccurate
    const breedToUse = dogData.breedObj?.name || dogData.breed || '';
    console.log('Using breed for form:', breedToUse);
    
    return {
      name: dogData.name || '',
      breed: breedToUse,
      breedId: dogData.breedObj?.id,
      gender: dogData.gender || 'male',
      color: dogData.color || '',
      dateOfBirth: dogData.dateOfBirth ? new Date(dogData.dateOfBirth).toISOString().substring(0, 10) : '',
      dateOfDeath: dogData.dateOfDeath ? new Date(dogData.dateOfDeath).toISOString().substring(0, 10) : '',
      microchipNumber: dogData.microchipNumber || '',
      isNeutered: dogData.isNeutered || false,
      height: dogData.height,
      weight: dogData.weight,
      titles: dogData.titles ? dogData.titles.join(', ') : '',
      biography: dogData.biography || '',
      mainImageUrl: dogData.mainImageUrl || '',
      userId: dogData.user?.id || '',
      registrationNumber: dogData.registrationNumber || '',
      otherRegistrationNumber: dogData.otherRegistrationNumber || '',
    };
  };

  // Form state
  const [formData, setFormData] = useState<FormInputs>(getDogFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormInputs, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedBreedId, setSelectedBreedId] = useState<string | null>(dogData?.breedObj?.id || null);

  // Update form data when dogData changes
  useEffect(() => {
    // Debug: Log the entire dog data to see what's received from API
    console.log('Full Dog Data received:', dogData);
    console.log('Registration, Microchip, Neutered status:', {
      registrationNumber: dogData?.registrationNumber,
      microchipNumber: dogData?.microchipNumber,
      isNeutered: dogData?.isNeutered
    });
    
    const formValues = getDogFormData();
    setFormData(formValues);
    setSelectedBreedId(dogData?.breedObj?.id || null);
    
    // Log for debugging breed selection
    console.log('Dog Breed Data:', {
      dogBreed: dogData?.breed,
      breedObjName: dogData?.breedObj?.name,
      breedObjId: dogData?.breedObj?.id,
      formBreed: formValues.breed
    });
    
    // Debug: Log the form values to verify what's being set
    console.log('Form values after initialization:', formValues);
  }, [dogData]);

  // Fetch breeds for dropdown
  const { data: breedsData, loading: breedsLoading } = useQuery(GET_BREEDS, {
    variables: { 
      limit: 100,
      sortDirection: SortDirection.ASC
    },
    onCompleted: (data) => {
      // Log available breeds for debugging
      console.log('Available breeds:', data?.breeds?.items?.map((b: any) => b.name));
      
      // If we have breed data but no match yet, try to find a match by name
      if (dogData?.breed && !selectedBreedId && data?.breeds?.items) {
        const matchingBreed = data.breeds.items.find((b: any) => 
          b.name.toLowerCase() === dogData.breed.toLowerCase() ||
          b.name.toLowerCase() === dogData.breedObj?.name?.toLowerCase()
        );
        
        if (matchingBreed) {
          console.log('Found matching breed:', matchingBreed.name);
          setFormData(prev => ({ ...prev, breed: matchingBreed.name }));
          setSelectedBreedId(matchingBreed.id);
        }
      }
    }
  });
  
  // Get detailed breed info when breed is selected
  const { data: breedData } = useQuery(GET_BREED_BY_NAME, {
    variables: { name: formData.breed },
    skip: !formData.breed,
    onCompleted: (data) => {
      if (data?.breedByName?.id) {
        setSelectedBreedId(data.breedByName.id);
        
        // Pre-fill fields based on breed averages if they're empty
        if (data.breedByName.average_height && !formData.height) {
          setFormData(prev => ({ ...prev, height: data.breedByName.average_height }));
        }
        
        if (data.breedByName.average_weight && !formData.weight) {
          setFormData(prev => ({ ...prev, weight: data.breedByName.average_weight }));
        }
      }
    }
  });

  // Update dog mutation
  const [updateDog] = useMutation(UPDATE_DOG_MUTATION, {
    onCompleted: (data) => {
      // Owner updates are now handled directly in the updateDog mutation since userId is in the schema
      if (false) {
        // This code block is now unnecessary as we handle userId directly in the update
        // Keeping empty block for structure
      } else {
        // Standard update without ownership change
        toast.success('Dog updated successfully!');
        // Navigate to dog details page after successful update
        setTimeout(() => {
          window.location.href = `/dogs/${dogId}`;
        }, 500); // Short delay to allow toast to be seen
        // Also call onSuccess for any additional cleanup
        onSuccess();
        setIsSubmitting(false);
      }
    },
    onError: (error) => {
      toast.error(`Error updating dog: ${error.message}`);
      setSubmitError(error.message);
      setIsSubmitting(false);
    }
  });
  
  // Transfer dog ownership mutation
  const [transferDogOwnership] = useMutation(TRANSFER_DOG_OWNERSHIP_MUTATION, {
    onCompleted: (data) => {
      toast.success('Dog updated and ownership transferred successfully!');
      // Navigate to dog details page after successful transfer
      setTimeout(() => {
        window.location.href = `/dogs/${dogId}`;
      }, 500);
      // Call onSuccess for any additional cleanup
      onSuccess();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(`Error transferring ownership: ${error.message}`);
      setSubmitError(error.message);
      setIsSubmitting(false);
    }
  });

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
      // Handle case where value might contain text like "inches" or "lbs"
      if (name === 'height' || name === 'weight') {
        // Allow empty values
        if (value === '') {
          setFormData(prev => ({ ...prev, [name]: undefined }));
          return;
        }
        
        // Extract the first number from the string
        const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
        if (!isNaN(numericValue)) {
          setFormData(prev => ({ ...prev, [name]: numericValue }));
          return;
        } else {
          // If no valid number, set to undefined
          setFormData(prev => ({ ...prev, [name]: undefined }));
          return;
        }
      }
      
      // Standard number handling
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
      return;
    }
    
    // Special handling for breed selection
    if (name === 'breed') {
      setFormData(prev => ({ ...prev, [name]: value, breedId: undefined }));
      setSelectedBreedId(null);
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
    
    if (!formData.userId) {
      errors.userId = 'Owner is required';
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
      
      // Ensure dateOfBirth is always a valid Date
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
      
      // Use the selected breed ID from the GET_BREED_BY_NAME query or find it from the breeds list
      let breedId = selectedBreedId;
      if (!breedId && formData.breed) {
        const selectedBreed = breedsData?.breeds?.items?.find(
          (b: any) => b.name === formData.breed
        );
        breedId = selectedBreed?.id;
      }
      
      // Process height and weight to ensure they're valid numbers
      let height = undefined;
      if (formData.height !== undefined) {
        if (typeof formData.height === 'number') {
          height = formData.height;
        } else if (typeof formData.height === 'string') {
          // Extract first number from string
          const match = (formData.height as string).match(/[\d.]+/);
          height = match ? parseFloat(match[0]) : undefined;
        }
      }
      
      let weight = undefined;
      if (formData.weight !== undefined) {
        if (typeof formData.weight === 'number') {
          weight = formData.weight;
        } else if (typeof formData.weight === 'string') {
          // Extract first number from string
          const match = (formData.weight as string).match(/[\d.]+/);
          weight = match ? parseFloat(match[0]) : undefined;
        }
      }
      
      // Create input for mutation
      const input = {
        name: formData.name,
        breed: formData.breed,
        gender: formData.gender,
        color: formData.color,
        dateOfBirth: dateOfBirth.toISOString(),
        dateOfDeath: dateOfDeath?.toISOString(),
        microchipNumber: formData.microchipNumber,
        isNeutered: formData.isNeutered,
        height,
        weight,
        titles,
        biography: formData.biography,
        mainImageUrl: formData.mainImageUrl,
        breedId: breedId ?? undefined,
        // Include userId to update the dog's owner
        userId: formData.userId,
        // Keep the existing registration number without modification
        registrationNumber: dogData?.registrationNumber,
        otherRegistrationNumber: formData.otherRegistrationNumber,
      };
      
      // Submit mutation
      await updateDog({
        variables: { 
          id: dogId,
          input 
        }
      });
      
    } catch (error: any) {
      // Handle errors with descriptive messages
      if (error.message.includes('dateOfBirth')) {
        setFormErrors(prev => ({ ...prev, dateOfBirth: 'Invalid date of birth format' }));
      } else if (error.message.includes('dateOfDeath')) {
        setFormErrors(prev => ({ ...prev, dateOfDeath: 'Invalid date of death format' }));
      } else if (error.message.includes('gender')) {
        setFormErrors(prev => ({ ...prev, gender: 'Invalid gender value. Must be Male or Female' }));
      } else if (error.message.includes('breed')) {
        setFormErrors(prev => ({ ...prev, breed: 'Invalid or unknown breed' }));
      } else {
        setSubmitError(error.message || 'An error occurred. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Approval Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-blue-800">Approval Status</h3>
          <div className="mt-1 text-sm text-blue-700">
            <p>Current Status: <ApprovalStatusBadge status={dogData?.approvalStatus || ApprovalStatus.PENDING} showTooltip={false} /></p>
            {dogData?.approvalDate && (
              <p className="mt-1">Approved on: {new Date(dogData.approvalDate).toLocaleDateString()}</p>
            )}
            {dogData?.approvedBy?.fullName && (
              <p className="mt-1">Approved by: {dogData.approvedBy.fullName}</p>
            )}
          </div>
        </div>
      </div>

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

          {/* Owner Selection */}
          <div>
            <UserSearchSelect
              label="Owner"
              placeholder="Search for a user..."
              value={formData.userId}
              onChange={(userId) => {
                setFormData(prev => ({
                  ...prev,
                  userId
                }));
                // Clear any validation errors
                if (formErrors.userId) {
                  setFormErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.userId;
                    return newErrors;
                  });
                }
              }}
              required
              error={formErrors.userId}
              className="w-full"
              disabled={!isAdmin} // Only admins can change ownership
            />
            {!isAdmin && dogData?.user && (
              <p className="mt-1 text-xs text-gray-500">
                Only administrators can change dog ownership.
              </p>
            )}
            {isAdmin && dogData?.user && formData.userId !== dogData.user.id && (
              <p className="mt-1 text-xs text-green-600 font-semibold">
                Ownership will be transferred from {dogData.user.fullName} when you save changes.
              </p>
            )}
            {formErrors.userId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.userId}</p>
            )}
          </div>

          {/* Registration Number */}
          <div className="md:col-span-1">
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
            />
          </div>
          
          {/* Other Registration Number */}
          <div className="md:col-span-1">
            <label htmlFor="otherRegistrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Other Registration Number
            </label>
            <input
              type="text"
              name="otherRegistrationNumber"
              id="otherRegistrationNumber"
              value={formData.otherRegistrationNumber || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Alternative registration number (if available)
            </p>
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
                breedsData?.breeds?.items?.map((breed: any) => {
                  const isSelected = breed.name.toLowerCase() === formData.breed.toLowerCase() ||
                                    breed.id === dogData?.breedObj?.id;
                  return (
                    <option 
                      key={breed.id} 
                      value={breed.name}
                      selected={isSelected}
                    >
                      {breed.name}
                    </option>
                  );
                })
              )}
            </select>
            {breedData?.breedByName && (
              <p className="mt-1 text-xs text-gray-500">
                {breedData.breedByName.origin && `Origin: ${breedData.breedByName.origin}`}
                {breedData.breedByName.average_lifespan && ` | Avg. lifespan: ${breedData.breedByName.average_lifespan} years`}
              </p>
            )}
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
              <option value="male">Male</option>
              <option value="female">Female</option>
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
            />
            {formErrors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
            )}
          </div>
          
          {/* Date of Death (optional) */}
          <div>
            <label htmlFor="dateOfDeath" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Death <span className="text-xs text-gray-500">(if applicable)</span>
            </label>
            <input
              type="date"
              name="dateOfDeath"
              id="dateOfDeath"
              value={formData.dateOfDeath || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${formErrors.dateOfDeath ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
            />
            {formErrors.dateOfDeath && (
              <p className="mt-1 text-sm text-red-600">{formErrors.dateOfDeath}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Additional Details Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Microchip Number */}
          <div>
            <label htmlFor="microchipNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Microchip Number <span className="text-xs text-gray-500">(if applicable)</span>
            </label>
            <input
              type="text"
              name="microchipNumber"
              id="microchipNumber"
              value={formData.microchipNumber || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="e.g. 123456789012345"
            />
          </div>
          
          {/* Is Neutered/Spayed */}
          <div className="flex items-center h-16">
            <input
              type="checkbox"
              name="isNeutered"
              id="isNeutered"
              checked={formData.isNeutered}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isNeutered" className="ml-2 block text-sm text-gray-700">
              Neutered/Spayed
            </label>
          </div>
          
          {/* Height */}
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height (cm) <span className="text-xs text-gray-500">(if known)</span>
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
              Weight (kg) <span className="text-xs text-gray-500">(if known)</span>
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
          
          {/* Titles */}
          <div className="md:col-span-2">
            <label htmlFor="titles" className="block text-sm font-medium text-gray-700 mb-1">
              Titles <span className="text-xs text-gray-500">(comma separated)</span>
            </label>
            <input
              type="text"
              name="titles"
              id="titles"
              value={formData.titles || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="e.g. CH, GCH, CD, RN"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter any titles earned by this dog, separated by commas (e.g. CH, CD, RN)
            </p>
          </div>
          
          {/* Biography */}
          <div className="md:col-span-2">
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
              placeholder="Add biographical information about this dog..."
            />
          </div>
          
          {/* Main Image URL */}
          <div className="md:col-span-2">
            <label htmlFor="mainImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Main Image URL
            </label>
            <input
              type="text"
              name="mainImageUrl"
              id="mainImageUrl"
              value={formData.mainImageUrl || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter a URL for the main image of this dog. For better photo management, use the Photos tab.
            </p>
          </div>
        </div>
      </div>
      
      {/* Form submission error message */}
      {submitError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">There was an error submitting the form</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{submitError}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Form actions */}
      <div className="pt-5 border-t border-gray-200">
        <div className="flex justify-end">
          <Link 
            href={`/manage/dogs/${dogId}/profile`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DogEditForm;
