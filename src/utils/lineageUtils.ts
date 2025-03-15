// Lineage tracking utility functions

import { PedigreeNode } from '@/components/pedigree/PedigreeChart';

/**
 * Calculate the coefficient of inbreeding for a dog
 * This is the probability that two alleles at a randomly chosen locus are identical by descent
 * 
 * @param dogId The ID of the dog to calculate COI for
 * @param generations The number of generations to consider (1-5)
 * @returns A number between 0 and 1 representing the COI
 */
export const calculateCoefficientOfInbreeding = async (
  dogId: string, 
  generations: number = 5
): Promise<number> => {
  try {
    // In a real app, this would make an API call to fetch the pedigree data
    
    // For now, we'll simulate Wright's path method calculation with a more realistic implementation
    // Step 1: Fetch the pedigree data (mock data for now)
    const pedigree = await fetchDogPedigree(dogId, generations);
    
    // Step 2: Identify all common ancestors
    const commonAncestors = await findCommonAncestors(dogId, generations);
    
    // Step 3: Calculate COI using Wright's path method
    // COI = Σ(0.5^(n1+n2+1) * (1 + Fa))
    // Where:
    // - n1 is the number of generations from the sire to the common ancestor
    // - n2 is the number of generations from the dam to the common ancestor
    // - Fa is the inbreeding coefficient of the common ancestor
    
    let coi = 0;
    for (const ancestor of commonAncestors) {
      // Process each pathway that this ancestor appears in
      for (let i = 0; i < ancestor.pathways.length; i++) {
        for (let j = i + 1; j < ancestor.pathways.length; j++) {
          const path1 = ancestor.pathways[i];
          const path2 = ancestor.pathways[j];
          
          // Only consider distinct pathways from sire and dam
          if (path1[0] === 'Sire' && path2[0] === 'Dam' || 
              path1[0] === 'Dam' && path2[0] === 'Sire') {
            
            // Calculate contribution from this path pair
            const n1 = path1.length;
            const n2 = path2.length;
            const ancestorCOI = ancestor.dog.coiValue || 0; // COI of the ancestor
            
            // Apply Wright's formula
            coi += Math.pow(0.5, n1 + n2) * (1 + ancestorCOI);
          }
        }
      }
    }
    
    // Ensure COI is between 0 and 1
    coi = Math.min(Math.max(coi, 0), 1);
    
    return coi;
  } catch (error) {
    console.error('Error calculating coefficient of inbreeding:', error);
    return 0;
  }
};

/**
 * Fetch a dog's pedigree data
 * 
 * @param dogId The ID of the dog to fetch pedigree for
 * @param generations The number of generations to fetch
 * @returns The pedigree data for the dog
 */
async function fetchDogPedigree(dogId: string, generations: number = 5) {
  // In a real app, this would be an API call
  // For now, return mock data
  return {}; // Mock placeholder
};

/**
 * Type definition for a common ancestor
 */
export type CommonAncestor = {
  dog: PedigreeNode & { coiValue?: number }; // Add COI value for the ancestor
  occurrences: number;
  pathways: string[][];
  geneticContribution?: number; // Percentage of genetic material contributed
};

/**
 * Find common ancestors in a dog's pedigree
 * 
 * @param dogId The ID of the dog to find common ancestors for
 * @param generations The number of generations to consider (1-5)
 * @returns An array of common ancestors with their occurrence count, pathways, and genetic contribution
 */
export const findCommonAncestors = async (
  dogId: string,
  generations: number = 5
): Promise<CommonAncestor[]> => {
  try {
    // In a real app, this would make an API call to fetch the pedigree
    // and analyze it to find common ancestors
    
    // For now, we'll return enhanced mock data with genetic contribution percentages
    const mockCommonAncestors: CommonAncestor[] = [
      {
        dog: {
          id: 'ancestor1',
          name: 'Champion Duke',
          gender: 'male',
          breedName: 'Labrador Retriever',
          registrationNumber: 'AKC111222',
          dateOfBirth: new Date('2016-01-15'),  // Ensuring this is always a Date type as per memory
          isChampion: true,
          healthTested: true,
          color: 'Black',
          coiValue: 0.0375 // This ancestor's own inbreeding coefficient
        },
        occurrences: 2,
        pathways: [
          ['Sire', 'Sire', 'Sire'],
          ['Dam', 'Sire', 'Sire']
        ],
        geneticContribution: 0.125 // 12.5% genetic contribution
      },
      {
        dog: {
          id: 'ancestor2',
          name: 'Belle',
          gender: 'female',
          breedName: 'Labrador Retriever',
          registrationNumber: 'AKC333444',
          dateOfBirth: new Date('2016-06-30'),  // Ensuring this is always a Date type as per memory
          isChampion: false,
          healthTested: true,
          color: 'Black',
          coiValue: 0.025 // This ancestor's own inbreeding coefficient
        },
        occurrences: 1,
        pathways: [
          ['Sire', 'Dam', 'Dam']
        ],
        geneticContribution: 0.0625 // 6.25% genetic contribution
      },
      {
        dog: {
          id: 'ancestor3',
          name: 'Grand Champion Max',
          gender: 'male',
          breedName: 'Labrador Retriever',
          registrationNumber: 'AKC555666',
          dateOfBirth: new Date('2014-03-12'),  // Ensuring this is always a Date type as per memory
          isChampion: true,
          healthTested: true,
          color: 'Yellow',
          coiValue: 0.0125 // This ancestor's own inbreeding coefficient
        },
        occurrences: 3,
        pathways: [
          ['Sire', 'Sire', 'Dam'],
          ['Dam', 'Sire', 'Dam'],
          ['Dam', 'Dam', 'Sire']
        ],
        geneticContribution: 0.1875 // 18.75% genetic contribution
      }
    ];
    
    // Sort by genetic contribution (most significant first)
    return mockCommonAncestors.sort((a, b) => 
      (b.geneticContribution || 0) - (a.geneticContribution || 0)
    );
  } catch (error) {
    console.error('Error finding common ancestors:', error);
    return [];
  }
};

