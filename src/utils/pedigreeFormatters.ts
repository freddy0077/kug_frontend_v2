/**
 * Utility functions for processing and formatting pedigree data
 */

export interface PedigreeData {
  dog: DogNode;
  parents?: {
    sire?: DogNode;
    dam?: DogNode;
  };
  grandparents?: {
    paternalGrandsire?: DogNode;
    paternalGranddam?: DogNode;
    maternalGrandsire?: DogNode;
    maternalGranddam?: DogNode;
  };
  greatGrandparents?: {
    paternalPaternalGreatGrandsire?: DogNode;
    paternalPaternalGreatGranddam?: DogNode;
    paternalMaternalGreatGrandsire?: DogNode;
    paternalMaternalGreatGranddam?: DogNode;
    maternalPaternalGreatGrandsire?: DogNode;
    maternalPaternalGreatGranddam?: DogNode;
    maternalMaternalGreatGrandsire?: DogNode;
    maternalMaternalGreatGranddam?: DogNode;
  };
}

export interface DogNode {
  id?: string;
  name: string;
  registrationNumber?: string;
  microchipNumber?: string;
  breed?: string;
  breedObj?: {
    id: string;
    name: string;
    group?: string;
    origin?: string;
    temperament?: string;
  };
  gender?: string;
  dateOfBirth?: string | Date;
  dateOfDeath?: string | Date;
  color?: string;
  isChampion?: boolean;
  healthTested?: boolean;
  ownerId?: string;
  titles?: string[];
  mainImageUrl?: string;
  coefficient?: number;
  sire?: DogNode | null;
  dam?: DogNode | null;
  breeder?: {
    id?: string;
    name: string;
  };
}

/**
 * Extracts all dogs from a pedigree structure into a flat fourth-generation map
 * for use with the PedigreeChart component
 */
export function extractFourthGeneration(dogPedigree: DogNode): Record<string, DogNode | null> {
  const result: Record<string, DogNode | null> = {
    // Path structure follows the pattern of [sire/dam][Sire/Dam][Sire/Dam]
    sireSireSire: dogPedigree?.sire?.sire?.sire || null,
    sireSireDam: dogPedigree?.sire?.sire?.dam || null,
    sireDamSire: dogPedigree?.sire?.dam?.sire || null,
    sireDamDam: dogPedigree?.sire?.dam?.dam || null,
    damSireSire: dogPedigree?.dam?.sire?.sire || null,
    damSireDam: dogPedigree?.dam?.sire?.dam || null, 
    damDamSire: dogPedigree?.dam?.dam?.sire || null,
    damDamDam: dogPedigree?.dam?.dam?.dam || null
  };
  
  return result;
}

/**
 * Formats a date string in a user-friendly format
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return "Invalid Date";
  }
}

/**
 * Calculate the completion percentage of a pedigree up to specified generations
 */
