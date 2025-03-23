import { useQuery, useMutation, QueryResult, MutationResult } from '@apollo/client';
import { 
  GET_GENETIC_TRAITS, 
  GET_GENETIC_TRAIT, 
  GET_DOG_GENOTYPES, 
  GET_BREED_GENETIC_PROFILE,
  GET_GENETIC_TESTS,
  CALCULATE_GENETIC_COMPATIBILITY,
  PREDICT_OFFSPRING_TRAITS,
  RECOMMEND_BREEDING_PAIRS
} from '@/graphql/queries/geneticQueries';
import {
  CREATE_GENETIC_TRAIT,
  UPDATE_GENETIC_TRAIT,
  DELETE_GENETIC_TRAIT,
  CREATE_ALLELE,
  UPDATE_ALLELE,
  DELETE_ALLELE,
  RECORD_DOG_GENOTYPE,
  UPDATE_DOG_GENOTYPE,
  DELETE_DOG_GENOTYPE,
  CREATE_BREED_TRAIT_PREVALENCE,
  UPDATE_BREED_TRAIT_PREVALENCE,
  DELETE_BREED_TRAIT_PREVALENCE,
  SAVE_GENETIC_ANALYSIS
} from '@/graphql/mutations/geneticMutations';

// Type definitions
export type InheritancePattern = 
  | 'AUTOSOMAL_DOMINANT'
  | 'AUTOSOMAL_RECESSIVE'
  | 'X_LINKED_DOMINANT'
  | 'X_LINKED_RECESSIVE'
  | 'POLYGENIC'
  | 'CODOMINANT'
  | 'INCOMPLETE_DOMINANCE'
  | 'EPISTASIS'
  | 'MATERNAL';

export type GeneticTestMethod =
  | 'DNA_TEST'
  | 'PEDIGREE_ANALYSIS'
  | 'PHENOTYPE_EXAMINATION'
  | 'CARRIER_TESTING'
  | 'LINKAGE_TESTING';

export type RiskLevel =
  | 'NONE'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export interface Allele {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  dominant: boolean;
  traitId: string;
}

export interface GeneticTrait {
  id: string;
  name: string;
  description?: string;
  inheritancePattern: InheritancePattern;
  alleles: Allele[];
  breedPrevalence?: BreedTraitPrevalence[];
  healthImplications?: string;
  testingOptions?: GeneticTest[];
}

export interface DogGenotype {
  id: string;
  dogId: string;
  dog?: {
    id: string;
    name: string;
    breed: string;
    registrationNumber: string;
  };
  traitId: string;
  trait?: {
    id: string;
    name: string;
    description?: string;
    inheritancePattern: InheritancePattern;
  };
  genotype: string;
  testMethod?: GeneticTestMethod;
  testDate?: string;
  confidence?: number;
  notes?: string;
}

export interface BreedTraitPrevalence {
  id: string;
  breedId: string;
  breed?: {
    id: string;
    name: string;
  };
  traitId: string;
  trait?: {
    id: string;
    name: string;
    description?: string;
    inheritancePattern: InheritancePattern;
  };
  frequency: number;
  studyReference?: string;
  notes?: string;
}

export interface GeneticTest {
  id: string;
  name: string;
  provider: string;
  description?: string;
  traits: {
    id: string;
    name: string;
  }[];
  accuracy?: number;
  cost?: number;
  turnaroundTime?: number;
  sampleType?: string;
  url?: string;
}

export interface GenotypeOutcome {
  genotype: string;
  probability: number;
  phenotype: string;
  isCarrier: boolean;
  healthImplications?: string;
}

export interface TraitPrediction {
  id: string;
  analysisId: string;
  traitId: string;
  trait: {
    id: string;
    name: string;
    description?: string;
  };
  possibleGenotypes: GenotypeOutcome[];
  notes?: string;
}

export interface GeneticRiskFactor {
  traitId: string;
  trait: {
    id: string;
    name: string;
  };
  riskLevel: RiskLevel;
  description: string;
  recommendations?: string;
}

