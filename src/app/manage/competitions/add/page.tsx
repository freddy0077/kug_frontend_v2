'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CompetitionResultFormData {
  dogId: string;
  dogName: string;
  eventName: string;
  eventDate: string;
  location: string;
  category: string;
  ranking: string;
  title_earned: string; // Using correct field name as per memory
  judge: string;
  notes: string;
}

// Sample data for dogs selection
const dogSampleData = [
  { id: '1', name: 'Max', breed: 'Golden Retriever', breedObj: { name: 'Golden Retriever' }, registrationNumber: 'PD-12345' },
  { id: '2', name: 'Luna', breed: 'German Shepherd', breedObj: { name: 'German Shepherd' }, registrationNumber: 'PD-67890' },
  { id: '3', name: 'Charlie', breed: 'Labrador Retriever', breedObj: { name: 'Labrador Retriever' }, registrationNumber: 'PD-54321' },
];

// Sample categories
const categories = [
  { id: 'conformation', name: 'Conformation' },
  { id: 'obedience', name: 'Obedience' },
  { id: 'agility', name: 'Agility' },
  { id: 'rally', name: 'Rally' },
  { id: 'tracking', name: 'Tracking' },
  { id: 'fieldwork', name: 'Fieldwork' },
  { id: 'herding', name: 'Herding' },
  { id: 'other', name: 'Other' },
];

export default function AddCompetitionResult() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dogs, setDogs] = useState(dogSampleData);
  
  // Initialize form data
  const [formData, setFormData] = useState<CompetitionResultFormData>({
    dogId: '',
    dogName: '',
    eventName: '',
    eventDate: new Date().toISOString().split('T')[0], // Today's date as default
    location: '',
    category: '',
    ranking: '',
    title_earned: '', // Using correct field name as per memory
    judge: '',
    notes: '',
  });

  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    
    setIsAuthenticated(authStatus);
    setUserRole(role);
    setIsLoading(false);
    
    // Redirect to login if not authenticated
    if (!authStatus) {
      router.push('/auth/login');
      return;
    }
    
    // Check if user has permission to add competition results
    // Only owners, handlers, clubs, and admins can add competition results
    const hasPermission = role === 'admin' || 
                          role === 'owner' || 
                          role === 'handler' ||
                          role === 'club';
                          
    if (authStatus && !hasPermission) {
      // Redirect to dashboard if authenticated but doesn't have permission
      router.push('/manage');
      return;
    }

    // In a real app, we would fetch dogs belonging to this user or handler
    // For now, we'll use the sample data
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // If dogId changes, update the dogName
    if (name === 'dogId') {
      const selectedDog = dogs.find(dog => dog.id === value);
      if (selectedDog) {
        setFormData(prev => ({
          ...prev,
          dogName: selectedDog.name,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields before submission
      const requiredFields = [
        'dogId', 'eventName', 'eventDate', 'category', 'ranking'
      ];
      
      const missingFields = requiredFields.filter(field => !formData[field as keyof CompetitionResultFormData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }
      
      // In a real application, we would submit to an API
      // For now, we'll simulate a successful submission
      console.log('Competition result data to submit:', formData);
      
      // Show success message
      alert('Competition result added successfully!');
      
      // Redirect to the competitions page
      router.push('/competitions');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred while adding the competition result');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // We already redirect in the useEffect, this is just a safeguard
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-white">Add Competition Result</h1>
              <Link
                href="/competitions"
                className="inline-flex items-center px-3 py-1.5 border border-white rounded-md text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Back to Competitions
              </Link>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Dog Selection */}
                <div>
                  <label htmlFor="dogId" className="block text-sm font-medium text-gray-700">
                    Select Dog <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="dogId"
                    name="dogId"
                    required
                    value={formData.dogId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                  >
                    <option value="">-- Select a dog --</option>
                    {dogs.map(dog => (
                      <option key={dog.id} value={dog.id}>
                        {dog.name} ({dog.breedObj?.name || dog.breed}) - {dog.registrationNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="eventName"
                      id="eventName"
                      required
                      value={formData.eventName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="e.g., National Dog Show 2025"
                    />
                  </div>
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      id="eventDate"
                      required
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="e.g., Madison Square Garden, New York"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Competition Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                    >
                      <option value="">-- Select a category --</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Competition Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="ranking" className="block text-sm font-medium text-gray-700">
                      Placement/Ranking <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ranking"
                      id="ranking"
                      required
                      value={formData.ranking}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="e.g., 1st Place, Best in Show, Qualified"
                    />
                  </div>
                  <div>
                    <label htmlFor="title_earned" className="block text-sm font-medium text-gray-700">
                      Title Earned
                    </label>
                    <input
                      type="text"
                      name="title_earned"
                      id="title_earned"
                      value={formData.title_earned}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      placeholder="e.g., CH, GCH, MACH"
                    />
                  </div>
                  <div>
                    <label htmlFor="judge" className="block text-sm font-medium text-gray-700">
                      Judge
                    </label>
                    <input
                      type="text"
                      name="judge"
                      id="judge"
                      value={formData.judge}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    placeholder="Any additional information about the competition performance..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Link
                    href="/competitions"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-3"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Add Competition Result'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