export function transformGraphQLPedigree(dogPedigree: DogNode): PedigreeData {
  if (!dogPedigree) return { dog: {} as DogNode };

  // Transform the main dog
  const dog: DogNode = {
    id: dogPedigree?.id,
    name: dogPedigree.name,
    gender: dogPedigree.gender,
    ownerId: dogPedigree.ownerId,
    breedObj: dogPedigree.breedObj,
    breed: dogPedigree.breed || 'Unknown Breed',
    registrationNumber: dogPedigree.registrationNumber,
    dateOfBirth: dogPedigree.dateOfBirth,
    color: dogPedigree.color,
    mainImageUrl: dogPedigree.mainImageUrl,
  };

  // Transform parents
  const parents = dogPedigree.sire || dogPedigree.dam ? {
    sire: dogPedigree.sire ? {
      ...dogPedigree.sire,
      breed: dogPedigree.sire.breed || 'Unknown Breed'
    } : undefined,
    dam: dogPedigree.dam ? {
      ...dogPedigree.dam,
      breed: dogPedigree.dam.breed || 'Unknown Breed'
    } : undefined,
  } : undefined;

  // Transform grandparents
  const grandparents = (dogPedigree.sire?.sire || dogPedigree.sire?.dam || dogPedigree.dam?.sire || dogPedigree.dam?.dam) ? {
    paternalGrandsire: dogPedigree.sire?.sire ? {
      ...dogPedigree.sire.sire,
      breed: dogPedigree.sire.sire.breed || 'Unknown Breed'
    } : undefined,
    paternalGranddam: dogPedigree.sire?.dam ? {
      ...dogPedigree.sire.dam,
      breed: dogPedigree.sire.dam.breed || 'Unknown Breed'
    } : undefined,
    maternalGrandsire: dogPedigree.dam?.sire ? {
      ...dogPedigree.dam.sire,
      breed: dogPedigree.dam.sire.breed || 'Unknown Breed'
    } : undefined,
    maternalGranddam: dogPedigree.dam?.dam ? {
      ...dogPedigree.dam.dam,
      breed: dogPedigree.dam.dam.breed || 'Unknown Breed'
    } : undefined,
  } : undefined;

  // Transform great grandparents
  const greatGrandparents = (dogPedigree.sire?.sire?.sire || dogPedigree.sire?.sire?.dam || 
                           dogPedigree.sire?.dam?.sire || dogPedigree.sire?.dam?.dam || 
                           dogPedigree.dam?.sire?.sire || dogPedigree.dam?.sire?.dam || 
                           dogPedigree.dam?.dam?.sire || dogPedigree.dam?.dam?.dam) ? {
    paternalPaternalGreatGrandsire: dogPedigree.sire?.sire?.sire ? {
      ...dogPedigree.sire.sire.sire,
      breed: dogPedigree.sire.sire.sire.breed || 'Unknown Breed'
    } : undefined,
    paternalPaternalGreatGranddam: dogPedigree.sire?.sire?.dam ? {
      ...dogPedigree.sire.sire.dam,
      breed: dogPedigree.sire.sire.dam.breed || 'Unknown Breed'
    } : undefined,
    paternalMaternalGreatGrandsire: dogPedigree.sire?.dam?.sire ? {
      ...dogPedigree.sire.dam.sire,
      breed: dogPedigree.sire.dam.sire.breed || 'Unknown Breed'
    } : undefined,
    paternalMaternalGreatGranddam: dogPedigree.sire?.dam?.dam ? {
      ...dogPedigree.sire.dam.dam,
      breed: dogPedigree.sire.dam.dam.breed || 'Unknown Breed'
    } : undefined,
    maternalPaternalGreatGrandsire: dogPedigree.dam?.sire?.sire ? {
      ...dogPedigree.dam.sire.sire,
      breed: dogPedigree.dam.sire.sire.breed || 'Unknown Breed'
    } : undefined,
    maternalPaternalGreatGranddam: dogPedigree.dam?.sire?.dam ? {
      ...dogPedigree.dam.sire.dam,
      breed: dogPedigree.dam.sire.dam.breed || 'Unknown Breed'
    } : undefined,
    maternalMaternalGreatGrandsire: dogPedigree.dam?.dam?.sire ? {
      ...dogPedigree.dam.dam.sire,
      breed: dogPedigree.dam.dam.sire.breed || 'Unknown Breed'
    } : undefined,
    maternalMaternalGreatGranddam: dogPedigree.dam?.dam?.dam ? {
      ...dogPedigree.dam.dam.dam,
      breed: dogPedigree.dam.dam.dam.breed || 'Unknown Breed'
    } : undefined,
  } : undefined;

  return {
    dog,
    parents,
    grandparents,
    greatGrandparents,
  };
}

export function calculatePedigreeCompleteness(dogPedigree: DogNode, generations = 3): number {
  if (!dogPedigree) return 0;
  
  // Count existing dogs and potential spots in the pedigree
  let existingDogs = 0;
  let totalSpots = 0;
  
  // Root dog (always exists if we have a pedigree)
  existingDogs++;
  totalSpots++;
  
  // Generation 2 (parents)
  if (generations >= 2) {
    totalSpots += 2; // Sire and Dam spots
    if (dogPedigree.sire) existingDogs++;
    if (dogPedigree.dam) existingDogs++;
    
    // Generation 3 (grandparents)
    if (generations >= 3) {
      totalSpots += 4; // 4 grandparent spots
      if (dogPedigree.sire?.sire) existingDogs++;
      if (dogPedigree.sire?.dam) existingDogs++;
      if (dogPedigree.dam?.sire) existingDogs++;
      if (dogPedigree.dam?.dam) existingDogs++;
      
      // Generation 4 (great-grandparents)
      if (generations >= 4) {
        totalSpots += 8; // 8 great-grandparent spots
        if (dogPedigree.sire?.sire?.sire) existingDogs++;
        if (dogPedigree.sire?.sire?.dam) existingDogs++;
        if (dogPedigree.sire?.dam?.sire) existingDogs++;
        if (dogPedigree.sire?.dam?.dam) existingDogs++;
        if (dogPedigree.dam?.sire?.sire) existingDogs++;
        if (dogPedigree.dam?.sire?.dam) existingDogs++;
        if (dogPedigree.dam?.dam?.sire) existingDogs++;
        if (dogPedigree.dam?.dam?.dam) existingDogs++;
      }
    }
  }
  
  return Math.round((existingDogs / totalSpots) * 100);
}
