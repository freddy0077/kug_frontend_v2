import { ApolloError } from 'apollo-server-micro';
import { parse, isValid } from 'date-fns';

/**
 * Validates that all required fields are present in the input object
 * @param input The input object to validate
 * @param requiredFields Array of field names that are required
 * @throws ApolloError if any required field is missing
 */
export function validateRequiredFields(input: any, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => {
    const value = input[field];
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  });

  if (missingFields.length > 0) {
    throw new ApolloError(
      `Missing required fields: ${missingFields.join(', ')}`,
      'INVALID_INPUT'
    );
  }
}

/**
 * Validates that a date string is in the correct ISO 8601 format (YYYY-MM-DD)
 * @param dateString The date string to validate
 * @param fieldName The name of the field for error reporting
 * @throws ApolloError if the date format is invalid
 */
export function validateDateFormat(dateString: string, fieldName: string): void {
  // Check basic ISO format using regex for YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T.*)?$/;
  if (!dateRegex.test(dateString)) {
    throw new ApolloError(
      `Invalid date format for ${fieldName}. Expected ISO 8601 format (YYYY-MM-DD)`,
      'INVALID_INPUT'
    );
  }

  // Parse the date and check if it's valid
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new ApolloError(
      `Invalid date for ${fieldName}. The date is not valid.`,
      'INVALID_INPUT'
    );
  }
}

/**
 * Validates that a value is a positive number
 * @param value The value to validate
 * @param fieldName The name of the field for error reporting
 * @throws ApolloError if the value is not a positive number
 */
export function validatePositiveNumber(value: number, fieldName: string): void {
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    throw new ApolloError(
      `${fieldName} must be a positive number`,
      'INVALID_INPUT'
    );
  }
}

/**
 * Validates that a value is within a specified range
 * @param value The value to validate
 * @param min The minimum allowed value (inclusive)
 * @param max The maximum allowed value (inclusive)
 * @param fieldName The name of the field for error reporting
 * @throws ApolloError if the value is outside the specified range
 */
export function validateRange(value: number, min: number, max: number, fieldName: string): void {
  if (value < min || value > max) {
    throw new ApolloError(
      `${fieldName} must be between ${min} and ${max}`,
      'INVALID_INPUT'
    );
  }
}

/**
 * Validates that a value is one of the allowed values
 * @param value The value to validate
 * @param allowedValues Array of allowed values
 * @param fieldName The name of the field for error reporting
 * @throws ApolloError if the value is not one of the allowed values
 */
export function validateAllowedValues<T>(value: T, allowedValues: T[], fieldName: string): void {
  if (!allowedValues.includes(value)) {
    throw new ApolloError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      'INVALID_INPUT'
    );
  }
}

/**
 * Validates that a value satisfies a custom validation function
 * @param value The value to validate
 * @param validationFn The validation function that should return true if the value is valid
 * @param errorMessage The error message to display if validation fails
 * @throws ApolloError if the validation function returns false
 */
export function validateCustom<T>(
  value: T, 
  validationFn: (value: T) => boolean, 
  errorMessage: string
): void {
  if (!validationFn(value)) {
    throw new ApolloError(errorMessage, 'INVALID_INPUT');
  }
}
