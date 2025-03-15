'use client';

import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

// Upload profile image mutation
const UPLOAD_PROFILE_IMAGE = gql`
  mutation UploadProfileImage($file: Upload!, $userId: ID!) {
    uploadProfileImage(file: $file, userId: $userId) {
      id
      profileImageUrl
    }
  }
`;

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl?: string;
  onSuccess?: () => void;
}

export default function ProfileImageUpload({ userId, currentImageUrl, onSuccess }: ProfileImageUploadProps) {
  const [uploadImage, { loading }] = useMutation(UPLOAD_PROFILE_IMAGE);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndPreviewFile(file);
    }
  };

  // Validate file type and size
  const validateAndPreviewFile = (file: File) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      validateAndPreviewFile(file);
    }
  }, []);

  // Handle upload
  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) {
      toast.error('Please select an image to upload');
      return;
    }

    const file = fileInputRef.current.files[0];
    
    try {
      const { data } = await uploadImage({
        variables: {
          file,
          userId
        }
      });
      
      if (data?.uploadProfileImage?.profileImageUrl) {
        toast.success('Profile image updated successfully');
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Current profile image display */}
      {!previewUrl && (
        <div className="flex flex-col md:flex-row items-center mb-6">
          <div className="flex-shrink-0 h-20 w-20 relative overflow-hidden rounded-full bg-gray-100 mr-0 md:mr-6 mb-4 md:mb-0">
            {currentImageUrl ? (
              <Image 
                src={currentImageUrl} 
                alt="Current profile"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            ) : (
              <div className="h-20 w-20 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {currentImageUrl ? 'You can change your profile picture by uploading a new one.' : 'You haven\'t set a profile picture yet.'}
            </p>
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              {currentImageUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
          </div>
        </div>
      )}

      {/* File input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Drag and drop area */}
      {!previewUrl && (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-600 mb-1">Drag and drop an image here, or</p>
          <button
            type="button"
            onClick={triggerFileInput}
            className="text-green-600 font-medium hover:text-green-800"
          >
            browse files
          </button>
          <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, GIF (Max size: 5MB)</p>
        </div>
      )}

      {/* Image preview */}
      {previewUrl && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4 mb-4">
            <div className="h-40 w-40 relative overflow-hidden rounded-full">
              <Image 
                src={previewUrl} 
                alt="Profile preview"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
