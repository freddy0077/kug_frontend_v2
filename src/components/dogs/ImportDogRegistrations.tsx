'use client';

import { useState } from 'react';
import { hasPermission } from '@/utils/permissionUtils';
import { DogFormData } from '@/utils/formHandlers';

type ImportDogRegistrationsProps = {
  userRole: string;
  userId: string;
  onImportComplete: (importedDogs: DogFormData[]) => void;
};

export default function ImportDogRegistrations({
  userRole,
  userId,
  onImportComplete
}: ImportDogRegistrationsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [importedCount, setImportedCount] = useState<number | null>(null);

  // Check if user has permission to create dog records
  const hasCreatePermission = hasPermission(userRole, 'dog', 'create', undefined, userId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    const file = e.target.files[0];
    setSelectedFile(file);
    setError(null);
    setImportedCount(null);

    // Read file and generate preview
    try {
      if (importFormat === 'csv') {
        const text = await file.text();
        const rows = parseCSV(text);
        
        if (rows.length > 0) {
          const headers = rows[0];
          const dataRows = rows.slice(1, 6); // Preview first 5 rows
          
          setPreview({ headers, rows: dataRows });
          
          // Initialize field mappings
          const initialMappings: Record<string, string> = {};
          headers.forEach(header => {
            // Try to match headers to fields
            const normalizedHeader = header.toLowerCase().replace(/\s+/g, '_');
            
            if (normalizedHeader.includes('name')) {
              initialMappings[header] = 'name';
            } else if (normalizedHeader.includes('breed')) {
              initialMappings[header] = 'breedId';
            } else if (normalizedHeader.includes('gender') || normalizedHeader.includes('sex')) {
              initialMappings[header] = 'gender';
            } else if (normalizedHeader.includes('birth') || normalizedHeader.includes('dob')) {
              initialMappings[header] = 'dateOfBirth';
            } else if (normalizedHeader.includes('color')) {
              initialMappings[header] = 'color';
            } else if (normalizedHeader.includes('registration')) {
              initialMappings[header] = 'registrationNumber';
            } else if (normalizedHeader.includes('microchip')) {
              initialMappings[header] = 'microchipNumber';
            } else if (normalizedHeader.includes('death')) {
              initialMappings[header] = 'dateOfDeath';
            } else {
              initialMappings[header] = '';
            }
          });
          
          setFieldMappings(initialMappings);
        } else {
          setError('The CSV file appears to be empty');
          setPreview(null);
        }
      } else if (importFormat === 'json') {
        const text = await file.text();
        try {
          const jsonData = JSON.parse(text);
          
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            // Extract headers from the first object's keys
            const headers = Object.keys(jsonData[0]);
            
            // Format the preview data
            const rows = jsonData.slice(0, 5).map(item => 
              headers.map(key => String(item[key] || ''))
            );
            
            setPreview({ headers, rows });
            
            // Initialize field mappings (similar to CSV)
            const initialMappings: Record<string, string> = {};
            headers.forEach(header => {
              const normalizedHeader = header.toLowerCase().replace(/\s+/g, '_');
              
              if (normalizedHeader.includes('name')) {
                initialMappings[header] = 'name';
              } else if (normalizedHeader.includes('breed')) {
                initialMappings[header] = 'breedId';
              } else if (normalizedHeader.includes('gender') || normalizedHeader.includes('sex')) {
                initialMappings[header] = 'gender';
              } else if (normalizedHeader.includes('birth') || normalizedHeader.includes('dob')) {
                initialMappings[header] = 'dateOfBirth';
              } else if (normalizedHeader.includes('color')) {
                initialMappings[header] = 'color';
              } else if (normalizedHeader.includes('registration')) {
                initialMappings[header] = 'registrationNumber';
              } else if (normalizedHeader.includes('microchip')) {
                initialMappings[header] = 'microchipNumber';
              } else if (normalizedHeader.includes('death')) {
                initialMappings[header] = 'dateOfDeath';
              } else {
                initialMappings[header] = '';
              }
            });
            
            setFieldMappings(initialMappings);
          } else {
            setError('The JSON file must contain an array of dog objects');
            setPreview(null);
          }
        } catch (err) {
          setError('Invalid JSON format');
          setPreview(null);
        }
      }
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Failed to parse the file. Please check the format.');
      setPreview(null);
    }
  };

  const handleMappingChange = (header: string, field: string) => {
    setFieldMappings(prev => ({
      ...prev,
      [header]: field
    }));
  };

  const handleImport = async () => {
    if (!selectedFile || !preview) {
      setError('Please select a valid file first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const importedDogs: DogFormData[] = [];
      
      if (importFormat === 'csv') {
        const text = await selectedFile.text();
        const rows = parseCSV(text);
        
        if (rows.length > 1) { // Header row + at least one data row
          const headers = rows[0];
          const dataRows = rows.slice(1);
          
          // Process each row
          for (const row of dataRows) {
            const dogData = processRow(headers, row);
            if (dogData) {
              importedDogs.push(dogData);
            }
          }
        }
      } else if (importFormat === 'json') {
        const text = await selectedFile.text();
        const jsonData = JSON.parse(text);
        
        if (Array.isArray(jsonData)) {
          const headers = Object.keys(jsonData[0]);
          
          // Process each JSON object
          for (const item of jsonData) {
            const row = headers.map(key => String(item[key] || ''));
            const dogData = processRow(headers, row);
            if (dogData) {
              importedDogs.push(dogData);
            }
          }
        }
      }
      
      // In a real app, you would send these to an API
      console.log('Importing dogs:', importedDogs);
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setImportedCount(importedDogs.length);
      onImportComplete(importedDogs);
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Error importing dogs:', err);
      setError('Failed to import dogs. Please check your file and mappings.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to process a row of data into a DogFormData object
  const processRow = (headers: string[], row: string[]): DogFormData | null => {
    if (row.length !== headers.length) return null;
    
    // Create an object with header->value pairs
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });
    
    // Map to DogFormData based on fieldMappings
    const dogData: Partial<DogFormData> = {
      ownerId: userId // Default owner is current user
    };
    
    // For each header, check if it's mapped to a field
    for (const [header, field] of Object.entries(fieldMappings)) {
      if (field && rowData[header] !== undefined) {
        let value = rowData[header];
        
        // Special handling for date fields
        if (field === 'dateOfBirth' || field === 'dateOfDeath') {
          // Ensure dates are always Date objects and never undefined
          const dateValue = value ? new Date(value) : new Date();
          if (isNaN(dateValue.getTime())) {
            // If date parsing failed, use current date
            dogData[field as keyof DogFormData] = new Date();
          } else {
            dogData[field as keyof DogFormData] = dateValue;
          }
        }
        // Special handling for gender field
        else if (field === 'gender') {
          const lowerValue = value.toLowerCase();
          if (['m', 'male'].includes(lowerValue)) {
            dogData.gender = 'male';
          } else if (['f', 'female'].includes(lowerValue)) {
            dogData.gender = 'female';
          } else {
            dogData.gender = 'male'; // Default to male if unrecognized
          }
        }
        // Handle other string fields
        else if (field !== '') {
          // @ts-ignore - We know these are string fields
          dogData[field] = value;
        }
      }
    }
    
    // Check required fields
    if (!dogData.name || !dogData.gender || !dogData.dateOfBirth) {
      return null;
    }
    
    // Set defaults for missing fields
    if (!dogData.breedId) dogData.breedId = '1'; // Default breed ID
    if (!dogData.color) dogData.color = 'unknown';
    
    // Always ensure dateOfBirth is a Date and not undefined
    if (!dogData.dateOfBirth) {
      dogData.dateOfBirth = new Date();
    }
    
    return dogData as DogFormData;
  };

  // Helper function to parse CSV text into rows
  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    const lines = text.split(/\\r?\\n/);
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue); // Add the last value
      rows.push(values);
    }
    
    return rows;
  };

  if (!hasCreatePermission) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">
          You do not have permission to import dog registrations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900">Import Dog Registrations</h2>
      <p className="mt-1 text-sm text-gray-500">
        Import multiple dog registrations from a CSV or JSON file.
      </p>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {importedCount !== null && (
        <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-md">
          <p className="text-sm text-green-700">
            Successfully imported {importedCount} dog registrations.
          </p>
        </div>
      )}
      
      <div className="mt-4 space-y-6">
        {/* File Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Import Format
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="csv"
                checked={importFormat === 'csv'}
                onChange={() => setImportFormat('csv')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">CSV</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="json"
                checked={importFormat === 'json'}
                onChange={() => setImportFormat('json')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">JSON</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {importFormat === 'csv' 
              ? 'CSV file should have headers in the first row and data in subsequent rows.' 
              : 'JSON file should contain an array of dog objects.'}
          </p>
        </div>
        
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept={importFormat === 'csv' ? '.csv' : '.json'}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        
        {/* Preview Section */}
        {preview && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Preview</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {preview.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Field Mappings */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Map Fields</h3>
              <p className="text-xs text-gray-500 mb-4">
                Map the columns in your file to the correct dog data fields.
              </p>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {preview.headers.map((header, index) => (
                  <div key={index} className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {header}
                    </label>
                    <select
                      value={fieldMappings[header] || ''}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    >
                      <option value="">-- Skip Field --</option>
                      <option value="name">Dog Name</option>
                      <option value="breedId">Breed</option>
                      <option value="gender">Gender</option>
                      <option value="dateOfBirth">Date of Birth</option>
                      <option value="dateOfDeath">Date of Death</option>
                      <option value="color">Color</option>
                      <option value="registrationNumber">Registration Number</option>
                      <option value="microchipNumber">Microchip Number</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Import Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleImport}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Importing...' : 'Import Dogs'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
