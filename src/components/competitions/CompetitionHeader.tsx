import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { CompetitionResult, categories } from '@/types/competition';

interface CompetitionHeaderProps {
  competition: CompetitionResult;
}

// Helper function to format date with proper error handling
const formatDate = (date: Date) => {
  try {
    return format(date instanceof Date ? date : new Date(date), 'MMMM d, yyyy');
  } catch (err) {
    console.error("Date formatting error:", err);
    return "Invalid date";
  }
};

// Helper function to get category name
const getCategoryName = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : categoryId;
};

const CompetitionHeader: React.FC<CompetitionHeaderProps> = ({ competition }) => {
  return (
    <>
      <div className="mb-6">
        <Link 
          href="/competitions"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Competitions
        </Link>
      </div>
      
      {/* Competition header */}
      <div className="bg-blue-600 text-white p-6 rounded-t-lg">
        <h1 className="text-2xl font-bold mb-2">{competition.eventName}</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="bg-blue-700 px-3 py-1 rounded-full">
            {getCategoryName(competition.category)}
          </span>
          <span className="bg-blue-700 px-3 py-1 rounded-full">
            {formatDate(competition.eventDate)}
          </span>
          <span className="bg-blue-700 px-3 py-1 rounded-full">
            {competition.location}
          </span>
        </div>
      </div>
    </>
  );
};

export default CompetitionHeader;
