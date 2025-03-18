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
  export const SEARCH_DOGS: any;
  export const LINK_DOG_TO_PARENTS: any;
  export const GET_USER_DOGS: any;
  export const GET_DOG: any;
  
  export enum DogSortField {
    NAME = 'NAME',
    BREED = 'BREED',
    DATE_OF_BIRTH = 'DATE_OF_BIRTH',
    REGISTRATION_NUMBER = 'REGISTRATION_NUMBER',
    CREATED_AT = 'CREATED_AT'
  }
  
  export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC'
  }
}

declare module '@/graphql/queries/breedQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_BREEDS: any;
  export const GET_BREED_BY_ID: any;
  export const GET_BREED_BY_NAME: any;
  export const GET_BREED_GROUPS: any;
  export const SEARCH_BREEDS: any;
  
  export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC'
  }
}

declare module '@/graphql/queries/pedigreeQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_BREEDING_RECORDS: any;
  export const GET_DOG_PEDIGREE: any;
  export const GET_LINEBREEDING_ANALYSIS: any;
  export const CREATE_PEDIGREE: any;
  export const CREATE_BREEDING_RECORD: any;
  
  export enum BreedingRole {
    SIRE = 'SIRE',
    DAM = 'DAM',
    BOTH = 'BOTH'
  }
}

declare module '@/graphql/queries/healthRecordQueries' {
  import { gql } from '@apollo/client';
  
  export const HEALTH_RECORD_FIELDS: any;
  export const HEALTH_RECORD_WITH_DOG: any;
  export const GET_DOG_HEALTH_RECORDS: any;
  export const GET_HEALTH_RECORD: any;
  export const GET_HEALTH_SUMMARY: any;
  export const CREATE_HEALTH_RECORD: any;
  export const UPDATE_HEALTH_RECORD: any;
  export const DELETE_HEALTH_RECORD: any;
  export const UPLOAD_HEALTH_RECORD_ATTACHMENT: any;
}

declare module '@/graphql/queries/competitionQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_COMPETITION_RESULTS: any;
  export const GET_COMPETITION_RESULT: any;
  export const GET_DOG_COMPETITION_STATS: any;
  export const GET_RELATED_COMPETITIONS: any;
}

declare module '@/graphql/queries/dashboardQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_DASHBOARD_SUMMARY: any;
  export const GET_RECENT_DOGS: any;
  export const GET_RECENT_HEALTH_RECORDS: any;
  export const GET_RECENT_COMPETITIONS: any;
  export const GET_BREEDING_RECORDS: any;
  export const GET_FEATURED_PEDIGREES: any;
}

declare module '@/graphql/queries/ownershipQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_DOG_OWNERSHIPS: any;
  export const GET_OWNER_DOGS: any;
  export const GET_OWNERSHIP: any;
}

declare module '@/graphql/queries/plannedMatingQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_PLANNED_MATINGS: any;
  export const GET_PLANNED_MATING: any;
  export const GET_BREEDING_PROGRAM_MATINGS: any;
  export const GET_DOG_PLANNED_MATINGS: any;
}

declare module '@/graphql/queries/breedingProgramQueries' {
  import { gql } from '@apollo/client';
  
  export const GET_BREEDING_PROGRAMS: any;
  export const GET_BREEDING_PROGRAM: any;
  export const GET_BREEDER_BREEDING_PROGRAMS: any;
}
