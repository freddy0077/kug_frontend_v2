'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRegisterLitterPuppies, useLitter } from '@/hooks/useLitters';
import { RegisterLitterPuppiesInput, PuppyRegistrationInput } from '@/graphql/mutations/litterMutations';
import { GET_OWNERS } from '@/graphql/queries/userQueries';
import { GET_LITTER } from '@/graphql/queries/litterQueries';
import { UserRole } from '@/utils/permissionUtils';

interface PuppyFormData {
  name: string;
  gender: 'male' | 'female';
  color: string;
  microchipNumber?: string;
  registrationNumber?: string;
  ownerId?: string;
}

interface PuppyRegistrationFormProps {
  litterId: string;
  userRole: UserRole;
  userId: string;
  onSuccess?: () => void;
}

const PuppyRegistrationForm: React.FC<PuppyRegistrationFormProps> = ({
  litterId,
  userRole,
  userId,
  onSuccess
}) => {
  const router = useRouter();
  
  // Get litter details to pre-fill some form fields using custom hook
  const { loading: litterLoading, error: litterError, data: litterData } = useLitter(litterId);
  
  // Get owners for dropdown
  const { loading: ownersLoading, data: ownersData } = useQuery(GET_OWNERS, {
    variables: { limit: 100 },
    skip: !litterId
  });
  
  // Check if user has permission
  const hasPermission = userRole === UserRole.ADMIN || userRole === UserRole.OWNER;
  
  // Form state
  const [puppyForms, setPuppyForms] = useState<PuppyFormData[]>([
    { name: '', gender: 'male', color: '' }
  ]);
  
  const [formErrors, setFormErrors] = useState<Record<string, string>[]>([{}]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pre-fill date of birth from litter whelping date
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  
  // Update date of birth when litter data is loaded
  useEffect(() => {
    if (litterData?.litter?.whelpingDate) {
      const date = new Date(litterData.litter.whelpingDate);
      setDateOfBirth(date.toISOString().split('T')[0]);
    }
  }, [litterData]);
  
  // Register puppies mutation using custom hook
  const [registerPuppies, { loading: registerLoading }] = useRegisterLitterPuppies();

  
  // Add another puppy form
  const addPuppyForm = () => {
    setPuppyForms([...puppyForms, { name: '', gender: 'male', color: '' }]);
    setFormErrors([...formErrors, {}]);
  };
  
  // Remove a puppy form
  const removePuppyForm = (index: number) => {
    const newPuppyForms = [...puppyForms];
    newPuppyForms.splice(index, 1);
    setPuppyForms(newPuppyForms);
    
    const newFormErrors = [...formErrors];
    newFormErrors.splice(index, 1);
    setFormErrors(newFormErrors);
  };
  
  // Handle form input changes
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedForms = [...puppyForms];
    updatedForms[index] = { ...updatedForms[index], [name]: value };
    setPuppyForms(updatedForms);
    
    // Clear error for this field when user changes it
    if (formErrors[index] && formErrors[index][name]) {
      const newFormErrors = [...formErrors];
      const currentErrors = { ...newFormErrors[index] };
      delete currentErrors[name];
      newFormErrors[index] = currentErrors;
      setFormErrors(newFormErrors);
    }
  };
  
  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newFormErrors = puppyForms.map(puppy => {
      const errors: Record<string, string> = {};
      
      if (!puppy.name.trim()) {
        errors.name = 'Name is required';
        isValid = false;
      }
      
      if (!puppy.gender) {
        errors.gender = 'Gender is required';
        isValid = false;
      }
      
      if (!puppy.color.trim()) {
        errors.color = 'Color is required';
        isValid = false;
      }
      
      if (puppy.microchipNumber && !/^[0-9]{9,15}$/.test(puppy.microchipNumber)) {
        errors.microchipNumber = 'Microchip number must be 9-15 digits';
        isValid = false;
      }
      
      return errors;
    });
    
    if (!dateOfBirth) {
      toast.error('Date of birth is required for all puppies');
      isValid = false;
    }
    
    setFormErrors(newFormErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const puppies = puppyForms.map(puppy => ({
        name: puppy.name,
        gender: puppy.gender,
        color: puppy.color || '', // Ensure color is always provided, use empty string as fallback
        microchipNumber: puppy.microchipNumber || undefined,
        registrationNumber: puppy.registrationNumber || undefined,
        ownerId: puppy.ownerId || undefined,
        dateOfBirth: new Date(dateOfBirth).toISOString(), // Ensure date is proper ISO string
        isNeutered: false // Default value
      }));
      
      const input: RegisterLitterPuppiesInput = {
        litterId,
        puppies
      };
      
      const { data } = await registerPuppies({
        variables: { input },
        refetchQueries: [
          { query: GET_LITTER, variables: { id: litterId } }
        ]
      });
      
      if (data?.registerLitterPuppies?.success) {
        toast.success(`Successfully registered ${puppyForms.length} puppies!`);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/litters/${litterId}`);
        }
      }
    } catch (error: any) {
      toast.error(`An error occurred: ${error.message}`);
      setIsSubmitting(false);
    }
  };
  
  // If user doesn't have appropriate role, show error
  if (!hasPermission) {
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
              You don't have permission to register puppies. Please contact an administrator or owner.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading indicator while fetching litter data
  if (litterLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Show error if litter data couldn't be fetched
  if (litterError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading litter details: {litterError.message}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const litter = litterData?.litter;
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Register Puppies for Litter: {litter?.litterName}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Register multiple puppies from this litter with the information below.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Date of Birth - common for all puppies */}
        <div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Common Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>The following information will be applied to all puppies in this form.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                By default, set to the litter's whelping date
              </p>
            </div>
            
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parents
                </label>
                <div className="text-sm text-gray-900">
                  <p>
                    <span className="font-medium">Sire:</span> {litter?.sire?.name}
                  </p>
                  <p>
                    <span className="font-medium">Dam:</span> {litter?.dam?.name}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Whelping Date
                </label>
                <div className="text-sm text-gray-900">
                  {litter?.whelpingDate ? new Date(litter.whelpingDate).toLocaleDateString() : 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Puppies Forms */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Puppy Information
          </h3>
          
          {puppyForms.map((puppy, index) => (
            <div 
              key={index} 
              className={`${index > 0 ? 'mt-8 pt-6 border-t border-gray-200' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">
                  Puppy #{index + 1}
                </h4>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removePuppyForm(index)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="-ml-0.5 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor={`name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`name-${index}`}
                    name="name"
                    value={puppy.name}
                    onChange={(e) => handleChange(index, e)}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      formErrors[index]?.name 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="Puppy's name"
                  />
                  {formErrors[index]?.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors[index].name}</p>
                  )}
                </div>
                
                {/* Gender */}
                <div>
                  <label htmlFor={`gender-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    id={`gender-${index}`}
                    name="gender"
                    value={puppy.gender}
                    onChange={(e) => handleChange(index, e)}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      formErrors[index]?.gender 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {formErrors[index]?.gender && (
                    <p className="mt-1 text-sm text-red-600">{formErrors[index].gender}</p>
                  )}
                </div>
                
                {/* Color */}
                <div>
                  <label htmlFor={`color-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`color-${index}`}
                    name="color"
                    value={puppy.color}
                    onChange={(e) => handleChange(index, e)}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      formErrors[index]?.color 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="e.g. Black & Tan, Brindle"
                  />
                  {formErrors[index]?.color && (
                    <p className="mt-1 text-sm text-red-600">{formErrors[index].color}</p>
                  )}
                </div>
                
                {/* Microchip */}
                <div>
                  <label htmlFor={`microchipNumber-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Microchip Number
                  </label>
                  <input
                    type="text"
                    id={`microchipNumber-${index}`}
                    name="microchipNumber"
                    value={puppy.microchipNumber || ''}
                    onChange={(e) => handleChange(index, e)}
                    className={`mt-1 block w-full rounded-md shadow-sm ${
                      formErrors[index]?.microchipNumber 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="Microchip identification number"
                  />
                  {formErrors[index]?.microchipNumber && (
                    <p className="mt-1 text-sm text-red-600">{formErrors[index].microchipNumber}</p>
                  )}
                </div>
                
                {/* Registration Number */}
                <div>
                  <label htmlFor={`registrationNumber-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    id={`registrationNumber-${index}`}
                    name="registrationNumber"
                    value={puppy.registrationNumber || ''}
                    onChange={(e) => handleChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Official registration number (if available)"
                  />
                </div>
                
                {/* Owner */}
                <div>
                  <label htmlFor={`ownerId-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Owner
                  </label>
                  <select
                    id={`ownerId-${index}`}
                    name="ownerId"
                    value={puppy.ownerId || ''}
                    onChange={(e) => handleChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Owner</option>
                    {ownersLoading ? (
                      <option value="" disabled>Loading owners...</option>
                    ) : (
                      ownersData?.owners?.items.map((owner: any) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Owner can be assigned later if not known yet
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Puppy Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={addPuppyForm}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Another Puppy
            </button>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Link 
            href={`/litters/${litterId}`}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Registering...' : 'Register Puppies'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PuppyRegistrationForm;
