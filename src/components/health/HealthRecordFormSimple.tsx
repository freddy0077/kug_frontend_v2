'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useHealthRecordOperations, HealthRecordInput } from '@/hooks/useHealthRecords';
import { HealthRecordType } from '@/types/healthRecord';

interface HealthRecordFormSimpleProps {
  dogId: string;
  recordId?: string;
  initialData?: any;
  onSuccess?: () => void;
}

export default function HealthRecordFormSimple({
  dogId,
  recordId,
  initialData,
  onSuccess
}: HealthRecordFormSimpleProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const { createHealthRecord, updateHealthRecord, uploadAttachment, loading, error } = useHealthRecordOperations();
  
  // Form state
  const [formData, setFormData] = useState<HealthRecordInput>({
    dogId,
    date: new Date(),
    type: HealthRecordType.OTHER, // Changed from GENERAL to OTHER which exists in the enum
    description: '',
    results: '',
    veterinarian: '',
    vetName: ''
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        dogId,
        date: initialData.date ? new Date(initialData.date) : new Date(),
        type: initialData.type || HealthRecordType.OTHER, // Changed from GENERAL to OTHER
        description: initialData.description || '',
        results: initialData.results || '',
        veterinarian: initialData.veterinarian || '',
        vetName: initialData.vetName || ''
      });
    }
  }, [initialData, dogId]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : new Date();
    setFormData(prev => ({ ...prev, date: dateValue }));
    
    // Clear date error if exists
    if (formErrors.date) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.date;
        return newErrors;
      });
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      let recordId;
      
      // Create or update the health record
      if (recordId) {
        // Update existing record
        const result = await updateHealthRecord(recordId, formData);
        recordId = result.id;
        toast.success('Health record updated successfully');
      } else {
        // Create new record
        const result = await createHealthRecord(formData);
        recordId = result.id;
        toast.success('Health record created successfully');
      }
      
      // Upload attachments if any
      if (files.length > 0) {
        setIsUploading(true);
        
        for (const file of files) {
          await uploadAttachment(recordId, file);
        }
        
        setIsUploading(false);
        toast.success('Attachments uploaded successfully');
      }
      
      // Call onSuccess callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/manage/dogs/${dogId}/health`);
      }
    } catch (err) {
      console.error('Error saving health record:', err);
      toast.error('Failed to save health record. Please try again.');
    }
  };
  
  // Format date for input
  const formatDateForInput = (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  const isProcessing = loading || isUploading;
  
  // Render form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Health Record Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Record Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          {Object.values(HealthRecordType).map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>
      
      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formatDateForInput(formData.date as Date)}
          onChange={handleDateChange}
          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          max={formatDateForInput(new Date())}
          required
        />
        {formErrors.date && (
          <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
        )}
      </div>
      
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          required
        />
        {formErrors.description && (
          <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
        )}
      </div>
      
      {/* Results */}
      <div>
        <label htmlFor="results" className="block text-sm font-medium text-gray-700">
          Results
        </label>
        <textarea
          id="results"
          name="results"
          rows={2}
          value={formData.results}
          onChange={handleChange}
          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      
      {/* Veterinarian */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="vetName" className="block text-sm font-medium text-gray-700">
            Veterinarian Name
          </label>
          <input
            type="text"
            id="vetName"
            name="vetName"
            value={formData.vetName}
            onChange={handleChange}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="veterinarian" className="block text-sm font-medium text-gray-700">
            Veterinarian ID/License
          </label>
          <input
            type="text"
            id="veterinarian"
            name="veterinarian"
            value={formData.veterinarian}
            onChange={handleChange}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      {/* File Attachments */}
      <div>
        <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
          Attachments
        </label>
        <input
          type="file"
          id="attachments"
          name="attachments"
          multiple
          onChange={handleFileChange}
          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
        {files.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Selected files:</p>
            <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isProcessing}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : recordId ? 'Update Record' : 'Add Record'}
        </button>
      </div>
    </form>
  );
}
