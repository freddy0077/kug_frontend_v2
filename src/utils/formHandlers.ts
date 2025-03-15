// Form submission utility functions for role-specific features

import { hasPermission } from './permissionUtils';

// Types for different forms
export type UserFormData = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  password?: string;
};

export type DogFormData = {
  id?: string;
  name: string;
  breedId: string;
  breed?: string; // Add the breed field for backward compatibility
  gender: string;
  dateOfBirth: Date;
  dateOfDeath?: Date;
  registrationNumber?: string;
  microchipNumber?: string;
  color: string;
  ownerId: string;
};

export type HealthRecordFormData = {
  id?: string;
  dogId: string;
  date: Date;
  description: string; // Using 'description' instead of 'diagnosis' for consistency
  results: string; // Using 'results' instead of 'test_results' for consistency
  veterinarianId?: string;
  attachments?: string[];
  detailedResults?: string; // Additional field for detailed test results
};

export type CompetitionResultFormData = {
  id?: string;
  dogId: string;
  competitionId: string;
  date: Date;
  placement: string;
  title_earned?: string; // Using 'title_earned' instead of 'certificate' for consistency
  score?: string;
  handlerId?: string;
};

export type OwnershipFormData = {
  id?: string;
  dogId: string;
  ownerId: string;
  startDate: Date;
  endDate?: Date;
  is_current: boolean; // Using 'is_current' instead of 'is_active' for consistency
  transferReason?: string;
};

export type BreedingProgramFormData = {
  id?: string;
  name: string;
  description: string;
  breederId: string;
  breeds: string[];
  goals: string;
  status: string;
};

export type ClubEventFormData = {
  id?: string;
  name: string;
  date: Date;
  location: string;
  description: string;
  clubId: string;
  eventType: string;
  registrationOpenDate: Date;
  registrationCloseDate: Date;
};

// Generic response type
export type FormSubmissionResponse = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string>;
};

/**
 * Submit user form data (create or update)
 * @param formData The user form data
 * @param userRole The role of the current user
 * @param userId The ID of the current user
 * @returns Promise with the response
 */
