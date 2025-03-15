'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

// Define TypeScript interfaces
interface Dog {
  id: number;
  name: string;
  breed: string;
  registrationNumber: string;
  ownerName: string;
}

interface OwnershipRecord {
  id?: number;
  dogId: number;
  previousOwner: string;
  newOwner: string;
  transferDate: Date;
  is_current: boolean; // Using "is_current" instead of "is_active" as per memory
  transferReason: string;
  transferPrice?: string;
  registrationUpdated: boolean;
}

export default function ManageOwnerships() {
  const router = useRouter();
  
  // State for available dogs
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<number | ''>('');
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  
  // State for form data
  const [formData, setFormData] = useState<OwnershipRecord>({
    dogId: 0,
    previousOwner: '',
    newOwner: '',
    transferDate: new Date(),
    is_current: true, // Using "is_current" instead of "is_active" as per memory
    transferReason: '',
    transferPrice: '',
    registrationUpdated: false
  });
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Mock data for dogs - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API fetch
    const fetchDogs = async () => {
      // Simulated response data
      const dogsData: Dog[] = [
        { id: 1, name: "Max", breed: "German Shepherd", registrationNumber: "GSD-2020-1234", ownerName: "John Smith" },
        { id: 2, name: "Bella", breed: "Labrador Retriever", registrationNumber: "LAB-2021-5678", ownerName: "Emily Johnson" },
        { id: 3, name: "Charlie", breed: "Bulldog", registrationNumber: "BLD-2019-9012", ownerName: "Michael Williams" },
        { id: 4, name: "Luna", breed: "Golden Retriever", registrationNumber: "GR-2022-3456", ownerName: "Sophia Brown" },
        { id: 5, name: "Cooper", breed: "Beagle", registrationNumber: "BGL-2020-7890", ownerName: "James Davis" }
      ];
      
      setDogs(dogsData);
    };
    
    fetchDogs();
  }, []);

  // Update previousOwner when a dog is selected
  useEffect(() => {
    if (selectedDogId && typeof selectedDogId === 'number') {
      const dog = dogs.find(d => d.id === selectedDogId);
      if (dog) {
        setSelectedDog(dog);
        setFormData(prev => ({
          ...prev,
          dogId: selectedDogId,
          previousOwner: dog.ownerName
        }));
      }
    }
  }, [selectedDogId, dogs]);

  // Handler for form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox fields
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
      return;
    }
    
    // Handle dog selection
    if (name === 'dogId') {
      const dogIdValue = value === '' ? '' : parseInt(value, 10);
      setSelectedDogId(dogIdValue);
      if (typeof dogIdValue === 'number') {
        setFormData({ ...formData, dogId: dogIdValue });
      }
      return;
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

  // Handle date field specifically
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const dateValue = e.target.value ? new Date(e.target.value) : new Date();
      setFormData({ ...formData, transferDate: dateValue });
      
      // Clear error for this field if present
      if (errors.transferDate) {
        const newErrors = { ...errors };
        delete newErrors.transferDate;
        setErrors(newErrors);
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      setErrors({
        ...errors,
        transferDate: 'Invalid date format'
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.dogId) newErrors.dogId = 'Please select a dog';
    if (!formData.previousOwner.trim()) newErrors.previousOwner = 'Previous owner is required';
    if (!formData.newOwner.trim()) newErrors.newOwner = 'New owner is required';
    if (!formData.transferDate) newErrors.transferDate = 'Transfer date is required';
    if (!formData.transferReason.trim()) newErrors.transferReason = 'Transfer reason is required';
    
    // Previous and new owner should be different
    if (formData.previousOwner.trim() === formData.newOwner.trim()) {
      newErrors.newOwner = 'New owner must be different from previous owner';
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
      
      console.log('Submitting ownership change:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      setSubmissionMessage({
        type: 'success',
        text: 'Ownership change successfully recorded!'
      });
      
      // Reset form after successful submission
      setFormData({
        dogId: 0,
        previousOwner: '',
        newOwner: '',
        transferDate: new Date(),
        is_current: true,
        transferReason: '',
        transferPrice: '',
        registrationUpdated: false
      });
      setSelectedDogId('');
      setSelectedDog(null);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionMessage({
        type: 'error',
        text: 'An error occurred while recording the ownership change. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Record Ownership Change</h1>
          
          {submissionMessage && (
            <div className={`mb-6 p-4 rounded-md ${
              submissionMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {submissionMessage.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Dog Selection */}
              <div className="md:col-span-2">
                <label htmlFor="dogId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Dog <span className="text-red-500">*</span>
                </label>
                <select
                  id="dogId"
                  name="dogId"
                  value={selectedDogId}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.dogId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a dog</option>
                  {dogs.map(dog => (
                    <option key={dog.id} value={dog.id}>
                      {dog.name} ({dog.registrationNumber}) - Current Owner: {dog.ownerName}
                    </option>
                  ))}
                </select>
                {errors.dogId && <p className="mt-1 text-sm text-red-500">{errors.dogId}</p>}
              </div>
              
              {selectedDog && (
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200 mb-2">
                  <h3 className="font-medium text-gray-900 mb-2">Selected Dog Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedDog.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration</p>
                      <p className="font-medium">{selectedDog.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Breed</p>
                      <p className="font-medium">{selectedDog.breed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Owner</p>
                      <p className="font-medium">{selectedDog.ownerName}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Previous Owner */}
              <div>
                <label htmlFor="previousOwner" className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Owner <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="previousOwner"
                  name="previousOwner"
                  value={formData.previousOwner}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.previousOwner ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Name of the previous owner"
                />
                {errors.previousOwner && <p className="mt-1 text-sm text-red-500">{errors.previousOwner}</p>}
              </div>
              
              {/* New Owner */}
              <div>
                <label htmlFor="newOwner" className="block text-sm font-medium text-gray-700 mb-1">
                  New Owner <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="newOwner"
                  name="newOwner"
                  value={formData.newOwner}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.newOwner ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Name of the new owner"
                />
                {errors.newOwner && <p className="mt-1 text-sm text-red-500">{errors.newOwner}</p>}
              </div>
              
              {/* Transfer Date */}
              <div>
                <label htmlFor="transferDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="transferDate"
                  name="transferDate"
                  value={formData.transferDate ? format(formData.transferDate, 'yyyy-MM-dd') : ''}
                  onChange={handleDateChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.transferDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.transferDate && <p className="mt-1 text-sm text-red-500">{errors.transferDate}</p>}
              </div>
              
              {/* Transfer Price (Optional) */}
              <div>
                <label htmlFor="transferPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Price (Optional)
                </label>
                <input
                  type="text"
                  id="transferPrice"
                  name="transferPrice"
                  value={formData.transferPrice}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g. $2,500"
                />
              </div>
              
              {/* Transfer Reason */}
              <div className="md:col-span-2">
                <label htmlFor="transferReason" className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="transferReason"
                  name="transferReason"
                  rows={3}
                  value={formData.transferReason}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.transferReason ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Explain the reason for the ownership transfer"
                />
                {errors.transferReason && <p className="mt-1 text-sm text-red-500">{errors.transferReason}</p>}
              </div>
              
              {/* Ownership Status */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_current"
                    name="is_current"
                    checked={formData.is_current}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_current" className="ml-2 text-sm text-gray-700">
                    This is the current ownership record
                  </label>
                </div>
              </div>
              
              {/* Registration Updated */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="registrationUpdated"
                    name="registrationUpdated"
                    checked={formData.registrationUpdated}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="registrationUpdated" className="ml-2 text-sm text-gray-700">
                    Registration has been updated with kennel club
                  </label>
                </div>
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
                {isSubmitting ? 'Saving...' : 'Record Ownership Change'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
