'use client';

import React, { useState, useEffect } from 'react';

interface ValidationError {
  rowIndex: number;
  field: string;
  message: string;
}

interface ImportDataValidationProps {
  data: any[];
  mappings: Record<string, string>;
  onValidationComplete: (validData: any[], hasErrors: boolean) => void;
}

export default function ImportDataValidation({
  data,
  mappings,
  onValidationComplete
}: ImportDataValidationProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validatedData, setValidatedData] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Start validation when data or mappings change
  useEffect(() => {
    if (data.length > 0 && Object.keys(mappings).length > 0) {
      validateData();
    }
  }, [data, mappings]);

  const validateData = () => {
    setIsValidating(true);
    const errors: ValidationError[] = [];
    const validated: any[] = [];

    // Process each row
    data.forEach((row, rowIndex) => {
      const processedRow: Record<string, any> = {};
      let rowHasErrors = false;

      // Process each field mapping
      Object.entries(mappings).forEach(([systemField, importedField]) => {
        if (!importedField) return; // Skip unmapped fields
        
        const rawValue = row[importedField];
        
        // Validate based on field type
        switch (systemField) {
          case 'name':
            if (!rawValue || typeof rawValue !== 'string' || rawValue.trim() === '') {
              errors.push({
                rowIndex,
                field: systemField,
                message: 'Name is required'
              });
              rowHasErrors = true;
            } else {
              processedRow[systemField] = rawValue.trim();
            }
            break;
            
          case 'dateOfBirth':
            try {
              // Ensuring dateOfBirth is always a Date and never undefined
              const parsedDate = rawValue ? new Date(rawValue) : new Date();
              
              if (isNaN(parsedDate.getTime())) {
                // Use current date as fallback for invalid dates
                processedRow[systemField] = new Date();
                errors.push({
                  rowIndex,
                  field: systemField,
                  message: 'Invalid date format, using current date as fallback'
                });
              } else {
                processedRow[systemField] = parsedDate;
              }
            } catch (e) {
              // Fallback to current date for any errors
              processedRow[systemField] = new Date();
              errors.push({
                rowIndex,
                field: systemField,
                message: 'Invalid date format, using current date as fallback'
              });
            }
            break;
            
          case 'dateOfDeath':
            if (rawValue) {
              try {
                const parsedDate = new Date(rawValue);
                
                if (isNaN(parsedDate.getTime())) {
                  errors.push({
                    rowIndex,
                    field: systemField,
                    message: 'Invalid date format for date of death'
                  });
                  rowHasErrors = true;
                } else {
                  // Check if death date is after birth date
                  const birthDate = processedRow['dateOfBirth'];
                  if (birthDate && parsedDate < birthDate) {
                    errors.push({
                      rowIndex,
                      field: systemField,
                      message: 'Date of death cannot be before date of birth'
                    });
                    rowHasErrors = true;
                  } else {
                    processedRow[systemField] = parsedDate;
                  }
                }
              } catch (e) {
                errors.push({
                  rowIndex,
                  field: systemField,
                  message: 'Invalid date format for date of death'
                });
                rowHasErrors = true;
              }
            }
            break;
            
          case 'gender':
            const genderValue = (rawValue || '').toString().toLowerCase().trim();
            if (!genderValue || !['male', 'female'].includes(genderValue)) {
              errors.push({
                rowIndex,
                field: systemField,
                message: 'Gender must be either male or female'
              });
              rowHasErrors = true;
            } else {
              processedRow[systemField] = genderValue as 'male' | 'female';
            }
            break;
            
          // Add other field validations as needed
          case 'color':
          case 'breedId':
          case 'registrationNumber':
          case 'microchipNumber':
          case 'ownerId':
            if (rawValue !== undefined && rawValue !== null) {
              processedRow[systemField] = rawValue.toString().trim();
            }
            break;
            
          default:
            // For other fields, just copy the value
            if (rawValue !== undefined && rawValue !== null) {
              processedRow[systemField] = rawValue;
            }
        }
      });

      // Add the row to validated data if it doesn't have critical errors
      if (!rowHasErrors) {
        validated.push(processedRow);
      }
    });

    setValidationErrors(errors);
    setValidatedData(validated);
    setIsValidating(false);
    
    // Notify parent component of validation results
    onValidationComplete(validated, errors.length > 0);
  };

  // Group errors by row for display
  const getErrorsByRow = () => {
    const errorsByRow: Record<number, ValidationError[]> = {};
    
    validationErrors.forEach(error => {
      if (!errorsByRow[error.rowIndex]) {
        errorsByRow[error.rowIndex] = [];
      }
      errorsByRow[error.rowIndex].push(error);
    });
    
    return errorsByRow;
  };

  const errorsByRow = getErrorsByRow();
  const hasErrors = validationErrors.length > 0;
  const errorCount = validationErrors.length;
  const validCount = validatedData.length;

  if (isValidating) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Validating data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Validation Results</h3>
        <div className="flex space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {validCount} Valid Records
          </span>
          {hasErrors && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {errorCount} Errors
            </span>
          )}
        </div>
      </div>

      {hasErrors ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {Object.entries(errorsByRow).map(([rowIndexStr, rowErrors]) => {
              const rowIndex = parseInt(rowIndexStr, 10);
              const rowData = data[rowIndex];
              return (
                <li key={rowIndex} className="px-4 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Row {rowIndex + 1}: {rowData[mappings.name] || 'Unnamed Dog'}
                      </h4>
                      <ul className="mt-2 text-sm text-red-600 list-disc pl-5 space-y-1">
                        {rowErrors.map((error, i) => (
                          <li key={i}>
                            {error.field}: {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : validCount > 0 ? (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                All data is valid! Ready to import {validCount} records.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No data to validate yet.</p>
        </div>
      )}
    </div>
  );
}
