// Type declarations for GraphQL modules
declare module '@/graphql/mutations/litterMutations' {
  import { gql } from '@apollo/client';
  
  export const CREATE_LITTER: any;
  export const UPDATE_LITTER: any;
  export const REGISTER_LITTER_PUPPIES: any;
  
  export interface PuppyDetailInput {
    name: string;
    gender: 'male' | 'female';
    color?: string;
    markings?: string;
    microchipNumber?: string;
    isCollapsed?: boolean;
  }
  
  export interface LitterInput {
    breedingRecordId?: string;
    sireId: string;
    damId: string;
    litterName: string;
    registrationNumber?: string;
    whelpingDate: string;
    totalPuppies: number;
    malePuppies?: number;
    femalePuppies?: number;
    puppyDetails?: PuppyDetailInput[];
    notes?: string;
  }
  
  export interface UpdateLitterInput {
    litterName?: string;
    registrationNumber?: string;
    whelpingDate?: string;
    totalPuppies?: number;
    malePuppies?: number;
    femalePuppies?: number;
    notes?: string;
    puppyIds?: string[];
  }
  
  export interface RegisterLitterPuppiesInput {
    litterId: string;
    puppies: {
      name: string;
      gender: string;
      color: string;
      microchipNumber?: string;
      isNeutered?: boolean;
    }[];
  }

  export interface PuppyRegistrationInput {
    name: string;
    gender: string;
    color?: string;
    microchipNumber?: string;
    isNeutered?: boolean;
  }
}

declare module '@/graphql/queries/userQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_CURRENT_USER: any;
  export const GET_USERS: any;
  export const GET_OWNERS: any;
  export const GET_USER_BY_ID: any;
}

declare module '@/graphql/queries/litterQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_LITTERS: any;
  export const GET_LITTER: any;
  export const GET_DOG_LITTERS: any;
  
  export enum DogRole {
    SIRE = 'SIRE',
    DAM = 'DAM',
    BOTH = 'BOTH'
  }
}

declare module '@/graphql/queries/dogQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_DOGS: any;
  export const GET_DOG_BY_ID: any;
  export const GET_DOG_PEDIGREE: any;
}

declare module '@/graphql/queries/pedigreeQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_BREEDING_RECORDS: any;
}