export const submitUserForm = async (
  formData: UserFormData,
  userRole: string,
  userId: string
): Promise<FormSubmissionResponse> => {
  // Check permissions
  const isNewUser = !formData.id;
  const action = isNewUser ? 'create' : 'edit';
  
  if (!hasPermission(userRole, 'user', action, formData.id, userId)) {
    return {
      success: false,
      message: 'You do not have permission to perform this action',
    };
  }

  try {
    // In a real app, this would make an API call
    // For now, simulate successful response
    return {
      success: true,
      message: isNewUser ? 'User created successfully' : 'User updated successfully',
      data: {
        ...formData,
        id: formData.id || 'new-user-id',
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error processing your request',
      errors: {
        submit: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};

/**
 * Submit dog form data (create or update)
 * @param formData The dog form data
 * @param userRole The role of the current user
 * @param userId The ID of the current user
 * @returns Promise with the response
 */
export const submitDogForm = async (
  formData: DogFormData,
  userRole: string,
  userId: string
): Promise<FormSubmissionResponse> => {
  // Check permissions
  const isNewDog = !formData.id;
  const action = isNewDog ? 'create' : 'edit';
  
  if (!hasPermission(userRole, 'dog', action, formData.ownerId, userId)) {
    return {
      success: false,
      message: 'You do not have permission to perform this action',
    };
  }

  try {
    // Validate date of birth is always a Date
    if (!(formData.dateOfBirth instanceof Date) || isNaN(formData.dateOfBirth.getTime())) {
      throw new Error('Invalid date of birth');
    }
    
    // Make sure gender is valid
    if (!['male', 'female'].includes(formData.gender.toLowerCase())) {
      throw new Error('Gender must be either male or female');
    }

    // In a real app, this would make an API call
    // For now, simulate successful response
    return {
      success: true,
      message: isNewDog ? 'Dog created successfully' : 'Dog updated successfully',
      data: {
        ...formData,
        id: formData.id || 'new-dog-id',
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error processing your request',
      errors: {
        submit: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};

/**
 * Submit health record form data (create or update)
 * @param formData The health record form data
 * @param userRole The role of the current user
 * @param userId The ID of the current user
 * @param dogOwnerId The ID of the dog's owner
 * @returns Promise with the response
 */
export const submitHealthRecordForm = async (
  formData: HealthRecordFormData,
  userRole: string,
  userId: string,
  dogOwnerId: string
): Promise<FormSubmissionResponse> => {
  // Check permissions
  const isNewRecord = !formData.id;
  const action = isNewRecord ? 'create' : 'edit';
  
  if (!hasPermission(userRole, 'health-record', action, dogOwnerId, userId)) {
    return {
      success: false,
      message: 'You do not have permission to perform this action',
    };
  }

  try {
    // Validate required fields
    if (!formData.description || !formData.description.trim()) {
      throw new Error('Health test description is required');
    }
    
    if (!formData.results || !formData.results.trim()) {
      throw new Error('Results are required');
    }
    
    if (!(formData.date instanceof Date) || isNaN(formData.date.getTime())) {
      throw new Error('Invalid test date');
    }
    
    if (formData.date > new Date()) {
      throw new Error('Test date cannot be in the future');
    }

    // In a real app, this would make an API call
    // Using correct field names as per memory (description and results)
    return {
      success: true,
      message: isNewRecord ? 'Health record created successfully' : 'Health record updated successfully',
      data: {
        ...formData,
        id: formData.id || 'new-health-record-id',
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error processing your request',
      errors: {
        submit: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};

/**
 * Submit competition result form data (create or update)
 * @param formData The competition result form data
 * @param userRole The role of the current user
 * @param userId The ID of the current user
 * @param dogOwnerId The ID of the dog's owner
 * @returns Promise with the response
 */
export const submitCompetitionResultForm = async (
  formData: CompetitionResultFormData,
  userRole: string,
  userId: string,
  dogOwnerId: string
): Promise<FormSubmissionResponse> => {
  // Check permissions
  const isNewResult = !formData.id;
  const action = isNewResult ? 'create' : 'edit';
  
  if (!hasPermission(userRole, 'competition', action, dogOwnerId, userId)) {
    return {
      success: false,
      message: 'You do not have permission to perform this action',
    };
  }

  try {
    // In a real app, this would make an API call
    // For now, simulate successful response
    return {
      success: true,
      message: isNewResult ? 'Competition result created successfully' : 'Competition result updated successfully',
      data: {
        ...formData,
        id: formData.id || 'new-competition-result-id',
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error processing your request',
      errors: {
        submit: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};

/**
 * Submit ownership form data (create or update)
 * @param formData The ownership form data
 * @param userRole The role of the current user
 * @param userId The ID of the current user
 * @returns Promise with the response
 */
export const submitOwnershipForm = async (
  formData: OwnershipFormData,
  userRole: string,
  userId: string
): Promise<FormSubmissionResponse> => {
  // Check permissions
  const isNewOwnership = !formData.id;
  const action = isNewOwnership ? 'create' : 'edit';
  const ownerId = formData.ownerId;
  
  if (!hasPermission(userRole, 'ownership', action, ownerId, userId)) {
    return {
      success: false,
      message: 'You do not have permission to perform this action',
    };
  }

  try {
    // In a real app, this would make an API call
    // For now, simulate successful response
    return {
      success: true,
      message: isNewOwnership ? 'Ownership record created successfully' : 'Ownership record updated successfully',
      data: {
        ...formData,
        id: formData.id || 'new-ownership-id',
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error processing your request',
      errors: {
        submit: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};

/**
 * Submit breeding program form data (create or update)
 * @param formData The breeding program form data
 * @param userRole The role of the current user
 * @param userId The ID of the current user
 * @returns Promise with the response
 */
export const submitBreedingProgramForm = async (
  formData: BreedingProgramFormData,
  userRole: string,
  userId: string
): Promise<FormSubmissionResponse> => {
  // Check permissions
  const isNewProgram = !formData.id;
  const action = isNewProgram ? 'create' : 'edit';
  const ownerId = formData.breederId;
  
  if (!hasPermission(userRole, 'breeding-program', action, ownerId, userId)) {
    return {
      success: false,
      message: 'You do not have permission to perform this action',
    };
  }

  try {
    // In a real app, this would make an API call
    // For now, simulate successful response
    return {
      success: true,
      message: isNewProgram ? 'Breeding program created successfully' : 'Breeding program updated successfully',
      data: {
        ...formData,
        id: formData.id || 'new-breeding-program-id',
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error processing your request',
      errors: {
        submit: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};

/**
 * Submit club event form data (create or update)
 * @param formData The club event form data
 * @param userRole The role of the current user
 * @param userId The ID of the current user
 * @returns Promise with the response
 */
export const submitClubEventForm = async (
  formData: ClubEventFormData,
  userRole: string,
  userId: string
): Promise<FormSubmissionResponse> => {
  // Check permissions
  const isNewEvent = !formData.id;
  const action = isNewEvent ? 'create' : 'edit';
  const ownerId = formData.clubId;
  
  if (!hasPermission(userRole, 'club-event', action, ownerId, userId)) {
    return {
      success: false,
      message: 'You do not have permission to perform this action',
    };
  }

  try {
    // In a real app, this would make an API call
    // For now, simulate successful response
    return {
      success: true,
      message: isNewEvent ? 'Club event created successfully' : 'Club event updated successfully',
      data: {
        ...formData,
        id: formData.id || 'new-club-event-id',
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error processing your request',
      errors: {
        submit: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
};
