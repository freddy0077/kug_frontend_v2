'use client';

import { format } from 'date-fns';

// Define the proper interfaces using the corrected field names
interface HealthRecord {
  id: string;
  date: string;
  description: string; // Correct field name (not 'diagnosis')
  vetName?: string;
  results?: string; // Correct field name (not 'test_results')
  attachments?: string[];
}

interface HealthRecordsProps {
  records: HealthRecord[];
}

const HealthRecords: React.FC<HealthRecordsProps> = ({ records }) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      console.error("Invalid date format:", error);
      return dateString;
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Records</h2>
        <p className="text-gray-500">No health records available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Health Records</h2>
      
      <div className="space-y-6">
        {records.map((record) => (
          <div key={record.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
              <h3 className="font-medium text-lg">{record.description}</h3>
              <div className="flex items-center mt-2 md:mt-0">
                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600 text-sm">{formatDate(record.date)}</span>
              </div>
            </div>
            
            {record.vetName && (
              <div className="mb-2">
                <span className="text-gray-600 font-medium">Veterinarian:</span> {record.vetName}
              </div>
            )}
            
            {record.results && (
              <div className="mb-2">
                <span className="text-gray-600 font-medium">Results:</span> {record.results}
              </div>
            )}
            
            {record.attachments && record.attachments.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-600 font-medium">Attachments:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {record.attachments.map((attachment, index) => (
                    <a 
                      key={index} 
                      href={attachment} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Document {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthRecords;
