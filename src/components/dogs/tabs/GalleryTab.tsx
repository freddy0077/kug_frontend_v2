'use client';

import { useState } from 'react';
import Image from 'next/image';

interface DogImage {
  id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
}

interface GalleryTabProps {
  dogName: string;
  images: DogImage[];
}

const GalleryTab: React.FC<GalleryTabProps> = ({ dogName, images }) => {
  const [selectedImage, setSelectedImage] = useState<DogImage | null>(
    images.length > 0 ? images[0] : null
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Sort images to show primary first, then others
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary === b.isPrimary) return 0;
    return a.isPrimary ? -1 : 1;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10">
          <svg
            className="w-16 h-16 text-gray-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-4 text-gray-500">No images available for {dogName}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
          {/* Main image display */}
          <div className="lg:col-span-2 p-4">
            <div className="aspect-w-16 aspect-h-12 relative overflow-hidden rounded-lg bg-gray-100">
              {selectedImage && (
                <div
                  className="w-full h-full cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                >
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.caption || `${dogName} photo`}
                    className="object-cover w-full h-full rounded-lg"
                  />
                  
                  {/* Caption overlay */}
                  {selectedImage.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-3">
                      <p className="text-sm">{selectedImage.caption}</p>
                    </div>
                  )}
                  
                  {/* Zoom hint */}
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black bg-opacity-50 text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails and metadata */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Photo Gallery
            </h3>
            
            {/* Image count and info */}
            <p className="text-sm text-gray-500 mb-3">
              {images.length} photo{images.length !== 1 ? 's' : ''} available
            </p>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {sortedImages.map((image) => (
                <div
                  key={image.id}
                  className={`
                    relative aspect-square overflow-hidden rounded-md cursor-pointer transition-all duration-200
                    ${selectedImage?.id === image.id ? 'ring-2 ring-green-500 ring-offset-2' : 'hover:opacity-80'}
                  `}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.url}
                    alt={image.caption || `${dogName} photo`}
                    className="object-cover w-full h-full"
                  />
                  
                  {/* Primary badge */}
                  {image.isPrimary && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-800 text-xs px-1 py-0.5 rounded-bl">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Selected image info */}
            {selectedImage && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  {selectedImage.isPrimary ? 'Main profile photo' : 'Additional photo'}
                </p>
                {selectedImage.caption && (
                  <p className="text-sm font-medium mt-1">{selectedImage.caption}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-5xl max-h-screen">
            <button 
              className="absolute top-0 right-0 -mt-12 -mr-4 text-white p-2" 
              onClick={() => setLightboxOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || `${dogName} photo`}
              className="max-w-full max-h-screen object-contain"
            />
            
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4">
                <p>{selectedImage.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryTab;
