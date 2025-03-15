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
}

interface HealthRecord {
  id?: number;
  dogId: number;
  date: Date;
  description: string; // Using "description" instead of "diagnosis" as per memory
  veterinarian: string;
  results: string; // Using "results" instead of "test_results" as per memory
  treatment: string;
  followUpDate: Date | null;
  isResolved: boolean;
}

export default function ManageHealthRecords() {
  const router = useRouter();
  
  // State for available dogs
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<number | ''>('');
  
  // State for form data
  const [formData, setFormData] = useState<HealthRecord>({
    dogId: 0,
    date: new Date(),
    description: '',
    veterinarian: '',
    results: '',
    treatment: '',
    followUpDate: null,
    isResolved: false
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
        { id: 1, name: "Max", breed: "German Shepherd", registrationNumber: "GSD-2020-1234" },
        { id: 2, name: "Bella", breed: "Labrador Retriever", registrationNumber: "LAB-2021-5678" },
        { id: 3, name: "Charlie", breed: "Bulldog", registrationNumber: "BLD-2019-9012" },
        { id: 4, name: "Luna", breed: "Golden Retriever", registrationNumber: "GR-2022-3456" },
        { id: 5, name: "Cooper", breed: "Beagle", registrationNumber: "BGL-2020-7890" }
      ];
      
      setDogs(dogsData);
    };
    
    fetchDogs();
  }, []);

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

  // Handle date fields specifically
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'date' | 'followUpDate') => {
    try {
      const dateValue = e.target.value ? new Date(e.target.value) : null;
      
      // For record date, never allow null - use current date as fallback
      if (fieldName === 'date' && !dateValue) {
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

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.dogId) newErrors.dogId = 'Please select a dog';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.veterinarian.trim()) newErrors.veterinarian = 'Veterinarian name is required';
    
    // Follow-up date validation (if provided)
    if (formData.followUpDate && formData.date && formData.followUpDate < formData.date) {
      newErrors.followUpDate = 'Follow-up date cannot be before record date';
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
      
      console.log('Submitting health record:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      setSubmissionMessage({
        type: 'success',
        text: 'Health record successfully added!'
      });
      
      // Reset form after successful submission
      setFormData({
        dogId: 0,
        date: new Date(),
        description: '',
        veterinarian: '',
        results: '',
        treatment: '',
        followUpDate: null,
        isResolved: false
      });
      setSelectedDogId('');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionMessage({
        type: 'error',
        text: 'An error occurred while adding the health record. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Health Record</h1>
          
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
                      {dog.name} ({dog.registrationNumber}) - {dog.breed}
                    </option>
                  ))}
                </select>
                {errors.dogId && <p className="mt-1 text-sm text-red-500">{errors.dogId}</p>}
              </div>
              
              {/* Record Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Record Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange(e, 'date')}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
              </div>
              
              {/* Veterinarian */}
              <div>
                <label htmlFor="veterinarian" className="block text-sm font-medium text-gray-700 mb-1">
                  Veterinarian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="veterinarian"
                  name="veterinarian"
                  value={formData.veterinarian}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.veterinarian ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.veterinarian && <p className="mt-1 text-sm text-red-500">{errors.veterinarian}</p>}
              </div>
              
              {/* Description (changed from diagnosis as per memory) */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full details of the health issue or checkup"
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>
              
              {/* Results (changed from test_results as per memory) */}
              <div className="md:col-span-2">
                <label htmlFor="results" className="block text-sm font-medium text-gray-700 mb-1">
                  Test Results
                </label>
                <textarea
                  id="results"
                  name="results"
                  rows={2}
                  value={formData.results}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter any test results or findings"
                />
              </div>
              
              {/* Treatment */}
              <div className="md:col-span-2">
                <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment
                </label>
                <textarea
                  id="treatment"
                  name="treatment"
                  rows={2}
                  value={formData.treatment}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter treatments prescribed or administered"
                />
              </div>
              
              {/* Follow-up Date */}
              <div>
                <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Date (if needed)
                </label>
                <input
                  type="date"
                  id="followUpDate"
                  name="followUpDate"
                  value={formData.followUpDate ? format(formData.followUpDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDateChange(e, 'followUpDate')}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.followUpDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.followUpDate && <p className="mt-1 text-sm text-red-500">{errors.followUpDate}</p>}
              </div>
              
              {/* Resolved Status */}
              <div>
                <div className="flex items-center h-full">
                  <input
                    type="checkbox"
                    id="isResolved"
                    name="isResolved"
                    checked={formData.isResolved}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isResolved" className="ml-2 text-sm text-gray-700">
                    Issue is resolved (no follow-up needed)
                  </label>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/health-records')}
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
                {isSubmitting ? 'Saving...' : 'Add Health Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
