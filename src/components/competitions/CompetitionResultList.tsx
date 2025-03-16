'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Interface using title_earned instead of certificate as per memory
export interface CompetitionResult {
  id: string;
  dogId: string;
  dogName: string;
  eventName: string;
  eventDate: Date;
  location: string;
  category: string;
  rank: number;
  title_earned: string; // Correct field name per memory
  judge: string;
  points: number;
  description?: string;
  totalParticipants?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CompetitionResultListProps {
  results: CompetitionResult[];
}

export const CompetitionResultList: React.FC<CompetitionResultListProps> = ({ results }) => {
  const { user } = useAuth();
  
  if (!results || results.length === 0) {
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
            {results.map((result) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompetitionResultList;
