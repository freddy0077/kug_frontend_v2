import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BreedHeroProps {
  name: string;
  imageUrl?: string | null;
  description?: string | null;
}

const BreedHero: React.FC<BreedHeroProps> = ({ 
  name, 
  imageUrl, 
  description 
}) => {
  return (
    <div className="relative bg-gradient-to-r from-green-700 to-green-900 rounded-xl overflow-hidden mb-8">
      <div className="absolute inset-0 opacity-20 bg-pattern"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="md:flex items-center">
          <div className="md:w-1/2 md:pr-8 mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <Link href="/breeds" className="text-green-200 hover:text-white transition-colors">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Back to Breeds
                </span>
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{name}</h1>
            
            {description && (
              <div className="text-green-100 text-lg">
                {description}
              </div>
            )}
          </div>
          
          {imageUrl ? (
            <div className="md:w-1/2">
              <div className="aspect-w-16 aspect-h-12 rounded-lg overflow-hidden shadow-xl">
                <Image 
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          ) : (
            <div className="md:w-1/2 flex justify-center">
              <div className="bg-white bg-opacity-10 rounded-lg p-8 text-center">
                <svg className="w-24 h-24 mx-auto text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <p className="mt-4 text-white text-opacity-80">No image available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreedHero;
