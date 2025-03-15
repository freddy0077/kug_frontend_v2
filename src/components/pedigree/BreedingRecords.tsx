'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Link from 'next/link';
import { GET_BREEDING_RECORDS } from '@/graphql/queries/pedigreeQueries';
import { BreedingRole } from '@/graphql/queries/pedigreeQueries';

interface BreedingRecordsProps {
  dogId: string;
  initialRole?: BreedingRole;
}

const BreedingRecords: React.FC<BreedingRecordsProps> = ({ 
  dogId, 
  initialRole = BreedingRole.BOTH 
}) => {
  const [role, setRole] = useState<BreedingRole>(initialRole);
  const [page, setPage] = useState(0);
  const limit = 5;

  const { loading, error, data, fetchMore } = useQuery(GET_BREEDING_RECORDS, {
    variables: {
      dogId,
      role,
      offset: 0,
      limit
    },
    fetchPolicy: 'network-only',
  });

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const handleRoleChange = (newRole: BreedingRole) => {
    setRole(newRole);
    setPage(0);
  };

  const loadMore = () => {
    if (!data?.breedingRecords.hasMore) return;
    
    const newOffset = (page + 1) * limit;
    setPage(page + 1);
    
    fetchMore({
      variables: {
        offset: newOffset,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          breedingRecords: {
            ...fetchMoreResult.breedingRecords,
            items: [
              ...prev.breedingRecords.items,
              ...fetchMoreResult.breedingRecords.items
            ],
          },
        };
      },
    });
  };

  if (loading && page === 0) {
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Breeding Records</h2>
        <p className="text-red-500">Error loading breeding records: {error.message}</p>
      </div>
    );
  }

  const records = data?.breedingRecords?.items || [];
  const hasMore = data?.breedingRecords?.hasMore || false;
  const totalCount = data?.breedingRecords?.totalCount || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Breeding Records</h2>
        <Link
          href={`/manage/dogs/${dogId}/breeding/new`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Add Breeding
        </Link>
      </div>
      
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
        <button
          onClick={() => handleRoleChange(BreedingRole.BOTH)}
          className={`flex-1 py-2 text-sm font-medium rounded-md ${
            role === BreedingRole.BOTH
              ? 'bg-white shadow-sm text-gray-800'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleRoleChange(BreedingRole.SIRE)}
          className={`flex-1 py-2 text-sm font-medium rounded-md ${
            role === BreedingRole.SIRE
              ? 'bg-white shadow-sm text-gray-800'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          As Sire
        </button>
        <button
          onClick={() => handleRoleChange(BreedingRole.DAM)}
          className={`flex-1 py-2 text-sm font-medium rounded-md ${
            role === BreedingRole.DAM
              ? 'bg-white shadow-sm text-gray-800'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          As Dam
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No breeding records found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record: any) => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <div className="text-sm text-gray-500">Breeding Date</div>
                  <div className="font-medium">{formatDate(record.breedingDate)}</div>
                </div>
                {record.litterSize && (
                  <div className="mt-2 md:mt-0">
                    <div className="text-sm text-gray-500">Litter Size</div>
                    <div className="font-medium">{record.litterSize} puppies</div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-500">Sire</div>
                  <Link 
                    href={`/manage/dogs/${record.sire.id}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {record.sire.name}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">{record.sire.breed}</div>
                  {record.sire.registrationNumber && (
                    <div className="text-xs text-gray-400">{record.sire.registrationNumber}</div>
                  )}
                </div>
                
                <div className="p-3 bg-pink-50 rounded-lg">
                  <div className="text-sm text-gray-500">Dam</div>
                  <Link 
                    href={`/manage/dogs/${record.dam.id}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {record.dam.name}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">{record.dam.breed}</div>
                  {record.dam.registrationNumber && (
                    <div className="text-xs text-gray-400">{record.dam.registrationNumber}</div>
                  )}
                </div>
              </div>
              
              {record.puppies && record.puppies.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Puppies ({record.puppies.length})</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {record.puppies.map((puppy: any) => (
                      <Link 
                        key={puppy.id}
                        href={`/manage/dogs/${puppy.id}`}
                        className="text-sm p-2 bg-gray-50 rounded hover:bg-gray-100"
                      >
                        {puppy.name} ({puppy.gender})
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {record.comments && (
                <div className="mt-4 text-sm">
                  <div className="text-gray-500">Comments</div>
                  <p className="mt-1">{record.comments}</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Link
                  href={`/manage/dogs/${dogId}/breeding/${record.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Load More
          </button>
        </div>
      )}
      
      {totalCount > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {records.length} of {totalCount} breeding records
        </div>
      )}
    </div>
  );
};

export default BreedingRecords;
