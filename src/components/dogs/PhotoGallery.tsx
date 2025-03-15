'use client';

import { useState } from 'react';
import Image from 'next/image';
import { hasPermission } from '@/utils/permissionUtils';

interface DogPhoto {
  id: string;
  url: string;
  caption: string;
  isPrimary: boolean;
  uploadDate: Date;
}

interface PhotoGalleryProps {
  dogId: string;
  photos: DogPhoto[];
  userRole: string;
  userId: string;
  ownerId: string;
  onSetPrimary: (photoId: string) => void;
  onDeletePhoto: (photoId: string) => void;
  onEditCaption: (photoId: string, caption: string) => void;
}

export default function PhotoGallery({
  dogId,
  photos,
  userRole,
  userId,
  ownerId,
  onSetPrimary,
  onDeletePhoto,
  onEditCaption
}: PhotoGalleryProps) {
  const [expandedPhotoId, setExpandedPhotoId] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Check permissions
  const canEdit = hasPermission(userRole, 'dog', 'edit', ownerId, userId);

  const handleExpandPhoto = (photoId: string) => {
    setExpandedPhotoId(prevId => prevId === photoId ? null : photoId);
  };

  const handleStartEditCaption = (photo: DogPhoto) => {
    setEditingPhotoId(photo.id);
    setEditCaption(photo.caption);
  };

  const handleSaveCaption = (photoId: string) => {
    onEditCaption(photoId, editCaption);
    setEditingPhotoId(null);
  };

  const handleCancelEdit = () => {
    setEditingPhotoId(null);
    setEditCaption('');
  };

  const handleConfirmDelete = (photoId: string) => {
    setConfirmDeleteId(photoId);
  };

  const handleDeleteConfirmed = (photoId: string) => {
    onDeletePhoto(photoId);
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No photos</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by uploading your first photo.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {photos.map(photo => (
        <div key={photo.id} className="relative bg-white rounded-lg shadow overflow-hidden">
          {/* Primary Badge */}
          {photo.isPrimary && (
            <div className="absolute top-2 left-2 z-10">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Primary
              </span>
            </div>
          )}
          
          {/* Photo */}
          <div 
            className="relative h-48 w-full cursor-pointer"
            onClick={() => handleExpandPhoto(photo.id)}
          >
            <Image
              src={photo.url}
              alt={photo.caption || 'Dog photo'}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Caption and Controls */}
          <div className="p-4">
            {/* Editing Caption */}
            {editingPhotoId === photo.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Photo caption"
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSaveCaption(photo.id)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                  {photo.caption || 'No caption'}
                </p>
                
                {/* Delete Confirmation */}
                {confirmDeleteId === photo.id ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-600">Delete this photo?</p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteConfirmed(photo.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Yes, Delete
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelDelete}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Controls */
                  <div className="flex flex-wrap gap-2">
                    {canEdit && !photo.isPrimary && (
                      <button
                        type="button"
                        onClick={() => onSetPrimary(photo.id)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                      >
                        Set as Primary
                      </button>
                    )}
                    {canEdit && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStartEditCaption(photo)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Edit Caption
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(photo.id)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Expanded Photo View */}
          {expandedPhotoId === photo.id && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden">
                <div className="relative h-96 w-full">
                  <Image
                    src={photo.url}
                    alt={photo.caption || 'Dog photo'}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {photo.caption || 'No caption'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {photo.uploadDate ? new Date(photo.uploadDate).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedPhotoId(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
