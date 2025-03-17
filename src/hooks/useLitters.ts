import { useQuery, useMutation, QueryResult, MutationTuple } from '@apollo/client';
import { 
  GET_LITTERS, 
  GET_LITTER, 
  GET_DOG_LITTERS,
  DogRole
} from '@/graphql/queries/litterQueries';
import {
  CREATE_LITTER,
  UPDATE_LITTER,
  REGISTER_LITTER_PUPPIES,
  LitterInput,
  UpdateLitterInput,
  RegisterLitterPuppiesInput
} from '@/graphql/mutations/litterMutations';

// TypeScript interfaces
export interface Litter {
  id: string;
  litterName: string;
  registrationNumber?: string;
  breedingRecordId?: string;
  whelpingDate: string;
  totalPuppies: number;
  malePuppies?: number;
  femalePuppies?: number;
  notes?: string;
  sire: Dog;
  dam: Dog;
  puppies: Puppy[];
  createdAt: string;
  updatedAt: string;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  gender: string;
  dateOfBirth: string;
  registrationNumber: string;
  color?: string;
  mainImageUrl?: string;
  currentOwner?: {
    id: string;
    name: string;
  };
}

export interface Puppy {
  id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  breed: string;
  color?: string;
  registrationNumber?: string;
  microchipNumber?: string;
  isNeutered?: boolean;
  currentOwner?: {
    id: string;
    name: string;
  };
}

export interface LitterConnection {
  totalCount: number;
  hasMore: boolean;
  items: Litter[];
}

export interface PuppyRegistrationResult {
  success: boolean;
  message: string;
  puppies: Puppy[];
}

// Hook for fetching litters with filtering options
export const useLitters = (
  options?: {
    offset?: number;
    limit?: number;
    ownerId?: string;
    breedId?: string;
    fromDate?: string;
    toDate?: string;
    searchTerm?: string;
  }
): QueryResult<{ litters: LitterConnection }> => {
  return useQuery(GET_LITTERS, {
    variables: {
      offset: options?.offset || 0,
      limit: options?.limit || 20,
      ownerId: options?.ownerId,
      breedId: options?.breedId,
      fromDate: options?.fromDate,
      toDate: options?.toDate,
      searchTerm: options?.searchTerm
    },
    fetchPolicy: 'cache-and-network'
  });
};

// Hook for fetching a single litter by ID
export const useLitter = (
  id: string
): QueryResult<{ litter: Litter }> => {
  return useQuery(GET_LITTER, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network'
  });
};

// Hook for fetching litters associated with a specific dog
export const useDogLitters = (
  options: {
    dogId: string;
    role?: DogRole;
    offset?: number;
    limit?: number;
  }
): QueryResult<{ dogLitters: LitterConnection }> => {
  return useQuery(GET_DOG_LITTERS, {
    variables: {
      dogId: options.dogId,
      role: options.role || DogRole.BOTH,
      offset: options.offset || 0,
      limit: options.limit || 20
    },
    skip: !options.dogId,
    fetchPolicy: 'cache-and-network'
  });
};

// Hook for creating a new litter
export const useCreateLitter = (): MutationTuple<
  { createLitter: Litter },
  { input: LitterInput }
> => {
  return useMutation(CREATE_LITTER, {
    update(cache, { data }) {
      // Optionally update cache after mutation
      if (data?.createLitter) {
        // You can update specific queries in the cache if needed
      }
    },
    // Variables will be provided when the mutation is called
    onError: (error) => {
      console.error('Error creating litter:', error);
    },
    // Process variables before sending to API
    context: {
      // Handle empty UUID fields
      processVariables: ({ input, ...rest }: { input: LitterInput }) => {
        // Create a clean copy of the input
        const cleanInput = { ...input };
        
        // Remove empty breedingRecordId (PostgreSQL can't handle empty string for UUID)
        if (cleanInput.breedingRecordId === '') {
          delete cleanInput.breedingRecordId;
        }
        
        return { input: cleanInput, ...rest };
      }
    }
  });
};

// Hook for updating an existing litter
export const useUpdateLitter = (): MutationTuple<
  { updateLitter: Litter },
  { id: string; input: UpdateLitterInput }
> => {
  return useMutation(UPDATE_LITTER);
};

// Hook for registering puppies for a litter
export const useRegisterLitterPuppies = (): MutationTuple<
  { registerLitterPuppies: PuppyRegistrationResult },
  { input: RegisterLitterPuppiesInput }
> => {
  return useMutation(REGISTER_LITTER_PUPPIES, {
    update(cache, { data }) {
      // Optionally update cache after puppy registration
      if (data?.registerLitterPuppies?.success) {
        // You can update the litter query to reflect the new puppies
      }
    }
  });
};

export default {
  useLitters,
  useLitter,
  useDogLitters,
  useCreateLitter,
  useUpdateLitter,
  useRegisterLitterPuppies
};
