'use client';

import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// Simple direct query for testing
const TEST_QUERY = gql`
  query TestQuery {
    # Dogs
    dogs(limit: 0) {
      totalCount
    }
    # Breeds
    breeds(limit: 0) {
      totalCount
    }
  }
`;

export default function TestDashboard() {
  // Direct query without authentication skip
  const { data, loading, error } = useQuery(TEST_QUERY);
  
  console.log('Test Query Results:');
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Data:', data);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Test</h1>
      
      <div className="mb-4">
        <h2 className="text-xl mb-2">Loading: {loading ? 'True' : 'False'}</h2>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
          <h2 className="font-bold">Error:</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Data:</h2>
        <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
