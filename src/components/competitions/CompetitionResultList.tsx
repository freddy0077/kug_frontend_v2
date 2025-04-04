'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCompetitionResults, CompetitionFilters } from '@/hooks/useCompetitions';

// Using the type from our hooks instead
import type { CompetitionResult } from '@/hooks/useCompetitions';

interface CompetitionResultListProps {
  filters?: CompetitionFilters;
  initialResults?: CompetitionResult[];
}

export const CompetitionResultList: React.FC<CompetitionResultListProps> = ({ filters = {}, initialResults }) => {
  const { user } = useAuth();
  const { 
    competitions = { items: initialResults || [], totalCount: initialResults?.length || 0, hasMore: false },
    loading, 
    error, 
    loadMore 
  } = useCompetitionResults(filters);
  
  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-center">
        <p className="text-red-500">Error loading competition results: {error.message}</p>
      </div>
    );
  }
  
  if (!loading && (!competitions.items || competitions.items.length === 0)) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-center">
        <p className="text-gray-500">No competition results found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank/Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && !competitions.items.length ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                </td>
              </tr>
            ) : (
              competitions.items.map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(result.eventDate), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{result.dogName}</div>
                  <div className="text-xs text-gray-500">ID: {result.dogId}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{result.eventName}</div>
                  <div className="text-xs text-gray-500 mt-1">Judge: {result.judge}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Rank: {result.rank}</div>
                  <div className="text-xs text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {result.title_earned}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/competitions/${result.id}`} className="text-green-600 hover:text-green-900 mr-4">
                    View
                  </Link>
                  {/* Show edit/delete only for users with right permissions */}
                  {user && ['ADMIN', 'OWNER', 'HANDLER', 'CLUB'].some(role => 
                    role.toUpperCase() === user.role.toUpperCase()
                  ) && (
                    <>
                      <Link href={`/competitions/${result.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                        Edit
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
      
      {/* Load more button */}
      {competitions.hasMore && (
        <div className="flex justify-center mt-4 pb-4">
          <button
            onClick={() => loadMore()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CompetitionResultList;
