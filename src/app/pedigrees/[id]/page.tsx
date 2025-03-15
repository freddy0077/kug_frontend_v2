'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ModernPedigreeChart from '@/components/pedigree/ModernPedigreeChart';
import { DogPedigreeData } from '@/types/pedigree';
import toast from 'react-hot-toast';
import { getPedigreeData } from '@/services/pedigreeService';

export default function PedigreePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const [pedigreeData, setPedigreeData] = useState<DogPedigreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedigreeData = async () => {
      try {
        setLoading(true);
        const data = await getPedigreeData(id);
        
        // Ensure dateOfBirth is always a Date object
        if (data) {
          if (data.dateOfBirth && !(data.dateOfBirth instanceof Date)) {
            data.dateOfBirth = new Date(data.dateOfBirth);
          }
          
          // Process dates for the dog
          const processNodeDates = (node: any) => {
            if (!node) return;
            if (node.dateOfBirth && !(node.dateOfBirth instanceof Date)) {
              node.dateOfBirth = new Date(node.dateOfBirth);
            }
            if (node.dateOfDeath && !(node.dateOfDeath instanceof Date)) {
              node.dateOfDeath = new Date(node.dateOfDeath);
            }
          };
          
          // Process the main dog's dates
          processNodeDates(data);
        }
        
        setPedigreeData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching pedigree data:', err);
        setError('Failed to load pedigree data. Please try again later.');
        toast.error('Failed to load pedigree data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPedigreeData();
    }
  }, [id]);

  const handleAddParent = async (dogId: string, parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => {
    try {
      // In a real app, you would call an API to add the parent
      // For now, we'll update the local state to simulate the API call
      
      if (!pedigreeData) return;
      
      // Ensure gender is set appropriately based on parentType
      parentData.gender = parentType === 'sire' ? 'male' : 'female';
      
      // Ensure dateOfBirth is a Date
      if (parentData.dateOfBirth && !(parentData.dateOfBirth instanceof Date)) {
        parentData.dateOfBirth = new Date(parentData.dateOfBirth);
      }
      
      const updatedPedigreeData = {...pedigreeData};
      
      if (parentType === 'sire') {
        updatedPedigreeData.sireId = parentData.id || '';
        updatedPedigreeData.sireName = parentData.name || '';
        updatedPedigreeData.sireRegistration = parentData.registrationNumber || '';
      } else {
        updatedPedigreeData.damId = parentData.id || '';
        updatedPedigreeData.damName = parentData.name || '';
        updatedPedigreeData.damRegistration = parentData.registrationNumber || '';
      }
      
      setPedigreeData(updatedPedigreeData);
      toast.success(`Added ${parentType} successfully`);
    } catch (err) {
      console.error(`Error adding ${parentType}:`, err);
      toast.error(`Failed to add ${parentType}`);
    }
  };

  const handleEditParent = async (dogId: string, parentType: 'sire' | 'dam', parentData: Partial<DogPedigreeData>) => {
    try {
      // In a real app, you would call an API to update the parent
      // For now, we'll update the local state to simulate the API call
      
      if (!pedigreeData) return;
      
      // Ensure gender is set appropriately based on parentType
      parentData.gender = parentType === 'sire' ? 'male' : 'female';
      
      // Ensure dateOfBirth is a Date
      if (parentData.dateOfBirth && !(parentData.dateOfBirth instanceof Date)) {
        parentData.dateOfBirth = new Date(parentData.dateOfBirth);
      }
      
      const updatedPedigreeData = {...pedigreeData};
      
      if (parentType === 'sire') {
        updatedPedigreeData.sireId = parentData.id || updatedPedigreeData.sireId || '';
        updatedPedigreeData.sireName = parentData.name || updatedPedigreeData.sireName || '';
        updatedPedigreeData.sireRegistration = parentData.registrationNumber || updatedPedigreeData.sireRegistration || '';
      } else {
        updatedPedigreeData.damId = parentData.id || updatedPedigreeData.damId || '';
        updatedPedigreeData.damName = parentData.name || updatedPedigreeData.damName || '';
        updatedPedigreeData.damRegistration = parentData.registrationNumber || updatedPedigreeData.damRegistration || '';
      }
      
      setPedigreeData(updatedPedigreeData);
      toast.success(`Updated ${parentType} successfully`);
    } catch (err) {
      console.error(`Error updating ${parentType}:`, err);
      toast.error(`Failed to update ${parentType}`);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {pedigreeData ? `${pedigreeData.name}'s Pedigree` : 'Pedigree Details'}
        </h1>
        {pedigreeData && (
          <p className="text-gray-600">
            {pedigreeData.breedName} · {pedigreeData.registrationNumber}
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : pedigreeData ? (
        <div className="bg-white shadow-md rounded-lg p-6 overflow-x-auto">
          <ModernPedigreeChart 
            dogId={id} 
            initialOptions={{
              theme: 'modern',
              showChampions: true,
              showHealthTests: true,
              showDates: true,
              showOwners: true,
              generations: 4,
              orientation: 'horizontal'
            }}
            readOnly={false}
          />
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
          <p className="text-yellow-600">No pedigree data available for this dog.</p>
        </div>
      )}
    </div>
  );
}
