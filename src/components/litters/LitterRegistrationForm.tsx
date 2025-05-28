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
import UserSearchSelect from '@/components/common/UserSearchSelect';

interface LitterRegistrationFormProps {
  breedingId?: string;
  initialSireId?: string;
  initialDamId?: string;
  userRole: UserRole;
  userId: string;
  onSuccess?: (litterId: string) => void;
}

// Helper function to display field error message
const FieldError = ({ error }: { error?: string }) => {
  if (!error) return null;
  return <p className="mt-1 text-sm text-red-600">{error}</p>;
};

type FormErrorType = Record<string, string>;

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

  // Define registration types - now only using detailed registration
  type RegistrationType = 'detailed';

  // Form state - always detailed registration
  const [registrationType] = useState<RegistrationType>('detailed');
  
  // Form step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Always 4 steps for detailed registration
  
  // State for info popup
  const [showInfoPopup, setShowInfoPopup] = useState(true);
  
  const [formData, setFormData] = useState<Omit<LitterInput, 'sireId' | 'damId' | 'userId'> & {
    sireId: string;
    damId: string;
    userId: string;
    puppyDetails?: PuppyDetail[];
  }>({
    sireId: initialSireId || '',
    damId: initialDamId || '',
    breedingRecordId: breedingId || '',
    userId: userId, // Initialize with the provided userId prop
    litterName: '',
    whelpingDate: '',
    totalPuppies: 0,
    malePuppies: 0,
    femalePuppies: 0,
    notes: '',
    puppyDetails: []
  });
  
  const [formErrors, setFormErrors] = useState<FormErrorType>({});
  const [formErrorSummary, setFormErrorSummary] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
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
  
  // Initialize component and handle state changes
  useEffect(() => {
    // If we have a breeding ID but no breeding data yet, wait
    if (breedingId && breedingLoading) {
      return;
    }
    
    // Initialize with first step
    setCurrentStep(1);
    
    // Initialize puppy details when component mounts or when relevant data changes
    initializePuppyDetails();
    
    // If a breeding record or sire/dam IDs were provided, we can skip to step 2
    if (breedingId || (initialSireId && initialDamId)) {
      setHasBreedingRecord(true);
      updateStep(2);
    }
  }, [breedingId, initialSireId, initialDamId, breedingLoading, breedingData]);
  
  // Initialize puppy details for detailed registration
  const initializePuppyDetails = () => {
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
    // Clear any error for this specific field when user makes changes
    if (formErrors[`puppy${index}_${field}`]) {
      setFormErrors(prev => {
        const updated = {...prev};
        delete updated[`puppy${index}_${field}`];
        return updated;
      });
    }
    
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
    let isValid = true;
    
    // Validate basic fields
    if (!formData.litterName?.trim()) {
      errors.litterName = 'Litter name is required';
      isValid = false;
    } else if (formData.litterName.length > 50) {
      errors.litterName = 'Litter name must be 50 characters or less';
      isValid = false;
    }
    
    if (!formData.sireId) {
      errors.sireId = 'Sire (Father) is required';
      isValid = false;
    }
    
    if (!formData.damId) {
      errors.damId = 'Dam (Mother) is required';
      isValid = false;
    }
    
    if (!formData.whelpingDate) {
      errors.whelpingDate = 'Whelping date is required';
      isValid = false;
    } else {
      // Ensure whelping date is not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const whelpingDate = new Date(formData.whelpingDate);
      
      if (whelpingDate > today) {
        errors.whelpingDate = 'Whelping date cannot be in the future';
        isValid = false;
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
          errors[`puppy${index}_name`] = `Name for puppy #${index + 1} is required`;
        }
        
        if (!puppy.color.trim()) {
          errors[`puppy${index}_color`] = `Color for puppy #${index + 1} is required`;
        }
        
        if (puppy.microchipNumber && puppy.microchipNumber.length < 8) {
          errors[`puppy${index}_microchipNumber`] = `Microchip number must be at least 8 characters`;
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
    
    // Clear any existing form error summary
    setFormErrorSummary('');
    
    // Validate the form
    if (!validateForm()) {
      // Scroll to the top to show the error summary
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Create a more descriptive error message
      const errorList = Object.values(formErrors);
      const errorCount = errorList.length;
      
      // Show a summary of the errors at the top of the form
      setFormErrorSummary(
        `Please correct the ${errorCount} ${errorCount === 1 ? 'error' : 'errors'} below before submitting: ${errorList.slice(0, 3).join('; ')}${errorCount > 3 ? '...' : ''}`
      );
      return;
    }
    
    // Show helpful feedback that we're starting the submission process
    toast.success('Submitting litter registration...');
    
    setIsSubmitting(true);
    
    try {
      // Create base input without puppyDetails field
      const { puppyDetails, ...baseData } = formData;
      
      const input: any = {
        ...baseData,
        // Ensure whelping date is a valid date
        whelpingDate: new Date(formData.whelpingDate).toISOString(),
        // Explicitly include userId for ownership
        userId: formData.userId,
      };
      
      // If using detailed registration and have puppy details, include them
      if (registrationType === 'detailed' && puppyDetails && puppyDetails.length > 0) {
        input.puppyDetails = puppyDetails;
      }
      
      // Execute the createLitter mutation (removed duplicate call)
      const response = await createLitter({
        variables: { input }
      });
      
      const litterId = response?.data?.createLitter?.id || '';
      
      // Show success notification with more information
      toast.success('Litter registered successfully!');
      
      setRegistrationSuccess(true);
      
      // Display a success message with more details
      setFormErrorSummary('');
      setFormErrors({});
      
      // Trigger any success callbacks if provided
      if (onSuccess && litterId) {
        onSuccess(litterId);
      }
      
      // Reset form or redirect after short delay
      setTimeout(() => {
        // Redirect to litters list or the new litter detail page if we have an ID
        window.location.href = litterId ? `/litters/${litterId}` : '/litters';
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred';
      toast.error(`Registration failed: ${errorMessage}`);
      setFormErrorSummary(`Failed to register litter: ${errorMessage}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSubmitting(false);
    }
  };
  
  // If user doesn't have appropriate role, show error
  if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN && userRole !== UserRole.OWNER) {
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
              You don't have permission to register litters. Please contact a super administrator, administrator, or owner.
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
        
        {/* Form Error Summary */}
        {formErrorSummary && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{formErrorSummary}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {registrationSuccess && (
          <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Litter registered successfully! Redirecting to litters list...</p>
              </div>
            </div>
          </div>
        )}
        
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
            <span className="text-xs text-gray-500">Puppy Count</span>
            <span className="text-xs text-gray-500">Parents</span>
            <span className="text-xs text-gray-500">Puppy Details</span>
          </div>
        </div>
      </div>
      
              {/* Info Popup */}
        {showInfoPopup && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay with blur effect */}
              <div 
                className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" 
                aria-hidden="true" 
                onClick={() => setShowInfoPopup(false)}
              ></div>
              
              {/* Modal positioning */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              {/* Modal container with animation */}
              <div 
                className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all duration-300 ease-in-out sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-modal-appear"
                style={{
                  animation: 'modalAppear 0.3s ease-out',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 py-6 px-6 rounded-t-2xl">
                  <h3 className="text-xl font-bold text-white" id="modal-title">
                    About Litter Registration
                  </h3>
                  <button 
                    type="button" 
                    className="absolute top-3 right-3 text-white hover:text-gray-200 transition-colors"
                    onClick={() => setShowInfoPopup(false)}
                  >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Content area */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    <p className="text-gray-700 dark:text-gray-300">
                      Litter registration is an important step in documenting the breeding history and genealogy of your dogs. 
                      This detailed registration process provides numerous benefits:
                    </p>
                    
                    {/* Cards for sections */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-700">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 flex items-center">
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Key Benefits
                      </h4>
                      <ul className="mt-2 space-y-2">
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            <strong>Pedigree Documentation:</strong> Establishes formal records of lineage
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            <strong>Health Tracking:</strong> Allows for monitoring of inherited traits and conditions
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            <strong>Breeder Credibility:</strong> Demonstrates commitment to responsible breeding
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="flex-shrink-0 h-5 w-5 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            <strong>Simplified Puppy Registration:</strong> Makes individual puppy registration easier
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-700">
                      <h4 className="font-semibold text-green-800 dark:text-green-300 flex items-center">
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L13.586 9H10a1 1 0 110-2h3.586l-2.293-2.293A1 1 0 0112 2z" clipRule="evenodd" />
                        </svg>
                        Required Information
                      </h4>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                          <div className="font-medium text-green-700 dark:text-green-300">Parents</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Verified sire and dam of the litter</div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                          <div className="font-medium text-green-700 dark:text-green-300">Whelping Date</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">The date the puppies were born</div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                          <div className="font-medium text-green-700 dark:text-green-300">Litter Size</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Number of puppies and gender breakdown</div>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm">
                          <div className="font-medium text-green-700 dark:text-green-300">Puppy Details</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Names, colors, markings, microchips</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-700">
                      <h4 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center">
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Timeline Tips
                      </h4>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        For best results, register your litter within 4-8 weeks of birth, but you can register 
                        at any time. Early registration ensures all records are properly linked from birth.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
                  <button 
                    type="button" 
                    className="w-full flex justify-center items-center py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    onClick={() => setShowInfoPopup(false)}
                  >
                    <span>Got it</span>
                    <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

<form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Litter Registration Information */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Detailed Litter Registration</h3>
              <p className="text-sm text-blue-700 mb-2">
                This form allows you to register all puppies in a litter with their individual details including names, colors, markings, and microchip numbers.
                Complete registration provides better record-keeping and streamlines the eventual registration of individual puppies.
              </p>
              <button 
                type="button" 
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                onClick={() => setShowInfoPopup(true)}
              >
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Learn more about litter registration
              </button>
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
            
            {/* Owner Selection */}
            <div className="md:col-span-2">
              <UserSearchSelect
                label="Owner"
                placeholder="Search for owner..."
                value={formData.userId}
                onChange={(userId) => {
                  setFormData(prev => ({
                    ...prev,
                    userId: userId
                  }));
                }}
                error={formErrors.userId}
                required={true}
                className="w-full"
                disabled={userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN}
              />
              <p className="mt-1 text-xs text-gray-500">
                Select the owner of this litter
              </p>
              {userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN && (
                <p className="mt-1 text-xs text-gray-500">
                  Only super administrators and administrators can change the owner. The current user will be set as the owner.
                </p>
              )}
            </div>
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
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
                placeholder="Official litter registration number"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">
                Auto-generated by the system upon approval
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
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
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
                          className={`mt-1 block w-full rounded-md shadow-sm ${formErrors[`puppy${index}_name`] ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                          placeholder={`${puppy.gender === 'male' ? 'Male' : 'Female'} puppy name`}
                        />
                        {formErrors[`puppy${index}_name`] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[`puppy${index}_name`]}</p>
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
                          className={`mt-1 block w-full rounded-md shadow-sm ${formErrors[`puppy${index}_color`] ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                          placeholder="E.g., Black, Brown, Brindle"
                        />
                        {formErrors[`puppy${index}_color`] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[`puppy${index}_color`]}</p>
                        )}
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
                          className={`mt-1 block w-full rounded-md shadow-sm ${formErrors[`puppy${index}_markings`] ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                          placeholder="E.g., White chest, Tan points"
                        />
                        {formErrors[`puppy${index}_markings`] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[`puppy${index}_markings`]}</p>
                        )}
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
                          className={`mt-1 block w-full rounded-md shadow-sm ${formErrors[`puppy${index}_microchipNumber`] ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
                          placeholder="Microchip identification number if available"
                        />
                        {formErrors[`puppy${index}_microchipNumber`] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[`puppy${index}_microchipNumber`]}</p>
                        )}
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
            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formErrors.notes ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
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
            disabled={isSubmitting || registrationSuccess}
            className={`inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting || registrationSuccess ? 'opacity-75 cursor-not-allowed bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {registrationSuccess ? 'Registration Complete' : (isSubmitting ? 'Registering...' : 'Register Litter')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LitterRegistrationForm;
