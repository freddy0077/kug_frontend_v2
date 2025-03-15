'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CompetitionResultList, { CompetitionResult } from '@/components/competitions/CompetitionResultList';
import CompetitionFilters, { competitionCategories } from '@/components/competitions/CompetitionFilters';
import { useAuth } from '@/contexts/AuthContext';

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

  // Fetch competition results on component mount
  useEffect(() => {
    // This would be replaced with actual API call
    fetchMockCompetitionResults().then(data => {
      setResults(data);
      setFilteredResults(data);
      setIsLoading(false);
    });
  }, []);

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters({ searchQuery: query, dogId: undefined, category: undefined, dateRange: undefined });
  };

  // Handle filtering
  const handleFilterChange = (filters: FilterOptions) => {
    applyFilters({ ...filters, searchQuery });
  };

  // Apply filters to results
  const applyFilters = ({ dogId, category, dateRange, searchQuery: query = searchQuery }: FilterOptions) => {
    let filtered = [...results];
    
    // Apply search query filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(result => 
        result.dogName.toLowerCase().includes(lowerQuery) ||
        result.eventName.toLowerCase().includes(lowerQuery) ||
        result.title_earned.toLowerCase().includes(lowerQuery) ||
        result.location.toLowerCase().includes(lowerQuery) ||
        result.judge.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Apply dog filter
    if (dogId) {
      filtered = filtered.filter(result => result.dogId === dogId);
    }
    
    // Apply category filter
    if (category) {
      filtered = filtered.filter(result => result.category === category);
    }
    
    // Apply date range filter
    if (dateRange) {
      const now = new Date();
      let dateLimit: Date;
      
      switch (dateRange) {
        case 'last30':
          dateLimit = new Date(now.setDate(now.getDate() - 30));
          break;
        case 'last90':
          dateLimit = new Date(now.setDate(now.getDate() - 90));
          break;
        case 'last6months':
          dateLimit = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case 'lastYear':
          dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          dateLimit = new Date(0); // Beginning of time
      }
      
      filtered = filtered.filter(result => new Date(result.eventDate) >= dateLimit);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    
    setFilteredResults(filtered);
  };

  // Extract unique dogs for filter dropdown
  const dogOptions = Array.from(
    new Set(results.map(result => result.dogId))
  ).map(dogId => {
    const dog = results.find(r => r.dogId === dogId);
    return {
      id: dogId,
      name: dog?.dogName || `Dog ${dogId}`
    };
  });

  // Mock data function (would be replaced with actual API call)
  const fetchMockCompetitionResults = async (): Promise<CompetitionResult[]> => {
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 1,
        dogId: 101,
        dogName: "Max",
        eventName: "National Kennel Club Championship",
        eventDate: new Date(2024, 9, 15),
        location: "Denver, CO",
        rank: 1,
        title_earned: "Best in Show", // Using correct field name per memory
        judge: "Elizabeth Johnson",
        points: 25,
        category: "conformation"
      },
      {
        id: 2,
        dogId: 102,
        dogName: "Bella",
        eventName: "Regional Agility Competition",
        eventDate: new Date(2024, 8, 22),
        location: "Portland, OR",
        rank: 2,
        title_earned: "Agility Master Champion",
        judge: "Robert Wilson",
        points: 18,
        category: "agility"
      },
      {
        id: 3,
        dogId: 103,
        dogName: "Charlie",
        eventName: "Obedience Trials Championship",
        eventDate: new Date(2024, 7, 8),
        location: "Chicago, IL",
        rank: 3,
        title_earned: "Companion Dog Excellent",
        judge: "Susan Miller",
        points: 15,
        category: "obedience"
      },
      {
        id: 4,
        dogId: 104,
        dogName: "Luna",
        eventName: "Herding Competition",
        eventDate: new Date(2024, 6, 19),
        location: "Austin, TX",
        rank: 1,
        title_earned: "Herding Champion",
        judge: "David Brown",
        points: 22,
        category: "herding"
      },
      {
        id: 5,
        dogId: 105,
        dogName: "Cooper",
        eventName: "Field Trial National Event",
        eventDate: new Date(2024, 5, 30),
        location: "Boise, ID",
        rank: 4,
        title_earned: "Field Champion",
        judge: "Patricia Garcia",
        points: 12,
        category: "field-trials"
      },
      {
        id: 6,
        dogId: 101,
        dogName: "Max",
        eventName: "Rally Competition",
        eventDate: new Date(2024, 4, 14),
        location: "Seattle, WA",
        rank: 2,
        title_earned: "Rally Advanced",
        judge: "Michael Adams",
        points: 16,
        category: "rally"
      }
    ];
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'HANDLER', 'CLUB']}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Competition Results</h1>
          {/* Only show "Add New Result" button for certain roles */}
          {user && ['ADMIN', 'OWNER', 'HANDLER', 'CLUB'].some(role => 
            role.toUpperCase() === user.role.toUpperCase()
          ) && (
            <Link 
              href="/competitions/new" 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Add New Result
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <CompetitionFilters 
            onFilterChange={handleFilterChange}
            dogOptions={dogOptions}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <CompetitionResultList results={filteredResults} />
        )}
      </div>
    </ProtectedRoute>
  );
}
