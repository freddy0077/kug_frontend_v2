'use client';

import { useState, useEffect } from 'react';
import { getOffspring } from '@/utils/lineageUtils';
import { PedigreeNode } from '@/components/pedigree/PedigreeChart';
import { hasPermission } from '@/utils/permissionUtils';
import Link from 'next/link';
import { format } from 'date-fns';

type OffspringManagerProps = {
  dogId: string;
  dogName: string;
  dogGender: 'male' | 'female';
  userRole: string;
  userId: string;
  ownerId: string;
};

export default function OffspringManager({
  dogId,
  dogName,
  dogGender,
  userRole,
  userId,
  ownerId
}: OffspringManagerProps) {
  const [offspring, setOffspring] = useState<PedigreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasViewPermission, setHasViewPermission] = useState(false);
  const [hasManagePermission, setHasManagePermission] = useState(false);

  useEffect(() => {
    // Check if user has permission to view and edit offspring
    const canView = hasPermission(userRole, 'dog', 'view', ownerId, userId);
    const canManage = hasPermission(userRole, 'dog', 'edit', ownerId, userId);
    
    setHasViewPermission(canView);
    setHasManagePermission(canManage);

    if (canView) {
      loadOffspring();
    }
  }, [dogId, userRole, userId, ownerId]);

  const loadOffspring = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const offspringData = await getOffspring(dogId);
      setOffspring(offspringData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading offspring data:', err);
      setError('Failed to load offspring data. Please try again later.');
      setLoading(false);
    }
  };

  // Format date function
  const formatDate = (date?: Date): string => {
    if (!date) return 'Unknown';
    try {
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getParentLabel = () => {
    return dogGender === 'male' ? 'Sire' : 'Dam';
  };

  if (!hasViewPermission) {
    return (
      <div className="bg-red-50 border border-red-300 p-4 rounded-md">
        <p className="text-red-700">
          You do not have permission to view offspring information for this dog.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Offspring
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {dogName}'s offspring and breeding records
          </p>
        </div>
        {hasManagePermission && (
          <div>
            <Link
              href={`/manage/dogs/${dogId}/breeding/add`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Record New Breeding
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-300 p-4 m-4 rounded-md">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadOffspring}
              className="mt-2 px-3 py-1 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Retry
            </button>
          </div>
        ) : offspring.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breed
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dogGender === 'male' ? 'Dam' : 'Sire'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offspring.map((puppy) => (
                  <tr key={puppy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        <Link href={`/manage/dogs/${puppy.id}`}>
                          {puppy.name}
                          {puppy.isChampion && (
                            <span className="ml-1 text-xs font-semibold text-amber-600">CH</span>
                          )}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{puppy.breedName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{puppy.color || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {puppy.gender === 'male' ? '♂ Male' : '♀ Female'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(puppy.dateOfBirth)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {/* This would be fetched from the API in a real app */}
                        {dogGender === 'male' ? 'Bella' : 'Maximus'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/manage/dogs/${puppy.id}/pedigree`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Pedigree
                      </Link>
                      {hasManagePermission && (
                        <Link
                          href={`/manage/dogs/${puppy.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No offspring records found for {dogName}.</p>
            {hasManagePermission && dogGender === 'female' && (
              <p className="mt-2 text-sm text-gray-600">
                You can add litter information by clicking "Record New Breeding" above.
              </p>
            )}
            {hasManagePermission && dogGender === 'male' && (
              <p className="mt-2 text-sm text-gray-600">
                You can record breeding information by clicking "Record New Breeding" above.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
