'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/enums';

interface CompetitionResult {
  id: string;
  date: string;
  eventName: string;
  location?: string;
  rank?: number;
  points?: number;
  titleEarned?: string;
  judge?: string;
  notes?: string;
}

interface CompetitionsTabProps {
  dogId: string;
  results: CompetitionResult[];
}

const CompetitionsTab: React.FC<CompetitionsTabProps> = ({ dogId, results }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.OWNER;
  const [view, setView] = useState<'cards' | 'timeline'>('cards');
  
  // Sort competition results by date, newest first
  const sortedResults = [...results].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error("Invalid date format:", error);
      return "N/A";
    }
  };
  
  // Group results by year for stats
  const resultsByYear = sortedResults.reduce((acc, result) => {
    try {
      const year = new Date(result.date).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(result);
      return acc;
    } catch (error) {
      return acc;
    }
  }, {} as Record<string, CompetitionResult[]>);
  
  // Calculate statistics
  const totalCompetitions = sortedResults.length;
  const titlesEarned = sortedResults.filter(r => r.titleEarned).length;
  const topRanks = sortedResults.filter(r => r.rank && r.rank <= 3).length;
  
  // Filter results with rank 1 (wins)
  const wins = sortedResults.filter(r => r.rank === 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header with view toggle */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Competition Results
            </h3>
            
            <div className="flex items-center space-x-4">
              {/* View toggle */}
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    view === 'cards' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setView('cards')}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Cards
                  </span>
                </button>
                <button
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    view === 'timeline' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setView('timeline')}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Timeline
                  </span>
                </button>
              </div>
              
              {/* Add result button */}
              {isAdmin && (
                <Link
                  href={`/competitions/new?dogId=${dogId}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Result
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Display competition results based on selected view */}
        {sortedResults.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {view === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sortedResults.map((result) => (
                  <div 
                    key={result.id}
                    className="relative border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Medal indicator for top 3 */}
                    {result.rank && result.rank <= 3 && (
                      <div className="absolute top-0 right-0 -mt-2 -mr-2">
                        <div 
                          className={`
                            w-8 h-8 rounded-full shadow-md flex items-center justify-center text-white font-bold
                            ${result.rank === 1 ? 'bg-yellow-500' : ''}
                            ${result.rank === 2 ? 'bg-gray-400' : ''}
                            ${result.rank === 3 ? 'bg-amber-700' : ''}
                          `}
                        >
                          {result.rank}
                        </div>
                      </div>
                    )}
                    
                    <h4 className="font-medium text-gray-900 pr-6">
                      {result.eventName}
                    </h4>
                    
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(result.date)}
                      {result.location && ` · ${result.location}`}
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1">
                      {result.rank && (
                        <div className="col-span-1">
                          <span className="text-xs text-gray-500">Rank</span>
                          <p className="text-sm font-medium">{formatRank(result.rank)}</p>
                        </div>
                      )}
                      
                      {result.points !== undefined && (
                        <div className="col-span-1">
                          <span className="text-xs text-gray-500">Points</span>
                          <p className="text-sm font-medium">{result.points}</p>
                        </div>
                      )}
                      
                      {result.judge && (
                        <div className="col-span-2">
                          <span className="text-xs text-gray-500">Judge</span>
                          <p className="text-sm font-medium">{result.judge}</p>
                        </div>
                      )}
                    </div>
                    
                    {result.titleEarned && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Title: {result.titleEarned}
                        </span>
                      </div>
                    )}
                    
                    {result.notes && (
                      <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {result.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative pl-8 before:content-[''] before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
                {sortedResults.map((result, index) => (
                  <div key={result.id} className="mb-6 relative">
                    {/* Timeline marker */}
                    <div 
                      className={`
                        absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white
                        ${result.rank === 1 ? 'bg-yellow-500' : ''}
                        ${result.rank === 2 ? 'bg-gray-400' : ''}
                        ${result.rank === 3 ? 'bg-amber-700' : ''}
                        ${!result.rank || result.rank > 3 ? 'bg-blue-500' : ''}
                      `}
                    >
                      {result.rank && result.rank <= 3 ? (
                        <span className="text-xs text-white font-bold">{result.rank}</span>
                      ) : (
                        <span className="text-xs text-white">•</span>
                      )}
                    </div>
                    
                    <div className="bg-white rounded-lg border p-4 hover:bg-gray-50 transition-colors ml-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{result.eventName}</h4>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(result.date)}
                            {result.location && ` · ${result.location}`}
                          </div>
                        </div>
                        
                        {result.titleEarned && (
                          <div className="mt-2 sm:mt-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {result.titleEarned}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                        {result.rank && (
                          <div className="col-span-1">
                            <span className="text-xs text-gray-500">Rank</span>
                            <p className="text-sm font-medium">{formatRank(result.rank)}</p>
                          </div>
                        )}
                        
                        {result.points !== undefined && (
                          <div className="col-span-1">
                            <span className="text-xs text-gray-500">Points</span>
                            <p className="text-sm font-medium">{result.points}</p>
                          </div>
                        )}
                        
                        {result.judge && (
                          <div className="col-span-2">
                            <span className="text-xs text-gray-500">Judge</span>
                            <p className="text-sm font-medium">{result.judge}</p>
                          </div>
                        )}
                      </div>
                      
                      {result.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          {result.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="mt-4 text-gray-500">No competition results found</p>
            {isAdmin && (
              <Link
                href={`/competitions/new?dogId=${dogId}`}
                className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Add First Result
              </Link>
            )}
          </div>
        )}
      </div>
      
      {/* Sidebar */}
      <div className="space-y-6">
        {/* Competition stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Competition Stats
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{totalCompetitions}</div>
              <div className="text-xs text-gray-500 mt-1">Total events</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{wins.length}</div>
              <div className="text-xs text-gray-500 mt-1">1st place wins</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{topRanks}</div>
              <div className="text-xs text-gray-500 mt-1">Top 3 placements</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{titlesEarned}</div>
              <div className="text-xs text-gray-500 mt-1">Titles earned</div>
            </div>
          </div>
          
          {/* Timeline */}
          {Object.keys(resultsByYear).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Yearly Participation</h4>
              <div className="space-y-2">
                {Object.keys(resultsByYear)
                  .sort((a, b) => b.localeCompare(a))
                  .map(year => (
                    <div key={year} className="flex items-center">
                      <div className="w-12 text-sm text-gray-500">{year}</div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ 
                            width: `${Math.min(100, (resultsByYear[year].length / 10) * 100)}%` 
                          }}
                        />
                      </div>
                      <div className="w-5 text-xs text-gray-500 text-right">
                        {resultsByYear[year].length}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Titles earned */}
        {sortedResults.filter(r => r.titleEarned).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Titles Earned
            </h3>
            
            <div className="space-y-2">
              {sortedResults
                .filter(r => r.titleEarned)
                .map(result => (
                  <div key={result.id} className="flex items-start">
                    <div className="flex-shrink-0 w-10 text-center">
                      <div className="inline-block w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{result.titleEarned}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(result.date)}
                        {result.eventName && ` · ${result.eventName}`}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format rank
function formatRank(rank: number): string {
  if (rank === 1) return "1st Place";
  if (rank === 2) return "2nd Place";
  if (rank === 3) return "3rd Place";
  return `${rank}th Place`;
}

export default CompetitionsTab;
