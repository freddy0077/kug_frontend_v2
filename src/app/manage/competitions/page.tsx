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

interface CompetitionResult {
  id?: number;
  dogId: number;
  eventDate: Date;
  eventName: string;
  location: string;
  category: string;
  placement: string;
  title_earned: string; // Using "title_earned" instead of "certificate" as per memory
  judge: string;
  notes: string;
}

export default function ManageCompetitions() {
  const router = useRouter();
  
  // State for available dogs
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<number | ''>('');
  
  // State for form data
  const [formData, setFormData] = useState<CompetitionResult>({
    dogId: 0,
    eventDate: new Date(),
    eventName: '',
    location: '',
    category: '',
    placement: '',
    title_earned: '', // Using "title_earned" instead of "certificate" as per memory
    judge: '',
    notes: ''
  });
  
  // Competition categories
  const competitionCategories = [
    "Conformation Show",
    "Obedience Trial",
    "Rally Trial",
    "Agility",
    "Field Trial",
    "Herding Trial",
    "Tracking Test",
    "Hunting Test",
    "Lure Coursing",
    "Barn Hunt",
    "Dock Diving",
    "Other"
  ];
  
  // Placement options
  const placementOptions = [
    "1st Place",
    "2nd Place",
    "3rd Place", 
    "4th Place",
    "Best in Show",
    "Best of Breed",
    "Best of Opposite Sex",
    "Winner's Dog/Bitch",
    "Reserve Winner's Dog/Bitch",
    "Award of Merit",
    "Qualified",
    "Disqualified",
    "Other"
  ];
  
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
    const { name, value } = e.target;
    
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
      setFormData({ ...formData, eventDate: dateValue });
      
      // Clear error for this field if present
      if (errors.eventDate) {
        const newErrors = { ...errors };
        delete newErrors.eventDate;
        setErrors(newErrors);
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      setErrors({
        ...errors,
        eventDate: 'Invalid date format'
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.dogId) newErrors.dogId = 'Please select a dog';
    if (!formData.eventDate) newErrors.eventDate = 'Event date is required';
    if (!formData.eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.placement.trim()) newErrors.placement = 'Placement is required';
    
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
      
      console.log('Submitting competition result:', formData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      setSubmissionMessage({
        type: 'success',
        text: 'Competition result successfully added!'
      });
      
      // Reset form after successful submission
      setFormData({
        dogId: 0,
        eventDate: new Date(),
        eventName: '',
        location: '',
        category: '',
        placement: '',
        title_earned: '',
        judge: '',
        notes: ''
      });
      setSelectedDogId('');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmissionMessage({
        type: 'error',
        text: 'An error occurred while adding the competition result. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Competition Result</h1>
          
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
              
              {/* Event Date */}
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate ? format(formData.eventDate, 'yyyy-MM-dd') : ''}
                  onChange={handleDateChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.eventDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.eventDate && <p className="mt-1 text-sm text-red-500">{errors.eventDate}</p>}
              </div>
              
              {/* Event Name */}
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="eventName"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.eventName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g. National Dog Show 2025"
                />
                {errors.eventName && <p className="mt-1 text-sm text-red-500">{errors.eventName}</p>}
              </div>
              
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g. San Francisco, CA"
                />
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>
              
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {competitionCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
              
              {/* Placement */}
              <div>
                <label htmlFor="placement" className="block text-sm font-medium text-gray-700 mb-1">
                  Placement/Result <span className="text-red-500">*</span>
                </label>
                <select
                  id="placement"
                  name="placement"
                  value={formData.placement}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                    errors.placement ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select placement</option>
                  {placementOptions.map(placement => (
                    <option key={placement} value={placement}>{placement}</option>
                  ))}
                </select>
                {errors.placement && <p className="mt-1 text-sm text-red-500">{errors.placement}</p>}
              </div>
              
              {/* Title Earned (using title_earned instead of certificate as per memory) */}
              <div>
                <label htmlFor="title_earned" className="block text-sm font-medium text-gray-700 mb-1">
                  Title Earned
                </label>
                <input
                  type="text"
                  id="title_earned"
                  name="title_earned"
                  value={formData.title_earned}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g. Champion, Grand Champion, etc."
                />
              </div>
              
              {/* Judge */}
              <div>
                <label htmlFor="judge" className="block text-sm font-medium text-gray-700 mb-1">
                  Judge
                </label>
                <input
                  type="text"
                  id="judge"
                  name="judge"
                  value={formData.judge}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
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
                  placeholder="Enter any additional details about the competition result"
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/competitions')}
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
                {isSubmitting ? 'Saving...' : 'Add Competition Result'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
