'use client';

import React, { useState } from 'react';

interface ImportFileUploadProps {
  onFileLoaded: (fields: string[], records: any[]) => void;
  supportedFormats: string[];
}

export default function ImportFileUpload({
  onFileLoaded,
  supportedFormats = ['.csv', '.json']
}: ImportFileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file extension
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      setError(`Unsupported file format. Please upload ${supportedFormats.join(' or ')}`);
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    setError(null);

    try {
      const fileContent = await readFileContent(file);
      let parsedData: any[] = [];
      let fields: string[] = [];

      // Parse file based on extension
      if (fileExtension === '.csv') {
        const result = parseCSV(fileContent);
        parsedData = result.data;
        fields = result.headers;
      } else if (fileExtension === '.json') {
        const result = parseJSON(fileContent);
        parsedData = result.data;
        fields = result.fields;
      }

      onFileLoaded(fields, parsedData);
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Failed to parse file. Please check the file format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Read file content as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => {
        reject(new Error('File reading error'));
      };
      reader.readAsText(file);
    });
  };

  // Parse CSV file to get headers and data
  const parseCSV = (csvContent: string) => {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const data = lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',').map(value => value.trim());
        const record: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });
        
        return record;
      });
    
    return { headers, data };
  };

  // Parse JSON file to get fields and data
  const parseJSON = (jsonContent: string) => {
    try {
      const jsonData = JSON.parse(jsonContent);
      let data = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      // Extract all possible fields from the data
      const fieldsSet = new Set<string>();
      data.forEach(item => {
        Object.keys(item).forEach(key => fieldsSet.add(key));
      });
      
      const fields = Array.from(fieldsSet);
      
      return { fields, data };
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  };

  // Reset file input
  const handleReset = () => {
    setFileName(null);
    setError(null);
    // We need to reset the file input as well
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Import File
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Upload a {supportedFormats.join(' or ')} file with dog registration data.
        </p>
        <div className="mt-2 flex items-center">
          <label 
            htmlFor="file-upload" 
            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
          >
            <span>Select file</span>
            <input 
              id="file-upload" 
              name="file-upload" 
              type="file" 
              className="sr-only" 
              onChange={handleFileChange}
              accept={supportedFormats.join(',')}
              disabled={isLoading}
            />
          </label>
          <p className="pl-3 text-sm text-gray-500">
            {fileName || 'No file selected'}
          </p>
          {fileName && (
            <button
              type="button"
              onClick={handleReset}
              className="ml-3 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}
