'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/utils/permissionUtils';
import { recordBreeding } from '@/utils/lineageUtils';
import { format } from 'date-fns';

type BreedingRecorderProps = {
  dogId: string;
  dogGender: 'male' | 'female';
  userRole: string;
  userId: string;
  ownerId: string;
};

type BreedingFormData = {
  breedingDate: string;
  partnerId: string;
  partnerName: string;
  litterSize?: number;
  breederId: string;
  breederName: string;
  expected: boolean;
  dateExpected?: string;
  puppies: PuppyData[];
};

type PuppyData = {
  name: string;
  gender: 'male' | 'female';
  color: string;
  microchipNumber?: string;
  ownerId?: string;
};

export default function BreedingRecorder({
  dogId,
  dogGender,
  userRole,
  userId,
  ownerId
}: BreedingRecorderProps) {
  const router = useRouter();
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [potentialPartners, setPotentialPartners] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState<BreedingFormData>({
    breedingDate: format(new Date(), 'yyyy-MM-dd'),
    partnerId: '',
    partnerName: '',
    litterSize: undefined,
    breederId: userId,
    breederName: '', // This would be filled from user data in a real app
    expected: false,
    puppies: []
  });

  useEffect(() => {
    // Check if user has permission to record breeding
    const canCreate = hasPermission(userRole, 'dog', 'create', ownerId, userId);
    setHasCreatePermission(canCreate);

    if (canCreate) {
      fetchPotentialPartners();
    }
    
    // Set default breeder name based on current user
    // In a real app, this would fetch the user's name
    setFormData(prev => ({
      ...prev,
      breederName: userRole === 'breeder' ? 'Jane Smith' : 'Current User'
    }));
  }, [dogId, userRole, userId, ownerId, dogGender]);

  const fetchPotentialPartners = async () => {
    try {
      // In a real app, this would fetch potential breeding partners based on breed and age
      // For now, we'll use mock data
      
      // If the current dog is male, we fetch female partners and vice versa
      const mockPartners = dogGender === 'male' 
        ? [
            { id: 'partner1', name: 'Bella' },
            { id: 'partner2', name: 'Luna' },
            { id: 'partner3', name: 'Daisy' }
          ]
        : [
            { id: 'partner4', name: 'Max' },
            { id: 'partner5', name: 'Duke' },
            { id: 'partner6', name: 'Rex' }
          ];
      
      setPotentialPartners(mockPartners);
    } catch (err) {
      console.error('Error fetching potential partners:', err);
      setError('Failed to load potential breeding partners');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Handle partner selection
    if (name === 'partnerId' && value) {
      const selectedPartner = potentialPartners.find(partner => partner.id === value);
      if (selectedPartner) {
        setFormData(prev => ({
          ...prev,
          partnerId: value,
          partnerName: selectedPartner.name
        }));
        return;
      }
    }
    
    // Handle other inputs
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePuppyChange = (index: number, field: keyof PuppyData, value: string) => {
    const updatedPuppies = [...formData.puppies];
    
    // Handle gender selection
    if (field === 'gender') {
      updatedPuppies[index][field] = value as 'male' | 'female';
    } else {
      // @ts-ignore - This is safe as we know the fields are strings
      updatedPuppies[index][field] = value;
    }
    
    setFormData(prev => ({
      ...prev,
      puppies: updatedPuppies
    }));
  };

  const addPuppy = () => {
    setFormData(prev => ({
      ...prev,
      puppies: [
        ...prev.puppies,
        {
          name: '',
          gender: 'male',
          color: '',
          microchipNumber: '',
          ownerId: userId // Default owner is current user
        }
      ]
    }));
  };

  const removePuppy = (index: number) => {
    const updatedPuppies = [...formData.puppies];
    updatedPuppies.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      puppies: updatedPuppies
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form data
      if (!formData.partnerId) {
        setError('Please select a breeding partner');
        setLoading(false);
        return;
      }
      
      if (!formData.breedingDate) {
        setError('Please select a breeding date');
        setLoading(false);
        return;
      }
      
      if (formData.expected && !formData.dateExpected) {
        setError('Please enter an expected whelping date');
        setLoading(false);
        return;
      }
      
      if (!formData.expected && formData.puppies.length === 0) {
        setError('Please add at least one puppy to the litter');
        setLoading(false);
        return;
      }
      
      // Prepare data for API call
      const breedingData = {
        sireId: dogGender === 'male' ? dogId : formData.partnerId,
        damId: dogGender === 'female' ? dogId : formData.partnerId,
        breederId: formData.breederId,
        breedingDate: new Date(formData.breedingDate),
        litterSize: formData.litterSize,
        expected: formData.expected,
        puppies: formData.puppies
      };
      
      // Record the breeding
      const result = await recordBreeding(breedingData);
      
      if (result.success) {
        setSuccess(true);
        
        // Redirect to the dog's pedigree page after a delay
        setTimeout(() => {
          router.push(`/manage/dogs/${dogId}/pedigree`);
        }, 2000);
      } else {
        setError(result.message || 'Failed to record breeding');
      }
    } catch (err) {
      console.error('Error recording breeding:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasCreatePermission) {
    return (
      <div className="bg-red-50 border border-red-300 p-4 rounded-md">
        <p className="text-red-700">
          You do not have permission to record breeding information.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Record Breeding
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {dogGender === 'male' ? 'Sire' : 'Dam'}: {dogId}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200">
        {success ? (
          <div className="bg-green-50 border border-green-300 p-4 m-4 rounded-md">
            <p className="text-green-700">
              Breeding recorded successfully! Redirecting...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {error && (
              <div className="bg-red-50 border border-red-300 p-4 mb-4 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Breeding Partner */}
              <div>
                <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700">
                  Breeding Partner ({dogGender === 'male' ? 'Dam' : 'Sire'})
                </label>
                <select
                  id="partnerId"
                  name="partnerId"
                  value={formData.partnerId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Select a partner</option>
                  {potentialPartners.map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Breeding Date */}
              <div>
                <label htmlFor="breedingDate" className="block text-sm font-medium text-gray-700">
                  Breeding Date
                </label>
                <input
                  type="date"
                  id="breedingDate"
                  name="breedingDate"
                  value={formData.breedingDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              {/* Breeder Information */}
              <div>
                <label htmlFor="breederName" className="block text-sm font-medium text-gray-700">
                  Breeder Name
                </label>
                <input
                  type="text"
                  id="breederName"
                  name="breederName"
                  value={formData.breederName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              {/* Expected Litter vs. Born Litter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="expected"
                  name="expected"
                  checked={formData.expected}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="expected" className="ml-2 block text-sm text-gray-700">
                  This is an expected litter (not yet born)
                </label>
              </div>
              
              {/* Expected Whelping Date - Only shown if expected is true */}
              {formData.expected && (
                <div>
                  <label htmlFor="dateExpected" className="block text-sm font-medium text-gray-700">
                    Expected Whelping Date
                  </label>
                  <input
                    type="date"
                    id="dateExpected"
                    name="dateExpected"
                    value={formData.dateExpected || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required={formData.expected}
                  />
                </div>
              )}
              
              {/* Litter Size */}
              <div>
                <label htmlFor="litterSize" className="block text-sm font-medium text-gray-700">
                  Litter Size
                </label>
                <input
                  type="number"
                  id="litterSize"
                  name="litterSize"
                  value={formData.litterSize || ''}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            {/* Puppies Section - Only shown if not an expected litter */}
            {!formData.expected && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Puppies</h4>
                  <button
                    type="button"
                    onClick={addPuppy}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Puppy
                  </button>
                </div>
                
                {formData.puppies.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No puppies added yet. Click "Add Puppy" to begin recording the litter.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.puppies.map((puppy, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-sm font-medium text-gray-900">Puppy #{index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removePuppy(index)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Name
                            </label>
                            <input
                              type="text"
                              value={puppy.name}
                              onChange={(e) => handlePuppyChange(index, 'name', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Gender
                            </label>
                            <select
                              value={puppy.gender}
                              onChange={(e) => handlePuppyChange(index, 'gender', e.target.value)}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                              required
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Color
                            </label>
                            <input
                              type="text"
                              value={puppy.color}
                              onChange={(e) => handlePuppyChange(index, 'color', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Microchip Number (optional)
                            </label>
                            <input
                              type="text"
                              value={puppy.microchipNumber || ''}
                              onChange={(e) => handlePuppyChange(index, 'microchipNumber', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Recording...' : 'Record Breeding'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
