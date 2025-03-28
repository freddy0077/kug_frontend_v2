'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_OWNERS } from '@/graphql/queries/userQueries';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/utils/permissionUtils';
import Link from 'next/link';
import BreederCard from './BreederCard';
import SearchIcon from '@/components/icons/SearchIcon';

const BreedersList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBreeders, setFilteredBreeders] = useState<any[]>([]);
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  // Fetch owners data (users with OWNER role who act as breeders)
  const { data, loading, error } = useQuery(GET_OWNERS, {
    variables: { 
      limit: 100,
    },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (data?.owners?.items) {
      if (searchQuery.trim() === '') {
        setFilteredBreeders(data.owners.items);
      } else {
        const lowercaseQuery = searchQuery.toLowerCase();
        const filtered = data.owners.items.filter((owner: any) => 
          owner.name?.toLowerCase().includes(lowercaseQuery) ||
          owner.address?.toLowerCase().includes(lowercaseQuery) ||
          owner.contactEmail?.toLowerCase().includes(lowercaseQuery)
        );
        setFilteredBreeders(filtered);
      }
    }
  }, [data, searchQuery]);

  return (
    <div className="min-h-screen">
      {/* Hero section with gradient background */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Dog Breeders</h1>
          <p className="text-white text-lg max-w-3xl">
            Discover professional dog breeders specializing in various breeds. Connect with experienced breeders committed to ethical breeding practices and canine health.
          </p>
        </div>
      </div>
      
      {/* Search and filter section */}
      <div className="bg-white py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search breeders by name, location or specialization..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isAdmin && (
              <Link 
                href="/admin/manage-breeders" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Manage Breeders
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Breeders grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading breeders. Please try again later.</p>
          </div>
        ) : filteredBreeders.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900">No breeders found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBreeders.map((owner: any) => (
              <BreederCard key={owner.id} owner={owner} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BreedersList;
