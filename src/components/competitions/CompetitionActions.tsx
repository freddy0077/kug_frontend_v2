import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserRole } from '@/types/enums';
import { useDeleteCompetitionResult } from '@/hooks/useCompetitions';

interface CompetitionActionsProps {
  competitionId: string;
  userRole: UserRole;
}

const CompetitionActions: React.FC<CompetitionActionsProps> = ({ competitionId, userRole }) => {
  const router = useRouter();
  const { remove, loading } = useDeleteCompetitionResult();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Only show actions for admin or owner roles
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.OWNER) {
    return null;
  }
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this competition record? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        const result = await remove(competitionId);
        if (result.success) {
          toast.success('Competition deleted successfully');
          router.push('/competitions');
        } else {
          toast.error(`Failed to delete: ${result.message}`);
        }
      } catch (error) {
        toast.error(`An error occurred: ${(error as Error).message}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className="mt-8 flex justify-end space-x-4">
      <button 
        onClick={() => router.push(`/competitions/${competitionId}/edit`)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        disabled={isDeleting}
      >
        Edit Competition
      </button>
      {userRole === UserRole.ADMIN && (
        <button 
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
          disabled={isDeleting || loading}
        >
          {isDeleting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </span>
          ) : (
            'Delete Competition'
          )}
        </button>
      )}
    </div>
  );
};

export default CompetitionActions;
