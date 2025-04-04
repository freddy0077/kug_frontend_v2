'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CompetitionResult, CompetitionInput, useCreateCompetitionResult, useUpdateCompetitionResult } from '@/hooks/useCompetitions';
import toast from 'react-hot-toast';
import DogSearchSelect from '@/components/common/DogSearchSelect';

// Extended interface to include dogName
interface CompetitionInputWithName extends CompetitionInput {
  dogName?: string;
}

interface CompetitionFormProps {
  initialData?: CompetitionResult;
  dogId?: string;
  isEdit?: boolean;
}

const CompetitionForm: React.FC<CompetitionFormProps> = ({ 
  initialData, 
  dogId,
  isEdit = false 
}) => {
  const router = useRouter();
  const { create, loading: createLoading } = useCreateCompetitionResult();
  const { update, loading: updateLoading } = useUpdateCompetitionResult();
  // We no longer need to use useUserDogs since DogSearchSelect handles fetching dogs
  
  const loading = createLoading || updateLoading;
  
  const categoryOptions = [
    'CONFORMATION', 
    'OBEDIENCE', 
    'AGILITY', 
    'FIELD_TRIALS', 
    'HERDING', 
    'TRACKING', 
    'RALLY', 
    'SCENT_WORK'
  ];

  const [formData, setFormData] = useState<CompetitionInputWithName>({
    dogId: dogId || initialData?.dogId || '',
    eventName: initialData?.eventName || '',
    eventDate: initialData?.eventDate ? 
      new Date(initialData.eventDate).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0],
    location: initialData?.location || '',
    category: initialData?.category || categoryOptions[0],
    rank: initialData?.rank || 1,
    title_earned: initialData?.title_earned || '',
    judge: initialData?.judge || '',
    points: initialData?.points || 0,
    description: initialData?.description || '',
    totalParticipants: initialData?.totalParticipants || 0,
    imageUrl: initialData?.imageUrl || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CompetitionInput, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CompetitionInput, string>> = {};
    
    if (!formData.dogId) newErrors.dogId = 'Dog is required';
    if (!formData.eventName) newErrors.eventName = 'Event name is required';
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.judge) newErrors.judge = 'Judge name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convert number inputs to numbers
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if it exists
    if (errors[name as keyof CompetitionInput]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle dog selection from DogSearchSelect
  const handleDogChange = (dogId: string, dogInfo?: any) => {
    // If dogInfo is provided directly (from our custom event), use it
    // This would happen if we modified DogSearchSelect to pass more info
    if (dogInfo && dogInfo.name) {
      setFormData(prev => ({
        ...prev,
        dogId,
        dogName: dogInfo.name
      }));
    } else {
      // Otherwise just update the ID
      setFormData(prev => ({
        ...prev,
        dogId
      }));
    }
    
    // Clear error for dogId if it exists
    if (errors.dogId) {
      setErrors(prev => ({
        ...prev,
        dogId: undefined
      }));
    }
  };
  
  // Get the currently selected dog's details
  const getDogDetailsOnSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // This is a workaround to capture the dog name from the select option
    const selectElement = e.target;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const dogName = selectedOption.text.split(' (')[0]; // Extract name from "Name (Breed)"
    
    setFormData(prev => ({
      ...prev,
      dogId: e.target.value,
      dogName
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (isEdit && initialData?.id) {
        // Update existing competition
        await update(initialData.id, {
          eventName: formData.eventName,
          eventDate: formData.eventDate,
          location: formData.location,
          category: formData.category,
          rank: formData.rank,
          title_earned: formData.title_earned,
          judge: formData.judge,
          points: formData.points,
          description: formData.description,
          totalParticipants: formData.totalParticipants,
          imageUrl: formData.imageUrl
        });
        toast.success('Competition updated successfully');
        router.push(`/competitions/${initialData.id}`);
      } else {
        // Create new competition - only send the fields defined in CreateCompetitionInput
        const competitionInput: CompetitionInput = {
          dogId: formData.dogId,
          eventName: formData.eventName,
          eventDate: formData.eventDate,
          location: formData.location,
          category: formData.category,
          rank: formData.rank,
          title_earned: formData.title_earned,
          judge: formData.judge,
          points: formData.points,
          description: formData.description,
          totalParticipants: formData.totalParticipants,
          imageUrl: formData.imageUrl
        };
        
        const result = await create(competitionInput);
        toast.success('Competition added successfully');
        router.push('/competitions'); // Redirect to competitions list
      }
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} competition: ${(error as Error).message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">
        {isEdit ? 'Edit Competition Result' : 'Add New Competition Result'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dog Selector */}
        <div>
          <DogSearchSelect
            label="Dog *"
            placeholder="Search for a dog..."
            value={formData.dogId}
            onChange={(dogId) => {
              // We need to set a callback to capture the dog name when it's loaded
              handleDogChange(dogId);
              
              // This will attempt to get the dog name after selection
              // by waiting for the DogSearchSelect to update its internal state
              setTimeout(() => {
                const selectedDogElement = document.querySelector(
                  `[data-dog-id="${dogId}"]`
                );
                if (selectedDogElement) {
                  const dogName = selectedDogElement.getAttribute('data-dog-name');
                  if (dogName) {
                    setFormData(prev => ({
                      ...prev,
                      dogName
                    }));
                  }
                }
              }, 100);
            }}
            required={true}
            error={errors.dogId}
            disabled={isEdit || Boolean(dogId)}
            className="w-full"
          />
          {/* Add a hidden span to show when debugging */}
          {formData.dogName && (
            <p className="text-xs text-gray-500 mt-1">Selected: {formData.dogName}</p>
          )}
        </div>
        
        {/* Event Name */}
        <div>
          <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
            Event Name *
          </label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.eventName ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
            required
          />
          {errors.eventName && <p className="mt-1 text-sm text-red-500">{errors.eventName}</p>}
        </div>
        
        {/* Event Date */}
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
            Event Date *
          </label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            value={formData.eventDate as string}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.eventDate ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
            required
          />
          {errors.eventDate && <p className="mt-1 text-sm text-red-500">{errors.eventDate}</p>}
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.location ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
            required
          />
          {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
        </div>
        
        {/* Judge */}
        <div>
          <label htmlFor="judge" className="block text-sm font-medium text-gray-700 mb-1">
            Judge Name *
          </label>
          <input
            type="text"
            id="judge"
            name="judge"
            value={formData.judge}
            onChange={handleChange}
            className={`w-full rounded-md border ${errors.judge ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
            required
          />
          {errors.judge && <p className="mt-1 text-sm text-red-500">{errors.judge}</p>}
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            {categoryOptions.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        {/* Rank */}
        <div>
          <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-1">
            Rank *
          </label>
          <input
            type="number"
            id="rank"
            name="rank"
            min="1"
            value={formData.rank}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        
        {/* Title Earned */}
        <div>
          <label htmlFor="title_earned" className="block text-sm font-medium text-gray-700 mb-1">
            Title Earned
          </label>
          <input
            type="text"
            id="title_earned"
            name="title_earned"
            value={formData.title_earned || ''}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {/* Points */}
        <div>
          <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
            Points *
          </label>
          <input
            type="number"
            id="points"
            name="points"
            min="0"
            step="0.01"
            value={formData.points}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        
        {/* Total Participants */}
        <div>
          <label htmlFor="totalParticipants" className="block text-sm font-medium text-gray-700 mb-1">
            Total Participants
          </label>
          <input
            type="number"
            id="totalParticipants"
            name="totalParticipants"
            min="0"
            value={formData.totalParticipants || ''}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl || ''}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      {/* Description */}
      <div className="mt-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEdit ? 'Updating...' : 'Saving...'}
            </span>
          ) : (
            isEdit ? 'Update Competition' : 'Save Competition'
          )}
        </button>
      </div>
    </form>
  );
};

export default CompetitionForm;
