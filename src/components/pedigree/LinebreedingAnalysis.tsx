'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Link from 'next/link';
import { GET_LINEBREEDING_ANALYSIS } from '@/graphql/queries/pedigreeQueries';

interface LinebreedingAnalysisProps {
  sireId: string;
  damId: string;
  generations?: number;
}

const LinebreedingAnalysis: React.FC<LinebreedingAnalysisProps> = ({ 
  sireId, 
  damId,
  generations = 6
}) => {
  const { loading, error, data } = useQuery(GET_LINEBREEDING_ANALYSIS, {
    variables: { sireId, damId, generations },
    fetchPolicy: 'network-only',
  });

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  // Get color based on inbreeding coefficient
  const getCoefficientColor = (value: number) => {
    if (value < 0.0625) return 'text-green-600'; // Less than 6.25%
    if (value < 0.125) return 'text-yellow-600'; // Less than 12.5%
    return 'text-red-600'; // Greater than or equal to 12.5%
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Linebreeding Analysis</h2>
        <p className="text-red-500">Error loading analysis: {error.message}</p>
      </div>
    );
  }

  if (!data?.linebreedingAnalysis) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Linebreeding Analysis</h2>
        <p className="text-gray-500">No analysis data available for this breeding pair.</p>
      </div>
    );
  }

  const analysis = data.linebreedingAnalysis;
  const dogName = analysis.dog.name;
  const coefficient = analysis.inbreedingCoefficient;
  const coefficientPercent = (coefficient * 100).toFixed(2);
  const commonAncestors = analysis.commonAncestors || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Linebreeding Analysis</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700">Dog Information</h3>
        <div className="mt-2">
          <div>
            <span className="text-gray-500">Name:</span> {dogName}
          </div>
          <div>
            <span className="text-gray-500">Breed:</span> {analysis.dog.breedObj?.name || analysis.dog.breed}
          </div>
          {analysis.dog.registrationNumber && (
            <div>
              <span className="text-gray-500">Registration:</span> {analysis.dog.registrationNumber}
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Inbreeding Coefficient</h3>
          <span className={`text-lg font-bold ${getCoefficientColor(coefficient)}`}>
            {coefficientPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              coefficient < 0.0625
                ? 'bg-green-500'
                : coefficient < 0.125
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(coefficient * 100, 100)}%` }}
          ></div>
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>6.25%</span>
          <span>12.5%</span>
          <span>25%</span>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Genetic Diversity</h3>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span>Diversity Score</span>
            <span className="font-bold">
              {(analysis.geneticDiversity * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      
      {commonAncestors.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Common Ancestors</h3>
          <div className="space-y-3">
            {commonAncestors.map((ancestor: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  {ancestor.dog.mainImageUrl && (
                    <img 
                      src={ancestor.dog.mainImageUrl} 
                      alt={ancestor.dog.name} 
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                  )}
                  <Link 
                    href={`/manage/dogs/${ancestor.dog.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {ancestor.dog.name}
                  </Link>
                </div>
                <div className="text-sm">
                  <div className="mb-1">
                    <span className="text-gray-500">Breed:</span> {ancestor.dog.breedObj?.name || ancestor.dog.breed}
                  </div>
                  {ancestor.dog.registrationNumber && (
                    <div className="mb-1">
                      <span className="text-gray-500">Registration:</span> {ancestor.dog.registrationNumber}
                    </div>
                  )}
                  <div className="mb-1">
                    <span className="text-gray-500">Born:</span> {formatDate(ancestor.dog.dateOfBirth)}
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-500">Occurrences:</span> {ancestor.occurrences}
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-500">Contribution:</span> {(ancestor.contribution * 100).toFixed(2)}%
                  </div>
                </div>
                
                {ancestor.pathways.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Pathways:</div>
                    <div className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      {ancestor.pathways.map((pathway: string, pathIdx: number) => (
                        <div key={pathIdx} className="mb-1 last:mb-0">
                          {pathway}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Recommendations</h3>
          <ul className="list-disc list-inside space-y-2 p-3 bg-blue-50 rounded-lg">
            {analysis.recommendations.map((recommendation: string, index: number) => (
              <li key={index} className="text-sm">{recommendation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LinebreedingAnalysis;
