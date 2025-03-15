'use client';

import React, { useState } from 'react';

interface Dog {
  id: string;
  name: string;
  registrationNumber: string;
  breedName: string;
  gender: 'male' | 'female';
  dateOfBirth: Date;
  color: string;
  ownerId: string;
  ownerName: string;
  isChampion: boolean;
  hasHealthTests: boolean;
}

interface DogSearchPanelProps {
  onDogSelect: (dogId: string) => void;
  selectedDogId: string;
}

const DogSearchPanel: React.FC<DogSearchPanelProps> = ({ onDogSelect, selectedDogId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Dog[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      // In a real app, you would fetch this from an API
      // For now, simulate an API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock search results
      const mockResults = [
        {
          id: 'dog1',
          name: 'Champion Rocky',
          registrationNumber: 'AKC123456',
          breedName: 'Labrador Retriever',
          gender: 'male' as const,
          dateOfBirth: new Date('2020-05-15'),
          color: 'Black',
          ownerId: 'user123',
          ownerName: 'John Doe',
          isChampion: true,
          hasHealthTests: true
        },
        {
          id: 'dog2',
          name: 'Luna',
          registrationNumber: 'AKC789012',
          breedName: 'Golden Retriever',
          gender: 'female' as const,
          dateOfBirth: new Date('2021-03-22'),
          color: 'Golden',
          ownerId: 'user123',
          ownerName: 'John Doe',
          isChampion: false,
          hasHealthTests: true
        },
        {
          id: 'dog3',
          name: 'Max',
          registrationNumber: 'AKC345678',
          breedName: 'German Shepherd',
          gender: 'male' as const,
          dateOfBirth: new Date('2019-11-10'),
          color: 'Black and Tan',
          ownerId: 'user456',
          ownerName: 'Jane Smith',
          isChampion: true,
          hasHealthTests: false
        }
      ].filter(dog => 
        dog.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        dog.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(mockResults);
    } catch (err) {
      console.error('Error searching for dogs:', err);
      setError('Failed to search for dogs');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Search for a Dog</h3>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or registration number"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>
      
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breed</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {searchResults.map((dog) => (
                <tr key={dog.id} className={selectedDogId === dog.id ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dog.name}
                    {dog.isChampion && (
                      <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        CH
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dog.registrationNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dog.breedName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dog.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dog.ownerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onDogSelect(dog.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          No dogs found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default DogSearchPanel;
