'use client';

import React, { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { hasPermission, UserRole } from '@/utils/permissionUtils';

// Types for pedigree data
export type PedigreeNode = {
  id: string;
  name: string;
  gender: string;
  breed?: string;
  breedObj?: {
    id?: string;
    name: string;
    group?: string;
    origin?: string;
  };
  registrationNumber?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  isChampion?: boolean;
  color?: string;
  healthTested?: boolean;
  ownerId?: string;
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
};

type PedigreeData = {
  dog: PedigreeNode;
  parents: {
    sire?: PedigreeNode;
    dam?: PedigreeNode;
  };
  grandparents: {
    paternalGrandsire?: PedigreeNode;
    paternalGranddam?: PedigreeNode;
    maternalGrandsire?: PedigreeNode;
    maternalGranddam?: PedigreeNode;
  };
  greatGrandparents?: {
    paternalPaternalGreatGrandsire?: PedigreeNode;
    paternalPaternalGreatGranddam?: PedigreeNode;
    paternalMaternalGreatGrandsire?: PedigreeNode;
    paternalMaternalGreatGranddam?: PedigreeNode;
    maternalPaternalGreatGrandsire?: PedigreeNode;
    maternalPaternalGreatGranddam?: PedigreeNode;
    maternalMaternalGreatGrandsire?: PedigreeNode;
    maternalMaternalGreatGranddam?: PedigreeNode;
  };
};

type PedigreeChartProps = {
  dogId: string;
  generations?: number; // Number of generations to display (1-3)
  orientation?: 'horizontal' | 'vertical';
  userRole: UserRole;
  userId: string;
  onEditParents?: (dog: PedigreeNode) => void;
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function PedigreeChart({
  dogId,
  generations = 4,
  orientation = 'horizontal',
  userRole,
  userId,
  onEditParents
}: PedigreeChartProps) {
  const [pedigreeData, setPedigreeData] = useState<PedigreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coefficientOfInbreeding, setCoefficientOfInbreeding] = useState<number | null>(null);
  
  // Define the GraphQL query
  const GET_DOG_PEDIGREE = gql`
    query GetDogPedigree($dogId: ID!, $generations: Int!) {
      dogPedigree(dogId: $dogId, generations: $generations) {
        id
        name
        breed
        breedObj {
          id
          name
          group
          origin
        }
        gender
        registrationNumber
        dateOfBirth
        color
        mainImageUrl
        titles
        coefficient
        sire {
          id
          name
          breed
          breedObj {
            id
            name
            group
            origin
          }
          gender
          registrationNumber
          dateOfBirth
          color
          mainImageUrl
          sire { 
            id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl 
            sire { id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl }
            dam { id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl }
          }
          dam { 
            id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl 
            sire { id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl }
            dam { id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl }
          }
        }
        dam {
          id
          name
          breed
          breedObj {
            id
            name
            group
            origin
          }
          gender
          registrationNumber
          dateOfBirth
          color
          mainImageUrl
          sire { 
            id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl 
            sire { id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl }
            dam { id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl }
          }
          dam { 
            id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl 
            sire { id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl }
            dam { id name breed breedObj { id name } gender registrationNumber dateOfBirth color mainImageUrl }
          }
        }
      }
    }
  `;

  // Use Apollo useQuery hook to fetch data
  const { loading: queryLoading, error: queryError, data: queryData } = useQuery(GET_DOG_PEDIGREE, {
    variables: { dogId, generations },
    skip: !dogId, // Skip the query if dogId is not provided
    fetchPolicy: 'network-only' // Don't use cache
  });

  // Process query results when they change
  useEffect(() => {
    setLoading(queryLoading);
    
    if (queryError) {
      setError(queryError.message);
      return;
    }
    
    if (!queryLoading && queryData) {
      try {
        // Check if dogPedigree exists in the response
        if (!queryData.dogPedigree) {
          throw new Error('No pedigree data found in the API response');
        }

        // Transform the GraphQL response into PedigreeData structure
        // Use optional chaining and ensure pedigree is an object
        const pedigree = queryData.dogPedigree;
        
        // Ensure we have a valid pedigree object
        if (!pedigree || typeof pedigree !== 'object') {
          throw new Error('Invalid pedigree data structure received');
        }
        
        // Additional defensive check to ensure we have an id before continuing
        if (pedigree.id === undefined || pedigree.id === null) {
          throw new Error('Pedigree data is missing required id field');
        }
        
        const transformedData: PedigreeData = {
          dog: {
            // Ensure id is always defined, even if as empty string
            id: pedigree?.id || '',
            name: pedigree.name || 'Unknown',
            gender: pedigree.gender || '',
            breed: pedigree.breed || '',
            breedObj: pedigree.breedObj || undefined,
            registrationNumber: pedigree.registrationNumber || '',
            dateOfBirth: pedigree.dateOfBirth || undefined,
            // Fields not in PedigreeNode type are set with defaults
            dateOfDeath: undefined,
            color: pedigree.color || '',
            isChampion: false, // Default since not in schema
            healthTested: false, // Default since not in schema
            ownerId: ''
          },
          parents: {
            sire: pedigree.sire ? {
              id: pedigree.sire?.id || '',
              name: pedigree.sire?.name || 'Unknown',
              gender: pedigree.sire?.gender || '',
              breed: pedigree.sire?.breed || '',
              breedObj: pedigree.sire?.breedObj || undefined,
              registrationNumber: pedigree.sire?.registrationNumber || '',
              dateOfBirth: pedigree.sire?.dateOfBirth || undefined
            } : undefined,
            dam: pedigree.dam ? {
              id: pedigree.dam?.id || '',
              name: pedigree.dam?.name || 'Unknown',
              gender: pedigree.dam?.gender || '',
              breed: pedigree.dam?.breed || '',
              breedObj: pedigree.dam?.breedObj || undefined,
              registrationNumber: pedigree.dam?.registrationNumber || '',
              dateOfBirth: pedigree.dam?.dateOfBirth || undefined
            } : undefined
          },
          grandparents: {
            paternalGrandsire: pedigree.sire?.sire ? {
              id: pedigree.sire.sire?.id || '',
              name: pedigree.sire.sire?.name || 'Unknown',
              gender: pedigree.sire.sire?.gender || '',
              breed: pedigree.sire.sire?.breed || '',
              breedObj: pedigree.sire.sire?.breedObj || undefined,
              registrationNumber: pedigree.sire.sire?.registrationNumber || '',
              dateOfBirth: pedigree.sire.sire?.dateOfBirth || undefined,
              color: pedigree.sire.sire?.color || ''
            } : undefined,
            paternalGranddam: pedigree.sire?.dam ? {
              id: pedigree.sire.dam?.id || '',
              name: pedigree.sire.dam?.name || 'Unknown',
              gender: pedigree.sire.dam?.gender || '',
              breed: pedigree.sire.dam?.breed || '',
              breedObj: pedigree.sire.dam?.breedObj || undefined,
              registrationNumber: pedigree.sire.dam?.registrationNumber || '',
              dateOfBirth: pedigree.sire.dam?.dateOfBirth || undefined,
              color: pedigree.sire.dam?.color || ''
            } : undefined,
            maternalGrandsire: pedigree.dam?.sire ? {
              id: pedigree.dam.sire?.id || '',
              name: pedigree.dam.sire?.name || 'Unknown',
              gender: pedigree.dam.sire?.gender || '',
              breed: pedigree.dam.sire?.breed || '',
              breedObj: pedigree.dam.sire?.breedObj || undefined,
              registrationNumber: pedigree.dam.sire?.registrationNumber || '',
              dateOfBirth: pedigree.dam.sire?.dateOfBirth || undefined,
              color: pedigree.dam.sire?.color || ''
            } : undefined,
            maternalGranddam: pedigree.dam?.dam ? {
              id: pedigree.dam.dam?.id || '',
              name: pedigree.dam.dam?.name || 'Unknown',
              gender: pedigree.dam.dam?.gender || '',
              breed: pedigree.dam.dam?.breed || '',
              breedObj: pedigree.dam.dam?.breedObj || undefined,
              registrationNumber: pedigree.dam.dam?.registrationNumber || '',
              dateOfBirth: pedigree.dam.dam?.dateOfBirth || undefined,
              color: pedigree.dam.dam?.color || ''
            } : undefined
          },
          greatGrandparents: {
            // Paternal great-grandparents (sire's parents)
            paternalPaternalGreatGrandsire: pedigree.sire?.sire?.sire ? {
              id: pedigree.sire.sire.sire?.id || '',
              name: pedigree.sire.sire.sire?.name || 'Unknown',
              gender: pedigree.sire.sire.sire?.gender || '',
              breed: pedigree.sire.sire.sire?.breed || '',
              breedObj: pedigree.sire.sire.sire?.breedObj || undefined,
              registrationNumber: pedigree.sire.sire.sire?.registrationNumber || '',
              dateOfBirth: pedigree.sire.sire.sire?.dateOfBirth || undefined,
              color: pedigree.sire.sire.sire?.color || ''
            } : undefined,
            paternalPaternalGreatGranddam: pedigree.sire?.sire?.dam ? {
              id: pedigree.sire.sire.dam?.id || '',
              name: pedigree.sire.sire.dam?.name || 'Unknown',
              gender: pedigree.sire.sire.dam?.gender || '',
              breed: pedigree.sire.sire.dam?.breed || '',
              breedObj: pedigree.sire.sire.dam?.breedObj || undefined,
              registrationNumber: pedigree.sire.sire.dam?.registrationNumber || '',
              dateOfBirth: pedigree.sire.sire.dam?.dateOfBirth || undefined,
              color: pedigree.sire.sire.dam?.color || ''
            } : undefined,
            
            // Paternal great-grandparents (dam's parents)
            paternalMaternalGreatGrandsire: pedigree.sire?.dam?.sire ? {
              id: pedigree.sire.dam.sire?.id || '',
              name: pedigree.sire.dam.sire?.name || 'Unknown',
              gender: pedigree.sire.dam.sire?.gender || '',
              breed: pedigree.sire.dam.sire?.breed || '',
              breedObj: pedigree.sire.dam.sire?.breedObj || undefined,
              registrationNumber: pedigree.sire.dam.sire?.registrationNumber || '',
              dateOfBirth: pedigree.sire.dam.sire?.dateOfBirth || undefined,
              color: pedigree.sire.dam.sire?.color || ''
            } : undefined,
            paternalMaternalGreatGranddam: pedigree.sire?.dam?.dam ? {
              id: pedigree.sire.dam.dam?.id || '',
              name: pedigree.sire.dam.dam?.name || 'Unknown',
              gender: pedigree.sire.dam.dam?.gender || '',
              breed: pedigree.sire.dam.dam?.breed || '',
              breedObj: pedigree.sire.dam.dam?.breedObj || undefined,
              registrationNumber: pedigree.sire.dam.dam?.registrationNumber || '',
              dateOfBirth: pedigree.sire.dam.dam?.dateOfBirth || undefined,
              color: pedigree.sire.dam.dam?.color || ''
            } : undefined,
            
            // Maternal great-grandparents (sire's parents)
            maternalPaternalGreatGrandsire: pedigree.dam?.sire?.sire ? {
              id: pedigree.dam.sire.sire?.id || '',
              name: pedigree.dam.sire.sire?.name || 'Unknown',
              gender: pedigree.dam.sire.sire?.gender || '',
              breed: pedigree.dam.sire.sire?.breed || '',
              breedObj: pedigree.dam.sire.sire?.breedObj || undefined,
              registrationNumber: pedigree.dam.sire.sire?.registrationNumber || '',
              dateOfBirth: pedigree.dam.sire.sire?.dateOfBirth || undefined,
              color: pedigree.dam.sire.sire?.color || ''
            } : undefined,
            maternalPaternalGreatGranddam: pedigree.dam?.sire?.dam ? {
              id: pedigree.dam.sire.dam?.id || '',
              name: pedigree.dam.sire.dam?.name || 'Unknown',
              gender: pedigree.dam.sire.dam?.gender || '',
              breed: pedigree.dam.sire.dam?.breed || '',
              breedObj: pedigree.dam.sire.dam?.breedObj || undefined,
              registrationNumber: pedigree.dam.sire.dam?.registrationNumber || '',
              dateOfBirth: pedigree.dam.sire.dam?.dateOfBirth || undefined,
              color: pedigree.dam.sire.dam?.color || ''
            } : undefined,
            
            // Maternal great-grandparents (dam's parents)
            maternalMaternalGreatGrandsire: pedigree.dam?.dam?.sire ? {
              id: pedigree.dam.dam?.sire?.id || '',
              name: pedigree.dam.dam?.sire?.name || 'Unknown',
              gender: pedigree.dam.dam?.sire?.gender || '',
              breed: pedigree.dam.dam?.sire?.breed || '',
              breedObj: pedigree.dam.dam?.sire?.breedObj || undefined,
              registrationNumber: pedigree.dam.dam?.sire?.registrationNumber || '',
              dateOfBirth: pedigree.dam.dam?.sire?.dateOfBirth || undefined,
              color: pedigree.dam.dam?.sire?.color || ''
            } : undefined,
            maternalMaternalGreatGranddam: pedigree.dam?.dam?.dam ? {
              id: pedigree.dam.dam?.dam?.id || '',
              name: pedigree.dam.dam?.dam?.name || 'Unknown',
              gender: pedigree.dam.dam?.dam?.gender || '',
              breed: pedigree.dam.dam?.dam?.breed || '',
              breedObj: pedigree.dam.dam?.dam?.breedObj || undefined,
              registrationNumber: pedigree.dam.dam?.dam?.registrationNumber || '',
              dateOfBirth: pedigree.dam.dam?.dam?.dateOfBirth || undefined,
              color: pedigree.dam.dam?.dam?.color || ''
            } : undefined
          }
        };

        setPedigreeData(transformedData);
        
        // Calculate coefficient of inbreeding
        const coi = calculateCoefficientOfInbreeding(transformedData);
        setCoefficientOfInbreeding(coi);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pedigree data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Apollo client will automatically handle fetching when dogId changes
  }, [queryLoading, queryError, queryData]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !pedigreeData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error || 'Pedigree data not available'}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Pedigree Chart
        </h3>
        {coefficientOfInbreeding !== null && (
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Coefficient of Inbreeding: {(coefficientOfInbreeding * 100).toFixed(2)}%
          </p>
        )}
      </div>
      
      <div className={`px-4 py-5 sm:p-6 ${orientation === 'vertical' ? 'pedigree-vertical' : 'pedigree-horizontal'}`}>
        <div className="pedigree-container">
          {pedigreeData && pedigreeData.dog && pedigreeData.dog.id 
            ? renderPedigreeChart(pedigreeData, generations, orientation, userRole, userId, onEditParents)
            : <div className="text-amber-500 p-4 text-center">Invalid or incomplete pedigree data structure</div>}
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="flex items-center">
            <span className="h-3 w-3 bg-blue-500 rounded-full mr-1"></span>
            <span>Male</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 bg-pink-500 rounded-full mr-1"></span>
            <span>Female</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 border-2 border-yellow-500 rounded-full mr-1"></span>
            <span>Champion</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 border-2 border-green-500 rounded-full mr-1"></span>
            <span>Health Tested</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .pedigree-container {
          display: flex;
          ${orientation === 'vertical' 
            ? 'flex-direction: column; align-items: center;' 
            : 'flex-direction: row; justify-content: space-between;'
          }
          overflow-x: auto;
          min-height: ${orientation === 'vertical' ? '800px' : '400px'};
          min-width: ${orientation === 'horizontal' ? '800px' : '400px'};
        }
        
        .pedigree-horizontal {
          overflow-x: auto;
        }
        
        .pedigree-vertical {
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

// Helper function to render the pedigree chart
function renderPedigreeChart(
  data: PedigreeData, 
  generations: number,
  orientation: 'horizontal' | 'vertical',
  userRole: UserRole,
  userId: string,
  onEditParents?: (dog: PedigreeNode) => void
) {
  if (orientation === 'vertical') {
    return renderVerticalPedigree(data, generations, userRole, userId, onEditParents);
  }
  
  return renderHorizontalPedigree(data, generations, userRole, userId, onEditParents);
}

// Render horizontal pedigree chart
function renderHorizontalPedigree(
  data: PedigreeData, 
  generations: number,
  userRole: UserRole,
  userId: string,
  onEditParents?: (dog: PedigreeNode) => void
) {
  return (
    <div className="flex flex-nowrap items-center">
      {/* Dog */}
      <div className="pedigree-column">
        {renderDogCard(data.dog, 'primary', userRole, userId, onEditParents)}
      </div>
      
      {/* Parents */}
      {generations >= 2 && (
        <div className="pedigree-column">
          <div className="pedigree-cell">
            {renderDogCard(data.parents?.sire, 'male', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.parents?.dam, 'female', userRole, userId, onEditParents)}
          </div>
        </div>
      )}
      
      {/* Grandparents */}
      {generations >= 3 && (
        <div className="pedigree-column">
          <div className="pedigree-cell">
            {renderDogCard(data.grandparents?.paternalGrandsire, 'male', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.grandparents?.paternalGranddam, 'female', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.grandparents?.maternalGrandsire, 'male', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.grandparents?.maternalGranddam, 'female', userRole, userId, onEditParents)}
          </div>
        </div>
      )}
      
      {/* Great Grandparents */}
      {generations >= 4 && (
        <div className="pedigree-column">
          <div className="pedigree-cell">
            {renderDogCard(data.greatGrandparents?.paternalPaternalGreatGrandsire, 'male', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.greatGrandparents?.paternalPaternalGreatGranddam, 'female', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.greatGrandparents?.paternalMaternalGreatGrandsire, 'male', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.greatGrandparents?.paternalMaternalGreatGranddam, 'female', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.greatGrandparents?.maternalPaternalGreatGrandsire, 'male', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.greatGrandparents?.maternalPaternalGreatGranddam, 'female', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.greatGrandparents?.maternalMaternalGreatGrandsire, 'male', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {renderDogCard(data.greatGrandparents?.maternalMaternalGreatGranddam, 'female', userRole, userId, onEditParents)}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .pedigree-column {
          display: flex;
          flex-direction: column;
          min-width: 220px;
          margin-right: 20px;
        }
        
        .pedigree-cell {
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
}

// Render vertical pedigree chart
function renderVerticalPedigree(
  data: PedigreeData, 
  generations: number,
  userRole: UserRole,
  userId: string,
  onEditParents?: (dog: PedigreeNode) => void
) {
  return (
    <div className="flex flex-col items-center">
      {/* Dog */}
      <div className="pedigree-row">
        {renderDogCard(data.dog, 'primary', userRole, userId, onEditParents)}
      </div>
      
      {/* Parents */}
      {generations >= 2 && data.parents && (
        <div className="pedigree-row">
          <div className="pedigree-cell">
            {data.parents.sire && renderDogCard(data.parents.sire, 'male', userRole, userId, onEditParents)}
          </div>
          <div className="pedigree-cell">
            {data.parents.dam && renderDogCard(data.parents.dam, 'female', userRole, userId, onEditParents)}
          </div>
        </div>
      )}
      
      {/* Grandparents */}
      {generations >= 3 && data.grandparents && (
        <div className="pedigree-row">
          <div className="pedigree-cell">
            {data.grandparents.paternalGrandsire && renderDogCard(data.grandparents.paternalGrandsire, 'male', userRole, userId)}
          </div>
          <div className="pedigree-cell">
            {data.grandparents.paternalGranddam && renderDogCard(data.grandparents.paternalGranddam, 'female', userRole, userId)}
          </div>
          <div className="pedigree-cell">
            {data.grandparents.maternalGrandsire && renderDogCard(data.grandparents.maternalGrandsire, 'male', userRole, userId)}
          </div>
          <div className="pedigree-cell">
            {data.grandparents.maternalGranddam && renderDogCard(data.grandparents.maternalGranddam, 'female', userRole, userId)}
          </div>
        </div>
      )}
      
      {/* Great Grandparents */}
      {generations >= 4 && data.greatGrandparents && (
        <div className="pedigree-row">
          <div className="pedigree-cell">
            {data.greatGrandparents.paternalPaternalGreatGrandsire && renderDogCard(data.greatGrandparents.paternalPaternalGreatGrandsire, 'male', userRole, userId)}
          </div>
          <div className="pedigree-cell">
            {data.greatGrandparents.paternalPaternalGreatGranddam && renderDogCard(data.greatGrandparents.paternalPaternalGreatGranddam, 'female', userRole, userId)}
          </div>
          <div className="pedigree-cell">
            {data.greatGrandparents.paternalMaternalGreatGrandsire && renderDogCard(data.greatGrandparents.paternalMaternalGreatGrandsire, 'male', userRole, userId)}
          </div>
          <div className="pedigree-cell">
            {data.greatGrandparents.paternalMaternalGreatGranddam && renderDogCard(data.greatGrandparents.paternalMaternalGreatGranddam, 'female', userRole, userId)}
          </div>
          <div className="pedigree-cell">
            {data.greatGrandparents.maternalPaternalGreatGrandsire && renderDogCard(data.greatGrandparents.maternalPaternalGreatGrandsire, 'male', userRole, userId)}
          </div>
          <div className="pedigree-cell">
            {data.greatGrandparents.maternalPaternalGreatGranddam && renderDogCard(data.greatGrandparents.maternalPaternalGreatGranddam, 'female', userRole, userId)}
          </div>
          <div className="pedigree-cell">
            {data.greatGrandparents.maternalMaternalGreatGrandsire && renderDogCard(data.greatGrandparents.maternalMaternalGreatGrandsire, 'male', userRole, userId)}
          </div>
          <div className="pedigree-cell">
            {data.greatGrandparents.maternalMaternalGreatGranddam && renderDogCard(data.greatGrandparents.maternalMaternalGreatGranddam, 'female', userRole, userId)}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .pedigree-row {
          display: flex;
          flex-direction: row;
          margin-bottom: 20px;
        }
        
        .pedigree-cell {
          margin: 0 5px;
        }
      `}</style>
    </div>
  );
}

// Render individual dog card in the pedigree
function renderDogCard(
  dog: PedigreeNode | undefined | null, 
  type: 'primary' | 'male' | 'female',
  userRole: UserRole,
  userId: string,
  onEditParents?: (dog: PedigreeNode) => void
) {
  if (!dog) {
    return (
      <div className="border rounded-md p-3 bg-gray-50 border-gray-200">
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  // const canViewDetails = hasPermission(userRole, 'dog', 'view', dog.ownerId || '', userId);
  const canViewDetails = true;
  const cardClasses = `
    border rounded-md p-3 ${type === 'primary' 
      ? 'border-blue-500 bg-blue-50' 
      : type === 'male' 
        ? 'border-blue-300 bg-blue-50' 
        : 'border-pink-300 bg-pink-50'
    }
    ${dog.isChampion ? 'ring-2 ring-yellow-500' : ''}
    ${dog.healthTested ? 'ring-1 ring-green-500' : ''}
  `.trim();
  
  return (
    <div className={cardClasses}>
      <h3 className="font-medium text-gray-900 truncate">{dog.name || 'Unknown'}</h3>
      
      {canViewDetails ? (
        <>
          <p className="text-sm text-gray-500">{dog.breedObj?.name || dog.breed || 'Unknown breed'}</p>
          {dog.registrationNumber && (
            <p className="text-xs text-gray-500">Reg: {dog.registrationNumber}</p>
          )}
          {dog.dateOfBirth && (
            <p className="text-xs text-gray-500">
              Born: {formatDate(dog.dateOfBirth)}
              {dog.dateOfDeath && ` - Died: ${formatDate(dog.dateOfDeath)}`}
            </p>
          )}
          
          {/* Edit Parents Button */}
          {onEditParents && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEditParents(dog);
              }}
              className="mt-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded flex items-center"
              title="Edit parents for this dog"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Parents
            </button>
          )}
        </>
      ) : (
        <p className="text-sm italic text-gray-400">Details restricted</p>
      )}
    </div>
  );
}

// Mock data function - in a real app this would fetch from an API
async function getMockPedigreeData(dogId: string, generations: number): Promise<PedigreeData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const pedigreeData: PedigreeData = {
    dog: {
      id: dogId,
      name: 'Champion Rocky',
      gender: 'male',
      breed: 'Labrador Retriever',
      registrationNumber: 'AKC123456',
      dateOfBirth: '2020-05-15',
      isChampion: true,
      healthTested: true,
      color: 'Black',
      ownerId: 'user123'
    },
    parents: {
      sire: {
        id: 'sire1',
        name: 'Champion Max',
        gender: 'male',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC654321',
        dateOfBirth: '2018-03-10',
        isChampion: true,
        healthTested: true,
        color: 'Black',
        ownerId: 'user456'
      },
      dam: {
        id: 'dam1',
        name: 'Luna',
        gender: 'female',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC789012',
        dateOfBirth: '2018-07-22',
        isChampion: false,
        healthTested: true,
        color: 'Yellow',
        ownerId: 'user789'
      }
    },
    grandparents: {
      paternalGrandsire: {
        id: 'pgrandsire1',
        name: 'Champion Duke',
        gender: 'male',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC111222',
        dateOfBirth: '2016-01-15',
        isChampion: true,
        healthTested: true,
        color: 'Black',
        ownerId: 'user101'
      },
      paternalGranddam: {
        id: 'pgranddam1',
        name: 'Belle',
        gender: 'female',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC333444',
        dateOfBirth: '2016-06-30',
        isChampion: false,
        healthTested: true,
        color: 'Black',
        ownerId: 'user102'
      },
      maternalGrandsire: {
        id: 'mgrandsire1',
        name: 'Charlie',
        gender: 'male',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC555666',
        dateOfBirth: '2016-04-12',
        isChampion: false,
        healthTested: true,
        color: 'Yellow',
        ownerId: 'user103'
      },
      maternalGranddam: {
        id: 'mgranddam1',
        name: 'Champion Daisy',
        gender: 'female',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC777888',
        dateOfBirth: '2016-09-05',
        isChampion: true,
        healthTested: true,
        color: 'Yellow',
        ownerId: 'user104'
      }
    }
  };
  
  if (generations >= 4) {
    (pedigreeData as any).greatGrandparents = {
      paternalPaternalGreatGrandsire: {
        id: 'ppggs1',
        name: 'Great Duke',
        gender: 'male',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC999111',
        dateOfBirth: '2014-03-15',
        isChampion: false,
        healthTested: true,
        color: 'Black',
        ownerId: 'user201'
      },
      paternalPaternalGreatGranddam: {
        id: 'ppggd1',
        name: 'Great Belle',
        gender: 'female',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC999222',
        dateOfBirth: '2014-07-30',
        isChampion: false,
        healthTested: true,
        color: 'Black',
        ownerId: 'user202'
      },
      paternalMaternalGreatGrandsire: {
        id: 'pmggs1',
        name: 'Great Charlie',
        gender: 'male',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC999333',
        dateOfBirth: '2014-05-12',
        isChampion: true,
        healthTested: true,
        color: 'Yellow',
        ownerId: 'user203'
      },
      paternalMaternalGreatGranddam: {
        id: 'pmggd1',
        name: 'Great Daisy',
        gender: 'female',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC999444',
        dateOfBirth: '2014-09-05',
        isChampion: false,
        healthTested: true,
        color: 'Yellow',
        ownerId: 'user204'
      },
      maternalPaternalGreatGrandsire: {
        id: 'mpggs1',
        name: 'Great Rocky',
        gender: 'male',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC999555',
        dateOfBirth: '2014-01-20',
        isChampion: true,
        healthTested: true,
        color: 'Black',
        ownerId: 'user205'
      },
      maternalPaternalGreatGranddam: {
        id: 'mpggd1',
        name: 'Great Luna',
        gender: 'female',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC999666',
        dateOfBirth: '2014-04-25',
        isChampion: false,
        healthTested: true,
        color: 'Yellow',
        ownerId: 'user206'
      },
      maternalMaternalGreatGrandsire: {
        id: 'mmggs1',
        name: 'Great Max',
        gender: 'male',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC999777',
        dateOfBirth: '2014-08-15',
        isChampion: true,
        healthTested: true,
        color: 'Black',
        ownerId: 'user207'
      },
      maternalMaternalGreatGranddam: {
        id: 'mmggd1',
        name: 'Great Bella',
        gender: 'female',
        breed: 'Labrador Retriever',
        registrationNumber: 'AKC999888',
        dateOfBirth: '2014-11-30',
        isChampion: false,
        healthTested: true,
        color: 'Black',
        ownerId: 'user208'
      }
    };
  }
  
  return pedigreeData;
}

// Calculate coefficient of inbreeding
function calculateCoefficientOfInbreeding(pedigreeData: PedigreeData): number {
  // In a real application, this would use a proper algorithm to calculate
  // the coefficient of inbreeding based on common ancestors
  
  // For now, we'll return a mock value
  return 0.0625; // This represents 6.25% inbreeding
}

// Format date as a readable string consistently across the application
function formatDate(dateStr: string | Date | undefined | null): string {
  // Handle null, undefined, or empty string cases
  if (!dateStr) return 'Unknown';
  
  try {
    // If already a Date object, use it directly
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format received: ${dateStr}`);
      return typeof dateStr === 'string' ? dateStr : 'Invalid date';
    }
    
    // Format the date consistently
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (err) {
    console.warn(`Error formatting date: ${dateStr}`, err);
    return typeof dateStr === 'string' ? dateStr : 'Invalid date';
  }
}
