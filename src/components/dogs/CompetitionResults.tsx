'use client';

import { format } from 'date-fns';

// Define interfaces with correct field names
interface CompetitionResult {
  id: string;
  eventName: string;
  eventDate: string;
  place?: number;
  score?: number;
  title_earned?: string; // Correct field name (not 'certificate')
}

interface CompetitionResultsProps {
  results: CompetitionResult[];
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({ results }) => {
  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error("Invalid date format:", error);
      return dateString;
    }
  };

  // Get appropriate badge color based on place
  const getPlaceBadgeColor = (place?: number) => {
    if (!place) return 'bg-gray-100 text-gray-800';
    
    switch (place) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-slate-100 text-slate-800';
      case 3:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (results.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Competition Results</h2>
        <p className="text-gray-500">No competition results available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Competition Results</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Place
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title Earned
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => (
              <tr key={result.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{result.eventName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(result.eventDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.place ? (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlaceBadgeColor(result.place)}`}>
                      {result.place}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{result.score || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {result.title_earned ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {result.title_earned}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
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

export default CompetitionResults;
