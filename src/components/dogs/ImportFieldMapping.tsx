'use client';

import React from 'react';

interface ImportFieldMappingProps {
  importedFields: string[];
  systemFields: {
    key: string;
    label: string;
    required: boolean;
  }[];
  mappings: Record<string, string>;
  onMappingChange: (systemField: string, importedField: string) => void;
}

export default function ImportFieldMapping({
  importedFields,
  systemFields,
  mappings,
  onMappingChange
}: ImportFieldMappingProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Map Fields</h3>
      <p className="text-sm text-gray-500">
        Match the fields from your imported file to the system fields.
        Required fields are marked with an asterisk (*).
      </p>
      
      <div className="mt-4 space-y-3">
        {systemFields.map((field) => (
          <div key={field.key} className="grid grid-cols-8 gap-4 items-center">
            <div className="col-span-3">
              <label htmlFor={`mapping-${field.key}`} className="block text-sm font-medium text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
            </div>
            <div className="col-span-5">
              <select
                id={`mapping-${field.key}`}
                value={mappings[field.key] || ''}
                onChange={(e) => onMappingChange(field.key, e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">-- Select Field --</option>
                {importedFields.map((importField) => (
                  <option key={importField} value={importField}>
                    {importField}
                  </option>
                ))}
              </select>
              {field.required && !mappings[field.key] && (
                <p className="mt-1 text-sm text-red-500">
                  This field is required
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
