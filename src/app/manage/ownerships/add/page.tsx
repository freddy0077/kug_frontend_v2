'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OwnershipFormData {
  dogId: string;
  dogName: string;
  previousOwnerId: string;
  previousOwnerName: string;
  newOwnerId: string;
  newOwnerName: string;
  transferDate: string;
  registrationNumber: string;
  transferReason: string;
  transferPrice: string;
  is_current: boolean; // Using correct field name as per memory
  notes: string;
}

// Sample data for dogs selection
const dogSampleData = [
  { id: '1', name: 'Max', breed: 'Golden Retriever', registrationNumber: 'PD-12345', currentOwner: 'John Smith' },
  { id: '2', name: 'Luna', breed: 'German Shepherd', registrationNumber: 'PD-67890', currentOwner: 'Sarah Johnson' },
  { id: '3', name: 'Charlie', breed: 'Labrador Retriever', registrationNumber: 'PD-54321', currentOwner: 'Michael Brown' },
];

// Sample data for owners selection
const ownerSampleData = [
  { id: '1', name: 'John Smith', email: 'john@example.com' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
  { id: '3', name: 'Michael Brown', email: 'michael@example.com' },
  { id: '4', name: 'Emma Davis', email: 'emma@example.com' },
  { id: '5', name: 'Robert Wilson', email: 'robert@example.com' },
];

export default function AddOwnership() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dogs, setDogs] = useState(dogSampleData);
  const [owners, setOwners] = useState(ownerSampleData);
  
  // Initialize form data
  const [formData, setFormData] = useState<OwnershipFormData>({
    dogId: '',
    dogName: '',
    previousOwnerId: '',
    previousOwnerName: '',
    newOwnerId: '',
    newOwnerName: '',
    transferDate: new Date().toISOString().split('T')[0], // Today's date as default
    registrationNumber: '',
    transferReason: '',
    transferPrice: '',
    is_current: true, // Using correct field name as per memory
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
    
    // Check if user has permission to add ownership records
    // Only owners, breeders, clubs, and admins can add ownership records
    const hasPermission = role === 'admin' || 
                          role === 'owner' || 
                          role === 'breeder' ||
                          role === 'club';
                          
    if (authStatus && !hasPermission) {
      // Redirect to dashboard if authenticated but doesn't have permission
      router.push('/manage');
      return;
    }

    // If user is an owner, pre-fill the previous owner information
    if (role === 'owner') {
      const userId = localStorage.getItem('userId') || '';
      const userName = localStorage.getItem('userName') || '';
      
      setFormData(prev => ({
        ...prev,
        previousOwnerId: userId,
        previousOwnerName: userName,
      }));
    }

    // In a real app, we would fetch dogs and owners from an API
    // For now, we'll use the sample data
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // If dogId changes, update the dogName and registrationNumber
    if (name === 'dogId') {
      const selectedDog = dogs.find(dog => dog.id === value);
      if (selectedDog) {
        setFormData(prev => ({
          ...prev,
          dogName: selectedDog.name,
          registrationNumber: selectedDog.registrationNumber,
          previousOwnerName: selectedDog.currentOwner,
        }));
      }
    }
    
    // If newOwnerId changes, update the newOwnerName
    if (name === 'newOwnerId') {
      const selectedOwner = owners.find(owner => owner.id === value);
      if (selectedOwner) {
        setFormData(prev => ({
          ...prev,
          newOwnerName: selectedOwner.name,
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
        'dogId', 'newOwnerId', 'transferDate', 'transferReason'
      ];
      
      const missingFields = requiredFields.filter(field => !formData[field as keyof OwnershipFormData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate that previous owner and new owner are different
      if (formData.previousOwnerId === formData.newOwnerId) {
        throw new Error('Previous owner and new owner cannot be the same person');
      }
      
      // In a real application, we would submit to an API
      // For now, we'll simulate a successful submission
      console.log('Ownership transfer data to submit:', formData);
      
      // Show success message
      alert('Ownership transfer recorded successfully!');
      
      // Redirect to the ownerships page
      router.push('/ownerships');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred while recording the ownership transfer');
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
              <h1 className="text-xl font-semibold text-white">Record Ownership Transfer</h1>
              <Link
                href="/ownerships"
                className="inline-flex items-center px-3 py-1.5 border border-white rounded-md text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Back to Ownerships
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
                        {dog.name} ({dog.breed}) - {dog.registrationNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Previous Owner Information - Auto-populated based on dog selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Current Owner Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="previousOwnerName" className="block text-sm font-medium text-gray-700">
                        Current Owner Name
                      </label>
                      <input
                        type="text"
                        id="previousOwnerName"
                        value={formData.previousOwnerName}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 text-gray-500 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Auto-populated based on dog selection</p>
                    </div>
                    <div>
                      <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 text-gray-500 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* New Owner Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">New Owner Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="newOwnerId" className="block text-sm font-medium text-gray-700">
                        New Owner <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="newOwnerId"
                        name="newOwnerId"
                        required
                        value={formData.newOwnerId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                      >
                        <option value="">-- Select new owner --</option>
                        {owners.map(owner => (
                          <option key={owner.id} value={owner.id}>
                            {owner.name} ({owner.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="transferDate" className="block text-sm font-medium text-gray-700">
                        Transfer Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="transferDate"
                        id="transferDate"
                        required
                        value={formData.transferDate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Transfer Details */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Transfer Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="transferReason" className="block text-sm font-medium text-gray-700">
                        Transfer Reason <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="transferReason"
                        name="transferReason"
                        required
                        value={formData.transferReason}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                      >
                        <option value="">-- Select reason --</option>
                        <option value="sale">Sale</option>
                        <option value="gift">Gift</option>
                        <option value="breeding_agreement">Breeding Agreement</option>
                        <option value="co_ownership">Co-Ownership</option>
                        <option value="inheritance">Inheritance</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="transferPrice" className="block text-sm font-medium text-gray-700">
                        Transfer Price
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="transferPrice"
                          id="transferPrice"
                          value={formData.transferPrice}
                          onChange={handleInputChange}
                          className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="is_current"
                            name="is_current"
                            type="checkbox"
                            checked={formData.is_current}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="is_current" className="font-medium text-gray-700">
                            This is the current active ownership record
                          </label>
                          <p className="text-gray-500">
                            Check this box if this is the most recent and active ownership record for this dog.
                          </p>
                        </div>
                      </div>
                    </div>
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
                    placeholder="Any additional information about the ownership transfer..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Link
                    href="/ownerships"
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
                      'Record Transfer'
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
