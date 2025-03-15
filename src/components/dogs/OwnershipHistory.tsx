'use client';

import { format } from 'date-fns';

// Define interfaces with correct field names
interface Owner {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface Ownership {
  id: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean; // Correct field name (not 'is_active')
  owner: Owner;
}

interface OwnershipHistoryProps {
  ownerships: Ownership[];
}

const OwnershipHistory: React.FC<OwnershipHistoryProps> = ({ ownerships }) => {
  // Format date safely
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Present';
    
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error("Invalid date format:", error);
      return dateString;
    }
  };

  if (ownerships.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ownership History</h2>
        <p className="text-gray-500">No ownership records available.</p>
      </div>
    );
  }

  // Sort ownerships by startDate (most recent first)
  const sortedOwnerships = [...ownerships].sort((a, b) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Ownership History</h2>
      
      <div className="space-y-4">
        {sortedOwnerships.map((ownership) => (
          <div 
            key={ownership.id}
            className={`p-4 rounded-lg border ${ownership.isCurrent ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 className="font-medium text-lg">{ownership.owner.name}</h3>
                {ownership.owner.contactEmail && (
                  <p className="text-sm text-gray-600">{ownership.owner.contactEmail}</p>
                )}
                {ownership.owner.contactPhone && (
                  <p className="text-sm text-gray-600">{ownership.owner.contactPhone}</p>
                )}
              </div>
              <div className="mt-2 md:mt-0 flex items-center">
                <span className="text-gray-600 text-sm">
                  {formatDate(ownership.startDate)} - {formatDate(ownership.endDate)}
                </span>
                {ownership.isCurrent && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Current
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnershipHistory;
