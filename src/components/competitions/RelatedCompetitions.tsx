import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { CompetitionResult, categories } from '@/types/competition';

interface RelatedCompetitionsProps {
  competitions: CompetitionResult[];
}

const RelatedCompetitions: React.FC<RelatedCompetitionsProps> = ({ competitions }) => {
  if (!competitions || competitions.length === 0) {
    return null;
  }

  // Format date with proper error handling
  const formatDate = (date: Date) => {
    try {
      // Ensure date is properly instantiated as a Date object
      return format(date instanceof Date ? date : new Date(date), 'MMM d, yyyy');
    } catch (err) {
      console.error("Date formatting error:", err);
      return "Invalid date";
    }
  };

  // Get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Related Competitions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {competitions.map(competition => (
          <div key={competition.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-40">
              {competition.imageUrl ? (
                <Image 
                  src={competition.imageUrl}
                  alt={competition.eventName}
                  className="object-cover"
                  fill
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <span className="text-white font-medium">{competition.eventName}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{formatDate(competition.eventDate)}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {getCategoryName(competition.category)}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-sm font-medium">
                  {competition.dogName} • Rank: {competition.rank}
                </span>
              </div>
              <div className="mt-3">
                <Link 
                  href={`/competitions/${competition.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedCompetitions;
