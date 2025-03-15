import { DogPedigreeData, PedigreeNode } from '@/types/pedigree';
import { apolloClient } from '@/lib/apollo-client';
import { GET_DOG_PEDIGREE } from '@/graphql/queries/pedigreeQueries';

/**
 * Fetches pedigree data for a specific dog by ID using GraphQL
 * @param dogId ID of the dog to fetch pedigree for
 * @returns Promise resolving to the pedigree data
 */
export const getPedigreeData = async (dogId: string): Promise<DogPedigreeData | null> => {
  try {
    const { data } = await apolloClient.query({
      query: GET_DOG_PEDIGREE,
      variables: { dogId, generations: 5 },
      fetchPolicy: 'network-only',
    });

    if (!data || !data.dogPedigree) {
      return null;
    }

    // Transform the GraphQL response to the expected DogPedigreeData format
    const transformPedigreeData = (node: any): DogPedigreeData => {
      const result: DogPedigreeData = {
        id: node.id,
        name: node.name,
        breedName: node.breed || '',
        gender: (node.gender as 'male' | 'female') || 'male',
        dateOfBirth: node.dateOfBirth ? new Date(node.dateOfBirth) : new Date(), // Use default date to avoid undefined
        dateOfDeath: node.dateOfDeath ? new Date(node.dateOfDeath) : undefined,
        registrationNumber: node.registrationNumber || '',
        color: node.color || '',
        isChampion: Boolean(node.titles?.some((t: string) => t.toLowerCase().includes('champion'))),
        hasHealthTests: Boolean(node.healthRecords?.length),
        ownerId: node.currentOwner?.id || '',
        ownerName: node.currentOwner?.name || '',
        sireId: node.sire?.id,
        damId: node.dam?.id,
        sireName: node.sire?.name,
        damName: node.dam?.name,
        sireRegistration: node.sire?.registrationNumber,
        damRegistration: node.dam?.registrationNumber
      };

      // Recursively transform sire and dam data if available
      if (node.sire) {
        (result as any).sire = transformPedigreeData(node.sire);
      }

      if (node.dam) {
        (result as any).dam = transformPedigreeData(node.dam);
      }

      return result;
    };

    return transformPedigreeData(data.dogPedigree);
  } catch (error) {
    console.error('Error fetching pedigree data:', error);
    return null;
  }
};

/**
 * Fetches pedigree data for a specific dog
 * @param dogId ID of the dog to fetch pedigree for
 * @param generations Number of generations to include
 * @returns Promise resolving to the pedigree data
 */
export const fetchPedigreeData = async (
  dogId: string,
  generations: number = 3
): Promise<DogPedigreeData | null> => {
  try {
    const { data } = await apolloClient.query({
      query: GET_DOG_PEDIGREE,
      variables: { dogId, generations },
      fetchPolicy: 'network-only',
    });

    if (!data || !data.dogPedigree) {
      return null;
    }

    // Transform the GraphQL response to the expected DogPedigreeData format
    const transformPedigreeData = (node: any): DogPedigreeData => {
      const result: DogPedigreeData = {
        id: node.id,
        name: node.name,
        breedName: node.breed || '',
        gender: (node.gender as 'male' | 'female') || 'male',
        dateOfBirth: node.dateOfBirth ? new Date(node.dateOfBirth) : new Date(), // Use default date to avoid undefined
        dateOfDeath: node.dateOfDeath ? new Date(node.dateOfDeath) : undefined,
        registrationNumber: node.registrationNumber || '',
        color: node.color || '',
        isChampion: Boolean(node.titles?.some((t: string) => t.toLowerCase().includes('champion'))),
        hasHealthTests: Boolean(node.healthRecords?.length),
        ownerId: node.currentOwner?.id || '',
        ownerName: node.currentOwner?.name || '',
        sireId: node.sire?.id,
        damId: node.dam?.id,
        sireName: node.sire?.name,
        damName: node.dam?.name,
        sireRegistration: node.sire?.registrationNumber,
        damRegistration: node.dam?.registrationNumber
      };

      // Recursively transform sire and dam data if available
      if (node.sire) {
        (result as any).sire = transformPedigreeData(node.sire);
      }

      if (node.dam) {
        (result as any).dam = transformPedigreeData(node.dam);
      }

      return result;
    };

    return transformPedigreeData(data.dogPedigree);
  } catch (error) {
    console.error('Error fetching pedigree data:', error);
    return null;
  }
};

/**
 * Fetches all ancestors for a given dog using GraphQL
 * @param dogId ID of the dog to fetch ancestors for
 * @param generations Number of generations to include
 * @returns Promise resolving to a map of dogs by ID
 */
