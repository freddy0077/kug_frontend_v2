import React from 'react';
import Image from 'next/image';
import { CompetitionResult } from '@/types/competition';

interface CompetitionDetailsProps {
  competition: CompetitionResult;
}

const CompetitionDetails: React.FC<CompetitionDetailsProps> = ({ competition }) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1 relative h-64 rounded-lg overflow-hidden">
          {competition.imageUrl ? (
            <Image 
              src={competition.imageUrl}
              alt={competition.eventName}
              className="object-cover"
              fill
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
            
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Competition Results</h2>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span className="text-gray-600">Rank:</span>
              <span className="font-medium">{competition.rank}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Title Earned:</span>
              <span className="font-medium">{competition.title_earned}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Judge:</span>
              <span className="font-medium">{competition.judge}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Points:</span>
              <span className="font-medium">{competition.points}</span>
            </li>
            {competition.totalParticipants && (
              <li className="flex justify-between">
                <span className="text-gray-600">Total Participants:</span>
                <span className="font-medium">{competition.totalParticipants}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
          
      {/* Competition description */}
      {competition.description && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">About this Competition</h2>
          <p className="text-gray-700">{competition.description}</p>
        </div>
      )}
    </div>
  );
};

export default CompetitionDetails;
