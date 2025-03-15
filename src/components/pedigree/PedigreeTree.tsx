'use client';

import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import Link from 'next/link';
import { GET_DOG_PEDIGREE } from '@/graphql/queries/pedigreeQueries';

interface PedigreeTreeProps {
  dogId: string;
  generations?: number;
}

interface PedigreeNodeData {
  id: string;
  name: string;
  registrationNumber: string;
  breed: string;
  gender: string;
  dateOfBirth: string;
  color?: string;
  titles?: string[];
  mainImageUrl?: string;
  coefficient?: number;
  sire?: PedigreeNodeData;
  dam?: PedigreeNodeData;
}

const PedigreeTree: React.FC<PedigreeTreeProps> = ({ dogId, generations = 3 }) => {
  const { loading, error, data } = useQuery(GET_DOG_PEDIGREE, {
    variables: { dogId, generations },
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pedigree Tree</h2>
        <p className="text-red-500">Error loading pedigree: {error.message}</p>
      </div>
    );
  }

  if (!data?.dogPedigree) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pedigree Tree</h2>
        <p className="text-gray-500">No pedigree information available for this dog.</p>
      </div>
    );
  }

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  // Render a single pedigree node
  const renderNode = (node: PedigreeNodeData | null | undefined) => {
    if (!node) {
      return (
        <div className="p-3 border border-dashed border-gray-300 rounded bg-gray-50">
          <p className="text-gray-400 text-center">No data</p>
        </div>
      );
    }

    return (
      <div className={`p-3 border border-gray-200 rounded ${node.gender === 'male' ? 'bg-blue-50' : 'bg-pink-50'}`}>
        <div className="flex items-center mb-2">
          {node.mainImageUrl && (
            <div className="flex-shrink-0 mr-2">
              <img 
                src={node.mainImageUrl} 
                alt={node.name} 
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          )}
          <Link 
            href={`/manage/dogs/${node.id}`}
            className="text-sm font-medium hover:text-blue-600"
          >
            {node.name}
          </Link>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>{node.breed}</p>
          <p>{node.registrationNumber}</p>
          <p>Born: {formatDate(node.dateOfBirth)}</p>
          {node.coefficient !== undefined && (
            <p className="font-medium">
              COI: {(node.coefficient * 100).toFixed(2)}%
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Pedigree Tree</h2>
      
      <div className="grid grid-cols-7 gap-3">
        {/* First generation - subject dog */}
        <div className="col-span-7 mb-4">
          {renderNode(data.dogPedigree)}
        </div>
        
        {/* Second generation - parents */}
        <div className="col-span-3 col-start-2">
          {renderNode(data.dogPedigree?.sire)}
        </div>
        <div className="col-span-3">
          {renderNode(data.dogPedigree?.dam)}
        </div>
        
        {/* Third generation - grandparents */}
        <div className="col-span-1 col-start-2">
          {renderNode(data.dogPedigree?.sire?.sire)}
        </div>
        <div className="col-span-1">
          {renderNode(data.dogPedigree?.sire?.dam)}
        </div>
        <div className="col-span-1">
          {renderNode(data.dogPedigree?.dam?.sire)}
        </div>
        <div className="col-span-1">
          {renderNode(data.dogPedigree?.dam?.dam)}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Link
          href={`/manage/dogs/${dogId}/pedigree/edit`}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit Pedigree
        </Link>
      </div>
    </div>
  );
};

export default PedigreeTree;
