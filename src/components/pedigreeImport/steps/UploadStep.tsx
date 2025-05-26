'use client';

import React, { useState, useRef } from 'react';
import { PedigreeImport } from '@/types/pedigreeImport';

interface UploadStepProps {
  onUpload: (file: File) => void;
  loading: boolean;
  importData: PedigreeImport | null;
}

const UploadStep: React.FC<UploadStepProps> = ({ onUpload, loading, importData }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isPdfFile(file)) {
        setSelectedFile(file);
      }
    }
  };
  
  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isPdfFile(file)) {
        setSelectedFile(file);
      }
    }
  };
  
  // Handle button click
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  // Validate file is a PDF and within size limit
  const isPdfFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return false;
    }
    
    // Check file size (20MB = 20 * 1024 * 1024 bytes)
    const maxSizeBytes = 20 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`File size exceeds 20MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }
    
    return true;
  };
  
  // Handle upload button click
  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };
  
  // If we already have import data, show a summary instead of upload form
  if (importData) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Pedigree PDF Already Uploaded
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              You have already uploaded a pedigree PDF for this import. Please proceed to the next step.
            </p>
          </div>
          <div className="mt-3 bg-gray-50 p-4 rounded-md">
            <div className="flex items-center">
              <svg 
                className="h-8 w-8 text-red-500" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 1h10a1 1 0 011 1v7.586l-3.293-3.293a1 1 0 00-1.414 0L10 10.586 7.707 8.293a1 1 0 00-1.414 0L3 11.586V5a1 1 0 011-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {importData.originalFileName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Upload Pedigree PDF
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Please upload the pedigree certificate PDF file that you want to import. 
            The system will analyze the document and extract dog information.
          </p>
        </div>
        
        {/* File Upload Area */}
        <div 
          className={`mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md
            ${dragActive ? 'border-green-400 bg-green-50' : 'border-gray-300'}
            ${loading ? 'opacity-50 cursor-not-allowed' : selectedFile ? 'cursor-default' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={selectedFile ? undefined : onButtonClick}
        >
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 015.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
              >
                <span>Upload a PDF file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="application/pdf"
                  onChange={handleChange}
                  ref={fileInputRef}
                  disabled={loading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PDF up to 20MB</p>
          </div>
        </div>
        
        {/* Selected File Preview */}
        {selectedFile && (
          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <div className="flex items-center">
              <svg 
                className="h-8 w-8 text-red-500" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 1h10a1 1 0 011 1v7.586l-3.293-3.293a1 1 0 00-1.414 0L10 10.586 7.707 8.293a1 1 0 00-1.414 0L3 11.586V5a1 1 0 011-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                className="ml-auto inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div className="mt-5">
          <button
            type="button"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              selectedFile && !loading
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-300 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            onClick={handleUploadClick}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              'Upload and Process PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadStep;
