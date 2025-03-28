'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { GET_BREEDS, SortDirection } from '@/graphql/queries/breedQueries';
import ModernBreedCard from './ModernBreedCard';
import { useAuth } from '@/contexts/AuthContext';
import { FiFilter, FiPlus, FiChevronDown, FiGrid, FiList, FiSearch } from 'react-icons/fi';
import { BreedGroupEnum } from '@/types/enums';

interface BreedListProps {
  initialSearchTerm?: string;
}

const ModernBreedList: React.FC<BreedListProps> = ({ initialSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { user } = useAuth();
  
  // Pagination state
  const [offset, setOffset] = useState(0);
  const limit = 12;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Reset pagination when search term, sort direction, or group changes
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearchTerm, sortDirection, selectedGroup]);

  const { loading, error, data, fetchMore } = useQuery(GET_BREEDS, {
    variables: {
      searchTerm: debouncedSearchTerm,
      group: selectedGroup || undefined,
      sortDirection,
      offset,
      limit
    },
    notifyOnNetworkStatusChange: true,
  });

  const handleLoadMore = useCallback(() => {
    if (data?.breeds?.hasMore) {
      fetchMore({
        variables: {
          searchTerm: debouncedSearchTerm,
          group: selectedGroup || undefined,
          sortDirection,
          offset: data.breeds.items.length,
          limit
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            breeds: {
              ...fetchMoreResult.breeds,
              items: [...prev.breeds.items, ...fetchMoreResult.breeds.items]
            }
          };
        }
      });
    }
  }, [data?.breeds?.hasMore, data?.breeds?.items?.length, debouncedSearchTerm, selectedGroup, fetchMore, limit, sortDirection]);

  // Get all available breed groups
  const breedGroups = Object.values(BreedGroupEnum);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-green-800 rounded-3xl mb-8">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
            <path fill="#ffffff" d="M0 0h1920v1080H0z" />
            <path fill="#15803d" fillOpacity=".3" d="M140-200l900 1200L60 1400z" />
            <path fill="#166534" fillOpacity=".3" d="M1200-200l900 1200-980 400z" />
          </svg>
        </div>
        <div className="relative py-14 px-8 md:py-20 md:px-12 flex flex-col items-start">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Dog Breed Directory
          </h1>
          <p className="text-white/90 text-lg md:text-xl md:max-w-xl mb-8">
            Discover and explore a diverse collection of dog breeds from around the world, with detailed information about their characteristics and care requirements.
          </p>
          <div className="flex flex-col w-full md:flex-row md:items-center gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-white/70" />
              </div>
              <input
                type="text"
                placeholder="Search breeds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
            </div>
            <Link 
              href="/manage/breeds/add" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-700 rounded-xl font-medium shadow-md hover:bg-green-50 transition-colors md:w-auto w-full"
            >
              <FiPlus className="mr-2" />
              Add New Breed
            </Link>
          </div>
        </div>
      </div>
      
      {/* Filter and View Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FiFilter className="mr-2" />
            Filters
            <FiChevronDown className={`ml-2 transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as SortDirection)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <option value={SortDirection.ASC}>A-Z</option>
            <option value={SortDirection.DESC}>Z-A</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-gray-500 text-sm">
            {data?.breeds?.totalCount ?? 0} breeds found
          </div>
          
          <div className="border-l border-gray-300 h-6 mx-2"></div>
          
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FiList size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters panel */}
      {isFilterOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 overflow-hidden transition-all duration-300 ease-in-out">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="">All Groups</option>
                {breedGroups.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            
            {/* Additional filters can be added here */}
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedGroup('');
                  setSearchTerm('');
                  setSortDirection(SortDirection.ASC);
                }}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {loading && offset === 0 && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading breeds: {error.message}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && data?.breeds?.items?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <img 
            src="/images/empty-state.svg" 
            alt="No breeds found" 
            className="w-48 h-48 mb-4 opacity-75"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No breeds found</h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            {searchTerm 
              ? `No breeds match your search for "${searchTerm}". Try a different search term or clear your filters.` 
              : 'No breeds are available with the current filters. Try changing your filter criteria.'}
          </p>
          <button
            onClick={() => {
              setSelectedGroup('');
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
      
      {/* Breed list */}
      {!loading && data?.breeds?.items?.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.breeds.items.map((breed: any) => (
                <ModernBreedCard 
                  key={breed.id} 
                  breed={breed} 
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {data.breeds.items.map((breed: any) => (
                <ModernBreedCard 
                  key={breed.id} 
                  breed={breed} 
                  viewMode="list"
                />
              ))}
            </div>
          )}
          
          {/* Load more button */}
          {data.breeds.hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-green-500 rounded-full mr-2"></span>
                    Loading...
                  </>
                ) : (
                  'Load More Breeds'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ModernBreedList;
