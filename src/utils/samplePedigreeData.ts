import { DogPedigreeData } from '@/types/pedigree';

// Sample pedigree data with multiple generations
export const createSamplePedigreeData = (): Map<string, DogPedigreeData> => {
  const pedigreeMap = new Map<string, DogPedigreeData>();
  
  // Generation 0 (Root dog)
  const rootDog: DogPedigreeData = {
    id: 'dog-root',
    name: 'Champion Maximus Rex',
    registrationNumber: 'AKC-123456',
    breedName: 'German Shepherd',
    color: 'Black and Tan',
    gender: 'male',
    dateOfBirth: new Date('2022-01-15'),
    isChampion: true,
    hasHealthTests: true,
    ownerId: 'owner1',
    ownerName: 'John Smith',
    sireId: 'dog-sire1',
    damId: 'dog-dam1'
  };
  pedigreeMap.set(rootDog.id, rootDog);
  
  // Generation 1 (Parents)
  const sire1: DogPedigreeData = {
    id: 'dog-sire1',
    name: 'Thor the Magnificent',
    registrationNumber: 'AKC-234567',
    breedName: 'German Shepherd',
    color: 'Black and Tan',
    gender: 'male',
    dateOfBirth: new Date('2019-03-20'),
    isChampion: true,
    hasHealthTests: true,
    ownerId: 'owner2',
    ownerName: 'Sarah Johnson',
    sireId: 'dog-sire2',
    damId: 'dog-dam2'
  };
  pedigreeMap.set(sire1.id, sire1);
  
  const dam1: DogPedigreeData = {
    id: 'dog-dam1',
    name: 'Luna Star',
    registrationNumber: 'AKC-345678',
    breedName: 'German Shepherd',
    color: 'Black',
    gender: 'female',
    dateOfBirth: new Date('2019-05-12'),
    isChampion: false,
    hasHealthTests: true,
    ownerId: 'owner3',
    ownerName: 'Michael Brown',
    sireId: 'dog-sire3',
    damId: 'dog-dam3'
  };
  pedigreeMap.set(dam1.id, dam1);
  
  // Generation 2 (Grandparents - Sire's parents)
  const sire2: DogPedigreeData = {
    id: 'dog-sire2',
    name: 'Champion Zeus',
    registrationNumber: 'AKC-456789',
    breedName: 'German Shepherd',
    color: 'Black and Tan',
    gender: 'male',
    dateOfBirth: new Date('2016-07-23'),
    isChampion: true,
    hasHealthTests: true,
    ownerId: 'owner4',
    ownerName: 'Robert Davis',
    sireId: 'dog-sire4',
    damId: 'dog-dam4'
  };
  pedigreeMap.set(sire2.id, sire2);
  
  const dam2: DogPedigreeData = {
    id: 'dog-dam2',
    name: 'Aurora Borealis',
    registrationNumber: 'AKC-567890',
    breedName: 'German Shepherd',
    color: 'Black and Tan',
    gender: 'female',
    dateOfBirth: new Date('2017-01-30'),
    isChampion: true,
    hasHealthTests: false,
    ownerId: 'owner5',
    ownerName: 'Elizabeth Wilson',
    sireId: 'dog-sire5',
    damId: 'dog-dam5'
  };
  pedigreeMap.set(dam2.id, dam2);
  
  // Generation 2 (Grandparents - Dam's parents)
  const sire3: DogPedigreeData = {
    id: 'dog-sire3',
    name: 'Apollo',
    registrationNumber: 'AKC-678901',
    breedName: 'German Shepherd',
    color: 'Black',
    gender: 'male',
    dateOfBirth: new Date('2015-11-05'),
    isChampion: false,
    hasHealthTests: true,
    ownerId: 'owner6',
    ownerName: 'James Miller',
    sireId: 'dog-sire6',
    damId: 'dog-dam6'
  };
  pedigreeMap.set(sire3.id, sire3);
  
  const dam3: DogPedigreeData = {
    id: 'dog-dam3',
    name: 'Stella Nova',
    registrationNumber: 'AKC-789012',
    breedName: 'German Shepherd',
    color: 'Black and Silver',
    gender: 'female',
    dateOfBirth: new Date('2016-09-18'),
    isChampion: false,
    hasHealthTests: true,
    ownerId: 'owner7',
    ownerName: 'Patricia Moore',
    sireId: 'dog-sire7',
    damId: 'dog-dam7'
  };
  pedigreeMap.set(dam3.id, dam3);
  
  // Generation 3 (Great Grandparents - Limited subset for example)
  const sire4: DogPedigreeData = {
    id: 'dog-sire4',
    name: 'Odin the Wise',
    registrationNumber: 'AKC-890123',
    breedName: 'German Shepherd',
    color: 'Black and Tan',
    gender: 'male',
    dateOfBirth: new Date('2013-04-12'),
    isChampion: true,
    hasHealthTests: true,
    ownerId: 'owner8',
    ownerName: 'Thomas Taylor',
    sireId: undefined,
    damId: undefined
  };
  pedigreeMap.set(sire4.id, sire4);
  
  const dam4: DogPedigreeData = {
    id: 'dog-dam4',
    name: 'Freya',
    registrationNumber: 'AKC-901234',
    breedName: 'German Shepherd',
    color: 'Black and Red',
    gender: 'female',
    dateOfBirth: new Date('2014-02-28'),
    isChampion: false,
    hasHealthTests: true,
    ownerId: 'owner9',
    ownerName: 'Jennifer Anderson',
    sireId: undefined,
    damId: undefined
  };
  pedigreeMap.set(dam4.id, dam4);
  
  // Add more dogs to complete the pedigree as needed
  
  return pedigreeMap;
};
