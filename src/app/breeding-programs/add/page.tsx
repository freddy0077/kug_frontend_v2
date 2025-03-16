'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CREATE_BREEDING_PROGRAM } from '@/graphql/mutations/breedingProgramMutations';

export default function AddBreedingProgram() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    breeds: [],
    goals: '',
    healthStandards: '',
    status: 'planning'
  });
  
  const [currentBreed, setCurrentBreed] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common dog breeds for dropdown
  const dogBreeds = [
    "Labrador Retriever",
    "German Shepherd",
    "Golden Retriever",
    "Bulldogs",
    "Beagle",
    "Poodle",
    "Rottweiler",
    "Yorkshire Terrier",
    "Boxer",
    "Dachshund",
    "Siberian Husky",
    "Great Dane",
    "Doberman Pinscher",
    "Shih Tzu",
    "Border Collie",
    "Cocker Spaniel"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const addBreed = () => {
    if (currentBreed && !formData.breeds.includes(currentBreed)) {
      setFormData({
        ...formData,
        breeds: [...formData.breeds, currentBreed]
      });
      setCurrentBreed('');
    }
  };

  const removeBreed = (index: number) => {
    const updatedBreeds = [...formData.breeds];
    updatedBreeds.splice(index, 1);
    setFormData({
      ...formData,
      breeds: updatedBreeds
    });
  };

  // Set up the GraphQL mutation
  const [createBreedingProgram, { loading: mutationLoading }] = useMutation(CREATE_BREEDING_PROGRAM, {
    onCompleted: (data) => {
      console.log('Breeding program created:', data);
      router.push('/breeding-programs');
    },
    onError: (error) => {
      console.error('Error creating breeding program:', error);
      setErrors({
        submit: error.message || 'Failed to create breeding program. Please try again.'
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.breeds.length === 0) {
      newErrors.breeds = 'At least one breed is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the GraphQL mutation to create a breeding program
      await createBreedingProgram({
        variables: {
          name: formData.name,
          description: formData.description,
          breeds: formData.breeds,
          goals: formData.goals || null,
          healthStandards: formData.healthStandards || null,
          status: formData.status || 'planning'
        }
      });
      
      // Note: Redirect is handled in onCompleted callback
    } catch (error) {
      // Error handling is done in onError callback
      console.error('Error caught in try/catch:', error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['BREEDER', 'ADMIN']}>
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Add New Breeding Program</h1>
              <p className="mt-1 text-gray-600">Create a new breeding program to track your breeding goals and dogs</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.submit}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Program Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Champion Line Labradors"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Describe the goals and focus of your breeding program"
                ></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breeds *
                </label>
                <div className="flex space-x-2">
                  <select
                    value={currentBreed}
                    onChange={(e) => setCurrentBreed(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a breed</option>
                    {dogBreeds.map((breed) => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addBreed}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
                {errors.breeds && <p className="mt-1 text-sm text-red-600">{errors.breeds}</p>}
                
                {formData.breeds.length > 0 && (
                  <div className="mt-2">
                    <ul className="bg-gray-50 p-2 rounded-md">
                      {formData.breeds.map((breed, index) => (
                        <li key={index} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                          <span>{breed}</span>
                          <button
                            type="button"
                            onClick={() => removeBreed(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-1">
                  Breeding Goals
                </label>
                <textarea
                  id="goals"
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What specific traits, temperament, or characteristics are you breeding for?"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="healthStandards" className="block text-sm font-medium text-gray-700 mb-1">
                  Health Standards
                </label>
                <textarea
                  id="healthStandards"
                  name="healthStandards"
                  value={formData.healthStandards}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the health testing and standards you maintain for your breeding dogs"
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/breeding-programs')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || mutationLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isSubmitting || mutationLoading ? 'Creating...' : 'Create Breeding Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