/**
 * Calculate genetic influence of an ancestor
 * 
 * @param pathways Array of pathways from dog to ancestor
 * @returns The genetic influence as a percentage (0-1)
 */
export const calculateGeneticInfluence = (pathways: string[][]): number => {
  let influence = 0;
  
  // Each complete pathway contributes (1/2)^n of genetic material
  // where n is the number of generations
  for (const path of pathways) {
    influence += Math.pow(0.5, path.length);
  }
  
  return influence;
};

/**
 * Get all offspring of a specific dog
 * 
 * @param dogId The ID of the dog to find offspring for
 * @returns An array of dogs that are offspring of the specified dog
 */
export const getOffspring = async (dogId: string): Promise<PedigreeNode[]> => {
  try {
    // In a real app, this would make an API call to fetch all offspring
    
    // For now, we'll return mock data
    const mockOffspring: PedigreeNode[] = [
      {
        id: 'offspring1',
        name: 'Buddy',
        gender: 'male',
        breedName: 'Labrador Retriever',
        registrationNumber: 'AKC999888',
        dateOfBirth: new Date('2022-03-15'),
        isChampion: false,
        healthTested: true,
        color: 'Black',
      },
      {
        id: 'offspring2',
        name: 'Lucy',
        gender: 'female',
        breedName: 'Labrador Retriever',
        registrationNumber: 'AKC777666',
        dateOfBirth: new Date('2022-03-15'),
        isChampion: false,
        healthTested: true,
        color: 'Yellow',
      }
    ];
    
    return mockOffspring;
  } catch (error) {
    console.error('Error getting offspring:', error);
    return [];
  }
};

/**
 * Calculate breeding compatibility between two dogs
 * 
 * @param sireId The ID of the sire (male dog)
 * @param damId The ID of the dam (female dog)
 * @returns A compatibility report with various metrics
 */
export const calculateBreedingCompatibility = async (
  sireId: string,
  damId: string
): Promise<{
  compatibilityScore: number;
  breedingCOI: number;
  commonAncestors: CommonAncestor[];
  risks: string[];
  recommendations: string[];
}> => {
  try {
    // In a real app, this would make API calls to analyze the potential breeding
    
    // For now, we'll return mock data
    return {
      compatibilityScore: 0.75, // 75% compatibility
      breedingCOI: 0.078125, // 7.8125% COI in resulting puppies
      commonAncestors: await findCommonAncestors(sireId),
      risks: [
        'Moderate risk of hip dysplasia due to common ancestor Champion Duke',
        'Low risk of progressive retinal atrophy'
      ],
      recommendations: [
        'Consider genetic testing for hip dysplasia before breeding',
        'Monitor resulting puppies for signs of progressive retinal atrophy'
      ]
    };
  } catch (error) {
    console.error('Error calculating breeding compatibility:', error);
    return {
      compatibilityScore: 0,
      breedingCOI: 0,
      commonAncestors: [],
      risks: ['Error calculating breeding compatibility'],
      recommendations: []
    };
  }
};

/**
 * Record a new litter/breeding
 * 
 * @param breedingData The data for the breeding
 * @returns A success flag and message or error
 */
export const recordBreeding = async (breedingData: {
  sireId: string;
  damId: string;
  breederId: string;
  breedingDate: Date;
  litterSize?: number;
  expected?: boolean;
  puppies?: Array<{
    name: string;
    gender: 'male' | 'female';
    color: string;
    microchipNumber?: string;
    ownerId?: string;
  }>;
}): Promise<{ success: boolean; message: string; breedingId?: string }> => {
  try {
    // In a real app, this would make an API call to record the breeding
    
    // For now, we'll simulate a successful response
    return {
      success: true,
      message: 'Breeding recorded successfully',
      breedingId: 'breeding123'
    };
  } catch (error) {
    console.error('Error recording breeding:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error recording breeding'
    };
  }
};

/**
 * Calculate the percent of a dog's lineage that comes from specific bloodlines
 * 
 * @param dogId The ID of the dog to analyze
 * @param generations The number of generations to consider (1-5)
 * @returns A map of bloodline names to their percentage contribution
 */
export const calculateBloodlinePercentages = async (
  dogId: string,
  generations: number = 5
): Promise<Map<string, number>> => {
  try {
    // In a real app, this would make an API call to analyze the pedigree
    
    // For now, we'll return mock data
    const mockBloodlinePercentages = new Map<string, number>();
    mockBloodlinePercentages.set('Champion Duke Line', 25);
    mockBloodlinePercentages.set('Belle Line', 12.5);
    mockBloodlinePercentages.set('Charlie Line', 37.5);
    mockBloodlinePercentages.set('Daisy Line', 25);
    
    return mockBloodlinePercentages;
  } catch (error) {
    console.error('Error calculating bloodline percentages:', error);
    return new Map();
  }
};
