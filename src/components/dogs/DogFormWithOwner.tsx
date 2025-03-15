'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_DOG_MUTATION } from '@/graphql/mutations/dogMutations';
import { GET_BREEDS, GET_BREED_BY_NAME, SortDirection } from '@/graphql/queries/breedQueries';
// import { GET_OWNERS } from '@/graphql/queries/ownerQueries';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Form input types
type FormInputs = {
  name: string;
  breed: string;
  breedId?: string;
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
  ownerId: string; // Required field for dog ownership
};

// Initial form state
const initialFormState: FormInputs = {
  name: '',
  breed: '',
  gender: 'Male',
  color: '',
  dateOfBirth: '',
  isNeutered: false,
  ownerId: '', // Default empty string for ownerId
};

// Valid gender options
const VALID_GENDERS = ['male', 'female'];

interface DogFormProps {
  onSuccess: (dogId: string) => void;
}

const DogFormWithOwner: React.FC<DogFormProps> = ({ onSuccess }) => {
  // Form state
  const [formData, setFormData] = useState<FormInputs>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormInputs, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedBreedId, setSelectedBreedId] = useState<string | null>(null);

  // Fetch breeds for dropdown
  const { data: breedsData, loading: breedsLoading } = useQuery(GET_BREEDS, {
    variables: { 
      limit: 100,
      sortDirection: SortDirection.ASC
    }
  });
  
  // // Fetch owners for dropdown
  // const { data: ownersData, loading: ownersLoading } = useQuery(GET_OWNERS, {
  //   variables: { limit: 100 }
  // });

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

  // Create dog mutation
  const [createDog] = useMutation(CREATE_DOG_MUTATION, {
    onCompleted: (data) => {
      if (data?.createDog?.id) {
        toast.success('Dog created successfully!');
        onSuccess(data.createDog.id);
      }
    },
    onError: (error) => {
      toast.error(`Error creating dog: ${error.message}`);
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
      
      // Create input for mutation
      const input = {
        ...formData,
        dateOfBirth: dateOfBirth.toISOString(),
        dateOfDeath: dateOfDeath?.toISOString(),
        titles,
        breedId: breedId ?? undefined,
        ownerId: formData.ownerId // Include the owner ID in the mutation input
      };
      
      // Submit mutation
      await createDog({
        variables: { input }
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
            <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-1">
              Owner <span className="text-red-500">*</span>
            </label>
            {/* <select
              name="ownerId"
              id="ownerId"
              value={formData.ownerId}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${formErrors.ownerId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
            >
              <option value="">Select Owner</option>
              {ownersLoading ? (
                <option value="" disabled>Loading owners...</option>
              ) : (
                ownersData?.owners?.items?.map((owner: any) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))
              )}
            </select> */}
            {formErrors.ownerId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.ownerId}</p>
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
              Date of Death (if applicable)
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

      {/* Registration Information */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Registration Information</h2>
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
          
          {/* Is Neutered */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isNeutered"
              id="isNeutered"
              checked={formData.isNeutered}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isNeutered" className="text-sm font-medium text-gray-700">
              Is Neutered/Spayed
            </label>
          </div>
        </div>
      </div>

      {/* Physical Attributes */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Physical Attributes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Height */}
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height (meters)
            </label>
            <input
              type="number"
              name="height"
              id="height"
              value={formData.height || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Dog's height in meters"
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
              step="0.1"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Dog's weight in kilograms"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
        <div className="space-y-6">
          {/* Titles */}
          <div>
            <label htmlFor="titles" className="block text-sm font-medium text-gray-700 mb-1">
              Titles (comma separated)
            </label>
            <input
              type="text"
              name="titles"
              id="titles"
              value={formData.titles || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="e.g. Champion, Grand Champion, etc."
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple titles with commas.
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
              placeholder="Add any important information about this dog..."
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <Link 
          href="/dogs"
          className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Creating...' : 'Create Dog'}
        </button>
      </div>
      
      {/* Error Message */}
      {submitError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}
    </form>
  );
};

export default DogFormWithOwner;
