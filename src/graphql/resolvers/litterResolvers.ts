// Custom error class to match apollo-server-micro's ApolloError signature
class ApolloError extends Error {
  constructor(message: string, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (code) this.extensions = { code };
  }
  extensions: { code?: string } = {};
}
import { 
  Litter,
  LitterInput,
  UpdateLitterInput,
  RegisterLitterPuppiesInput,
  Dog,
  DogRole,
  RegisterLitterPuppiesResponse
} from '@/graphql/types';
import { formatISO } from 'date-fns';
import { validateRequiredFields, validateDateFormat } from '../../utils/validators';
import { checkOwnership } from '../../utils/authHelpers';

// Mock database for demonstration purposes
// In a real implementation, these would be replaced with actual database calls
let litters: Litter[] = [];
let dogs: Dog[] = [];
let nextLitterId = 1;
let nextDogId = 1;

export const litterResolvers = {
  Query: {
    /**
     * Query to retrieve a paginated list of litters with various filtering options
     */
    litters: async (_, { 
      offset = 0, 
      limit = 20, 
      ownerId, 
      breedId, 
      fromDate, 
      toDate, 
      searchTerm 
    }, context) => {
      // Check authorization
      const { user } = context;
      if (!user) {
        throw new ApolloError('Not authenticated', 'UNAUTHENTICATED');
      }
      
      // Apply filters
      let filteredLitters = [...litters];
      
      if (ownerId) {
        // Filter litters where sire or dam's owner matches the given ownerId
        filteredLitters = filteredLitters.filter(litter => {
          const sire = dogs.find(dog => dog.id === litter.sire.id);
          const dam = dogs.find(dog => dog.id === litter.dam.id);
          return (sire?.currentOwner?.id === ownerId || dam?.currentOwner?.id === ownerId);
        });
      }
      
      if (breedId) {
        // Filter litters with the specified breed
        filteredLitters = filteredLitters.filter(litter => {
          const sire = dogs.find(dog => dog.id === litter.sire.id);
          return sire?.breedObj?.id === breedId;
        });
      }
      
      if (fromDate) {
        const from = new Date(fromDate);
        filteredLitters = filteredLitters.filter(litter => 
          new Date(litter.whelpingDate) >= from
        );
      }
      
      if (toDate) {
        const to = new Date(toDate);
        filteredLitters = filteredLitters.filter(litter => 
          new Date(litter.whelpingDate) <= to
        );
      }
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredLitters = filteredLitters.filter(litter => 
          litter.litterName.toLowerCase().includes(term) ||
          (litter.registrationNumber && litter.registrationNumber.toLowerCase().includes(term))
        );
      }
      
      // Calculate pagination
      const totalCount = filteredLitters.length;
      const hasMore = offset + limit < totalCount;
      const items = filteredLitters.slice(offset, offset + limit);
      
      return {
        totalCount,
        hasMore,
        items
      };
    },
    
    /**
     * Query to retrieve a specific litter by ID
     */
    litter: async (_, { id }, context) => {
      // Check authorization
      const { user } = context;
      if (!user) {
        throw new ApolloError('Not authenticated', 'UNAUTHENTICATED');
      }
      
      // Find litter by ID
      const litter = litters.find(l => l.id === id);
      if (!litter) {
        throw new ApolloError('Litter not found', 'NOT_FOUND');
      }
      
      return litter;
    },
    
    /**
     * Query to retrieve litters associated with a specific dog (as sire, dam, or both)
     */
    dogLitters: async (_, { dogId, role = 'BOTH', offset = 0, limit = 20 }, context) => {
      // Check authorization
      const { user } = context;
      if (!user) {
        throw new ApolloError('Not authenticated', 'UNAUTHENTICATED');
      }
      
      // Find the dog
      const dog = dogs.find(d => d.id === dogId);
      if (!dog) {
        throw new ApolloError('Dog not found', 'NOT_FOUND');
      }
      
      // Filter litters based on the dog's role
      let filteredLitters = [];
      
      if (role === 'SIRE' || role === 'BOTH') {
        const sireLitters = litters.filter(litter => litter.sire.id === dogId);
        filteredLitters = [...filteredLitters, ...sireLitters];
      }
      
      if (role === 'DAM' || role === 'BOTH') {
        const damLitters = litters.filter(litter => litter.dam.id === dogId);
        filteredLitters = [...filteredLitters, ...damLitters];
      }
      
      // Remove duplicates if any (should not happen with proper data)
      filteredLitters = filteredLitters.filter((litter, index, self) => 
        index === self.findIndex(l => l.id === litter.id)
      );
      
      // Calculate pagination
      const totalCount = filteredLitters.length;
      const hasMore = offset + limit < totalCount;
      const items = filteredLitters.slice(offset, offset + limit);
      
      return {
        totalCount,
        hasMore,
        items
      };
    }
  },
  
  Mutation: {
    /**
     * Mutation to create a new litter
     */
    createLitter: async (_, { input }, context) => {
      // Check authorization
      const { user } = context;
      if (!user) {
        throw new ApolloError('Not authenticated', 'UNAUTHENTICATED');
      }
      
      // Validate user role
      if (!['ADMIN', 'OWNER', 'BREEDER'].includes(user.role)) {
        throw new ApolloError('Not authorized to create litters', 'FORBIDDEN');
      }
      
      // Validate required fields
      validateRequiredFields(input, ['sireId', 'damId', 'litterName', 'whelpingDate', 'totalPuppies']);
      
      // Validate date format
      validateDateFormat(input.whelpingDate, 'whelpingDate');
      
      // Ensure whelping date is not in the future
      const whelpingDate = new Date(input.whelpingDate);
      if (whelpingDate > new Date()) {
        throw new ApolloError('Whelping date cannot be in the future', 'INVALID_INPUT');
      }
      
      // Find sire and dam
      const sire = dogs.find(dog => dog.id === input.sireId);
      if (!sire) {
        throw new ApolloError('Sire not found', 'NOT_FOUND');
      }
      
      const dam = dogs.find(dog => dog.id === input.damId);
      if (!dam) {
        throw new ApolloError('Dam not found', 'NOT_FOUND');
      }
      
      // Check gender of sire and dam
      if (sire.gender !== 'male') {
        throw new ApolloError('Sire must be male', 'INVALID_INPUT');
      }
      
      if (dam.gender !== 'female') {
        throw new ApolloError('Dam must be female', 'INVALID_INPUT');
      }
      
      // Check ownership - user must own either the sire or dam
      if (user.role !== 'ADMIN') {
        const isOwner = checkOwnership(user, sire) || checkOwnership(user, dam);
        if (!isOwner) {
          throw new ApolloError('You must be the owner of either the sire or dam', 'FORBIDDEN');
        }
      }
      
      // Create new litter
      const now = formatISO(new Date());
      const newLitter: Litter = {
        id: String(nextLitterId++),
        litterName: input.litterName,
        registrationNumber: input.registrationNumber || null,
        breedingRecordId: input.breedingRecordId || null,
        whelpingDate: input.whelpingDate,
        totalPuppies: input.totalPuppies,
        malePuppies: input.malePuppies || 0,
        femalePuppies: input.femalePuppies || 0,
        notes: input.notes || null,
        sire: {
          id: sire.id,
          name: sire.name,
          breed: sire.breed,
          registrationNumber: sire.registrationNumber,
          gender: sire.gender,
          dateOfBirth: sire.dateOfBirth,
          mainImageUrl: sire.mainImageUrl,
          owner: sire.currentOwner
        },
        dam: {
          id: dam.id,
          name: dam.name,
          breed: dam.breed,
          registrationNumber: dam.registrationNumber,
          gender: dam.gender,
          dateOfBirth: dam.dateOfBirth,
          mainImageUrl: dam.mainImageUrl,
          owner: dam.currentOwner
        },
        puppies: [],
        createdAt: now,
        updatedAt: now
      };
      
      // Add puppies if provided
      if (input.puppyDetails && input.puppyDetails.length > 0) {
        const puppies = input.puppyDetails.map(puppyDetail => {
          // Create a new dog record for each puppy
          const puppyId = String(nextDogId++);
          const newPuppy = {
            id: puppyId,
            name: puppyDetail.name,
            gender: puppyDetail.gender,
            breed: sire.breed, // Inherit breed from parents
            dateOfBirth: input.whelpingDate, // Use whelping date
            color: puppyDetail.color || null,
            markings: puppyDetail.markings || null,
            microchipNumber: puppyDetail.microchipNumber || null,
            registrationNumber: null, // Will be assigned later
            sire: {
              id: sire.id,
              name: sire.name
            },
            dam: {
              id: dam.id,
              name: dam.name
            },
            litter: {
              id: newLitter.id,
              litterName: newLitter.litterName
            },
            createdAt: now,
            updatedAt: now
          };
          
          // Add to dogs array
          dogs.push(newPuppy);
          
          return newPuppy;
        });
        
        newLitter.puppies = puppies;
      }
      
      // Save to database
      litters.push(newLitter);
      
      return newLitter;
    },
    
    /**
     * Mutation to update an existing litter
     */
    updateLitter: async (_, { id, input }, context) => {
      // Check authorization
      const { user } = context;
      if (!user) {
        throw new ApolloError('Not authenticated', 'UNAUTHENTICATED');
      }
      
      // Find litter
      const litterIndex = litters.findIndex(l => l.id === id);
      if (litterIndex === -1) {
        throw new ApolloError('Litter not found', 'NOT_FOUND');
      }
      
      const litter = litters[litterIndex];
      
      // Check permissions - only admin or owner of sire/dam can update
      if (user.role !== 'ADMIN') {
        const sire = dogs.find(dog => dog.id === litter.sire.id);
        const dam = dogs.find(dog => dog.id === litter.dam.id);
        
        const isOwner = (sire && checkOwnership(user, sire)) || (dam && checkOwnership(user, dam));
        if (!isOwner) {
          throw new ApolloError('Not authorized to update this litter', 'FORBIDDEN');
        }
      }
      
      // Validate date format if provided
      if (input.whelpingDate) {
        validateDateFormat(input.whelpingDate, 'whelpingDate');
        
        // Ensure whelping date is not in the future
        const whelpingDate = new Date(input.whelpingDate);
        if (whelpingDate > new Date()) {
          throw new ApolloError('Whelping date cannot be in the future', 'INVALID_INPUT');
        }
      }
      
      // Update litter
      const updatedLitter = {
        ...litter,
        litterName: input.litterName || litter.litterName,
        registrationNumber: input.registrationNumber !== undefined ? input.registrationNumber : litter.registrationNumber,
        whelpingDate: input.whelpingDate || litter.whelpingDate,
        totalPuppies: input.totalPuppies !== undefined ? input.totalPuppies : litter.totalPuppies,
        malePuppies: input.malePuppies !== undefined ? input.malePuppies : litter.malePuppies,
        femalePuppies: input.femalePuppies !== undefined ? input.femalePuppies : litter.femalePuppies,
        notes: input.notes !== undefined ? input.notes : litter.notes,
        updatedAt: formatISO(new Date())
      };
      
      // Save to database
      litters[litterIndex] = updatedLitter;
      
      return updatedLitter;
    },
    
    /**
     * Mutation to register puppies for a litter
     */
    registerLitterPuppies: async (_, { input }, context) => {
      // Check authorization
      const { user } = context;
      if (!user) {
        throw new ApolloError('Not authenticated', 'UNAUTHENTICATED');
      }
      
      // Validate user role
      if (!['ADMIN', 'OWNER', 'BREEDER'].includes(user.role)) {
        throw new ApolloError('Not authorized to register puppies', 'FORBIDDEN');
      }
      
      // Find litter
      const litterIndex = litters.findIndex(l => l.id === input.litterId);
      if (litterIndex === -1) {
        throw new ApolloError('Litter not found', 'NOT_FOUND');
      }
      
      const litter = litters[litterIndex];
      
      // Check permissions - only admin or owner of sire/dam can register puppies
      if (user.role !== 'ADMIN') {
        const sire = dogs.find(dog => dog.id === litter.sire.id);
        const dam = dogs.find(dog => dog.id === litter.dam.id);
        
        const isOwner = (sire && checkOwnership(user, sire)) || (dam && checkOwnership(user, dam));
        if (!isOwner) {
          throw new ApolloError('Not authorized to register puppies for this litter', 'FORBIDDEN');
        }
      }
      
      // Validate puppies input
      if (!input.puppies || input.puppies.length === 0) {
        throw new ApolloError('No puppies provided for registration', 'INVALID_INPUT');
      }
      
      // Create puppies
      const now = formatISO(new Date());
      const newPuppies = input.puppies.map(puppyInput => {
        validateRequiredFields(puppyInput, ['name', 'gender', 'color']);
        
        if (!['male', 'female'].includes(puppyInput.gender.toLowerCase())) {
          throw new ApolloError('Gender must be either "male" or "female"', 'INVALID_INPUT');
        }
        
        // Create a new dog record for each puppy
        const puppyId = String(nextDogId++);
        const newPuppy = {
          id: puppyId,
          name: puppyInput.name,
          gender: puppyInput.gender.toLowerCase(),
          dateOfBirth: litter.whelpingDate, // Use litter's whelping date
          breed: litter.sire.breed, // Inherit breed from parents
          color: puppyInput.color || null,
          microchipNumber: puppyInput.microchipNumber || null,
          isNeutered: puppyInput.isNeutered || false,
          registrationNumber: null, // Will be assigned later
          litterId: litter.id,
          sire: {
            id: litter.sire.id,
            name: litter.sire.name
          },
          dam: {
            id: litter.dam.id,
            name: litter.dam.name
          },
          createdAt: now,
          updatedAt: now
        };
        
        // Add to dogs array
        dogs.push(newPuppy);
        
        return newPuppy;
      });
      
      // Update litter with the new puppies
      litter.puppies = [...(litter.puppies || []), ...newPuppies];
      litter.updatedAt = now;
      
      // Save to database
      litters[litterIndex] = litter;
      
      // Return registration result
      const response: RegisterLitterPuppiesResponse = {
        success: true,
        message: `Successfully registered ${newPuppies.length} puppies`,
        puppies: newPuppies
      };
      
      return response;
    }
  },
  
  // Type resolvers
  Litter: {
    // Resolver to ensure puppies are properly loaded
    puppies: async (litter, _, context) => {
      // This could be used to load puppies from database if they weren't loaded yet
      return litter.puppies || [];
    },
    
    // Resolver to ensure sire is properly loaded
    sire: async (litter, _, context) => {
      const sire = dogs.find(dog => dog.id === litter.sire.id);
      return sire || litter.sire;
    },
    
    // Resolver to ensure dam is properly loaded
    dam: async (litter, _, context) => {
      const dam = dogs.find(dog => dog.id === litter.dam.id);
      return dam || litter.dam;
    }
  }
};
