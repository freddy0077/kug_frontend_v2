'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DogFormData {
  name: string;
  breed: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  dateOfDeath: string;
  color: string;
  registrationNumber: string;
  microchipNumber: string;
  breederId: string;
  breederName: string;
  ownerId: string;
  ownerName: string;
  sireId: string;
  sireName: string;
  damId: string;
  damName: string;
  description: string;
}

export default function AddDog() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form data
  const [formData, setFormData] = useState<DogFormData>({
    name: '',
    breed: '',
    gender: 'male',
    dateOfBirth: '',
    dateOfDeath: '',
    color: '',
    registrationNumber: '',
    microchipNumber: '',
    breederId: '',
    breederName: '',
    ownerId: '',
    ownerName: '',
    sireId: '',
    sireName: '',
    damId: '',
    damName: '',
    description: '',
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
    
    // Check if user has permission to add dogs
    // Only breeders, owners, and admins can add dogs
    const hasPermission = role === 'admin' || 
                         role === 'breeder' || 
                         role === 'owner';
                          
    if (authStatus && !hasPermission) {
      // Redirect to dashboard if authenticated but doesn't have permission
      router.push('/manage');
      return;
    }

    // Pre-populate breeder/owner information based on user role
    if (authStatus) {
      const userId = localStorage.getItem('userId') || '';
      const userName = localStorage.getItem('userName') || '';
      
      if (role === 'breeder') {
        setFormData(prev => ({
          ...prev,
          breederId: userId,
          breederName: userName,
        }));
      } else if (role === 'owner') {
        setFormData(prev => ({
          ...prev,
          ownerId: userId,
          ownerName: userName,
        }));
      }
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields before submission
      const requiredFields = [
        'name', 'breed', 'gender', 'dateOfBirth', 
        'registrationNumber', 'color'
      ];
      
      const missingFields = requiredFields.filter(field => !formData[field as keyof DogFormData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate dateOfBirth to ensure it's never undefined (as per memory)
      const dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date();
      
      // Validate dateOfDeath if provided
      let dateOfDeath = undefined;
      if (formData.dateOfDeath) {
        dateOfDeath = new Date(formData.dateOfDeath);
        
        // Check that dateOfDeath is after dateOfBirth
        if (dateOfDeath < dateOfBirth) {
          throw new Error('Date of death cannot be earlier than date of birth');
        }
      }
      
      // Gender validation with better error reporting (as per memory)
      if (formData.gender !== 'male' && formData.gender !== 'female') {
        throw new Error('Gender must be either "male" or "female"');
      }
      
      // In a real application, we would submit to an API
      // For now, we'll simulate a successful submission
      console.log('Dog data to submit:', {
        ...formData,
        dateOfBirth, // Using validated date object
        dateOfDeath, // Using validated date object or undefined
      });
      
      // Show success message
      alert('Dog added successfully!');
      
      // Redirect to the dogs management page
      router.push('/manage/dogs');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred while adding the dog');
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-white">Add New Dog</h1>
              <Link
                href="/manage/dogs"
                className="inline-flex items-center px-3 py-1.5 border border-white rounded-md text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Back to Dogs
              </Link>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Dog Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                        Breed <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="breed"
                        id="breed"
                        required
                        value={formData.breed}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        required
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                        Color <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="color"
                        id="color"
                        required
                        value={formData.color}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        id="dateOfBirth"
                        required
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="dateOfDeath" className="block text-sm font-medium text-gray-700">
                        Date of Death (if applicable)
                      </label>
                      <input
                        type="date"
                        name="dateOfDeath"
                        id="dateOfDeath"
                        value={formData.dateOfDeath}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Registration Information</h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                        Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="registrationNumber"
                        id="registrationNumber"
                        required
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="microchipNumber" className="block text-sm font-medium text-gray-700">
                        Microchip Number
                      </label>
                      <input
                        type="text"
                        name="microchipNumber"
                        id="microchipNumber"
                        value={formData.microchipNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Ownership & Breeder Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Ownership & Breeder Information</h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label htmlFor="breederName" className="block text-sm font-medium text-gray-700">
                        Breeder Name
                      </label>
                      <input
                        type="text"
                        name="breederName"
                        id="breederName"
                        value={formData.breederName}
                        onChange={handleInputChange}
                        disabled={userRole === 'breeder'}
                        className={`mt-1 block w-full rounded-md ${
                          userRole === 'breeder' 
                            ? 'bg-gray-100 border-gray-300' 
                            : 'border-gray-300'
                        } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm`}
                      />
                      {userRole === 'breeder' && (
                        <p className="mt-1 text-xs text-gray-500">Auto-filled with your information as the breeder</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">
                        Owner Name
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        id="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        disabled={userRole === 'owner'}
                        className={`mt-1 block w-full rounded-md ${
                          userRole === 'owner' 
                            ? 'bg-gray-100 border-gray-300' 
                            : 'border-gray-300'
                        } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm`}
                      />
                      {userRole === 'owner' && (
                        <p className="mt-1 text-xs text-gray-500">Auto-filled with your information as the owner</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pedigree Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Pedigree Information</h2>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label htmlFor="sireName" className="block text-sm font-medium text-gray-700">
                        Sire (Father) Name
                      </label>
                      <input
                        type="text"
                        name="sireName"
                        id="sireName"
                        value={formData.sireName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="damName" className="block text-sm font-medium text-gray-700">
                        Dam (Mother) Name
                      </label>
                      <input
                        type="text"
                        name="damName"
                        id="damName"
                        value={formData.damName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Additional Information</h2>
                  <div className="mt-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/manage/dogs')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-3"
                  >
                    Cancel
                  </button>
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
                      'Add Dog'
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
