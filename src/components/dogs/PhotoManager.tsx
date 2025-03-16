'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { hasPermission, UserRole } from '@/utils/permissionUtils';

type Photo = {
  id: string;
  url: string;
  caption: string;
  isPrimary: boolean;
  uploadDate: Date;
};

type PhotoManagerProps = {
  dogId: string;
  userRole: UserRole;
  userId: string;
  ownerId: string;
  initialPhotos?: Photo[];
};

export default function PhotoManager({
  dogId,
  userRole,
  userId,
  ownerId,
  initialPhotos = []
}: PhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasEditPermission, setHasEditPermission] = useState(false);

  useEffect(() => {
    // Check if user has permission to edit dog photos
    const canEdit = hasPermission(userRole, 'dog', 'edit', ownerId, userId);
    setHasEditPermission(canEdit);

    // If no initial photos, fetch them
    if (initialPhotos.length === 0) {
      fetchDogPhotos();
    }
  }, [dogId, userRole, userId, ownerId, initialPhotos.length]);

  // Effect for cleaning up preview URLs
  useEffect(() => {
    // Clean up preview URL when component unmounts
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const fetchDogPhotos = async () => {
    try {
      // In a real app, this would be an API call
      // For now, using mock data
      const mockPhotos: Photo[] = [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
          caption: 'Profile photo',
          isPrimary: true,
          uploadDate: new Date('2024-01-15')
        },
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1551717743-49959800b1f6',
          caption: 'At the park',
          isPrimary: false,
          uploadDate: new Date('2024-02-20')
        }
      ];
      
      setPhotos(mockPhotos);
    } catch (err) {
      console.error('Error fetching dog photos:', err);
      setError('Failed to load dog photos');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    const file = e.target.files[0];
    setSelectedFile(file);

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Reset states
    setError(null);
    setSuccess(null);
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaption(e.target.value);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Check file size (limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        setUploading(false);
        return;
      }

      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed');
        setUploading(false);
        return;
      }

      // In a real app, this would be an API call to upload the file
      // For now, simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate a mock ID and URL for the newly uploaded photo
      const newPhoto: Photo = {
        id: `new-${Date.now()}`,
        url: preview || '',
        caption: caption || 'New photo',
        isPrimary: photos.length === 0, // First photo is primary by default
        uploadDate: new Date()
      };

      setPhotos(prev => [...prev, newPhoto]);
      setSuccess('Photo uploaded successfully');
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setCaption('');
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = (photoId: string) => {
    setPhotos(prev => 
      prev.map(photo => ({
        ...photo,
        isPrimary: photo.id === photoId
      }))
    );
    setSuccess('Primary photo updated');
  };

  const handleDelete = async (photoId: string) => {
    try {
      // In a real app, this would be an API call
      // For now, simulate a delete operation
      await new Promise(resolve => setTimeout(resolve, 500));

      const deletedPhoto = photos.find(p => p.id === photoId);
      const wasPrimary = deletedPhoto?.isPrimary;

      // Remove the photo from the array
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      
      // If the deleted photo was primary, set the first remaining photo as primary
      if (wasPrimary && updatedPhotos.length > 0) {
        updatedPhotos[0].isPrimary = true;
      }
      
      setPhotos(updatedPhotos);
      setSuccess('Photo deleted successfully');
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo');
    }
  };

  const handleEditCaption = (photoId: string, newCaption: string) => {
    setPhotos(prev => 
      prev.map(photo => 
        photo.id === photoId 
          ? { ...photo, caption: newCaption } 
          : photo
      )
    );
    setSuccess('Caption updated');
  };

  if (!hasEditPermission && photos.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No photos available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Gallery */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Dog Photos
        </h3>
        
        {photos.length === 0 ? (
          <p className="text-gray-500 text-center p-4">No photos available</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group">
                <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={photo.url}
                    alt={photo.caption}
                    width={300}
                    height={300}
                    className={`object-cover object-center ${photo.isPrimary ? 'ring-2 ring-blue-500' : ''}`}
                  />
                  {photo.isPrimary && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                      Primary
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-700 truncate">{photo.caption}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(photo.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                
                {hasEditPermission && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-2">
                      {!photo.isPrimary && (
                        <button 
                          onClick={() => handleSetPrimary(photo.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Set Primary
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          const newCaption = prompt('Enter new caption:', photo.caption);
                          if (newCaption !== null) {
                            handleEditCaption(photo.id, newCaption);
                          }
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this photo?')) {
                            handleDelete(photo.id);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Form - Only shown if user has edit permission */}
      {hasEditPermission && (
        <form onSubmit={handleUpload} className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-md font-medium text-gray-900 mb-4">Upload New Photo</h3>
          
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-2 bg-green-50 border border-green-300 text-green-700 rounded">
              {success}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: 5MB. Supported formats: JPEG, PNG, WebP
              </p>
            </div>
            
            {preview && (
              <div className="w-full sm:w-1/4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <input
              type="text"
              id="caption"
              value={caption}
              onChange={handleCaptionChange}
              placeholder="Enter a caption for this photo"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mt-4">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
