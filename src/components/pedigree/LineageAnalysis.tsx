'use client';

import { useState, useEffect } from 'react';
import {
  calculateCoefficientOfInbreeding,
  findCommonAncestors,
  CommonAncestor,
  calculateGeneticInfluence
} from '@/utils/lineageUtils';
import { format } from 'date-fns';
import { hasPermission, UserRole } from '@/utils/permissionUtils';

type LineageAnalysisProps = {
  dogId: string;
  dogName: string;
  userRole: UserRole;
  userId: string;
  ownerId: string;
};

export default function LineageAnalysis({
  dogId,
  dogName,
  userRole,
  userId,
  ownerId
}: LineageAnalysisProps) {
  const [coi, setCoi] = useState<number | null>(null);
  const [coiLoading, setCoiLoading] = useState(false);
  const [commonAncestors, setCommonAncestors] = useState<CommonAncestor[]>([]);
  const [ancestorsLoading, setAncestorsLoading] = useState(false);
  const [generations, setGenerations] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [hasViewPermission, setHasViewPermission] = useState(false);

  useEffect(() => {
    // Check if user has permission to view the lineage analysis
    const canView = hasPermission(userRole, 'dog', 'view', ownerId, userId);
    setHasViewPermission(canView);

    if (canView) {
      loadLineageData();
    }
  }, [dogId, generations, userRole, userId, ownerId]);

  const loadLineageData = async () => {
    try {
      setError(null);
      
      // Load COI data
      setCoiLoading(true);
      const coiValue = await calculateCoefficientOfInbreeding(dogId, generations);
      setCoi(coiValue);
      setCoiLoading(false);
      
      // Load common ancestors
      setAncestorsLoading(true);
      const ancestors = await findCommonAncestors(dogId, generations);
      setCommonAncestors(ancestors);
      setAncestorsLoading(false);
    } catch (err) {
      setError('Failed to load lineage data. Please try again later.');
      setCoiLoading(false);
      setAncestorsLoading(false);
    }
  };

  const handleGenerationsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenerations(parseInt(e.target.value));
  };

  // Function to format COI as a percentage with 2 decimal places
  const formatCoiPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };

  // Function to determine COI risk level
  const getCoiRiskLevel = (value: number): { level: string; color: string } => {
    if (value < 0.0625) { // Less than 6.25%
      return { level: 'Low', color: 'text-green-700 bg-green-100' };
    } else if (value < 0.125) { // Less than 12.5%
      return { level: 'Moderate', color: 'text-yellow-700 bg-yellow-100' };
    } else if (value < 0.25) { // Less than 25%
      return { level: 'High', color: 'text-orange-700 bg-orange-100' };
    } else { // Greater than or equal to 25%
      return { level: 'Very High', color: 'text-red-700 bg-red-100' };
    }
  };

  // Format date function
  const formatDate = (date?: Date | string): string => {
    if (!date) return 'Unknown';
    try {
      // Convert string to Date if it's a string
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!hasViewPermission) {
    return (
      <div className="bg-red-50 border border-red-300 p-4 rounded-md">
        <p className="text-red-700">
          You do not have permission to view lineage information for this dog.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadLineageData}
          className="mt-2 px-3 py-1 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lineage Analysis
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detailed information about {dogName}'s lineage
          </p>
        </div>
        <div>
          <label htmlFor="generations" className="block text-sm font-medium text-gray-700 mr-2">
            Generations:
          </label>
          <select
            id="generations"
            name="generations"
            value={generations}
            onChange={handleGenerationsChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value={3}>3 Generations</option>
            <option value={4}>4 Generations</option>
            <option value={5}>5 Generations</option>
            <option value={6}>6 Generations</option>
            <option value={7}>7 Generations</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200">
        {/* COI Section */}
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Coefficient of Inbreeding (COI)
          </h4>
          
          {coiLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : coi !== null ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCoiPercentage(coi)}
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getCoiRiskLevel(coi).color}`}>
                  {getCoiRiskLevel(coi).level} Risk
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className={`h-2.5 rounded-full ${
                    coi < 0.0625 ? 'bg-green-600' :
                    coi < 0.125 ? 'bg-yellow-500' :
                    coi < 0.25 ? 'bg-orange-500' : 'bg-red-600'
                  }`} 
                  style={{ width: `${Math.min(coi * 100 * 2, 100)}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                The Coefficient of Inbreeding (COI) represents the probability that two alleles at any given locus are identical by descent. 
                A higher COI indicates increased genetic similarity from common ancestors.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h5 className="font-medium text-blue-900 mb-2">What this means</h5>
                  <p className="text-sm text-blue-800">
                    {coi < 0.0625 ? 
                      'Low inbreeding level indicates good genetic diversity.' : 
                    coi < 0.125 ?
                      'Moderate inbreeding is acceptable for linebreeding, but monitor carefully.' :
                    coi < 0.25 ?
                      'High inbreeding suggests close relative breeding. Consider outbreeding for future matings.' :
                      'Very high inbreeding indicates significant genetic risk. Outbreeding is strongly recommended.'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h5 className="font-medium text-gray-900 mb-2">Breed Context</h5>
                  <p className="text-sm text-gray-700">
                    {`The average COI for this breed is approximately 6.5%. ${
                      coi < 0.065 ? 
                        `${dogName}'s COI is below the breed average.` : 
                        `${dogName}'s COI is above the breed average.`
                    }`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Unable to calculate COI.</p>
          )}
        </div>

        {/* Common Ancestors Section */}
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Common Ancestors
          </h4>
          
          {ancestorsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : commonAncestors.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Common ancestors appear multiple times in {dogName}'s pedigree and contribute significantly to their genetic makeup.
                Higher genetic contribution means a stronger influence on {dogName}'s traits.
              </p>
              
              <div className="overflow-hidden bg-white shadow sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {commonAncestors.map((ancestor) => (
                    <li key={ancestor.dog.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <div className="flex">
                              <p className="font-medium text-blue-600 truncate">
                                {ancestor.dog.name}
                                {ancestor.dog.isChampion && (
                                  <span className="ml-1 text-xs font-semibold text-amber-600">CH</span>
                                )}
                              </p>
                              <p className="ml-2 flex-shrink-0 text-xs text-gray-500">
                                {ancestor.dog.gender === 'male' ? '♂' : '♀'}
                              </p>
                            </div>
                            <div className="mt-1 flex">
                              <p className="text-sm text-gray-700">
                                {ancestor.dog.breedObj?.name || ancestor.dog.breed || 'Unknown Breed'}{' • '}
                                {formatDate(ancestor.dog.dateOfBirth)}
                              </p>
                            </div>
                          </div>
                          <div>
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {(ancestor.geneticContribution as number * 100).toFixed(2)}% Genetic Contribution
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium text-gray-700">Appears {ancestor.occurrences} times</span> in {generations} generations
                          </div>
                          
                          <div className="mt-2 text-sm">
                            <div className="font-medium text-gray-700">Pathways:</div>
                            <ul className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
                              {ancestor.pathways.map((pathway, index) => (
                                <li key={index} className="text-gray-600 text-xs">
                                  {pathway.join(' → ')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No common ancestors found in {generations} generations.</p>
          )}
        </div>
      </div>
    </div>
  );
}
