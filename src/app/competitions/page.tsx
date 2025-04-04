'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

import { GET_COMPETITION_RESULTS } from '@/graphql/queries/competitionQueries';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CompetitionResultList from '@/components/competitions/CompetitionResultList';
import { CompetitionResult } from '@/hooks/useCompetitions';
import CompetitionFilters, { competitionCategories } from '@/components/competitions/CompetitionFilters';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { UserRole } from '@/types/enums';

// Define filter options interface
interface FilterOptions {
  dogId?: number;
  category?: string;
  dateRange?: string;
  searchQuery?: string;
}

export default function CompetitionsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<CompetitionResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // GraphQL query variables
  const [queryVars, setQueryVars] = useState({
    limit: 20, 
    offset: 0,
    sortBy: "EVENT_DATE" as "EVENT_DATE" | "RANK" | "POINTS" | "EVENT_NAME",
    sortDirection: "DESC" as "ASC" | "DESC",
    category: undefined as string | undefined,
    dogId: undefined as string | undefined,
    searchTerm: undefined as string | undefined
  });

  // Fetch competition results using GraphQL
  const { data, loading, error, refetch } = useQuery(GET_COMPETITION_RESULTS, {
    variables: queryVars,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.competitions?.items) {
        const formattedResults = data.competitions.items.map((result: any) => ({
          ...result,
          eventDate: new Date(result.eventDate)
        }));
        setResults(formattedResults);
        setFilteredResults(formattedResults);
      } else {
        setResults([]);
        setFilteredResults([]);
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error fetching competition results:', error);
      toast.error('Failed to load competition results. Please try again later.');
      setIsLoading(false);
    }
  });

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters({ searchQuery: query, dogId: undefined, category: undefined, dateRange: undefined });
  };

  // Handle filtering
  const handleFilterChange = (filters: FilterOptions) => {
    applyFilters({ ...filters, searchQuery });
  };

  // Apply filters to results using GraphQL query
  const applyFilters = ({ dogId, category, dateRange, searchQuery: query = searchQuery }: FilterOptions) => {
    // Update query variables for GraphQL
    const updatedVars = {
      ...queryVars,
      dogId: dogId ? String(dogId) : undefined,
      category: category,
      searchTerm: query || undefined
    };
    
    setQueryVars(updatedVars);
    
    // Refetch with new variables
    setIsLoading(true);
    refetch(updatedVars).then(() => {
      setIsLoading(false);
    }).catch(error => {
      console.error('Error applying filters:', error);
      toast.error('Failed to apply filters. Please try again.');
      setIsLoading(false);
    });
  };
  
  // Extract unique dogs for filter dropdown from results
  const dogOptions = Array.from(
    new Set(results.map(result => result.dogId))
  ).map(dogId => {
    const dog = results.find(r => r.dogId === dogId);
    return {
      value: dogId.toString(),
      label: dog?.dogName || `Dog ${dogId}`
    };
  });

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.HANDLER, UserRole.CLUB, UserRole.VIEWER]}>
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Competition Results</h1>
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.HANDLER || user?.role === UserRole.OWNER) && (
            <Link 
              href="/competitions/new"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Result
            </Link>
          )}
        </div>
        
        {/* Search and Filters */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center mb-4">
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by dog name, event, or location..."
                  className="w-full py-2 px-4 pr-10 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="md:ml-auto">
              <CompetitionFilters 
                onFilterChange={handleFilterChange}
                dogOptions={dogOptions}
              />
            </div>
          </div>
        </div>
        
        {/* Results List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" color="border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-lg shadow-sm text-center">
            <p className="text-red-600">Error loading competition results. Please try again later.</p>
            <button 
              onClick={() => refetch()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600 text-lg">No competition results found.</p>
            {searchQuery && (
              <button 
                onClick={() => handleSearchChange('')} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <CompetitionResultList 
            initialResults={filteredResults} 
          />
        )}
        
        {/* Pagination */}
        {!isLoading && data?.competitions?.hasMore && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setQueryVars(prev => ({
                  ...prev,
                  offset: prev.offset + prev.limit
                }));
                setIsLoading(true);
                refetch({
                  ...queryVars,
                  offset: queryVars.offset + queryVars.limit
                });
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Load More
            </button>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
