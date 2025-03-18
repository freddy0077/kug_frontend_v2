'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CREATE_BREEDING_RECORD, 
  UPDATE_BREEDING_RECORD,
  BreedingRecordInput,
  UpdateBreedingRecordInput
} from '@/graphql/mutations/pedigreeMutations';
import { GET_BREEDING_RECORDS } from '@/graphql/queries/pedigreeQueries';
import { GET_DOGS, DogSortField, SortDirection } from '@/graphql/queries/dogQueries';

interface BreedingRecordFormProps {
  breedingId?: string;
  initialSireId?: string;
  initialDamId?: string;
  mode: 'create' | 'edit';
}

const BreedingRecordForm: React.FC<BreedingRecordFormProps> = ({ 
  breedingId, 
  initialSireId, 
  initialDamId, 
  mode 
}) => {
  const router = useRouter();
  
  // Form state
  const [sireId, setSireId] = useState(initialSireId || '');
  const [damId, setDamId] = useState(initialDamId || '');
  const [breedingDate, setBreedingDate] = useState('');
  const [litterSize, setLitterSize] = useState<number | ''>('');
  const [comments, setComments] = useState('');
  const [puppyIds, setPuppyIds] = useState<string[]>([]);
  const [selectedPuppies, setSelectedPuppies] = useState<{id: string, name: string}[]>([]);
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dogs for sire/dam selection
  const { loading: dogsLoading, data: dogsData } = useQuery(GET_DOGS, {
    variables: { 
      limit: 100,  // Adjust limit as needed
      sortBy: DogSortField.DATE_OF_BIRTH,
      sortDirection: SortDirection.DESC
    }
  });

  // For edit mode, fetch the existing breeding record
  const { loading: recordLoading, data: recordData } = useQuery(
    GET_BREEDING_RECORDS,
    {
      variables: { dogId: initialSireId || initialDamId || '0', limit: 100 },
      skip: mode !== 'edit' || !breedingId
    }
  );

  // Mutations
  const [createBreedingRecord] = useMutation(CREATE_BREEDING_RECORD);
  const [updateBreedingRecord] = useMutation(UPDATE_BREEDING_RECORD);

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (mode === 'edit' && recordData && !recordLoading) {
      const record = recordData.breedingRecords.items.find(
        (item: any) => item.id === breedingId
      );
      
      if (record) {
        setSireId(record.sire.id);
        setDamId(record.dam.id);
        setBreedingDate(record.breedingDate.split('T')[0]); // Format date for input
        setLitterSize(record.litterSize || '');
        setComments(record.comments || '');
        
        if (record.puppies && record.puppies.length > 0) {
          setPuppyIds(record.puppies.map((puppy: any) => puppy.id));
          setSelectedPuppies(record.puppies.map((puppy: any) => ({
            id: puppy.id,
            name: puppy.name
          })));
        }
      }
    }
  }, [mode, recordData, recordLoading, breedingId]);

  // Filter available dogs list - males as sires, females as dams
  const maleDogs = dogsData?.dogs?.items.filter((dog: any) => dog.gender === 'male') || [];
  const femaleDogs = dogsData?.dogs?.items.filter((dog: any) => dog.gender === 'female') || [];
  
  // All dogs that could be puppies (exclude sire and dam)
  const availablePuppies = dogsData?.dogs?.items.filter((dog: any) => 
    dog.id !== sireId && dog.id !== damId
  ) || [];

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!sireId) {
      errors.sireId = 'Sire is required';
    }

    if (!damId) {
      errors.damId = 'Dam is required';
    }

    if (!breedingDate) {
      errors.breedingDate = 'Breeding date is required';
    }

    if (litterSize !== '' && (isNaN(Number(litterSize)) || Number(litterSize) < 0)) {
      errors.litterSize = 'Litter size must be a positive number';
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
      if (mode === 'create') {
        const input: BreedingRecordInput = {
          sireId,
          damId,
          breedingDate,
          litterSize: litterSize !== '' ? Number(litterSize) : undefined,
          comments: comments || undefined,
          puppyIds: puppyIds.length > 0 ? puppyIds : undefined
        };

        const { data } = await createBreedingRecord({
          variables: { input }
        });

        if (data?.createBreedingRecord?.id) {
          // Navigate to the breeding record details
          router.push(`/manage/dogs/${sireId}/breeding/${data.createBreedingRecord.id}`);
        }
      } else if (mode === 'edit' && breedingId) {
        const input: UpdateBreedingRecordInput = {
          breedingDate,
          litterSize: litterSize !== '' ? Number(litterSize) : undefined,
          comments: comments || undefined,
          puppyIds: puppyIds.length > 0 ? puppyIds : undefined
        };

        const { data } = await updateBreedingRecord({
          variables: { id: breedingId, input }
        });

        if (data?.updateBreedingRecord?.id) {
          // Navigate to the breeding record details
          router.push(`/manage/dogs/${sireId}/breeding/${breedingId}`);
        }
      }
    } catch (error) {
      console.error('Error saving breeding record:', error);
      setFormErrors({ submit: 'Failed to save breeding record. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a puppy to the selected list
  const handleAddPuppy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const puppyId = e.target.value;
    if (!puppyId) return;
    
    const puppy = availablePuppies.find((p: any) => p.id === puppyId);
    if (puppy && !puppyIds.includes(puppyId)) {
      setPuppyIds([...puppyIds, puppyId]);
      setSelectedPuppies([...selectedPuppies, { id: puppyId, name: puppy.name }]);
    }
    
    e.target.value = ''; // Reset select
  };

  // Remove a puppy from the selected list
  const handleRemovePuppy = (puppyId: string) => {
    setPuppyIds(puppyIds.filter(id => id !== puppyId));
    setSelectedPuppies(selectedPuppies.filter(puppy => puppy.id !== puppyId));
  };

  if (mode === 'edit' && recordLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {mode === 'create' ? 'Add Breeding Record' : 'Edit Breeding Record'}
      </h2>
      
      {formErrors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {formErrors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Sire and Dam Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sireId" className="block text-sm font-medium text-gray-700">
                Sire
              </label>
              <select
                id="sireId"
                value={sireId}
                onChange={(e) => setSireId(e.target.value)}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                  formErrors.sireId ? 'border-red-300' : ''
                }`}
                disabled={isSubmitting || mode === 'edit'}
              >
                <option value="">Select sire</option>
                {maleDogs.map((dog: any) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name} - {dog.breedObj?.name || dog.breed}
                  </option>
                ))}
              </select>
              {formErrors.sireId && (
                <p className="mt-2 text-sm text-red-600">{formErrors.sireId}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="damId" className="block text-sm font-medium text-gray-700">
                Dam
              </label>
              <select
                id="damId"
                value={damId}
                onChange={(e) => setDamId(e.target.value)}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                  formErrors.damId ? 'border-red-300' : ''
                }`}
                disabled={isSubmitting || mode === 'edit'}
              >
                <option value="">Select dam</option>
                {femaleDogs.map((dog: any) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name} - {dog.breedObj?.name || dog.breed}
                  </option>
                ))}
              </select>
              {formErrors.damId && (
                <p className="mt-2 text-sm text-red-600">{formErrors.damId}</p>
              )}
            </div>
          </div>
          
          {/* Breeding Date */}
          <div>
            <label htmlFor="breedingDate" className="block text-sm font-medium text-gray-700">
              Breeding Date
            </label>
            <input
              type="date"
              id="breedingDate"
              value={breedingDate}
              onChange={(e) => setBreedingDate(e.target.value)}
              className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                formErrors.breedingDate ? 'border-red-300' : ''
              }`}
              disabled={isSubmitting}
            />
            {formErrors.breedingDate && (
              <p className="mt-2 text-sm text-red-600">{formErrors.breedingDate}</p>
            )}
          </div>
          
          {/* Litter Size */}
          <div>
            <label htmlFor="litterSize" className="block text-sm font-medium text-gray-700">
              Litter Size (Optional)
            </label>
            <input
              type="number"
              id="litterSize"
              min="0"
              value={litterSize}
              onChange={(e) => setLitterSize(e.target.value === '' ? '' : parseInt(e.target.value))}
              placeholder="Number of puppies"
              className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                formErrors.litterSize ? 'border-red-300' : ''
              }`}
              disabled={isSubmitting}
            />
            {formErrors.litterSize && (
              <p className="mt-2 text-sm text-red-600">{formErrors.litterSize}</p>
            )}
          </div>
          
          {/* Comments */}
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
              Comments (Optional)
            </label>
            <textarea
              id="comments"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add notes or comments about this breeding"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>
          
          {/* Puppies */}
          <div>
            <label htmlFor="puppies" className="block text-sm font-medium text-gray-700 mb-2">
              Puppies from this Breeding (Optional)
            </label>
            
            <select
              id="puppies"
              onChange={handleAddPuppy}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md mb-3"
              disabled={isSubmitting}
            >
              <option value="">Add a puppy</option>
              {availablePuppies.map((dog: any) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name} - {dog.breedObj?.name || dog.breed} ({dog.gender})
                </option>
              ))}
            </select>
            
            {selectedPuppies.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedPuppies.map((puppy) => (
                  <div 
                    key={puppy.id} 
                    className="bg-blue-50 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    <span>{puppy.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePuppy(puppy.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      disabled={isSubmitting}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No puppies selected</p>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end pt-4">
            <Link
              href={`/manage/dogs/${initialSireId || initialDamId || ''}`}
              className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Saving...' 
                : mode === 'create' 
                  ? 'Create Breeding Record' 
                  : 'Update Breeding Record'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BreedingRecordForm;
