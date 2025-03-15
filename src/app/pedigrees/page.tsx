'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_DOG_PEDIGREE, GET_DOGS } from '@/graphql/queries/dogQueries';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import PedigreeChart from '@/components/pedigree/PedigreeChart';
import ParentEditor from '@/components/pedigrees/ParentEditor';
import { DogNode, extractFourthGeneration, formatDate, calculatePedigreeCompleteness } from '@/utils/pedigreeFormatters';
import { toast } from 'react-hot-toast';
import { downloadPedigreeCertificate } from '@/utils/pedigreePdfGenerator';

interface DogListItem {
  id: string;
  name: string;
  breed: string;
  registrationNumber?: string;
}

interface PedigreeData {
  dogPedigree: DogNode;
}

interface DogsData {
  dogs: {
    totalCount: number;
    hasMore: boolean;
    items: DogListItem[];
  };
}

export default function Pedigrees() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [availableDogs, setAvailableDogs] = useState<DogListItem[]>([]);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(null);
  const [generationsToShow, setGenerationsToShow] = useState<number>(3);
  const [editingParentsForDog, setEditingParentsForDog] = useState<{id: string, name: string, sire?: DogNode | null, dam?: DogNode | null} | null>(null);
  const [parentEditorMode, setParentEditorMode] = useState<'edit' | 'add'>('edit');

  // Use debounce to prevent excessive API calls while typing
  const debouncedSearchTerm = useDebounce(searchQuery, 300);
  
  // Use Apollo Client to fetch dogs based on search term
  const { data: dogsData, loading: dogsLoading, error: dogsError } = useQuery<DogsData>(GET_DOGS, {
    variables: {
      searchTerm: debouncedSearchTerm,
      limit: 20,
      offset: 0,
    },
    fetchPolicy: 'network-only',
    onError: (error) => {
      if (error.message.includes("column reference \"name\" is ambiguous")) {
        setSearchErrorMessage("Search is temporarily unavailable. Please try again later.");
      } else {
        setSearchErrorMessage(`Error searching dogs: ${error.message}`);
      }
    }
  });

  // Update availableDogs whenever dogsData changes
  useEffect(() => {
    if (dogsData?.dogs?.items) {
      setAvailableDogs(dogsData.dogs.items);
      setSearchErrorMessage(null); // Clear error when we get successful data
    }
  }, [dogsData]);

  // Use Apollo Client to fetch the pedigree data when a dog is selected
  const { data: pedigreeData, loading: pedigreeLoading, error: pedigreeError, refetch: refetchPedigree } = useQuery<{ dogPedigree: DogNode }>(GET_DOG_PEDIGREE, {
    variables: {
      dogId: selectedDogId,
      generations: 4 // Always fetch 4 generations for maximum data
    },
    skip: !selectedDogId,
  });

  // Handle dog selection
  const handleDogSelection = (dogId: string) => {
    setSelectedDogId(dogId);
    setEditingParentsForDog(null); // Close any open parent editor
  };

  // Handle parent editing
  const handleEditParents = (dogId: string) => {
    // Find the dog in the pedigree data
    if (!pedigreeData?.dogPedigree) return;
    
    // If root dog
    if (dogId === pedigreeData.dogPedigree?.id) {
      setEditingParentsForDog({
        id: dogId,
        name: pedigreeData.dogPedigree.name,
        sire: pedigreeData.dogPedigree.sire,
        dam: pedigreeData.dogPedigree.dam
      });
      return;
    }
    
    // If sire
    if (dogId === pedigreeData.dogPedigree.sire?.id) {
      setEditingParentsForDog({
        id: dogId,
        name: pedigreeData.dogPedigree.sire.name,
        sire: pedigreeData.dogPedigree.sire.sire,
        dam: pedigreeData.dogPedigree.sire.dam
      });
      return;
    }
    
    // If dam
    if (dogId === pedigreeData.dogPedigree.dam?.id) {
      setEditingParentsForDog({
        id: dogId,
        name: pedigreeData.dogPedigree.dam.name,
        sire: pedigreeData.dogPedigree.dam.sire,
        dam: pedigreeData.dogPedigree.dam.dam
      });
      return;
    }
    
    // If a grandparent
    const grandparents = [
      { id: pedigreeData.dogPedigree.sire?.sire?.id, 
        name: pedigreeData.dogPedigree.sire?.sire?.name || "", 
        parentSire: pedigreeData.dogPedigree.sire?.sire?.sire,
        parentDam: pedigreeData.dogPedigree.sire?.sire?.dam
      },
      { id: pedigreeData.dogPedigree.sire?.dam?.id, 
        name: pedigreeData.dogPedigree.sire?.dam?.name || "",
        parentSire: pedigreeData.dogPedigree.sire?.dam?.sire,
        parentDam: pedigreeData.dogPedigree.sire?.dam?.dam
      },
      { id: pedigreeData.dogPedigree.dam?.sire?.id, 
        name: pedigreeData.dogPedigree.dam?.sire?.name || "",
        parentSire: pedigreeData.dogPedigree.dam?.sire?.sire,
        parentDam: pedigreeData.dogPedigree.dam?.sire?.dam
      },
      { id: pedigreeData.dogPedigree.dam?.dam?.id, 
        name: pedigreeData.dogPedigree.dam?.dam?.name || "",
        parentSire: pedigreeData.dogPedigree.dam?.dam?.sire,
        parentDam: pedigreeData.dogPedigree.dam?.dam?.dam
      }
    ];
    
    const grandparent = grandparents.find(gp => gp?.id === dogId);
    if (grandparent) {
      setEditingParentsForDog({
        id: dogId,
        name: grandparent.name,
        sire: grandparent.parentSire,
        dam: grandparent.parentDam
      });
    }
  };

  // Function to handle adding parents
  const handleAddParents = (dogId: string) => {
    // Find the name of the dog
    let dogName = '';
    
    if (pedigreeData && pedigreeData.dogPedigree) {
      // Check if it's the root dog
      if (pedigreeData.dogPedigree?.id === dogId) {
        dogName = pedigreeData.dogPedigree.name;
      } 
      // Check if it's sire or dam
      else if (pedigreeData.dogPedigree.sire?.id === dogId) {
        dogName = pedigreeData.dogPedigree.sire.name;
      }
      else if (pedigreeData.dogPedigree.dam?.id === dogId) {
        dogName = pedigreeData.dogPedigree.dam.name;
      }
      // Check if it's grandparents
      else if (pedigreeData.dogPedigree.sire?.sire?.id === dogId) {
        dogName = pedigreeData.dogPedigree.sire.sire.name;
      }
      else if (pedigreeData.dogPedigree.sire?.dam?.id === dogId) {
        dogName = pedigreeData.dogPedigree.sire.dam.name;
      }
      else if (pedigreeData.dogPedigree.dam?.sire?.id === dogId) {
        dogName = pedigreeData.dogPedigree.dam.sire.name;
      }
      else if (pedigreeData.dogPedigree.dam?.dam?.id === dogId) {
        dogName = pedigreeData.dogPedigree.dam.dam.name;
      }
    }
    
    // Set the editing state to add parents
    setParentEditorMode('add');
    setEditingParentsForDog({
      id: dogId,
      name: dogName || 'Unknown Dog',
      sire: null,
      dam: null
    });
  };

  // Find the current parents for a dog anywhere in the pedigree tree
  const findParentsForDog = (dogId: string) => {
    if (!pedigreeData) return { sire: null, dam: null };
    
    // Handle great-grandparents explicitly since they might not be fully included in the tree
    const greatGrandparents = [
      // Paternal branch - paternal grandsire's parents
      { id: pedigreeData.dogPedigree.sire?.sire?.sire?.id, node: pedigreeData.dogPedigree.sire?.sire?.sire },
      { id: pedigreeData.dogPedigree.sire?.sire?.dam?.id, node: pedigreeData.dogPedigree.sire?.sire?.dam },
      
      // Paternal branch - paternal granddam's parents
      { id: pedigreeData.dogPedigree.sire?.dam?.sire?.id, node: pedigreeData.dogPedigree.sire?.dam?.sire },
      { id: pedigreeData.dogPedigree.sire?.dam?.dam?.id, node: pedigreeData.dogPedigree.sire?.dam?.dam },
      
      // Maternal branch - maternal grandsire's parents
      { id: pedigreeData.dogPedigree.dam?.sire?.sire?.id, node: pedigreeData.dogPedigree.dam?.sire?.sire },
      { id: pedigreeData.dogPedigree.dam?.sire?.dam?.id, node: pedigreeData.dogPedigree.dam?.sire?.dam },
      
      // Maternal branch - maternal granddam's parents
      { id: pedigreeData.dogPedigree.dam?.dam?.sire?.id, node: pedigreeData.dogPedigree.dam?.dam?.sire },
      { id: pedigreeData.dogPedigree.dam?.dam?.dam?.id, node: pedigreeData.dogPedigree.dam?.dam?.dam },
    ];
    
    // Check if this is a great-grandparent first
    const greatGrandparent = greatGrandparents.find(gp => gp.id === dogId);
    if (greatGrandparent && greatGrandparent.node) {
      return { 
        sire: greatGrandparent.node.sire || null, 
        dam: greatGrandparent.node.dam || null 
      };
    }
    
    // Otherwise traverse the tree recursively
    const findInTree = (node: any): { sire: any, dam: any } | null => {
      if (!node) return null;
      
      if (node?.id === dogId) {
        return { 
          sire: node.sire || null, 
          dam: node.dam || null 
        };
      }
      
      // Check children
      if (node.sire) {
        const result = findInTree(node.sire);
        if (result) return result;
      }
      
      if (node.dam) {
        const result = findInTree(node.dam);
        if (result) return result;
      }
      
      return null;
    };
    
    return findInTree(pedigreeData.dogPedigree) || { sire: null, dam: null };
  };
  
  // Log when editing a dog in the pedigree
  const handleEditDogInPedigree = (dog: any) => {
    console.log('Editing parents for dog in pedigree:', dog);
    const { sire, dam } = findParentsForDog(dog.id);
    setEditingParentsForDog({
      id: dog.id,
      name: dog.name,
      sire, 
      dam
    });
    setParentEditorMode('edit');
  };

  const { sire: currentSire, dam: currentDam } = selectedDogId 
    ? findParentsForDog(selectedDogId) 
    : { sire: null, dam: null };

  // Function to render a list of sample dogs when search is unavailable
  const renderSampleDogs = () => {
    const sampleDogs = [
      { id: "sample1", name: "Max", breed: "German Shepherd", registrationNumber: "GS123456" },
      { id: "sample2", name: "Bella", breed: "Labrador Retriever", registrationNumber: "LR654321" },
      { id: "sample3", name: "Rocky", breed: "Rottweiler", registrationNumber: "RW789012" },
      { id: "sample4", name: "Luna", breed: "Golden Retriever", registrationNumber: "GR345678" },
      { id: "sample5", name: "Duke", breed: "Bulldog", registrationNumber: "BD901234" }
    ];
    
    return (
      <>
        <div className="text-amber-700 text-sm mb-2 bg-amber-50 p-2 rounded border border-amber-200">
          <p>Search is temporarily unavailable. Using sample dogs instead.</p>
        </div>
        <select
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          value={selectedDogId || ''}
          onChange={(e) => handleDogSelection(e.target.value)}
        >
          <option value="">Select a sample dog to view pedigree</option>
          {sampleDogs.map(dog => (
            <option key={dog?.id} value={dog?.id}>
              {dog?.name} - {dog?.breed} ({dog?.registrationNumber})
            </option>
          ))}
        </select>
      </>
    );
  };

  // Function to handle exporting pedigree as PDF
  const handleExportPedigreePDF = async () => {
    if (!pedigreeData || !pedigreeData.dogPedigree) {
      toast.error('No pedigree data available for export');
      return;
    }
    
    try {
      const dog = pedigreeData.dogPedigree;
      
      // Extract fourth generation
      // The extractFourthGeneration function returns an object with all 4th generation dogs
      const fourthGeneration = extractFourthGeneration(dog);
      
      // Toast notification
      toast.loading('Generating pedigree certificate...');
      
      // Format dates according to the standard in the example (DD/MM/YYYY)
      const formatDateForCertificate = (dateString: string | Date | null | undefined): string => {
        if (!dateString) return 'Unknown';
        
        // If it's already a Date object
        if (dateString instanceof Date) {
          return `${dateString.getDate().toString().padStart(2, '0')}/${(dateString.getMonth() + 1).toString().padStart(2, '0')}/${dateString.getFullYear()}`;
        }
        
        try {
          const date = new Date(dateString);
          // Format as DD/MM/YYYY
          return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        } catch (error) {
          return typeof dateString === 'string' ? dateString : 'Invalid date';
        }
      };
      
      // Generate certificate
      await downloadPedigreeCertificate({
        // Pass the complete dog object with all its hierarchy
        dog: dog,
        
        // Additional details
        breederName: dog?.breeder?.name || 'Unknown',
        
        // Certificate details
        certificateDate: formatDateForCertificate(new Date().toISOString()),
        
        // Style options
        primaryColor: '#0066b3', // Blue color from the FCI certificate
        secondaryColor: '#e6f2ff', // Light blue background
        fontFamily: 'Arial, sans-serif'
      });
      
      // Success notification
      toast.dismiss();
      toast.success('Pedigree certificate generated successfully!');
    } catch (error) {
      console.error('Error generating pedigree certificate:', error);
      toast.dismiss();
      toast.error('Failed to generate pedigree certificate. Please try again.');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'OWNER', 'BREEDER', 'HANDLER']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-700 to-green-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold">Pedigree Records</h1>
            <p className="mt-2 text-green-100">Explore and manage dog lineage and ancestry information</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search and Selection Column */}
              <div className="md:col-span-1">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Find a Dog</h2>
                
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search dogs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={!!searchErrorMessage && searchErrorMessage.includes("temporarily unavailable")}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {dogsLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Dog selection dropdown */}
                <div className="mb-6">
                  {searchErrorMessage && searchErrorMessage.includes("temporarily unavailable") ? (
                    renderSampleDogs()
                  ) : searchErrorMessage ? (
                    <div className="text-sm text-red-600 mb-1">{searchErrorMessage}</div>
                  ) : dogsError ? (
                    <div className="text-sm text-red-600 mb-1">Error loading dogs: {dogsError.message}</div>
                  ) : (
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={selectedDogId || ''}
                      onChange={(e) => handleDogSelection(e.target.value)}
                      disabled={dogsLoading}
                    >
                      <option value="">Select a dog to view pedigree</option>
                      {availableDogs.map(dog => (
                        <option key={dog?.id} value={dog?.id}>
                          {dog?.name} {dog?.registrationNumber ? `(${dog?.registrationNumber})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  {dogsData?.dogs?.totalCount === 0 && searchQuery && !searchErrorMessage && (
                    <div className="text-sm text-gray-600 mt-1">No dogs found matching "{searchQuery}"</div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="space-y-3">
                  <Link 
                    href="/pedigrees/create"
                    className="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Register New Pedigree
                  </Link>
                  
                  <Link 
                    href="/dogs/new"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-green-600 text-green-600 hover:bg-green-50 rounded-md transition"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Dog
                  </Link>
                </div>
              </div>
              
              {/* Pedigree Display Column */}
              <div className="md:col-span-2">
                {!selectedDogId ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Select a Dog</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose a dog from the dropdown to view and manage its pedigree
                    </p>
                  </div>
                ) : pedigreeLoading ? (
                  <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : pedigreeError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <p>Error loading pedigree: {pedigreeError.message}</p>
                  </div>
                ) : pedigreeData?.dogPedigree ? (
                  <div className="space-y-6">
                    {/* Dog Overview */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{pedigreeData.dogPedigree.name}</h2>
                          <p className="text-gray-600">{pedigreeData.dogPedigree.registrationNumber || 'No Registration'}</p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Link 
                            href={`/dogs/${pedigreeData.dogPedigree?.id}`}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <span>View Profile</span>
                            <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Image */}
                        <div className="md:col-span-1">
                          {pedigreeData.dogPedigree.mainImageUrl ? (
                            <img 
                              src={pedigreeData.dogPedigree.mainImageUrl} 
                              alt={pedigreeData.dogPedigree.name}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Details */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Breed</h3>
                            <p className="mt-1 text-sm text-gray-900 capitalize">
                              {pedigreeData.dogPedigree.breed ? pedigreeData.dogPedigree.breed.replace('-', ' ') : 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                            <p className="mt-1 text-sm text-gray-900 capitalize">
                              {pedigreeData.dogPedigree.gender || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                            <p className="mt-1 text-sm text-gray-900">
                              {formatDate(pedigreeData.dogPedigree.dateOfBirth)}
                            </p>
                          </div>
                          {pedigreeData.dogPedigree.color && (
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Color</h3>
                              <p className="mt-1 text-sm text-gray-900 capitalize">
                                {pedigreeData.dogPedigree.color}
                              </p>
                            </div>
                          )}
                          {pedigreeData.dogPedigree.coefficient !== undefined && (
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Inbreeding Coefficient</h3>
                              <p className="mt-1 text-sm text-gray-900">
                                {(pedigreeData.dogPedigree.coefficient * 100).toFixed(2)}%
                              </p>
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Pedigree Completeness</h3>
                            <div className="mt-1 flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${calculatePedigreeCompleteness(pedigreeData.dogPedigree, 4)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {calculatePedigreeCompleteness(pedigreeData.dogPedigree, 4)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pedigree Controls */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <label htmlFor="generations" className="text-sm font-medium text-gray-700">
                            Generations:
                          </label>
                          <select
                            id="generations"
                            value={generationsToShow}
                            onChange={(e) => setGenerationsToShow(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                          </select>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditParents(pedigreeData.dogPedigree?.id || '')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Parents
                          </button>
                          <button
                            onClick={() => handleAddParents(pedigreeData.dogPedigree?.id || '')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Parents
                          </button>
                          <button
                            onClick={handleExportPedigreePDF}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Certificate
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pedigree Chart */}
                    <PedigreeChart
                      dogId={pedigreeData.dogPedigree?.id || ''}
                      generations={generationsToShow}
                      orientation="horizontal"
                      userRole={user?.role || ''}
                      userId={user?.id || ''}
                      onEditParents={(dog) => {
                        // Find the current parents for this dog
                        const { sire, dam } = findParentsForDog(dog.id);
                        // Set the editing state
                        setEditingParentsForDog({
                          id: dog.id,
                          name: dog.name,
                          sire, 
                          dam
                        });
                        setParentEditorMode('edit');
                        toast.success(`Editing parents for ${dog.name}`);
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                    <p>No pedigree data available for the selected dog.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Parent Editor Modal */}
        {editingParentsForDog && (
          <ParentEditor
            dogId={editingParentsForDog?.id}
            dogName={editingParentsForDog.name}
            currentSire={editingParentsForDog.sire}
            currentDam={editingParentsForDog.dam}
            onClose={() => setEditingParentsForDog(null)}
            onSuccess={() => {
              setEditingParentsForDog(null);
              refetchPedigree();
            }}
            isOpen={!!editingParentsForDog}
            mode={parentEditorMode}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