export const fetchAncestors = async (
  dogId: string,
  generations: number = 3
): Promise<Map<string, DogPedigreeData>> => {
  try {
    const { data } = await apolloClient.query({
      query: GET_DOG_PEDIGREE,
      variables: { dogId, generations },
      fetchPolicy: 'network-only',
    });

    if (!data || !data.dogPedigree) {
      return new Map();
    }

    // Create a map to store all ancestors
    const ancestorsMap = new Map<string, DogPedigreeData>();
    
    // Process the dog and its ancestors recursively
    const processDog = (node: any): void => {
      if (!node) return;
      
      // Transform to DogPedigreeData format
      const dogData: DogPedigreeData = {
        id: node.id,
        name: node.name,
        breedName: node.breed || '',
        gender: (node.gender as 'male' | 'female') || 'male',
        dateOfBirth: node.dateOfBirth ? new Date(node.dateOfBirth) : new Date(),
        dateOfDeath: node.dateOfDeath ? new Date(node.dateOfDeath) : undefined,
        registrationNumber: node.registrationNumber || '',
        color: node.color || '',
        isChampion: Boolean(node.titles?.some((t: string) => t.toLowerCase().includes('champion'))),
        hasHealthTests: Boolean(node.healthRecords?.length),
        ownerId: node.currentOwner?.id || '',
        ownerName: node.currentOwner?.name || '',
        sireId: node.sire?.id,
        damId: node.dam?.id,
        sireName: node.sire?.name,
        damName: node.dam?.name,
        sireRegistration: node.sire?.registrationNumber,
        damRegistration: node.dam?.registrationNumber
      };
      
      // Add to ancestors map
      ancestorsMap.set(node.id, dogData);
      
      // Process sire and dam recursively
      if (node.sire) {
        processDog(node.sire);
      }
      
      if (node.dam) {
        processDog(node.dam);
      }
    };
    
    // Start processing with the root dog
    processDog(data.dogPedigree);
    
    return ancestorsMap;
  } catch (error) {
    console.error('Error fetching ancestors:', error);
    return new Map();
  }
};

/**
 * Calculates the inbreeding coefficient for a given dog
 * @param dogId ID of the dog to calculate the COI for
 * @param ancestorsMap Map of all ancestors
 * @returns The calculated COI (0-1)
 */
export const calculateInbreedingCoefficient = (
  dogId: string,
  ancestorsMap: Map<string, DogPedigreeData>
): number => {
  const dog = ancestorsMap.get(dogId);
  
  // If the dog doesn't exist or doesn't have both parents, COI is 0
  if (!dog || !dog.sireId || !dog.damId) {
    return 0;
  }
  
  // Get parents from the map
  const sire = ancestorsMap.get(dog.sireId);
  const dam = ancestorsMap.get(dog.damId);
  
  // If we can't find the parents in our map, return 0
  if (!sire || !dam) {
    return 0;
  }
  
  // Calculate COI based on common ancestors between sire and dam
  let coi = 0;
  
  // Function to get all ancestors of a dog
  const getAllAncestors = (id: string, ancestorIds = new Set<string>()): Set<string> => {
    const ancestor = ancestorsMap.get(id);
    if (!ancestor) return ancestorIds;
    
    // Add current dog to ancestor set
    ancestorIds.add(id);
    
    // Recursively add parents to ancestor set
    if (ancestor.sireId) {
      getAllAncestors(ancestor.sireId, ancestorIds);
    }
    
    if (ancestor.damId) {
      getAllAncestors(ancestor.damId, ancestorIds);
    }
    
    return ancestorIds;
  };
  
  // Get all ancestors of sire and dam
  const sireAncestors = getAllAncestors(dog.sireId);
  const damAncestors = getAllAncestors(dog.damId);
  
  // Find common ancestors
  const commonAncestors = new Set(
    [...sireAncestors].filter(id => damAncestors.has(id))
  );
  
  // Calculate COI contribution for each common ancestor
  commonAncestors.forEach(ancestorId => {
    coi += calculatePathCoefficient(ancestorId, dog.sireId, dog.damId, ancestorsMap);
  });
  
  return coi;
};

/**
 * Calculates the path coefficient for a common ancestor
 * @param ancestorId ID of the common ancestor
 * @param sireId ID of the sire
 * @param damId ID of the dam
 * @param ancestorsMap Map of all ancestors
 * @returns The path coefficient for this ancestor
 */
const calculatePathCoefficient = (
  ancestorId: string,
  sireId: string | undefined,
  damId: string | undefined,
  ancestorsMap: Map<string, DogPedigreeData>
): number => {
  // Calculate the number of generations from sire to ancestor
  const sireGenerations = sireId ? countGenerations(ancestorId, sireId, ancestorsMap) : 0;
  
  // Calculate the number of generations from dam to ancestor
  const damGenerations = damId ? countGenerations(ancestorId, damId, ancestorsMap) : 0;
  
  // Formula: (1/2)^(sireGenerations + damGenerations)
  return Math.pow(0.5, sireGenerations + damGenerations);
};

/**
 * Counts the number of generations between an ancestor and a descendant
 * @param ancestorId ID of the ancestor
 * @param descendantId ID of the descendant
 * @param ancestorsMap Map of all ancestors
 * @returns The number of generations
 */
const countGenerations = (
  ancestorId: string,
  descendantId: string | undefined,
  ancestorsMap: Map<string, DogPedigreeData>
): number => {
  // If descendantId is undefined, return -1 to indicate no connection
  if (!descendantId) {
    return -1;
  }
  
  // Base case: If they're the same dog, 0 generations
  if (ancestorId === descendantId) {
    return 0;
  }
  
  const descendant = ancestorsMap.get(descendantId);
  if (!descendant) return 0;
  
  // Try paths through sire and dam
  if (descendant.sireId) {
    const sirePath = countGenerations(ancestorId, descendant.sireId, ancestorsMap);
    if (sirePath >= 0) {
      return sirePath + 1;
    }
  }
  
  if (descendant.damId) {
    const damPath = countGenerations(ancestorId, descendant.damId, ancestorsMap);
    if (damPath >= 0) {
      return damPath + 1;
    }
  }
  
  // If no path is found, return -1 to indicate no connection
  return -1;
};
