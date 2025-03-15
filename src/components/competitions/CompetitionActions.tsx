import React from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface CompetitionActionsProps {
  competitionId: number;
  userRole: string;
}

const CompetitionActions: React.FC<CompetitionActionsProps> = ({ competitionId, userRole }) => {
  const router = useRouter();
  
  // Only show actions for admin or owner roles
  if (userRole !== 'admin' && userRole !== 'owner') {
    return null;
  }
  
  const handleDelete = () => {
    // In a real app, this would call an API to delete the competition
    toast.success("Competition deleted successfully");
    router.push('/competitions');
  };
  
  return (
    <div className="mt-8 flex justify-end space-x-4">
      <button 
        onClick={() => router.push(`/manage/competitions/edit/${competitionId}`)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Edit Competition
      </button>
      {userRole === 'admin' && (
        <button 
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Delete Competition
        </button>
      )}
    </div>
  );
};

export default CompetitionActions;