export interface GeneticAnalysis {
  id: string;
  breedingPairId?: string;
  sireId: string;
  sire: {
    id: string;
    name: string;
    breed: string;
    registrationNumber: string;
  };
  damId: string;
  dam: {
    id: string;
    name: string;
    breed: string;
    registrationNumber: string;
  };
  traitPredictions: TraitPrediction[];
  overallCompatibility: number;
  riskFactors?: GeneticRiskFactor[];
  recommendations?: string;
}

export interface BreedingPair {
  id: string;
  sireId: string;
  sire: {
    id: string;
    name: string;
    breed: string;
    registrationNumber: string;
    mainImageUrl?: string;
  };
  damId: string;
  dam: {
    id: string;
    name: string;
    breed: string;
    registrationNumber: string;
    mainImageUrl?: string;
  };
  geneticCompatibilityScore?: number;
  status: string;
  geneticAnalysis?: {
    id: string;
    overallCompatibility: number;
    recommendations?: string;
  };
}

// Custom hooks for queries
export const useGeneticTraits = (breedId?: string) => {
  return useQuery(GET_GENETIC_TRAITS, {
    variables: { breedId },
    skip: !breedId && breedId !== undefined, // Only skip if breedId is undefined and not null
  });
};

export const useGeneticTrait = (id: string) => {
  return useQuery(GET_GENETIC_TRAIT, {
    variables: { id },
    skip: !id,
  });
};

export const useDogGenotypes = (dogId: string) => {
  return useQuery(GET_DOG_GENOTYPES, {
    variables: { dogId },
    skip: !dogId,
  });
};

export const useBreedGeneticProfile = (breedId: string) => {
  return useQuery(GET_BREED_GENETIC_PROFILE, {
    variables: { breedId },
    skip: !breedId,
  });
};

export const useGeneticTests = () => {
  return useQuery(GET_GENETIC_TESTS);
};

export const useCalculateGeneticCompatibility = (sireId: string, damId: string) => {
  return useQuery(CALCULATE_GENETIC_COMPATIBILITY, {
    variables: { sireId, damId },
    skip: !sireId || !damId,
  });
};

export const usePredictOffspringTraits = (sireId: string, damId: string, traitIds?: string[]) => {
  return useQuery(PREDICT_OFFSPRING_TRAITS, {
    variables: { sireId, damId, traitIds },
    skip: !sireId || !damId,
  });
};

export const useRecommendBreedingPairs = (dogId: string, count?: number) => {
  return useQuery(RECOMMEND_BREEDING_PAIRS, {
    variables: { dogId, count },
    skip: !dogId,
  });
};

// Custom hooks for mutations
export const useCreateGeneticTrait = () => {
  return useMutation(CREATE_GENETIC_TRAIT);
};

export const useUpdateGeneticTrait = () => {
  return useMutation(UPDATE_GENETIC_TRAIT);
};

export const useDeleteGeneticTrait = () => {
  return useMutation(DELETE_GENETIC_TRAIT);
};

export const useCreateAllele = () => {
  return useMutation(CREATE_ALLELE);
};

export const useUpdateAllele = () => {
  return useMutation(UPDATE_ALLELE);
};

export const useDeleteAllele = () => {
  return useMutation(DELETE_ALLELE);
};

export const useRecordDogGenotype = () => {
  return useMutation(RECORD_DOG_GENOTYPE);
};

export const useUpdateDogGenotype = () => {
  return useMutation(UPDATE_DOG_GENOTYPE);
};

export const useDeleteDogGenotype = () => {
  return useMutation(DELETE_DOG_GENOTYPE);
};

export const useCreateBreedTraitPrevalence = () => {
  return useMutation(CREATE_BREED_TRAIT_PREVALENCE);
};

export const useUpdateBreedTraitPrevalence = () => {
  return useMutation(UPDATE_BREED_TRAIT_PREVALENCE);
};

export const useDeleteBreedTraitPrevalence = () => {
  return useMutation(DELETE_BREED_TRAIT_PREVALENCE);
};

export const useSaveGeneticAnalysis = () => {
  return useMutation(SAVE_GENETIC_ANALYSIS);
};
