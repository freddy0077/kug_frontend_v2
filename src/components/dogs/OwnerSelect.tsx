'use client';

import { useQuery } from '@apollo/client';
import { GET_OWNERS } from '@/graphql/queries/ownerQueries';

interface OwnerSelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}

export default function OwnerSelect({ value, onChange, error, required = false }: OwnerSelectProps) {
  // Fetch owners list
  const { data, loading } = useQuery(GET_OWNERS, {
    variables: { limit: 100 }
  });

  return (
    <div>
      <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-1">
        Owner {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id="ownerId"
        name="ownerId"
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md shadow-sm ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-green-500 focus:ring-green-500'}`}
      >
        <option value="">Select Owner</option>
        {loading ? (
          <option value="" disabled>Loading owners...</option>
        ) : (
          data?.owners?.items?.map((owner: any) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))
        )}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
