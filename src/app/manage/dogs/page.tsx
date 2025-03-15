'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

// Define TypeScript interfaces
interface FormDog {
  name: string;
  breed: string;
  gender: 'male' | 'female';
  dateOfBirth: Date; // Ensuring this is always a Date type as per memory
  dateOfDeath?: Date | null; // Optional with proper typing
  registrationNumber: string;
  color: string;
  ownerName: string;
  isChampion: boolean;
  notes: string;
}

export default function ManageDogs() {
  const router = useRouter();
  
  // List of common dog breeds
  const breedOptions = [
    { id: "labrador", name: "Labrador Retriever" },
    { id: "german-shepherd", name: "German Shepherd" },
    { id: "bulldog", name: "Bulldog" },
    { id: "golden-retriever", name: "Golden Retriever" },
    { id: "beagle", name: "Beagle" },
    { id: "poodle", name: "Poodle" },
    { id: "rottweiler", name: "Rottweiler" },
    { id: "yorkshire", name: "Yorkshire Terrier" },
    { id: "boxer", name: "Boxer" },
    { id: "other", name: "Other" }
  ];

  // Form initial state - ensure dateOfBirth is never undefined as required by database
  const [formData, setFormData] = useState<FormDog>({
    name: '',
    breed: '',
    gender: 'male', // Default value for selection
    dateOfBirth: new Date(), // Default to current date, never undefined
    dateOfDeath: null,
    registrationNumber: '',
    color: '',
    ownerName: '',
    isChampion: false,
    notes: ''
  });

  // For handling custom breed input
  const [customBreed, setCustomBreed] = useState('');
  const [showCustomBreed, setShowCustomBreed] = useState(false);
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Handler for form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox fields
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
      return;
    }
    
    // Handle select fields for breeds
    if (name === 'breed' && value === 'other') {
      setShowCustomBreed(true);
      setFormData({ ...formData, [name]: customBreed || 'other' });
      return;
    }
    
    // Reset custom breed field if a standard breed is selected
    if (name === 'breed' && value !== 'other') {
      setShowCustomBreed(false);
    }
    
    // Handle all other fields
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field if present
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // Handle date fields specifically
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'dateOfBirth' | 'dateOfDeath') => {
    try {
      const dateValue = e.target.value ? new Date(e.target.value) : null;
      
      // For dateOfBirth, never allow null or undefined - use current date as fallback
      if (fieldName === 'dateOfBirth' && !dateValue) {
        setFormData({ ...formData, [fieldName]: new Date() });
        return;
      }
      
      setFormData({ ...formData, [fieldName]: dateValue });
      
      // Clear error for this field if present
      if (errors[fieldName]) {
        const newErrors = { ...errors };
        delete newErrors[fieldName];
        setErrors(newErrors);
      }
    } catch (error) {
      console.error(`Error parsing date for ${fieldName}:`, error);
      setErrors({
        ...errors,
        [fieldName]: 'Invalid date format'
      });
    }
  };

  // Handle custom breed input
  const handleCustomBreedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customBreedValue = e.target.value;
    setCustomBreed(customBreedValue);
    setFormData({ ...formData, breed: customBreedValue });
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    
    // Date validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    // Gender validation with better error reporting (as per memory)
    if (!['male', 'female'].includes(formData.gender)) {
      newErrors.gender = 'Gender must be either male or female';
    }
    
    // Death date validation
    if (formData.dateOfDeath && formData.dateOfBirth && formData.dateOfDeath < formData.dateOfBirth) {
      newErrors.dateOfDeath = 'Date of death cannot be before date of birth';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmissionMessage(null);
    
    try {
      // In a real app, you would submit to an API endpoint here
      // For now, we'll simulate a successful submission
      
      console.log('Submitting dog data:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      setSubmissionMessage({
        type: 'success',
        text: 'Dog successfully added to the registry!'
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        breed: '',
        gender: 'male',
        dateOfBirth: new Date(),
        dateOfDeath: null,
        registrationNumber: '',
        color: '',
        ownerName: '',
        isChampion: false,
        notes: ''
      });
      setCustomBreed('');
      setShowCustomBreed(false);
      
      // Redirect after a delay
      // setTimeout(() => {
      //   router.push('/dogs');
      // }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionMessage({
        type: 'error',
        text: 'An error occurred while adding the dog. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Dog</h1>
          
          {submissionMessage && (
            <div className={`mb-6 p-4 rounded-md ${
              submissionMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {submissionMessage.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Dog Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Dog Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              
              {/* Registration Number */}
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.registrationNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.registrationNumber && <p className="mt-1 text-sm text-red-500">{errors.registrationNumber}</p>}
              </div>
              
              {/* Breed Selection */}
              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
                  Breed <span className="text-red-500">*</span>
                </label>
                <select
                  id="breed"
                  name="breed"
                  value={showCustomBreed ? 'other' : formData.breed}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.breed ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a breed</option>
                  {breedOptions.map(breed => (
                    <option key={breed.id} value={breed.id}>{breed.name}</option>
                  ))}
                </select>
                {showCustomBreed && (
                  <input
                    type="text"
                    id="customBreed"
                    name="customBreed"
                    value={customBreed}
                    onChange={handleCustomBreedChange}
                    placeholder="Enter breed name"
                    className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                )}
                {errors.breed && <p className="mt-1 text-sm text-red-500">{errors.breed}</p>}
              </div>
              
              {/* Gender Selection */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="male" className="ml-2 text-sm text-gray-700">Male</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="female"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="female" className="ml-2 text-sm text-gray-700">Female</label>
                  </div>
                </div>
                {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
              </div>
              
              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange(e, 'dateOfBirth')}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
              </div>
              
              {/* Date of Death (Optional) */}
              <div>
                <label htmlFor="dateOfDeath" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Death (if applicable)
                </label>
                <input
                  type="date"
                  id="dateOfDeath"
                  name="dateOfDeath"
                  value={formData.dateOfDeath ? format(formData.dateOfDeath, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange(e, 'dateOfDeath')}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.dateOfDeath ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfDeath && <p className="mt-1 text-sm text-red-500">{errors.dateOfDeath}</p>}
              </div>
              
              {/* Color */}
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              {/* Owner Name */}
              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.ownerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.ownerName && <p className="mt-1 text-sm text-red-500">{errors.ownerName}</p>}
              </div>
              
              {/* Champion Status */}
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isChampion"
                    name="isChampion"
                    checked={formData.isChampion}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isChampion" className="ml-2 text-sm text-gray-700">
                    This dog has champion status or bloodline
                  </label>
                </div>
              </div>
              
              {/* Notes */}
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter any additional information about this dog"
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/dogs')}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Add Dog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
