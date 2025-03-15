import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { CREATE_BREED, UPDATE_BREED } from '@/graphql/mutations/breedMutations';

interface BreedFormProps {
  initialBreed?: any;
  isEditing?: boolean;
}

const BreedForm: React.FC<BreedFormProps> = ({ initialBreed = {}, isEditing = false }) => {
  const router = useRouter();
  const [createBreed] = useMutation(CREATE_BREED);
  const [updateBreed] = useMutation(UPDATE_BREED);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    group: '',
    origin: '',
    temperament: '',
    average_lifespan: '',
    average_height: '',
    average_weight: '',
    description: '',
    imageUrl: ''
  });

  // Initialize form with existing breed data if editing
  useEffect(() => {
    if (isEditing && initialBreed) {
      const { __typename, id, dogs, ...breedData } = initialBreed;
      setFormData({
        ...formData,
        ...breedData
      });
    }
  }, [initialBreed, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Create a new object with only the fields that should be sent to GraphQL
    const { imageUrl, ...inputData } = formData;
    const input = { ...inputData };

    try {
      if (isEditing) {
        // Update existing breed
        await updateBreed({
          variables: {
            id: initialBreed.id,
            input
          }
        });
      } else {
        // Create new breed
        await createBreed({
          variables: { input }
        });
      }
      
      // Redirect to breeds list after successful submission
      router.push('/manage/breeds');
    } catch (err: any) {
      if (err.graphQLErrors?.length > 0) {
        setError(err.graphQLErrors[0].message);
      } else if (err.networkError) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error('Error submitting breed form:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-green-800 mb-6">
        {isEditing ? 'Edit Breed' : 'Add New Breed'}
      </h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Breed Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                Group
              </label>
              <input
                id="group"
                name="group"
                type="text"
                value={formData.group}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                Origin
              </label>
              <input
                id="origin"
                name="origin"
                type="text"
                value={formData.origin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Note: Image URL is stored separately and used only for display purposes
              </p>
            </div>
          </div>

          {/* Physical Characteristics */}
          <div className="space-y-4">
            <div>
              <label htmlFor="average_weight" className="block text-sm font-medium text-gray-700 mb-1">
                Average Weight
              </label>
              <input
                id="average_weight"
                name="average_weight"
                type="text"
                placeholder="e.g., 20-30 kg"
                value={formData.average_weight}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="average_height" className="block text-sm font-medium text-gray-700 mb-1">
                Average Height
              </label>
              <input
                id="average_height"
                name="average_height"
                type="text"
                placeholder="e.g., 45-55 cm"
                value={formData.average_height}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="average_lifespan" className="block text-sm font-medium text-gray-700 mb-1">
                Average Lifespan
              </label>
              <input
                id="average_lifespan"
                name="average_lifespan"
                type="text"
                placeholder="e.g., 10-15 years"
                value={formData.average_lifespan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Temperament & Description */}
        <div className="space-y-4">
          <div>
            <label htmlFor="temperament" className="block text-sm font-medium text-gray-700 mb-1">
              Temperament
            </label>
            <textarea
              id="temperament"
              name="temperament"
              rows={2}
              value={formData.temperament}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/manage/breeds')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update Breed' : 'Create Breed'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BreedForm;
