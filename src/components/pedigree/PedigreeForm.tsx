'use client';

import { useState, useEffect } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { CREATE_PEDIGREE, GET_LINEBREEDING_ANALYSIS } from '@/graphql/queries/pedigreeQueries';
import DogSearchSelect from '@/components/common/DogSearchSelect';

interface PedigreeFormProps {
  initialDogId?: string;
}

const PedigreeForm = ({ initialDogId = '' }: PedigreeFormProps) => {
  const router = useRouter();
  const [createPedigree, { loading: creatingPedigree }] = useMutation(CREATE_PEDIGREE);
  const [getLinebreedingAnalysis, { loading: calculatingCoefficient, data: linebreedingData }] = 
    useLazyQuery(GET_LINEBREEDING_ANALYSIS);
  
  const [formData, setFormData] = useState({
    dogId: initialDogId,
    sireId: '',
    damId: '',
    generation: 2,
    coefficient: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isCalculatingCoefficient, setIsCalculatingCoefficient] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDogSelect = (field: string, dogId: string) => {
    setFormData(prev => ({ ...prev, [field]: dogId }));
    
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // If both sire and dam are selected, we can calculate the coefficient
    const updatedFormData = { ...formData, [field]: dogId };
    if (updatedFormData.sireId && updatedFormData.damId) {
      calculateCoefficient(updatedFormData.sireId, updatedFormData.damId);
    }
  };
  
  // Function to calculate coefficient using linebreeding analysis
  const calculateCoefficient = (sireId: string, damId: string) => {
    setIsCalculatingCoefficient(true);
    // Clear any previous errors related to coefficient
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.coefficient;
      delete newErrors.linebreeding;
      return newErrors;
    });
    
    getLinebreedingAnalysis({
      variables: {
        sireId,
        damId,
        generations: 6 // Using 6 generations for more accurate calculation
      },
      onCompleted: (data) => {
        if (data?.linebreedingAnalysis?.inbreedingCoefficient !== undefined) {
          setFormData(prev => ({
            ...prev,
            coefficient: data.linebreedingAnalysis.inbreedingCoefficient
          }));
        }
        setIsCalculatingCoefficient(false);
      },
      onError: (error) => {
        console.error('Error calculating coefficient:', error);
        
        // Handle the error and show it in the UI
        if (error.graphQLErrors?.length > 0) {
          // Handle specific GraphQL errors
          const message = error.graphQLErrors[0].message;
          setErrors(prev => ({
            ...prev,
            linebreeding: `Coefficient calculation failed: ${message}`
          }));
        } else if (error.networkError) {
          setErrors(prev => ({
            ...prev,
            linebreeding: 'Network error while calculating coefficient. Please try again.'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            linebreeding: error.message || 'Unknown error calculating coefficient'
          }));
        }
        
        setIsCalculatingCoefficient(false);
      }
    });
  };
  
  // When linebreeding data changes, update UI with recommendations
  useEffect(() => {
    if (linebreedingData?.linebreedingAnalysis) {
      const analysis = linebreedingData.linebreedingAnalysis;
      
      // Update coefficient when analysis is available
      if (analysis.inbreedingCoefficient !== undefined) {
        setFormData(prev => ({
          ...prev,
          coefficient: analysis.inbreedingCoefficient
        }));
      }
      
      // You could display these recommendations in the UI if desired
      console.log('Breeding recommendations:', analysis.recommendations);
      
      // If there are common ancestors, we could show them in the UI
      if (analysis.commonAncestors && analysis.commonAncestors.length > 0) {
        console.log('Common ancestors:', analysis.commonAncestors.length);
      }
    }
  }, [linebreedingData]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.dogId) {
      newErrors.dogId = 'Please select a dog';
    }
    
    // Sire and Dam are optional, but if provided, they must be valid
    
    // Check that dog isn't its own parent
    if (formData.dogId && (formData.dogId === formData.sireId || formData.dogId === formData.damId)) {
      newErrors.dogId = 'A dog cannot be its own parent';
    }
    
    // Check that sire and dam aren't the same
    if (formData.sireId && formData.damId && formData.sireId === formData.damId) {
      newErrors.sireId = 'Sire and dam cannot be the same dog';
    }
    
    // Validate coefficient is between 0 and 1
    const coefficient = parseFloat(formData.coefficient.toString());
    if (isNaN(coefficient) || coefficient < 0 || coefficient > 1) {
      newErrors.coefficient = 'Coefficient must be a number between 0 and 1';
    }
    
    // Validate generation is a positive integer
    const generation = parseInt(formData.generation.toString());
    if (isNaN(generation) || generation < 1) {
      newErrors.generation = 'Generation must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setErrors({});
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Execute the createPedigree mutation with proper input structure
      const result = await createPedigree({
        variables: {
          input: {
            dogId: formData.dogId,
            sireId: formData.sireId || null,
            damId: formData.damId || null,
            generation: parseInt(formData.generation.toString()),
            coefficient: parseFloat(formData.coefficient.toString())
          }
        }
      });
      
      if (result.data?.createPedigree) {
        // Show success message and redirect after a short delay
        setSuccess('Pedigree has been successfully created!');
        setTimeout(() => {
          router.push(`/dogs/${formData.dogId}/pedigree`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating pedigree:', err);
      
      // Handle specific GraphQL errors
      if (err instanceof Error) {
        const error = err as any; // Type assertion to access potential GraphQL properties
        
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const graphQLError = error.graphQLErrors[0];
          const message = graphQLError.message;
          
          if (message.includes('must be a male dog')) {
            setErrors({ sireId: 'The selected sire must be a male dog' });
          } else if (message.includes('must be a female dog')) {
            setErrors({ damId: 'The selected dam must be a female dog' });
          } else if (message.includes('not found')) {
            if (message.includes('Sire not found')) {
              setErrors({ sireId: 'The selected sire could not be found' });
            } else if (message.includes('Dam not found')) {
              setErrors({ damId: 'The selected dam could not be found' });
            } else if (message.includes('Dog not found')) {
              setErrors({ dogId: 'The selected dog could not be found' });
            } else {
              setErrors({ submit: message });
            }
          } else if (graphQLError.extensions?.code === 'BAD_USER_INPUT') {
            // Extract validation errors from extensions
            const validationErrors = graphQLError.extensions.validationErrors;
            if (validationErrors && typeof validationErrors === 'object') {
              setErrors(validationErrors as Record<string, string>);
            } else {
              setErrors({ submit: message });
            }
          } else {
            setErrors({ submit: message });
          }
        } else if (error.networkError) {
          setErrors({ 
            submit: 'Network error occurred. Please check your connection and try again.' 
          });
        } else {
          setErrors({
            submit: error.message || 'An error occurred while creating the pedigree'
          });
        }
      } else {
        setErrors({
          submit: 'An unexpected error occurred while creating the pedigree'
        });
      }
    }
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Dog Selection */}
          <div className="sm:col-span-6">
            <DogSearchSelect
              label="Dog"
              placeholder="Search for dog by name or registration number..."
              value={formData.dogId}
              onChange={(dogId) => handleDogSelect('dogId', dogId)}
              required
              error={errors.dogId}
            />
          </div>

          {/* Sire Selection */}
          <div className="sm:col-span-3">
            <DogSearchSelect
              label="Sire (Father)"
              placeholder="Search for sire..."
              value={formData.sireId}
              onChange={(dogId) => handleDogSelect('sireId', dogId)}
              excludeIds={[formData.dogId]}
              error={errors.sireId}
              filterGender="MALE"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional - leave blank if unknown
            </p>
          </div>

          {/* Dam Selection */}
          <div className="sm:col-span-3">
            <DogSearchSelect
              label="Dam (Mother)"
              placeholder="Search for dam..."
              value={formData.damId}
              onChange={(dogId) => handleDogSelect('damId', dogId)}
              excludeIds={[formData.dogId, formData.sireId]}
              error={errors.damId}
              filterGender="FEMALE"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional - leave blank if unknown
            </p>
          </div>

          {/* Coefficient */}
          <div className="sm:col-span-3">
            <label htmlFor="coefficient" className="block text-sm font-medium text-gray-700">
              Inbreeding Coefficient
            </label>
            <div className="mt-1 relative">
              <input
                type="number"
                id="coefficient"
                name="coefficient"
                step="0.001"
                min="0"
                max="1"
                value={formData.coefficient}
                onChange={handleInputChange}
                className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.coefficient ? 'border-red-300' : ''
                }`}
              />
              {(calculatingCoefficient || isCalculatingCoefficient) && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-green-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>
            {errors.coefficient && (
              <p className="mt-1 text-xs text-red-600">{errors.coefficient}</p>
            )}
            {errors.linebreeding && (
              <p className="mt-1 text-xs text-red-600">{errors.linebreeding}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {linebreedingData?.linebreedingAnalysis ? 
                `Calculated value: ${(linebreedingData.linebreedingAnalysis.inbreedingCoefficient * 100).toFixed(1)}%` : 
                "Value between 0 and 1, e.g., 0.125 for 12.5%"}
            </p>
            {linebreedingData?.linebreedingAnalysis?.recommendations && (
              <div className="mt-2 p-2 bg-blue-50 rounded-md text-xs text-blue-700 border border-blue-100">
                <p className="font-medium">Breeding Analysis:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {linebreedingData.linebreedingAnalysis.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
                {linebreedingData.linebreedingAnalysis.commonAncestors && 
                 linebreedingData.linebreedingAnalysis.commonAncestors.length > 0 && (
                  <p className="mt-1">
                    Found {linebreedingData.linebreedingAnalysis.commonAncestors.length} common ancestors
                    {linebreedingData.linebreedingAnalysis.geneticDiversity !== undefined && 
                      ` (Genetic Diversity: ${(linebreedingData.linebreedingAnalysis.geneticDiversity * 100).toFixed(1)}%)`
                    }
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Generation */}
          <div className="sm:col-span-3">
            <label htmlFor="generation" className="block text-sm font-medium text-gray-700">
              Generation
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="generation"
                name="generation"
                min="1"
                max="10"
                value={formData.generation}
                onChange={handleInputChange}
                className={`shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.generation ? 'border-red-300' : ''
                }`}
              />
            </div>
            {errors.generation && (
              <p className="mt-1 text-xs text-red-600">{errors.generation}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Typically 2 for direct parents (per backend default)
            </p>
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="mt-6">
            <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
              {success}
            </p>
          </div>
        )}

        {/* Error message */}
        {errors.submit && (
          <div className="mt-6">
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Form actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/pedigrees')}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creatingPedigree || calculatingCoefficient}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingPedigree ? 'Saving...' : 'Create Pedigree'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PedigreeForm;
