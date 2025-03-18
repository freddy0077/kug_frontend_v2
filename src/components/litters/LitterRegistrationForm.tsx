'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useQuery } from '@apollo/client';
import { useCreateLitter } from '@/hooks/useLitters';
import type { LitterInput } from '@/graphql/mutations/litterMutations';
import { GET_DOGS, DogSortField, SortDirection } from '@/graphql/queries/dogQueries';
import { GET_BREEDING_RECORDS } from '@/graphql/queries/pedigreeQueries';
import { UserRole } from '@/utils/permissionUtils';
import DogSearchSelect from '@/components/common/DogSearchSelect';

interface LitterRegistrationFormProps {
  breedingId?: string;
  initialSireId?: string;
  initialDamId?: string;
  userRole: UserRole;
  userId: string;
  onSuccess?: (litterId: string) => void;
}

const LitterRegistrationForm: React.FC<LitterRegistrationFormProps> = ({
  breedingId,
  initialSireId,
  initialDamId,
  userRole,
  userId,
  onSuccess
}) => {
  const router = useRouter();
  
  // Define puppy detail interface
  interface PuppyDetail {
    name: string;
    gender: 'male' | 'female';
    color?: string;
    markings?: string;
    microchipNumber?: string;
    isCollapsed?: boolean;
  }

  // Define registration types
  type RegistrationType = 'basic' | 'detailed';

  // Form state
  const [registrationType, setRegistrationType] = useState<RegistrationType>('basic');
  
  // Form step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = registrationType === 'detailed' ? 4 : 3;
  
  const [formData, setFormData] = useState<Omit<LitterInput, 'sireId' | 'damId'> & {
    sireId: string;
    damId: string;
    puppyDetails?: PuppyDetail[];
  }>({
    sireId: initialSireId || '',
    damId: initialDamId || '',
    breedingRecordId: breedingId || '',
    litterName: '',
    whelpingDate: '',
    totalPuppies: 0,
    malePuppies: 0,
    femalePuppies: 0,
    notes: '',
    puppyDetails: []
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBreedingRecord, setHasBreedingRecord] = useState(!!breedingId);
  
  // Fetch dogs for sire/dam selection
  const { loading: dogsLoading, data: dogsData } = useQuery(GET_DOGS, {
    variables: { 
      limit: 100,
      sortBy: DogSortField.DATE_OF_BIRTH,
      sortDirection: SortDirection.DESC
    }
  });
  
  // If a breeding ID is provided, fetch that breeding record
  const { loading: breedingLoading, data: breedingData } = useQuery(GET_BREEDING_RECORDS, {
    variables: { dogId: initialSireId || '0', limit: 100 },
    skip: !breedingId,
    onCompleted: (data) => {
      if (data?.breedingRecords?.items?.length) {
        const record = data.breedingRecords.items.find(
          (item: any) => item.id === breedingId
        );
        
        if (record) {
          setFormData(prev => ({
            ...prev,
            sireId: record.sire.id,
            damId: record.dam.id,
            breedingRecordId: breedingId || '',
            // If breeding date is available, default whelping date to ~63 days later (average gestation)
            whelpingDate: record.breedingDate 
              ? new Date(new Date(record.breedingDate).getTime() + 63 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              : '',
          }));
        }
      }
    }
  });
  
  // Create litter mutation using custom hook
  const [createLitter, { loading: createLoading }] = useCreateLitter();
  
  // Filter available dogs list - males as sires, females as dams
  const maleDogs = dogsData?.dogs?.items.filter((dog: any) => dog.gender === 'male') || [];
  const femaleDogs = dogsData?.dogs?.items.filter((dog: any) => dog.gender === 'female') || [];
  
  // Handle registration type change
  const handleRegistrationTypeChange = (type: RegistrationType) => {
    setRegistrationType(type);
    
    // If switching to detailed registration, ensure we have puppy details
    if (type === 'detailed') {
      // Create puppies array directly here rather than using formData values which might have timing issues
      let totalToCreate = formData.totalPuppies;
      let maleToCreate = formData.malePuppies;
      
      // If no puppies are set, add one default puppy
      if (totalToCreate === 0) {
        totalToCreate = 1;
        maleToCreate = 1;
      }
      
      // Create the puppy details array directly
      const newPuppyDetails: PuppyDetail[] = [];
      
      // Add male puppies
      for (let i = 0; i < maleToCreate; i++) {
        newPuppyDetails.push({
          name: '',
          gender: 'male',
          color: '',
          markings: '',
          microchipNumber: ''
        });
      }
      
      // Add female puppies
      for (let i = 0; i < (totalToCreate - maleToCreate); i++) {
        newPuppyDetails.push({
          name: '',
          gender: 'female',
          color: '',
          markings: '',
          microchipNumber: ''
        });
      }
      
      // Update both counts and puppy details at once to ensure consistency
      setFormData(prev => ({
        ...prev,
        totalPuppies: totalToCreate,
        malePuppies: maleToCreate,
        femalePuppies: totalToCreate - maleToCreate,
        puppyDetails: newPuppyDetails
      }));
      
      console.log('Setting puppy details:', newPuppyDetails);
    }
  };

  // Generate initial puppy details based on counts
  const generatePuppyDetails = () => {
    const totalCount = formData.totalPuppies;
    const maleCount = formData.malePuppies;
    const femaleCount = formData.femalePuppies;
    
    const puppies: PuppyDetail[] = [];
    
    // Add male puppies
    for (let i = 0; i < maleCount; i++) {
      puppies.push({
        name: '',
        gender: 'male',
        color: '',
        markings: '',
        microchipNumber: '',
        isCollapsed: false
      });
    }
    
    // Add female puppies
    for (let i = 0; i < femaleCount; i++) {
      puppies.push({
        name: '',
        gender: 'female',
        color: '',
        markings: '',
        microchipNumber: '',
        isCollapsed: false
      });
    }
    
    return puppies;
  };
  
  // Function to update the current step in the form process
  const updateStep = (step: number) => {
    setCurrentStep(step);
  };
  
  // Toggle collapse state for puppy details section
  const togglePuppyCollapse = (index: number) => {
    setFormData(prev => {
      if (!prev.puppyDetails) return prev;
      
      const updatedPuppyDetails = [...prev.puppyDetails];
      updatedPuppyDetails[index] = {
        ...updatedPuppyDetails[index],
        isCollapsed: !updatedPuppyDetails[index].isCollapsed
      };
      
      return {
        ...prev,
        puppyDetails: updatedPuppyDetails
      };
    });
  };
  
  // Apply a value to all puppies of the same gender
  const applyToAll = (field: 'color' | 'markings' | 'microchipNumber', value: string, gender?: 'male' | 'female') => {
    setFormData(prev => {
      if (!prev.puppyDetails) return prev;
      
      const updatedPuppyDetails = prev.puppyDetails.map(puppy => {
        // Only update puppies of the specified gender, or all if no gender specified
        if (!gender || puppy.gender === gender) {
          return {
            ...puppy,
            [field]: value
          };
        }
        return puppy;
      });
      
      return {
        ...prev,
        puppyDetails: updatedPuppyDetails
      };
    });
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs for puppy counts with state batching
    if (type === 'number' && (name === 'totalPuppies' || name === 'malePuppies' || name === 'femalePuppies')) {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      
      // Handle the different puppy count fields
      if (name === 'malePuppies' || name === 'femalePuppies') {
        // Get the current values
        const males = name === 'malePuppies' ? numValue : formData.malePuppies;
        const females = name === 'femalePuppies' ? numValue : formData.femalePuppies;
        const newTotal = males + females;
        
        // Update all related fields at once
        setFormData(prev => {
          const updated = {
            ...prev,
            [name]: numValue,
            totalPuppies: newTotal
          };
          
          // If in detailed registration mode, regenerate puppy details
          if (registrationType === 'detailed') {
            // Create puppy details with the new counts
            const newPuppyDetails: PuppyDetail[] = [];
            
            // Add male puppies
            for (let i = 0; i < males; i++) {
              // Preserve existing male puppy details if possible
              if (prev.puppyDetails && i < prev.puppyDetails.length && prev.puppyDetails[i].gender === 'male') {
                newPuppyDetails.push(prev.puppyDetails[i]);
              } else {
                newPuppyDetails.push({
                  name: '',
                  gender: 'male',
                  color: '',
                  markings: '',
                  microchipNumber: '',
                  isCollapsed: false
                });
              }
            }
            
            // Add female puppies
            for (let i = 0; i < females; i++) {
              // Try to find and preserve existing female puppy details
              const existingFemaleIndex = prev.puppyDetails ? 
                prev.puppyDetails.findIndex((p, idx) => p.gender === 'female' && 
                                            !newPuppyDetails.some(np => np === p)) : -1;
              
              if (existingFemaleIndex !== -1) {
                newPuppyDetails.push(prev.puppyDetails![existingFemaleIndex]);
              } else {
                newPuppyDetails.push({
                  name: '',
                  gender: 'female',
                  color: '',
                  markings: '',
                  microchipNumber: '',
                  isCollapsed: false
                });
              }
            }
            
            updated.puppyDetails = newPuppyDetails;
          }
          
          return updated;
        });
        
        return;
      } else if (name === 'totalPuppies') {
        // When total puppies changes directly
        const newTotal = numValue;
        
        // Distribute between male and female
        let newMales = 0;
        let newFemales = 0;
        
        const currentTotal = formData.malePuppies + formData.femalePuppies;
        
        if (currentTotal > 0) {
          // Maintain current ratio if possible
          const maleRatio = formData.malePuppies / currentTotal;
          newMales = Math.round(newTotal * maleRatio);
          newFemales = newTotal - newMales;
        } else {
          // Default to even split
          newMales = Math.floor(newTotal / 2);
          newFemales = newTotal - newMales;
        }
        
        // Update all related fields at once
        setFormData(prev => {
          const updated = {
            ...prev,
            totalPuppies: newTotal,
            malePuppies: newMales,
            femalePuppies: newFemales
          };
          
          // If in detailed registration mode, regenerate puppy details
          if (registrationType === 'detailed') {
            // Create puppy details with the new counts
            const newPuppyDetails: PuppyDetail[] = [];
            
            // Add male puppies
            for (let i = 0; i < newMales; i++) {
              // Preserve existing male puppy details if possible
              if (prev.puppyDetails && i < prev.puppyDetails.length && prev.puppyDetails[i].gender === 'male') {
                newPuppyDetails.push(prev.puppyDetails[i]);
              } else {
                newPuppyDetails.push({
                  name: '',
                  gender: 'male',
                  color: '',
                  markings: '',
                  microchipNumber: '',
                  isCollapsed: false
                });
              }
            }
            
            // Add female puppies
            for (let i = 0; i < newFemales; i++) {
              // Find existing female details to preserve if possible
              const existingFemaleIndex = prev.puppyDetails ? 
                prev.puppyDetails.findIndex((p, idx) => p.gender === 'female' && 
                                            !newPuppyDetails.some(np => np === p)) : -1;
              
              if (existingFemaleIndex !== -1) {
                newPuppyDetails.push(prev.puppyDetails![existingFemaleIndex]);
              } else {
                newPuppyDetails.push({
                  name: '',
                  gender: 'female',
                  color: '',
                  markings: '',
                  microchipNumber: '',
                  isCollapsed: false
                });
              }
            }
            
            updated.puppyDetails = newPuppyDetails;
          }
          
          return updated;
        });
        
        return;
      }
    }
    
    // Handle all other inputs (non-puppy count fields)
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseInt(value, 10)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle puppy detail changes
  const handlePuppyDetailChange = (index: number, field: keyof PuppyDetail, value: string) => {
    setFormData(prev => {
      const updatedPuppyDetails = [...(prev.puppyDetails || [])];
      updatedPuppyDetails[index] = {
        ...updatedPuppyDetails[index],
        [field]: value
      };
      return {
        ...prev,
        puppyDetails: updatedPuppyDetails
      };
    });
  };
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.sireId) {
      errors.sireId = 'Sire is required';
    }
    
    if (!formData.damId) {
      errors.damId = 'Dam is required';
    }
    
    if (!formData.litterName.trim()) {
      errors.litterName = 'Litter name is required';
    }
    
    if (!formData.whelpingDate) {
      errors.whelpingDate = 'Whelping date is required';
    } else {
      // Ensure whelping date is not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const whelpingDate = new Date(formData.whelpingDate);
      
      if (whelpingDate > today) {
        errors.whelpingDate = 'Whelping date cannot be in the future';
      }
    }
    
    if (formData.totalPuppies < 0) {
      errors.totalPuppies = 'Number of puppies cannot be negative';
    }
    
    if (formData.malePuppies < 0) {
      errors.malePuppies = 'Number of male puppies cannot be negative';
    }
    
    if (formData.femalePuppies < 0) {
      errors.femalePuppies = 'Number of female puppies cannot be negative';
    }
    
    // Validate puppy details for detailed registration
    if (registrationType === 'detailed' && formData.puppyDetails) {
      formData.puppyDetails.forEach((puppy, index) => {
        if (!puppy.name.trim()) {
          errors[`puppyName${index}`] = `Name for puppy #${index + 1} is required`;
        }
      });
    }
    
    if (formData.malePuppies + formData.femalePuppies !== formData.totalPuppies) {
      errors.totalPuppies = 'Male + female puppies must equal total puppies';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create base input without puppyDetails field
      const { puppyDetails, ...baseData } = formData;
      
      const input: any = {
        ...baseData,
        // Ensure whelping date is a valid date
        whelpingDate: new Date(formData.whelpingDate).toISOString(),
      };
      
      // If using detailed registration and have puppy details, include them
      if (registrationType === 'detailed' && puppyDetails && puppyDetails.length > 0) {
        input.puppyDetails = puppyDetails;
      }
      
      await createLitter({
        variables: { input }
      });
      
      toast.success('Litter registered successfully!');
    } catch (error: any) {
      toast.error(`An error occurred: ${error.message}`);
      setIsSubmitting(false);
    }
  };
  
  // If user doesn't have appropriate role, show error
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.OWNER) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You don't have permission to register litters. Please contact an administrator or owner.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Register New Litter</h2>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to register a new litter of puppies.
        </p>
        
        {/* Progress indicator */}
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-blue-700">
                Step {currentStep} of {totalSteps}
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-blue-700">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
              <div 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
              ></div>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-500">Basic Info</span>
            {registrationType === 'detailed' ? (
              <>
                <span className="text-xs text-gray-500">Puppy Count</span>
                <span className="text-xs text-gray-500">Parents</span>
                <span className="text-xs text-gray-500">Puppy Details</span>
              </>
            ) : (
              <>
                <span className="text-xs text-gray-500">Parents</span>
                <span className="text-xs text-gray-500">Review</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Registration Type Selector */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Registration Type</h3>
          <div className="flex space-x-4">
            <div
              onClick={() => handleRegistrationTypeChange('basic')}
              className={`cursor-pointer p-4 rounded-lg border ${registrationType === 'basic' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} flex-1`}
            >
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full ${registrationType === 'basic' ? 'bg-blue-500' : 'bg-gray-300'} mr-2`}></div>
                <h4 className="font-medium">Basic Registration</h4>
              </div>
              <p className="mt-2 text-sm text-gray-600">Just register the litter with basic puppy count information.</p>
            </div>
            
            <div
              onClick={() => handleRegistrationTypeChange('detailed')}
              className={`cursor-pointer p-4 rounded-lg border ${registrationType === 'detailed' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} flex-1`}
            >
              <div className="flex items-center">
                <div className={`h-4 w-4 rounded-full ${registrationType === 'detailed' ? 'bg-blue-500' : 'bg-gray-300'} mr-2`}></div>
                <h4 className="font-medium">Detailed Registration</h4>
              </div>
              <p className="mt-2 text-sm text-gray-600">Register individual puppies with names and details.</p>
            </div>
          </div>
        </div>
        {/* Breeding Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sire Selection */}
            <DogSearchSelect
              label="Sire (Father)"
              placeholder="Search for a male dog..."
              value={formData.sireId}
              onChange={(dogId) => {
                setFormData(prev => ({
                  ...prev,
                  sireId: dogId
                }));
              }}
              error={formErrors.sireId}
              required={true}
              filterGender="MALE"
              className="w-full"
              excludeIds={formData.damId ? [formData.damId] : []}
              disabled={!!breedingId || !!initialSireId}
            />
            
            {/* Dam Selection */}
            <DogSearchSelect
              label="Dam (Mother)"
              placeholder="Search for a female dog..."
              value={formData.damId}
              onChange={(dogId) => {
                setFormData(prev => ({
                  ...prev,
                  damId: dogId
                }));
              }}
              error={formErrors.damId}
              required={true}
              filterGender="FEMALE"
              className="w-full"
              excludeIds={formData.sireId ? [formData.sireId] : []}
              disabled={!!breedingId || !!initialDamId}
            />
          </div>
        </div>
        
        {/* Litter Information */}
        <div onFocus={() => updateStep(2)}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Litter Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Litter Name */}
            <div>
              <label htmlFor="litterName" className="block text-sm font-medium text-gray-700 mb-1">
                Litter Name/Identifier <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="litterName"
                name="litterName"
                value={formData.litterName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.litterName 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="e.g. Litter A or Spring 2025"
              />
              {formErrors.litterName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.litterName}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                A unique identifier for this litter, such as a letter or seasonal reference
              </p>
            </div>
            
            {/* Registration Number (Optional) */}
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Official litter registration number"
              />
              <p className="mt-1 text-xs text-gray-500">
                If registered with a kennel club (optional)
              </p>
            </div>
            
            {/* Whelping Date */}
            <div>
              <label htmlFor="whelpingDate" className="block text-sm font-medium text-gray-700 mb-1">
                Whelping Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="whelpingDate"
                name="whelpingDate"
                value={formData.whelpingDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.whelpingDate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formErrors.whelpingDate && (
                <p className="mt-1 text-sm text-red-600">{formErrors.whelpingDate}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Date when the puppies were born
              </p>
            </div>
          </div>
        </div>
        
        {/* Puppy Count Information */}
        <div onFocus={() => updateStep(3)}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Puppy Count</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Puppies */}
            <div>
              <label htmlFor="totalPuppies" className="block text-sm font-medium text-gray-700 mb-1">
                Total Puppies
              </label>
              <input
                type="number"
                id="totalPuppies"
                name="totalPuppies"
                value={formData.totalPuppies}
                onChange={handleChange}
                min="0"
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.totalPuppies 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formErrors.totalPuppies && (
                <p className="mt-1 text-sm text-red-600">{formErrors.totalPuppies}</p>
              )}
            </div>
            
            {/* Male Puppies */}
            <div>
              <label htmlFor="malePuppies" className="block text-sm font-medium text-gray-700 mb-1">
                Male Puppies
              </label>
              <input
                type="number"
                id="malePuppies"
                name="malePuppies"
                value={formData.malePuppies}
                onChange={handleChange}
                min="0"
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.malePuppies 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formErrors.malePuppies && (
                <p className="mt-1 text-sm text-red-600">{formErrors.malePuppies}</p>
              )}
            </div>
            
            {/* Female Puppies */}
            <div>
              <label htmlFor="femalePuppies" className="block text-sm font-medium text-gray-700 mb-1">
                Female Puppies
              </label>
              <input
                type="number"
                id="femalePuppies"
                name="femalePuppies"
                value={formData.femalePuppies}
                onChange={handleChange}
                min="0"
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  formErrors.femalePuppies 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {formErrors.femalePuppies && (
                <p className="mt-1 text-sm text-red-600">{formErrors.femalePuppies}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Individual Puppy Details - Only show for detailed registration */}
        {registrationType === 'detailed' && (
          <div onFocus={() => updateStep(4)}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Individual Puppy Details</h3>
            <p className="mb-4 text-sm text-gray-600">
              Enter details for each puppy in the litter. These puppies will be automatically created in the system.
            </p>
            
            <div className="space-y-6">
              {formData.puppyDetails.map((puppy, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div 
                    className="flex justify-between items-center cursor-pointer" 
                    onClick={() => togglePuppyCollapse(index)}
                  >
                    <h4 className="font-medium text-gray-900">
                      Puppy #{index + 1} 
                      <span className={puppy.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}>
                        {puppy.gender === 'male' ? ' ♂ Male' : ' ♀ Female'}
                      </span>
                      {puppy.name && ` - ${puppy.name}`}
                    </h4>
                    <span className="text-gray-500">
                      {puppy.isCollapsed ? '▼ Show Details' : '▲ Hide Details'}
                    </span>
                  </div>
                  
                  {!puppy.isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      {/* Puppy Name */}
                      <div>
                        <label htmlFor={`puppy-name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`puppy-name-${index}`}
                          value={puppy.name}
                          onChange={(e) => handlePuppyDetailChange(index, 'name', e.target.value)}
                          className={`mt-1 block w-full rounded-md shadow-sm ${formErrors[`puppyName${index}`] ? 'border-red-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                          placeholder={`${puppy.gender === 'male' ? 'Male' : 'Female'} puppy name`}
                        />
                        {formErrors[`puppyName${index}`] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[`puppyName${index}`]}</p>
                        )}
                      </div>
                      
                      {/* Coat Color */}
                      <div>
                        <label htmlFor={`puppy-color-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Coat Color
                        </label>
                        <input
                          type="text"
                          id={`puppy-color-${index}`}
                          value={puppy.color || ''}
                          onChange={(e) => handlePuppyDetailChange(index, 'color', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="E.g., Black, Brown, Brindle"
                        />
                      </div>
                      
                      {/* Markings */}
                      <div>
                        <label htmlFor={`puppy-markings-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Markings
                        </label>
                        <input
                          type="text"
                          id={`puppy-markings-${index}`}
                          value={puppy.markings || ''}
                          onChange={(e) => handlePuppyDetailChange(index, 'markings', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="E.g., White chest, Tan points"
                        />
                      </div>
                      
                      {/* Microchip Number */}
                      <div>
                        <label htmlFor={`puppy-microchip-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Microchip Number
                        </label>
                        <input
                          type="text"
                          id={`puppy-microchip-${index}`}
                          value={puppy.microchipNumber || ''}
                          onChange={(e) => handlePuppyDetailChange(index, 'microchipNumber', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Microchip identification number if available"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Bulk Actions */}
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Bulk Actions</h4>
                <div className="space-y-4">
                  {/* Coat Color Bulk Action */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apply Coat Color to All</label>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Enter coat color" 
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        id="bulk-color"
                      />
                      <div className="flex space-x-1">
                        <button 
                          type="button" 
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
                          onClick={() => {
                            const colorValue = (document.getElementById('bulk-color') as HTMLInputElement).value;
                            applyToAll('color', colorValue, 'male');
                          }}
                        >
                          ♂ Males
                        </button>
                        <button 
                          type="button" 
                          className="px-3 py-1 bg-pink-100 text-pink-800 rounded hover:bg-pink-200 text-sm"
                          onClick={() => {
                            const colorValue = (document.getElementById('bulk-color') as HTMLInputElement).value;
                            applyToAll('color', colorValue, 'female');
                          }}
                        >
                          ♀ Females
                        </button>
                        <button 
                          type="button" 
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
                          onClick={() => {
                            const colorValue = (document.getElementById('bulk-color') as HTMLInputElement).value;
                            applyToAll('color', colorValue);
                          }}
                        >
                          All
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Markings Bulk Action */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apply Markings to All</label>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Enter markings" 
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        id="bulk-markings"
                      />
                      <div className="flex space-x-1">
                        <button 
                          type="button" 
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
                          onClick={() => {
                            const value = (document.getElementById('bulk-markings') as HTMLInputElement).value;
                            applyToAll('markings', value, 'male');
                          }}
                        >
                          ♂ Males
                        </button>
                        <button 
                          type="button" 
                          className="px-3 py-1 bg-pink-100 text-pink-800 rounded hover:bg-pink-200 text-sm"
                          onClick={() => {
                            const value = (document.getElementById('bulk-markings') as HTMLInputElement).value;
                            applyToAll('markings', value, 'female');
                          }}
                        >
                          ♀ Females
                        </button>
                        <button 
                          type="button" 
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
                          onClick={() => {
                            const value = (document.getElementById('bulk-markings') as HTMLInputElement).value;
                            applyToAll('markings', value);
                          }}
                        >
                          All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Any additional information about this litter..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional notes about the litter, birth conditions, special care requirements, etc.
          </p>
        </div>
        
        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Link 
            href="/litters"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Registering...' : 'Register Litter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LitterRegistrationForm;
