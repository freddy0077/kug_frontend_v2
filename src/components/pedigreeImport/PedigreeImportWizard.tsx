'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PEDIGREE_IMPORT, IMPORT_PEDIGREE } from '@/graphql/mutations/pedigreeImportMutations';
import { GET_PEDIGREE_IMPORT } from '@/graphql/queries/pedigreeImportQueries';
import { PedigreeImport, PedigreeExtractedDog } from '@/types/pedigreeImport';
import { PedigreeImportStatus } from '@/graphql/queries/pedigreeImportQueries';
import { UserRole } from '@/utils/permissionUtils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UploadStep from '@/components/pedigreeImport/steps/UploadStep';
import ExtractionStep from '@/components/pedigreeImport/steps/ExtractionStep';
import ValidationStep from '@/components/pedigreeImport/steps/ValidationStep';
import ImportStep from '@/components/pedigreeImport/steps/ImportStep';
import CompletionStep from '@/components/pedigreeImport/steps/CompletionStep';
import StepIndicator from '@/components/pedigreeImport/StepIndicator';
import { formatDate } from '@/utils/formatters';

interface PedigreeImportWizardProps {
  importId?: string; // If provided, will load an existing import
}

const PedigreeImportWizard: React.FC<PedigreeImportWizardProps> = ({ importId }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [importData, setImportData] = useState<PedigreeImport | null>(null);
  const [selectedDogs, setSelectedDogs] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  
  // When editing an existing import
  const { loading: importLoading, error: importError, data: importResponse, refetch } = useQuery(
    GET_PEDIGREE_IMPORT,
    {
      variables: { id: importId },
      skip: !importId,
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        if (data?.pedigreeImport) {
          setImportData(data.pedigreeImport);
          
          // Set initial selection state based on dogs' selectedForImport flag
          if (data.pedigreeImport.extractedDogs) {
            const initialSelection: Record<string, boolean> = {};
            data.pedigreeImport.extractedDogs.forEach((dog: PedigreeExtractedDog) => {
              initialSelection[dog.id] = dog.selectedForImport;
            });
            setSelectedDogs(initialSelection);
          }
          
          // Set the current step based on the import status
          if (data.pedigreeImport.status === PedigreeImportStatus.UPLOADED) {
            setCurrentStep(0);
          } else if (data.pedigreeImport.status === PedigreeImportStatus.PROCESSING) {
            setCurrentStep(1);
          } else if (data.pedigreeImport.status === PedigreeImportStatus.EXTRACTION_COMPLETE) {
            setCurrentStep(2);
          } else if (data.pedigreeImport.status === PedigreeImportStatus.VALIDATION_COMPLETE) {
            setCurrentStep(3);
          } else if (data.pedigreeImport.status === PedigreeImportStatus.IMPORT_COMPLETE) {
            setCurrentStep(4);
          }
        }
      }
    }
  );
  
  // Create a new pedigree import
  const [createPedigreeImport, { loading: createLoading }] = useMutation(CREATE_PEDIGREE_IMPORT, {
    onCompleted: (data) => {
      const importId = data.createPedigreeImport.id;
      setImportData(data.createPedigreeImport);
      router.push(`/pedigrees/import/${importId}`);
      setCurrentStep(1); // Move to extraction step after upload
    },
    onError: (error) => {
      setError(`Error uploading file: ${error.message}`);
    }
  });
  
  // Run the import process for selected dogs
  const [importPedigree, { loading: pedigreeImportLoading }] = useMutation(IMPORT_PEDIGREE, {
    onCompleted: (data) => {
      if (data.importPedigree.success) {
        refetch(); // Refresh import data
        setCurrentStep(4); // Move to completion step
      } else {
        setError(`Import failed: ${data.importPedigree.message}`);
      }
    },
    onError: (error) => {
      setError(`Error importing pedigree: ${error.message}`);
    }
  });
  
  // Poll for updates if the import is in a processing state
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    
    if (importId && 
        importData?.status === PedigreeImportStatus.PROCESSING) {
      pollingInterval = setInterval(() => {
        refetch();
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [importId, importData?.status, refetch]);
  
  // Handle file upload
  const handleFileUpload = (file: File) => {
    createPedigreeImport({
      variables: { file }
    });
  };
  
  // Handle step navigation
  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle dog selection
  const toggleDogSelection = (dogId: string, selected: boolean) => {
    setSelectedDogs(prev => ({
      ...prev,
      [dogId]: selected
    }));
  };
  
  // Handle final import submission
  const handleImport = () => {
    if (importData) {
      importPedigree({
        variables: { pedigreeImportId: importData.id }
      });
    }
  };
  
  // Show loading state
  if (importLoading && !importData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  // Show error
  if (importError) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">Error loading pedigree import: {importError.message}</p>
      </div>
    );
  }

  // Define the steps of the wizard
  const steps = [
    { name: 'Upload', description: 'Upload pedigree PDF' },
    { name: 'Extraction', description: 'Extract dog information' },
    { name: 'Validation', description: 'Review and edit extracted data' },
    { name: 'Import', description: 'Select dogs to import' },
    { name: 'Complete', description: 'Import completed' }
  ];
  
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]} fallbackPath="/auth/login">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Pedigree Import Wizard
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Register multiple dogs from a pedigree certificate
          </p>
        </div>
        
        {error && (
          <div className="mx-4 my-2 bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
            <button 
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        <StepIndicator steps={steps} currentStep={currentStep} />
        
        <div className="p-4">
          {currentStep === 0 && (
            <UploadStep 
              onUpload={handleFileUpload} 
              loading={createLoading} 
              importData={importData}
            />
          )}
          
          {currentStep === 1 && (
            <ExtractionStep 
              importData={importData} 
              onNextStep={goToNextStep}
              onRefresh={() => refetch()}
            />
          )}
          
          {currentStep === 2 && (
            <ValidationStep 
              importData={importData} 
              selectedDogs={selectedDogs}
              onToggleSelection={toggleDogSelection}
              onNextStep={goToNextStep}
              onPreviousStep={goToPreviousStep}
              onRefresh={() => refetch()}
            />
          )}
          
          {currentStep === 3 && (
            <ImportStep 
              importData={importData}
              selectedDogs={selectedDogs}
              onImport={handleImport}
              onPreviousStep={goToPreviousStep}
              loading={pedigreeImportLoading}
            />
          )}
          
          {currentStep === 4 && (
            <CompletionStep importData={importData} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PedigreeImportWizard;
