'use client';

import { useState } from 'react';
import Link from 'next/link';
import breedStandards, { BreedStandard } from '@/data/breedStandards';

export default function BreedingStandards() {
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter breeds based on search query
  const filteredBreeds = breedStandards.filter(breed => 
    breed.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find the selected breed
  const selectedBreedData = selectedBreed ? breedStandards.find(breed => breed.id === selectedBreed) : null;

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Breed Standards</h1>
          <p className="text-gray-600 mb-8">
            Official breed standards provide detailed descriptions of the ideal specimens of recognized dog breeds. 
            These standards are used by judges in conformation shows and by breeders to evaluate breeding stock. 
            Understanding breed standards is essential for anyone involved in breeding or showing dogs.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Breed List */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <label htmlFor="search-breeds" className="sr-only">Search Breeds</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search-breeds"
                    id="search-breeds"
                    className="block w-full rounded-md border-0 py-2 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="Search breeds..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Select a Breed</h2>
              <div className="overflow-y-auto max-h-[500px] pr-2">
                <ul className="divide-y divide-gray-200">
                  {filteredBreeds.map((breed) => (
                    <li key={breed.id} className="py-2">
                      <button
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${selectedBreed === breed.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setSelectedBreed(breed.id)}
                      >
                        {breed.breed}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Breed Details */}
            <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-md">
              {selectedBreedData ? (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedBreedData.breed}</h2>
                    <Link 
                      href={selectedBreedData.link} 
                      target="_blank" 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Official Standard →
                    </Link>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{selectedBreedData.description}</p>
                  
                  <div className="text-sm text-gray-500 mb-6">
                    Standard by: {selectedBreedData.organization}
                  </div>
                  
                  <div className="space-y-6">
                    {selectedBreedData.categories.map((category, index) => (
                      <div key={index} className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{category.title}</h3>
                        <p className="text-gray-600">{category.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <p className="mt-2 text-gray-500">Select a breed from the list to view its standard</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Understanding Breed Standards</h2>
            <div className="prose prose-blue max-w-none">
              <p>
                Breed standards are detailed descriptions that define the ideal physical traits, temperament, and abilities of a particular dog breed. 
                These standards are established by kennel clubs and breed organizations and serve as a blueprint for breeders and judges.
              </p>
              <h3 className="text-lg font-medium mt-4">Key Components of Breed Standards:</h3>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong>General Appearance:</strong> The overall impression the dog should give, including size, proportion, and substance.</li>
                <li><strong>Size and Proportion:</strong> The ideal height and weight ranges, as well as the proper proportions of the body.</li>
                <li><strong>Head:</strong> Details about the skull, muzzle, eyes, ears, and facial expression.</li>
                <li><strong>Body:</strong> Description of the neck, topline, chest, ribs, and underline.</li>
                <li><strong>Forequarters and Hindquarters:</strong> Structure of the shoulders, legs, feet, and angulation.</li>
                <li><strong>Coat and Color:</strong> The texture, length, and acceptable colors and patterns of the coat.</li>
                <li><strong>Gait:</strong> How the dog should move, including stride, reach, and drive.</li>
                <li><strong>Temperament:</strong> The expected character and behavioral traits of the breed.</li>
              </ul>
              <p className="mt-4">
                While breed standards describe the ideal specimen, no dog is perfect. Understanding the standard helps breeders make informed decisions 
                to improve their lines and preserve the unique characteristics that define each breed.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
