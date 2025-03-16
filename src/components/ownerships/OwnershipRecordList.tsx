'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// Interface using is_current instead of is_active as per memory
export interface OwnershipRecord {
  id: number;
  dogId: number;
  dogName: string;
  previousOwnerName: string;
  previousOwnerEmail: string;
  newOwnerName: string;
  newOwnerEmail: string;
  transferDate: Date;
  reason: string;
  is_current: boolean; // Correct field name per memory
  registrationNumber: string;
}

interface OwnershipRecordListProps {
  records: OwnershipRecord[];
}

export const OwnershipRecordList: React.FC<OwnershipRecordListProps> = ({ records }) => {
  const { user } = useAuth();
  
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm text-center">
        <p className="text-gray-500">No ownership records found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dog</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(record.transferDate), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{record.dogName}</div>
                  <div className="text-xs text-gray-500">ID: {record.dogId}</div>
                  <div className="text-xs text-gray-500">Reg: {record.registrationNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{record.previousOwnerName}</div>
                  <div className="text-xs text-gray-500">{record.previousOwnerEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{record.newOwnerName}</div>
                  <div className="text-xs text-gray-500">{record.newOwnerEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    record.is_current ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {record.is_current ? 'Current' : 'Previous'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/ownerships/${record.id}`} className="text-green-600 hover:text-green-900 mr-4">
                    View
                  </Link>
                  {/* Show edit/delete only for users with right permissions */}
                  {user && ['ADMIN', 'OWNER', 'HANDLER', 'CLUB'].some(role => 
                    role.toUpperCase() === user.role.toUpperCase()
                  ) && (
                    <>
                      <Link href={`/ownerships/${record.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                        Edit
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnershipRecordList;
