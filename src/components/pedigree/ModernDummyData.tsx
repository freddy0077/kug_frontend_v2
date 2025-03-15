'use client';

import { DogPedigreeData } from '@/types/pedigree';

// Helper function to create a sample dog entry
export const createSampleDog = (
  id: string, 
  name: string, 
  gender: 'male' | 'female', 
  generation: number,
  isChampion: boolean = Math.random() > 0.7,
  hasHealthTests: boolean = Math.random() > 0.5
): DogPedigreeData => {
  // Generate a mock registration number
  const regPrefix = gender === 'male' ? 'M' : 'F';
  const regNumber = `${regPrefix}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  
  // Generate a birth date between 2 and 10 years ago
  const currentYear = new Date().getFullYear();
  const randomYear = currentYear - Math.floor(Math.random() * 8) - 2;
  const randomMonth = Math.floor(Math.random() * 12);
  const randomDay = Math.floor(Math.random() * 28) + 1;
  const birthDate = new Date(randomYear, randomMonth, randomDay);
  
  return {
    id,
    name,
    registrationNumber: regNumber,
    breedName: 'Labrador Retriever',
    color: gender === 'male' ? 'Black' : 'Yellow',
    gender,
    dateOfBirth: birthDate,
    isChampion,
    hasHealthTests,
    ownerId: `owner-${Math.floor(Math.random() * 100)}`,
    ownerName: `Owner ${Math.floor(Math.random() * 100)}`,
    sireId: generation < 4 ? `${id}-sire` : undefined,
    damId: generation < 4 ? `${id}-dam` : undefined,
    sireName: generation < 4 ? `Sire of ${name}` : undefined,
    sireRegistration: generation < 4 ? `M-${Math.floor(Math.random() * 10000)}` : undefined,
    damName: generation < 4 ? `Dam of ${name}` : undefined,
    damRegistration: generation < 4 ? `F-${Math.floor(Math.random() * 10000)}` : undefined
  };
};

// Create a complete sample pedigree data structure
export const createSamplePedigreeData = (): Map<string, DogPedigreeData> => {
  const pedigreeMap = new Map<string, DogPedigreeData>();
  
  // Root dog
  const rootDog = createSampleDog('dog-root', 'Champion Shadow', 'male', 0, true, true);
  pedigreeMap.set(rootDog.id, rootDog);
  
  // Create a recursive function to populate the pedigree tree
  const populateAncestors = (dogId: string, generation: number) => {
    if (generation >= 4) return; // Limit to 4 generations
    
    const dog = pedigreeMap.get(dogId);
    if (!dog) return;
    
    // Sire (father)
    if (dog.sireId) {
      const sireName = generation === 0 
        ? 'Grand Champion Rex' 
        : `${Math.random() > 0.3 ? 'Ch. ' : ''}Sire Gen${generation}`;
      const sire = createSampleDog(dog.sireId, sireName, 'male', generation + 1);
      pedigreeMap.set(sire.id, sire);
      populateAncestors(sire.id, generation + 1);
      
      // Update parent references
      dog.sireName = sire.name;
      dog.sireRegistration = sire.registrationNumber;
    }
    
    // Dam (mother)
    if (dog.damId) {
      const damName = generation === 0 
        ? 'Lady Bella' 
        : `${Math.random() > 0.3 ? 'Ch. ' : ''}Dam Gen${generation}`;
      const dam = createSampleDog(dog.damId, damName, 'female', generation + 1);
      pedigreeMap.set(dam.id, dam);
      populateAncestors(dam.id, generation + 1);
      
      // Update parent references
      dog.damName = dam.name;
      dog.damRegistration = dam.registrationNumber;
    }
  };
  
  // Start populating from the root
  populateAncestors(rootDog.id, 0);
  
  return pedigreeMap;
};

// Utility function to calculate a realistic coefficient of inbreeding for sample data
export const calculateSampleCOI = (): number => {
  // Return a realistic COI between 3% and 15%
  return 0.03 + Math.random() * 0.12;
};
